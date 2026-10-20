[CmdletBinding()]
param(
  [switch]$SkipVerification
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$projectRoot = Split-Path -Parent $PSScriptRoot
$manifestPath = Join-Path $projectRoot 'manifest.json'

if (-not $SkipVerification) {
  & (Join-Path $PSScriptRoot 'verify.ps1')
}

$manifest = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
$outputDirectory = Join-Path $projectRoot 'dist'
$archivePath = Join-Path $outputDirectory ("github-english-coach-v{0}.zip" -f $manifest.version)

New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null

$runtimeItems = @(
  (Join-Path $projectRoot 'manifest.json'),
  (Join-Path $projectRoot 'background'),
  (Join-Path $projectRoot 'content'),
  (Join-Path $projectRoot 'data'),
  (Join-Path $projectRoot 'popup'),
  (Join-Path $projectRoot 'review'),
  (Join-Path $projectRoot 'assets')
)

Compress-Archive -LiteralPath $runtimeItems -DestinationPath $archivePath -Force
Write-Host "Store package created: $archivePath" -ForegroundColor Green
