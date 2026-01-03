# Cloudflare Tunnel — Setup & Usage

This document explains how to run the shared Cloudflare Tunnel for a stable backend URL used by the team. It focuses on secure, repeatable steps for local usage and common troubleshooting.

TL;DR

- Persistent URL: https://app.sourcetolive.dev
- Tunnel name: sourcetolive-backend
- Local service: http://localhost:3000

---

## Snapshot

| Item           | Value                                  |
| -------------- | -------------------------------------- |
| Persistent URL | `https://app.sourcetolive.dev`         |
| Tunnel name    | `sourcetolive-backend`                 |
| Tunnel ID      | `5fe1fab9-cbdd-459c-9c8f-d918343b0b2a` |
| Local server   | `http://localhost:3000`                |

---

## Quick checklist (first-time setup)

- Ensure `cloudflared` is installed on your machine.
- Obtain the credentials file `5fe1fab9-cbdd-459c-9c8f-d918343b0b2a.json` from the team lead (not via Git).
- Place the credentials file at `Backend-Server/5fe1fab9-cbdd-459c-9c8f-d918343b0b2a.json` next to `cloudflared-config.yml`.
- Start the backend locally on port 3000 before running the tunnel.

## Prerequisites

Install cloudflared (Cloudflare Tunnel client):

```powershell
# Download: https://github.com/cloudflare/cloudflared/releases
# Or install via Chocolatey (Windows):
choco install cloudflared

# Verify installation
cloudflared --version
```

## Start the tunnel (Quick Start)

From the project directory:

```powershell
cd E:\SourceToLive\Backend-Server
cloudflared tunnel --config cloudflared-config.yml run
```

From anywhere (absolute config path):

```powershell
cloudflared tunnel --config E:\SourceToLive\Backend-Server\cloudflared-config.yml run
```

Notes

- Only one person should run the shared tunnel at a time.
- The configuration uses a relative credentials path, so no local edits are required.

---

## Common commands

- Check whether cloudflared is running:

```powershell
Get-Process cloudflared
```

- Stop cloudflared:

```powershell
Get-Process cloudflared | Stop-Process
```

- View tunnel details:

```powershell
cloudflared tunnel info sourcetolive-backend
```

- List tunnels:

```powershell
cloudflared tunnel list
```

---

## Configuration

File: `cloudflared-config.yml`

```yaml
tunnel: 5fe1fab9-cbdd-459c-9c8f-d918343b0b2a
credentials-file: ./5fe1fab9-cbdd-459c-9c8f-d918343b0b2a.json

ingress:
  - hostname: app.sourcetolive.dev
    service: http://localhost:3000
  - service: http_status:404
```

DNS entry (already configured in Cloudflare):

- Type: CNAME
- Name: `app`
- Target: `5fe1fab9-cbdd-459c-9c8f-d918343b0b2a.cfargotunnel.com`
- Proxy: Proxied (orange cloud)

---

## GitHub OAuth configuration

Use the following values when configuring the OAuth app in GitHub:

- Homepage URL: `https://app.sourcetolive.dev`
- Authorization callback URL: `https://app.sourcetolive.dev/api/auth/github/callback`

Steps

1. Go to GitHub Settings → Developer settings → OAuth Apps.
2. Select the app and update the URLs above.
3. Save changes.

---

## Troubleshooting

Tunnel won't start

```powershell
# Confirm cloudflared installed
cloudflared --version

# Confirm credentials file exists
Test-Path E:\SourceToLive\Backend-Server\5fe1fab9-cbdd-459c-9c8f-d918343b0b2a.json
```

Tunnel stops or errors

```powershell
cloudflared tunnel --config cloudflared-config.yml run --loglevel debug
```

Port 3000 in use

```powershell
Get-NetTCPConnection -LocalPort 3000 | Select-Object LocalAddress, LocalPort, State, OwningProcess
Stop-Process -Id <ProcessId>
```

Cannot access the public URL

1. Confirm `Get-Process cloudflared` shows a running process.
2. Confirm local server responds: `curl http://localhost:3000`.
3. Confirm tunnel responds: `curl https://app.sourcetolive.dev`.

---

## Important operational notes

1. Start the backend before starting the tunnel. Example:

```powershell
# Terminal A: start backend
cd E:\SourceToLive\Backend-Server
node index.js

# Terminal B: start tunnel
cd E:\SourceToLive\Backend-Server
cloudflared tunnel --config cloudflared-config.yml run
```

2. Keep the credentials file secure — never commit it to source control.
3. The persistent URL `https://app.sourcetolive.dev` is used for OAuth and external callbacks.
4. DNS changes may take several minutes to propagate.

---

## Advanced usage

- Install cloudflared as a Windows service (requires admin):

```powershell
cloudflared service install
```

- Manage service:

```powershell
Start-Service cloudflared
Stop-Service cloudflared
```

- Add or change hostnames (example):

```powershell
cloudflared tunnel route dns sourcetolive-backend api.sourcetolive.dev
```

---

## Resources

- Cloudflare Connect Apps: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
- Cloudflare DNS: https://developers.cloudflare.com/dns/
- GitHub OAuth docs: https://docs.github.com/en/developers/apps/building-oauth-apps

---

## Support

If you need help, contact the project lead or open an issue in the team tracker with:

- Host OS and `cloudflared --version`
- Tunnel logs (run with `--loglevel debug`)
- Local server status and any error output

If you'd like, I can also commit this rewrite or refine wording further.
