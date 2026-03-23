'use client';

import { useEffect, useState } from 'react';
import VPNDetector from '../../utils/vpnDetector';

interface IPAnalytics {
  total: number;
  uniqueIPs: number;
  vpnIPs: number;
  regularIPs: number;
  topCountries: Array<{ country: string; count: number }>;
  topCities: Array<{ city: string; count: number }>;
  recentIPs: Array<{ ip: string; timestamp: string; isVPN: boolean }>;
}

export default function IPAnalytics() {
  const [analytics, setAnalytics] = useState<IPAnalytics | null>(null);
  const [latestData, setLatestData] = useState<any>(null);
  const [ipHistory, setIPHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const vpnDetector = VPNDetector.getInstance();
        
        // Get IP analytics from EdgeOne KV
        const analyticsData = await vpnDetector.getIPAnalytics();
        setAnalytics(analyticsData);

        // Get latest IP record
        const latest = await vpnDetector.getLatestIPRecord();
        setLatestData(latest);

        // Get IP history
        const history = await vpnDetector.getIPHistory(20);
        setIPHistory(history);

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

  const vpnPercentage = analytics?.total ? ((analytics.vpnIPs / analytics.total) * 100).toFixed(1) : '0';

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
          <h3 style={{ margin: '0 0 10px 0' }}>Regular IPs</h3>
          <p style={{ fontSize: '36px', margin: '0', fontWeight: 'bold' }}>
            {analytics?.regularIPs || 0}
          </p>
        </div>
      </div>

      {/* Top Countries and Cities */}
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
          {analytics?.topCountries?.length > 0 ? (
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
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Top Cities</h3>
          {analytics?.topCities?.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
              {analytics.topCities.map((city, index) => (
                <li key={index} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '10px 0',
                  borderBottom: '1px solid #eee'
                }}>
                  <span>{city.city}</span>
                  <span style={{ fontWeight: 'bold', color: '#667eea' }}>
                    {city.count}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#666', textAlign: 'center' }}>No city data available</p>
          )}
        </div>
      </div>

      {/* Latest IP Record */}
      {latestData && (
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '40px'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Latest IP Record</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div>
              <strong>IP Address:</strong> {latestData.ip || 'Unknown'}
            </div>
            <div>
              <strong>VPN Status:</strong> 
              <span style={{ 
                marginLeft: '10px',
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: latestData.isVPN ? '#ff6b6b' : '#51cf66',
                color: 'white'
              }}>
                {latestData.isVPN ? 'VPN' : 'Regular'}
              </span>
            </div>
            <div><strong>Provider:</strong> {latestData.provider || 'Unknown'}</div>
            <div><strong>Country:</strong> {latestData.country || 'Unknown'}</div>
            <div><strong>City:</strong> {latestData.city || 'Unknown'}</div>
            <div><strong>Time:</strong> {new Date(latestData.timestamp).toLocaleString()}</div>
          </div>
        </div>
      )}

      {/* IP History */}
      {ipHistory.length > 0 && (
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '40px'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Recent IP Activity</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>IP Address</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Type</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {ipHistory.map((record, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px' }}>{record.ip}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ 
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '12px',
                        backgroundColor: record.isVPN ? '#ff6b6b' : '#51cf66',
                        color: 'white'
                      }}>
                        {record.isVPN ? 'VPN' : 'Regular'}
                      </span>
                    </td>
                    <td style={{ padding: '10px' }}>
                      {new Date(record.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '10px'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>About IP Analytics</h3>
        <p style={{ margin: '0', color: '#666', lineHeight: '1.6' }}>
          This dashboard displays IP address analytics stored in your EdgeOne KV storage. 
          The system automatically records visitor IP addresses, detects VPN usage, and provides 
          geographic insights including countries and cities.
        </p>
      </div>
    </div>
  );
}
