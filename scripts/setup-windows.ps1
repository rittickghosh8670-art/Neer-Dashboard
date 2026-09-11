<#
.SYNOPSIS
    One-time setup helper for running the LBS Trading Dashboard on Windows.

.DESCRIPTION
    Checks for Docker Desktop, creates .env from .env.example if missing,
    and starts all services via docker-compose. Run from the project root
    (or anywhere - the script cd's to its own parent directory).

.USAGE
    Open PowerShell in the project root and run:
        .\scripts\setup-windows.ps1

    If script execution is blocked, run once (as your normal user, not admin):
        Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
#>

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

Write-Host "== LBS Trading Dashboard - Windows Setup ==" -ForegroundColor Cyan

# 1. Check Docker Desktop is installed and running
Write-Host "`n[1/4] Checking Docker..." -ForegroundColor Yellow
$dockerCmd = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerCmd) {
    Write-Host "Docker not found. Install Docker Desktop for Windows (with WSL2 backend) from:" -ForegroundColor Red
    Write-Host "  https://www.docker.com/products/docker-desktop/" -ForegroundColor Red
    exit 1
}

try {
    docker info | Out-Null
    Write-Host "Docker daemon is running." -ForegroundColor Green
} catch {
    Write-Host "Docker is installed but the daemon isn't running. Start Docker Desktop and re-run this script." -ForegroundColor Red
    exit 1
}

# 2. Create .env if missing
Write-Host "`n[2/4] Checking .env file..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host ".env created from .env.example. Edit it now to add your ANTHROPIC_API_KEY and DB password." -ForegroundColor Green
    Write-Host "Opening .env in Notepad for editing..." -ForegroundColor Yellow
    Start-Process notepad.exe ".env"
    Read-Host "Press Enter once you've saved your .env changes to continue"
} else {
    Write-Host ".env already exists, skipping." -ForegroundColor Green
}

# 3. Build and start services
Write-Host "`n[3/4] Building and starting containers (this may take a few minutes on first run)..." -ForegroundColor Yellow
docker-compose up --build -d

# 4. Wait for health checks
Write-Host "`n[4/4] Waiting for services to become healthy..." -ForegroundColor Yellow
$maxAttempts = 24
$attempt = 0
$backendUp = $false

while ($attempt -lt $maxAttempts) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/api/health" -UseBasicParsing -TimeoutSec 3
        if ($response.StatusCode -eq 200) {
            $backendUp = $true
            break
        }
    } catch {
        # not ready yet
    }
    Start-Sleep -Seconds 5
    $attempt++
    Write-Host "  waiting for backend... ($attempt/$maxAttempts)"
}

if ($backendUp) {
    Write-Host "`nAll set. Services available at:" -ForegroundColor Green
    Write-Host "  Frontend:  http://localhost:3000"
    Write-Host "  Backend:   http://localhost:8080/api/health"
    Write-Host "  Analytics: http://localhost:8000/health"
} else {
    Write-Host "`nBackend did not become healthy in time. Check logs with:" -ForegroundColor Red
    Write-Host "  docker-compose logs backend"
}
