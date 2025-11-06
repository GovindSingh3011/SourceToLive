# 🚀 SourceToLive - Backend Server

**Complete Backend API with Authentication, AWS Integration & Deployment Management**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Features](#features)
4. [Tech Stack](#tech-stack)
5. [Project Structure](#project-structure)
6. [Installation](#installation)
7. [Environment Configuration](#environment-configuration)
8. [API Endpoints](#api-endpoints)
9. [Authentication System](#authentication-system)
10. [CloudWatch Integration](#cloudwatch-integration)
11. [Frontend Connection](#frontend-connection)
12. [AWS Services](#aws-services)
13. [Testing](#testing)
14. [Deployment](#deployment)
15. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The SourceToLive Backend Server is a comprehensive Node.js/Express API that handles:

- ✅ **User Authentication** - Email/password + Google OAuth
- ✅ **JWT Token Management** - Secure session handling  
- ✅ **Project Deployment** - AWS ECS task orchestration
- ✅ **Real-time Logs** - Server-Sent Events (SSE) streaming
- ✅ **CloudWatch Integration** - AWS logging and monitoring
- ✅ **MongoDB Database** - User and project data storage
- ✅ **Email Verification** - OTP-based registration

**Current Status:** ✅ Production-ready with 266 packages, 0 vulnerabilities

---

## 🚀 Quick Start

### Start Development Server

```powershell
cd Backend-Server
npm install          # First time only
npm run dev          # Development with auto-reload
```

**Server runs on:** http://localhost:3000

### Start with Frontend

**Terminal 1 - Backend:**
```powershell
cd Backend-Server
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd ../client
npm run dev
```

**Access:**
- Backend API: http://localhost:3000/api
- Frontend UI: http://localhost:5173
- Health Check: http://localhost:3000

---

## ✨ Features

### Authentication
- ✅ Email/Password registration with OTP verification
- ✅ Google OAuth 2.0 integration
- ✅ JWT token-based sessions (7-day expiry)
- ✅ Password hashing with bcrypt
- ✅ Email verification via Nodemailer

### Deployment Management
- ✅ Create deployments via GitHub repositories
- ✅ AWS ECS task orchestration
- ✅ Real-time log streaming (Server-Sent Events)
- ✅ S3 artifact storage
- ✅ CloudWatch log archival

### API Features
- ✅ RESTful endpoints with `/api` prefix
- ✅ CORS configured for frontend
- ✅ Request logging with Morgan
- ✅ Health check endpoints
- ✅ API documentation endpoint

### AWS Integration
- ✅ ECS (Elastic Container Service) - Container orchestration
- ✅ CloudWatch Logs - Centralized logging
- ✅ S3 - File storage
- ✅ Automatic log archival and cleanup

---

## 🛠️ Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Runtime** | Node.js | 20.18.0+ |
| **Framework** | Express | 5.1.0 |
| **Database** | MongoDB + Mongoose | 8.19.2 |
| **Authentication** | JWT + bcrypt | Latest |
| **Email** | Nodemailer | 7.0.10 |
| **AWS SDK** | ECS, S3, CloudWatch | 3.922.0 |
| **Logging** | Morgan | 1.10.1 |
| **Dev Tools** | Nodemon | 3.1.10 |

**Total Packages:** 266 (0 vulnerabilities ✅)

---

## 📁 Project Structure

```
Backend-Server/
├── index.js                      # Main server entry point
├── package.json                  # Dependencies (266 packages)
├── .env                          # Environment variables (not in git)
├── .env.example                  # Environment template
│
├── config/
│   └── index.js                  # Centralized configuration
│
├── controllers/
│   ├── authController.js         # Authentication logic
│   └── projectController.js      # Deployment & log management
│
├── models/
│   ├── User.js                   # User schema (MongoDB)
│   └── Admin.js                  # Admin schema
│
├── middleware/
│   ├── verifyToken.js           # JWT verification
│   ├── isUser.js                # User role check
│   └── isAdmin.js               # Admin role check
│
├── routes/
│   ├── authRoutes.js            # /api/auth/* endpoints
│   └── project.js               # /api/project/* endpoints
│
└── utils/
    ├── emailTransporter.js      # Email service setup
    ├── generateOTP.js           # OTP generation
    └── generateToken.js         # JWT creation
```

---

## 📦 Installation

### 1. Clone & Install

```powershell
cd Backend-Server
npm install
```

**Installs:**
- Express framework
- MongoDB driver (Mongoose)
- AWS SDK (ECS, S3, CloudWatch)
- Authentication packages (JWT, bcrypt)
- Email service (Nodemailer)
- Development tools (Nodemon)

### 2. CloudWatch Package (Already Installed)

```powershell
# CloudWatch package is already installed
npm list @aws-sdk/client-cloudwatch-logs
```

**Output:**
```
@aws-sdk/client-cloudwatch-logs@3.922.0
✅ 34 CloudWatch-related packages installed
```

---

## ⚙️ Environment Configuration

### Create `.env` file in Backend-Server directory:

```env
# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=3000
NODE_ENV=development

# ============================================
# CORS CONFIGURATION
# ============================================
# Allow frontend on localhost:5173 + production domains
CORS_ORIGIN=http://localhost:5173,https://sourcetolive.dev,https://www.sourcetolive.dev

# ============================================
# DATABASE CONFIGURATION
# ============================================
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority

# ============================================
# JWT CONFIGURATION
# ============================================
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRY=7d

# ============================================
# EMAIL CONFIGURATION
# ============================================
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_FROM=noreply@sourcetolive.com

# ============================================
# GOOGLE OAUTH CONFIGURATION
# ============================================
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

# ============================================
# AWS CONFIGURATION
# ============================================
AWS_REGION=us-east-1
CLUSTER=arn:aws:ecs:region:account-id:cluster/cluster-name
TASK=arn:aws:ecs:region:account-id:task-definition/task-name:version
AWS_SUBNETS=subnet-xxx,subnet-yyy,subnet-zzz
AWS_SECURITY_GROUPS=sg-xxxxx
APP_DOMAIN=localhost:8000
BASE_PATH=

# ============================================
# CLOUDWATCH CONFIGURATION
# ============================================
CLOUDWATCH_LOG_GROUP=/aws/sourcetolive/app
CLOUDWATCH_LOG_STREAM=backend-server
```

### Configuration Details:

#### MongoDB URI
Get from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas):
1. Create cluster
2. Create database user
3. Get connection string
4. Replace `<password>` and database name

#### JWT Secret
Generate secure secret:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Gmail App Password
1. Enable 2FA on Google Account
2. Go to: https://myaccount.google.com/apppasswords
3. Create "App Password" for "Mail"
4. Use generated password in `.env`

#### Google OAuth Client ID
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URIs
4. Copy Client ID

#### AWS Configuration
From your AWS Console:
- ECS Cluster ARN
- ECS Task Definition ARN
- VPC Subnets (comma-separated)
- Security Groups

---

## 🔌 API Endpoints

### Base URL: `http://localhost:3000/api`

### 📊 Health & Info

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/` | GET | Health check | No |
| `/api` | GET | API documentation | No |

**Example:**
```powershell
curl http://localhost:3000
```

**Response:**
```json
{
  "status": "running",
  "message": "Backend Server is running",
  "endpoints": {
    "auth": "/api/auth",
    "project": "/api/project"
  }
}
```

---

### 🔐 Authentication Endpoints

**Base:** `/api/auth`

#### 1. Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "username": "johndoe"
}
```

**Response:**
```json
{
  "message": "OTP sent to email. Please verify.",
  "email": "user@example.com"
}
```

#### 2. Verify Registration (OTP)
```http
POST /api/auth/register/verify
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 1,
    "email": "user@example.com",
    "username": "johndoe"
  }
}
```

#### 3. Login (Email/Password)
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "authProvider": "email"
  }
}
```

#### 4. Google OAuth Login
```http
POST /api/auth/google
Content-Type: application/json

{
  "credential": "google-jwt-token-from-frontend"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 2,
    "email": "user@gmail.com",
    "username": "Google User",
    "authProvider": "google"
  }
}
```

---

### 🚀 Project/Deployment Endpoints

**Base:** `/api/project`

#### 1. Create Deployment
```http
POST /api/project
Content-Type: application/json

{
  "GIT_REPOSITORY__URL": "https://github.com/username/repository",
  "PROJECT_ID": "my-project-123"
}
```

**Response:**
```json
{
  "data": {
    "taskArn": "arn:aws:ecs:us-east-1:123456789:task/cluster/abc123",
    "url": "http://my-project-123.localhost:8000"
  }
}
```

#### 2. Stream Deployment Logs (SSE)
```http
GET /api/project/:projectId/logs/stream
```

**Server-Sent Events Stream:**
```
data: {"message":"Starting build...","ts":1699999999}

data: {"message":"Installing dependencies...","ts":1699999999}

data: {"message":"Build complete!","ts":1699999999,"status":"finished"}
```

**Frontend Usage:**
```javascript
const eventSource = new EventSource(
  'http://localhost:3000/api/project/my-project-123/logs/stream'
);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data.message);
  
  if (data.status === 'finished') {
    eventSource.close();
  }
};
```

#### 3. Get Archived Logs
```http
GET /api/project/:projectId/logs/archive
```

**Response:**
```json
{
  "logs": [
    {
      "timestamp": 1699999999000,
      "message": "Build started"
    },
    {
      "timestamp": 1699999999500,
      "message": "Installing dependencies"
    }
  ]
}
```

---

## 🔐 Authentication System

### How It Works

```
┌─────────────────┐
│  1. Register    │
│  (Email + Pass) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  2. OTP Sent    │
│  via Email      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  3. Verify OTP  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  4. User Created│
│  + JWT Token    │
└─────────────────┘
```

### JWT Token

**Format:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsImlhdCI6MTY5OTk5OTk5OSwiZXhwIjoxNzAwNjA0Nzk5fQ.signature
```

**Payload:**
```json
{
  "userId": 1,
  "email": "user@example.com",
  "iat": 1699999999,
  "exp": 1700604799
}
```

**Expiry:** 7 days (configurable in `.env`)

### Using JWT in Requests

```http
GET /api/protected-route
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Middleware:** `verifyToken.js` automatically validates tokens

---

## ☁️ CloudWatch Integration

### Overview

CloudWatch is **already integrated** in the backend for:
- ✅ Deployment log collection
- ✅ Real-time log streaming
- ✅ Log archival to S3
- ✅ Error tracking

### Package Status

```powershell
npm list @aws-sdk/client-cloudwatch-logs
```

**Installed:**
- `@aws-sdk/client-cloudwatch-logs@3.922.0`
- 34 related dependencies
- 0 vulnerabilities ✅

### Configuration

**In `.env`:**
```env
CLOUDWATCH_LOG_GROUP=/aws/sourcetolive/app
CLOUDWATCH_LOG_STREAM=backend-server
```

**In `config/index.js`:**
```javascript
module.exports = {
  CLOUDWATCH_LOG_GROUP: process.env.CLOUDWATCH_LOG_GROUP || '/aws/sourcetolive/app',
  CLOUDWATCH_LOG_STREAM: process.env.CLOUDWATCH_LOG_STREAM || 'backend-server',
};
```

### Usage in Code

**Already implemented in `projectController.js`:**

```javascript
const { CloudWatchLogsClient, GetLogEventsCommand } = 
  require('@aws-sdk/client-cloudwatch-logs');

const logsClient = new CloudWatchLogsClient({ 
  region: config.AWS_REGION 
});

// Fetch logs from CloudWatch
async function flushAndArchiveLogs(logGroupName, logStreamName, projectId) {
  const params = { logGroupName, logStreamName, startFromHead: true };
  const resp = await logsClient.send(new GetLogEventsCommand(params));
  
  // Process and archive logs
  // ...
}
```

### Custom Logging (Optional)

Add CloudWatch logging to any controller:

```javascript
const { CloudWatchLogsClient, PutLogEventsCommand } = 
  require('@aws-sdk/client-cloudwatch-logs');

async function logToCloudWatch(message) {
  const params = {
    logGroupName: config.CLOUDWATCH_LOG_GROUP,
    logStreamName: config.CLOUDWATCH_LOG_STREAM,
    logEvents: [{
      message: JSON.stringify(message),
      timestamp: Date.now()
    }]
  };
  
  const command = new PutLogEventsCommand(params);
  await logsClient.send(command);
}

// Usage:
await logToCloudWatch({
  level: 'INFO',
  event: 'USER_LOGIN',
  userId: user.userId,
  timestamp: new Date().toISOString()
});
```

### Use Cases

1. **Deployment Logs** - Automatic (already implemented)
2. **Authentication Events** - Track login/register
3. **Error Tracking** - Log exceptions
4. **API Monitoring** - Track request/response
5. **Database Operations** - Log queries

---

## 🔗 Frontend Connection

### CORS Configuration

**Configured to allow:**
- `http://localhost:5173` - React dev server ✅
- `https://sourcetolive.dev` - Production
- `https://www.sourcetolive.dev` - Production www

**In `.env`:**
```env
CORS_ORIGIN=http://localhost:5173,https://sourcetolive.dev,https://www.sourcetolive.dev
```

**Settings:**
- Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
- Headers: Content-Type, Authorization
- Credentials: Enabled

### Frontend Integration

**React Frontend (`client/src/App.jsx`) already uses correct endpoints:**

```javascript
// Create deployment
const response = await fetch('http://localhost:3000/api/project', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    GIT_REPOSITORY__URL: gitUrl,
    PROJECT_ID: projectId,
  }),
});

// Stream logs
const eventSource = new EventSource(
  `http://localhost:3000/api/project/${projectId}/logs/stream`
);
```

### Running Together

**Terminal 1 - Backend:**
```powershell
cd Backend-Server
npm run dev
# Runs on http://localhost:3000
```

**Terminal 2 - Frontend:**
```powershell
cd client
npm run dev
# Runs on http://localhost:5173
```

**Test:**
1. Open http://localhost:5173
2. Enter GitHub URL and Project ID
3. Click "Publish"
4. Watch logs stream in real-time ✅

---

## ☁️ AWS Services

### ECS (Elastic Container Service)

**Purpose:** Run build tasks in containers

**Configuration:**
```env
CLUSTER=arn:aws:ecs:us-east-1:123456789:cluster/SourceToLive-Builder
TASK=arn:aws:ecs:us-east-1:123456789:task-definition/BuilderTask:2
```

**Usage:** Automatically triggered when creating deployments

### CloudWatch Logs

**Purpose:** Centralized logging and monitoring

**Configuration:**
```env
CLOUDWATCH_LOG_GROUP=/aws/sourcetolive/app
CLOUDWATCH_LOG_STREAM=backend-server
```

**Usage:** Automatic log collection from ECS tasks

### S3 (Simple Storage Service)

**Purpose:** Store build artifacts and archived logs

**Configuration:**
```env
AWS_REGION=us-east-1
```

**Usage:** Automatic upload of build outputs

---

## 🧪 Testing

### 1. Test Health Check

```powershell
curl http://localhost:3000
```

**Expected:**
```json
{
  "status": "running",
  "message": "Backend Server is running"
}
```

### 2. Test API Documentation

```powershell
curl http://localhost:3000/api
```

**Expected:**
```json
{
  "version": "1.0.0",
  "endpoints": { ... }
}
```

### 3. Test User Registration

```powershell
curl -X POST http://localhost:3000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "username": "testuser"
  }'
```

**Expected:**
```json
{
  "message": "OTP sent to email. Please verify.",
  "email": "test@example.com"
}
```

### 4. Test Deployment Creation

```powershell
curl -X POST http://localhost:3000/api/project `
  -H "Content-Type: application/json" `
  -d '{
    "GIT_REPOSITORY__URL": "https://github.com/user/repo",
    "PROJECT_ID": "test-project"
  }'
```

**Expected:**
```json
{
  "data": {
    "taskArn": "arn:aws:ecs:...",
    "url": "http://test-project.localhost:8000"
  }
}
```

### 5. Test Log Streaming

```powershell
curl http://localhost:3000/api/project/test-project/logs/stream
```

**Expected:** SSE stream of deployment logs

---

## 🚀 Deployment

### Production Checklist

- ✅ Set `NODE_ENV=production` in `.env`
- ✅ Use strong `JWT_SECRET` (32+ characters)
- ✅ Configure MongoDB Atlas whitelist IPs
- ✅ Set production CORS origins
- ✅ Use Gmail App Password for email
- ✅ Configure AWS credentials
- ✅ Set CloudWatch log groups
- ✅ Enable HTTPS (use reverse proxy)
- ✅ Set up monitoring and alerts

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
MONGODB_URI=mongodb+srv://prod-user:strong-password@cluster.mongodb.net/production-db
JWT_SECRET=very-long-random-secret-key-min-32-characters
# ... other production values
```

### Run in Production

```powershell
npm start  # Uses `node index.js` (no auto-reload)
```

### Using PM2 (Recommended)

```powershell
npm install -g pm2

# Start
pm2 start index.js --name sourcetolive-backend

# Monitor
pm2 logs sourcetolive-backend
pm2 monit

# Restart
pm2 restart sourcetolive-backend

# Stop
pm2 stop sourcetolive-backend
```

---

## 🔧 Troubleshooting

### Issue: "Cannot find module '@aws-sdk/client-cloudwatch-logs'"

**Cause:** CloudWatch package not installed

**Solution:**
```powershell
npm install @aws-sdk/client-cloudwatch-logs@^3.922.0
```

### Issue: "MongoDB connection error"

**Cause:** Invalid connection string or network issue

**Solution:**
1. Check `MONGODB_URI` in `.env`
2. Verify MongoDB Atlas whitelist includes your IP
3. Test connection string in MongoDB Compass

### Issue: "CORS policy: No 'Access-Control-Allow-Origin'"

**Cause:** Frontend URL not in CORS_ORIGIN

**Solution:**
```env
CORS_ORIGIN=http://localhost:5173
```
Restart server after changing `.env`

### Issue: "Email not sending"

**Cause:** Invalid Gmail credentials or 2FA not enabled

**Solution:**
1. Enable 2FA on Google Account
2. Create App Password: https://myaccount.google.com/apppasswords
3. Use App Password in `EMAIL_PASSWORD`
4. Check `EMAIL_USER` is correct Gmail address

### Issue: "JWT token expired"

**Cause:** Token older than JWT_EXPIRY setting

**Solution:**
1. User must login again to get new token
2. Adjust `JWT_EXPIRY` in `.env` if needed (default: 7d)

### Issue: "ECS task failed to start"

**Cause:** Invalid AWS configuration or insufficient permissions

**Solution:**
1. Verify AWS credentials have ECS permissions
2. Check task definition ARN is correct
3. Verify subnets and security groups exist
4. Check CloudWatch logs for ECS errors

### Issue: "Server won't start"

**Cause:** Port already in use or missing dependencies

**Solution:**
```powershell
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill process if needed
taskkill /PID <PID> /F

# Reinstall dependencies
rm -r node_modules
npm install
```

---

## 📊 Package Information

**Total Packages:** 266  
**Vulnerabilities:** 0 ✅  
**Node Version:** 20.18.0+  
**NPM Version:** Latest

### Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| express | 5.1.0 | Web framework |
| mongoose | 8.19.2 | MongoDB ODM |
| jsonwebtoken | 9.0.2 | JWT tokens |
| bcrypt | 6.0.0 | Password hashing |
| nodemailer | 7.0.10 | Email service |
| @aws-sdk/client-ecs | 3.922.0 | AWS ECS |
| @aws-sdk/client-s3 | 3.922.0 | AWS S3 |
| @aws-sdk/client-cloudwatch-logs | 3.922.0 | AWS CloudWatch |
| cors | 2.8.5 | CORS middleware |
| morgan | 1.10.1 | HTTP logging |
| dotenv | 17.2.3 | Environment vars |
| nodemon | 3.1.10 | Dev auto-reload |

---

## 📚 Additional Resources

### Official Documentation
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/docs/)
- [Mongoose](https://mongoosejs.com/)
- [JWT](https://jwt.io/)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)
- [Nodemailer](https://nodemailer.com/)

### Related Repositories
- Frontend: `../client/`
- Build Server: `../Build-Server/`
- Reverse Proxy: `../Reverse-Proxy/`

---

## 🎯 Summary

This backend server provides:

✅ **Complete Authentication System**
- Email/password with OTP
- Google OAuth integration
- JWT token management

✅ **Deployment Management**
- AWS ECS orchestration
- Real-time log streaming
- S3 artifact storage

✅ **AWS Integration**
- CloudWatch logging (already installed & configured)
- ECS task management
- S3 file storage

✅ **Production Ready**
- 266 packages, 0 vulnerabilities
- Comprehensive error handling
- CORS configured
- Environment-based config

✅ **Developer Friendly**
- Clear API documentation
- Health check endpoints
- Auto-reload in development
- Detailed error messages

---

## 🆘 Support

**Issues?** Check:
1. This README (troubleshooting section)
2. `.env` configuration
3. MongoDB connection
4. AWS credentials
5. Node.js version (20.18.0+)

**Quick Tests:**
```powershell
# Health check
curl http://localhost:3000

# API info
curl http://localhost:3000/api

# Check CloudWatch package
npm list @aws-sdk/client-cloudwatch-logs
```

---

**Last Updated:** January 2025  
**Version:** 1.0  
**Status:** ✅ Production Ready  
**CloudWatch:** ⭐ Installed & Configured

**Happy Coding! 🚀**
