# Universal Project Encoder - PowerShell Version
# Encodes entire project structure without npm
# Usage: .\encode-all.ps1

param(
    [string]$SourcePath = ".",
    [string]$OutputPath = ".\encoded-project",
    [switch]$IncludeHidden = $false
)

# Initialize encoder
Write-Host "🔐 Universal Project Encoder" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green
Write-Host "Source: $SourcePath" -ForegroundColor Yellow
Write-Host "Output: $OutputPath" -ForegroundColor Yellow
Write-Host ""

# Create output directory
if (Test-Path $OutputPath) {
    Remove-Item $OutputPath -Recurse -Force
}
New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null

# Encoder functions
function Base64-Encode {
    param([string]$Text)
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($Text)
    return [Convert]::ToBase64String($bytes)
}

function Base64-Decode {
    param([string]$Base64)
    $bytes = [Convert]::FromBase64String($Base64)
    return [System.Text.Encoding]::UTF8.GetString($bytes)
}

function Get-FileMimeType {
    param([string]$Extension)
    $ext = $Extension.ToLower()
    $mimeTypes = @{
        '.png' = 'image/png'
        '.jpg' = 'image/jpeg'
        '.jpeg' = 'image/jpeg'
        '.gif' = 'image/gif'
        '.webp' = 'image/webp'
        '.svg' = 'image/svg+xml'
        '.ico' = 'image/x-icon'
        '.bmp' = 'image/bmp'
        '.html' = 'text/html'
        '.htm' = 'text/html'
        '.css' = 'text/css'
        '.js' = 'application/javascript'
        '.json' = 'application/json'
        '.xml' = 'text/xml'
        '.txt' = 'text/plain'
        '.md' = 'text/markdown'
        '.ts' = 'application/typescript'
        '.tsx' = 'application/typescript'
        '.jsx' = 'application/javascript'
        '.pdf' = 'application/pdf'
        '.zip' = 'application/zip'
        '.rar' = 'application/x-rar-compressed'
        '.exe' = 'application/x-msdownload'
        '.dll' = 'application/x-msdownload'
        '.woff' = 'font/woff'
        '.woff2' = 'font/woff2'
        '.ttf' = 'font/ttf'
        '.eot' = 'application/vnd.ms-fontobject'
    }
    return $mimeTypes[$ext] ?? 'application/octet-stream'
}

function Get-FileType {
    param([string]$Extension)
    $ext = $Extension.ToLower()
    $imageTypes = @('.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.bmp')
    $textTypes = @('.html', '.htm', '.css', '.js', '.json', '.xml', '.txt', '.md', '.ts', '.tsx', '.jsx')
    $binaryTypes = @('.pdf', '.zip', '.rar', '.exe', '.dll', '.woff', '.woff2', '.ttf', '.eot')
    
    if ($imageTypes -contains $ext) { return 'image' }
    if ($textTypes -contains $ext) { return 'text' }
    if ($binaryTypes -contains $ext) { return 'binary' }
    return 'unknown'
}

function Encode-File {
    param([string]$FilePath, [string]$RelativePath)
    
    try {
        $file = Get-Item $FilePath
        $extension = $file.Extension
        $fileType = Get-FileType -Extension $extension
        $mimeType = Get-FileMimeType -Extension $extension
        $size = $file.Length
        $lastModified = $file.LastWriteTime.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        
        Write-Host "Encoding: $RelativePath" -ForegroundColor Cyan
        
        if ($fileType -eq 'image') {
            # Encode image as data URL
            $bytes = [System.IO.File]::ReadAllBytes($FilePath)
            $base64 = [Convert]::ToBase64String($bytes)
            $encoded = "data:$mimeType;base64,$base64"
        }
        elseif ($fileType -eq 'text') {
            # Encode text content
            $content = [System.IO.File]::ReadAllText($FilePath, [System.Text.Encoding]::UTF8)
            $encoded = Base64-Encode -Text $content
        }
        else {
            # Encode binary as data URL
            $bytes = [System.IO.File]::ReadAllBytes($FilePath)
            $base64 = [Convert]::ToBase64String($bytes)
            $encoded = "data:$mimeType;base64,$base64"
        }
        
        return @{
            name = $file.Name
            path = $RelativePath
            type = $fileType
            mimeType = $mimeType
            size = $size
            encoded = $encoded
            lastModified = $lastModified
        }
    }
    catch {
        Write-Host "Error encoding $RelativePath`: $_" -ForegroundColor Red
        return $null
    }
}

# Scan and encode all files
Write-Host "Scanning files..." -ForegroundColor Yellow
$encodedFiles = @()
$totalFiles = 0
$totalSize = 0

$files = Get-ChildItem -Path $SourcePath -Recurse -File
if (-not $IncludeHidden) {
    $files = $files | Where-Object { $_.Attributes -notmatch "Hidden" }
}

foreach ($file in $files) {
    $relativePath = $file.FullName.Replace((Resolve-Path $SourcePath).Path, "").TrimStart('\', '/')
    
    # Skip encoder script files
    if ($relativePath -match '\.(ps1|bat|cmd)$' -and $relativePath -match 'encode') {
        continue
    }
    
    $encodedFile = Encode-File -FilePath $file.FullName -RelativePath $relativePath
    if ($encodedFile) {
        $encodedFiles += $encodedFile
        $totalFiles++
        $totalSize += $encodedFile.size
    }
}

Write-Host ""
Write-Host "Encoding complete!" -ForegroundColor Green
Write-Host "Total files: $totalFiles" -ForegroundColor Yellow
Write-Host "Total size: $([math]::Round($totalSize / 1MB, 2)) MB" -ForegroundColor Yellow
Write-Host ""

# Create project structure
$projectData = @{
    metadata = @{
        totalFiles = $totalFiles
        totalSize = $totalSize
        encodedAt = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        version = "1.0.0"
        sourcePath = $SourcePath
    }
    files = @{}
}

foreach ($file in $encodedFiles) {
    $projectData.files[$file.path] = @{
        name = $file.name
        type = $file.type
        mimeType = $file.mimeType
        size = $file.size
        encoded = $file.encoded
        lastModified = $file.lastModified
    }
}

# Save encoded data
$encodedJson = $projectData | ConvertTo-Json -Depth 10
$encodedJsonBase64 = Base64-Encode -Text $encodedJson
$encodedJsonBase64 | Out-File -FilePath "$OutputPath\project-data.b64" -Encoding UTF8

Write-Host "Creating viewer HTML..." -ForegroundColor Yellow

# Create HTML viewer
$htmlContent = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🔐 Encoded Project Viewer</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%);
            color: #fff;
            min-height: 100vh;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
        }
        .header {
            text-align: center;
            margin-bottom: 3rem;
            animation: fadeInDown 0.8s ease-out;
        }
        .header h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            background: linear-gradient(45deg, #00ff88, #00ccff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .header p {
            font-size: 1.2rem;
            opacity: 0.8;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }
        .stat-card {
            background: rgba(255,255,255,0.05);
            padding: 1.5rem;
            border-radius: 15px;
            backdrop-filter: blur(10px);
            text-align: center;
            border: 1px solid rgba(255,255,255,0.1);
            transition: transform 0.3s, box-shadow 0.3s;
            animation: fadeInUp 0.8s ease-out;
        }
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0,255,136,0.1);
        }
        .stat-number {
            font-size: 2.5rem;
            font-weight: bold;
            color: #00ff88;
            margin-bottom: 0.5rem;
        }
        .stat-label {
            font-size: 0.9rem;
            opacity: 0.8;
        }
        .main-content {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 2rem;
            animation: fadeIn 1s ease-out;
        }
        .file-browser {
            background: rgba(255,255,255,0.05);
            border-radius: 15px;
            padding: 1.5rem;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1);
            max-height: 600px;
            overflow-y: auto;
        }
        .file-viewer {
            background: rgba(255,255,255,0.05);
            border-radius: 15px;
            padding: 1.5rem;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1);
            max-height: 600px;
            overflow-y: auto;
        }
        .search-box {
            width: 100%;
            padding: 1rem;
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 10px;
            color: #fff;
            margin-bottom: 1rem;
            font-size: 1rem;
        }
        .search-box::placeholder {
            color: rgba(255,255,255,0.6);
        }
        .file-tree {
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
        }
        .file-item {
            padding: 0.75rem;
            cursor: pointer;
            border-radius: 8px;
            transition: background 0.3s;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.25rem;
        }
        .file-item:hover {
            background: rgba(255,255,255,0.1);
        }
        .file-item.active {
            background: rgba(0,255,136,0.2);
            border: 1px solid rgba(0,255,136,0.3);
        }
        .file-icon {
            width: 20px;
            height: 20px;
            display: inline-block;
        }
        .file-path {
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .file-size {
            font-size: 0.8rem;
            opacity: 0.7;
            white-space: nowrap;
        }
        .file-content {
            animation: fadeIn 0.5s ease-out;
        }
        .file-header {
            border-bottom: 1px solid rgba(255,255,255,0.1);
            padding-bottom: 1rem;
            margin-bottom: 1rem;
        }
        .file-header h3 {
            color: #00ff88;
            margin-bottom: 0.5rem;
            word-break: break-all;
        }
        .file-meta {
            display: flex;
            gap: 1rem;
            font-size: 0.9rem;
            opacity: 0.8;
        }
        .file-body {
            max-height: 400px;
            overflow-y: auto;
        }
        .file-body pre {
            background: rgba(0,0,0,0.3);
            padding: 1rem;
            border-radius: 8px;
            overflow-x: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
            font-size: 0.85rem;
            line-height: 1.5;
        }
        .file-body img {
            max-width: 100%;
            height: auto;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .download-btn {
            background: linear-gradient(45deg, #00ff88, #00ccff);
            color: #000;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 25px;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.3s, box-shadow 0.3s;
            margin-top: 1rem;
        }
        .download-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(0,255,136,0.3);
        }
        .empty-state {
            text-align: center;
            padding: 3rem;
            opacity: 0.6;
        }
        .empty-state-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
            .main-content {
                grid-template-columns: 1fr;
            }
            .header h1 {
                font-size: 2rem;
            }
            .stats {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Encoded Project Viewer</h1>
            <p>All $(($totalFiles)) files encoded and embedded in this single HTML file</p>
        </div>
        
        <div class="stats" id="stats">
            <div class="stat-card">
                <div class="stat-number">$totalFiles</div>
                <div class="stat-label">Total Files</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">$([math]::Round($totalSize / 1MB, 2)) MB</div>
                <div class="stat-label">Total Size</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">$(($encodedFiles | Where-Object { $_.type -eq 'image' }).Count)</div>
                <div class="stat-label">Images</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">$(($encodedFiles | Where-Object { $_.type -eq 'text' }).Count)</div>
                <div class="stat-label">Text Files</div>
            </div>
        </div>
        
        <div class="main-content">
            <div class="file-browser">
                <input type="text" class="search-box" placeholder="🔍 Search files..." id="searchBox">
                <div class="file-tree" id="fileTree">
                    <!-- File tree will be populated by JavaScript -->
                </div>
            </div>
            
            <div class="file-viewer">
                <div id="fileContent">
                    <div class="empty-state">
                        <div class="empty-state-icon">📁</div>
                        <p>Select a file to view its content</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Encoded project data
        const encodedProjectData = '$encodedJsonBase64';
        
        // Decoder utilities
        const decoder = {
            decode: (str) => {
                try {
                    return decodeURIComponent(escape(atob(str)));
                } catch (e) {
                    return atob(str);
                }
            },
            
            decodeProject: () => {
                return JSON.parse(decoder.decode(encodedProjectData));
            }
        };
        
        // Project data
        let projectData = decoder.decodeProject();
        let currentFile = null;
        
        // File type icons
        const fileIcons = {
            'image': '🖼️',
            'text': '📄',
            'binary': '💾',
            'unknown': '📁'
        };
        
        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            renderFileTree();
            setupSearch();
            setupProtection();
        });
        
        // Render file tree
        function renderFileTree(searchTerm = '') {
            const fileTree = document.getElementById('fileTree');
            const files = Object.entries(projectData.files);
            
            const filteredFiles = files.filter(([path, file]) => 
                path.toLowerCase().includes(searchTerm.toLowerCase())
            );
            
            if (filteredFiles.length === 0) {
                fileTree.innerHTML = '<div style="text-align: center; padding: 2rem; opacity: 0.6;">No files found</div>';
                return;
            }
            
            fileTree.innerHTML = filteredFiles.map(([path, file]) => \`
                <div class="file-item" onclick="viewFile('\${path}')" id="file-\${path.replace(/[^a-zA-Z0-9]/g, '-')}">
                    <span class="file-icon">\${fileIcons[file.type] || fileIcons.unknown}</span>
                    <span class="file-path" title="\${path}">\${path}</span>
                    <span class="file-size">\${formatFileSize(file.size)}</span>
                </div>
            \`).join('');
        }
        
        // View file content
        function viewFile(path) {
            const file = projectData.files[path];
            const fileContent = document.getElementById('fileContent');
            
            // Update active state
            document.querySelectorAll('.file-item').forEach(item => {
                item.classList.remove('active');
            });
            document.getElementById(\`file-\${path.replace(/[^a-zA-Z0-9]/g, '-')}\`).classList.add('active');
            
            currentFile = file;
            
            if (file.type === 'image') {
                fileContent.innerHTML = \`
                    <div class="file-content">
                        <div class="file-header">
                            <h3>\${path}</h3>
                            <div class="file-meta">
                                <span>📊 \${file.mimeType}</span>
                                <span>📏 \${formatFileSize(file.size)}</span>
                                <span>📅 \${new Date(file.lastModified).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div class="file-body">
                            <img src="\${file.encoded}" alt="\${path}">
                        </div>
                        <button class="download-btn" onclick="downloadFile('\${path}')">📥 Download File</button>
                    </div>
                \`;
            } else if (file.type === 'text') {
                const decodedContent = decoder.decode(file.encoded);
                fileContent.innerHTML = \`
                    <div class="file-content">
                        <div class="file-header">
                            <h3>\${path}</h3>
                            <div class="file-meta">
                                <span>📊 \${file.mimeType}</span>
                                <span>📏 \${formatFileSize(file.size)}</span>
                                <span>📅 \${new Date(file.lastModified).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div class="file-body">
                            <pre>\${decodedContent}</pre>
                        </div>
                        <button class="download-btn" onclick="downloadFile('\${path}')">📥 Download File</button>
                    </div>
                \`;
            } else {
                fileContent.innerHTML = \`
                    <div class="file-content">
                        <div class="file-header">
                            <h3>\${path}</h3>
                            <div class="file-meta">
                                <span>📊 \${file.mimeType}</span>
                                <span>📏 \${formatFileSize(file.size)}</span>
                                <span>📅 \${new Date(file.lastModified).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div class="file-body">
                            <div style="text-align: center; padding: 2rem;">
                                <div style="font-size: 3rem;">💾</div>
                                <p>Binary file - cannot display content</p>
                                <p style="opacity: 0.7;">Use the download button to save this file</p>
                            </div>
                        </div>
                        <button class="download-btn" onclick="downloadFile('\${path}')">📥 Download File</button>
                    </div>
                \`;
            }
        }
        
        // Setup search
        function setupSearch() {
            const searchBox = document.getElementById('searchBox');
            searchBox.addEventListener('input', (e) => {
                renderFileTree(e.target.value);
            });
        }
        
        // Format file size
        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }
        
        // Download file
        function downloadFile(path) {
            const file = projectData.files[path];
            const link = document.createElement('a');
            
            if (file.type === 'text') {
                const decodedContent = decoder.decode(file.encoded);
                const blob = new Blob([decodedContent], { type: file.mimeType });
                link.href = URL.createObjectURL(blob);
            } else {
                link.href = file.encoded;
            }
            
            link.download = file.name;
            link.click();
        }
        
        // Protection
        function setupProtection() {
            setInterval(() => {
                if (window.outerHeight - window.innerHeight > 200 || 
                    window.outerWidth - window.innerWidth > 200) {
                    console.clear();
                }
            }, 500);
            
            document.addEventListener('keydown', (e) => {
                if (e.key === 'F12' || 
                    (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key))) {
                    e.preventDefault();
                }
            });
            
            document.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });
        }
        
        console.log('🔐 Encoded project loaded successfully!');
        console.log(\`📁 \${Object.keys(projectData.files).length} files encoded\`);
    </script>
</body>
</html>
"@

$htmlContent | Out-File -FilePath "$OutputPath\viewer.html" -Encoding UTF8

Write-Host "Creating export scripts..." -ForegroundColor Yellow

# Create export script
$exportScript = @"
# Export Script - Extract all files from encoded project
param(
    [string]$InputPath = ".\encoded-project",
    [string]$OutputPath = ".\extracted-project"
)

# Load encoded data
`$encodedData = Get-Content "`$InputPath\project-data.b64" -Raw
`$decodedJson = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String(`$encodedData))
`$projectData = `$decodedJson | ConvertFrom-Json

# Create output directory
if (Test-Path `$OutputPath) {
    Remove-Item `$OutputPath -Recurse -Force
}
New-Item -ItemType Directory -Path `$OutputPath -Force | Out-Null

Write-Host "Extracting files..." -ForegroundColor Green

foreach (`$file in `$projectData.files.PSObject.Properties) {
    `$filePath = `$file.Name
    `$fileData = `$file.Value
    
    Write-Host "Extracting: `$filePath" -ForegroundColor Cyan
    
    # Create directory structure
    `$directory = Split-Path -Path "`$OutputPath\`$filePath" -Parent
    if (`$directory) {
        New-Item -ItemType Directory -Path `$directory -Force | Out-Null
    }
    
    if (`$fileData.type -eq "text") {
        # Decode text file
        `$decodedContent = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String(`$fileData.encoded))
        `$decodedContent | Out-File -FilePath "`$OutputPath\`$filePath" -Encoding UTF8
    }
    elseif (`$fileData.encoded.StartsWith("data:")) {
        # Extract data URL
        `$commaIndex = `$fileData.encoded.IndexOf(',')
        if (`$commaIndex -gt -1) {
            `$base64Data = `$fileData.encoded.Substring(`$commaIndex + 1)
            `$fileBytes = [System.Convert]::FromBase64String(`$base64Data)
            [System.IO.File]::WriteAllBytes("`$OutputPath\`$filePath", `$fileBytes)
        }
    }
}

Write-Host ""
Write-Host "Extraction complete!" -ForegroundColor Green
Write-Host "Files extracted to: `$OutputPath" -ForegroundColor Yellow
"@

$exportScript | Out-File -FilePath "$OutputPath\extract.ps1" -Encoding UTF8

# Create batch version for Windows
$batchScript = @"
@echo off
echo Extracting encoded project...
echo.

powershell -ExecutionPolicy Bypass -File extract.ps1

pause
"@

$batchScript | Out-File -FilePath "$OutputPath\extract.bat" -Encoding UTF8

Write-Host ""
Write-Host "✅ Encoding complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Generated files:" -ForegroundColor Yellow
Write-Host "📄 viewer.html - Interactive file viewer" -ForegroundColor White
Write-Host "📊 project-data.b64 - Encoded project data" -ForegroundColor White
Write-Host "🔧 extract.ps1 - PowerShell extraction script" -ForegroundColor White
Write-Host "🔧 extract.bat - Batch extraction script" -ForegroundColor White
Write-Host ""
Write-Host "Usage:" -ForegroundColor Yellow
Write-Host "1. Open viewer.html to browse encoded files" -ForegroundColor White
Write-Host "2. Run extract.bat to restore original files" -ForegroundColor White
Write-Host ""
Write-Host "Total encoded: $totalFiles files ($([math]::Round($totalSize / 1MB, 2)) MB)" -ForegroundColor Green
