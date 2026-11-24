# Remove the per-user Cellwise shared-folder registration and installed local files.
param(
    [switch]$KeepShareManifest
)

$ErrorActionPreference = 'Stop'
$catalogId = '643a19ec-9949-4572-9d79-013290c0787a'
$addinId = 'e1f74c30-625a-4135-9f0a-4dd06dfb1240'
$catalogKey = "Registry::HKEY_CURRENT_USER\Software\Microsoft\Office\16.0\WEF\TrustedCatalogs\{$catalogId}"
$appKey = 'Registry::HKEY_CURRENT_USER\Software\Cellwise'
$uninstallKey = 'Registry::HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Uninstall\Cellwise'

try {
    $catalog = Get-ItemProperty -LiteralPath $catalogKey -ErrorAction SilentlyContinue
    if ($catalog -and -not $KeepShareManifest) {
        $manifestPath = Join-Path -LiteralPath $catalog.Url -ChildPath "Cellwise-$addinId.xml"
        if (Test-Path -LiteralPath $manifestPath -PathType Leaf) {
            Remove-Item -LiteralPath $manifestPath -Force
        }
    }

    Remove-Item -LiteralPath $catalogKey -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $appKey -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $uninstallKey -Recurse -Force -ErrorAction SilentlyContinue

    $installDir = Join-Path $env:LOCALAPPDATA 'Programs\Cellwise'
    if (Test-Path -LiteralPath $installDir -PathType Container) {
        Remove-Item -LiteralPath $installDir -Recurse -Force
    }

    Write-Output 'Cellwise removed from this Windows user.'
    Write-Output 'Close and reopen Word, then check that SHARED FOLDER no longer lists Cellwise.'
}
catch {
    Write-Error "Could not remove Cellwise: $($_.Exception.Message)"
    exit 1
}
