# SourceToLive AWS Configuration Guide

This guide provides a complete AWS setup for the current SourceToLive architecture.

It covers:

- IAM roles and policies
- S3 bucket setup for deployed build artifacts
- ECS Fargate setup for build execution
- CloudWatch Logs setup for live log streaming
- ECR image setup for the build container
- VPC/network requirements
- Environment variable mapping for all project services
- Verification and troubleshooting

## 1. Architecture Mapping

SourceToLive AWS flow in this repository:

1. Backend API receives create-project request.
2. Backend calls ECS RunTask (Fargate) with environment overrides.
3. ECS task runs Build-Server container (`builderimage`).
4. Build-Server clones repo, builds app, uploads output to S3:
   - `__outputs/<PROJECT_ID>/...`
5. Backend streams logs from CloudWatch and archives logs to S3:
   - `__logs/<PROJECT_ID>.log`
6. Reverse proxy serves project from:
   - `https://<PROJECT_ID>.<APP_DOMAIN>`
   - backed by S3 object path under `__outputs/`.

## 2. AWS Resources You Need

Create these resources in one AWS region (recommended: `us-east-1`):

- ECS cluster for build tasks
- ECS task definition for Build-Server container
- ECR repository to store build container image
- S3 bucket for deployment outputs and archived logs
- CloudWatch log group for ECS task logs
- IAM role/user for Backend-Server AWS API access
- IAM execution role for ECS task
- VPC subnets + security group for Fargate networking

## 3. S3 Bucket Setup

Create one bucket, for example:

- `sourcetolivebucket`

Required object paths used by code:

- `__outputs/<project-id>/...` for deployed app files
- `__logs/<project-id>.log` for archived build logs

### 3.1 Public Access Behavior

Your current reverse-proxy setup uses direct S3 URL base paths and may require object public read depending on your deployment mode.

If you want public object reads (as shown in your shared screenshot):

1. Go to S3 bucket Permissions.
2. Turn off Block Public Access for this bucket.
3. Add a bucket policy similar to:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

Security note:

- This makes objects publicly readable. Use only if that matches your product requirement.
- For stricter security, use CloudFront + OAC or signed URLs instead of public bucket access.

## 4. ECR Setup (Build Container Image)

1. Create an ECR private repository (example: `sourcetolive-build-server`).
2. Build image from [Build-Server/Dockerfile](../Build-Server/Dockerfile).
3. Push image to ECR.
4. Use that image URI in ECS task definition.

Example naming:

- `ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/sourcetolive-build-server:latest`

## 5. ECS Fargate Setup

### 5.1 ECS Cluster

Create a cluster (example name):

- `sourcetolive-cluster`

Use this value in Backend env:

- `CLUSTER=sourcetolive-cluster`

### 5.2 Task Definition (Build-Server)

Create Fargate task definition with:

- Family: for example `sourcetolive-build-task`
- Launch type compatibility: FARGATE
- Network mode: `awsvpc`
- Container name: `builderimage` (important; code expects this name)
- Image: your ECR image
- CPU/Memory: choose based on app size (start with 0.5 vCPU / 1 GB)
- Log driver: awslogs

Recommended log config:

- awslogs-group: `/ecs/sourcetolive-builder`
- awslogs-region: `us-east-1`
- awslogs-stream-prefix: `ecs`

Use this task definition family in Backend env:

- `TASK=sourcetolive-build-task`

### 5.3 Runtime Environment Passed by Backend

Backend injects these variables when it runs ECS task:

- `PROJECT_ID`
- `GIT_REPOSITORY__URL`
- `S3_BUCKET`
- `INSTALL_CMD`
- `BUILD_CMD`
- `BUILD_ROOT` (optional)
- `GITHUB_TOKEN` (if user has connected GitHub)
- custom project env vars

## 6. IAM Configuration

### 6.1 Backend AWS Access Policy

Attach this to the IAM principal used by Backend-Server AWS SDK calls.

Replace placeholders:

- `YOUR_ACCOUNT_ID`
- `YOUR_REGION`
- `YOUR_BUCKET_NAME`
- `YOUR_LOG_GROUP`

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
        "Effect": "Allow",
        "Action": "iam:PassRole",
        "Resource": "arn:aws:iam::YOUR_ACCOUNT_ID:role/ecsTaskExecutionRole"
    },
    {
        "Effect": "Allow",
        "Action": [
            "ecs:RunTask",
            "ecs:ListTasks",
            "ecs:DescribeTasks",
            "ecs:DescribeTaskDefinition"
        ],
        "Resource": "*"
    },
    {
        "Effect": "Allow",
        "Action": [
            "ecr:*",
            "ecr:GetAuthorizationToken"
        ],
        "Resource": "*"
    },
    {
        "Effect": "Allow",
        "Action": [
            "logs:CreateLogGroup",
            "logs:CreateLogStream",         
            "logs:DeleteLogStream",
            "logs:PutLogEvents",
            "logs:GetLogEvents"
        ],
        "Resource": "arn:aws:logs:*:*:*"
    },
    {
        "Effect": "Allow",
        "Action": [
            "s3:PutObject",
            "s3:GetObject",
            "s3:ListBucket"
        ],
        "Resource": [
            "arn:aws:s3:::YOUR_BUCKET_NAME",
            "arn:aws:s3:::YOUR_BUCKET_NAME/*"
        ]
    }
  ]
}
```

Notes:

- Your screenshot policy is valid as a broad starting point.
- Prefer narrowing resources by log group, cluster, task family, and bucket for production.

### 6.2 ECS Task Execution Role Policy

The ECS task execution role (usually `ecsTaskExecutionRole`) needs:

- AmazonECSTaskExecutionRolePolicy (managed policy)
- ECR pull permissions
- CloudWatch logs write permissions

If your Build-Server container writes to S3 using container credentials, grant S3 write permissions to the task role used by the container.

## 7. Networking Requirements (Fargate)

Backend passes:

- `AWS_SUBNETS` (comma-separated)
- `AWS_SECURITY_GROUPS` (comma-separated)

Requirements:

- Subnets must belong to the same VPC as ECS networking.
- If `assignPublicIp` is enabled (current code), subnet route table must allow outbound internet access.
- Security group should allow egress to:
  - GitHub (repo cloning)
  - ECR endpoints
  - S3 endpoint/public internet
  - CloudWatch Logs endpoint

## 8. Environment Variable Setup by Service

### 8.1 Backend-Server `.env`

Use values mapped to your AWS setup:

```env
AWS_REGION=us-east-1
CLUSTER=sourcetolive-cluster
TASK=sourcetolive-build-task
AWS_SUBNETS=subnet-aaaa,subnet-bbbb
AWS_SECURITY_GROUPS=sg-aaaa
S3_BUCKET=sourcetolivebucket
APP_DOMAIN=sourcetolive.dev
BASE_PATH=https://sourcetolivebucket.s3.us-east-1.amazonaws.com/__outputs
```

Also ensure standard backend vars are configured (`MONGODB_URI`, `JWT_SECRET`, OAuth vars, etc.).

### 8.2 Build-Server `.env` (local testing)

```env
AWS_ACCESS_KEY_ID=YOUR_KEY
AWS_SECRET_ACCESS_KEY=YOUR_SECRET
AWS_REGION=us-east-1
```

In ECS production runs, these are usually provided by task role/overrides.

### 8.3 Reverse-Proxy `.env`

```env
PORT=8000
BASE_PATH=https://sourcetolivebucket.s3.us-east-1.amazonaws.com/__outputs
AWS_ACCESS_KEY_ID=YOUR_KEY
AWS_SECRET_ACCESS_KEY=YOUR_SECRET
AWS_REGION=us-east-1
CLIENT_URL=https://sourcetolive.dev
```

Important implementation note:

- [Reverse-Proxy/index.js](../Reverse-Proxy/index.js#L119) currently hardcodes bucket name as `sourcetolivebucket` for SDK fallback reads.
- If your bucket name differs, update this value in code or make it environment-driven.

## 9. Deployment Verification Checklist

After setup, verify in this order:

1. Backend can call ECS RunTask without AccessDenied.
2. ECS task starts and reaches RUNNING/STOPPED states normally.
3. CloudWatch log stream appears under your configured log group.
4. Build output files appear in S3 under `__outputs/<project-id>/`.
5. Archived logs appear in S3 under `__logs/<project-id>.log`.
6. Reverse proxy serves app from `https://<project-id>.<APP_DOMAIN>`.

## 10. Troubleshooting

### 10.1 `AccessDeniedException` on `ecs:RunTask`

- Add `ecs:RunTask` and `iam:PassRole` permission.
- Ensure passed role ARN matches actual ECS execution role ARN.

### 10.2 No logs streaming in UI

- Confirm awslogs is enabled in task definition.
- Check log group and stream prefix.
- Ensure backend IAM has `logs:GetLogEvents`.

### 10.3 Build succeeded but app URL returns 404

- Confirm output exists at `s3://<bucket>/__outputs/<project-id>/index.html`.
- Confirm `BASE_PATH` points to the same bucket and region.
- Verify reverse-proxy fallback and bucket read policy.

### 10.4 Private GitHub repo clone fails

- Ensure user connected GitHub token.
- Confirm `GITHUB_TOKEN` gets passed to build task (backend override).

### 10.5 S3 upload fails from build task

- Ensure build container has valid AWS credentials (task role or env vars).
- Ensure S3 permissions include `s3:PutObject` on target bucket path.

---

Last updated: 2026-04-09
