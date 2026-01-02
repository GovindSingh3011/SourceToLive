const crypto = require('crypto');
const { ECSClient, RunTaskCommand } = require('@aws-sdk/client-ecs');
const config = require('../config');
const Project = require('../models/Project');

const ecsClient = new ECSClient({ region: config.AWS_REGION });

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
 */
async function enableAutoRedeploy(req, res) {
    const { projectId } = req.params;

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

        // Update project
        await Project.findOneAndUpdate(
            { projectId },
            {
                autoRedeploy: true,
                webhookSecret,
            }
        );

        // Return webhook URLs
        const webhookUrls = {
            github: `${config.API_URL || 'http://localhost:3000'}/api/webhook/github/${projectId}`,
            gitlab: `${config.API_URL || 'http://localhost:3000'}/api/webhook/gitlab/${projectId}`,
        };

        return res.json({
            message: 'Auto-redeploy enabled successfully',
            projectId,
            webhookSecret,
            webhookUrls,
            instructions: {
                github: 'Add webhook in repository Settings > Webhooks. Use the GitHub URL, set Content-Type to application/json, and paste the webhook secret.',
                gitlab: 'Add webhook in repository Settings > Webhooks. Use the GitLab URL, paste the secret token, and select Push events.',
            }
        });

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
