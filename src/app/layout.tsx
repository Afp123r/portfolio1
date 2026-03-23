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
            
            // Disable right click
            document.addEventListener('contextmenu', function(e) {
              e.preventDefault();
              return false;
            });
            
            // Allow text selection but prevent copy
            document.addEventListener('copy', function(e) {
              e.preventDefault();
              return false;
            });
            
            // Disable cut
            document.addEventListener('cut', function(e) {
              e.preventDefault();
              return false;
            });
            
            // Disable paste
            document.addEventListener('paste', function(e) {
              e.preventDefault();
              return false;
            });
            
            // Disable drag
            document.addEventListener('dragstart', function(e) {
              e.preventDefault();
              return false;
            });
            
            // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
            document.addEventListener('keydown', function(e) {
              if (e.key === 'F12' || 
                  (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) || 
                  (e.ctrlKey && e.key === 'u') ||
                  (e.ctrlKey && e.key === 'U')) {
                e.preventDefault();
                return false;
              }
            });
            
            // Disable developer tools
            setInterval(function() {
              if (window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.innerWidth > 200) {
                window.close();
                window.location = "about:blank";
              }
            }, 500);
            
            // Obfuscate console logs
            console.log = function() {};
            console.error = function() {};
            console.warn = function() {};
            console.info = function() {};
            console.debug = function() {};
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
