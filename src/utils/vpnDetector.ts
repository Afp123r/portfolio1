import EdgeOneKVStorage from './edgeOneKV';
import IPTracker from './ipTracker';

interface VPNInfo {
  isVPN: boolean;
  provider?: string;
  country?: string;
  ip?: string;
  lastChecked: Date;
}

interface VPNDatabase {
  [key: string]: {
    name: string;
    type: 'vpn' | 'proxy' | 'tor';
    country?: string;
  };
}

const vpnDatabase: VPNDatabase = {
  // Common VPN IP ranges and providers
  '1.1.1.1': { name: 'Cloudflare', type: 'proxy' },
  '8.8.8.8': { name: 'Google DNS', type: 'proxy' },
  '208.67.222.222': { name: 'OpenDNS', type: 'proxy' },
  // Add more known VPN/proxy IPs as needed
};

export class VPNDetector {
  private static instance: VPNDetector;
  private vpnInfo: VPNInfo | null = null;
  private checkInterval: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL_MS = 5 * 60 * 1000; // Check every 5 minutes
  private kvStorage: EdgeOneKVStorage;
  private ipTracker: IPTracker;

  private constructor() {
    this.kvStorage = new EdgeOneKVStorage();
    this.ipTracker = IPTracker.getInstance();
  }

  static getInstance(): VPNDetector {
    if (!VPNDetector.instance) {
      VPNDetector.instance = new VPNDetector();
    }
    return VPNDetector.instance;
  }

  async checkVPN(): Promise<VPNInfo> {
    try {
      // Method 1: Check WebRTC IP leaks
      const webrtcIPs = await this.getWebRTCIPs();
      
      // Method 2: Check public IP
      const publicIP = await this.getPublicIP();
      
      // Method 3: Check DNS servers
      const dnsInfo = await this.checkDNSLeak();
      
      // Method 4: Check browser fingerprint inconsistencies
      const fingerprintIssues = await this.checkFingerprint();
      
      // Method 5: Check connection time and behavior
      const connectionInfo = await this.checkConnectionBehavior();
      
      // Determine if VPN is detected
      const vpnScore = this.calculateVPNScore({
        webrtcIPs,
        publicIP,
        dnsInfo,
        fingerprintIssues,
        connectionInfo
      });

      const isVPN = vpnScore > 0.6; // Threshold for VPN detection

      this.vpnInfo = {
        isVPN,
        ip: publicIP,
        country: await this.getCountryFromIP(publicIP),
        provider: await this.detectProvider(publicIP, webrtcIPs),
        lastChecked: new Date()
      };

      // Store in localStorage for persistence
      localStorage.setItem('vpnInfo', JSON.stringify(this.vpnInfo));

      // Store in EdgeOne KV
      await this.kvStorage.storeVPNData({
        isVPN,
        ip: publicIP,
        country: this.vpnInfo.country,
        provider: this.vpnInfo.provider
      });

      // Record IP address in IP tracking
      const ipLocation = await this.ipTracker.getIPLocation(publicIP);
      await this.ipTracker.recordIP({
        ip: publicIP,
        isVPN,
        provider: this.vpnInfo.provider,
        country: this.vpnInfo.country,
        city: ipLocation.city
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

  private async getWebRTCIPs(): Promise<string[]> {
    return new Promise((resolve) => {
      const ips: string[] = [];
      
      // Create RTCPeerConnection to get local IPs
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
      
      // Timeout after 5 seconds
      setTimeout(() => {
        rtc.close();
        resolve(ips);
      }, 5000);
    });
  }

  private async getPublicIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      try {
        // Fallback to another service
        const response = await fetch('https://api.ip.sb/ip');
        return await response.text();
      } catch {
        return 'unknown';
      }
    }
  }

  private async checkDNSLeak(): Promise<{ leaking: boolean; servers: string[] }> {
    const servers: string[] = [];
    
    try {
      // Check for common DNS servers that might indicate VPN/proxy
      const testDomains = ['google.com', 'cloudflare.com', 'openDNS.com'];
      
      for (const domain of testDomains) {
        try {
          const response = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
          const data = await response.json();
          
          if (data.Answer) {
            data.Answer.forEach((answer: any) => {
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
        leaking: servers.length > 2, // More than 2 DNS servers might indicate leak
        servers
      };
    } catch {
      return { leaking: false, servers: [] };
    }
  }

  private async checkFingerprint(): Promise<{ inconsistencies: number }> {
    const inconsistencies = [];
    
    try {
      // Check for common VPN/proxy indicators in user agent
      const userAgent = navigator.userAgent;
      const vpnIndicators = ['VPN', 'Proxy', 'Tor', 'Opera'];
      
      if (vpnIndicators.some(indicator => userAgent.toLowerCase().includes(indicator.toLowerCase()))) {
        inconsistencies.push('user_agent');
      }
      
      // Check screen resolution (some VPNs affect this)
      const screenRes = `${screen.width}x${screen.height}`;
      const commonResolutions = ['1920x1080', '1366x768', '1440x900', '1280x720'];
      
      if (!commonResolutions.includes(screenRes)) {
        inconsistencies.push('screen_resolution');
      }
      
      // Check timezone inconsistencies
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const language = navigator.language;
      
      // Mismatch between timezone and language might indicate VPN
      if (this.getTimezoneRegion(timezone) !== this.getLanguageRegion(language)) {
        inconsistencies.push('timezone_language_mismatch');
      }
      
      return { inconsistencies: inconsistencies.length };
    } catch {
      return { inconsistencies: 0 };
    }
  }

  private async checkConnectionBehavior(): Promise<{ suspicious: boolean; metrics: any }> {
    const metrics = {
      connectionType: (navigator as any).connection?.effectiveType || 'unknown',
      downlink: (navigator as any).connection?.downlink || 0,
      rtt: (navigator as any).connection?.rtt || 0
    };
    
    // Check for suspicious connection patterns
    const suspicious = 
      metrics.connectionType === 'slow-2g' && metrics.rtt > 1000 || // Very slow with high latency
      metrics.downlink === 0; // No downlink info might indicate VPN
    
    return { suspicious, metrics };
  }

  private calculateVPNScore(data: {
    webrtcIPs: string[];
    publicIP: string;
    dnsInfo: { leaking: boolean; servers: string[] };
    fingerprintIssues: { inconsistencies: number };
    connectionInfo: { suspicious: boolean; metrics: any };
  }): number {
    let score = 0;
    
    // WebRTC IP leak detection (0.3 weight)
    if (data.webrtcIPs.length > 1) {
      score += 0.3;
    }
    
    // DNS leak detection (0.2 weight)
    if (data.dnsInfo.leaking) {
      score += 0.2;
    }
    
    // Fingerprint inconsistencies (0.2 weight)
    score += Math.min(data.fingerprintIssues.inconsistencies * 0.1, 0.2);
    
    // Connection behavior (0.15 weight)
    if (data.connectionInfo.suspicious) {
      score += 0.15;
    }
    
    // Known VPN/proxy IP check (0.15 weight)
    if (vpnDatabase[data.publicIP]) {
      score += 0.15;
    }
    
    return Math.min(score, 1);
  }

  private isPrivateIP(ip: string): boolean {
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

  private getTimezoneRegion(timezone: string): string {
    const regionMap: { [key: string]: string } = {
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

  private getLanguageRegion(language: string): string {
    const regionMap: { [key: string]: string } = {
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

  private async getCountryFromIP(ip: string): Promise<string> {
    try {
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      const data = await response.json();
      return data.country_name || 'Unknown';
    } catch {
      return 'Unknown';
    }
  }

  private async detectProvider(publicIP: string, webrtcIPs: string[]): Promise<string | undefined> {
    // Check if IP matches known VPN database
    if (vpnDatabase[publicIP]) {
      return vpnDatabase[publicIP].name;
    }
    
    // Try to identify provider from IP ranges
    try {
      const response = await fetch(`https://ipapi.co/${publicIP}/json/`);
      const data = await response.json();
      
      // Check if the organization suggests VPN/proxy
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

  startBackgroundChecking(): void {
    // Initial check
    this.checkVPN();
    
    // Set up periodic checking
    this.checkInterval = setInterval(() => {
      this.checkVPN();
    }, this.CHECK_INTERVAL_MS);
  }

  stopBackgroundChecking(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  getVPNInfo(): VPNInfo | null {
    // Try to get from localStorage first
    const stored = localStorage.getItem('vpnInfo');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // Invalid stored data, remove it
        localStorage.removeItem('vpnInfo');
      }
    }
    
    return this.vpnInfo;
  }

  isVPNActive(): boolean {
    const info = this.getVPNInfo();
    return info?.isVPN || false;
  }

  async getVPNAnalytics(): Promise<{
    total: number;
    vpnUsers: number;
    regularUsers: number;
    topProviders: Array<{ provider: string; count: number }>;
    topCountries: Array<{ country: string; count: number }>;
  }> {
    return await this.kvStorage.getVPNAnalytics();
  }

  async getLatestStoredVPNData(): Promise<any> {
    return await this.kvStorage.getLatestVPNData();
  }

  async getIPAnalytics(): Promise<{
    total: number;
    uniqueIPs: number;
    vpnIPs: number;
    regularIPs: number;
    topCountries: Array<{ country: string; count: number }>;
    topCities: Array<{ city: string; count: number }>;
    recentIPs: Array<{ ip: string; timestamp: string; isVPN: boolean }>;
  }> {
    return await this.ipTracker.getIPAnalytics();
  }

  async getLatestIPRecord(): Promise<any> {
    return await this.ipTracker.getLatestIPRecord();
  }

  async getIPHistory(limit: number = 50): Promise<any[]> {
    return await this.ipTracker.getIPHistory(limit);
  }
}

export default VPNDetector;
