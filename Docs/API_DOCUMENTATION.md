# SourceToLive Backend API Documentation

## Table of Contents

1. [Introduction & API Overview](#1-introduction--api-overview)
2. [API Purpose & Scope](#2-api-purpose--scope)
3. [Base URL & Environments](#3-base-url--environments)
4. [Authentication & Authorization](#4-authentication--authorization)
5. [API Architecture Overview](#5-api-architecture-overview)
6. [Technology Stack](#6-technology-stack)
7. [Request & Response Format](#7-request--response-format)
8. [HTTP Methods Used](#8-http-methods-used)
9. [API Endpoints](#9-api-endpoints)
10. [User Authentication APIs](#10-user-authentication-apis)
11. [Project Management APIs](#11-project-management-apis)
12. [Deployment APIs](#12-deployment-apis)
13. [Webhook & Auto-Deployment APIs](#13-webhook--auto-deployment-apis)
14. [Deployment Workflow](#14-deployment-workflow)
15. [Error Handling & Status Codes](#15-error-handling--status-codes)
16. [Security Measures](#16-security-measures)
17. [Logging & Monitoring](#17-logging--monitoring)
18. [API Usage Examples](#18-api-usage-examples)
19. [Support & Contact Information](#19-support--contact-information)

---

## 1. Introduction & API Overview

SourceToLive is a cloud-based deployment automation platform that enables developers to deploy applications directly from GitHub repositories to AWS infrastructure. The Backend API serves as the core service handling user authentication, project management, deployment orchestration, and webhook-based continuous deployment.

The API provides a robust foundation for:

- User registration and authentication
- OAuth2 integration with GitHub and Google
- Project creation and management
- Automated deployments and redeployments
- Build logging and monitoring
- Webhook-based CI/CD automation

---

## 2. API Purpose & Scope

### Core Objectives

- **User Management**: Secure user registration, authentication, and authorization
- **Project Management**: Create, read, update, and delete deployment projects
- **Deployment Orchestration**: Queue and manage ECS build tasks on AWS
- **CI/CD Automation**: Handle GitHub and GitLab webhooks for automatic deployments
- **Monitoring & Logging**: Stream live logs and archive build logs in S3

### Supported Operations

- OAuth authentication (Google, GitHub)
- Email-based OTP verification for registration
- GitHub repository management and access
- Project deployment tracking via AWS ECS
- Real-time and archived log retrieval
- Webhook-triggered automatic redeployment

---

## 3. Base URL & Environments

### Production

```
https://api.sourcetolive.dev
```

### Development

```
http://localhost:3000
```

### Environment Configuration

| Environment | Base URL                     | Node Env    | Purpose                     |
| ----------- | ---------------------------- | ----------- | --------------------------- |
| Development | http://localhost:3000        | development | Local testing and debugging |
| Production  | https://api.sourcetolive.dev | production  | Live application            |

---

## 4. Authentication & Authorization

### Authentication Methods

#### 4.1 JWT Token-Based Authentication

All protected API endpoints require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

**Token Expiration**: Tokens expire after 24 hours

**Token Format**:

```json
{
  "userId": 1000,
  "email": "user@example.com",
  "role": "user",
  "iat": 1693641600,
  "exp": 1693728000
}
```

#### 4.2 OAuth2 Provider Support

The API supports authentication via:

- **Google OAuth 2.0** - Social login via Google
- **GitHub OAuth 2.0** - Repository access and deployment automation
- **Email + Password** - Traditional local authentication

### Authorization Levels

| Role  | Permissions                                               | Description                 |
| ----- | --------------------------------------------------------- | --------------------------- |
| User  | Can create and manage own projects, deploy applications   | Regular authenticated users |
| Admin | Full system access, user management, system configuration | Administrator privileges    |

### Middleware Protection

Protected routes require `verifyToken` middleware:

```javascript
GET /api/project           // Requires JWT
POST /api/project          // Requires JWT + isUser role
GET /api/project/:id       // Requires JWT
```

---

## 5. API Architecture Overview

### Service Architecture

```
┌─────────────┐
│   Frontend  │ (React/Vite)
└──────┬──────┘
       │ HTTP/REST
       ▼
┌─────────────────────────────────────┐
│      Express.js Backend Server      │
├─────────────────────────────────────┤
│  Routes: Auth, Projects, Webhooks   │
├─────────────────────────────────────┤
│  Controllers: Business Logic        │
├─────────────────────────────────────┤
│  Middleware: Auth, Validation       │
├─────────────────────────────────────┤
│  Models: User, Project              │
└────────┬────────────────────────────┘
         │
    ▶────┴────◀
    │         │
    ▼         ▼
  MongoDB    AWS
  ├─Users   ├─ECS (Build Tasks)
  └─Projects├─S3 (Logs Storage)
            └─CloudWatch (Monitoring)
```

---

## 6. Technology Stack

### Core Dependencies

| Package             | Version | Purpose                       |
| ------------------- | ------- | ----------------------------- |
| express             | 5.2.1   | REST API framework            |
| mongoose            | 9.1.5   | MongoDB object modeling       |
| jsonwebtoken        | 9.0.3   | JWT token management          |
| bcrypt              | 6.0.0   | Password hashing              |
| dotenv              | 17.2.3  | Environment configuration     |
| cors                | 2.8.6   | Cross-Origin Resource Sharing |
| morgan              | 1.10.1  | HTTP request logging          |
| nodemailer          | 7.0.13  | Email delivery                |
| resend              | 6.9.1   | Email service provider        |
| axios               | 1.13.4  | HTTP client                   |
| google-auth-library | 10.5.0  | Google OAuth integration      |

### AWS SDKs

| SDK                             | Version | Purpose             |
| ------------------------------- | ------- | ------------------- |
| @aws-sdk/client-ecs             | 3.980.0 | ECS task management |
| @aws-sdk/client-s3              | 3.980.0 | S3 object storage   |
| @aws-sdk/client-cloudwatch-logs | 3.980.0 | CloudWatch logging  |

### Database

- **MongoDB**: Document-based NoSQL database
- **Mongoose**: ODM for schema validation and modeling

### Server Runtime

- **Node.js**: JavaScript runtime environment
- **Nodemon**: Development server auto-reload

---

## 7. Request & Response Format

### Request Format

All API requests must include:

```
Method: GET|POST|PUT|DELETE|PATCH
URL: /api/[resource]/[action]
Headers:
  Content-Type: application/json
  Authorization: Bearer <token> (if protected)
Body: JSON object (for POST/PUT/PATCH)
```

### Response Format

All API responses follow a standard JSON structure:

#### Success Response (2xx)

```json
{
  "message": "Operation successful",
  "data": {
    /* Response data */
  },
  "status": 200
}
```

#### Error Response (4xx, 5xx)

```json
{
  "message": "Error description",
  "error": "Error details (if available)",
  "status": 400
}
```

### Common Response Fields

| Field   | Type         | Description                 |
| ------- | ------------ | --------------------------- |
| message | string       | Human-readable message      |
| data    | object/array | Response payload            |
| error   | string       | Error details (errors only) |
| status  | number       | HTTP status code            |

---

## 8. HTTP Methods Used

| Method  | Purpose        | Usage                                           |
| ------- | -------------- | ----------------------------------------------- |
| GET     | Retrieve data  | Fetch user info, list projects, get logs        |
| POST    | Create data    | Register user, create project, trigger redeploy |
| PUT     | Update data    | Modify project settings, update user profile    |
| DELETE  | Remove data    | Delete project, remove GitHub token             |
| PATCH   | Partial update | Partial project updates                         |
| OPTIONS | CORS preflight | Handled automatically by CORS middleware        |

---

## 9. API Endpoints

### Endpoint Categories

1. **Authentication APIs** - User registration, login, OAuth
2. **Project APIs** - Project CRUD operations
3. **Deployment APIs** - Deployment logs and redeployment
4. **Webhook APIs** - GitHub/GitLab webhook handlers

### Quick Reference

```
📌 AUTH ENDPOINTS
  POST   /api/auth/register                       - Register new user
  POST   /api/auth/register/verify                - Verify registration with OTP
  POST   /api/auth/login                          - Login with credentials
  POST   /api/auth/google                         - Google OAuth login
  GET    /api/auth/github/oauth                   - Initiate GitHub OAuth
  GET    /api/auth/github/callback                - GitHub OAuth callback
  POST   /api/auth/github-token                   - Save GitHub token
  GET    /api/auth/github-token/status            - Get GitHub token status
  DELETE /api/auth/github-token                   - Remove GitHub token
  GET    /api/auth/me                             - Get current user info

📌 PROJECT ENDPOINTS
  GET    /api/project                            - List user's projects
  POST   /api/project                            - Create new project
  GET    /api/project/:projectId                 - Get project details
  PUT    /api/project/:projectId                 - Update project
  DELETE /api/project/:projectId                 - Delete project
  GET    /api/project/:projectId/logs/stream     - Stream live logs
  GET    /api/project/:projectId/logs/archive    - Get archived logs
  POST   /api/project/:projectId/redeploy        - Trigger redeploy
  POST   /api/project/:projectId/webhook/setup   - Setup webhook
  POST   /api/project/:projectId/webhook/delete  - Delete webhook
  GET    /api/project/repositories/github        - List GitHub repositories

📌 WEBHOOK ENDPOINTS
  POST   /api/webhook/github/:projectId          - GitHub webhook receiver
  POST   /api/webhook/gitlab/:projectId          - GitLab webhook receiver
  POST   /api/webhook/enable/:projectId          - Enable auto-redeploy
  POST   /api/webhook/disable/:projectId         - Disable auto-redeploy
  GET    /api/webhook/status/:projectId          - Get webhook status

📌 DEBUG ENDPOINTS (Development Only)
  GET    /api/auth/debug/pending                  - List pending registrations
  GET    /api/auth/debug/otp/:email               - Get OTP for email
```

---

## 10. User Authentication APIs

### 10.1 User Registration

**Endpoint**: `POST /api/auth/register`

**Access**: Public (No authentication required)

**Description**: Initiate user registration by providing basic information. An OTP will be sent to the provided email for verification.

**Request Body**:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com"
}
```

**Response** (200 OK):

```json
{
  "message": "OTP sent to your email. Please verify to complete registration.",
  "userId": 1000,
  "devOtp": "123456" // Only in development mode
}
```

**Error Responses**:

- 400: Missing required fields
- 400: User already exists
- 429: Registration already initiated
- 500: Email sending failed

---

### 10.2 Verify Registration

**Endpoint**: `POST /api/auth/register/verify`

**Access**: Public

**Description**: Complete registration by verifying OTP and setting password.

**Request Body**:

```json
{
  "email": "john.doe@example.com",
  "otp": "123456",
  "password": "SecurePassword123!"
}
```

**Response** (200 OK):

```json
{
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 1000,
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  }
}
```

**Error Responses**:

- 400: Missing required fields
- 400: No pending registration (OTP might have expired)
- 400: Invalid OTP

---

### 10.3 User Login

**Endpoint**: `POST /api/auth/login`

**Access**: Public

**Description**: Authenticate user with email and password.

**Request Body**:

```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Response** (200 OK):

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 1000,
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "isActive": true
  }
}
```

**Error Responses**:

- 400: Missing email or password
- 401: Invalid credentials
- 403: User account is inactive

---

### 10.4 Google OAuth Authentication

**Endpoint**: `POST /api/auth/google`

**Access**: Public

**Description**: Authenticate user using Google OAuth token. Creates account automatically if user doesn't exist.

**Request Body**:

```json
{
  "credential": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ..."
}
```

**Response** (200 OK):

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 1001,
    "email": "john.doe@gmail.com",
    "firstName": "John",
    "lastName": "Doe",
    "authProvider": "google",
    "avatar": "https://lh3.googleusercontent.com/..."
  }
}
```

**Error Responses**:

- 400: Missing credential
- 400: Invalid token

---

### 10.5 Get Current User

**Endpoint**: `GET /api/auth/me`

**Access**: Protected (JWT required)

**Description**: Retrieve current authenticated user's information.

**Headers**:

```
Authorization: Bearer <token>
```

**Response** (200 OK):

```json
{
  "message": "User retrieved successfully",
  "user": {
        "userId": "1000",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "role": "user",
        "authProvider": "OAuth2.0",
        "githubAccessToken":  "null(default)",
        "avatar": "https://...",
        "phone": "+1234567890",
        "address": "123 Main St, City, State"
      }
}
```

**Error Responses**:

- 401: Unauthorized (missing or invalid token)
- 404: User not found

---

### 10.6 GitHub OAuth - Initiate

**Endpoint**: `GET /api/auth/github/oauth`

**Access**: Protected (JWT required)

**Description**: Redirect user to GitHub authorization page for repository access.

**Query Parameters** (Optional):

```
?redirect_uri=https://frontend.com/callback
```

**Response**:
Redirects to GitHub OAuth authorization URL

---

### 10.7 GitHub OAuth - Callback

**Endpoint**: `GET /api/auth/github/callback`

**Access**: Public

**Description**: Handle GitHub OAuth callback and complete authentication.

**Query Parameters**:

```
?code=abc123&state=xyz
```

**Response** (302 Redirect):
Redirects to frontend with:

```
https://frontend.com/auth/callback?token=<jwt_token>&success=true
```

---

### 10.8 Save GitHub Token

**Endpoint**: `POST /api/auth/github-token`

**Access**: Protected (JWT required)

**Description**: Store GitHub access token for repository operations.

**Request Body**:

```json
{
  "githubAccessToken": "ghp_xxxxxxxxxxxxxxxxxxxx"
}
```

**Response** (200 OK):

```json
{
  "message": "GitHub token saved successfully"
}
```

**Error Responses**:

- 400: Missing token
- 401: Unauthorized

---

### 10.9 Get GitHub Token Status

**Endpoint**: `GET /api/auth/github-token/status`

**Access**: Protected (JWT required)

**Description**: Check if GitHub token is available for current user.

**Response** (200 OK):

```json
{
  "message": "Token status retrieved",
  "hasGitHubToken": true,
  "githubTokenValid": true
}
```
**Other Responses**:

- 200: Token is invalid or expired / No GitHub token configured
- 404: User not found

---

### 10.10 Remove GitHub Token

**Endpoint**: `DELETE /api/auth/github-token`

**Access**: Protected (JWT required)

**Description**: Remove stored GitHub access token.

**Response** (200 OK):

```json
{
  "message": "GitHub token removed successfully"
}
```

---

## 11. Project Management APIs

### 11.1 Create New Project

**Endpoint**: `POST /api/project`

**Access**: Protected (JWT + User role required)

**Description**: Create a new deployment project linked to a GitHub repository.

**Request Body**:

```json
{
  "gitRepositoryUrl": "https://github.com/username/repo.git",
  "project_id": "lowercase letters, numbers, hyphens only (regex:/^[a-z0-9-]+$/)",
  "buildConfig": {
    "installCmd": "npm install",
    "buildCmd": "npm run build",
    "buildRoot": "dist"
  },
  "environmentVariables": [
    {
      "key": "NODE_ENV",
      "value": "production"
    },
    {
      "key": "DATABASE_URL",
      "value": "mongodb+srv://..."
    }
  ]
}
```

**Response** (201 Created):

```json
{
  "message": "Project created successfully",
  "project": {
    "projectId": "proj_1693641600000",
    "gitRepositoryUrl": "https://github.com/username/repo.git",
    "status": "queued",
    "lastCommitHash": "lastCommitHash",
    "lastCommitMessage": "lastCommitMessage",
    "deployUrl": null,
    "autoRedeploy": false,
    "owner": {
      "userId": 1000,
      "name": "John Doe",
      "email": "john.doe@example.com"
    },
    "buildConfig": {
      "installCmd": "npm install",
      "buildCmd": "npm run build",
      "buildRoot": "dist"
    },
    "environmentVariables": [
      { "key": "NODE_ENV", "value": "production" },
      { "key": "DATABASE_URL", "value": "mongodb+srv://..." }
    ],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses**:

- 400: Missing or invalid repository URL
- 500: Failed to queue build task
- 502: Failed to queue ECS task

---

### 11.2 List User's Projects

**Endpoint**: `GET /api/project`

**Access**: Protected (JWT + User role required)

**Description**: Retrieve all projects owned by the current user.

**Query Parameters** (Optional):

```
?page=1&limit=20&status=all&sort=-createdAt
```

**Response** (200 OK):

```json
{
  "message": "Projects retrieved successfully",
  "projects": [
    {
      "projectId": "proj_1693641600000",
      "gitRepositoryUrl": "https://github.com/username/repo.git",
      "status": "finished",
      "deployUrl": "https://app-xyz.vercel.app",
      "autoRedeploy": true,
      "lastCommitHash": "abc123def456",
      "lastCommitMessage": "Add new features",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T12:45:30Z"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 20
  }
}
```

**Error Responses**:

- 401: Unauthorized
- 500: Server error

---

### 11.3 Get Project Details

**Endpoint**: `GET /api/project/:projectId`

**Access**: Protected (JWT required)

**Description**: Retrieve detailed information about a specific project.

**URL Parameters**:

```
:projectId - The unique project identifier
```

**Response** (200 OK):

```json
{
  "message": "Project retrieved successfully",
  "project": {
    "projectId": "proj_1693641600000",
    "gitRepositoryUrl": "https://github.com/username/repo.git",
    "deployUrl": "https://app-xyz.vercel.app",
    "status": "finished",
    "logsS3Key": "logs/proj_1693641600000/build-1234.log",
    "autoRedeploy": true,
    "webhookId": "123456789",
    "webhookSecret": "whsec_xxxxxxxxxxxx",
    "owner": {
      "userId": 1000,
      "name": "John Doe",
      "email": "john.doe@example.com"
    },
    "lastCommitHash": "abc123def456",
    "lastCommitMessage": "Add new features",
    "buildConfig": {
      "installCmd": "npm install",
      "buildCmd": "npm run build",
      "buildRoot": "dist"
    },
    "environmentVariables": [{ "key": "NODE_ENV", "value": "production" }],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T12:45:30Z"
  }
}
```

**Error Responses**:

- 401: Unauthorized
- 404: Project not found

---

### 11.4 Update Project

**Endpoint**: `PUT /api/project/:projectId`

**Access**: Protected (JWT + Owner or Admin required)

**Description**: Update project settings, build configuration, or environment variables.

**Request Body** (All fields optional):

```json
{
  "buildConfig": {
    "installCmd": "npm install",
    "buildCmd": "npm run build",
    "buildRoot": "dist"
  },
  "environmentVariables": [
    {
      "key": "API_URL",
      "value": "https://api.example.com"
    }
  ]
}
```

**Response** (200 OK):

```json
{
  "message": "Project updated successfully",
  "project": {
    "projectId": "proj_1693641600000",
    "buildConfig": {
      /* updated */
    },
    "environmentVariables": [
      /* updated */
    ]
  }
}
```

**Error Responses**:

- 400: Invalid update data
- 401: Unauthorized
- 403: Forbidden (not owner)
- 404: Project not found

---

### 11.5 Delete Project

**Endpoint**: `DELETE /api/project/:projectId`

**Access**: Protected (JWT + Owner or Admin required)

**Description**: Delete a project and all associated data.

**Response** (200 OK):

```json
{
  "message": "Project deleted successfully"
}
```

**Error Responses**:

- 401: Unauthorized
- 403: Forbidden
- 404: Project not found

---

## 12. Deployment APIs

### 12.1 Stream Live Logs

**Endpoint**: `GET /api/project/:projectId/logs/stream`

**Access**: Public (uses Server-Sent Events)

**Description**: Stream live build logs in real-time from CloudWatch.

**URL Parameters**:

```
:projectId - Project identifier
```

**Query Parameters** (Optional):

```
?logStream=deployment-123
```

**Response** (200 OK - Streaming):

```
data: [INFO] Starting build process...
data: [INFO] Installing dependencies...
data: [INFO] Running build command...
data: [SUCCESS] Build completed successfully
```

**Stream Format**:
Each log entry is sent as Server-Sent Event (SSE):

```
data: <log_line>
```

**Error Responses**:

- 404: ProjectId parameter not found
- 500: CloudWatch connection error

---

### 12.2 Get Archived Logs

**Endpoint**: `GET /api/project/:projectId/logs/archive`

**Access**: Public

**Description**: Retrieve archived build logs stored in S3.

**URL Parameters**:

```
:projectId - Project identifier
```

**Query Parameters** (Optional):

```
?buildId=1234&format=text
```

**Response** (200 OK):

```json
{
  "message": "Logs retrieved successfully",
  "logs": {
    "buildId": "build-1234",
    "projectId": "proj_1693641600000",
    "startTime": "2024-01-15T10:30:00Z",
    "endTime": "2024-01-15T10:45:30Z",
    "duration": "15m 30s",
    "status": "success",
    "logContent": "[INFO] Starting build...\n[INFO] Build completed\n",
    "s3Url": "https://s3.amazonaws.com/logs/..."
  }
}
```

**Error Responses**:

- 404: Project parameters not found
- 500: S3 retrieval error

---

### 12.3 Trigger Redeploy

**Endpoint**: `POST /api/project/:projectId/redeploy`

**Access**: Protected (JWT + Owner or Admin required)

**Description**: Manually trigger a redeployment of the project.

**Request Body** (Optional):

```json
{
  "commitHash": "abc123def456" // Deploy specific commit
}
```

**Response** (200 OK):

```json
{
  "message": "Redeploy triggered successfully",
  "deployment": {
    "deploymentId": "deploy-5678",
    "projectId": "proj_1693641600000",
    "status": "queued",
    "triggeredAt": "2024-01-15T10:50:00Z",
    "commitHash": "abc123def456 successful"
  }
}
```

**Error Responses**:

- 401: Unauthorized
- 403: Forbidden
- 404: Project not found
- 500: Failed to queue deployment

---

## 13. Webhook & Auto-Deployment APIs

### 13.1 Setup Webhook

**Endpoint**: `POST /api/project/:projectId/webhook/setup`

**Access**: Protected (JWT + Owner required)

**Description**: Configure webhook for automatic deployment on GitHub push events.

**Request Body**:

```json
{
  "provider": "github", // or "gitlab"
  "branch": "main" // Branch to watch for changes
}
```

**Response** (200 OK):

```json
{
  "message": "Webhook setup successfully",
  "webhook": {
    "webhookId": "ghhk_xxxxxxxxxxxx",
    "webhookSecret": "whsec_yyyyyyyyyy",
    "url": "https://api.sourcetolive.dev/api/webhook/github/proj_1693641600000",
    "events": ["push", "pull_request"],
    "active": true
  }
}
```

**Error Responses**:

- 400: GitHub access token not found/Failed to create webhook
- 401: Unauthorized
- 404: Project/User not found
- 500: Failed to setup webhook

---

### 13.2 Delete Webhook

**Endpoint**: `POST /api/project/:projectId/webhook/delete`

**Access**: Protected (JWT + Owner required)

**Description**: Remove webhook configuration and disable auto-deployment.

**Response** (200 OK):

```json
{
  "message": "✅ GitHub webhook deleted successfully"
}
```

**Error Responses**:

- 401: Unauthorized
- 404: Project/User not found

---

### 13.3 GitHub Webhook Receiver

**Endpoint**: `POST /api/webhook/github/:projectId`

**Access**: Public (Signature verification required)

**Description**: Receive GitHub push events and trigger automatic deployment.

**Headers**:

```
X-Hub-Signature-256: sha256=abc123...
```

**Request Body** (GitHub payload):

```json
{
  "ref": "refs/heads/main",
  "before": "abc123",
  "after": "def456",
  "commits": [
    {
      "id": "def456",
      "message": "Add new features",
      "author": {
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "pusher": {
    "name": "johndoe"
  }
}
```

**Response** (200 OK):

```json
{
  "message": "Webhook processed successfully",
  "deployment": {
    "projectId": "proj_1693641600000",
    "commitHash": "def456",
    "status": "queued"
  }
}
```

**Error Responses**:

- 400: Auto-redeploy not enabled for this project
- 401: Invalid signature
- 404: Project not found

---

### 13.4 GitLab Webhook Receiver

**Endpoint**: `POST /api/webhook/gitlab/:projectId`

**Access**: Public (Token verification required)

**Description**: Receive GitLab push events and trigger automatic deployment.

**Headers**:

```
X-Gitlab-Token: <webhook_token>
```

**Response** (200 OK):

```json
{
  "message": "GitLab webhook: Triggering redeploy for project",
  "deployment": {
    /* similar to GitHub */
  }
}
```

**Error Responses**:

- 401: Invalid tooken
- 404: Project not found
- 500: Failed to process webhook

---

### 13.5 Enable Auto-Redeploy

**Endpoint**: `POST /api/webhook/enable/:projectId`

**Access**: Protected (JWT + Owner required)

**Description**: Enable automatic redeployment on webhook events.

**Request Body** (Optional):

```json
{
  "branch": "main"
}
```

**Response** (200 OK):

```json
{
  "message": "Redeploy triggered successfully",
  "autoRedeploy": true
}
```

---

### 13.6 Disable Auto-Redeploy

**Endpoint**: `POST /api/webhook/disable/:projectId`

**Access**: Protected (JWT + Owner required)

**Description**: Disable automatic redeployment on webhook events.

**Response** (200 OK):

```json
{
  "message": "Auto-redeploy disabled successfully",
  "autoRedeploy": false
}
```

**Error Responses**:

- 400: Invalid git URL
- 401: Authentication failed User ID not found in token
- 404: Project/User not found

---

### 13.7 Get Webhook Status

**Endpoint**: `GET /api/webhook/status/:projectId`

**Access**: Protected (JWT + Owner required)

**Description**: Check webhook configuration and auto-redeploy status.

**Response** (200 OK):

```json
{
  "message": "Webhook status retrieved",
  "webhook": {
    "projectId": "proj_1693641600000",
    "autoRedeploy": true,
    "webhookId": "123456789",
    "webhookActive": true,
    "provider": "github",
    "lastTrigger": "2024-01-15T10:25:00Z",
    "triggerCount": 42
  }
}
```

**Error Responses**:

- 404: Project not found
- 500: Failed to get webhook status

---

### 13.8 Fetch GitHub Repositories

**Endpoint**: `GET /api/project/repositories/github`

**Access**: Protected (JWT + User role required)

**Description**: List all accessible GitHub repositories for the authenticated user.

**Query Parameters** (Optional):

```
?page=1&perPage=30&sort=name
```

**Response** (200 OK):

```json
{
  "message": "Repositories retrieved successfully",
  "repositories": [
    {
      "id": 123456789,
      "name": "my-app",
      "fullName": "johndoe/my-app",
      "url": "https://github.com/johndoe/my-app",
      "description": "My awesome application",
      "private": false,
      "language": "JavaScript",
      "starCount": 42
    }
  ],
  "pagination": {
    "page": 1,
    "perPage": 30,
    "total": 15
  }
}
```

**Error Responses**:

- 400: GitHub access token not found
- 401: User not authenticated/GitHub authentication failed
- 429: GitHub API error
- 500: Failed to fetch repositories

---

## 14. Deployment Workflow

### Standard Deployment Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT WORKFLOW                        │
└──────────────────────────────────────────────────────────────┘

1. USER INITIATES DEPLOYMENT
   └─► POST /api/project (create new project)
        └─► Frontend provides GitHub URL + build config

2. PROJECT QUEUING
   └─► Backend queues ECS build task
        └─► Project status: "queued"
        └─► Stored in MongoDB

3. BUILD EXECUTION (AWS ECS)
   └─► ECS cluster runs build container
        ├─► Clone repository
        ├─► Install dependencies (npm install, etc.)
        ├─► Run build command (npm run build, etc.)
        ├─► Upload to deployment platform
        └─► Progress logged to CloudWatch

4. LOG STREAMING
   └─► Frontend connects to /api/project/:id/logs/stream
        └─► Receives real-time logs via SSE
            ├─► Build steps
            ├─► Errors/warnings
            ├─► Deployment status

5. COMPLETION
   └─► Project status: "finished" or "failed"
        ├─► Logs archived to S3
        ├─► Deploy URL assigned
        └─► Webhook notified (optional)

6. AUTO-REDEPLOY (Optional)
   └─► GitHub/GitLab push event
        └─► Trigger POST /api/webhook/github/:projectId
            └─► Back to step 2
```

### Project Status Flow

```
queued → running → finished ✓
              └──→ failed ✗

Transitions:
- queued: Initial state when project is created
- running: Build container is executing
- finished: Deployment completed successfully
- failed: Build or deployment encountered an error
```

### Auto-Deployment Flow

```
1. Configure Webhook
   └─► POST /api/project/:projectId/webhook/setup
        └─► Retrieve webhook ID from GitHub/GitLab
        └─► Stored in project.webhookId

2. Enable Auto-Redeploy
   └─► POST /api/webhook/enable/:projectId
        └─► Set project.autoRedeploy = true

3. On Git Push
   └─► GitHub sends push event to webhook URL
        └─► POST /api/webhook/github/:projectId
            └─► Signature verification
            └─► If autoRedeploy enabled:
                └─► Trigger redeploy
                └─► Back to deployment workflow (step 2)
```

---

## 15. Error Handling & Status Codes

### HTTP Status Codes

| Code | Meaning               | Typical Use Case                        |
| ---- | --------------------- | --------------------------------------- |
| 200  | OK                    | Successful GET/PUT/DELETE               |
| 201  | Created               | Successful POST (resource created)      |
| 204  | No Content            | Successful DELETE (no response body)    |
| 400  | Bad Request           | Invalid request body/parameters         |
| 401  | Unauthorized          | Missing or invalid authentication token |
| 403  | Forbidden             | User lacks required permissions         |
| 404  | Not Found             | Resource doesn't exist                  |
| 409  | Conflict              | Resource already exists (duplicate)     |
| 429  | Too Many Requests     | Rate limit exceeded                     |
| 500  | Internal Server Error | Unexpected server error                 |
| 502  | Bad Gateway           | AWS/external service error              |
| 503  | Service Unavailable   | Server temporarily unavailable          |

### Error Response Format

```json
{
  "message": "User-friendly error message",
  "error": "Technical error details (development mode)",
  "status": 400
}
```

### Common Error Scenarios

#### Authentication Errors

**Missing Token**:

```json
{
  "message": "No authentication token provided",
  "status": 401
}
```

**Expired Token**:

```json
{
  "message": "Authentication token has expired",
  "status": 401
}
```

**Invalid Token**:

```json
{
  "message": "Invalid or malformed token",
  "status": 401
}
```

#### Validation Errors

**Missing Fields**:

```json
{
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Email is required" },
    { "field": "password", "message": "Password must be at least 8 characters" }
  ],
  "status": 400
}
```

**Invalid Email Format**:

```json
{
  "message": "Invalid email format",
  "status": 400
}
```

#### Resource Errors

**Not Found**:

```json
{
  "message": "Project not found",
  "status": 404
}
```

**Already Exists**:

```json
{
  "message": "User with this email already exists",
  "status": 409
}
```

---

## 16. Security Measures

### 1. Authentication & Authorization

✅ **JWT Token-Based Auth**

- Tokens issued on successful login/registration
- Verified on protected endpoints
- Expiration: 24 hours (configurable)
- Payload includes userId, email, role

✅ **Role-Based Access Control (RBAC)**

- User role: Can create and manage own projects
- Admin role: Full system access
- Middleware enforces role requirements

✅ **OAuth2 Integration**

- Google OAuth for social login
- GitHub OAuth with secure callback handling
- Token storage with encryption

### 2. Password Security

✅ **Bcrypt Hashing**

- Passwords hashed with bcrypt (rounds: 10+)
- Never stored in plain text
- Verification via bcrypt comparison

✅ **Password Requirements** (Recommended)

- Minimum 8 characters
- Mix of uppercase, lowercase, numbers, special characters
- No common passwords

### 3. Data Protection

✅ **CORS Protection**

- Whitelist allowed origins in `CORS_ORIGIN` config
- Credentials require explicit permission
- Prevents unauthorized cross-origin requests

✅ **HTTPS/TLS**

- All production traffic encrypted
- Certificate validation enforced
- No unsecured HTTP in production

✅ **Environment Variables**

- Sensitive data (.env file) not version controlled
- Separate configs for dev/production
- Database URLs, API keys, secrets encrypted

### 4. Token Security

✅ **JWT Signature Verification**

- All tokens signed with `JWT_SECRET`
- Tokens verified before accepting requests
- Signature tampering detected

✅ **Webhook Signature Verification**

- GitHub webhooks verified using HMAC-SHA256
- Header: `X-Hub-Signature-256`
- Prevents unauthorized webhook triggers

### 5. Input Validation

✅ **Request Validation**

- Email format validation
- URL validation for Git repositories
- OTP format verification
- Build command sanitization

✅ **MongoDB Injection Prevention**

- Mongoose schema validation
- Parameterized queries
- Input sanitization

---

## 17. Logging & Monitoring

### Request Logging (Morgan)

All HTTP requests are logged with:

- Request method (GET, POST, etc.)
- URL path and query parameters
- Response status code
- Response time
- Error details (if applicable)

**Log Format**:

```
GET /api/project 200 12.345 ms
POST /api/auth/login 401 5.123 ms
DELETE /api/project/proj_1234 200 8.456 ms
```

---

---

## 18. API Usage Examples

### 1. User Registration & Login Flow

**Step 1: Register User**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }'
```

**Response**:

```json
{
  "message": "OTP sent to your email",
  "userId": 1000,
  "devOtp": "123456"
}
```

**Step 2: Verify Registration**

```bash
curl -X POST http://localhost:3000/api/auth/register/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "123456",
    "password": "SecurePass123!"
  }'
```

**Response**:

```json
{
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 1000,
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Step 3: Get Current User**

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 2. Create and Deploy Project

**Step 1: Create Project**

```bash
curl -X POST http://localhost:3000/api/project \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "gitRepositoryUrl": "https://github.com/user/my-app.git",
    "buildConfig": {
      "installCmd": "npm install",
      "buildCmd": "npm run build",
      "buildRoot": "/"
    },
    "environmentVariables": [
      {
        "key": "NODE_ENV",
        "value": "production"
      }
    ]
  }'
```

**Response**:

```json
{
  "message": "Project created successfully",
  "project": {
    "projectId": "proj_1693641600000",
    "status": "queued",
    "gitRepositoryUrl": "https://github.com/user/my-app.git"
  }
}
```

**Step 2: Stream Deployment Logs**

```bash
curl -X GET http://localhost:3000/api/project/proj_1693641600000/logs/stream \
  -H "Accept: text/event-stream"
```

**Response** (Streaming):

```
data: [INFO] Cloning repository...
data: [INFO] Installing dependencies...
data: [INFO] Running build command...
data: [SUCCESS] Build completed
```

**Step 3: List Projects**

```bash
curl -X GET http://localhost:3000/api/project \
  -H "Authorization: Bearer <token>"
```

---

### 3. Setup Auto-Deployment with Webhook

**Step 1: Setup Webhook**

```bash
curl -X POST http://localhost:3000/api/project/proj_1693641600000/webhook/setup \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "github",
    "branch": "main"
  }'
```

**Response**:

```json
{
  "message": "Webhook setup successfully",
  "webhook": {
    "webhookId": "123456789",
    "url": "https://api.sourcetolive.dev/api/webhook/github/proj_1693641600000"
  }
}
```

**Step 2: Enable Auto-Redeploy**

```bash
curl -X POST http://localhost:3000/api/webhook/enable/proj_1693641600000 \
  -H "Authorization: Bearer <token>"
```

**Step 3: On Git Push (GitHub sends automatically)**

```bash
# GitHub sends POST request with deployment details
# API automatically queues redeploy if autoRedeploy is enabled
```

---

### 4. GitHub OAuth Integration

**Step 1: Redirect to GitHub**

```bash
curl -X GET http://localhost:3000/api/auth/github/oauth \
  -H "Authorization: Bearer <token>"
```

**Redirects to**:

```
https://github.com/login/oauth/authorize?client_id=...
```

**Step 2: GitHub Callback (automatic)**
The browser is redirected back to:

```
http://localhost:3000/api/auth/github/callback?code=...
```

**Step 3: Save GitHub Token**

```bash
curl -X POST http://localhost:3000/api/auth/github-token \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "githubAccessToken": "ghp_xxxxxxxxxxxx"
  }'
```

**Step 4: Fetch GitHub Repositories**

```bash
curl -X GET http://localhost:3000/api/project/repositories/github \
  -H "Authorization: Bearer <token>"
```

**Response**:

```json
{
  "message": "Repositories retrieved successfully",
  "repositories": [
    {
      "name": "my-app",
      "fullName": "johndoe/my-app",
      "url": "https://github.com/johndoe/my-app"
    }
  ]
}
```

---

## 19. Support & Contact Information

### Getting Help

#### Documentation

- **API Reference**: Read this documentation
- **Code Examples**: See "API Usage Examples" section above
- **Troubleshooting**: Check error codes in "Error Handling & Status Codes"

#### Contact Support

📧 **Email Support**

```
contact.sourcetolive@gmail.com
```

### Common Issues & Solutions

#### Issue: "Authentication token has expired"

**Solution**: Generate a new token by logging in again

#### Issue: "Project not found"

**Solution**: Verify the project ID is correct and belongs to your account

#### Issue: "Failed to send OTP email"

**Solution**: Check email configuration and SMTP credentials in `.env`

#### Issue: "Webhook signature invalid"

**Solution**: Ensure webhook secret matches in both GitHub and project settings

#### Issue: "Build fails with npm install error"

**Solution**: Check build configuration and environment variables in project settings

### Feedback & Suggestions

We'd love to hear your feedback!

- 📝 **Feature Requests**: Share ideas for new features
- 💡 **Improvements**: Suggest API improvements
- 🤝 **Partnerships**: Explore integration opportunities

---

**Last Updated**: February 12, 2026  
**API Version**: 1.0.0  
**Status**: Active & Under Development

For the latest updates, visit: https://github.com/sourcetolive/backend
