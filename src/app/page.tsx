'use client';

import { useEffect, useState } from 'react';
import content from '../config/content.json';
import ViewCounter from "./ViewCounter";

export default function Home() {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [accessType, setAccessType] = useState<'cv' | 'project'>('cv');
  const [projectUrl, setProjectUrl] = useState('');
  
  // Password stored in environment variable for better security
  const CORRECT_PASSWORD = process.env.NEXT_PUBLIC_CV_PASSWORD || 'cv123';

  const handleCVDownload = () => {
    setAccessType('cv');
    setShowPasswordModal(true);
    setPasswordError('');
    setPassword('');
  };

  const handleProjectAccess = (projectUrl: string) => {
    setAccessType('project');
    setProjectUrl(projectUrl);
    setShowPasswordModal(true);
    setPasswordError('');
    setPassword('');
  };

  const verifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Test without salt first to isolate the issue
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Hash of "cv123" without salt
      const correctHash = '50b060a8934ac7387d8249110b90d91de101e488ff252fe880c4a48bacc003e5';
      
      if (hashHex === correctHash) {
        setIsPasswordVerified(true);
        setShowPasswordModal(false);
        
        if (accessType === 'cv') {
          // Download the CV
          window.open(content.hero.resume, '_blank');
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

  const closeModal = () => {
    setShowPasswordModal(false);
    setPassword('');
    setPasswordError('');
  };

  useEffect(() => {
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

    // 处理滚动进度
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      const scrollProgress = document.getElementById('scrollProgress');
      if (scrollProgress) {
        scrollProgress.style.width = scrollPercent + '%';
      }
    };

    // 处理技能条动画
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
    
    // 初始化磁性光标
    if (window.innerWidth > 768) { // 只在桌面端启用
      initMagneticCursor();
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
      
      if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.body.classList.add('dark-mode');
        if (themeIcon) themeIcon.textContent = '☀️'; // Show sun icon in dark mode
      } else {
        if (themeIcon) themeIcon.textContent = '🌙'; // Show moon icon in light mode
      }
    };

    // 初始化主题
    initTheme();

    // 添加事件监听器
    window.addEventListener('scroll', () => {
      handleScroll();
      updateScrollProgress();
    });
    document.querySelector('.menu-toggle')?.addEventListener('click', handleMenuClick);
    document.addEventListener('click', handleClickOutside);
    document.querySelector('.menu-overlay')?.addEventListener('click', handleOverlayClick);
    document.querySelector('.menu')?.addEventListener('click', handleSmoothScroll);
    document.getElementById('themeToggle')?.addEventListener('click', handleThemeToggle);
    document.addEventListener('mouseover', handleInputHover);

    // 清理函数
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.querySelector('.menu-toggle')?.removeEventListener('click', handleMenuClick);
      document.removeEventListener('click', handleClickOutside);
      document.querySelector('.menu-overlay')?.removeEventListener('click', handleOverlayClick);
      document.querySelector('.menu')?.removeEventListener('click', handleSmoothScroll);
      document.getElementById('themeToggle')?.removeEventListener('click', handleThemeToggle);
      document.removeEventListener('mouseover', handleInputHover);
    };
  }, []);

  return (
    <>
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
            </ul>
          </div>
        </nav>
      </header>

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
                <img src={`/images/${social.icon}.svg`} alt={social.name} />
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
                <img src="/images/githubprofile.png" alt="" />
              </div>
              <div className="back">
                <img src="/images/profile2.png" alt="" />
              </div>
            </div>
          </div>
          <div className="text">
            <p className="p1">Who Am I?</p>
            <h2>{content.about.title}</h2>
            {content.about.description.map((para, index) => (
              <p key={index} className="p2">{para}</p>
            ))}
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
                    <img src={skill.image} alt="" />
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
                    <img src={skill.image} alt="" />
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
                    <img src={skill.image} alt="" />
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
                    <img src={skill.image} alt="" />
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
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
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
                  <img src={project.image} alt={project.title} className="project-image" />
                  <div className="project-overlay">
                    <div className="project-number">0{index + 1}</div>
                    <div className="project-actions">
                      <a href={project.github} target="_blank" rel="noopener noreferrer" className="action-btn primary">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        Code
                      </a>
                      <button onClick={() => handleProjectAccess(project.site)} className="action-btn secondary">
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
                    <img src={`/images/${social.icon}.svg`} alt={social.name} />
                    <span>{social.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
          
                  </div>
      </section>

      <ViewCounter />
      
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
    </>
  );
}
