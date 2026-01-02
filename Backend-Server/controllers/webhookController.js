const crypto = require('crypto');
const { ECSClient, RunTaskCommand } = require('@aws-sdk/client-ecs');
const config = require('../config');
const Project = require('../models/Project');

const ecsClient = new ECSClient({ region: config.AWS_REGION });

/**
 * Extract owner and repo from git URL
 */
function parseGitUrl(gitUrl) {
    // Support formats:
    // https://github.com/owner/repo.git
    // https://github.com/owner/repo
    // git@github.com:owner/repo.git
    // https://gitlab.com/owner/repo.git
    const patterns = [
        /github\.com[\/:]([^\/]+)\/([^\/\.]+)(\.git)?$/,
        /gitlab\.com[\/:]([^\/]+)\/([^\/\.]+)(\.git)?$/,
    ];

    for (const pattern of patterns) {
        const match = gitUrl.match(pattern);
        if (match) {
            return {
                owner: match[1],
                repo: match[2],
                platform: gitUrl.includes('gitlab') ? 'gitlab' : 'github'
            };
        }
    }

    return null;
}

/**
 * Create GitHub webhook automatically
 */
async function createGitHubWebhook(owner, repo, webhookUrl, secret, accessToken) {
    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/hooks`, {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                config: {
                    url: webhookUrl,
                    content_type: 'json',
                    secret: secret,
                    insecure_ssl: '0'
                },
                events: ['push'],
                active: true
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create webhook');
        }

        const webhook = await response.json();
        return { success: true, webhookId: webhook.id.toString() };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Create GitLab webhook automatically
 */
async function createGitLabWebhook(owner, repo, webhookUrl, token, accessToken) {
    try {
        // URL encode the project path
        const projectPath = encodeURIComponent(`${owner}/${repo}`);

        const response = await fetch(`https://gitlab.com/api/v4/projects/${projectPath}/hooks`, {
            method: 'POST',
            headers: {
                'PRIVATE-TOKEN': accessToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: webhookUrl,
                token: token,
                push_events: true,
                enable_ssl_verification: true
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create webhook');
        }

        const webhook = await response.json();
        return { success: true, webhookId: webhook.id.toString() };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Verify GitHub webhook signature
 */
function verifyGitHubSignature(payload, signature, secret) {
    if (!signature || !secret) return false;

    const hmac = crypto.createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');

    try {
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
    } catch (e) {
        return false;
    }
}

/**
 * Verify GitLab webhook token
 */
function verifyGitLabToken(token, secret) {
    if (!token || !secret) return false;
    return token === secret;
}

/**
 * Trigger a redeploy for a project
 */
async function triggerRedeploy(project, commitHash) {
    const params = {
        cluster: config.CLUSTER,
        taskDefinition: config.TASK,
        launchType: 'FARGATE',
        count: 1,
        networkConfiguration: {
            awsvpcConfiguration: {
                assignPublicIp: 'ENABLED',
                subnets: config.AWS_SUBNETS,
                securityGroups: config.AWS_SECURITY_GROUPS,
            },
        },
        overrides: {
            containerOverrides: [
                {
                    name: 'builderimage',
                    environment: [
                        { name: 'PROJECT_ID', value: project.projectId },
                        { name: 'GIT_REPOSITORY__URL', value: project.gitRepositoryUrl },
                        { name: 'S3_BUCKET', value: config.S3_BUCKET },
                        { name: 'INSTALL_CMD', value: project.buildConfig?.installCmd || 'npm install' },
                        { name: 'BUILD_CMD', value: project.buildConfig?.buildCmd || 'npm run build' },
                        ...(project.buildConfig?.buildRoot ? [{ name: 'BUILD_ROOT', value: project.buildConfig.buildRoot }] : []),
                    ],
                },
            ],
        },
        startedBy: project.projectId,
    };

    // Update project status
    await Project.findOneAndUpdate(
        { projectId: project.projectId },
        {
            status: 'running',
            lastCommitHash: commitHash,
        }
    );

    const command = new RunTaskCommand(params);
    const result = await ecsClient.send(command);
    const taskArn = result.tasks && result.tasks[0] && result.tasks[0].taskArn;

    return { taskArn, result };
}

/**
 * Handle GitHub webhook push event
 * POST /api/webhook/github/:projectId
 */
async function handleGitHubWebhook(req, res) {
    const { projectId } = req.params;
    const signature = req.headers['x-hub-signature-256'];
    const event = req.headers['x-github-event'];

    try {
        // Find project
        const project = await Project.findOne({ projectId });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Check if auto-redeploy is enabled
        if (!project.autoRedeploy) {
            return res.status(400).json({ error: 'Auto-redeploy not enabled for this project' });
        }

        // Verify signature
        const payload = JSON.stringify(req.body);
        if (!verifyGitHubSignature(payload, signature, project.webhookSecret)) {
            return res.status(401).json({ error: 'Invalid signature' });
        }

        // Only handle push events
        if (event !== 'push') {
            return res.json({ message: 'Event ignored', event });
        }

        // Check if it's a valid push event
        if (!req.body.commits || req.body.commits.length === 0) {
            return res.json({ message: 'No commits in push event' });
        }

        // Get the latest commit hash
        const commitHash = req.body.after || req.body.head_commit?.id;

        // Skip if same commit
        if (commitHash === project.lastCommitHash) {
            return res.json({ message: 'Same commit, skipping redeploy' });
        }

        console.log(`GitHub webhook: Triggering redeploy for project ${projectId}, commit ${commitHash}`);

        // Trigger redeploy
        const deployment = await triggerRedeploy(project, commitHash);

        return res.json({
            message: 'Redeploy triggered successfully',
            projectId,
            commitHash,
            taskArn: deployment.taskArn,
            deployUrl: project.deployUrl,
        });

    } catch (error) {
        console.error('GitHub webhook error:', error);
        return res.status(500).json({
            error: 'Failed to process webhook',
            message: error?.message ?? String(error)
        });
    }
}

/**
 * Handle GitLab webhook push event
 * POST /api/webhook/gitlab/:projectId
 */
async function handleGitLabWebhook(req, res) {
    const { projectId } = req.params;
    const token = req.headers['x-gitlab-token'];
    const event = req.headers['x-gitlab-event'];

    try {
        // Find project
        const project = await Project.findOne({ projectId });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Check if auto-redeploy is enabled
        if (!project.autoRedeploy) {
            return res.status(400).json({ error: 'Auto-redeploy not enabled for this project' });
        }

        // Verify token
        if (!verifyGitLabToken(token, project.webhookSecret)) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Only handle push events
        if (event !== 'Push Hook') {
            return res.json({ message: 'Event ignored', event });
        }

        // Check if it's a valid push event
        if (!req.body.commits || req.body.commits.length === 0) {
            return res.json({ message: 'No commits in push event' });
        }

        // Get the latest commit hash
        const commitHash = req.body.after || req.body.checkout_sha;

        // Skip if same commit
        if (commitHash === project.lastCommitHash) {
            return res.json({ message: 'Same commit, skipping redeploy' });
        }

        console.log(`GitLab webhook: Triggering redeploy for project ${projectId}, commit ${commitHash}`);

        // Trigger redeploy
        const deployment = await triggerRedeploy(project, commitHash);

        return res.json({
            message: 'Redeploy triggered successfully',
            projectId,
            commitHash,
            taskArn: deployment.taskArn,
            deployUrl: project.deployUrl,
        });

    } catch (error) {
        console.error('GitLab webhook error:', error);
        return res.status(500).json({
            error: 'Failed to process webhook',
            message: error?.message ?? String(error)
        });
    }
}

/**
 * Enable auto-redeploy for a project
 * POST /api/webhook/enable/:projectId
 * Body (optional): { accessToken: 'github_pat_xxx' or 'glpat-xxx' }
 */
async function enableAutoRedeploy(req, res) {
    const { projectId } = req.params;
    const { accessToken } = req.body || {};

    try {
        const project = await Project.findOne({ projectId });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Generate webhook secret if not exists
        let webhookSecret = project.webhookSecret;
        if (!webhookSecret) {
            webhookSecret = crypto.randomBytes(32).toString('hex');
        }

        // Parse git repository URL
        const gitInfo = parseGitUrl(project.gitRepositoryUrl);

        // Webhook URLs
        const webhookUrls = {
            github: `${config.API_URL}/api/webhook/github/${projectId}`,
            gitlab: `${config.API_URL}/api/webhook/gitlab/${projectId}`,
        };

        let webhookResult = null;
        let webhookId = project.webhookId;

        // Automatically create webhook if access token provided and git URL is parsable
        if (accessToken && gitInfo) {
            const webhookUrl = gitInfo.platform === 'github' ? webhookUrls.github : webhookUrls.gitlab;

            if (gitInfo.platform === 'github') {
                webhookResult = await createGitHubWebhook(
                    gitInfo.owner,
                    gitInfo.repo,
                    webhookUrl,
                    webhookSecret,
                    accessToken
                );
            } else if (gitInfo.platform === 'gitlab') {
                webhookResult = await createGitLabWebhook(
                    gitInfo.owner,
                    gitInfo.repo,
                    webhookUrl,
                    webhookSecret,
                    accessToken
                );
            }

            if (webhookResult?.success) {
                webhookId = webhookResult.webhookId;
            }
        }

        // Update project
        await Project.findOneAndUpdate(
            { projectId },
            {
                autoRedeploy: true,
                webhookSecret,
                ...(webhookId ? { webhookId } : {}),
            }
        );

        // Build response
        const response = {
            message: webhookResult?.success
                ? 'Auto-redeploy enabled and webhook created automatically'
                : 'Auto-redeploy enabled successfully',
            projectId,
            webhookSecret,
            webhookUrls,
            automaticSetup: !!webhookResult?.success,
        };

        if (webhookResult?.success) {
            response.webhookId = webhookId;
            response.platform = gitInfo.platform;
        } else if (webhookResult?.error) {
            response.webhookError = webhookResult.error;
            response.instructions = {
                github: 'Add webhook manually in repository Settings > Webhooks. Use the GitHub URL, set Content-Type to application/json, and paste the webhook secret.',
                gitlab: 'Add webhook manually in repository Settings > Webhooks. Use the GitLab URL, paste the secret token, and select Push events.',
            };
        } else if (!accessToken) {
            response.instructions = {
                automatic: `To create webhook automatically, send a POST request with { "accessToken": "your_token" } in the body. Use a GitHub Personal Access Token (with repo scope) or GitLab Access Token (with api scope).`,
                manual: {
                    github: 'Add webhook in repository Settings > Webhooks. Use the GitHub URL, set Content-Type to application/json, and paste the webhook secret.',
                    gitlab: 'Add webhook in repository Settings > Webhooks. Use the GitLab URL, paste the secret token, and select Push events.',
                }
            };
        }

        return res.json(response);

    } catch (error) {
        console.error('Enable auto-redeploy error:', error);
        return res.status(500).json({
            error: 'Failed to enable auto-redeploy',
            message: error?.message ?? String(error)
        });
    }
}

/**
 * Disable auto-redeploy for a project
 * POST /api/webhook/disable/:projectId
 */
async function disableAutoRedeploy(req, res) {
    const { projectId } = req.params;

    try {
        const project = await Project.findOne({ projectId });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Update project
        await Project.findOneAndUpdate(
            { projectId },
            {
                autoRedeploy: false,
            }
        );

        return res.json({
            message: 'Auto-redeploy disabled successfully',
            projectId,
        });

    } catch (error) {
        console.error('Disable auto-redeploy error:', error);
        return res.status(500).json({
            error: 'Failed to disable auto-redeploy',
            message: error?.message ?? String(error)
        });
    }
}

/**
 * Get webhook status and configuration for a project
 * GET /api/webhook/status/:projectId
 */
async function getWebhookStatus(req, res) {
    const { projectId } = req.params;

    try {
        const project = await Project.findOne({ projectId });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const webhookUrls = {
            github: `${config.API_URL || 'http://localhost:3000'}/api/webhook/github/${projectId}`,
            gitlab: `${config.API_URL || 'http://localhost:3000'}/api/webhook/gitlab/${projectId}`,
        };

        return res.json({
            projectId,
            autoRedeploy: project.autoRedeploy || false,
            webhookSecret: project.autoRedeploy ? project.webhookSecret : null,
            webhookUrls: project.autoRedeploy ? webhookUrls : null,
            lastCommitHash: project.lastCommitHash,
            lastDeployment: project.updatedAt,
        });

    } catch (error) {
        console.error('Get webhook status error:', error);
        return res.status(500).json({
            error: 'Failed to get webhook status',
            message: error?.message ?? String(error)
        });
    }
}

module.exports = {
    handleGitHubWebhook,
    handleGitLabWebhook,
    enableAutoRedeploy,
    disableAutoRedeploy,
    getWebhookStatus,
};
