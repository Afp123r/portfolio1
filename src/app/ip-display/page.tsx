'use client';

import { useEffect, useState } from 'react';
import IPTracker from '../../utils/ipTracker';

export default function IPDisplay() {
  const [userIP, setUserIP] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [stored, setStored] = useState<boolean>(false);

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        setLoading(true);
        
        // Get user's IP using multiple methods
        let ip = '';
        
        // Method 1: Try using our own API
        try {
          const response = await fetch('/api/get-user-ip');
          if (response.ok) {
            const data = await response.json();
            ip = data.ip;
          }
        } catch (err) {
          console.warn('Own IP API failed, trying external APIs');
        }

        // Method 2: Try external APIs if own API fails
        if (!ip) {
          const ipApis = [
            'https://api.ipify.org?format=json',
            'https://ipapi.co/json/',
            'https://ip-api.com/json/',
            'https://api.ip.sb/geoip',
            'https://ifconfig.me/ip'
          ];

          for (const apiUrl of ipApis) {
            try {
              const response = await fetch(apiUrl);
              if (response.ok) {
                const data = await response.json();
                ip = data.ip || data.query || data.ipAddress || data.ip_address;
                if (ip) break;
              }
            } catch (err) {
              console.warn(`IP API ${apiUrl} failed:`, err);
              continue;
            }
          }
        }

        if (!ip) {
          throw new Error('Could not determine IP address');
        }

        setUserIP(ip);

        // Get country using our server-side API
        let detectedCountry = 'Unknown';
        try {
          const geoResponse = await fetch(`/api/geolocation?ip=${ip}`);
          if (geoResponse.ok) {
            const geoData = await geoResponse.json();
            detectedCountry = geoData.country || 'Unknown';
            setCountry(detectedCountry);
          }
        } catch (err) {
          console.warn('Geolocation failed:', err);
          setCountry('Unknown');
        }

        // Store IP in KV storage
        try {
          const ipTracker = IPTracker.getInstance();
          const success = await ipTracker.recordIPAddress({
            ip: ip,
            isVPN: false, // We'll detect VPN separately if needed
            country: detectedCountry,
            provider: undefined
          });
          
          if (success) {
            setStored(true);
            console.log('IP stored successfully in KV storage');
          } else {
            console.warn('Failed to store IP in KV storage');
          }
        } catch (err) {
          console.error('Error storing IP in KV:', err);
        }

      } catch (err) {
        setError('Failed to get IP information');
        console.error('IP detection error:', err);
      } finally {
        setLoading(false);
      }
    };

    getUserInfo();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        fontFamily: 'Arial, sans-serif'
      }}>
        Detecting your IP address...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: 'red',
        fontFamily: 'Arial, sans-serif'
      }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center'
    }}>
      <h1 style={{ 
        marginBottom: '40px', 
        color: '#333',
        fontSize: '2.5em'
      }}>
        Your IP Information
      </h1>

      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '40px',
        borderRadius: '15px',
        marginBottom: '30px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '1.2em', opacity: 0.9 }}>
            IP Address
          </h2>
          <p style={{ 
            margin: '0', 
            fontSize: '2em', 
            fontWeight: 'bold',
            fontFamily: 'monospace',
            wordBreak: 'break-all'
          }}>
            {userIP}
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '1.2em', opacity: 0.9 }}>
            Country
          </h2>
          <p style={{ 
            margin: '0', 
            fontSize: '1.5em', 
            fontWeight: 'bold'
          }}>
            {country}
          </p>
        </div>

        <div>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '1.2em', opacity: 0.9 }}>
            Storage Status
          </h2>
          <p style={{ 
            margin: '0', 
            fontSize: '1.2em', 
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            {stored ? (
              <>
                <span style={{ color: '#4ade80' }}>✓</span>
                <span>Stored in KV</span>
              </>
            ) : (
              <>
                <span style={{ color: '#f87171' }}>✗</span>
                <span>Not Stored</span>
              </>
            )}
          </p>
        </div>
      </div>

      <div style={{ 
        background: '#f8f9fa', 
        padding: '30px', 
        borderRadius: '10px',
        marginBottom: '30px'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>
          About This Information
        </h3>
        <p style={{ margin: '0 0 10px 0', color: '#666', lineHeight: '1.6' }}>
          This page displays your current IP address and geolocation information and stores it in your EdgeOne KV storage.
          The information is detected in real-time each time you visit this page.
        </p>
        <p style={{ margin: '0', color: '#666', lineHeight: '1.6' }}>
          {stored ? 
            'Your IP has been successfully stored in the IP analytics database.' : 
            'Your IP is being processed for storage in the analytics database.'
          }
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '20px' 
      }}>
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>
            VPN Analytics
          </h3>
          <a 
            href="/vpn-analytics" 
            style={{ 
              color: '#667eea', 
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '1.1em'
            }}
          >
            View VPN Data →
          </a>
        </div>

        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>
            IP Analytics
          </h3>
          <a 
            href="/ip-analytics" 
            style={{ 
              color: '#667eea', 
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '1.1em'
            }}
          >
            View IP Data →
          </a>
        </div>
      </div>

      <div style={{ 
        marginTop: '40px', 
        textAlign: 'center',
        color: '#999',
        fontSize: '0.9em'
      }}>
        <button 
          onClick={() => window.location.reload()} 
          style={{ 
            background: '#667eea', 
            color: 'white', 
            border: 'none', 
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '1em'
          }}
        >
          Refresh IP Information
        </button>
      </div>
    </div>
  );
}
