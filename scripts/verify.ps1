[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$projectRoot = Split-Path -Parent $PSScriptRoot
$manifestPath = Join-Path $projectRoot 'manifest.json'

if (-not (Test-Path -LiteralPath $manifestPath)) {
  throw "manifest.json was not found: $manifestPath"
}

try {
  $manifest = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
} catch {
  throw "manifest.json is not valid JSON: $($_.Exception.Message)"
}

if ($manifest.manifest_version -ne 3) {
  throw 'Only Manifest V3 is supported.'
}

foreach ($requiredPath in @(
  'background/service-worker.js',
  'content/content.js',
  'content/content.css',
  'data/terms.js',
  'data/extended-terms.js',
  'popup/popup.html',
  'review/review.html',
  'assets/icon-16.png',
  'assets/icon-32.png',
  'assets/icon-48.png',
  'assets/icon-128.png'
)) {
  $absolutePath = Join-Path $projectRoot $requiredPath
  if (-not (Test-Path -LiteralPath $absolutePath)) {
    throw "Required runtime file is missing: $requiredPath"
  }
}

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
  throw 'Node.js was not found. Install Node.js to run the JavaScript syntax checks.'
}

$scripts = Get-ChildItem -LiteralPath $projectRoot -Recurse -File -Filter '*.js'
foreach ($script in $scripts) {
  & $node.Source --check $script.FullName
  if ($LASTEXITCODE -ne 0) {
    throw "JavaScript syntax check failed: $($script.FullName)"
  }
}

Write-Host "Verification passed: Manifest V$($manifest.manifest_version), version $($manifest.version), $($scripts.Count) JavaScript files." -ForegroundColor Green
