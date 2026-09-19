'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <h1 style={{ 
        color: 'white', 
        fontSize: '8rem', 
        fontWeight: 'bold', 
        marginBottom: '1rem',
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
      }}>
        404
      </h1>
      <h2 style={{ 
        color: 'white', 
        fontSize: '2rem', 
        marginBottom: '1rem',
        fontWeight: '500'
      }}>
        Page Not Found
      </h2>
      <p style={{ 
        color: 'rgba(255,255,255,0.9)', 
        fontSize: '1.2rem', 
        marginBottom: '2rem',
        maxWidth: '500px'
      }}>
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/"
        style={{
          padding: '14px 28px',
          background: 'white',
          color: '#667eea',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1.1rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          textDecoration: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        Back to Home
      </Link>
    </div>
  );
}
