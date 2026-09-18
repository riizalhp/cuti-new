# Employr Development Stop Script
# Stops all services gracefully

$ErrorActionPreference = "Continue"

Write-Host "============================================================" -ForegroundColor Red
Write-Host "  EMPLOYR - Stopping Development Environment" -ForegroundColor Red
Write-Host "============================================================" -ForegroundColor Red

# Function to kill process on port
function Stop-ProcessOnPort {
    param([int]$Port, [string]$ServiceName)

    Write-Host "Stopping $ServiceName (port $Port)..." -ForegroundColor Yellow -NoNewline

    $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if ($connections) {
        $connections | ForEach-Object {
            $processId = $_.OwningProcess
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        }
        Write-Host " Stopped" -ForegroundColor Green
    } else {
        Write-Host " Not running" -ForegroundColor Gray
    }
}

# Stop services on ports
Stop-ProcessOnPort -Port 3001 -ServiceName "API Backend"
Stop-ProcessOnPort -Port 4321 -ServiceName "Landing Page"
Stop-ProcessOnPort -Port 3000 -ServiceName "Dashboard"
Stop-ProcessOnPort -Port 3002 -ServiceName "Admin Panel"
Stop-ProcessOnPort -Port 3004 -ServiceName "Learning Academy"
Stop-ProcessOnPort -Port 3005 -ServiceName "FAQ / Pusat Bantuan"

# Stop PostgreSQL
Write-Host "`nStopping PostgreSQL container..." -ForegroundColor Yellow -NoNewline
$postgresRunning = docker ps --filter "name=employr-postgres" --filter "name=cuti-postgres" --format "{{.Names}}" 2>$null
if ($postgresRunning) {
    docker stop $postgresRunning | Out-Null
    Write-Host " Stopped ($postgresRunning)" -ForegroundColor Green
} else {
    Write-Host " Not running" -ForegroundColor Gray
}

Write-Host "`nAll services stopped!" -ForegroundColor Green
Write-Host ""
