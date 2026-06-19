# start_dev.ps1 — Jalankan Backend + Frontend sekaligus
# Usage: .\start_dev.ps1

Write-Host "🚀 LungAI Development Server" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

# Refresh PATH untuk Python dan Node
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")

# Cek Python
$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
$pythonPath = if ($pythonCmd) { $pythonCmd.Source } else { $null }
if (-not $pythonPath) {
    Write-Host "❌ Python tidak ditemukan. Install Python 3.11+ terlebih dahulu." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Python: $pythonPath" -ForegroundColor Green

# Cek Node
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
$nodePath = if ($nodeCmd) { $nodeCmd.Source } else { $null }
if (-not $nodePath) {
    Write-Host "❌ Node.js tidak ditemukan. Install Node.js terlebih dahulu." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js: $nodePath" -ForegroundColor Green
Write-Host ""

# Cek & Install node_modules jika belum ada
if (-not (Test-Path "$PSScriptRoot\frontend\node_modules")) {
    Write-Host "📦 node_modules tidak ditemukan. Melakukan instalasi dependency frontend..." -ForegroundColor Yellow
    Set-Location "$PSScriptRoot\frontend"
    npm install
    Set-Location $PSScriptRoot
    Write-Host "✅ Instalasi dependency selesai." -ForegroundColor Green
    Write-Host ""
}

Write-Host "🔧 Menjalankan Backend FastAPI (http://localhost:8000)..." -ForegroundColor Yellow
$backend = Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "`$env:PATH = [System.Environment]::GetEnvironmentVariable('PATH','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('PATH','User'); Set-Location '$PSScriptRoot\backend'; python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"
) -PassThru

Start-Sleep -Seconds 2

Write-Host "🎨 Menjalankan Frontend Express/React (http://localhost:3000)..." -ForegroundColor Magenta
$frontend = Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$PSScriptRoot\frontend'; npm run dev"
) -PassThru

Write-Host ""
Write-Host "✨ Kedua server berjalan!" -ForegroundColor Green
Write-Host "   Backend  → http://localhost:8000" -ForegroundColor Cyan
Write-Host "   Frontend → http://localhost:3000" -ForegroundColor Cyan
Write-Host "   API Docs → http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tekan Enter untuk menghentikan semua server..." -ForegroundColor Gray
Read-Host

# Cleanup
Stop-Process -Id $backend.Id -ErrorAction SilentlyContinue
Stop-Process -Id $frontend.Id -ErrorAction SilentlyContinue
Write-Host "🛑 Server dihentikan." -ForegroundColor Red
