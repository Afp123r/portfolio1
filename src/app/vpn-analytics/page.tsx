'use client';

import { useEffect, useState } from 'react';
import VPNDetector from '../../utils/vpnDetector';

interface VPNAnalytics {
  total: number;
  vpnUsers: number;
  regularUsers: number;
  topProviders: Array<{ provider: string; count: number }>;
  topCountries: Array<{ country: string; count: number }>;
}

export default function VPNAnalytics() {
  const [analytics, setAnalytics] = useState<VPNAnalytics | null>(null);
  const [latestData, setLatestData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const vpnDetector = VPNDetector.getInstance();
        
        // Get analytics from EdgeOne KV
        const analyticsData = await vpnDetector.getVPNAnalytics();
        setAnalytics(analyticsData);

        // Get latest VPN detection data
        const latest = await vpnDetector.getLatestStoredVPNData();
        setLatestData(latest);

      } catch (err) {
        setError('Failed to load VPN analytics');
        console.error('Analytics loading error:', err);
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
        Loading VPN Analytics...
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

  const vpnPercentage = analytics?.total ? ((analytics.vpnUsers / analytics.total) * 100).toFixed(1) : '0';

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px', color: '#333' }}>
        VPN Detection Analytics
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
          <h3 style={{ margin: '0 0 10px 0' }}>Total Visitors</h3>
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
          <h3 style={{ margin: '0 0 10px 0' }}>VPN Users</h3>
          <p style={{ fontSize: '36px', margin: '0', fontWeight: 'bold' }}>
            {analytics?.vpnUsers || 0}
          </p>
        </div>

        <div style={{ 
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Regular Users</h3>
          <p style={{ fontSize: '36px', margin: '0', fontWeight: 'bold' }}>
            {analytics?.regularUsers || 0}
          </p>
        </div>

        <div style={{ 
          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>VPN Usage</h3>
          <p style={{ fontSize: '36px', margin: '0', fontWeight: 'bold' }}>
            {vpnPercentage}%
          </p>
        </div>
      </div>

      {/* Top Providers and Countries */}
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
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Top VPN Providers</h3>
          {analytics?.topProviders && analytics.topProviders.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
              {analytics.topProviders.map((provider, index) => (
                <li key={index} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '10px 0',
                  borderBottom: '1px solid #eee'
                }}>
                  <span>{provider.provider}</span>
                  <span style={{ fontWeight: 'bold', color: '#667eea' }}>
                    {provider.count}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#666', textAlign: 'center' }}>No VPN data available</p>
          )}
        </div>

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
      </div>

      {/* Latest Detection */}
      {latestData && (
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Latest Detection</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div>
              <strong>VPN Status:</strong> 
              <span style={{ 
                marginLeft: '10px',
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: latestData.isVPN ? '#ff6b6b' : '#51cf66',
                color: 'white'
              }}>
                {latestData.isVPN ? 'Detected' : 'Not Detected'}
              </span>
            </div>
            <div><strong>IP:</strong> {latestData.ip || 'Unknown'}</div>
            <div><strong>Provider:</strong> {latestData.provider || 'Unknown'}</div>
            <div><strong>Country:</strong> {latestData.country || 'Unknown'}</div>
            <div><strong>Time:</strong> {new Date(latestData.timestamp).toLocaleString()}</div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '10px',
        marginTop: '40px'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>About This Dashboard</h3>
        <p style={{ margin: '0', color: '#666', lineHeight: '1.6' }}>
          This dashboard displays VPN detection analytics stored in your EdgeOne KV storage. 
          The data is automatically collected when visitors access your portfolio and includes 
          information about VPN usage, providers, and geographic distribution.
        </p>
      </div>
    </div>
  );
}
