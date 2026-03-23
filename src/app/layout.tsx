import type { Metadata } from 'next';
import { useEffect, useState } from 'react';
import ViewCounter from "./ViewCounter";

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Deep Learning Engineer & Data Scientist Portfolio',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const theme = localStorage.getItem('theme');
              if (theme === 'dark') {
                document.documentElement.classList.add('dark-mode');
                document.body.classList.add('dark-mode');
              }
            })();
            
            // Enhanced browser detection and protection
            (function() {
              // Detect common browsers and developer tools
              var devtools = {
                open: false,
                orientation: null
              };
              
              // Check for devtools
              setInterval(function() {
                if (window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.innerWidth > 200) {
                  if (!devtools.open) {
                    devtools.open = true;
                    window.close();
                    window.location = "about:blank";
                  }
                } else {
                  devtools.open = false;
                }
              }, 500);
              
              // Detect Arc browser and other advanced browsers
              var userAgent = navigator.userAgent.toLowerCase();
              var isArc = userAgent.includes('arc/') || userAgent.includes('arcbrowser');
              var isChrome = userAgent.includes('chrome') && !userAgent.includes('edg');
              var isFirefox = userAgent.includes('firefox');
              var isSafari = userAgent.includes('safari') && !userAgent.includes('chrome');
              
              // Additional protection for advanced browsers
              if (isArc || isChrome) {
                // Disable console access
                (function() {
                  var _log = console.log;
                  var _warn = console.warn;
                  var _error = console.error;
                  
                  console.log = function() {
                    window.close();
                    return _log.apply(console, arguments);
                  };
                  
                  console.warn = function() {
                    window.close();
                    return _warn.apply(console, arguments);
                  };
                  
                  console.error = function() {
                    window.close();
                    return _error.apply(console, arguments);
                  };
                })();
                
                // Detect devtools via debugger
                setInterval(function() {
                  var before = new Date();
                  debugger;
                  var after = new Date();
                  if (after - before > 100) {
                    window.close();
                    window.location = "about:blank";
                  }
                }, 1000);
              }
              
              // Block common devtools methods
              document.addEventListener('keydown', function(e) {
                if (e.key === 'F12' || 
                    (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || 
                    (e.ctrlKey && e.key === 'u') ||
                    (e.ctrlKey && e.key === 'U') ||
                    (e.ctrlKey && e.key === 's') ||
                    (e.ctrlKey && e.key === 'S') ||
                    (e.metaKey && e.altKey && e.key === 'i') ||
                    (e.metaKey && e.altKey && e.key === 'j') ||
                    (e.metaKey && e.altKey && e.key === 'c')) {
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                }
              }, true);
              
              // Block right click and context menu with enhanced prevention
              document.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return false;
              }, true);
              
              // Block text selection but allow highlighting
              document.addEventListener('selectstart', function(e) {
                if (window.getSelection().toString().length > 50) {
                  e.preventDefault();
                  return false;
                }
              });
              
              // Block copy with enhanced prevention
              document.addEventListener('copy', function(e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return false;
              }, true);
              
              // Block cut and paste
              document.addEventListener('cut', function(e) {
                e.preventDefault();
                return false;
              });
              
              document.addEventListener('paste', function(e) {
                e.preventDefault();
                return false;
              });
              
              // Block drag operations
              document.addEventListener('dragstart', function(e) {
                e.preventDefault();
                return false;
              });
              
              // Detect if page is in iframe (common for devtools)
              if (window.self !== window.top) {
                window.top.location = window.location;
              }
              
              // Clear clipboard periodically
              setInterval(function() {
                if (document.hasFocus() && navigator.clipboard && navigator.clipboard.writeText) {
                  navigator.clipboard.writeText('').catch(function() {
                    // Silently fail if clipboard access is denied
                  });
                }
              }, 5000);
            })();
          `
        }} />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet" />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Leckerli+One&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=Leckerli+One&family=Lilita+One&family=Patrick+Hand&family=Shadows+Into+Light&display=swap" rel="stylesheet" />
        <link href="/style.css" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{
          __html: `
            body {
              -webkit-user-select: text;
              -moz-user-select: text;
              -ms-user-select: text;
              user-select: text;
            }
            
            img, svg, video {
              -webkit-user-drag: none;
              -khtml-user-drag: none;
              -moz-user-drag: none;
              -o-user-drag: none;
              user-drag: none;
              pointer-events: none;
            }
          `
        }} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
