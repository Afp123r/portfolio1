// Universal Project Encoder - Encodes entire project without npm
// This script will encode all folders, files, and images recursively

class UniversalProjectEncoder {
    constructor() {
        this.encodedData = new Map();
        this.supportedImageTypes = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico', 'bmp'];
        this.supportedTextTypes = ['html', 'htm', 'css', 'js', 'json', 'xml', 'txt', 'md', 'ts', 'tsx', 'jsx'];
        this.binaryTypes = ['pdf', 'zip', 'rar', 'exe', 'dll', 'woff', 'woff2', 'ttf', 'eot'];
    }

    // Base64 encoding with Unicode support
    base64Encode(str) {
        try {
            return btoa(unescape(encodeURIComponent(str)));
        } catch (e) {
            return btoa(str);
        }
    }

    base64Decode(str) {
        try {
            return decodeURIComponent(escape(atob(str)));
        } catch (e) {
            return atob(str);
        }
    }

    // Get file type
    getFileType(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        
        if (this.supportedImageTypes.includes(ext)) return 'image';
        if (this.supportedTextTypes.includes(ext)) return 'text';
        if (this.binaryTypes.includes(ext)) return 'binary';
        return 'unknown';
    }

    // Read file as base64 (browser version)
    async readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Read text file
    async readTextFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    // Encode file based on type
    async encodeFile(file, path = '') {
        const fileType = this.getFileType(file.name);
        const fullPath = path ? `${path}/${file.name}` : file.name;
        
        try {
            let encodedContent;
            let mimeType;

            switch (fileType) {
                case 'image':
                    const dataURL = await this.readFileAsBase64(file);
                    encodedContent = dataURL;
                    mimeType = dataURL.split(':')[1].split(';')[0];
                    break;
                    
                case 'text':
                    const textContent = await this.readTextFile(file);
                    encodedContent = this.base64Encode(textContent);
                    mimeType = 'text/plain';
                    break;
                    
                case 'binary':
                    const binaryData = await this.readFileAsBase64(file);
                    encodedContent = binaryData;
                    mimeType = binaryData.split(':')[1].split(';')[0];
                    break;
                    
                default:
                    const defaultData = await this.readFileAsBase64(file);
                    encodedContent = defaultData;
                    mimeType = 'application/octet-stream';
            }

            this.encodedData.set(fullPath, {
                name: file.name,
                path: fullPath,
                type: fileType,
                mimeType: mimeType,
                size: file.size,
                encoded: encodedContent,
                lastModified: file.lastModified
            });

            return {
                path: fullPath,
                type: fileType,
                size: file.size,
                encoded: encodedContent
            };

        } catch (error) {
            console.error(`Failed to encode ${fullPath}:`, error);
            return null;
        }
    }

    // Process directory (browser drag & drop)
    async processDirectory(items, basePath = '') {
        const results = [];
        
        for (const item of items) {
            if (item.isFile) {
                const file = await this.getFileFromEntry(item);
                const result = await this.encodeFile(file, basePath);
                if (result) results.push(result);
                
            } else if (item.isDirectory) {
                const dirReader = item.createReader();
                const entries = await this.readAllDirectoryEntries(dirReader);
                const newBasePath = basePath ? `${basePath}/${item.name}` : item.name;
                
                const subResults = await this.processDirectory(entries, newBasePath);
                results.push(...subResults);
            }
        }
        
        return results;
    }

    // Get file from directory entry
    getFileFromEntry(entry) {
        return new Promise((resolve, reject) => {
            entry.file(resolve, reject);
        });
    }

    // Read all directory entries
    async readAllDirectoryEntries(reader) {
        const entries = [];
        let readEntries = await this.readEntriesPromise(reader);
        
        while (readEntries.length > 0) {
            entries.push(...readEntries);
            readEntries = await this.readEntriesPromise(reader);
        }
        
        return entries;
    }

    readEntriesPromise(reader) {
        return new Promise((resolve, reject) => {
            reader.readEntries(resolve, reject);
        });
    }

    // Generate encoded project structure
    generateEncodedProject() {
        const structure = {
            metadata: {
                totalFiles: this.encodedData.size,
                encodedAt: new Date().toISOString(),
                version: '1.0.0'
            },
            files: {}
        };

        this.encodedData.forEach((data, path) => {
            structure.files[path] = {
                name: data.name,
                type: data.type,
                mimeType: data.mimeType,
                size: data.size,
                encoded: data.encoded,
                lastModified: data.lastModified
            };
        });

        return structure;
    }

    // Create self-contained HTML with all encoded files
    createSelfContainedHTML(encodedProject) {
        const encodedProjectJSON = this.base64Encode(JSON.stringify(encodedProject));
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Encoded Project Viewer</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: #fff;
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        .header {
            text-align: center;
            margin-bottom: 3rem;
        }
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            background: linear-gradient(45deg, #00ff88, #00ccff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }
        .stat-card {
            background: rgba(255,255,255,0.1);
            padding: 1.5rem;
            border-radius: 10px;
            backdrop-filter: blur(10px);
            text-align: center;
        }
        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #00ff88;
        }
        .file-browser {
            background: rgba(255,255,255,0.05);
            border-radius: 15px;
            padding: 2rem;
            backdrop-filter: blur(10px);
        }
        .file-tree {
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
        }
        .file-item {
            padding: 0.5rem;
            cursor: pointer;
            border-radius: 5px;
            transition: background 0.3s;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .file-item:hover {
            background: rgba(255,255,255,0.1);
        }
        .file-icon {
            width: 20px;
            height: 20px;
            display: inline-block;
        }
        .file-content {
            background: rgba(0,0,0,0.3);
            border-radius: 10px;
            padding: 1.5rem;
            margin-top: 1rem;
            max-height: 500px;
            overflow-y: auto;
            display: none;
        }
        .file-content.active {
            display: block;
        }
        .file-content pre {
            background: rgba(0,0,0,0.5);
            padding: 1rem;
            border-radius: 5px;
            overflow-x: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .file-content img {
            max-width: 100%;
            height: auto;
            border-radius: 10px;
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
        .download-btn {
            background: linear-gradient(45deg, #00ff88, #00ccff);
            color: #000;
            border: none;
            padding: 1rem 2rem;
            border-radius: 50px;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.3s, box-shadow 0.3s;
            margin: 1rem;
        }
        .download-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(0,255,136,0.3);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Encoded Project Viewer</h1>
            <p>All files are encoded and embedded in this single HTML file</p>
            <button class="download-btn" onclick="downloadOriginal()">📥 Download Original Project</button>
        </div>
        
        <div class="stats" id="stats">
            <!-- Stats will be populated by JavaScript -->
        </div>
        
        <div class="file-browser">
            <input type="text" class="search-box" placeholder="🔍 Search files..." id="searchBox">
            <div class="file-tree" id="fileTree">
                <!-- File tree will be populated by JavaScript -->
            </div>
            <div class="file-content" id="fileContent">
                <!-- File content will be shown here -->
            </div>
        </div>
    </div>

    <script>
        // Encoded project data
        const encodedProjectData = '${encodedProjectJSON}';
        
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
            renderStats();
            renderFileTree();
            setupSearch();
        });
        
        // Render statistics
        function renderStats() {
            const stats = document.getElementById('stats');
            const totalFiles = Object.keys(projectData.files).length;
            const totalSize = Object.values(projectData.files).reduce((sum, file) => sum + file.size, 0);
            const imageCount = Object.values(projectData.files).filter(f => f.type === 'image').length;
            const textCount = Object.values(projectData.files).filter(f => f.type === 'text').length;
            
            stats.innerHTML = \`
                <div class="stat-card">
                    <div class="stat-number">\${totalFiles}</div>
                    <div>Total Files</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">\${formatFileSize(totalSize)}</div>
                    <div>Total Size</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">\${imageCount}</div>
                    <div>Images</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">\${textCount}</div>
                    <div>Text Files</div>
                </div>
            \`;
        }
        
        // Render file tree
        function renderFileTree(searchTerm = '') {
            const fileTree = document.getElementById('fileTree');
            const files = Object.entries(projectData.files);
            
            const filteredFiles = files.filter(([path, file]) => 
                path.toLowerCase().includes(searchTerm.toLowerCase())
            );
            
            fileTree.innerHTML = filteredFiles.map(([path, file]) => \`
                <div class="file-item" onclick="viewFile('\${path}')">
                    <span class="file-icon">\${fileIcons[file.type] || fileIcons.unknown}</span>
                    <span>\${path}</span>
                    <span style="margin-left: auto; opacity: 0.7;">\${formatFileSize(file.size)}</span>
                </div>
            \`).join('');
        }
        
        // View file content
        function viewFile(path) {
            const file = projectData.files[path];
            const fileContent = document.getElementById('fileContent');
            
            currentFile = file;
            
            if (file.type === 'image') {
                fileContent.innerHTML = \`
                    <h3>\${path}</h3>
                    <p><strong>Type:</strong> \${file.mimeType} | <strong>Size:</strong> \${formatFileSize(file.size)}</p>
                    <img src="\${file.encoded}" alt="\${path}">
                \`;
            } else if (file.type === 'text') {
                const decodedContent = decoder.decode(file.encoded);
                fileContent.innerHTML = \`
                    <h3>\${path}</h3>
                    <p><strong>Type:</strong> \${file.mimeType} | <strong>Size:</strong> \${formatFileSize(file.size)}</p>
                    <pre>\${decodedContent}</pre>
                \`;
            } else {
                fileContent.innerHTML = \`
                    <h3>\${path}</h3>
                    <p><strong>Type:</strong> \${file.mimeType} | <strong>Size:</strong> \${formatFileSize(file.size)}</p>
                    <p>Binary file - cannot display content</p>
                    <button class="download-btn" onclick="downloadFile('\${path}')">Download File</button>
                \`;
            }
            
            fileContent.classList.add('active');
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
        
        // Download single file
        function downloadFile(path) {
            const file = projectData.files[path];
            const link = document.createElement('a');
            
            if (file.type === 'text') {
                const decodedContent = decoder.decode(file.encoded);
                const blob = new Blob([decodedContent], { type: file.mimeType });
                link.href = URL.createObjectURL(blob);
            } else {
                link.href = file.encoded;
                link.download = file.name;
            }
            
            link.click();
        }
        
        // Download entire project as ZIP
        function downloadOriginal() {
            // This would require a ZIP library implementation
            // For now, we'll download individual files
            alert('Individual file downloads available by clicking on files in the viewer');
        }
        
        // Protection
        (function() {
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
        })();
    </script>
</body>
</html>`;
    }

    // Export encoded project
    exportProject() {
        const project = this.generateEncodedProject();
        const html = this.createSelfContainedHTML(project);
        
        return {
            project: project,
            html: html,
            encodedData: this.encodedData
        };
    }
}

// Browser interface
window.UniversalProjectEncoder = UniversalProjectEncoder;

// Drag and drop interface
function setupDragAndDrop() {
    const encoder = new UniversalProjectEncoder();
    
    document.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });
    
    document.addEventListener('drop', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const items = e.dataTransfer.items;
        if (items) {
            console.log('Processing dropped files...');
            await encoder.processDirectory(items);
            
            const exported = encoder.exportProject();
            
            // Create download link
            const blob = new Blob([exported.html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'encoded-project.html';
            link.click();
            
            console.log('Project encoded successfully!');
            console.log('Total files:', encoder.encodedData.size);
        }
    });
}

// Auto-setup
if (typeof window !== 'undefined') {
    setupDragAndDrop();
    console.log('🔐 Universal Project Encoder Ready!');
    console.log('📁 Drag and drop any folder or files to encode them');
}
