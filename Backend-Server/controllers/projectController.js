const { ECSClient, RunTaskCommand } = require('@aws-sdk/client-ecs');
const config = require('../config');

const ecsClient = new ECSClient({ region: config.AWS_REGION });

/**
 * POST /project
 * Body: { GIT_REPOSITORY__URL: string, PROJECT_ID: string }
 * Queues an ECS RunTask and forwards PROJECT_ID and GIT_REPOSITORY__URL to the container.
 */
async function createProject(req, res) {
  const { GIT_REPOSITORY__URL, PROJECT_ID } = req.body || {};

  if (!GIT_REPOSITORY__URL || typeof GIT_REPOSITORY__URL !== 'string') {
    return res.status(400).json({ error: 'GIT_REPOSITORY__URL is required and must be a string' });
  }

  if (!PROJECT_ID || typeof PROJECT_ID !== 'string') {
    return res.status(400).json({ error: 'PROJECT_ID is required and must be a string' });
  }

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
            { name: 'PROJECT_ID', value: PROJECT_ID },
            { name: 'GIT_REPOSITORY__URL', value: GIT_REPOSITORY__URL },
          ],
        },
      ],
    },
  };

  try {
    const command = new RunTaskCommand(params);
    const result = await ecsClient.send(command);

    return res.json({
      status: 'queued',
      data: {
        PROJECT_ID,
        url: `http://${PROJECT_ID}.${config.APP_DOMAIN}`,
        ecs: { result },
      },
    });
  } catch (err) {
    // Log for operators, return safe error to client
    console.error('Failed to run ECS task:', err);
    return res.status(502).json({ status: 'error', message: 'Failed to queue ECS task', error: err?.message ?? String(err) });
  }
}

module.exports = { createProject };
