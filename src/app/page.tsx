'use client';

import { useEffect, useState } from 'react';
import content from '../config/content.json';
import ViewCounter from "./ViewCounter";
import ShareButtons from "../components/ShareButtons";
import ContactForm from "../components/ContactForm";

export default function Home() {
  const [linkedinScriptLoaded, setLinkedinScriptLoaded] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [accessType, setAccessType] = useState<'cv' | 'project'>('cv');
  const [projectUrl, setProjectUrl] = useState('');
  const [showIOSNotification, setShowIOSNotification] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: 'success' | 'error' | 'info' }>>(([]));
  
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };
  
  // Password stored in environment variable for better security
  const CORRECT_PASSWORD = process.env.NEXT_PUBLIC_CV_PASSWORD || 'cv321';

  const handleCVDownload = () => {
    setAccessType('cv');
    setShowPasswordModal(true);
    setPasswordError('');
    setPassword('');
  };

  const handleProjectAccess = (projectUrl: string, projectTitle?: string) => {
    // Check if it's first or second project
    const isFirstProject = projectTitle === "Barcode Filing Management System";
    const isSecondProject = projectTitle === "Camera Photo Booth with Filters & Animations";
    
    if (isFirstProject || isSecondProject) {
      // Direct access without password for first and second projects
      window.open(projectUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Require password for other projects
      setAccessType('project');
      setProjectUrl(projectUrl);
      setShowPasswordModal(true);
      setPasswordError('');
      setPassword('');
    }
  };

  const closeModal = () => {
    setShowPasswordModal(false);
    setPassword('');
    setPasswordError('');
  };

  // Mobile-compatible fallback hash function
  const simpleHash = (str: string): string => {
    // Use a more reliable string-based hashing that works consistently across all devices
    let hash = 5381; // Initial seed value (consistent across environments)
    
    for (let i = 0; i < str.length; i++) {
      // Use charCodeAt with proper normalization for mobile compatibility
      const char = str.charCodeAt(i);
      // DJB2 algorithm - more consistent across JavaScript engines
      hash = ((hash << 5) + hash) + char;
      // Ensure we stay within 32-bit range consistently
      hash = hash | 0;
    }
    
    // Convert to positive hex string with consistent length
    const positiveHash = hash >>> 0; // Unsigned right shift for consistent positive values
    return positiveHash.toString(16).padStart(8, '0');
  };

  // Additional mobile-compatible hash verification
  const mobileCompatibleHash = (str: string): string => {
    // Simple character sum method for maximum compatibility
    let sum = 0;
    for (let i = 0; i < str.length; i++) {
      sum += str.charCodeAt(i);
    }
    return (sum % 1000000).toString(16).padStart(6, '0');
  };

  const verifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mobile-optimized password verification with multiple hash methods
    const verifyHash = async (): Promise<string[]> => {
      const hashes: string[] = [];
      
      // Method 1: Web Crypto API SHA-256 (most reliable when available)
      if (window.crypto && window.crypto.subtle) {
        try {
          const encoder = new TextEncoder();
          const data = encoder.encode(password);
          const hashBuffer = await crypto.subtle.digest('SHA-256', data);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          hashes.push(hashArray.map(b => b.toString(16).padStart(2, '0')).join(''));
        } catch (cryptoError) {
          // Continue to fallback methods
        }
      }
      
      // Method 2: Improved DJB2 hash (mobile-compatible)
      hashes.push(simpleHash(password));
      
      // Method 3: Character sum hash (maximum compatibility)
      hashes.push(mobileCompatibleHash(password));
      
      return hashes;
    };
    
    try {
      const hashResults = await verifyHash();
      
      // Mobile debug: Store hash results for troubleshooting (remove in production)
      if (typeof window !== 'undefined') {
        (window as any).mobileHashDebug = {
          password: password,
          generatedHashes: hashResults,
          timestamp: new Date().toISOString()
        };
      }
      
      // Multiple hash values for "cv321" across different methods (updated with actual test results)
      const correctHashes = [
        '638e246e7e682b72add9dc16ab3cfa7e6675bbb00e596dc97064955405fba025', // SHA-256
        '0f400e54' // DJB2 hash for "cv321" (from test)
      ];
      
      // Check if any of the generated hashes match any correct hash
      const isValid = hashResults.some(hash => 
        correctHashes.some(correct => hash === correct)
      );
      
      if (isValid) {
        setIsPasswordVerified(true);
        setShowPasswordModal(false);
        
        if (accessType === 'cv') {
          // Simplified iOS-compatible PDF download
          const downloadPDF = (url: string) => {
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
            
            if (isIOS) {
              // iOS: Try direct download first, then fallback to window.open
              try {
                const link = document.createElement('a');
                link.href = url;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.download = 'NEOH_WEI_JIAN_Resume.pdf';
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                setTimeout(() => {
                  if (link.parentNode) {
                    document.body.removeChild(link);
                  }
                }, 100);
              } catch (error) {
                // Fallback for iOS
                window.open(url, '_blank', 'noopener,noreferrer');
              }
            } else {
              // Desktop/Android method
              window.open(url, '_blank', 'noopener,noreferrer');
            }
          };
          
          downloadPDF(content.hero.resume);
        } else if (accessType === 'project') {
          // Open the project
          window.open(projectUrl, '_blank');
        }
        
        setPassword('');
        setProjectUrl('');
      } else {
        setPasswordError('Incorrect password. Please try again.');
        setPassword('');
      }
    } catch (error) {
      setPasswordError('Verification error. Please try again.');
      setPassword('');
    }
  };

  useEffect(() => {
    // Load LinkedIn badge script dynamically
    if (!linkedinScriptLoaded) {
      const script = document.createElement('script');
      script.src = 'https://platform.linkedin.com/badges/js/profile.js';
      script.async = true;
      script.defer = true;
      script.type = 'text/javascript';
      script.onload = () => setLinkedinScriptLoaded(true);
      document.head.appendChild(script);
    }

    // Enhanced iOS设备检测和优化
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                 (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    // iOS版本检测
    const getIOSVersion = () => {
      const match = navigator.userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
      return match ? parseInt(match[1], 10) : null;
    };
    
    const iosVersion = getIOSVersion();
    const isIOS13Plus = iosVersion !== null && iosVersion >= 13;
    
    // iOS优化初始化函数
    const initIOSBasicOptimizations = () => {
      // 修复iOS滚动性能
      const sections = document.querySelectorAll('section') as NodeListOf<HTMLElement>;
      sections.forEach(section => {
        (section as HTMLElement).style.transform = 'translateZ(0)';
        (section as HTMLElement).style.backfaceVisibility = 'hidden';
        ((section as HTMLElement).style as any).webkitTransform = 'translateZ(0)';
        ((section as HTMLElement).style as any).webkitBackfaceVisibility = 'hidden';
      });
      
      // 防止iOS缩放
      const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], textarea') as NodeListOf<HTMLInputElement | HTMLTextAreaElement>;
      inputs.forEach(input => {
        const element = input as HTMLInputElement | HTMLTextAreaElement;
        element.style.fontSize = '16px';
        (element.style as any).webkitAppearance = 'none';
        (element.style as any).webkitTapHighlightColor = 'transparent';
      });
      
      // iOS按钮优化
      const buttons = document.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
      buttons.forEach(button => {
        const element = button as HTMLButtonElement;
        (element.style as any).webkitTapHighlightColor = 'transparent';
        (element.style as any).webkitTouchCallout = 'none';
        (element.style as any).webkitUserSelect = 'none';
      });
      
      // iOS链接优化
      const links = document.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>;
      links.forEach(link => {
        const element = link as HTMLAnchorElement;
        (element.style as any).webkitTapHighlightColor = 'transparent';
        (element.style as any).webkitTouchCallout = 'none';
      });
      
      // iOS滚动容器优化
      const scrollContainers = document.querySelectorAll('.experience-container, .projects-showcase, .skills-container') as NodeListOf<HTMLElement>;
      scrollContainers.forEach(container => {
        const element = container as HTMLElement;
        (element.style as any).webkitOverflowScrolling = 'touch';
        (element.style as any).webkitTransform = 'translateZ(0)';
      });
    };

    // iOS特定优化
    if (isIOS) {
      document.documentElement.classList.add('ios-scroll-fix');
      document.body.classList.add('ios-scroll-fix');
      document.documentElement.setAttribute('data-ios', 'true');
      document.documentElement.setAttribute('data-ios-version', (iosVersion || 'unknown').toString());
      
      // 防止页面刷新闪烁
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          document.body.style.transform = 'translateZ(0)';
          // 重新初始化iOS特定功能
          setTimeout(initIOSBasicOptimizations, 100);
        }
      });
      
      // 初始化iOS优化
      initIOSBasicOptimizations();
      
      // iOS触摸事件优化
      const initIOSTouchOptimizations = () => {
        // 为所有交互元素添加触摸事件
        const interactiveElements = document.querySelectorAll('button, a, .card, .frontSkill, .backSkill, .datasciSkill, .toolsSkill, .project-card');
        
        interactiveElements.forEach(element => {
          // 触摸开始事件
          element.addEventListener('touchstart', (e) => {
            (element as HTMLElement).style.transform = 'scale(0.95)';
            (element as HTMLElement).style.transition = 'transform 0.1s ease';
          }, { passive: true });
          
          // 触摸结束事件
          element.addEventListener('touchend', (e) => {
            (element as HTMLElement).style.transform = 'scale(1)';
            (element as HTMLElement).style.transition = 'transform 0.2s ease';
          }, { passive: true });
          
          // 触摸取消事件
          element.addEventListener('touchcancel', (e) => {
            (element as HTMLElement).style.transform = 'scale(1)';
          }, { passive: true });
        });
      };
      
      // 初始化触摸优化
      initIOSTouchOptimizations();
      
      // iOS导航菜单优化
      const initIOSNavigation = () => {
        const menuToggle = document.querySelector('.menu-toggle') as HTMLButtonElement;
        const menu = document.querySelector('.menu') as HTMLElement;
        const menuOverlay = document.querySelector('.menu-overlay') as HTMLElement;
        
        if (menuToggle && menu && menuOverlay) {
          // iOS菜单切换优化
          menuToggle.addEventListener('touchstart', (e) => {
            menuToggle.style.transform = 'scale(0.95)';
          }, { passive: true });
          
          menuToggle.addEventListener('touchend', (e) => {
            menuToggle.style.transform = 'scale(1)';
          }, { passive: true });
          
          // iOS菜单滑动关闭
          let startY = 0;
          menu.addEventListener('touchstart', (e) => {
            startY = (e as TouchEvent).touches[0].clientY;
          }, { passive: true });
          
          menu.addEventListener('touchmove', (e) => {
            const currentY = (e as TouchEvent).touches[0].clientY;
            const deltaY = currentY - startY;
            
            if (deltaY > 50) {
              menu.style.transform = `translateY(${deltaY}px)`;
            }
          }, { passive: true });
          
          menu.addEventListener('touchend', (e) => {
            const currentY = (e as TouchEvent).changedTouches[0].clientY;
            const deltaY = currentY - startY;
            
            if (deltaY > 100) {
              // 滑动关闭菜单
              menu.classList.remove('active');
              menuOverlay.classList.remove('active');
              document.body.style.overflow = '';
              menu.style.transform = '';
            } else {
              // 恢复位置
              menu.style.transform = '';
            }
          }, { passive: true });
        }
      };
      
      // 初始化导航优化
      initIOSNavigation();
      
      // iOS用户通知系统
      const initIOSNotification = () => {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                     (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        
        if (isIOS) {
          // 延迟显示通知，让页面先加载完成
          setTimeout(() => {
            setShowIOSNotification(true);
          }, 1000);
        }
      };
      
      // 初始化iOS通知
      initIOSNotification();
      
      // Scroll to top button visibility
      const handleScroll = () => {
        if (window.scrollY > 300) {
          setShowScrollTop(true);
        } else {
          setShowScrollTop(false);
        }
      };
      
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll(); // Initial check
      
      // Windows & Android 性能优化
      const initWindowsAndroidOptimizations = () => {
        const isWindows = /Win/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);
        const isDesktop = !/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isWindows || isAndroid) {
          // 硬件加速优化
          const performanceElements = document.querySelectorAll('.project-showcase-card, .info-card, .skill-card, .frontSkill, .backSkill, .datasciSkill, .toolsSkill');
          performanceElements.forEach(element => {
            (element as HTMLElement).style.willChange = 'transform, opacity';
            (element as HTMLElement).style.transform = 'translateZ(0)';
            (element as HTMLElement).style.backfaceVisibility = 'hidden';
          });
          
          // 平滑滚动优化
          document.documentElement.style.scrollBehavior = 'smooth';
          document.body.style.scrollBehavior = 'smooth';
          
          // 减少重绘和重排
          const images = document.querySelectorAll('img');
          images.forEach(img => {
            (img as HTMLImageElement).loading = 'lazy';
            (img as HTMLElement).style.willChange = 'transform';
            (img as HTMLElement).style.transform = 'translateZ(0)';
          });
          
          // 优化动画性能
          const animatedElements = document.querySelectorAll('.fade-in-up, .scale-in, .slide-in-left, .slide-in-right');
          animatedElements.forEach(element => {
            (element as HTMLElement).style.willChange = 'transform, opacity';
            (element as HTMLElement).style.transform = 'translateZ(0)';
          });
          
          // Windows 特定优化
          if (isWindows) {
            // 优化鼠标交互
            const interactiveElements = document.querySelectorAll('button, a, .action-btn, .theme-toggle');
            interactiveElements.forEach(element => {
              (element as HTMLElement).style.willChange = 'transform, box-shadow';
              (element as HTMLElement).style.transform = 'translateZ(0)';
            });
            
            // 优化滚动性能
            let ticking = false;
            const updateScrollPerformance = () => {
              if (!ticking) {
                requestAnimationFrame(() => {
                  // 滚动相关的性能优化
                  ticking = false;
                });
                ticking = true;
              }
            };
            
            window.addEventListener('scroll', updateScrollPerformance, { passive: true });
          }
          
          // Android 特定优化
          if (isAndroid) {
            // 触摸优化
            const touchElements = document.querySelectorAll('.project-showcase-card, .info-card, .action-btn') as NodeListOf<HTMLElement>;
            touchElements.forEach(element => {
              (element.style as any).webkitTapHighlightColor = 'transparent';
              (element.style as any).webkitUserSelect = 'none';
              element.style.userSelect = 'none';
            });
            
            // 减少动画复杂度
            const reducedMotionElements = document.querySelectorAll('.project-showcase-card, .info-card');
            reducedMotionElements.forEach(element => {
              (element as HTMLElement).style.transition = 'transform 0.2s ease';
            });
            
            // 优化触摸滚动
            (document.documentElement.style as any).webkitOverflowScrolling = 'touch';
            (document.body.style as any).webkitOverflowScrolling = 'touch';
          }
          
          // 桌面特定优化
          if (isDesktop && (isWindows)) {
            // 增强视觉效果
            const enhancedElements = document.querySelectorAll('.hero-container, .projects-showcase, .contact-modern');
            enhancedElements.forEach(element => {
              (element as HTMLElement).style.willChange = 'transform';
              (element as HTMLElement).style.transform = 'translateZ(0)';
            });
            
            // 优化光标性能
            const cursorElements = document.querySelectorAll('.cursor-dot, .cursor-trail');
            cursorElements.forEach(element => {
              (element as HTMLElement).style.willChange = 'transform';
              (element as HTMLElement).style.transform = 'translateZ(0)';
            });
          }
          
          // 通用性能优化
          // 防抖函数用于优化事件处理
          const debounce = (func: Function, wait: number) => {
            let timeout: NodeJS.Timeout;
            return function executedFunction(...args: any[]) {
              const later = () => {
                clearTimeout(timeout);
                func(...args);
              };
              clearTimeout(timeout);
              timeout = setTimeout(later, wait);
            };
          };
          
          // 优化窗口大小调整事件
          const optimizedResize = debounce(() => {
            // 窗口大小调整时的优化
            const performanceElements = document.querySelectorAll('.project-showcase-card, .info-card');
            performanceElements.forEach(element => {
              (element as HTMLElement).style.willChange = 'auto';
              setTimeout(() => {
                (element as HTMLElement).style.willChange = 'transform, opacity';
              }, 100);
            });
          }, 250);
          
          window.addEventListener('resize', optimizedResize, { passive: true });
          
          // 性能监控
          if ('performance' in window && 'measure' in window.performance) {
            // 测量关键性能指标
            const measurePerformance = () => {
              const perfData = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
              const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
              const domTime = perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart;
              
              console.log('Performance Metrics:', {
                loadTime: `${loadTime}ms`,
                domTime: `${domTime}ms`,
                platform: isWindows ? 'Windows' : isAndroid ? 'Android' : 'Other'
              });
            };
            
            window.addEventListener('load', measurePerformance);
          }
        }
      };
      
      // 初始化Windows & Android优化
      initWindowsAndroidOptimizations();
      
      // iOS 性能优化
      const initIOSOptimizations = () => {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                     (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        
        if (isIOS) {
          // iOS版本检测
          const getIOSVersion = () => {
            const match = navigator.userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
            return match ? parseInt(match[1], 10) : null;
          };
          
          const iosVersion = getIOSVersion();
          const isIPad = /iPad/.test(navigator.userAgent);
          const isIPhone = /iPhone/.test(navigator.userAgent);
          
          // iOS硬件加速优化
          const performanceElements = document.querySelectorAll('.project-showcase-card, .info-card, .skill-card, .frontSkill, .backSkill, .datasciSkill, .toolsSkill, .hero-container, .navBar, .menu, .action-btn, .theme-toggle');
          performanceElements.forEach(element => {
            const htmlElement = element as HTMLElement;
            htmlElement.style.willChange = 'transform, opacity';
            htmlElement.style.transform = 'translateZ(0)';
            htmlElement.style.backfaceVisibility = 'hidden';
            (htmlElement.style as any).webkitBackfaceVisibility = 'hidden';
            (htmlElement.style as any).webkitTransform = 'translateZ(0)';
          });
          
          // iOS触摸优化
          const touchElements = document.querySelectorAll('button, a, .project-showcase-card, .info-card, .action-btn, .theme-toggle, .menu-toggle') as NodeListOf<HTMLElement>;
          touchElements.forEach(element => {
            (element.style as any).webkitTapHighlightColor = 'transparent';
            (element.style as any).webkitTouchCallout = 'none';
            (element.style as any).webkitUserSelect = 'none';
            element.style.userSelect = 'none';
          });
          
          // iOS滚动优化
          (document.documentElement.style as any).webkitOverflowScrolling = 'touch';
          (document.body.style as any).webkitOverflowScrolling = 'touch';
          
          // iOS特定滚动容器优化
          const scrollContainers = document.querySelectorAll('.experience-container, .projects-showcase, .skills-container, .contact-modern, .menu') as NodeListOf<HTMLElement>;
          scrollContainers.forEach(container => {
            (container.style as any).webkitOverflowScrolling = 'touch';
            (container.style as any).overflowScrolling = 'touch';
            container.style.willChange = 'transform';
            container.style.transform = 'translateZ(0)';
          });
          
          // iOS图片优化
          const images = document.querySelectorAll('img') as NodeListOf<HTMLImageElement>;
          images.forEach(img => {
            img.loading = 'lazy';
            img.style.willChange = 'transform';
            img.style.transform = 'translateZ(0)';
            img.style.backfaceVisibility = 'hidden';
            (img.style as any).webkitBackfaceVisibility = 'hidden';
            (img.style as any).webkitUserDrag = 'none';
            (img.style as any).userDrag = 'none';
          });
          
          // iOS动画优化
          const animatedElements = document.querySelectorAll('.fade-in-up, .scale-in, .slide-in-left, .slide-in-right, .text-reveal') as NodeListOf<HTMLElement>;
          animatedElements.forEach(element => {
            element.style.willChange = 'transform, opacity';
            element.style.transform = 'translateZ(0)';
            element.style.backfaceVisibility = 'hidden';
            (element.style as any).webkitBackfaceVisibility = 'hidden';
          });
          
          // iOS表单优化
          const formInputs = document.querySelectorAll('input, textarea') as NodeListOf<HTMLInputElement | HTMLTextAreaElement>;
          formInputs.forEach(input => {
            input.style.fontSize = '16px'; // 防止iOS缩放
            (input.style as any).webkitAppearance = 'none';
            (input.style as any).webkitTapHighlightColor = 'transparent';
            (input.style as any).webkitTouchCallout = 'none';
            input.style.borderRadius = '12px';
          });
          
          // iOS特定版本优化
          if (iosVersion !== null && iosVersion >= 13) {
            // iOS 13+ 特定优化
            const modernElements = document.querySelectorAll('.project-showcase-card, .info-card') as NodeListOf<HTMLElement>;
            modernElements.forEach(element => {
              element.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            });
          }
          
          // iPad特定优化
          if (isIPad) {
            const iPadElements = document.querySelectorAll('.hero-container, .projects-showcase, .contact-modern') as NodeListOf<HTMLElement>;
            iPadElements.forEach(element => {
              element.style.willChange = 'transform';
              element.style.transform = 'translateZ(0)';
            });
          }
          
          // iPhone特定优化
          if (isIPhone) {
            // 减少动画复杂度以提高性能
            const mobileElements = document.querySelectorAll('.project-showcase-card, .info-card') as NodeListOf<HTMLElement>;
            mobileElements.forEach(element => {
              element.style.transition = 'transform 0.2s ease';
            });
          }
          
          // iOS触摸事件优化
          let touchStartY = 0;
          let touchEndY = 0;
          
          const handleTouchStart = (e: TouchEvent) => {
            touchStartY = e.touches[0].clientY;
          };
          
          const handleTouchEnd = (e: TouchEvent) => {
            touchEndY = e.changedTouches[0].clientY;
            const touchDifference = touchStartY - touchEndY;
            
            // 触摸滑动优化
            if (Math.abs(touchDifference) > 50) {
              // 优化滑动性能
              requestAnimationFrame(() => {
                // 滑动相关的性能优化
              });
            }
          };
          
          document.addEventListener('touchstart', handleTouchStart, { passive: true });
          document.addEventListener('touchend', handleTouchEnd, { passive: true });
          
          // iOS滚动性能优化
          let ticking = false;
          const updateIOSScrollPerformance = () => {
            if (!ticking) {
              requestAnimationFrame(() => {
                // iOS滚动相关的性能优化
                ticking = false;
              });
              ticking = true;
            }
          };
          
          window.addEventListener('scroll', updateIOSScrollPerformance, { passive: true });
          
          // iOS内存管理优化
          const debounce = (func: Function, wait: number) => {
            let timeout: NodeJS.Timeout;
            return function executedFunction(...args: any[]) {
              const later = () => {
                clearTimeout(timeout);
                func(...args);
              };
              clearTimeout(timeout);
              timeout = setTimeout(later, wait);
            };
          };
          
          // 优化窗口大小调整事件
          const optimizedIOSResize = debounce(() => {
            const performanceElements = document.querySelectorAll('.project-showcase-card, .info-card, .skill-card') as NodeListOf<HTMLElement>;
            performanceElements.forEach(element => {
              element.style.willChange = 'auto';
              setTimeout(() => {
                element.style.willChange = 'transform, opacity';
              }, 100);
            });
          }, 250);
          
          window.addEventListener('resize', optimizedIOSResize, { passive: true });
          
          // iOS特定手势优化
          const handleGestureStart = (e: Event) => {
            e.preventDefault();
          };
          
          const handleGestureChange = (e: Event) => {
            e.preventDefault();
          };
          
          // 防止iOS缩放手势干扰
          document.addEventListener('gesturestart', handleGestureStart);
          document.addEventListener('gesturechange', handleGestureChange);
          
          // iOS性能监控
          if ('performance' in window && 'measure' in window.performance) {
            const measureIOSPerformance = () => {
              const perfData = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
              const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
              const domTime = perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart;
              
              console.log('iOS Performance Metrics:', {
                loadTime: `${loadTime}ms`,
                domTime: `${domTime}ms`,
                iosVersion: iosVersion,
                device: isIPad ? 'iPad' : isIPhone ? 'iPhone' : 'iOS Device'
              });
            };
            
            window.addEventListener('load', measureIOSPerformance);
          }
          
          // iOS特定视觉优化
          const enhanceIOSVisuals = () => {
            // 优化iOS视觉反馈
            const interactiveElements = document.querySelectorAll('.action-btn, .theme-toggle, .menu-toggle') as NodeListOf<HTMLElement>;
            interactiveElements.forEach(element => {
              element.addEventListener('touchstart', () => {
                element.style.transform = 'scale(0.95)';
              }, { passive: true });
              
              element.addEventListener('touchend', () => {
                element.style.transform = 'scale(1)';
              }, { passive: true });
            });
          };
          
          enhanceIOSVisuals();
          
          // iOS特定滚动优化
          const optimizeIOSScrolling = () => {
            // 优化滚动容器
            const scrollableElements = document.querySelectorAll('.experience-container, .projects-showcase, .skills-container') as NodeListOf<HTMLElement>;
            scrollableElements.forEach(element => {
              (element.style as any).webkitOverflowScrolling = 'touch';
              (element.style as any).overflowScrolling = 'touch';
              element.style.scrollBehavior = 'smooth';
            });
          };
          
          optimizeIOSScrolling();
        }
      };
      
      // 初始化iOS优化
      initIOSOptimizations();
    }
    
    // 处理滚动事件
    const handleScroll = () => {
      const header = document.querySelector('header');
      if (header) {
        if (window.scrollY > 50) {
          header.classList.add('header-scrolled');
        } else {
          header.classList.remove('header-scrolled');
        }
      }
    };

    // 更新滚动进度 - iOS优化
    const updateScrollProgress = () => {
      const scrollProgress = document.getElementById('scrollProgress');
      if (scrollProgress) {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = Math.min(100, Math.max(0, (window.scrollY / scrollHeight) * 100));
        scrollProgress.style.width = scrolled + '%';
        
        // iOS特定优化
        if (isIOS) {
          scrollProgress.style.transform = 'translateZ(0)';
          (scrollProgress.style as any).webkitTransform = 'translateZ(0)';
        }
      }
    };


    // 处理菜单点击
    const handleMenuClick = () => {
      const menu = document.querySelector('.menu');
      const menuToggle = document.querySelector('.menu-toggle');
      const menuOverlay = document.querySelector('.menu-overlay');
      
      menu?.classList.toggle('active');
      menuToggle?.classList.toggle('active');
      menuOverlay?.classList.toggle('active');
    };

    // 处理点击外部关闭菜单
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const menu = document.querySelector('.menu');
      const menuToggle = document.querySelector('.menu-toggle');
      const menuOverlay = document.querySelector('.menu-overlay');
      const navBar = document.querySelector('.navBar');
      
      if (!menuToggle?.contains(target) && !menu?.contains(target) && !navBar?.contains(target)) {
        menu?.classList.remove('active');
        menuToggle?.classList.remove('active');
        menuOverlay?.classList.remove('active');
      }
    };

    // 处理覆盖层点击关闭菜单
    const handleOverlayClick = () => {
      const menu = document.querySelector('.menu');
      const menuToggle = document.querySelector('.menu-toggle');
      const menuOverlay = document.querySelector('.menu-overlay');
      
      menu?.classList.remove('active');
      menuToggle?.classList.remove('active');
      menuOverlay?.classList.remove('active');
    };
    const handleSmoothScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const href = target.getAttribute('href');
        const element = document.querySelector(href || '');
        element?.scrollIntoView({ behavior: 'smooth' });
      }
    };

    // 处理主题切换
    const handleThemeToggle = () => {
      const body = document.body;
      const themeIcon = document.querySelector('.theme-icon');
      
      if (body.classList.contains('dark-mode')) {
        body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
        themeIcon!.textContent = '🌙'; // Show moon icon in light mode
      } else {
        body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
        themeIcon!.textContent = '☀️'; // Show sun icon in dark mode
      }
    };

    const animateSkillBars = () => {
      const skillBars = document.querySelectorAll('.skill-progress-bar');
      const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const skillBar = entry.target as HTMLElement;
            const skillLevel = skillBar.getAttribute('data-skill');
            if (skillLevel && !skillBar.classList.contains('animated')) {
              skillBar.style.width = skillLevel + '%';
              skillBar.classList.add('animated');
              
              // 动画百分比数字
              const percentage = skillBar.nextElementSibling as HTMLElement;
              if (percentage && percentage.classList.contains('skill-percentage')) {
                let current = 0;
                const target = parseInt(skillLevel);
                const increment = target / 50;
                const timer = setInterval(() => {
                  current += increment;
                  if (current >= target) {
                    current = target;
                    clearInterval(timer);
                  }
                  percentage.textContent = Math.round(current) + '%';
                }, 30);
              }
            }
          }
        });
      }, { threshold: 0.5 });

      skillBars.forEach(bar => {
        skillObserver.observe(bar);
      });
    };

    // 初始化技能条
    setTimeout(() => {
      animateSkillBars();
    }, 100);

    // 磁性光标效果
    const initMagneticCursor = () => {
      const cursorDot = document.getElementById('cursorDot');
      const cursorTrail = document.getElementById('cursorTrail');
      
      if (!cursorDot || !cursorTrail) return;

      let mouseX = 0, mouseY = 0;
      let trailX = 0, trailY = 0;

      // 鼠标移动事件
      const handleMouseMove = (e: MouseEvent) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top = mouseY + 'px';
      };

      // 平滑移动轨迹
      const animateTrail = () => {
        trailX += (mouseX - trailX) * 0.1;
        trailY += (mouseY - trailY) * 0.1;
        
        cursorTrail.style.left = trailX + 'px';
        cursorTrail.style.top = trailY + 'px';
        
        requestAnimationFrame(animateTrail);
      };

      // 磁性效果
      const handleMagneticHover = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const magneticElements = document.querySelectorAll('.magnetic-hover');
        
        magneticElements.forEach(element => {
          if (element.contains(target)) {
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const deltaX = (mouseX - centerX) * 0.15;
            const deltaY = (mouseY - centerY) * 0.15;
            
            (element as HTMLElement).style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.05)`;
          }
        });
      };

      const handleMagneticLeave = () => {
        const magneticElements = document.querySelectorAll('.magnetic-hover');
        magneticElements.forEach(element => {
          (element as HTMLElement).style.transform = '';
        });
      };

      // 添加事件监听器
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mousemove', handleMagneticHover);
      window.addEventListener('mouseout', handleMagneticLeave);
      
      // 开始动画循环
      animateTrail();

      // 为交互元素添加磁性类
      const interactiveElements = document.querySelectorAll('button, a, .card, .frontSkill, .backSkill, .datasciSkill, .toolsSkill');
      interactiveElements.forEach(element => {
        element.classList.add('magnetic-hover');
      });

      // 隐藏默认光标，但为输入字段添加例外
      document.body.style.cursor = 'none';
    };

    // 处理光标显示 - 简化逻辑，确保自定义光标始终可见
    const handleInputHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const cursorDot = document.getElementById('cursorDot');
      const cursorTrail = document.getElementById('cursorTrail');
      
      // 确保自定义光标元素存在
      if (!cursorDot || !cursorTrail) return;
      
      // 检查是否是邮件链接
      const isEmailLink = target.tagName === 'A' && target.getAttribute('href')?.startsWith('mailto:');
      const isPasswordModal = target.closest('.password-modal') || target.closest('.password-modal-overlay');
      
      // 对邮件链接显示指针样式
      if (isEmailLink) {
        document.body.style.cursor = 'none';
        cursorDot.style.opacity = '1';
        cursorTrail.style.opacity = '1';
        cursorDot.classList.add('cursor-pointer');
        cursorTrail.classList.add('cursor-pointer-trail');
      } 
      // 只对非密码模态框的输入字段显示默认光标
      else if ((target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') && !isPasswordModal) {
        document.body.style.cursor = 'auto';
        cursorDot.style.opacity = '0';
        cursorTrail.style.opacity = '0';
        cursorDot.classList.remove('cursor-pointer');
        cursorTrail.classList.remove('cursor-pointer-trail');
      } 
      else {
        document.body.style.cursor = 'none';
        cursorDot.style.opacity = '1';
        cursorTrail.style.opacity = '1';
        cursorDot.classList.remove('cursor-pointer');
        cursorTrail.classList.remove('cursor-pointer-trail');
      }
    };
    
    // 初始化磁性光标 - iOS优化
    if (window.innerWidth > 768 && !isIOS) { // 只在桌面端且非iOS设备启用
      initMagneticCursor();
    } else if (isIOS) {
      // iOS设备禁用自定义光标，使用原生光标
      document.body.style.cursor = 'auto';
    }

    // 文字动画效果
    const initTextAnimations = () => {
      // 分割文字动画
      const splitTextElements = document.querySelectorAll('.split-text');
      splitTextElements.forEach(element => {
        const text = element.textContent || '';
        element.innerHTML = '';
        text.split('').forEach((char, index) => {
          const span = document.createElement('span');
          span.textContent = char === ' ' ? '\u00A0' : char;
          span.style.animationDelay = `${index * 0.05}s`;
          element.appendChild(span);
        });
      });

      // 渐变文字效果
      const headings = document.querySelectorAll('h1, h2, h3');
      headings.forEach((heading, index) => {
        if (index % 2 === 0) {
          heading.classList.add('gradient-text');
        }
      });

      // 滚动触发的文字动画
      const textObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-text');
          }
        });
      }, { threshold: 0.1 });

      document.querySelectorAll('p, .text h2, .skillh1').forEach(element => {
        textObserver.observe(element);
      });
    };

    // 初始化文字动画
    initTextAnimations();

    // 返回顶部按钮
    const initBackToTop = () => {
      const backToTopButton = document.getElementById('backToTop');
      
      if (!backToTopButton) return;

      // 显示/隐藏按钮
      const toggleBackToTop = () => {
        if (window.scrollY > 300) {
          backToTopButton.classList.add('visible');
        } else {
          backToTopButton.classList.remove('visible');
        }
      };

      // 点击返回顶部
      const scrollToTop = () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      };

      // 添加事件监听器
      window.addEventListener('scroll', toggleBackToTop);
      backToTopButton.addEventListener('click', scrollToTop);

      // 初始检查
      toggleBackToTop();
    };

    // 初始化返回顶部按钮
    initBackToTop();

    // 初始化主题
    const initTheme = () => {
      const savedTheme = localStorage.getItem('theme');
      const themeIcon = document.querySelector('.theme-icon');
      
      // Default to light theme, only use dark if explicitly saved
      if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeIcon) themeIcon.textContent = '☀️'; // Show sun icon in dark mode
      } else {
        // Default to light mode (no dark-mode class)
        if (themeIcon) themeIcon.textContent = '🌙'; // Show moon icon in light mode
      }
    };

    // 初始化主题
    initTheme();

    // Reading progress bar
    const updateReadingProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      const progressBar = document.getElementById('readingProgressBar');
      if (progressBar) {
        progressBar.style.width = `${scrollPercent}%`;
      }
    };

    // Loading screen
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    // 添加事件监听器
    window.addEventListener('scroll', () => {
      handleScroll();
      updateScrollProgress();
      updateReadingProgress();
    });
    document.querySelector('.menu-toggle')?.addEventListener('click', handleMenuClick);
    document.addEventListener('click', handleClickOutside);
    document.querySelector('.menu-overlay')?.addEventListener('click', handleOverlayClick);
    document.querySelector('.menu')?.addEventListener('click', handleSmoothScroll);
    document.getElementById('themeToggle')?.addEventListener('click', handleThemeToggle);
    document.addEventListener('mouseover', handleInputHover);

    // Navigation arrow scroll functionality
    const menu = document.getElementById('menu');
    const navArrowLeft = document.getElementById('navArrowLeft');
    const navArrowRight = document.getElementById('navArrowRight');

    const handleNavScrollLeft = () => {
      if (menu) {
        menu.scrollBy({ left: -200, behavior: 'smooth' });
      }
    };

    const handleNavScrollRight = () => {
      if (menu) {
        menu.scrollBy({ left: 200, behavior: 'smooth' });
      }
    };

    navArrowLeft?.addEventListener('click', handleNavScrollLeft);
    navArrowRight?.addEventListener('click', handleNavScrollRight);

    // 清理函数
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.querySelector('.menu-toggle')?.removeEventListener('click', handleMenuClick);
      document.removeEventListener('click', handleClickOutside);
      document.querySelector('.menu-overlay')?.removeEventListener('click', handleOverlayClick);
      document.querySelector('.menu')?.removeEventListener('click', handleSmoothScroll);
      document.getElementById('themeToggle')?.removeEventListener('click', handleThemeToggle);
      document.removeEventListener('mouseover', handleInputHover);
      navArrowLeft?.removeEventListener('click', handleNavScrollLeft);
      navArrowRight?.removeEventListener('click', handleNavScrollRight);
    };
  }, []);

  return (
    <>
      {/* Loading Screen */}
      {isLoading && (
        <div className={`loading-overlay ${!isLoading ? 'hidden' : ''}`}>
          <div className="spinner"></div>
          <div className="loading-text">LOADING</div>
        </div>
      )}

      {/* Reading Progress Bar */}
      <div className="reading-progress-bar" id="readingProgressBar"></div>

      {/* Skip Link for Accessibility  <a href="#main-content" className="skip-link">Skip to main content</a> */}


      {/* iOS Notification */}
      {showIOSNotification && (
        <div className="ios-notification" style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#007AFF',
          color: 'white',
          padding: '15px 20px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '600',
          zIndex: '9999',
          boxShadow: '0 8px 32px rgba(0, 122, 255, 0.3)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          maxWidth: '90%',
          textAlign: 'center',
          lineHeight: '1.4',
          animation: 'slideInDown 0.5s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '20px' }}>📱</span>
            <strong>For all iOS User Notice</strong>
          </div>
          <div>
            <strong>iOS Performance Notice</strong><br/><br/>
            For the best viewing experience, we recommend using Google Chrome or accessing the site on another operating system (Windows, Linux, Ubuntu, Android, etc.). <br/><br/>iOS Safari may experience performance issues due to advanced code protections, which can cause lag or unexpected crashes during certain operations.<br/><br/>This pop-up notification only appears for users on iOS devices.
          </div>
          <button 
            onClick={() => setShowIOSNotification(false)}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              marginTop: '12px',
              transition: 'all 0.2s ease'
            }}
          >
            Got it
          </button>
        </div>
      )}

      {/* Menu Overlay */}
      <div className="menu-overlay" id="menuOverlay"></div>

      {/* Scroll Progress Indicator */}
      <div className="scroll-progress" id="scrollProgress"></div>

      {/* Custom Cursor */}
      <div className="cursor-dot" id="cursorDot"></div>
      <div className="cursor-trail" id="cursorTrail"></div>

      {/* Back to Top Button */}
      <button className="back-to-top" id="backToTop" aria-label="Back to top">
        <span className="back-to-top-icon">↑</span>
      </button>

      <header>
        <nav id="navBar" className="navBar">
          <div className="name" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <h1>{content.nav.name}</h1>
          </div>
          <div className="menu-toggle" id="menuToggle">
            <div className="hamburger">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <button className="nav-arrow nav-arrow-left" id="navArrowLeft" aria-label="Scroll left">
            ‹
          </button>
          <div className="menu" id="menu">
            <ul>
              {content.nav.menu.map((item, index) => (
                <li key={index}><a href={item.link}>{item.text}</a></li>
              ))}
              <li>
                <button className="theme-toggle" id="themeToggle" aria-label="Toggle theme">
                  <span className="theme-icon">🌙</span>
                </button>
              </li>
              <li>
                <button className="qr-toggle" onClick={() => setShowQRCode(!showQRCode)} aria-label="Share portfolio">
                  <span className="qr-icon">📱</span>
                </button>
              </li>
            </ul>
          </div>
          <button className="nav-arrow nav-arrow-right" id="navArrowRight" aria-label="Scroll right">
            ›
          </button>
        </nav>
      </header>

      <main id="main-content">
      <section className="hero" id="home">
        <div className="over"></div>
        <div className="hero-container">
          <h1>
            <p className="up">{content.hero.greeting}</p><br />
            {/* <p className="down">{content.hero.name}</p> */}
          </h1>
          <h1>I'm <span className="auto-type">{content.hero.name}</span></h1>
          <div className="botton">
            {content.contact.social.map((social, index) => (
              <a key={index} href={social.link} target="_blank">
                <img src={`/images/${social.icon}.svg`} alt={social.name} loading="lazy" />
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="about" id="about">
        <div className="about-container">
          <div className="imgeffect">
            <div className="flipper">
              <div className="front">
                <img src="/images/githubprofile.png" alt="" loading="lazy" />
              </div>
              <div className="back">
                <img src="/images/profile2.png" alt="" loading="lazy" />
              </div>
            </div>
          </div>
          <div className="text">
            <p className="p1">Who Am I?</p>
            <h2>{content.about.title}</h2>
            {content.about.description.map((para, index) => (
              <p key={index} className="p2" dangerouslySetInnerHTML={{
                __html: para.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              }}></p>
            ))}
            {content.about.workExperience && content.about.workExperience.length > 0 && (
              <div className="work-experience">
                {content.about.workExperience.map((exp, index) => (
                  <div key={index} className="work-item">
                    <a href={exp.website} target="_blank" rel="noopener noreferrer" className="company-link">
                      <img src={exp.logo} alt={`${exp.company} Logo`} className="company-logo" loading="lazy" />
                    </a>
                    <p className="p2">
                      <strong>{exp.company}</strong> - {exp.position} ({exp.period})
                    </p>
                  </div>
                ))}
              </div>
            )}
            <button onClick={handleCVDownload}>{content.about.button}</button>
          </div>
        </div>
      </section>

      <section className="Skills" id="skills">
        <div className="container">
          <div className="heading">
            <h1 className="skillh1">{content.skills.title}</h1>
          </div>
          <div className="mainSkill">
            <div className="front">
              <h2>Frontend</h2>
              <div className="box">
                {content.skills.categories[0].skills.map((skill, index) => (
                  <div key={index} className="frontSkill">
                    <img src={skill.image} alt="" loading="lazy" />
                    {skill.name}
                  </div>
                ))}
              </div>
            </div>
            <div className="back">
              <h2>Backend</h2>
              <div className="box">
                {content.skills.categories[1].skills.map((skill, index) => (
                  <div key={index} className="backSkill">
                    <img src={skill.image} alt="" loading="lazy" />
                    {skill.name}
                  </div>
                ))}
              </div>
            </div>
            <div className="datasci">
              <h2>Data Science</h2>
              <div className="box">
                {content.skills.categories[2].skills.map((skill, index) => (
                  <div key={index} className="datasciSkill">
                    <img src={skill.image} alt="" loading="lazy" />
                    {skill.name}
                  </div>
                ))}
              </div>
            </div>
            <div className="tools">
              <h2>Tools</h2>
              <div className="box">
                {content.skills.categories[3].skills.map((skill, index) => (
                  <div key={index} className="toolsSkill">
                    <img src={skill.image} alt="" loading="lazy" />
                    {skill.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="experience-modern" id="experience">
        <div className="experience-header">
          <div className="section-badge">Career Journey</div>
          <h2 className="experience-title">{content.experience.title}</h2>
          <p className="experience-subtitle">My professional growth and achievements</p>
        </div>
        
        <div className="experience-container">
          <div className="experience-timeline">
            {content.experience.timeline.map((item, index) => (
              <div key={index} className="experience-item" data-index={index}>
                <div className="experience-timeline-line"></div>
                <div className="experience-timeline-dot">
                  <div className="dot-inner"></div>
                  <div className="dot-pulse"></div>
                </div>
                
                <div className="experience-card">
                  <div className="experience-card-header">
                    <div className="experience-icon">
                      {item.logo && item.website ? (
                        <a href={item.website} target="_blank" rel="noopener noreferrer">
                          <img src={item.logo} alt={`${item.company} Logo`} className="company-logo-icon" loading="lazy" />
                        </a>
                      ) : (
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="default-icon-svg">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                      )}
                    </div>
                    <div className="experience-meta">
                      <h3 className="experience-role">{item.title}</h3>
                      <div className="experience-company-info">
                        <span className="company-name">{item.company}</span>
                        <span className="experience-period">{item.period}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="experience-description">
                    <p>{item.description}</p>
                  </div>
                  
                  <div className="experience-skills">
                    <div className="skill-tags">
                      <span className="skill-tag">Web Development</span>
                      <span className="skill-tag">Frontend</span>
                      <span className="skill-tag">Backend</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="projects-showcase" id="projects">
        <div className="projects-header">
          <div className="section-badge">Portfolio</div>
          <h2>{content.projects.title}</h2>
          <p>Explore my latest work and creative solutions</p>
        </div>
        
        <div className="projects-grid">
          {content.projects.items.map((project, index) => (
            <article key={index} className="project-showcase-card">
              <div className="project-visual">
                <div className="project-image-wrapper">
                  <img src={project.image} alt={project.title} className="project-image" loading="lazy" />
                  <div className="project-overlay">
                    <div className="project-number">0{index + 1}</div>
                    <div className="project-actions">
                      <a href={project.github} target="_blank" rel="noopener noreferrer" className="action-btn primary">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                        </svg>
                        Code
                      </a>
                      <button onClick={() => handleProjectAccess(project.site, project.title)} className="action-btn secondary">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                          <polyline points="15,3 21,3 21,9"/>
                          <line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                        Live
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="project-content">
                <div className="project-meta">
                  <span className="project-category">Web Development</span>
                  <span className="project-date">2024</span>
                </div>
                <h3 className="project-title">{project.title}</h3>
                <p className="project-description">{project.description}</p>
                <div className="project-tech">
                  {project.technologies?.slice(0, 3).map((tech, techIndex) => (
                    <span key={techIndex} className="tech-tag">{tech}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="blog-section" id="blog">
        <div className="blog-header">
          <div className="section-badge">Insights</div>
          <h2>{content.blog.title}</h2>
          <p>{content.blog.description}</p>
        </div>
        
        <div className="blog-grid">
          {content.blog.posts.map((post, index) => (
            <article key={index} className="blog-card">
              <div className="blog-image">
                <img src={post.image} alt={post.title} loading="lazy" />
              </div>
              <div className="blog-content">
                <div className="blog-meta">
                  <span className="blog-date">{post.date}</span>
                  <span className="blog-read-time">{post.readTime}</span>
                </div>
                <h3 className="blog-title">{post.title}</h3>
                <p className="blog-excerpt">{post.excerpt}</p>
                <div className="blog-tags">
                  {post.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className="blog-tag">{tag}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="testimonials-section" id="testimonials">
        <div className="testimonials-header">
          <div className="section-badge">Recommendations</div>
          <h2>{content.testimonials.title}</h2>
          <p>{content.testimonials.description}</p>
        </div>
        
        <div className="testimonials-grid">
          {content.testimonials.items.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="testimonial-quote">
                <svg className="quote-icon" width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.017 21L14.017 18C14.017 16.896 14.321 15.928 14.929 15.096C15.537 14.264 16.313 13.648 17.257 13.248L17.257 11.232C16.721 11.424 16.225 11.688 15.769 12.024C15.313 12.36 14.941 12.736 14.653 13.152L14.653 6L12.073 6L12.073 21L14.017 21ZM5.777 21L5.777 18C5.777 16.896 6.081 15.928 6.689 15.096C7.297 14.264 8.073 13.648 9.017 13.248L9.017 11.232C8.481 11.424 7.985 11.688 7.529 12.024C7.073 12.36 6.701 12.736 6.413 13.152L6.413 6L3.833 6L3.833 21L5.777 21Z"/>
                </svg>
                <p>{testimonial.quote}</p>
              </div>
              <div className="testimonial-author">
                <img src={testimonial.avatar} alt={testimonial.name} className="author-avatar" loading="lazy" />
                <div className="author-info">
                  <h4>{testimonial.name}</h4>
                  <p>{testimonial.position} at {testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="certifications-section" id="certifications">
        <div className="certifications-header">
          <div className="section-badge">Credentials</div>
          <h2>{content.certifications.title}</h2>
          <p>{content.certifications.description}</p>
        </div>
        
        <div className="certifications-grid">
          {content.certifications.items.map((cert, index) => (
            <div key={index} className="certification-card">
              <div className="cert-image">
                <img src={cert.image} alt={cert.name} loading="lazy" />
              </div>
              <div className="cert-content">
                <h3>{cert.name}</h3>
                <p className="cert-issuer">{cert.issuer}</p>
                <p className="cert-date">{cert.date}</p>
                <a href={cert.url} target="_blank" rel="noopener noreferrer" className="cert-link">
                  View Credential
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="awards-section" id="awards">
        <div className="awards-header">
          <div className="section-badge">Achievements</div>
          <h2>{content.awards.title}</h2>
          <p>{content.awards.description}</p>
        </div>
        
        <div className="awards-grid">
          {content.awards.items.map((award, index) => (
            <div key={index} className="award-card">
              <div className="award-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="7"/>
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                </svg>
              </div>
              <div className="award-content">
                <h3>{award.title}</h3>
                <p className="award-organization">{award.organization}</p>
                <p className="award-date">{award.date}</p>
                <p className="award-description">{award.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="publications-section" id="publications">
        <div className="publications-header">
          <div className="section-badge">Research</div>
          <h2>{content.publications.title}</h2>
          <p>{content.publications.description}</p>
        </div>
        
        <div className="publications-list">
          {content.publications.items.map((pub, index) => (
            <div key={index} className="publication-item">
              <div className="publication-content">
                <h3>{pub.title}</h3>
                <p className="publication-journal">{pub.journal}</p>
                <p className="publication-authors">{pub.authors.join(', ')}</p>
                <p className="publication-date">{pub.date}</p>
                <div className="publication-links">
                  <a href={pub.url} target="_blank" rel="noopener noreferrer" className="pub-link">
                    Read Paper
                  </a>
                  {pub.doi && (
                    <span className="pub-doi">DOI: {pub.doi}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="contact-modern" id="contact">
        <div className="contact-header">
          <div className="section-badge">Get In Touch</div>
          <h2>Let's Connect</h2>
          <p>Have a project in mind? Let's create something amazing together</p>
        </div>
        
        <div className="contact-container-modern">
          <div className="contact-info-modern">
            <div className="info-card">
              <div className="info-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <div className="info-details">
                <h4>Phone</h4>
                <p><a href="tel:+60173014638">+60 17-301 4638</a></p>
              </div>
            </div>
            
            <div className="info-card">
              <div className="info-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <div className="info-details">
                <h4>Email</h4>
                <p><a href="mailto:henryneoh22@gmail.com">henryneoh22@gmail.com</a></p>
              </div>
            </div>
            
            <div className="info-card">
              <div className="info-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div className="info-details">
                <h4>Location</h4>
                <p>Georgetown, Penang, Malaysia</p>
              </div>
            </div>
            
            <div className="social-links-modern">
              <h4>Connect with me</h4>
              <div className="social-grid">
                {content.contact.social.map((social, index) => (
                  <a key={index} href={social.link} target="_blank" rel="noopener noreferrer" className="social-link-modern">
                    <img src={`/images/${social.icon}.svg`} alt={social.name} loading="lazy" />
                    <span>{social.name}</span>
                  </a>
                ))}
              </div>
              <div className="share-buttons-wrapper">
                <ShareButtons />
              </div>
              <div className="linkedin-badge-container">
                <div className="badge-base LI-profile-badge" data-locale="en_US" data-size="large" data-theme="light" data-type="HORIZONTAL" data-vanity="neoh-wei-jian" data-version="v1">
                  <a className="badge-base__link LI-simple-link" href="https://www.linkedin.com/in/neoh-wei-jian?trk=profile-badge" target="_blank" rel="noopener noreferrer"></a>
                </div>
              </div>
              <div className="jobstreet-profile-badge">
                <a
                  className="jobstreet-badge-link"
                  href="https://my.jobstreet.com/profiles/neoh-weijian-mLqfF3hHG2"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View my JobStreet profile"
                >
                  <div className="jobstreet-badge-content">
                    <div className="jobstreet-logo">J</div>
                    <div className="jobstreet-text">
                      <span className="jobstreet-title">JobStreet<br/>NEOH WEI JIAN</span>
                      <span className="jobstreet-subtitle">Former Technician, Calibration at Venture Corporation Limited</span>
                      <span className="jobstreet-subtitle">Venture Corporation Limited | Universiti Malaysia Perlis</span>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="contact-form-section" id="contact-form">
        <div className="contact-form-header">
          <div className="section-badge">Get In Touch</div>
          <h2>Send Me a Message</h2>
          <p>Have a question or want to work together? Drop me a message!</p>
        </div>
        <ContactForm />
      </section>

      <ViewCounter />
      
      {/* Scroll to Top Button */}
      <button
        className={`scroll-to-top ${showScrollTop ? 'visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
      >
        ↑
      </button>
      
      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type} show`}>
            <span className="toast-icon">
              {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}
            </span>
            <span className="toast-message">{toast.message}</span>
            <button
              className="toast-close"
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              aria-label="Close toast"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      
      {/* QR Code Modal */}
      {showQRCode && (
        <div className={`qr-modal-overlay ${showQRCode ? 'active' : ''}`} onClick={() => setShowQRCode(false)}>
          <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="qr-modal-header">
              <h3>Share Portfolio</h3>
              <button className="close-modal" onClick={() => setShowQRCode(false)}>&times;</button>
            </div>
            <div className="qr-modal-body">
              <div className="qr-code-container">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://portfolio1.edgeone.app" 
                  alt="Portfolio QR Code"
                  width="200"
                  height="200"
                />
              </div>
              <p className="qr-instruction">Scan to share this portfolio</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Password Modal */}
      {showPasswordModal && (
        <div className="password-modal-overlay" onClick={closeModal}>
          <div className="password-modal" onClick={(e) => e.stopPropagation()}>
            <div className="password-modal-header">
              <h3>{accessType === 'cv' ? 'Enter Password' : 'Enter Password for Project Access'}</h3>
              <button className="close-modal" onClick={closeModal}>&times;</button>
            </div>
            <div className="password-modal-body">
              <p>Due to personal information security and privacy please contact this email <a href="mailto:henryneoh22@gmail.com" style={{fontWeight: 'bold', color: '#6366f1', textDecoration: 'underline'}}>henryneoh22@gmail.com</a> to get the password.</p>
              <p>{accessType === 'cv' ? 'Please enter the password to download the CV:' : 'Please enter the password to view the project:'}</p>
              <form onSubmit={verifyPassword}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="password-input"
                  autoFocus
                />
                {passwordError && (
                  <div className="password-error">{passwordError}</div>
                )}
                <div className="password-modal-actions">
                  <button type="button" onClick={closeModal} className="cancel-btn">
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    {accessType === 'cv' ? 'Download CV' : 'Access Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      </main>
    </>
  );
}
