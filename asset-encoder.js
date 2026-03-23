// Universal Asset Encoder - No npm packages required
// This script encodes all images, CSS, and JavaScript into base64 format

class AssetEncoder {
    constructor() {
        this.cache = new Map();
        this.supportedImageTypes = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico'];
    }

    // Base64 encoding utilities
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

    // Encode image to base64 data URL
    async encodeImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const dataURL = reader.result;
                this.cache.set(file.name, dataURL);
                resolve(dataURL);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Encode CSS with embedded images
    async encodeCSSEmbedded(cssText, imageBaseUrl = '') {
        let encodedCSS = cssText;
        
        // Find all url() references in CSS
        const urlRegex = /url\(['"]?([^'")]+)['"]?\)/g;
        const matches = cssText.matchAll(urlRegex);
        
        for (const match of matches) {
            const imageUrl = match[1];
            if (!imageUrl.startsWith('data:') && !imageUrl.startsWith('http')) {
                try {
                    const fullUrl = imageBaseUrl + imageUrl;
                    const response = await fetch(fullUrl);
                    const blob = await response.blob();
                    const dataURL = await this.blobToDataURL(blob);
                    encodedCSS = encodedCSS.replace(match[0], `url(${dataURL})`);
                } catch (e) {
                    console.warn('Could not embed image:', imageUrl, e);
                }
            }
        }
        
        return this.base64Encode(encodedCSS);
    }

    // Convert blob to data URL
    blobToDataURL(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    // Encode JavaScript code
    encodeJS(jsCode) {
        // Basic obfuscation + base64 encoding
        const obfuscated = jsCode
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
            .replace(/\/\/.*$/gm, '') // Remove line comments
            .replace(/\s+/g, ' ') // Minify whitespace
            .trim();
        
        return this.base64Encode(obfuscated);
    }

    // Encode HTML content
    async encodeHTMLEmbedded(htmlContent, baseUrl = '') {
        let encodedHTML = htmlContent;
        
        // Find all image tags
        const imgRegex = /<img[^>]+src=['"]([^'"]+)['"][^>]*>/g;
        const matches = htmlContent.matchAll(imgRegex);
        
        for (const match of matches) {
            const imgTag = match[0];
            const imgSrc = match[1];
            
            if (!imgSrc.startsWith('data:') && !imgSrc.startsWith('http')) {
                try {
                    const fullUrl = baseUrl + imgSrc;
                    const response = await fetch(fullUrl);
                    const blob = await response.blob();
                    const dataURL = await this.blobToDataURL(blob);
                    encodedHTML = encodedHTML.replace(imgSrc, dataURL);
                } catch (e) {
                    console.warn('Could not embed image:', imgSrc, e);
                }
            }
        }
        
        return this.base64Encode(encodedHTML);
    }

    // Create encoded HTML page
    createEncodedPage(originalHTML, options = {}) {
        const {
            encodeImages = true,
            encodeCSS = true,
            encodeJS = true,
            addProtection = true,
            customCSS = '',
            customJS = ''
        } = options;

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Encoded Portfolio</title>
    <script>
        // Universal Decoder
        const decoder = {
            decode: (str) => {
                try {
                    return decodeURIComponent(escape(atob(str)));
                } catch (e) {
                    return atob(str);
                }
            },
            
            loadCSS: (encodedCSS) => {
                const css = decoder.decode(encodedCSS);
                const style = document.createElement('style');
                style.textContent = css;
                document.head.appendChild(style);
            },
            
            loadJS: (encodedJS) => {
                const js = decoder.decode(encodedJS);
                const script = document.createElement('script');
                script.textContent = js;
                document.body.appendChild(script);
            },
            
            loadImage: (img, dataURL) => {
                img.src = dataURL;
                img.removeAttribute('data-encode');
            }
        };

        ${addProtection ? this.getProtectionCode() : ''}
        
        ${customJS}
    </script>
    ${customCSS ? `<style>${customCSS}</style>` : ''}
</head>
<body>
    ${originalHTML}
    
    <script>
        // Auto-encode images on load
        document.addEventListener('DOMContentLoaded', function() {
            const images = document.querySelectorAll('img[data-encode="true"]');
            images.forEach(img => {
                fetch(img.src)
                    .then(response => response.blob())
                    .then(blob => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            decoder.loadImage(img, reader.result);
                        };
                        reader.readAsDataURL(blob);
                    })
                    .catch(e => console.warn('Failed to encode image:', img.src, e));
            });
        });
    </script>
</body>
</html>`;
    }

    // Protection code
    getProtectionCode() {
        return `
        // Anti-debug protection
        (function() {
            let devtools = { open: false };
            
            setInterval(() => {
                if (window.outerHeight - window.innerHeight > 200 || 
                    window.outerWidth - window.innerWidth > 200) {
                    if (!devtools.open) {
                        window.location = "about:blank";
                    }
                }
            }, 500);
            
            // Block keyboard shortcuts
            document.addEventListener('keydown', (e) => {
                if (e.key === 'F12' || 
                    (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) ||
                    (e.ctrlKey && e.key === 'u')) {
                    e.preventDefault();
                    return false;
                }
            });
            
            // Block right click
            document.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                return false;
            });
        })();
        `;
    }

    // Process entire project
    async processProject(projectPath, options = {}) {
        const results = {
            html: [],
            css: [],
            js: [],
            images: []
        };

        // This would need to be implemented based on your file structure
        // For now, it's a template for how you'd process everything
        
        return results;
    }
}

// Usage examples and utilities
const encoder = new AssetEncoder();

// Quick encode function for strings
function quickEncode(str) {
    return encoder.base64Encode(str);
}

// Quick decode function for strings
function quickDecode(str) {
    return encoder.base64Decode(str);
}

// Batch encode images from file inputs
async function batchEncodeImages(files) {
    const results = [];
    
    for (const file of files) {
        if (encoder.supportedImageTypes.some(type => 
            file.name.toLowerCase().endsWith(type))) {
            try {
                const dataURL = await encoder.encodeImage(file);
                results.push({
                    name: file.name,
                    size: file.size,
                    dataURL: dataURL
                });
            } catch (e) {
                console.error('Failed to encode:', file.name, e);
            }
        }
    }
    
    return results;
}

// Create self-contained encoded page
function createSelfContainedPage(content, options = {}) {
    return encoder.createEncodedPage(content, options);
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AssetEncoder, encoder, quickEncode, quickDecode };
}

// Auto-initialization for browser use
if (typeof window !== 'undefined') {
    window.AssetEncoder = AssetEncoder;
    window.encoder = encoder;
    window.quickEncode = quickEncode;
    window.quickDecode = quickDecode;
}
