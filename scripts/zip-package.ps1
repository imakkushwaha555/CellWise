# Create the requested add-in ZIP using the .NET compression library included with Windows.
param(
    [Parameter(Mandatory = $true)]
    [string]$SourcePath,
    [Parameter(Mandatory = $true)]
    [string]$DestinationPath
)

$ErrorActionPreference = 'Stop'
$source = (Resolve-Path -LiteralPath $SourcePath).Path
$destination = [System.IO.Path]::GetFullPath($DestinationPath)

if (-not (Test-Path -LiteralPath $source -PathType Container)) {
    throw "Package source is not a directory: $source"
}
if (Test-Path -LiteralPath $destination) {
    Remove-Item -LiteralPath $destination -Force
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory(
    $source,
    $destination,
    [System.IO.Compression.CompressionLevel]::Optimal,
    $false
)
