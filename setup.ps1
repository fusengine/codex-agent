# Fusengine Plugins - Quick Setup for Windows
# Run: .\setup.ps1

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "◆ Fusengine Plugins Setup (Windows)" -ForegroundColor Cyan

# Check Bun
if (-not (Get-Command bun -ErrorAction SilentlyContinue)) {
    Write-Host "✗ Bun not found. Install from https://bun.sh" -ForegroundColor Red
    exit 1
}

# Install dependencies and run setup
Push-Location "$ScriptDir\scripts"
try {
    bun install
    bun install-hooks.ts
} finally {
    Pop-Location
}
