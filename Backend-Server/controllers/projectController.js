const { ECSClient, RunTaskCommand, ListTasksCommand, DescribeTasksCommand, DescribeTaskDefinitionCommand } = require('@aws-sdk/client-ecs');
const { CloudWatchLogsClient, GetLogEventsCommand, CreateLogGroupCommand, DeleteLogStreamCommand } = require('@aws-sdk/client-cloudwatch-logs');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const config = require('../config');

const ecsClient = new ECSClient({ region: config.AWS_REGION });
const logsClient = new CloudWatchLogsClient({ region: config.AWS_REGION });
const s3Client = new S3Client({ region: config.AWS_REGION });

async function flushAndArchiveLogs(logGroupName, logStreamName, projectId) {

  const events = [];
  let nextToken = undefined;
  let prevToken = undefined;
  for (let i = 0; i < 1000; i++) {
    const params = { logGroupName, logStreamName, startFromHead: true };
    if (nextToken) params.nextToken = nextToken;
    try {
      const resp = await logsClient.send(new GetLogEventsCommand(params));
      if (resp.events && resp.events.length > 0) events.push(...resp.events);

      if (!resp.nextForwardToken || resp.nextForwardToken === prevToken) break;
      prevToken = resp.nextForwardToken;
      nextToken = resp.nextForwardToken;

      await new Promise((r) => setTimeout(r, 200));
    } catch (err) {
      const msg = err?.message ?? String(err);
      if (/log stream .* does not exist/i.test(msg) || /specified log stream does not exist/i.test(msg) || /log stream does not exist/i.test(msg)) {
        break;
      }
      throw err;
    }
  }

  const lines = events.map(ev => JSON.stringify({ ts: ev.timestamp, message: ev.message }));
  const body = lines.join('\n') + '\n';

  const bucket = config.S3_BUCKET;
  const safeStreamName = logStreamName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const key = `__logs/${projectId}/${safeStreamName}.log`;
  await s3Client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: Buffer.from(body, 'utf8'), ContentType: 'text/plain' }));

  try {
    await logsClient.send(new DeleteLogStreamCommand({ logGroupName, logStreamName }));
  } catch (delErr) {
    const dmsg = delErr?.message ?? String(delErr);
    if (!/does not exist/i.test(dmsg)) throw delErr;
  }

  return { bucket, key, count: events.length };
}

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
            { name: 'S3_BUCKET', value: config.S3_BUCKET },
          ],
        },
      ],
    },
    startedBy: PROJECT_ID,
  };

  try {
    try {
      const tdResp = await ecsClient.send(new DescribeTaskDefinitionCommand({ taskDefinition: config.TASK }));
      const td = tdResp.taskDefinition;
      if (td && Array.isArray(td.containerDefinitions) && td.containerDefinitions.length > 0) {
        const containerDef = td.containerDefinitions.find(cd => cd.name === 'builderimage') || td.containerDefinitions[0];
        const lc = containerDef && containerDef.logConfiguration && containerDef.logConfiguration.options;
        const lg = lc && (lc['awslogs-group'] || lc.awslogsGroup || lc['awslogs-group-name']);
        if (lg) {
          try {
            await logsClient.send(new CreateLogGroupCommand({ logGroupName: lg }));
            console.info('Ensured CloudWatch log group exists:', lg);
          } catch (createErr) {
            console.warn('Could not create CloudWatch log group:', lg, createErr?.message ?? String(createErr));
          }
        }
      }
    } catch (tdErr) {
      console.warn('Failed to describe task definition for proactive log-group creation:', tdErr?.message ?? String(tdErr));
    }

    const command = new RunTaskCommand(params);
    const result = await ecsClient.send(command);
    const taskArn = result.tasks && result.tasks[0] && result.tasks[0].taskArn;

    return res.json({
      data: {
        PROJECT_ID,
        url: `http://${PROJECT_ID}.${config.APP_DOMAIN}`,
        ecs: { result },
        taskArn,
      },
    });
  } catch (err) {
    console.error('Failed to run ECS task:', err);
    return res.status(502).json({ status: 'error', message: 'Failed to queue ECS task', error: err?.message ?? String(err) });
  }
}

/**
 * SSE endpoint to stream CloudWatch Logs for the ECS task started by PROJECT_ID.
 * GET api/project/:projectId/logs/stream
 */
async function streamLogs(req, res) {
  const projectId = req.params.projectId;
  if (!projectId) return res.status(400).json({ error: 'projectId param required' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();

  const writeEvent = (data) => {
    try {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (e) {
    }
  };

  try {
    const listCmd = new ListTasksCommand({ cluster: config.CLUSTER, startedBy: projectId, desiredStatus: 'RUNNING' });
    let listResp = await ecsClient.send(listCmd);
    if ((!listResp.taskArns || listResp.taskArns.length === 0)) {
      const listAllCmd = new ListTasksCommand({ cluster: config.CLUSTER, startedBy: projectId });
      listResp = await ecsClient.send(listAllCmd);
    }

    if (!listResp.taskArns || listResp.taskArns.length === 0) {
      writeEvent({ status: 'no-task', message: 'No ECS task found for this project yet' });
      let retries = 40;
      const intervalId = setInterval(async () => {
        retries -= 1;
        try {
          const r = await ecsClient.send(new ListTasksCommand({ cluster: config.CLUSTER, startedBy: projectId }));
          if (r.taskArns && r.taskArns.length > 0) {
            clearInterval(intervalId);
            listResp = r;
            proceedWithTask(listResp.taskArns[0]);
          } else if (retries <= 0) {
            clearInterval(intervalId);
            writeEvent({ status: 'timeout', message: 'No task created for project within timeout' });
            res.end();
          }
        } catch (err) {
          clearInterval(intervalId);
          writeEvent({ status: 'error', message: 'Failed to list tasks', error: err?.message ?? String(err) });
          res.end();
        }
      }, 3000);

      req.on('close', () => clearInterval(intervalId));
      return;
    }

    const firstTaskArn = listResp.taskArns[0];
    proceedWithTask(firstTaskArn);

    async function proceedWithTask(taskArn) {
      try {
        const describeCmd = new DescribeTasksCommand({ cluster: config.CLUSTER, tasks: [taskArn] });
        const describeResp = await ecsClient.send(describeCmd);
        const task = describeResp.tasks && describeResp.tasks[0];
        if (!task) {
          writeEvent({ status: 'error', message: 'Failed to describe task' });
          return res.end();
        }

        const taskId = task.taskArn.split('/').pop();
        const container = task.containers && task.containers[0];
        const containerName = (container && container.name) || 'builderimage';

        const tdArn = task.taskDefinitionArn;
        const describeTdCmd = new DescribeTaskDefinitionCommand({ taskDefinition: tdArn });
        const tdResp = await ecsClient.send(describeTdCmd);
        const containerDef = tdResp.taskDefinition && tdResp.taskDefinition.containerDefinitions && tdResp.taskDefinition.containerDefinitions.find(cd => cd.name === containerName) || tdResp.taskDefinition.containerDefinitions[0];
        const logConf = containerDef && containerDef.logConfiguration && containerDef.logConfiguration.options;
        if (!logConf || !logConf['awslogs-group'] || !logConf['awslogs-stream-prefix']) {
          writeEvent({ status: 'no-logs-config', message: 'Task/container log configuration not found (awslogs not configured)' });
          return res.end();
        }

        const logGroupName = logConf['awslogs-group'];
        const streamPrefix = logConf['awslogs-stream-prefix'];
        const logStreamName = `${streamPrefix}/${containerName}/${taskId}`;

        let nextToken = undefined;
        let polling = true;

        const poll = async () => {
          try {
            const getCmdParams = { logGroupName, logStreamName, startFromHead: true };
            if (nextToken) getCmdParams.nextToken = nextToken;
            const cmd = new GetLogEventsCommand(getCmdParams);
            const resp = await logsClient.send(cmd);
            if (resp.events && resp.events.length > 0) {
              resp.events.forEach(ev => {
                writeEvent({ ts: ev.timestamp, message: ev.message });
              });
            }
            if (resp.nextForwardToken) nextToken = resp.nextForwardToken;

            try {
              const desc = await ecsClient.send(new DescribeTasksCommand({ cluster: config.CLUSTER, tasks: [taskArn] }));
              const currentTask = desc.tasks && desc.tasks[0];
              const currentStatus = currentTask && currentTask.lastStatus;
              if (currentStatus === 'STOPPED') {
                try {
                  const resInfo = await flushAndArchiveLogs(logGroupName, logStreamName, projectId);
                } catch (archiveErr) {
                  writeEvent({ status: 'archive-error', message: archiveErr?.message ?? String(archiveErr) });
                }
                writeEvent({ status: 'finished' });
                clearInterval(intervalId);
                return res.end();
              }
            } catch (stErr) {
              writeEvent({ status: 'warning', message: 'Failed to describe task while polling', error: stErr?.message ?? String(stErr) });
            }
          } catch (err) {
            const msg = err?.message ?? String(err);
            const isNoLogGroup = /log group .* does not exist/i.test(msg) || /specified log group does not exist/i.test(msg);
            const isNoLogStream = /log stream .* does not exist/i.test(msg) || /specified log stream does not exist/i.test(msg) || /log stream does not exist/i.test(msg);

            if (isNoLogGroup) {
              writeEvent({ status: 'log-error', message: 'Log group missing, attempting to create', detail: msg });
              try {
                await logsClient.send(new CreateLogGroupCommand({ logGroupName }));
                writeEvent({ status: 'created-log-group', logGroupName });
                await new Promise((r) => setTimeout(r, 1000));
              } catch (createErr) {
                const cmsg = createErr?.message ?? String(createErr);
                if (/already exists/i.test(cmsg) || (createErr && createErr.name === 'ResourceAlreadyExistsException')) {
                  writeEvent({ status: 'created-log-group', logGroupName, note: 'already-existed' });
                } else {
                  writeEvent({ status: 'log-error', message: 'Failed to create log group', error: cmsg });
                }
              }
            } else if (isNoLogStream) {
            } else {
              writeEvent({ status: 'log-error', message: msg });
            }
          }
        };

        await poll();
        const intervalId = setInterval(poll, 2000);

        req.on('close', () => {
          clearInterval(intervalId);
          polling = false;
        });

      } catch (err) {
        writeEvent({ status: 'error', message: err?.message ?? String(err) });
        return res.end();
      }
    }

  } catch (err) {
    writeEvent({ status: 'error', message: err?.message ?? String(err) });
    return res.end();
  }
}

module.exports = { createProject, streamLogs };
