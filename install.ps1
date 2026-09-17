# install.ps1 — one-command installer for the deepseek-harness-rtl plugin.
#
# Adds the package as a real dependency of your DSH profile (so a later
# `pnpm install` keeps it) and writes the `ui-rtl-fix` browser-plugin row into
# that profile's cordis.patch.yml.
#
# Activation: the shipped `web` profile declares `patchReload: live`, so a valid
# patch edit is composed into the running host without a restart — reload the
# browser tab. A profile declared `patchReload: startup` needs one web-app
# restart instead (see `dsh.profile.patchReload` in the profile package.json).
#
# Usage:
#   pwsh -File install.ps1                  # from npm, into the "web" profile
#   pwsh -File install.ps1 -Profile myweb   # another profile
#   pwsh -File install.ps1 -Local           # link this folder instead of npm
#   pwsh -File install.ps1 -PatchOnly       # rewrite only cordis.patch.yml
#
# Idempotent: re-running refreshes the dependency and leaves an existing patch
# row untouched. A freshly initialized profile ships an EMPTY patch layer
# (`[]`), which cannot take an appended list item — the `[]` is replaced rather
# than appended to, so the file stays valid YAML.

param(
    [string]$Profile = "web",
    [switch]$Local,
    [switch]$PatchOnly
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

# 1) Dependency. `link:` keeps the local folder as the single source of truth;
#    the npm form pins a published version. Either way it lands in the
#    profile's package.json, which is what survives the next install.
if (-not $PatchOnly) {
    if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
        Write-Host "ERROR: pnpm not found on PATH. Install pnpm first: https://pnpm.io/installation" -ForegroundColor Red
        Write-Host "Use -PatchOnly to skip the dependency step." -ForegroundColor Yellow
        exit 1
    }
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
}

# 2) The patch row (the browser-client plugin the modules node scans into the
#    boot graph).
$patch = Join-Path $profDir "cordis.patch.yml"
$content = if (Test-Path $patch) { Get-Content -Path $patch -Raw } else { "" }
if ($null -eq $content) { $content = "" }

if ($content -match [regex]::Escape($PackageName)) {
    Write-Host "Patch row already present; skipping." -ForegroundColor Yellow
}
else {
    $block = @"
# Permanent Arabic (RTL) text fix ($PackageName)
- insert:
    - id: ui-rtl-fix
      name: '$PackageName'
"@ -replace "`r`n", "`n"

    # Drop the empty-array marker: `[]` and `- insert:` cannot share a document.
    $lines = @($content -split "`r?`n" | Where-Object { $_.Trim() -ne '[]' })
    $header = @($lines | Where-Object { $_ -match '^\s*#' }) -join "`n"
    $entries = @($lines | Where-Object { $_ -notmatch '^\s*#' -and $_.Trim() -ne '' }) -join ''

    if ($entries -eq '') {
        # Empty patch layer (with or without its explanatory header comment).
        $merged = (@($header, $block) | Where-Object { $_ -ne '' }) -join "`n`n"
    }
    else {
        $merged = ($lines -join "`n").TrimEnd() + "`n`n" + $block
    }

    # BOM-free UTF-8: the YAML loader reads the profile layer as plain text.
    [System.IO.File]::WriteAllText($patch, $merged.TrimEnd() + "`n", (New-Object System.Text.UTF8Encoding($false)))
    Write-Host "Patch row written to $patch" -ForegroundColor Green
}

Write-Host ""
Write-Host "Installed into profile: $Profile" -ForegroundColor Green
Write-Host "Reload the browser tab to pick the fix up." -ForegroundColor Cyan
Write-Host "Verify: http://127.0.0.1:3080/plugins/events must list a row whose id is '$PackageName'." -ForegroundColor Cyan
