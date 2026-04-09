# SourceToLive

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
![Version](https://img.shields.io/badge/version-1.0-blue)
![Node version](https://img.shields.io/badge/node-%3E%3D18-green)

**SourceToLive** is a Git-to-live deployment platform that transforms connected GitHub repositories into managed projects with one-click deployment. Turn your code into a live application in three simple steps: connect a repository, configure your build, and deploy.

## 🚀 Features

- **One-Click Deployment** – Deploy from GitHub repositories in three steps
- **Live Build Logs** – Watch real-time build progress as it happens
- **Automatic Deployments** – GitHub webhook support for auto-redeploy on push
- **Build Configuration** – Customize install and build commands per project
- **Environment Variables** – Secure project-level environment configuration
- **Project Management** – Dashboard with search, status tracking, and project control
- **GitHub Integration** – OAuth authentication and repository access
- **Deployment URLs** – Instant custom URLs for every deployed project (e.g., `https://my-project.sourcetolive.app`)
- **User Profiles** – Account management with GitHub connection status
- **In-App Documentation** – API and app docs accessible directly in the UI
- **Responsive Design** – Works seamlessly on desktop and mobile

## 📋 Project Structure

```
SourceToLive/
├── Backend-Server/          # Node.js/Express API server
│   ├── config/             # Configuration management
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Auth and verification middleware
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API route definitions
│   ├── utils/             # Helper functions
│   ├── index.js           # Express app entry point
│   ├── cloudflared-config.yml
│   ├── package.json
│   └── TUNNEL_SETUP.md
├── Build-Server/           # Docker containerized build environment
│   ├── Dockerfile         # Container definition
│   ├── main.sh           # Build orchestration script
│   ├── script.js         # Build execution logic
│   └── package.json
├── client/                # React frontend (Vite)
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/        # Page-level components
│   │   ├── App.jsx       # Main app file
│   │   ├── index.css     # Global styles
│   │   └── main.jsx      # React entry point
│   ├── public/           # Static assets
│   ├── vite.config.js
│   ├── eslint.config.js
│   └── package.json
├── Reverse-Proxy/         # EC2-based reverse proxy for deployed apps
│   ├── index.js          # Proxy server logic
│   ├── package.json
│   └── 404.html
├── RAG-Server/           # Documentation and AI server
├── Docs/                 # Documentation
│   ├── APP_DOCUMENTATION.md
│   ├── API_DOCUMENTATION.md
│   └── ...
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- **React 19** – UI rendering and component architecture
- **Vite** – Next-gen build tool and dev server
- **React Router v7** – Client-side routing
- **Tailwind CSS** – Utility-first CSS framework
- **React Markdown** – Markdown rendering for docs
- **Google OAuth** – Third-party authentication

### Backend
- **Node.js + Express** – REST API server
- **MongoDB Atlas** – Document database (user accounts, projects, deployment history)
- **JWT (jsonwebtoken)** – Stateless authentication
- **AWS SDK** – Integration with AWS:
  - **ECS Fargate** – Serverless container orchestration for builds
  - **CloudWatch Logs** – Real-time build log streaming
  - **S3** – Build output storage
- **GitHub OAuth 2.0** – Third-party auth and API integration
- **Nodemailer + Resend** – Email delivery for OTP and notifications
- **Bcrypt** – Password hashing
- **Morgan** – HTTP request logging
- **CORS** – Cross-origin request handling

### Build System
- **Docker** – Containerized build environment
- **Node.js** (inside container) – Executes install/build commands

### Infrastructure
- **AWS ECS (Fargate)** – Serverless compute for builds
- **AWS CloudWatch** – Log management
- **AWS S3** – Static file storage
- **AWS EC2** – Reverse proxy for deployed apps
- **GitHub API** – Repository and webhook management
- **Cloudflare Tunnel** – Secure local development access (optional)

## 📦 Installation & Setup

### Prerequisites
- **Node.js** >= 18
- **npm** or **yarn**
- **MongoDB Atlas** account
- **AWS Account** (ECS, S3, CloudWatch, EC2)
- **GitHub OAuth Application** (for OAuth integration)
- **.env file** configured with required variables

### 1. Clone the Repository

```bash
git clone https://github.com/GovindSingh3011/SourceToLive.git
cd SourceToLive
```

### 2. Backend Setup

```bash
cd Backend-Server
npm install
```

Create a `.env` file in `Backend-Server/`:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sourcetolive

# CORS
CORS_ORIGIN=http://localhost:5173

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Email (Resend)
RESEND_API_KEY=your_resend_api_key

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:3000/api/auth/github/callback

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_ECS_CLUSTER=sourcetolive-cluster
AWS_ECS_TASK_DEFINITION=sourcetolive-build-task
AWS_ECR_REGISTRY=your_ecr_registry_url
AWS_S3_BUCKET=sourcetolive-builds

# Build
BUILD_TIMEOUT=900000  # 15 minutes in milliseconds
S3_BUCKET_REGION=us-east-1

# Application Domain
APP_DOMAIN=sourcetolive.dev
```

Start the backend server:

```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

The backend will be available at `http://localhost:3000`

### 3. Frontend Setup

```bash
cd client
npm install
```

Create a `.env.local` file in `client/`:

```env
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 4. Build Server (Optional - For Local Testing)

```bash
cd Build-Server
npm install
docker build -t sourcetolive-build .
```

## 🔌 API Routes

### Authentication Routes
```
POST   /api/auth/register              # Register new user
POST   /api/auth/register/verify       # Verify OTP and complete registration
POST   /api/auth/login                 # Login with credentials
POST   /api/auth/google                # Google OAuth login
GET    /api/auth/github/oauth          # Initiate GitHub OAuth flow
GET    /api/auth/github/callback       # GitHub OAuth callback
GET    /api/auth/me                    # Get current user info
POST   /api/auth/github-token          # Save GitHub personal access token
GET    /api/auth/github-token/status   # Check GitHub connection status
DELETE /api/auth/github-token          # Disconnect GitHub
```

### Project Routes
```
GET    /api/project                    # List all user projects
POST   /api/project                    # Create new project
GET    /api/project/:projectId         # Get project details
PUT    /api/project/:projectId         # Update project configuration
DELETE /api/project/:projectId         # Delete project
GET    /api/project/:projectId/logs/stream     # Stream live build logs (EventSource)
GET    /api/project/:projectId/logs/archive    # Get archived build logs
POST   /api/project/:projectId/redeploy        # Trigger manual redeploy
GET    /api/project/repositories/github        # Fetch user's GitHub repositories
```

### Webhook Routes
```
POST   /api/webhook/github/:projectId  # GitHub webhook trigger
POST   /api/webhook/gitlab/:projectId  # GitLab webhook trigger
POST   /api/webhook/enable/:projectId  # Enable auto-redeploy
POST   /api/webhook/disable/:projectId # Disable auto-redeploy
GET    /api/webhook/status/:projectId  # Get webhook status
```

## 📖 Frontend Routes

```
/                    # Home / Landing page
/login              # User login
/signup             # User registration with OTP
/dashboard          # Projects dashboard
/create-project     # 3-step deployment wizard
/project/:projectId # Project detail & logs view
/project/:projectId/settings  # Project configuration
/profile            # User account & GitHub settings
/about              # About and team page
/api-docs           # API documentation
/app-docs           # App documentation
```

## 🔐 Authentication

### JWT Bearer Token
All protected endpoints require authorization header:
```
Authorization: Bearer <jwt_token>
```

### OAuth Flows
- **Google OAuth** – Easy signup/login alternative
- **GitHub OAuth** – Access user's repositories and create webhooks

### Session Management
- Token stored in browser `localStorage` as `token`
- Protected routes redirect to `/login` if unauthenticated
- No automatic token refresh; user remains logged in until token expires

## 🚀 Deployment Lifecycle

### Step-by-Step Flow
1. **User Creates Project** – Provides GitHub repo URL and build configuration
2. **Backend Validation** – Validates repo, project ID, and user permissions
3. **ECS Build Task Queued** – Project sent to AWS ECS as containerized task
4. **Build Execution** – Container clones repo, installs dependencies, builds project
5. **Live Log Streaming** – Frontend streams CloudWatch logs in real-time via EventSource
6. **S3 Upload** – Build output uploaded to S3 bucket for CDN-ready hosting
7. **URL Activation** – Deployment URL (`https://<projectId>.<domain>`) becomes active
8. **Project Dashboard** – Project appears in user's dashboard with status and URL

### Deployment States
- `queued` – Waiting for build to start
- `running` – Build in progress (logs streaming)
- `finished` – Build completed, deployment live
- `failed` – Build failed (logs show error details)

## 📊 Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  email: String,
  password: String (hashed),
  displayName: String,
  avatar: String,
  githubToken: String (encrypted),
  isVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Project Model
```javascript
{
  _id: ObjectId,
  projectId: String (unique per user),
  name: String,
  repositoryUrl: String,
  branch: String,
  installCommand: String,
  buildCommand: String,
  buildOutputDirectory: String,
  environmentVariables: Object,
  owner: { userId: ObjectId },
  status: String (queued, running, finished, failed),
  deploymentUrl: String,
  deploymentTimestamps: {
    created: Date,
    started: Date,
    completed: Date
  },
  webhookEnabled: Boolean,
  webhookId: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Environment Variables

### Backend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT signing | `your_secret` |
| `GITHUB_CLIENT_ID` | GitHub OAuth app ID | From GitHub settings |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret | From GitHub settings |
| `AWS_REGION` | AWS region for services | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | AWS access key | From AWS IAM |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | From AWS IAM |
| `AWS_S3_BUCKET` | S3 bucket for build output | `sourcetolive-builds` |

### Frontend (.env.local)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID | From Google Console |

## 🧪 Development

### Running Both Servers Locally

```bash
# Terminal 1 - Backend
cd Backend-Server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### Building for Production

**Frontend:**
```bash
cd client
npm run build
# Output: dist/
```

**Backend:**
- No build needed; runs Node.js directly

### Linting & Code Quality

**Frontend:**
```bash
cd client
npm run lint
```

## 📚 Documentation

- **[App Documentation](./Docs/APP_DOCUMENTATION.md)** – User-facing app guide
- **[API Documentation](./Docs/API_DOCUMENTATION.md)** – Detailed API reference

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and commit: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

### Commit Message Guidelines

Follow conventional commit format for consistency:
```
type(scope): subject

- feat: new feature
- fix: bug fix
- docs: documentation changes
- style: code style (no logic change)
- refactor: code refactoring
- test: adding tests
- chore: build, dependencies, tooling
```

Example:
```
feat(auth): add GitHub OAuth login
fix(dashboard): resolve project search filtering
docs: update API documentation
```

## 📋 Limitations & Future Scope

### Current Limitations
- No rollback to previous deployments
- Single deployment per project (overwrites on redeploy)
- No team collaboration or shared projects
- No build caching or optimization
- No custom domains (CNAME support)
- No advanced monitoring or metrics

### Planned Features
- Deployment rollback
- Team members and collaboration
- Build caching and optimization
- Custom domain support
- Advanced monitoring and alerts
- Email notifications
- Staging environments
- RAG (Retrieval-Augmented Generation) for AI-powered platform guidance – Assist users and developers with intelligent cloud-hosted documentation and real-time platform assistance

## 🔒 Security & Privacy

- **Passwords** – Hashed with bcrypt
- **Tokens** – Encrypted at rest and in transit
- **GitHub tokens** – Encrypted in MongoDB
- **Environment variables** – Secure storage (improvement: add encryption at rest)
- **CORS** – Origin validation on all cross-origin requests
- **HTTPS/TLS** – All production connections encrypted
- **Input validation** – All user inputs validated before processing

## 👥 Team & Contributors

SourceToLive is built by BTech CSE final-year students focused on practical deployment workflows and cloud infrastructure.

- [Govind Singh](https://www.linkedin.com/in/govindsingh3011/)
- [Soumya Kumar Gupta](https://www.linkedin.com/in/soumyakumargupta/)
- [Vansh Agarwal](https://www.linkedin.com/in/vansh-agarwal-66771925a/)
- [Aviral Mishra](https://www.linkedin.com/in/aviral-mishra-bb5706262/)
- [Akshat Kushwaha](https://www.linkedin.com/in/akshat-kushwaha-08a448274/)
- [Jatin Kumar](https://www.linkedin.com/in/jatin-kumarx-54734524a/)

## 📄 License

This project is licensed under the **Apache License 2.0** – see the [LICENSE](LICENSE) file for details.

Apache 2.0 provides:
- ✅ **Patent Protection** – Explicit patent grant from contributors
- ✅ **Commercial Use** – Allowed for commercial applications
- ✅ **Modification** – You can modify the code
- ✅ **Distribution** – You can distribute modified versions
- ✅ **Sublicensing** – You can sublicense the software
- ✅ **Same License** – Requires modified versions to use same license

## 📞 Support

For issues, questions, or suggestions:
- Open an [Issue](https://github.com/GovindSingh3011/SourceToLive/issues)
- Check existing [Documentation](./Docs/APP_DOCUMENTATION.md)
- Review the [API Documentation](./Docs/API_DOCUMENTATION.md)

---

**Last Updated:** April 8, 2026  
**Version:** 1.0  

**Deploy your code with confidence. SourceToLive makes it simple.**
