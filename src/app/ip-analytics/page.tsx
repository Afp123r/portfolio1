'use client';

import { useEffect, useState } from 'react';
import IPTracker from '../../utils/ipTracker';

interface IPAnalytics {
  total: number;
  uniqueIPs: number;
  topCountries: Array<{ country: string; count: number }>;
  vpnIPs: number;
  regularIPs: number;
}

export default function IPAnalytics() {
  const [analytics, setAnalytics] = useState<IPAnalytics | null>(null);
  const [uniqueIPs, setUniqueIPs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const ipTracker = IPTracker.getInstance();
        
        // Get IP analytics from EdgeOne KV
        const analyticsData = await ipTracker.getIPAnalytics();
        setAnalytics(analyticsData);

        // Get unique IPs
        const uniqueIPsData = await ipTracker.getUniqueIPs();
        setUniqueIPs(uniqueIPsData);

      } catch (err) {
        setError('Failed to load IP analytics');
        console.error('IP Analytics loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
    
    // Refresh analytics every 30 seconds
    const interval = setInterval(loadAnalytics, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading IP Analytics...
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
        color: 'red'
      }}>
        Error: {error}
      </div>
    );
  }

  const vpnIPPercentage = analytics?.total ? ((analytics.vpnIPs / analytics.total) * 100).toFixed(1) : '0';

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px', color: '#333' }}>
        IP Address Analytics
      </h1>

      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px', 
        marginBottom: '40px' 
      }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Total IP Records</h3>
          <p style={{ fontSize: '36px', margin: '0', fontWeight: 'bold' }}>
            {analytics?.total || 0}
          </p>
        </div>

        <div style={{ 
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Unique IPs</h3>
          <p style={{ fontSize: '36px', margin: '0', fontWeight: 'bold' }}>
            {analytics?.uniqueIPs || 0}
          </p>
        </div>

        <div style={{ 
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>VPN IPs</h3>
          <p style={{ fontSize: '36px', margin: '0', fontWeight: 'bold' }}>
            {analytics?.vpnIPs || 0}
          </p>
        </div>

        <div style={{ 
          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>VPN IP Rate</h3>
          <p style={{ fontSize: '36px', margin: '0', fontWeight: 'bold' }}>
            {vpnIPPercentage}%
          </p>
        </div>
      </div>

      {/* Top Countries and Unique IPs */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '20px', 
        marginBottom: '40px' 
      }}>
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Top Countries</h3>
          {analytics?.topCountries && analytics.topCountries.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
              {analytics.topCountries.map((country, index) => (
                <li key={index} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '10px 0',
                  borderBottom: '1px solid #eee'
                }}>
                  <span>{country.country}</span>
                  <span style={{ fontWeight: 'bold', color: '#667eea' }}>
                    {country.count}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#666', textAlign: 'center' }}>No country data available</p>
          )}
        </div>

        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Recent Unique IPs</h3>
          {uniqueIPs.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: '0', margin: '0', maxHeight: '300px', overflowY: 'auto' }}>
              {uniqueIPs.slice(-10).reverse().map((ip, index) => (
                <li key={index} style={{ 
                  padding: '8px 0',
                  borderBottom: '1px solid #eee',
                  fontFamily: 'monospace',
                  fontSize: '14px'
                }}>
                  {ip}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#666', textAlign: 'center' }}>No IP data available</p>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '10px',
        marginTop: '40px'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>About IP Analytics</h3>
        <p style={{ margin: '0', color: '#666', lineHeight: '1.6' }}>
          This dashboard displays IP address analytics stored in your EdgeOne KV storage. 
          The data is automatically collected when visitors access your portfolio and includes 
          information about unique visitors, geographic distribution, and VPN usage patterns.
        </p>
      </div>
    </div>
  );
}
