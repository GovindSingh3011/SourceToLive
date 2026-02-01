# 🚇 Cloudflare Tunnel Setup Guide

> **Quick access to your local backend through a persistent URL**

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Quick Reference](#-quick-reference)
- [First-Time Setup](#-first-time-setup)
- [Daily Usage](#-daily-usage)
- [Configuration Details](#%EF%B8%8F-configuration-details)
- [GitHub OAuth Integration](#-github-oauth-integration)
- [Troubleshooting](#-troubleshooting)
- [Advanced Usage](#-advanced-usage)
- [Resources](#-resources)

---

## 🎯 Overview

This Cloudflare Tunnel provides a persistent, secure URL for your local backend server, making it perfect for OAuth callbacks and external integrations.

### Key Benefits

- 🔗 **Persistent URL**: Same URL every time (`https://app.sourcetolive.dev`)
- 🔒 **Secure**: Traffic encrypted through Cloudflare's network
- 🌍 **Public Access**: Share your local development with teammates or clients
- ⚡ **No Port Forwarding**: Works behind firewalls and NAT

---

## 📊 Quick Reference

| Property | Value |
|----------|-------|
| **Public URL** | `https://app.sourcetolive.dev` |
| **Tunnel Name** | `sourcetolive-backend` |
| **Tunnel ID** | `5fe1fab9-cbdd-459c-9c8f-d918343b0b2a` |
| **Local Service** | `http://localhost:3000` |
| **Config File** | `cloudflared-config.yml` |
| **Credentials** | `5fe1fab9-cbdd-459c-9c8f-d918343b0b2a.json` |

---

## 🚀 First-Time Setup

### Step 1: Install Cloudflared

```powershell
choco install cloudflared -y
```

**Verify Installation**
```powershell
cloudflared --version
```

Expected output: `cloudflared version 20XX.X.X`

---

### Step 2: Get Credentials File

The credentials file is required to authenticate your tunnel connection.

1. **Locate the file**: `5fe1fab9-cbdd-459c-9c8f-d918343b0b2a.json`
2. **Request access**: Contact your team lead for the credentials file
3. **Placement**: Save it in the `Backend-Server` folder

```
Backend-Server/
├── cloudflared-config.yml
├── 5fe1fab9-cbdd-459c-9c8f-d918343b0b2a.json  ← Place here
└── index.js
```

> **⚠️ Security Note**: This file is in `.gitignore` and should **never** be committed to version control.

---

### Step 3: First Run

Start your backend server and tunnel:

**Terminal 1 - Backend Server**
```powershell
cd E:\SourceToLive\Backend-Server
node index.js
```

**Terminal 2 - Cloudflare Tunnel**
```powershell
cd E:\SourceToLive\Backend-Server

cloudflared tunnel --config cloudflared-config.yml run
```

✅ **Success!** Your backend is now accessible at `https://app.sourcetolive.dev`

---

### Essential Commands

**Check if Tunnel is Running**
```powershell
Get-Process cloudflared
```

**Stop the Tunnel**
```powershell
Get-Process cloudflared | Stop-Process -Force
```

**View Tunnel Information**
```powershell
cloudflared tunnel info sourcetolive-backend
```

**List All Tunnels**
```powershell
cloudflared tunnel list
```

**Run with Debug Logging**
```powershell
cloudflared tunnel --config cloudflared-config.yml run --loglevel debug
```

---

## ⚙️ Configuration Details

### Tunnel Configuration File

**File**: `cloudflared-config.yml`

```yaml
tunnel: 5fe1fab9-cbdd-459c-9c8f-d918343b0b2a
credentials-file: ./5fe1fab9-cbdd-459c-9c8f-d918343b0b2a.json

ingress:
  - hostname: app.sourcetolive.dev
    service: http://localhost:3000
  - service: http_status:404
```

**Configuration Breakdown:**
- `tunnel`: Unique tunnel identifier
- `credentials-file`: Relative path to credentials (works on any machine)
- `ingress`: Routing rules for incoming traffic
  - First rule: Routes `app.sourcetolive.dev` to `localhost:3000`
  - Catch-all: Returns 404 for unmatched hostnames

---

### DNS Configuration

The DNS is already configured in Cloudflare:

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | `app` | `5fe1fab9-cbdd-459c-9c8f-d918343b0b2a.cfargotunnel.com` | ✅ Proxied |

This creates the full domain: `app.sourcetolive.dev`

---

## 🔐 GitHub OAuth Integration

Configure your GitHub OAuth App with these URLs:

**Steps:**
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Select your OAuth App (or create a new one)
3. Update the following fields:

```
Homepage URL:
https://app.sourcetolive.dev

Authorization callback URL:
https://app.sourcetolive.dev/api/auth/github/callback
```

4. Save your changes

**Environment Variables:**
```env
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
CALLBACK_URL=https://app.sourcetolive.dev/api/auth/github/callback
```

---

## 🐛 Troubleshooting

### Issue: Tunnel Won't Start

**Check Installation**
```powershell
cloudflared --version
```

**Verify Credentials File**
```powershell
Test-Path E:\SourceToLive\Backend-Server\5fe1fab9-cbdd-459c-9c8f-d918343b0b2a.json
```

**Review Configuration**
```powershell
Get-Content E:\SourceToLive\Backend-Server\cloudflared-config.yml
```

---

### Issue: Port 3000 Already in Use

**Find the Process**
```powershell
Get-NetTCPConnection -LocalPort 3000 | Select-Object LocalAddress, LocalPort, State, OwningProcess
```

**Stop the Process**
```powershell
Stop-Process -Id <ProcessId> -Force
```

---

### Issue: Cannot Access Public URL

**Step-by-Step Diagnosis:**

1. **Check if tunnel is running**
   ```powershell
   Get-Process cloudflared
   ```

2. **Verify local backend**
   ```powershell
   curl http://localhost:3000
   ```

3. **Test tunnel connectivity**
   ```powershell
   curl https://app.sourcetolive.dev
   ```

4. **Check tunnel logs**
   ```powershell
   cloudflared tunnel --config cloudflared-config.yml run --loglevel debug
   ```

---

### Issue: Multiple Team Members Running Tunnel

**⚠️ Important**: Only one person can run the tunnel at a time.

**Coordination Tips:**
- Use team chat to announce when starting/stopping the tunnel
- Create a shared schedule for tunnel usage
- Consider setting up multiple tunnels for different team members

---

## 🎓 Advanced Usage

### Run Tunnel as Windows Service

Install the tunnel as a background service (requires Administrator):

```powershell
# Install service
cloudflared service install

# Start service
Start-Service cloudflared

# Stop service
Stop-Service cloudflared

# Remove service
cloudflared service uninstall
```

---

### Add Additional Hostnames

**Update Configuration:**
```yaml
ingress:
  - hostname: api.sourcetolive.dev
    service: http://localhost:3000
  - hostname: admin.sourcetolive.dev
    service: http://localhost:4000
  - service: http_status:404
```

**Add DNS Record:**
```powershell
cloudflared tunnel route dns sourcetolive-backend api.sourcetolive.dev
cloudflared tunnel route dns sourcetolive-backend admin.sourcetolive.dev
```

---

### Custom Port Configuration

To change the local port being tunneled:

1. Update `cloudflared-config.yml`:
   ```yaml
   service: http://localhost:4000  # Change port here
   ```

2. Restart the tunnel

---

## 📚 Resources

### Official Documentation
- [Cloudflare Tunnel Documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Cloudflared GitHub Repository](https://github.com/cloudflare/cloudflared)
- [Cloudflare DNS Documentation](https://developers.cloudflare.com/dns/)

### OAuth & Authentication
- [GitHub OAuth Apps Guide](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [OAuth 2.0 Best Practices](https://oauth.net/2/)

### Troubleshooting
- [Cloudflare Community Forum](https://community.cloudflare.com/)
- [Cloudflared Issues on GitHub](https://github.com/cloudflare/cloudflared/issues)

---

## 🤝 Team Collaboration Guidelines

### ✅ Do's
- ✅ Coordinate with team before starting the tunnel
- ✅ Stop the tunnel when you're done working
- ✅ Keep credentials file secure and private
- ✅ Test locally before using the tunnel
- ✅ Share any configuration changes with the team

### ❌ Don'ts
- ❌ Never commit the credentials file to Git
- ❌ Don't run tunnel when another team member is using it
- ❌ Don't share credentials file via unsecured channels
- ❌ Don't modify DNS settings without team discussion
- ❌ Don't hardcode the tunnel URL in production code

---

## 🆘 Getting Help

If you encounter issues:

1. **Check this guide** - Most common issues are covered above
2. **Review logs** - Run with `--loglevel debug` for detailed output
3. **Verify basics** - Backend running? Credentials file present?
4. **Ask the team** - Someone may have faced the same issue
5. **Check firewall** - Ensure port 3000 isn't blocked

---

## 📝 Quick Checklist

Before starting work with the tunnel:

- [ ] Backend server is running on port 3000
- [ ] Credentials file is in the correct location
- [ ] No other team member is using the tunnel
- [ ] Cloudflared is installed and up to date
- [ ] Configuration file is properly formatted

---

<div align="center">

**Made with ❤️ for the SourceToLive Team**
</div>