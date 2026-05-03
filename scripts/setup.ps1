# One-time local setup for Urbanova (PowerShell).
# Run from repo root:  .\scripts\setup.ps1

$ErrorActionPreference = "Stop"
$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = (Resolve-Path (Join-Path $ScriptRoot "..")).Path
Set-Location $Root

$envExample = Join-Path $Root "server\.env.example"
$envFile = Join-Path $Root "server\.env"

if (-not (Test-Path $envFile)) {
    if (Test-Path $envExample) {
        Copy-Item $envExample $envFile
        Write-Host "Created server\.env from .env.example — edit it with your Supabase keys."
    }
    else {
        Write-Host "Missing server\.env.example — create server\.env manually."
    }
}
else {
    Write-Host "server\.env already exists — skipped copy."
}

Write-Host "Installing npm dependencies..."
npm install
Push-Location (Join-Path $Root "server")
npm install
Pop-Location
Push-Location (Join-Path $Root "client")
npm install
Pop-Location

Write-Host "=== Supabase (browser) ===" -ForegroundColor Cyan
Write-Host "1. If tables are new: paste sql/schema.sql into the SQL editor."
Write-Host "2. Prefer full bootstrap when available: sql/bootstrap_estate_dev.sql"
Write-Host "3. Fix RLS for local demo: paste sql/supabase_disable_rls_dev.sql"
Write-Host ""
Write-Host "=== This machine ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Then: npm run check:env"
Write-Host "Then: npm run create:admin   (creates admin / admin123 after RLS fix)"
Write-Host "Then: npm run seed:hyderabad   (14 demo Hyderabad listings)"
Write-Host "Then: npm run dev"
Write-Host ""
