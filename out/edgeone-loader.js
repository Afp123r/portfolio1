// EdgeOne Server-Side Loader
// This file loads and applies obfuscation on EdgeOne server

(function() {
  'use strict';
  
  // Obfuscation configuration
  const OBSC_CONFIG = {
    enabled: true,
    antiDebug: true,
    deadCode: true,
    stringObfuscation: true,
    variableObfuscation: true
  };
  
  // Check if running on EdgeOne server or testing
  function shouldEnableObfuscation() {
    return window.location.hostname.includes('edgeone') || 
           window.location.hostname.includes('tencentcloud') ||
           window.location.hostname.includes('cdn') ||
           window.location.search.includes('test-obfuscation') ||
           window.location.search.includes('obfuscate=true') ||
           localStorage.getItem('force-obfuscation') === 'true' ||
           (window.location.hostname !== 'localhost' && 
            !window.location.hostname.includes('127.0.0.1') && 
            !window.location.hostname.includes('dev'));
  }
  
  // Dynamic obfuscation function
  function dynamicObfuscate(code) {
    if (!OBSC_CONFIG.enabled) return code;
    
    let obfuscated = code;
    
    // Variable name obfuscation
    if (OBSC_CONFIG.variableObfuscation) {
      const varMap = new Map();
      let counter = 0;
      
      obfuscated = obfuscated.replace(/\b(let|const|var|function)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g, 
        (match, keyword, varName) => {
          if (!varMap.has(varName) && varName.length > 1) {
            varMap.set(varName, '_0x' + (counter++).toString(16).padStart(4, '0'));
          }
          return keyword + ' ' + (varMap.get(varName) || varName);
        });
    }
    
    // String obfuscation
    if (OBSC_CONFIG.stringObfuscation) {
      obfuscated = obfuscated.replace(/(['"`])((?:\\.|(?!\1)[^\\])*?)\1/g, (match, quote, content) => {
        if (content.length > 3) {
          const charCodes = content.split('').map(c => c.charCodeAt(0));
          return `String.fromCharCode(${charCodes.join(',')})`;
        }
        return match;
      });
    }
    
    // Add dead code
    if (OBSC_CONFIG.deadCode) {
      const deadCode = `
        (function() {
          var _0x${Math.random().toString(16).substr(2, 8)} = function() {
            var _0x${Math.random().toString(16).substr(2, 8)} = [];
            for (var _0x${Math.random().toString(16).substr(2, 8)} = 0; _0x${Math.random().toString(16).substr(2, 8)} < 50; _0x${Math.random().toString(16).substr(2, 8)}++) {
              _0x${Math.random().toString(16).substr(2, 8)}.push(Math.random() * 100 | 0);
            }
            return _0x${Math.random().toString(16).substr(2, 8)}.filter(function(x) { return x % 2 === 0; });
          };
          if (Math.random() > 0.5) _0x${Math.random().toString(16).substr(2, 8)}();
        })();
      `;
      obfuscated = deadCode + '\n' + obfuscated;
    }
    
    return obfuscated;
  }
  
  // Anti-debug protection
  function addAntiDebug() {
    if (!OBSC_CONFIG.antiDebug) return;
    
    // Debug detection
    setInterval(function() {
      if (window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.innerWidth > 200) {
        window.location = "about:blank";
      }
    }, 500);
    
    // Disable console
    const consoleMethods = ['log', 'warn', 'error', 'debug', 'info'];
    consoleMethods.forEach(function(method) {
      console[method] = function() {
        return false;
      };
    });
    
    // Block developer tools shortcuts
    document.addEventListener('keydown', function(e) {
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
          (e.ctrlKey && e.key === 'u')) {
        e.preventDefault();
        return false;
      }
    });
    
    // Block right-click
    document.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      return false;
    });
  }
  
  // Obfuscate existing scripts
  function obfuscateExistingScripts() {
    const scripts = document.querySelectorAll('script:not([src]):not([data-obfuscated])');
    scripts.forEach(function(script) {
      if (script.textContent.trim()) {
        const obfuscated = dynamicObfuscate(script.textContent);
        script.textContent = obfuscated;
        script.setAttribute('data-obfuscated', 'true');
      }
    });
  }
  
  // Initialize obfuscation
  function init() {
    if (!shouldEnableObfuscation()) {
      console.log('🔓 Development mode - obfuscation disabled');
      console.log('💡 To test obfuscation locally, add ?test-obfuscation or ?obfuscate=true to URL');
      console.log('💡 Or set localStorage.force-obfuscation = "true"');
      return;
    }
    
    let environment = 'Unknown';
    if (window.location.hostname.includes('edgeone')) {
      environment = 'EdgeOne Server';
    } else if (window.location.search.includes('test-obfuscation')) {
      environment = 'Local Testing Mode';
    } else if (localStorage.getItem('force-obfuscation') === 'true') {
      environment = 'Forced Testing Mode';
    } else {
      environment = 'Production Server';
    }
    
    console.log(`🔒 ${environment} detected - enabling obfuscation`);
    
    // Show visual indicator for testing
    if (window.location.search.includes('test-obfuscation') || 
        localStorage.getItem('force-obfuscation') === 'true') {
      const indicator = document.createElement('div');
      indicator.id = 'obfuscation-indicator';
      indicator.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: linear-gradient(45deg, #ff4444, #ff6666);
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: bold;
        z-index: 9999;
        box-shadow: 0 4px 20px rgba(255,68,68,0.4);
        font-family: monospace;
        animation: pulse 2s infinite;
      `;
      
      const style = document.createElement('style');
      style.textContent = `
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
          100% { transform: scale(1); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
      
      indicator.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span>🔒</span>
          <span>OBFUSCATION ACTIVE</span>
          <span style="font-size: 10px; opacity: 0.8;">(${environment})</span>
        </div>
      `;
      document.body.appendChild(indicator);
      
      // Remove indicator after 8 seconds
      setTimeout(() => {
        if (indicator.parentNode) {
          indicator.style.transition = 'opacity 1s';
          indicator.style.opacity = '0';
          setTimeout(() => {
            if (indicator.parentNode) {
              indicator.parentNode.removeChild(indicator);
            }
          }, 1000);
        }
      }, 8000);
    }
    
    // Add anti-debug protection
    addAntiDebug();
    
    // Obfuscate existing scripts
    obfuscateExistingScripts();
    
    // Monitor for new scripts
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeName === 'SCRIPT' && !node.src && !node.hasAttribute('data-obfuscated')) {
            if (node.textContent.trim()) {
              const obfuscated = dynamicObfuscate(node.textContent);
              node.textContent = obfuscated;
              node.setAttribute('data-obfuscated', 'true');
            }
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log('🔒 EdgeOne server-side obfuscation activated');
  }
  
  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();
