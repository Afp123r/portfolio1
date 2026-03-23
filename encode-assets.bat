@echo off
echo Starting Asset Encoding Process...
echo.

REM Create encoded directory
if not exist "encoded" mkdir encoded
if not exist "encoded\images" mkdir encoded\images

echo Encoding HTML files...
powershell -Command "
$encoder = @'
function Base64-Encode {
    param([string]$text)
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($text)
    return [Convert]::ToBase64String($bytes)
}

function Encode-Image {
    param([string]$imagePath)
    try {
        $bytes = [System.IO.File]::ReadAllBytes($imagePath)
        $base64 = [Convert]::ToBase64String($bytes)
        $extension = [System.IO.Path]::GetExtension($imagePath).ToLower()
        $mimeType = switch ($extension) {
            '.png' { 'image/png' }
            '.jpg' { 'image/jpeg' }
            '.jpeg' { 'image/jpeg' }
            '.gif' { 'image/gif' }
            '.webp' { 'image/webp' }
            '.svg' { 'image/svg+xml' }
            default { 'application/octet-stream' }
        }
        return 'data:' + $mimeType + ';base64,' + $base64
    } catch {
        Write-Warning 'Failed to encode: ' + $imagePath
        return $null
    }
}

# Encode HTML
$html = Get-Content 'public\index.html' -Raw
$encodedHtml = Base64-Encode $html
$encodedHtml | Out-File 'encoded\index-encoded.html' -Encoding UTF8

# Encode CSS if exists
if (Test-Path 'public\style.css') {
    $css = Get-Content 'public\style.css' -Raw
    $encodedCss = Base64-Encode $css
    $encodedCss | Out-File 'encoded\style-encoded.css' -Encoding UTF8
}

# Encode all images
Get-ChildItem 'public\images' -File | ForEach-Object {
    $dataUrl = Encode-Image $_.FullName
    if ($dataUrl) {
        $dataUrl | Out-File "encoded\images\$($_.BaseName)-encoded.txt" -Encoding UTF8
        Write-Host 'Encoded: ' $_.Name
    }
}
'@

Invoke-Expression $encoder
"

echo.
echo Encoding complete!
echo Encoded files saved in 'encoded' directory
echo.
echo Generated files:
echo - index-encoded.html (base64 encoded HTML)
if exist "public\style.css" echo - style-encoded.css (base64 encoded CSS)
echo - Image files in encoded\images\ (data URLs)
echo.
echo You can now use these encoded files in your projects
echo without requiring external assets!
pause
