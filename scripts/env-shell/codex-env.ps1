# Codex - Load API keys from CODEX_HOME/.env
# Add to $PROFILE: . /path/to/codex-env.ps1

$codexHome = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $env:USERPROFILE ".codex" }
$envFile = Join-Path $codexHome ".env"

if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*export\s+(\w+)=["'']?([^"'']+)["'']?\s*$') {
            [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
        elseif ($_ -match '^\s*(\w+)=["'']?([^"'']+)["'']?\s*$') {
            [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
}
