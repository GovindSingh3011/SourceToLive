# Start Cloudflare Tunnel and save the URL
$logFile = "$PSScriptRoot\tunnel-url.txt"

Write-Host "Starting Cloudflare Tunnel..." -ForegroundColor Green

# Start cloudflared in background and redirect output to temp file
$tempLog = "$env:TEMP\cloudflared-output.txt"
$process = Start-Process -FilePath "cloudflared" -ArgumentList "tunnel --url http://localhost:3000" -PassThru -RedirectStandardError $tempLog -NoNewWindow

# Wait and monitor for URL
Write-Host "Waiting for tunnel URL..." -ForegroundColor Yellow
$timeout = 15
$found = $false

for ($i = 0; $i -lt $timeout; $i++) {
    Start-Sleep -Seconds 1
    
    if (Test-Path $tempLog) {
        $content = Get-Content $tempLog -Raw -ErrorAction SilentlyContinue
        if ($content -match "https://([a-z0-9-]+\.trycloudflare\.com)") {
            $tunnelUrl = $matches[0]
            $found = $true
            break
        }
    }
}

if ($found) {
    # Save to file
    $tunnelUrl | Out-File -FilePath $logFile -NoNewline
    
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "  Tunnel URL: $tunnelUrl" -ForegroundColor Cyan
    Write-Host "  Saved to: tunnel-url.txt" -ForegroundColor Yellow
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    
    # Copy to clipboard
    try {
        $tunnelUrl | Set-Clipboard
        Write-Host "Success: URL copied to clipboard!" -ForegroundColor Green
    } catch {
        Write-Host "Warning: Could not copy to clipboard" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "Could not extract tunnel URL. The tunnel may still be starting." -ForegroundColor Red
    Write-Host "Check the cloudflared output in terminal." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Tunnel is running (PID: $($process.Id)). Press Ctrl+C to stop." -ForegroundColor Cyan
Write-Host ""

# Display live output
if (Test-Path $tempLog) {
    Get-Content $tempLog -Tail 20 | ForEach-Object { Write-Host $_ -ForegroundColor Gray }
}

# Keep script running
try {
    $process.WaitForExit()
} catch {
    # Clean exit on Ctrl+C
}
