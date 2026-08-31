# install.ps1 — one-command installer for the deepseek-harness-rtl plugin.
#
# Adds the package as a real dependency of your DSH profile (so a later
# `pnpm install` keeps it) and appends the `ui-rtl-fix` browser-plugin row to
# that profile's cordis.patch.yml. Restart the web app once afterwards — the
# loader reads the composition at start.
#
# Usage:
#   pwsh -File install.ps1                  # from npm, into the "web" profile
#   pwsh -File install.ps1 -Profile myweb   # another profile
#   pwsh -File install.ps1 -Local           # link this folder instead of npm
#
# Idempotent: re-running refreshes the dependency and leaves an existing patch
# row untouched.

param(
    [string]$Profile = "web",
    [switch]$Local
)

$ErrorActionPreference = "Stop"

$PackageName = "deepseek-harness-rtl"

$dshHome = if ($env:DSH_HOME) { $env:DSH_HOME } else { Join-Path $env:USERPROFILE ".dsh" }
$profDir = Join-Path $dshHome "profiles\$Profile"

if (-not (Test-Path $profDir)) {
    Write-Host "ERROR: profile directory not found: $profDir" -ForegroundColor Red
    Write-Host "Start the Harness web app once so the profile is created, or pass -Profile <name>." -ForegroundColor Yellow
    exit 1
}
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: pnpm not found on PATH. Install pnpm first: https://pnpm.io/installation" -ForegroundColor Red
    exit 1
}

# 1) Dependency. `link:` keeps the local folder as the single source of truth;
#    the npm form pins a published version. Either way it lands in the
#    profile's package.json, which is what survives the next install.
$spec = if ($Local) { "link:$PSScriptRoot" } else { $PackageName }
Write-Host "Adding $spec to profile '$Profile'..." -ForegroundColor Cyan
Push-Location $profDir
try {
    pnpm add $spec
    if ($LASTEXITCODE -ne 0) { throw "pnpm add failed with exit code $LASTEXITCODE" }
}
finally {
    Pop-Location
}

# 2) The patch row (the browser-client plugin the modules node scans into the
#    boot graph).
$patch = Join-Path $profDir "cordis.patch.yml"
if (-not (Test-Path $patch)) {
    Set-Content -Path $patch -Value "# dsh profile patch layer" -Encoding utf8
}

$content = Get-Content $patch -Raw
if ($content -match [regex]::Escape($PackageName)) {
    Write-Host "Patch row already present; skipping append." -ForegroundColor Yellow
} else {
    $block = @"

# Permanent Arabic (RTL) text fix ($PackageName)
- insert:
    - id: ui-rtl-fix
      name: '$PackageName'
"@
    Add-Content -Path $patch -Value $block -Encoding utf8
    Write-Host "Patch row appended to $patch" -ForegroundColor Green
}

Write-Host ""
Write-Host "Installed into profile: $Profile" -ForegroundColor Green
Write-Host "Restart the Harness web app once to activate the fix." -ForegroundColor Cyan
