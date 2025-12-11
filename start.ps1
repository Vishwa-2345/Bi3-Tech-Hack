# ClearPath AI Signals - Startup Script
# This script starts all services in separate PowerShell windows

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   ClearPath AI Signals Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = $PSScriptRoot

# Check if MongoDB is running
Write-Host "Checking MongoDB..." -ForegroundColor Yellow
$mongoProcess = Get-Process mongod -ErrorAction SilentlyContinue
if ($null -eq $mongoProcess) {
    Write-Host "⚠️  MongoDB is not running!" -ForegroundColor Red
    Write-Host "   Please start MongoDB first:" -ForegroundColor Yellow
    Write-Host "   mongod" -ForegroundColor White
    Write-Host ""
    $startMongo = Read-Host "Start MongoDB now? (y/n)"
    if ($startMongo -eq 'y') {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "mongod"
        Start-Sleep -Seconds 3
    }
}

# Start Backend
Write-Host ""
Write-Host "Starting Backend Service..." -ForegroundColor Green
$backendPath = Join-Path $projectRoot "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host '🚀 Backend Server' -ForegroundColor Green; npm start"

Start-Sleep -Seconds 5

# Start CV Service
Write-Host "Starting CV Service..." -ForegroundColor Green
$cvPath = Join-Path $projectRoot "cv-service"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$cvPath'; Write-Host '🤖 CV Service' -ForegroundColor Green; .\venv\Scripts\Activate.ps1; python main.py"

Start-Sleep -Seconds 5

# Start Frontend
Write-Host "Starting Frontend..." -ForegroundColor Green
$frontendPath = Join-Path $projectRoot "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host '🎨 Frontend' -ForegroundColor Green; npm start"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ All services starting!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services:" -ForegroundColor Cyan
Write-Host "  📱 Frontend:   http://localhost:3000" -ForegroundColor White
Write-Host "  ⚙️  Backend:    http://localhost:5000" -ForegroundColor White
Write-Host "  🤖 CV Service: http://localhost:8000" -ForegroundColor White
Write-Host "  💾 MongoDB:    mongodb://localhost:27017" -ForegroundColor White
Write-Host ""
Write-Host "Check each window for startup logs" -ForegroundColor Yellow
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
