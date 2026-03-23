// VPN Detection Utility for Static HTML with EdgeOne KV Integration
class VPNDetector {
  constructor() {
    this.vpnInfo = null;
    this.checkInterval = null;
    this.CHECK_INTERVAL_MS = 5 * 60 * 1000; // Check every 5 minutes
    this.vpnDatabase = {
      '1.1.1.1': { name: 'Cloudflare', type: 'proxy' },
      '8.8.8.8': { name: 'Google DNS', type: 'proxy' },
      '208.67.222.222': { name: 'OpenDNS', type: 'proxy' },
    };
    this.KV_NAMESPACE = 'vpn';
    this.KV_NAMESPACE_ID = 'ns-QrCNnpxdZcmU';
  }

  static getInstance() {
    if (!window.vpnDetectorInstance) {
      window.vpnDetectorInstance = new VPNDetector();
    }
    return window.vpnDetectorInstance;
  }

  async checkVPN() {
    try {
      const webrtcIPs = await this.getWebRTCIPs();
      const publicIP = await this.getPublicIP();
      const dnsInfo = await this.checkDNSLeak();
      const fingerprintIssues = await this.checkFingerprint();
      const connectionInfo = await this.checkConnectionBehavior();

      const vpnScore = this.calculateVPNScore({
        webrtcIPs,
        publicIP,
        dnsInfo,
        fingerprintIssues,
        connectionInfo
      });

      const isVPN = vpnScore > 0.6;

      this.vpnInfo = {
        isVPN,
        ip: publicIP,
        country: await this.getCountryFromIP(publicIP),
        provider: await this.detectProvider(publicIP, webrtcIPs),
        lastChecked: new Date()
      };

      localStorage.setItem('vpnInfo', JSON.stringify(this.vpnInfo));
      
      // Store in EdgeOne KV
      await this.storeVPNDataToKV({
        isVPN,
        ip: publicIP,
        country: this.vpnInfo.country,
        provider: this.vpnInfo.provider
      });
      
      return this.vpnInfo;
    } catch (error) {
      console.error('VPN detection failed:', error);
      return {
        isVPN: false,
        lastChecked: new Date()
      };
    }
  }

  async getWebRTCIPs() {
    return new Promise((resolve) => {
      const ips = [];
      
      try {
        const rtc = new RTCPeerConnection({ iceServers: [] });
        rtc.createDataChannel('', {});
        
        rtc.onicecandidate = (event) => {
          if (event.candidate && event.candidate.candidate) {
            const candidate = event.candidate.candidate;
            const match = candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
            if (match) {
              const ip = match[1];
              if (!ips.includes(ip) && !this.isPrivateIP(ip)) {
                ips.push(ip);
              }
            }
          }
          
          if (rtc.iceGatheringState === 'complete') {
            rtc.close();
            resolve(ips);
          }
        };
        
        rtc.createOffer().then((offer) => rtc.setLocalDescription(offer));
        
        setTimeout(() => {
          rtc.close();
          resolve(ips);
        }, 5000);
      } catch (error) {
        resolve(ips);
      }
    });
  }

  async getPublicIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      try {
        const response = await fetch('https://api.ip.sb/ip');
        return await response.text();
      } catch {
        return 'unknown';
      }
    }
  }

  async checkDNSLeak() {
    const servers = [];
    
    try {
      const testDomains = ['google.com', 'cloudflare.com'];
      
      for (const domain of testDomains) {
        try {
          const response = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
          const data = await response.json();
          
          if (data.Answer) {
            data.Answer.forEach((answer) => {
              if (answer.data && !servers.includes(answer.data)) {
                servers.push(answer.data);
              }
            });
          }
        } catch {
          // Continue with other tests
        }
      }
      
      return {
        leaking: servers.length > 2,
        servers
      };
    } catch {
      return { leaking: false, servers: [] };
    }
  }

  async checkFingerprint() {
    const inconsistencies = [];
    
    try {
      const userAgent = navigator.userAgent;
      const vpnIndicators = ['VPN', 'Proxy', 'Tor', 'Opera'];
      
      if (vpnIndicators.some(indicator => userAgent.toLowerCase().includes(indicator.toLowerCase()))) {
        inconsistencies.push('user_agent');
      }
      
      const screenRes = `${screen.width}x${screen.height}`;
      const commonResolutions = ['1920x1080', '1366x768', '1440x900', '1280x720'];
      
      if (!commonResolutions.includes(screenRes)) {
        inconsistencies.push('screen_resolution');
      }
      
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const language = navigator.language;
      
      if (this.getTimezoneRegion(timezone) !== this.getLanguageRegion(language)) {
        inconsistencies.push('timezone_language_mismatch');
      }
      
      return { inconsistencies: inconsistencies.length };
    } catch {
      return { inconsistencies: 0 };
    }
  }

  async checkConnectionBehavior() {
    const metrics = {
      connectionType: navigator.connection?.effectiveType || 'unknown',
      downlink: navigator.connection?.downlink || 0,
      rtt: navigator.connection?.rtt || 0
    };
    
    const suspicious = 
      metrics.connectionType === 'slow-2g' && metrics.rtt > 1000 ||
      metrics.downlink === 0;
    
    return { suspicious, metrics };
  }

  calculateVPNScore(data) {
    let score = 0;
    
    if (data.webrtcIPs.length > 1) {
      score += 0.3;
    }
    
    if (data.dnsInfo.leaking) {
      score += 0.2;
    }
    
    score += Math.min(data.fingerprintIssues.inconsistencies * 0.1, 0.2);
    
    if (data.connectionInfo.suspicious) {
      score += 0.15;
    }
    
    if (this.vpnDatabase[data.publicIP]) {
      score += 0.15;
    }
    
    return Math.min(score, 1);
  }

  isPrivateIP(ip) {
    const privateRanges = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^127\./,
      /^169\.254\./,
      /^::1$/,
      /^fc00:/,
      /^fe80:/
    ];
    
    return privateRanges.some(range => range.test(ip));
  }

  getTimezoneRegion(timezone) {
    const regionMap = {
      'America': 'US',
      'Europe': 'EU',
      'Asia': 'AS',
      'Africa': 'AF',
      'Australia': 'AU'
    };
    
    for (const [region, code] of Object.entries(regionMap)) {
      if (timezone.startsWith(region)) {
        return code;
      }
    }
    
    return 'Unknown';
  }

  getLanguageRegion(language) {
    const regionMap = {
      'en': 'US',
      'es': 'US',
      'fr': 'EU',
      'de': 'EU',
      'it': 'EU',
      'pt': 'EU',
      'ru': 'EU',
      'ja': 'AS',
      'ko': 'AS',
      'zh': 'AS'
    };
    
    const langCode = language.split('-')[0];
    return regionMap[langCode] || 'Unknown';
  }

  async getCountryFromIP(ip) {
    try {
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      const data = await response.json();
      return data.country_name || 'Unknown';
    } catch {
      return 'Unknown';
    }
  }

  async detectProvider(publicIP, webrtcIPs) {
    if (this.vpnDatabase[publicIP]) {
      return this.vpnDatabase[publicIP].name;
    }
    
    try {
      const response = await fetch(`https://ipapi.co/${publicIP}/json/`);
      const data = await response.json();
      
      const org = data.org || '';
      const vpnKeywords = ['vpn', 'proxy', 'hosting', 'data center', 'cloud'];
      
      if (vpnKeywords.some(keyword => org.toLowerCase().includes(keyword))) {
        return org;
      }
    } catch {
      // Continue with other detection methods
    }
    
    return undefined;
  }

  startBackgroundChecking() {
    this.checkVPN();
    
    this.checkInterval = setInterval(() => {
      this.checkVPN();
    }, this.CHECK_INTERVAL_MS);
  }

  stopBackgroundChecking() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  getVPNInfo() {
    const stored = localStorage.getItem('vpnInfo');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        localStorage.removeItem('vpnInfo');
      }
    }
    
    return this.vpnInfo;
  }

  isVPNActive() {
    const info = this.getVPNInfo();
    return info?.isVPN || false;
  }

  // EdgeOne KV Storage Methods
  async storeVPNDataToKV(vpnData) {
    try {
      const storageData = {
        id: this.generateId(),
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: this.getSessionId(),
        ...vpnData
      };

      // Store in EdgeOne KV via API
      const success = await this.setToKV(storageData.id, storageData);
      
      if (success) {
        // Also store latest record for quick access
        await this.setToKV('latest', storageData);
        
        // Store in analytics collection
        await this.addToAnalytics(storageData);
      }

      return success;
    } catch (error) {
      console.error('Failed to store VPN data to EdgeOne KV:', error);
      return false;
    }
  }

  async setToKV(key, value) {
    try {
      const response = await fetch('/api/kv/store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          namespace: this.KV_NAMESPACE,
          namespaceId: this.KV_NAMESPACE_ID,
          key,
          value
        })
      });

      return response.ok;
    } catch (error) {
      console.error('KV storage error:', error);
      return false;
    }
  }

  async getFromKV(key) {
    try {
      const response = await fetch(`/api/kv/get?namespace=${this.KV_NAMESPACE}&namespaceId=${this.KV_NAMESPACE_ID}&key=${key}`);
      
      if (response.ok) {
        const data = await response.json();
        return data.value;
      }
      
      return null;
    } catch (error) {
      console.error('KV retrieval error:', error);
      return null;
    }
  }

  async addToAnalytics(data) {
    try {
      const currentAnalytics = await this.getVPNAnalytics();
      
      // Update analytics
      currentAnalytics.total++;
      
      if (data.isVPN) {
        currentAnalytics.vpnUsers++;
        
        // Update provider stats
        if (data.provider) {
          const providerIndex = currentAnalytics.topProviders.findIndex(p => p.provider === data.provider);
          if (providerIndex >= 0) {
            currentAnalytics.topProviders[providerIndex].count++;
          } else {
            currentAnalytics.topProviders.push({ provider: data.provider, count: 1 });
          }
        }
        
        // Update country stats
        if (data.country) {
          const countryIndex = currentAnalytics.topCountries.findIndex(c => c.country === data.country);
          if (countryIndex >= 0) {
            currentAnalytics.topCountries[countryIndex].count++;
          } else {
            currentAnalytics.topCountries.push({ country: data.country, count: 1 });
          }
        }
      } else {
        currentAnalytics.regularUsers++;
      }

      // Sort and limit top lists
      currentAnalytics.topProviders.sort((a, b) => b.count - a.count).slice(0, 10);
      currentAnalytics.topCountries.sort((a, b) => b.count - a.count).slice(0, 10);

      // Store updated analytics
      await this.setToKV('analytics', currentAnalytics);
    } catch (error) {
      console.error('Failed to update analytics:', error);
    }
  }

  async getVPNAnalytics() {
    try {
      const analytics = await this.getFromKV('analytics');
      return analytics || {
        total: 0,
        vpnUsers: 0,
        regularUsers: 0,
        topProviders: [],
        topCountries: []
      };
    } catch (error) {
      console.error('Failed to get VPN analytics from EdgeOne KV:', error);
      return {
        total: 0,
        vpnUsers: 0,
        regularUsers: 0,
        topProviders: [],
        topCountries: []
      };
    }
  }

  generateId() {
    return `vpn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getSessionId() {
    let sessionId = sessionStorage.getItem('vpn_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('vpn_session_id', sessionId);
    }
    return sessionId;
  }
}

// Initialize VPN detection when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const vpnDetector = VPNDetector.getInstance();
  
  // Start background VPN checking
  vpnDetector.startBackgroundChecking();
  
  // Check VPN status periodically
  const checkVPNStatus = () => {
    const vpnInfo = vpnDetector.getVPNInfo();
    if (vpnInfo?.isVPN) {
      console.log('VPN detected:', {
        provider: vpnInfo.provider,
        country: vpnInfo.country,
        ip: vpnInfo.ip,
        lastChecked: vpnInfo.lastChecked
      });
      
      // You can add custom logic here for VPN users
      // For example: show a warning, modify content, etc.
      handleVPNDetection(vpnInfo);
    }
  };
  
  // Check VPN status every 30 seconds
  const vpnCheckInterval = setInterval(checkVPNStatus, 30000);
  
  // Initial VPN check
  checkVPNStatus();
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', function() {
    vpnDetector.stopBackgroundChecking();
    clearInterval(vpnCheckInterval);
  });
});

// Handle VPN detection (customize this function as needed)
function handleVPNDetection(vpnInfo) {
  // Example: Add a warning banner
  if (!document.getElementById('vpn-warning')) {
    const warning = document.createElement('div');
    warning.id = 'vpn-warning';
    warning.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #ff6b6b;
      color: white;
      text-align: center;
      padding: 10px;
      z-index: 9999;
      font-family: Arial, sans-serif;
      font-size: 14px;
    `;
    warning.innerHTML = `
      ⚠️ VPN/Proxy Detected: ${vpnInfo.provider || 'Unknown'} (${vpnInfo.country || 'Unknown'})
      <button onclick="this.parentElement.style.display='none'" style="
        margin-left: 10px;
        background: white;
        color: #ff6b6b;
        border: none;
        padding: 2px 8px;
        border-radius: 3px;
        cursor: pointer;
      ">×</button>
    `;
    document.body.insertBefore(warning, document.body.firstChild);
  }
  
  // Example: Log to analytics (replace with your analytics code)
  if (typeof gtag !== 'undefined') {
    gtag('event', 'vpn_detected', {
      'provider': vpnInfo.provider || 'unknown',
      'country': vpnInfo.country || 'unknown'
    });
  }
}
