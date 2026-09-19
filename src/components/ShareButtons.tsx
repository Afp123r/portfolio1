'use client';

import { useState } from 'react';

interface ShareButtonsProps {
  title?: string;
  description?: string;
  url?: string;
}

export default function ShareButtons({ 
  title = 'Portfolio - Neoh Wei Jian', 
  description = 'Full Stack Developer specializing in React, Next.js, Python, and Data Science',
  url 
}: ShareButtonsProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://portfolio1.edgeone.app');

  const shareOptions = [
    {
      name: 'Twitter',
      icon: '𝕏',
      color: '#1DA1F2',
      shareUrl: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'LinkedIn',
      icon: 'in',
      color: '#0077B5',
      shareUrl: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`,
    },
    {
      name: 'Facebook',
      icon: 'f',
      color: '#1877F2',
      shareUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'WhatsApp',
      icon: '✆',
      color: '#25D366',
      shareUrl: `https://wa.me/?text=${encodeURIComponent(`${title} ${shareUrl}`)}`,
    },
    {
      name: 'Copy Link',
      icon: '🔗',
      color: '#666666',
      action: 'copy',
    },
  ];

  const handleShare = async (option: typeof shareOptions[0]) => {
    if (option.action === 'copy') {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    } else {
      window.open(option.shareUrl, '_blank', 'noopener,noreferrer');
    }
    setShowShareMenu(false);
  };

  return (
    <div className="share-buttons-container">
      <button
        className="share-toggle-btn"
        onClick={() => setShowShareMenu(!showShareMenu)}
        aria-label="Share portfolio"
      >
        <span className="share-icon">📤</span>
        <span className="share-text">Share</span>
      </button>

      {showShareMenu && (
        <div className="share-menu">
          <div className="share-menu-header">Share this portfolio</div>
          <div className="share-options">
            {shareOptions.map((option, index) => (
              <button
                key={index}
                className="share-option-btn"
                onClick={() => handleShare(option)}
                style={{ '--share-color': option.color } as React.CSSProperties}
                aria-label={`Share on ${option.name}`}
              >
                <span className="share-option-icon">{option.icon}</span>
                <span className="share-option-name">{option.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
