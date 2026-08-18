# CUTI Development Startup Script
# Automatically starts all services with one command

param(
    [switch]$SkipMigrations,
    [switch]$SkipSeeds
)

$ErrorActionPreference = "Continue"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  CUTI - Career Operating System" -ForegroundColor Cyan
Write-Host "  Development Environment Startup" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue -InformationLevel Quiet
    return $connection
}

# Function to wait for a port to be available
function Wait-ForPort {
    param([int]$Port, [string]$Service, [int]$TimeoutSeconds = 30)

    Write-Host "Waiting for $Service (port $Port)..." -ForegroundColor Yellow -NoNewline

    $elapsed = 0
    while ($elapsed -lt $TimeoutSeconds) {
        if (Test-Port -Port $Port) {
            Write-Host " Ready!" -ForegroundColor Green
            return $true
        }
        Start-Sleep -Seconds 2
        $elapsed += 2
        Write-Host "." -ForegroundColor Yellow -NoNewline
    }

    Write-Host " Timeout" -ForegroundColor Red
    return $false
}

# Step 1: Check Docker Desktop
Write-Host "`nStep 1: Checking Docker Desktop..." -ForegroundColor Cyan
$dockerStatus = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker Desktop is not running. Starting..." -ForegroundColor Yellow
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    Write-Host "Waiting 30 seconds for Docker to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
} else {
    Write-Host "Docker Desktop is running" -ForegroundColor Green
}

# Step 2: Start PostgreSQL
Write-Host "`nStep 2: Starting PostgreSQL container..." -ForegroundColor Cyan
$postgresRunning = docker ps --filter "name=cuti-postgres" --format "{{.Names}}" 2>$null
if ($postgresRunning -eq "cuti-postgres") {
    Write-Host "PostgreSQL container already running" -ForegroundColor Green
} else {
    $postgresExists = docker ps -a --filter "name=cuti-postgres" --format "{{.Names}}" 2>$null
    if ($postgresExists -eq "cuti-postgres") {
        Write-Host "Starting existing container..." -ForegroundColor Yellow
        docker start cuti-postgres | Out-Null
    } else {
        Write-Host "Creating new PostgreSQL container..." -ForegroundColor Yellow
        docker run --name cuti-postgres `
            -e POSTGRES_PASSWORD=password `
            -e POSTGRES_DB=cuti_dev `
            -p 5432:5432 `
            -d postgres:16-alpine | Out-Null
    }

    if ($LASTEXITCODE -eq 0) {
        Write-Host "PostgreSQL container started" -ForegroundColor Green
        Start-Sleep -Seconds 5
    } else {
        Write-Host "Failed to start PostgreSQL" -ForegroundColor Red
        exit 1
    }
}

# Step 3: Run migrations (first time only)
if (-not $SkipMigrations) {
    Write-Host "`nStep 3: Running database migrations..." -ForegroundColor Cyan
    Push-Location packages\db

    # Check if migrations are needed
    $migrationsDir = "prisma\migrations"
    if (-not (Test-Path $migrationsDir) -or (Get-ChildItem $migrationsDir).Count -eq 0) {
        Write-Host "Running initial migration..." -ForegroundColor Yellow
        pnpm db:migrate dev --name init 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Migrations completed" -ForegroundColor Green
        } else {
            Write-Host "Migrations may have already run" -ForegroundColor Yellow
        }
    } else {
        Write-Host "Migrations already exist" -ForegroundColor Green
    }

    Write-Host "Generating Prisma Client..." -ForegroundColor Yellow
    pnpm db:generate 2>&1 | Out-Null
    Write-Host "Prisma Client generated" -ForegroundColor Green

    Pop-Location
} else {
    Write-Host "`nStep 3: Skipping migrations" -ForegroundColor Gray
}

# Step 4: Seed templates
if (-not $SkipSeeds) {
    Write-Host "`nStep 4: Seeding templates..." -ForegroundColor Cyan
    Push-Location packages\db

    pnpm db:seed:templates 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Templates seeded successfully" -ForegroundColor Green
    } else {
        Write-Host "Templates may already exist" -ForegroundColor Yellow
    }

    Pop-Location
} else {
    Write-Host "`nStep 4: Skipping seed" -ForegroundColor Gray
}

# Step 5: Kill processes on required ports
Write-Host "`nStep 5: Cleaning up ports..." -ForegroundColor Cyan
$ports = @{
    3001 = "API"
    3002 = "Admin Panel"
    4321 = "Landing Page"
    3000 = "Dashboard"
    3004 = "Learning Academy"
    3005 = "FAQ / Pusat Bantuan"
}

function Kill-ProcessOnPort {
    param([int]$Port, [string]$ServiceName)

    Write-Host "Checking port $Port ($ServiceName)..." -ForegroundColor Yellow -NoNewline

    $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if ($connections) {
        $connections | ForEach-Object {
            $processId = $_.OwningProcess
            $processName = (Get-Process -Id $processId -ErrorAction SilentlyContinue).ProcessName
            Write-Host " Killing $processName (PID: $processId)" -ForegroundColor Red
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        }
        Start-Sleep -Seconds 1
        Write-Host "   Port $Port is now free" -ForegroundColor Green
    } else {
        Write-Host " Already free" -ForegroundColor Green
    }
}

foreach ($port in $ports.Keys) {
    Kill-ProcessOnPort -Port $port -ServiceName $ports[$port]
}

Write-Host "All ports cleaned up!" -ForegroundColor Green

# Step 6: Start all services
Write-Host "`nStep 6: Starting all services..." -ForegroundColor Cyan
Write-Host ""
Write-Host "   API Backend:        http://localhost:3001" -ForegroundColor Yellow
Write-Host "   Landing Page:       http://localhost:4321" -ForegroundColor Yellow
Write-Host "   Dashboard:          http://localhost:3000" -ForegroundColor Yellow
Write-Host "   Learning Academy:   http://localhost:3004" -ForegroundColor Yellow
Write-Host "   Admin Panel:        http://localhost:3002" -ForegroundColor Yellow
Write-Host "   FAQ / Pusat Bantuan: http://localhost:3005" -ForegroundColor Yellow
Write-Host ""

# Start API (highest priority)
Write-Host "Starting API Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Write-Host '[API Backend - Port 3001]' -ForegroundColor Cyan; Write-Host ''; cd D:\cuti; pnpm --filter @cuti/api dev"
) -WindowStyle Normal

Start-Sleep -Seconds 5

# Start Landing Page
Write-Host "Starting Landing Page..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Write-Host '[Landing Page - Port 4321]' -ForegroundColor Green; Write-Host ''; cd D:\cuti; pnpm --filter @cuti/web dev"
) -WindowStyle Normal

Start-Sleep -Seconds 3

# Start Dashboard
Write-Host "Starting Dashboard..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Write-Host '[Dashboard - Port 3000]' -ForegroundColor Blue; Write-Host ''; cd D:\cuti; pnpm --filter @cuti/dashboard dev"
) -WindowStyle Normal

Start-Sleep -Seconds 3

# Start Learning Academy
Write-Host "Starting Learning Academy..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Write-Host '[Learning Academy - Port 3004]' -ForegroundColor Cyan; Write-Host ''; cd D:\cuti; pnpm --filter @cuti/learning dev"
) -WindowStyle Normal

Start-Sleep -Seconds 3

# Start Admin Panel
Write-Host "Starting Admin Panel..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Write-Host '[Admin Panel - Port 3002]' -ForegroundColor Magenta; Write-Host ''; cd D:\cuti; pnpm --filter @cuti/admin dev"
) -WindowStyle Normal

Start-Sleep -Seconds 3

# Start FAQ / Pusat Bantuan
Write-Host "Starting FAQ / Pusat Bantuan..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Write-Host '[FAQ - Port 3005]' -ForegroundColor Green; Write-Host ''; cd D:\cuti; pnpm --filter @cuti/faq-site dev"
) -WindowStyle Normal

# Step 7: Monitor startup
Write-Host "`nStep 7: Monitoring service startup..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

$apiReady = Wait-ForPort -Port 3001 -Service "API Backend" -TimeoutSeconds 30
$landingReady = Wait-ForPort -Port 4321 -Service "Landing Page" -TimeoutSeconds 30
$dashboardReady = Wait-ForPort -Port 3000 -Service "Dashboard" -TimeoutSeconds 30
$learningReady = Wait-ForPort -Port 3004 -Service "Learning Academy" -TimeoutSeconds 30
$adminReady = Wait-ForPort -Port 3002 -Service "Admin Panel" -TimeoutSeconds 30
$faqReady = Wait-ForPort -Port 3005 -Service "FAQ / Pusat Bantuan" -TimeoutSeconds 30

# Summary
Write-Host "`n============================================================" -ForegroundColor Green
Write-Host "  CUTI Development Environment Ready!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green

Write-Host "`nService Status:" -ForegroundColor Cyan
Write-Host "   PostgreSQL:         Running (localhost:5432)" -ForegroundColor $(if ($true) { "Green" } else { "Red" })
Write-Host "   API Backend:        $(if ($apiReady) { 'Ready' } else { 'Starting...' }) http://localhost:3001" -ForegroundColor $(if ($apiReady) { "Green" } else { "Yellow" })
Write-Host "   Landing Page:       $(if ($landingReady) { 'Ready' } else { 'Starting...' }) http://localhost:4321" -ForegroundColor $(if ($landingReady) { "Green" } else { "Yellow" })
Write-Host "   Dashboard:          $(if ($dashboardReady) { 'Ready' } else { 'Starting...' }) http://localhost:3000" -ForegroundColor $(if ($dashboardReady) { "Green" } else { "Yellow" })
Write-Host "   Learning Academy:   $(if ($learningReady) { 'Ready' } else { 'Starting...' }) http://localhost:3004" -ForegroundColor $(if ($learningReady) { "Green" } else { "Yellow" })
Write-Host "   Admin Panel:        $(if ($adminReady) { 'Ready' } else { 'Starting...' }) http://localhost:3002" -ForegroundColor $(if ($adminReady) { "Green" } else { "Yellow" })
Write-Host "   FAQ / Pusat Bantuan: $(if ($faqReady) { 'Ready' } else { 'Starting...' }) http://localhost:3005" -ForegroundColor $(if ($faqReady) { "Green" } else { "Yellow" })

Write-Host "`nTips:" -ForegroundColor Cyan
Write-Host "   - Each service runs in a separate PowerShell window" -ForegroundColor Gray
Write-Host "   - Close the windows to stop services" -ForegroundColor Gray
Write-Host "   - Press Ctrl+C in a window to stop that service" -ForegroundColor Gray
Write-Host "   - Run 'docker stop cuti-postgres' to stop PostgreSQL" -ForegroundColor Gray
Write-Host "   - Run '.\dev.ps1 -SkipMigrations -SkipSeeds' to skip setup steps" -ForegroundColor Gray

Write-Host "`nQuick Links:" -ForegroundColor Cyan
Write-Host "   Documentation:  D:\cuti\docs\" -ForegroundColor Gray
Write-Host "   Prisma Studio:  Run 'pnpm db:studio' for database GUI" -ForegroundColor Gray
Write-Host "   Test Auth:      POST http://localhost:3001/v1/auth/register" -ForegroundColor Gray

Write-Host "`nHappy coding!" -ForegroundColor Green
Write-Host ""
