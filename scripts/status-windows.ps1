<#
.SYNOPSIS
    Quick status check for all LBS Dashboard services on Windows.

.USAGE
    .\scripts\status-windows.ps1
#>

Write-Host "== Container Status ==" -ForegroundColor Cyan
docker-compose ps

Write-Host "`n== Health Checks ==" -ForegroundColor Cyan

function Test-Health($name, $url) {
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 3
        Write-Host "$name : UP ($($response.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "$name : DOWN" -ForegroundColor Red
    }
}

Test-Health "Backend " "http://localhost:8080/api/health"
Test-Health "Analytics" "http://localhost:8000/health"
Test-Health "Frontend " "http://localhost:3000"
