# Report whether this user's documented trusted-share catalog is registered.
param(
    [string]$CatalogId = '643a19ec-9949-4572-9d79-013290c0787a',
    [string]$AddinId = 'e1f74c30-625a-4135-9f0a-4dd06dfb1240'
)

$ErrorActionPreference = 'Stop'
$catalogKey = "Registry::HKEY_CURRENT_USER\Software\Microsoft\Office\16.0\WEF\TrustedCatalogs\{$CatalogId}"
$appKey = 'Registry::HKEY_CURRENT_USER\Software\Cellwise'

try {
    $catalog = Get-ItemProperty -LiteralPath $catalogKey
    $app = Get-ItemProperty -LiteralPath $appKey
    $manifestPath = Join-Path -Path $catalog.Url -ChildPath "Cellwise-$AddinId.xml"

    if ($catalog.Id -ne "{$CatalogId}" -or $catalog.Flags -ne 1) {
        throw 'The trusted catalog ID or visibility flag is invalid.'
    }
    if ($catalog.Url -notmatch '^\\\\[^\\]+\\[^\\]+') {
        throw 'The trusted catalog is not registered as a UNC network share.'
    }
    if (-not (Test-Path -LiteralPath $manifestPath -PathType Leaf)) {
        throw "The registered catalog manifest is missing: $manifestPath"
    }

    [xml]$manifest = Get-Content -LiteralPath $manifestPath -Raw
    $manifestId = $manifest.DocumentElement.SelectSingleNode("*[local-name()='Id']").InnerText
    $sourceNode = $manifest.DocumentElement.SelectSingleNode("*[local-name()='DefaultSettings']/*[local-name()='SourceLocation']")
    if ($manifestId -ne $AddinId) {
        throw 'The manifest ID does not match the Cellwise add-in ID.'
    }
    if ($null -eq $sourceNode) {
        throw 'The manifest has no default SourceLocation.'
    }
    if ($catalog.Url -ne $app.CatalogUrl) {
        throw 'The Office catalog URL and Cellwise install record do not match.'
    }
    $sourceUrl = $sourceNode.GetAttribute('DefaultValue')
    if ($sourceUrl -notmatch '^https://') {
        throw 'The manifest does not point to an HTTPS add-in URL.'
    }

    Write-Output 'Cellwise registration: OK'
    Write-Output "Catalog: $($catalog.Url)"
    Write-Output "Manifest: $manifestPath"
    Write-Output "Add-in URL: $sourceUrl"
    exit 0
}
catch {
    Write-Error "Cellwise registration: NOT OK - $($_.Exception.Message)"
    exit 1
}
