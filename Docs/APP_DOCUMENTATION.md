# SourceToLive App Documentation

**Version:** 1.0  
**Last Updated:** April 8, 2026

## Table of Contents

1. [Introduction & App Overview](#1-introduction--app-overview)
2. [Purpose & Scope](#2-purpose--scope)
3. [Application Access & Environments](#3-application-access--environments)
4. [Routes & Pages](#4-routes--pages)
5. [Authentication & Session Handling](#5-authentication--session-handling)
6. [Frontend Architecture Overview](#6-frontend-architecture-overview)
7. [Backend & System Mapping](#7-backend--system-mapping)
8. [Deployment Lifecycle](#8-deployment-lifecycle)
9. [Technology Stack](#9-technology-stack)
10. [Navigation & Layout](#10-navigation--layout)
11. [Primary User Flows](#11-primary-user-flows)
12. [Example User Journey](#12-example-user-journey)
13. [Page Guide](#13-page-guide)
14. [Data Handling & State Management](#14-data-handling--state-management)
15. [Error Handling & Empty States](#15-error-handling--empty-states)
16. [Limitations](#16-limitations)
17. [Security Considerations](#17-security-considerations)
18. [Responsive Design & Accessibility](#18-responsive-design--accessibility)
19. [Team & Contributors](#19-team--contributors)
20. [Support & Reference Links](#20-support--reference-links)

---

## 1. Introduction & App Overview

SourceToLive is a browser-based deployment experience that turns a connected Git repository into a managed project inside the frontend interface. This documentation focuses on the frontend application only: what users see, how they move between pages, how deployment actions are initiated, and how the UI reflects the platform described in the project report.

The frontend is intentionally dashboard-driven and supports the main product flow described in the report: connect a repository, configure a build, deploy, and monitor the result. It also exposes the documentation pages used by the app itself.

The UI is centered around:

- A marketing landing page for new users
- Email/password signup and login
- A project dashboard with search and project cards
- A three-step project creation flow
- Project detail, settings, and profile pages
- In-app API and app documentation readers

---

## 2. Purpose & Scope

### Core Objectives

- Present a simple path from repository to live deployment
- Let users create and manage deployment projects from the UI
- Surface deployment status, deployment URLs, and logs
- Provide account management and GitHub integration controls
- Keep the docs visible inside the app through dedicated routes

### What This App Covers

- Landing and about pages
- Login and signup flows
- Dashboard search and project listing
- Create project wizard
- Project detail and settings screens
- Profile and GitHub connection management
- Markdown-based app and API documentation pages

### What This App Does Not Cover

- Backend route implementation details
- AWS infrastructure provisioning steps
- Docker build internals
- Database schema definitions

---

## 3. Application Access & Environments

### Development

```text
http://localhost:5173
```

### Production

```text
Production frontend URL
```

### Backend API Base

The frontend reads the API host from `VITE_API_URL` and falls back to:

```text
http://localhost:3000
```

### Environment Notes

| Environment | Frontend URL | Backend API URL | Purpose |
| --- | --- | --- | --- |
| Development | http://localhost:5173 | http://localhost:3000 | Local development |
| Production | Deployed frontend address | Production API endpoint | Live user access |

---

## 4. Routes & Pages

The frontend routes are defined in [client/src/App.jsx](../client/src/App.jsx).

| Route | Page | Purpose |
| --- | --- | --- |
| `/` | Home | Marketing landing page |
| `/login` | Login | Sign in with credentials and OAuth |
| `/signup` | Signup | Account registration and OTP flow |
| `/dashboard` | Dashboard | Project list and search |
| `/create-project` | CreateProject | Three-step deployment wizard |
| `/project/:projectId` | ProjectDetail | Project overview and logs |
| `/project/:projectId/settings` | ProjectSettings | Project configuration |
| `/profile` | Profile | Account and GitHub connection management |
| `/about` | About | Product story and project background |
| `/api-docs` | APIDocumentation | API documentation viewer |
| `/app-docs` | AppDocumentation | App documentation viewer |
| `*` | NotFound | Fallback for unknown routes |

---

## 5. Authentication & Session Handling

### Session Storage

The app keeps authentication state in `localStorage` after a successful login or signup:

- `token` for authenticated API requests
- `user` for displaying account details in the UI

### Session Behavior

- Protected pages redirect unauthenticated users to `/login`
- Login and signup pages are hidden from the main shell header and footer
- Dashboard, project, and profile pages revalidate the stored token on load

### Authentication Methods in the UI

- Email and password login
- Email-based signup with OTP verification
- GitHub OAuth sign-in and repository integration

### Security Behavior

- Authenticated requests send `Authorization: Bearer <token>`
- GitHub integration status is queried separately from account profile data
- The UI avoids exposing raw tokens on screen

---

## 6. Frontend Architecture Overview

The main application interface is assembled in [client/src/App.jsx](../client/src/App.jsx). The structure is simple and deliberate:

- `Router` wraps all routes
- `BackgroundPattern` provides the page backdrop
- `Navbar` and `Footer` are hidden on auth pages
- `useLocation` is used to reset scroll position on navigation
- Page-level routing controls the whole experience

This keeps the app easy to reason about while still supporting multiple flows and documentation pages.

The report describes a modular deployment platform with backend, build, log, and reverse-proxy services. The frontend mirrors that idea by separating the user-facing workflow into clear screens: repository input, configuration, logs, project detail, and settings.

---

## 7. Backend & System Mapping

The frontend communicates with multiple backend services to orchestrate the complete deployment workflow. This section maps frontend user actions to corresponding backend services and infrastructure.

### Frontend to Backend Service Mapping

| Frontend Action | Backend Service | API Route | Description |
| --- | --- | --- | --- |
| Sign up / Login | Backend Server (Auth) | `POST /api/auth/signup`, `POST /api/auth/login` | User authentication and session management |
| List projects | Backend Server (Project) | `GET /api/project` | Retrieve user's projects from MongoDB |
| Create project | Backend Server (Project) + Build Server + ECS | `POST /api/project` | Validate and queue ECS build task |
| Fetch GitHub repos | Backend Server (Auth) | `GET /api/project/repositories/github` | Retrieve user's GitHub repositories via OAuth token |
| View deployment logs | Log Server (CloudWatch) | `GET /api/project/:projectId/logs/stream` | Stream live build logs via EventSource (CloudWatch Logs) |
| Archive old logs | Log Server (S3) | `GET /api/project/:projectId/logs/archive` | Retrieve archived logs from S3 bucket |
| Redeploy project | Backend Server + ECS | `POST /api/project/:projectId/redeploy` | Launch new ECS task for same repository |
| Update project settings | Backend Server | `PUT /api/project/:projectId` | Modify project build configuration |
| Auto-deploy via webhook | Backend Server + Webhook | `POST /api/webhook/github` | GitHub webhook triggers automatic redeploy |
| View live deployment | Reverse Proxy (EC2) | `https://<projectId>.<domain>` | Access deployed application via subdomain |

### Backend Services Overview

- **Backend Server** (Node.js + Express): API endpoint management, user authentication, project orchestration, GitHub integration
- **Build Server** (Docker in ECS): Clones repository, executes install/build commands, uploads output to S3
- **Log Server** (CloudWatch Logs + S3): Streams live logs during build, archives completed logs
- **Reverse Proxy** (EC2): Routes subdomain requests to S3-hosted static builds
- **Database** (MongoDB Atlas): Stores user accounts, project metadata, deployment history

---

## 8. Deployment Lifecycle

This section details the complete workflow from user action to live deployment. Each step is grounded in the actual system implementation.

### Step-by-Step Deployment Pipeline

**1. User Submits Repository**
- User navigates to Create Project (Step 1: Git URL Input)
- Enters GitHub repository URL and project identifier
- Frontend validates format and passes to backend

**2. Backend Validation**
- Backend Server receives request at `/api/project` (POST)
- Validates:
  - PROJECT_ID format (lowercase, numbers, hyphens only)
  - Git URL is a valid GitHub repository
  - No duplicate project with same PROJECT_ID for current user
- Fetches user's GitHub access token from database
- Retrieves last commit info from GitHub API for metadata

**3. Build Task Queued to ECS**
- Backend triggers a containerized build process using project configuration and repository details.

**4. Build Server Executes Build**
- Build Server container starts
- Clones repository using Git (with GitHub token for auth if needed)
- Executes install command (e.g., `npm install`, `pip install`)
- Executes build command to generate production output
- Filters and exports user-defined environment variables
- Logs each step to CloudWatch Logs stream

**5. Live Log Streaming**
- Frontend establishes EventSource connection at `/api/project/:projectId/logs/stream`
- Reads from CloudWatch Logs in real-time
- Updates UI with log entries as they arrive
- User watches build progress live in Step 3 (Deployment Logs)

**6. Output Uploaded to S3**
- Build Server uploads all output files to S3 bucket
- Files organized under path: `<projectId>/index.html`, `<projectId>/css/`, etc.
- Files configured for public read access
- Build Server updates project status to "finished" or "failed"

**7. Logs Archived**
- Backend flushes CloudWatch Logs to S3 at `__logs/<projectId>.log`
- CloudWatch log stream deleted after archival
- Archived logs available via `/api/project/:projectId/logs/archive`

**8. Deployment URL Activated**
- Project record stored in MongoDB with status and URL
- Deployment URL: `https://<projectId>.<APP_DOMAIN>` (e.g., `https://my-app.sourcetolive.dev`)
- Reverse Proxy routes subdomain requests to S3 bucket
- User can access live deployment immediately after build completes

**9. Project Visible in Dashboard**
- Project appears in user's dashboard project list
- Status shows "finished" or "failed"
- Project card displays deployment URL and timestamps
- User can view logs, redeploy, or adjust settings

### Deployment States

| Status | Meaning | User Can... |
| --- | --- | --- |
| `queued` | Waiting for build task to start | View queued status in logs |
| `running` | Build in progress | Watch live logs |
| `finished` | Build completed successfully | Access live deployment URL |
| `failed` | Build completed with errors | View error logs, try redeploy |

---

---

## 9. Technology Stack

SourceToLive is built on a full-stack architecture spanning frontend, backend, build infrastructure, and cloud services.

### Complete Technology Stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| **Frontend** | React | UI rendering and interactivity |
| **Frontend** | Vite | Development server and production bundling |
| **Frontend** | react-router-dom | Routing and navigation |
| **Frontend** | EventSource | Live log streaming from backend |
| **Frontend** | ReactMarkdown | In-app documentation rendering |
| **Backend** | Node.js + Express | API server and business logic |
| **Backend** | MongoDB Atlas | User accounts, project metadata, deployment history |
| **Backend** | JWT (jsonwebtoken) | Stateless authentication |
| **Backend** | GitHub OAuth | Third-party authentication and API access |
| **Build System** | Docker | Containerized build environment |
| **Build System** | Node.js (in container) | Running install and build commands |
| **Cloud - Compute** | AWS ECS (Fargate) | Serverless container orchestration for builds |
| **Cloud - Logging** | AWS CloudWatch Logs | Real-time build log streaming |
| **Cloud - Storage** | AWS S3 | Build output storage and CDN-ready assets |
| **Cloud - Networking** | AWS EC2 | Reverse proxy and subdomain routing |
| **Deployment** | GitHub API | Repository access and webhook integration |
| **Deployment** | Cloudflare Tunnel | Secure local developer access (optional) |

### Supporting UI Patterns

- Conditional rendering for auth vs non-auth pages
- Scroll-to-top on route change
- Markdown documentation with table-of-contents navigation
- Responsive cards, panels, and form layouts

---

## 10. Navigation & Layout

### Global Layout

- Background pattern on all pages
- Top navigation for signed-in and public areas
- Footer visible outside auth pages
- Centered content area with responsive padding

### Navigation Model

- Public users start on the home page
- Authentication routes lead into the dashboard flow
- The dashboard branches into project creation, project detail, and project settings
- Documentation pages are available directly from the app shell

### Visual Direction

The UI uses a clean, high-contrast style with soft gradients, glass-like cards, and strong section hierarchy. That matches the project report theme of clarity, automation, and transparency without turning the interface into a generic dashboard clone.

---

## 11. Primary User Flows

### Discover and Enter

1. Visit the home page
2. Read the product summary and feature highlights
3. Choose to sign up or log in

### Authenticate

1. Create an account through signup and OTP verification
2. Or sign in directly with existing credentials
3. Optionally connect GitHub from the profile page

### Create a Project

1. Open the dashboard
2. Click `Create Project`
3. Enter the repository URL
4. Configure the project details
5. Watch the live deployment logs

### Inspect a Project

1. Open a project card from the dashboard
2. Review deployment status, source, and URL
3. Open archived build logs if needed
4. Trigger a redeploy when appropriate

### Adjust Settings

1. Open the project settings page
2. Edit build and repository settings
3. Enable or disable auto redeploy
4. Delete the project using the confirmation flow

---

## 12. Example User Journey

This section walks through a complete, real-world user flow from initial signup to accessing a deployed application.

### Scenario: Deploy a React Portfolio

**User:** Alex, a developer who wants to deploy a personal portfolio project hosted on GitHub.

**Step 1: Discovery and Signup**
- Alex visits the SourceToLive home page (`/`)
- Reads the three-step deployment explanation
- Clicks "Get Started" and is routed to signup
- Creates account at `/signup` with email and password
- Receives OTP email, verifies email address
- Account created and logged in automatically

**Step 2: Dashboard Orientation**
- Redirected to `/dashboard`
- Dashboard is empty (first-time user, no projects yet)
- Sees "Create Your First Project" call-to-action
- Clicks "New Project" button

**Step 3: Project Creation - Step 1 (Git URL)**
- Routed to `/create-project` step 1
- Component: `GitURLInput`
- Alex enters: `https://github.com/alex/portfolio`
- Frontend validates the URL format
- Clicks "Continue" to proceed to step 2

**Step 4: Project Creation - Step 2 (Configuration)**
- Now at `/create-project` step 2
- Component: `ProjectDetails`
- Fills out:
  - Project Name: `my-portfolio`
  - Install Command: `npm install` (default)
  - Build Command: `npm run build` (default)
  - Build Output Directory: `dist` (default)
  - Environment Variables: (none, skipped)
- Clicks "Deploy" to submit

**Step 5: Project Creation - Step 3 (Live Logs)**
- Routed to `/create-project` step 3
- Component: `DeploymentLogs`
- Backend creates ECS task with project metadata
- Frontend connects to `/api/project/my-portfolio/logs/stream` via EventSource
- Live log stream begins:
  ```
  ✓ Project queued successfully. Task ARN: arn:aws:ecs:...
  Cloning repository...
  Running npm install...
  Installing dependencies... (with progress)
  Running npm run build...
  Building portfolio...
  ✓ Build successful
  Uploading to S3...
  ✓ Deployment complete
  ```
- Page displays deployment URL: `https://my-portfolio.sourcetolive.dev`
- User can copy the URL or click to open

**Step 6: Project Detail**
- Clicks on deployment URL or close button
- Routed to `/project/my-portfolio`
- Component: `ProjectDetail`
- Views:
  - Project name, repository URL, branch
  - Deployment status: "finished"
  - Live URL (clickable, opens in new tab)
  - Build timestamps (created, started, completed)
  - Options: Redeploy, View Logs, Settings, Delete

**Step 7: Verify Deployment**
- Clicks live URL: `https://my-portfolio.sourcetolive.dev`
- Reverse proxy routes to S3 bucket
- Portfolio website loads successfully
- Alex's React app is now live

**Step 8: Project Settings (Optional)**
- Back on project detail page, clicks "Settings"
- Routed to `/project/my-portfolio/settings`
- Component: `ProjectSettings`
- Can:
  - Modify build commands
  - Enable auto-redeploy on GitHub push (via webhook)
  - Manage environment variables
  - Delete the project
- Leaves settings unchanged, returns to detail

**Step 9: Dashboard with Project**
- Clicks dashboard link or logo
- Routed to `/dashboard`
- Project card appears showing:
  - Project name: "my-portfolio"
  - Repository: "github.com/alex/portfolio"
  - Status: "finished" (green badge)
  - Deployment URL (clickable)
  - Last deploy time
  - Search bar to filter projects
- Can click card to go to detail or create new projects

**End Result:** Alex's portfolio is live at a custom URL, fully deployed and accessible to anyone on the internet. Alex can redeploy anytime by pushing changes to GitHub (if webhooks enabled) or manually via the dashboard.

---

## 13. Page Guide

### Home Page

The home page presents the platform story, feature cards, and a three-step deployment explanation. It also changes the primary CTA based on whether the user already has a session.

### Login Page

The login page handles authenticated entry into the app. It supports credential-based sign-in and routes the user forward to the dashboard on success.

### Signup Page

Signup initiates account creation and OTP verification. It is the entry point for new users who are not yet authenticated.

### Dashboard

The dashboard is the main control panel. It displays the current user, a searchable project list, project counts, and a create-project action.

### Create Project

This page is a three-step wizard:

1. Repository URL input
2. Project configuration form
3. Live deployment logs

The live log view uses `EventSource` so users can watch deployment progress as it happens.

### Project Detail

The project detail page shows the project identifier, deployment URL, repository, branch, status, timestamps, and actions such as redeploy and log viewing.

### Project Settings

The settings page lets users adjust the project configuration, manage auto redeploy, and delete the project with confirmation safeguards.

### Profile

The profile page exposes account data and GitHub integration status. It is where users connect or disconnect GitHub from the app.

### Documentation Pages

The app includes embedded documentation viewers for `/api-docs` and `/app-docs`, both rendered inside the same frontend shell.

---

## 14. How Your Data Is Handled

This section explains how SourceToLive stores, protects, and manages your information as you create and deploy projects.

### Your Account Information

When you sign up, SourceToLive stores:
- Email address and password (encrypted)
- Your profile name and avatar
- GitHub connection status (if you connect)
- All projects you create

Your account data is securely stored and only accessible when you're logged in. When you log out or close the app, your session ends, and you'll be asked to log in again when you return.

### Project Data & Configuration

Each project you create includes:

| What We Store | Why | Visibility |
| --- | --- | --- |
| Repository URL | To clone and build your code | Only you can see it |
| Project Name & ID | To identify and organize your projects | Visible on your dashboard |
| Build Commands | To compile your code properly | Only you can modify |
| Environment Variables | To configure your app at build time | Securely stored, not displayed in UI |
| Deployment URL | To give your app a public web address | Visible to anyone on the internet |
| Build Logs | To track what happened during deployment | Only you can view detailed logs |
| Deployment Timestamps | To show when your project was built and deployed | Visible on your project detail page |

### Session & Login

When you log in, SourceToLive creates a secure session token stored on your computer (in browser storage). This token:

- Proves you're authenticated when you use the app
- Is sent with every request so SourceToLive knows it's you
- Expires if you don't use the app for an extended period
- Is cleared when you explicitly log out

**What this means for you:** You stay logged in while actively using the app. If you leave it idle or close and reopen your browser, you may need to log in again.

### Deployment & Application Files

When you deploy a project:

1. **Your code is built** – SourceToLive compiles your repository using the build commands you specify
2. **Output is stored** – Compiled files (HTML, CSS, JavaScript) are saved so they can be served to visitors
3. **Your app goes live** – The deployment URL becomes active and your app is accessible on the internet
4. **Logs are archived** – Build logs are stored temporarily during the build, then moved to archive storage for future reference

**Important:** Your deployed app files are stored publicly so anyone can visit your website. The build logs contain only technical details about the deployment process and are only visible to you.

### Automatic Updates & Real-Time Information

When you create a project, the app updates in real-time:

- **Live logs stream** as your project builds — you see each step as it happens
- **Project status updates** automatically when the build completes
- **Deployment URL becomes active** the moment the build finishes
- **Project list refreshes** so new projects appear in your dashboard immediately

This real-time behavior means you don't need to refresh the page to see what's happening — SourceToLive keeps everything current automatically.

### Deleting Projects

When you delete a project from your dashboard:

- The project **is removed from your account**
- The **deployment URL is no longer active** (the website disappears)
- **Build logs are deleted** and recover is not possible
- **Files are removed** from SourceToLive storage

Once deleted, your project cannot be recovered. If you want to keep a record, download the logs before deleting.

### Data Privacy & Your Information

- **Only you can access your projects** – Other users cannot see your repositories, build commands, or deployment logs
- **Passwords are encrypted** – SourceToLive never stores your actual password; it only stores a secure hash
- **GitHub tokens are protected** – If you connect GitHub, your access token is encrypted and never exposed
- **Build logs are private** – Only you can view build logs and deployment details
- **Your deployed app is public** – Once deployed, anyone on the internet can visit your site if they have the URL

### Updating Project Settings

You can change project settings at any time from the Project Settings page:

- Modify build and install commands
- Add or remove environment variables
- Enable or disable automatic redeploys
- Update repository or build settings

**Changes take effect** the next time you redeploy your project. Previous deployments remain live until you manually redeploy.

---

## 15. Error Handling & Empty States

### Real Error Scenarios

| Error Type | Cause | UI Behavior | User See |
| --- | --- | --- | --- |
| Invalid Git URL | User enters non-GitHub or malformed URL | Frontend validation error | "Please enter a valid GitHub repository URL" in Step 1 |
| Duplicate Project | Project ID already exists for user | Backend returns 409 Conflict | "A project with this name already exists" on deployment |
| Authentication Failure | Missing or invalid JWT token | Redirects to `/login` | Session cleared, user must re-authenticate |
| GitHub Token Missing | User hasn't connected GitHub and repo is private | Build fails in ECS | Log shows "fatal: repository not found" in log stream |
| Build Command Failed | npm/yarn command exits with non-zero code | Build marked as "failed" | Log shows error, user can redeploy after fixing code |
| Dependency Installation Failed | Package manager cannot download or compile package | Build marked as "failed" | Log shows permission or network error details |
| Network/API Failure | Backend unreachable or timeout | Fetch error caught | "Failed to connect to server" error card |
| CloudWatch Log Stream Error | Build logs cannot be created or accessed | Log stream connection drops | Empty log view with "Log connection lost" message |
| S3 Upload Failure | Build output cannot be written to S3 | Build marked as "failed" | Log shows S3 error details |
| Large Repository Timeout | Very large repo takes >15min to clone/build | ECS task timeout | Project marked "failed", user must optimize build |

### Empty States

- **Dashboard (no projects):** "You haven't created any projects yet" with "Create Project" CTA
- **Search (no matches):** "No projects found matching your search" after filtering
- **Deployment URL (not ready):** "URL will be available after build completes" during `queued`/`running` states
- **Logs (empty stream):** "Starting log stream..." while waiting for first log entry
- **GitHub Repositories (none):** "No repositories found" if user hasn't connected GitHub or has no repos

---

## 16. Limitations

This section outlines real constraints and features not yet implemented in the current version of SourceToLive.

### Current Implementation Constraints

**No Rollback Support**
- Once a build completes and output is uploaded to S3, there is no mechanism to revert to a previous version.
- Each redeploy overwrites the previous deployment completely.
- Workaround: Users must redeploy from a specific Git branch or revert their repository and redeploy.

**Build Performance for Large Repositories**
- No caching between builds; each deployment starts from a clean environment.
- Large repositories (`> 500 MB`) or complex build processes can timeout after ~15 minutes.
- No build optimization strategies (incremental builds, artifact caching) are available.
- Recommended: Optimize build commands and dependencies before deploying.

**Single Output Per Project**
- Each project maintains only one active deployment at a time.
- There is no versioning, staging, or preview URL system.
- Redeploy immediately replaces the live deployment.

**No Team Collaboration**
- Only project owner (creator) can access project settings and redeploy.
- No mechanism to grant access to team members or collaborators.
- No project-level permissions or multi-user management.

**Environment Variables Limitations**
- Environment variables are stored in MongoDB and passed to build at runtime.
- No secret rotation or expiration policies.
- Secrets are not encrypted at rest (security concern for sensitive tokens).

**Limited Build Customization**
- Build process is restricted to install and build commands only.
- No pre-build or post-build hooks available.
- No support for monorepos or custom build orchestration.

**GitHub Integration Limitations**
- GitHub OAuth is optional; private repos require manual token input.
- Webhook auto-redeploy is available but auto-deletes on project deletion.
- No support for GitLab, Gitea, or other Git platforms.

### Not Implemented (Future Scope)

As noted in the project report, these features are planned but not yet coded:
- Advanced monitoring (CPU, memory, uptime metrics)
- Rollback to previous builds
- Team members and collaboration
- Email alerts and notifications
- Custom domains (CNAME support)
- Build caching and optimization
- Database backup and migration tools
- RAG (Retrieval-Augmented Generation) for AI-powered platform guidance – Intelligent cloud-hosted documentation and real-time platform assistance for users and developers

---

## 17. Security Considerations

This section describes the security mechanisms and practices in place for protecting user data and deployed applications.

### Authentication & Authorization

**JWT Bearer Tokens**
- User receives JWT token after successful login or signup
- Token stored in browser `localStorage` under key `token`
- Sent with every authenticated request in header: `Authorization: Bearer <token>`
- JWT tokens are verified by backend middleware for authentication.
- No token refresh mechanism; users remain logged in until token expires or localStorage is cleared

**Protected Routes**
- Dashboard, Create Project, Project Detail, Settings, and Profile pages are protected via middleware
- Middleware redirects unauthenticated requests to `/login`
- Protected backend routes check JWT before processing (middleware: `verifyToken`, `isUser`)

**Authorization Levels**
- `isUser`: Standard authenticated user (can create projects, view own projects)
- `isAdmin`: Admin user (can view all projects, manage users) [not exposed in frontend]
- Projects can only be accessed by their owner (enforced in backend query: `owner.userId`)

### GitHub Integration Security

**OAuth Token Storage**
- GitHub access token is stored encrypted in user document in MongoDB
- Token is fetched from database only when needed (creating or redeploying projects)
- Token is passed to Build Server via ECS environment variable for private repo access
- Token is NOT exposed to frontend; only connection status is displayed

**GitHub Webhook Security**
- Webhook secret generated and stored per project
- GitHub payloads are verified using HMAC-SHA256 signature
- Webhook signature validation prevents unauthorized redeploys
- Webhook IDs stored in project record for later deletion

### Data Protection

**CORS Configuration**
- API enforces CORS policy; frontend requests validated by origin
- Credentials allowed in cross-origin requests
- Allowed headers: Content-Type, Authorization

**HTTPS/TLS**
- Production frontend and API served over HTTPS
- Reverse proxy enforces HTTPS for deployed applications
- All external API calls use HTTPS (GitHub API, AWS API)

**Input Validation**
- PROJECT_ID validated: lowercase letters, numbers, hyphens only (regex: `/^[a-z0-9-]+$/`)
- Git URLs validated against GitHub domain patterns
- Build commands bound to whitelist of allowed tools
- Environment variable keys filtered against system variables list

**Backend Middleware**
- Morgan logging: tracks all incoming requests (dev mode)
- Error handler: absorbs JSON parse errors and prevents information leakage
- CORS middleware: validates origin before processing

### Deployment & Infrastructure Security

**AWS Services**
- ECS tasks run in FARGATE launch type with vpc and security group isolation
- CloudWatch Logs restricted to project owner queries
- S3 bucket configured for public read (assets only), private write
- EC2 reverse proxy running in VPC with restricted security groups

**Container Security**
- Build Server runs in isolated Docker container
- Container environment variables exclude sensitive system vars
- No direct SSH access to build containers

**Logs & Audit**
- Build logs stored in CloudWatch (real-time) then archived to S3
- Logs include timestamps, log levels, and output messages
- No audit trail for user actions (future scope)

---

## 18. Responsive Design & Accessibility

### Responsive Behavior

- Layouts collapse from multi-column to single-column on smaller screens
- Navigation and tab controls are touch-friendly
- Cards and forms use flexible spacing and sizing

### Accessibility Notes

- Buttons and links have clear visual states
- Status indicators use both color and text
- Forms and project actions are labeled clearly
- Focus-visible behavior should be preserved when extending the UI

---

## 19. Team & Contributors

This section mirrors the team presentation used on the About page and lists the people behind SourceToLive.

### Meet the Team

SourceToLive is a final-year major project built by BTech CSE students who focused on practical deployment workflows, cloud infrastructure, and a cleaner Git-to-live experience.

### The Team

- [Govind Singh](https://www.linkedin.com/in/govindsingh3011/)
- [Soumya Kumar Gupta](https://www.linkedin.com/in/soumyakumargupta/)
- [Vansh Agarwal](https://www.linkedin.com/in/vansh-agarwal-66771925a/)
- [Aviral Mishra](https://www.linkedin.com/in/aviral-mishra-bb5706262/)
- [Akshat Kushwaha](https://www.linkedin.com/in/akshat-kushwaha-08a448274/)
- [Jatin Kumar](https://www.linkedin.com/in/jatin-kumarx-54734524a/)

### Team Message

Build practical systems. Solve real problems. Learn by implementing complete architectures end-to-end.

---

## 20. Support & Reference Links

### In-App Documentation

- [App Documentation](https://www.sourcetolive.dev/app-docs)
- [API Documentation](https://www.sourcetolive.dev/api-docs)

### Useful UI Entry Points

- [Home](https://www.sourcetolive.dev)
- [Dashboard](https://www.sourcetolive.dev/dashboard)
- [Create Project](https://www.sourcetolive.dev/create-project)
- [Profile](https://www.sourcetolive.dev/profile)

### Contact

If you need to extend the app docs further, use the report as the source of product intent and the page components as the source of implementation truth.

---

_Last updated: 2026-04-08_
_SourceToLive App Documentation_
