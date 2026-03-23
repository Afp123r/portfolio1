// Obfuscated JavaScript protection and functionality
(function() {
    // Anti-debug and protection
    var _0x1a2b = ['ZGVidWdnZXI=', 'Y29uc29sZQ==', 'bG9n', 'd2Fybg==', 'ZXJyb3I=', 'Y2xvc2U=', 'bG9jYXRpb24=', 'YWJvdXQ6Ymxhbms=', 'dXNlckFnZW50', 'dG9Mb3dlckNhc2U=', 'aW5jbHVkZXM=', 'YXJjLw==', 'YXJjYnJvd3Nlcg==', 'Y2hyb21l', 'VkVSU0lPTg==', 'ZWRnZQ==', 'ZmlyZWZveA==', 'c2FmYXJp', 'YWRkRXZlbnRMaXN0ZW5lcg==', 'a2V5ZG93bg==', 'a2V5', 'RjEy', 'Y3RybEtleQ==', 'c2hpZnRLZXk=', 'SScsICdKJywgJ0Mn',IHByZXZlbnREZWZhdWx0LCBzdG9wUHJvcGFnYXRpb24sIGZhbHNlXQ==', 'Y29udGV4dG1lbnU=', 'c2VsZWN0c3RhcnQ=', 'Z2V0U2VsZWN0aW9u', 'dG9TdHJpbmc=', 'bGVuZ3Ro',IGNvcHksIGN1dCwgcGFzdGUsIGRyYWdzdGFydF0nLCBmdW5jdGlvbihlKSB7IGUucHJldmVudERlZmF1bHQoKTsgcmV0dXJuIGZhbHNlOyB9LCB0cnVlKV07'];
    
    var _0x3c4d = function(_0x5e6f) { return atob(_0x5e6f); };
    
    // Devtools detection
    var devtools = { open: false, orientation: null };
    setInterval(function() {
        if (window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.innerWidth > 200) {
            if (!devtools.open) {
                devtools.open = true;
                window[_0x3c4d(_0x1a2b[5])]();
                window[_0x3c4d(_0x1a2b[6])] = _0x3c4d(_0x1a2b[7]);
            }
        } else {
            devtools.open = false;
        }
    }, 500);
    
    // Browser detection
    var userAgent = navigator[_0x3c4d(_0x1a2b[8])][_0x3c4d(_0x1a2b[9])]();
    var isArc = userAgent[_0x3c4d(_0x1a2b[10])](_0x3c4d(_0x1a2b[11])) || userAgent[_0x3c4d(_0x1a2b[10])](_0x3c4d(_0x1a2b[12]));
    var isChrome = userAgent[_0x3c4d(_0x1a2b[10])](_0x3c4d(_0x1a2b[13])) && !userAgent[_0x3c4d(_0x1a2b[10])](_0x3c4d(_0x1a2b[14]));
    var isFirefox = userAgent[_0x3c4d(_0x1a2b[10])](_0x3c4d(_0x1a2b[15]));
    var isSafari = userAgent[_0x3c4d(_0x1a2b[10])](_0x3c4d(_0x1a2b[16])) && !userAgent[_0x3c4d(_0x1a2b[10])](_0x3c4d(_0x1a2b[13]));
    
    // Console protection for advanced browsers
    if (isArc || isChrome) {
        (function() {
            var _log = console[_0x3c4d(_0x1a2b[2])];
            var _warn = console[_0x3c4d(_0x1a2b[3])];
            var _error = console[_0x3c4d(_0x1a2b[4])];
            
            console[_0x3c4d(_0x1a2b[2])] = function() {
                window[_0x3c4d(_0x1a2b[5])]();
                return _log[_0x3c4d(_0x1a2b[17])](console, arguments);
            };
            
            console[_0x3c4d(_0x1a2b[3])] = function() {
                window[_0x3c4d(_0x1a2b[5])]();
                return _warn[_0x3c4d(_0x1a2b[17])](console, arguments);
            };
            
            console[_0x3c4d(_0x1a2b[4])] = function() {
                window[_0x3c4d(_0x1a2b[5])]();
                return _error[_0x3c4d(_0x1a2b[17])](console, arguments);
            };
        })();
        
        // Debugger detection
        setInterval(function() {
            var before = new Date();
            debugger;
            var after = new Date();
            if (after - before > 100) {
                window[_0x3c4d(_0x1a2b[5])]();
                window[_0x3c4d(_0x1a2b[6])] = _0x3c4d(_0x1a2b[7]);
            }
        }, 1000);
    }
    
    // Keyboard shortcuts protection
    document[_0x3c4d(_0x1a2b[18])](_0x3c4d(_0x1a2b[19]), function(e) {
        if (e[_0x3c4d(_0x1a2b[20])] === _0x3c4d(_0x1a2b[21]) || 
            (e[_0x3c4d(_0x1a2b[22])] && e[_0x3c4d(_0x1a2b[23])] && (e[_0x3c4d(_0x1a2b[20])] === _0x3c4d(_0x1a2b[24]) || e[_0x3c4d(_0x1a2b[20])] === _0x3c4d(_0x1a2b[25]) || e[_0x3c4d(_0x1a2b[20])] === _0x3c4d(_0x1a2b[26]))) || 
            (e[_0x3c4d(_0x1a2b[22])] && e[_0x3c4d(_0x1a2b[20])] === 'u') ||
            (e[_0x3c4d(_0x1a2b[22])] && e[_0x3c4d(_0x1a2b[20])] === 'U') ||
            (e[_0x3c4d(_0x1a2b[22])] && e[_0x3c4d(_0x1a2b[20])] === 's') ||
            (e[_0x3c4d(_0x1a2b[22])] && e[_0x3c4d(_0x1a2b[20])] === 'S') ||
            (e.metaKey && e.altKey && e[_0x3c4d(_0x1a2b[20])] === 'i') ||
            (e.metaKey && e.altKey && e[_0x3c4d(_0x1a2b[20])] === 'j') ||
            (e.metaKey && e.altKey && e[_0x3c4d(_0x1a2b[20])] === 'c')) {
            e[_0x3c4d(_0x1a2b[27])]();
            e[_0x3c4d(_0x1a2b[28])]();
            return false;
        }
    }, true);
    
    // Right-click protection
    document[_0x3c4d(_0x1a2b[18])](_0x3c4d(_0x1a2b[29]), function(e) {
        e[_0x3c4d(_0x1a2b[27])]();
        e[_0x3c4d(_0x1a2b[28])]();
        e[_0x3c4d(_0x1a2b[30])]();
        return false;
    }, true);
    
    // Text selection protection
    document[_0x3c4d(_0x1a2b[18])](_0x3c4d(_0x1a2b[31]), function(e) {
        if (window[_0x3c4d(_0x1a2b[32])]()[_0x3c4d(_0x1a2b[33])][_0x3c4d(_0x1a2b[34])] > 50) {
            e[_0x3c4d(_0x1a2b[27])]();
            return false;
        }
    });
    
    // Copy/paste protection
    var protections = [_0x3c4d(_0x1a2b[35]), _0x3c4d(_0x1a2b[36]), _0x3c4d(_0x1a2b[37]), _0x3c4d(_0x1a2b[38])];
    protections.forEach(function(event) {
        document[_0x3c4d(_0x1a2b[18])](event, function(e) {
            e[_0x3c4d(_0x1a2b[27])]();
            return false;
        }, true);
    });
    
    // Iframe protection
    if (window.self !== window.top) {
        window.top.location = window.location;
    }
    
    // Clipboard clearing
    setInterval(function() {
        if (document.hasFocus() && navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText('').catch(function() {
                // Silent fail
            });
        }
    }, 5000);
})();

// Main functionality - obfuscated
(function() {
    var _0x5678 = ['ZG9jdW1lbnQucXVlcnlTZWxlY3Rvcg==', 'aGVhZGVy', 'YWRkRXZlbnRMaXN0ZW5lcg==', 'c2Nyb2xs', 'd2luZG93', 'c2Nyb2xZ', 'Y2xhc3NMaXN0', 'YWRk', 'aGVhZGVyLXNjcm9sbGVk', 'cmVtb3Zl', 'bmV3IFR5cGVk',IC5hdXRvLXR5cGUnLCAnTWFjaGluZSBMZWFybmluZycsICdEZXBsZWFybmluZycsICdOYXR1cmFsIExhbmd1YWdlIFByb2Nlc3NpbmcnLCAnQ29tcHV0ZXIgVmlzaW9uJywgJ1dlYiBEZXZlbG9wbWVudCcsICd0eXBlU3BlZWQnLCA5MCwgJ2JhY2tTcGVlZCcsIDkwLCAnbG9vcCcsICdBT1MuaW5pdCcsICkdcmF0aW9uJywgODAwLCAnZWFzaW5nJywgJ2Vhc2UtaW4tb3V0JywgJ29uY2UnLCB0cnVlLCAnbWlycm9yJywgZmFsc2UsICdxdWVyeVNlbGVjdG9yQWxsJywgJy5za2lsbC1maWxsJywgJ0ludGVyc2VjdGlvbk9ic2VydmVyJywgJ2VudHJpZXMnLCAnZm9yRWFjaCcsICdlbnRyeScsICdpc0ludGVyc2VjdGluZycsICd0YXJnZXQnLCAnZ2V0QXR0cmlidXRlJywgJ2RhdGEtc2tpbGwnLCAnc3R5bGUnLCAnd2lkdGgnLCAnb2JzZXJ2ZScsICdjYXJkcycsICcuY2FyZCcsICdtb3VzZW1vdmUnLCAnZScsICdjbGllbnRYJywgJ2dldEJvdW5kaW5nQ2xpZW50UmVjdCcsICdjbGllbnRZJywgJ3JlY3QnLCAnY2VudGVyWCcsICd3aWR0aCcsICdjZW50ZXJZJywgJ2hlaWdodCcsICdyb3RhdGVYJywgJ3JvdGF0ZVknLCAndHJhbnNmb3JtJywgJ3BlcnNwZWN0aXZlJywgJ3RyYW5zbGF0ZVonLCAnbW91c2VsZWF2ZSdd;
    
    var _0x9abc = function(_0xdef0) { return atob(_0xdef0); };
    
    // Header scroll effect
    var header = document[_0x9abc(_0x5678[0])](_0x9abc(_0x5678[1]));
    window[_0x9abc(_0x5678[3])](_0x9abc(_0x5678[2]), function() {
        if (window[_0x9abc(_0x5678[5])][_0x9abc(_0x5678[4])] > 50) {
            header[_0x9abc(_0x5678[6])][_0x9abc(_0x5678[7])](_0x9abc(_0x5678[8]));
        } else {
            header[_0x9abc(_0x5678[6])][_0x9abc(_0x5678[9])](_0x9abc(_0x5678[8]));
        }
    });
    
    // Typed.js initialization
    if (typeof Typed !== 'undefined') {
        var typed = new Typed(_0x9abc(_0x5678[10]), {
            strings: [_0x9abc(_0x5678[11]), _0x9abc(_0x5678[12]), _0x9abc(_0x5678[13]), _0x9abc(_0x5678[14]), _0x9abc(_0x5678[15])],
            [_0x9abc(_0x5678[16])]: 90,
            [_0x9abc(_0x5678[17])]: 90,
            [_0x9abc(_0x5678[18])]: true
        });
    }
    
    // AOS initialization
    if (typeof AOS !== 'undefined') {
        AOS[_0x9abc(_0x5678[19])]({
            [_0x9abc(_0x5678[20])]: 800,
            [_0x9abc(_0x5678[21])]: _0x9abc(_0x5678[22]),
            [_0x9abc(_0x5678[23])]: _0x9abc(_0x5678[24]),
            [_0x9abc(_0x5678[25])]: _0x9abc(_0x5678[26])
        });
    }
    
    // Skill bars animation
    var skillFills = document[_0x9abc(_0x5678[27])](_0x9abc(_0x5678[28]));
    if (skillFills.length > 0) {
        var skillsObserver = new IntersectionObserver(function(_0x1234) {
            _0x1234[_0x9abc(_0x5678[29])](function(_0x5678) {
                if (_0x5678[_0x9abc(_0x5678[30])]) {
                    var skillFill = _0x5678[_0x9abc(_0x5678[31])];
                    var skillLevel = skillFill[_0x9abc(_0x5678[32])](_0x9abc(_0x5678[33]));
                    skillFill[_0x9abc(_0x5678[34])][_0x9abc(_0x5678[35])] = skillLevel + '%';
                }
            });
        }, { threshold: 0.5 });
        
        skillFills[_0x9abc(_0x5678[36])](function(fill) {
            skillsObserver[_0x9abc(_0x5678[37])](fill);
        });
    }
    
    // 3D card effects
    var cards = document[_0x9abc(_0x5678[27])](_0x9abc(_0x5678[38]));
    if (cards.length > 0) {
        cards[_0x9abc(_0x5678[36])](function(card) {
            card[_0x9abc(_0x5678[3])](_0x9abc(_0x5678[39]), function(_0x5678) {
                var rect = card[_0x9abc(_0x5678[41])]();
                var x = _0x5678[_0x9abc(_0x5678[42])] - rect[_0x9abc(_0x5678[43])];
                var y = _0x5678[_0x9abc(_0x5678[44])] - rect[_0x9abc(_0x5678[45])];
                var centerX = rect[_0x9abc(_0x5678[46])] / 2;
                var centerY = rect[_0x9abc(_0x5678[47])] / 2;
                var rotateX = (y - centerY) / 10;
                var rotateY = (centerX - x) / 10;
                
                card[_0x9abc(_0x5678[34])][_0x9abc(_0x5678[48])] = _0x9abc(_0x5678[49]) + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateZ(20px)';
            });
            
            card[_0x9abc(_0x5678[3])](_0x9abc(_0x5678[50]), function() {
                card[_0x9abc(_0x5678[34])][_0x9abc(_0x5678[48])] = _0x9abc(_0x5678[49]) + '0deg) rotateY(0deg) translateZ(0px)';
            });
        });
    }
    
    // Smooth scrolling for navigation
    var navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            var targetId = this.getAttribute('href').substring(1);
            var targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Mobile menu toggle
    var menuToggle = document.querySelector('.menu-toggle');
    var menu = document.querySelector('.menu');
    var menuOverlay = document.querySelector('.menu-overlay');
    
    if (menuToggle && menu) {
        menuToggle.addEventListener('click', function() {
            menu.classList.toggle('active');
            menuToggle.classList.toggle('active');
            if (menuOverlay) {
                menuOverlay.classList.toggle('active');
            }
        });
    }
    
    if (menuOverlay) {
        menuOverlay.addEventListener('click', function() {
            menu.classList.remove('active');
            menuToggle.classList.remove('active');
            menuOverlay.classList.remove('active');
        });
    }
})();

// Content loader - Base64 encoded sections
(function() {
    var sections = {
        skills: 'PHNlY3Rpb24gY2xhc3M9IlNraWxscyIgaWQ9InNraWxscyIgZGF0YS1hb3M9ImZhZGUtdXAiPjxkaXYgY2xhc3M9ImNvbnRhaW5lciI+PGRpdiBjbGFzcz0iaGVhZGluZyI+PGgxIGNsYXNzPSJza2lsbGgxIHRleHQtcmV2ZWFsIj5NeSBTa2lsbHM8L2gxPjwvZGl2PjxkaXYgY2xhc3M9Im1haW5Ta2lsbCI+PGRpdiBjbGFzcz0iZnJvbnQiPjxoMj5Gcm9udGVuZDwvaDI+PGRpdiBjbGFzcz0iYm94Ij48ZGl2IGNsYXNzPSJmcm9udFNraWxsIj48aW1nIHNyYz0iaW1hZ2VzL2h0bWwucG5nIiBhbHQ9Ij48ZGl2IGNsYXNzPSJza2lsbC1iYXIiPjxkaXYgY2xhc3M9InNraWxsLWZpbGwiIGRhdGEtc2tpbGw9IjkwIj48L2Rpdj48L2RpdD5IVE1MPC9kaXY+PGRpdiBjbGFzcz0iZnJvbnRTa2lsbCI+PGltZyBzcmM9ImltYWdlcy9Dc3MucG5nIiBhbHQ9Ij48ZGl2IGNsYXNzPSJza2lsbC1iYXIiPjxkaXYgY2xhc3M9InNraWxsLWZpbGwiIGRhdGEtc2tpbGw9Ijg1Ij48L2Rpdj48L2RpdD5DU1M8L2Rpdj48ZGl2IGNsYXNzPSJmcm9udFNraWxsIj48aW1nIHNyYz0iaW1hZ2VzL2pzLnBuZyIgYWx0PSIiPjxkaXYgY2xhc3M9InNraWxsLWJhciI+PGRpdiBjbGFzcz0ic2tpbGwtZmlsbCIgZGF0YS1za2lsbD0iODAiPjwvZGl2PjwvZGl2PkphdmFTY3JpcHQ8L2Rpdj48ZGl2IGNsYXNzPSJmcm9udFNraWxsIj48aW1nIHNyYz0iaW1hZ2VzL3JlYWN0LnBuZyIgYWx0PSIiPjxkaXYgY2xhc3M9InNraWxsLWJhciI+PGRpdiBjbGFzcz0ic2tpbGwtZmlsbCIgZGF0YS1za2lsbD0iNzUiPjwvZGl2PjwvZGl2PlJlYWN0SnM8L2Rpdj48ZGl2IGNsYXNzPSJmcm9udFNraWxsIj48aW1nIHNyYz0iaW1hZ2VzL2Jvb3RzdHJhcC5qcGciIGFsdD0iIj48ZGl2IGNsYXNzPSJza2lsbC1iYXIiPjxkaXYgY2xhc3M9InNraWxsLWZpbGwiIGRhdGEtc2tpbGw9Ijg1Ij48L2Rpdj48L2RpdD5Cb290c3RyYXA8L2Rpdj48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPSJiYWNrIj48aDI+QmFja2VuZDwvaDI+PGRpdiBjbGFzcz0iYm94Ij48ZGl2IGNsYXNzPSJiYWNrU2tpbGwiPjxpbWcgc3JjPSJpbWFnZXMvbm9kZWpzLnBuZyIgYWx0PSI+Tm9kZUpzPC9kaXY+PGRpdiBjbGFzcz0iYmFja1NraWxsIj48aW1nIHNyYz0iaW1hZ2VzL2V4cHJlc3MtanMucG5nIiBhbHQ9Ij5FeHByZXNzSnM8L2Rpdj48ZGl2IGNsYXNzPSJiYWNrU2tpbGwiPjxpbWcgc3JjPSJpbWFnZXMvbW9uZ28ucG5nIiBhbHQ9Ij5Nb25nb0RCPC9kaXY+PGRpdiBjbGFzcz0iYmFja1NraWxsIj48aW1nIHNyYz0iaW1hZ2VzL215c3FsLnBuZyIgYWx0PSI+U1FMPC9kaXY+PGRpdiBjbGFzcz0iYmFja1NraWxsIj48aW1nIHNyYz0iaW1hZ2VzL3B5dGhvbi5wbmciIGFsdD0iPlB5dGhvbjwvZGl2PjwvZGl2PjwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9ImRhdGFzY2kiPjxoMj5EYXRhIFNjaWVuY2U8L2gyPjxkaXYgY2xhc3M9ImJveCI+PGRpdiBjbGFzcz0iZGF0YXNjaVNraWxsIj48aW1nIHNyYz0iaW1hZ2VzL21hY2hpbmUucG5nIiBhbHQ9Ij5NYWNoaW5lIExlYXJuaW5nPC9kaXY+PGRpdiBjbGFzcz0iZGF0YXNjaVNraWxsIj48aW1nIHNyYz0iaW1hZ2VzL2RlZXAucG5nIiBhbHQ9Ij5EZWVwIExlYXJuaW5nPC9kaXY+PGRpdiBjbGFzcz0iZGF0YXNjaVNraWxsIj48aW1nIHNyYz0iaW1hZ2VzL251bXB5LnBuZyIgYWx0PSI+TnVtUHk8L2Rpdj48ZGl2IGNsYXNzPSJkYXRhc2NpU2tpbGwiPjxpbWcgc3JjPSJpbWFnZXMvcGFuZGFzLnBuZyIgYWx0PSI+UGFuZGFzPC9kaXY+PGRpdiBjbGFzcz0iZGF0YXNjaVNraWxsIj48aW1nIHNyYz0iaW1hZ2VzL21hdHBsb3QucG5nIiBhbHQ9Ij5NYXRwbG90bGliPC9kaXY+PGRpdiBjbGFzcz0iZGF0YXNjaVNraWxsIj48aW1nIHNyYz0iaW1hZ2VzL3NlYWJvcm4ucG5nIiBhbHQ9Ij5TZWFib3JuPC9kaXY+PGRpdiBjbGFzcz0iZGF0YXNjaVNraWxsIj48aW1nIHNyYz0iaW1hZ2VzL3NjaWtpdC5wbmciIGFsdD0iPlNjaWtpdC1MZWFybjwvZGl2PjxkaXYgY2xhc3M9ImRhdGFzY2lTa2lsbCI+PGltZyBzcmM9ImltYWdlcy90ZW5zb3IucG5nIiBhbHQ9Ij5UZW5zb3JGbG93PC9kaXY+PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz0idG9vbHMiPjxoMj5Ub29sczwvaDI+PGRpdiBjbGFzcz0iYm94Ij48ZGl2IGNsYXNzPSJ0b29sc1NraWxsIj48aW1nIHNyYz0iaW1hZ2VzL2dpdC5wbmciIGFsdD0iIj48ZGl2IGNsYXNzPSJza2lsbC1iYXIiPjxkaXYgY2xhc3M9InNraWxsLWZpbGwiIGRhdGEtc2tpbGw9IjkwIj48L2Rpdj48L2RpdD5HaXQ8L2Rpdj48ZGl2IGNsYXNzPSJ0b29sc1NraWxsIj48aW1nIHNyYz0iaW1hZ2VzL2dpdGh1Yi5wbmciIGFsdD0iIj48ZGl2IGNsYXNzPSJza2lsbC1iYXIiPjxkaXYgY2xhc3M9InNraWxsLWZpbGwiIGRhdGEtc2tpbGw9Ijg1Ij48L2Rpdj48L2RpdD5HaXRodWI8L2Rpdj48ZGl2IGNsYXNzPSJ0b29sc1NraWxsIj48aW1nIHNyYz0iaW1hZ2VzL3ZzY29kZS5qcGciIGFsdD0iIj48ZGl2IGNsYXNzPSJza2lsbC1iYXIiPjxkaXYgY2xhc3M9InNraWxsLWZpbGwiIGRhdGEtc2tpbGw9Ijk1Ij48L2Rpdj48L2Rpdj5Wc0NvZGU8L2Rpdj48ZGl2IGNsYXNzPSJ0b29sc1NraWxsIj48aW1nIHNyYz0iaW1hZ2VzL2p1cHl0ZXIucG5nIiBhbHQ9IiI+PGRpdiBjbGFzcz0ic2tpbGwtYmFyIj48ZGl2IGNsYXNzPSJza2lsbC1maWxsIiBkYXRhLXNraWxsPSI4MCI+PC9kaXY+PC9kaXY+SnVweXRlciBOb3RlYm9vazwvZGl2PjxkaXYgY2xhc3M9InRvb2xzU2tpbGwiPjxpbWcgc3JjPSJpbWFnZXMvcG9zdC5wbmciIGFsdD0iIj48ZGl2IGNsYXNzPSJza2lsbC1iYXIiPjxkaXYgY2xhc3M9InNraWxsLWZpbGwiIGRhdGEtc2tpbGw9IjcwIj48L2Rpdj48L2RpdD5Qb3N0bWFuPC9kaXY+PGRpdiBjbGFzcz0idG9vbHNTa2lsbCI+PGltZyBzcmM9ImltYWdlcy9maWdtYS5wbmciIGFsdD0iIj48ZGl2IGNsYXNzPSJza2lsbC1iYXIiPjxkaXYgY2xhc3M9InNraWxsLWZpbGwiIGRhdGEtc2tpbGw9Ijc1Ij48L2Rpdj48L2RpdD5GaWdtYTwvZGl2PjxkaXYgY2xhc3M9InRvb2xzU2tpbGwiPjxpbWcgc3JjPSJpbWFnZXMvY2FudmEuanBnIiBhbHQ9IiI+PGRpdiBjbGFzcz0ic2tpbGwtYmFyIj48ZGl2IGNsYXNzPSJza2lsbC1maWxsIiBkYXRhLXNraWxsPSI4MCI+PC9kaXY+PC9kaXY+Q2FudmE8L2Rpdj48L2Rpdj48L2Rpdj48L2Rpdj48L2Rpdj48L3NlY3Rpb24+'
    };
    
    // Load sections dynamically
    Object.keys(sections).forEach(function(sectionName) {
        try {
            var decodedSection = atob(sections[sectionName]);
            var tempDiv = document.createElement('div');
            tempDiv.innerHTML = decodedSection;
            var section = tempDiv.firstElementChild;
            if (section) {
                document.body.appendChild(section);
            }
        } catch (e) {
            console.error('Failed to load section:', sectionName);
        }
    });
})();
