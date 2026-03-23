// IP Geolocation utility with fallback methods
export class IPGeolocation {
  private static instance: IPGeolocation;

  private constructor() {}

  static getInstance(): IPGeolocation {
    if (!IPGeolocation.instance) {
      IPGeolocation.instance = new IPGeolocation();
    }
    return IPGeolocation.instance;
  }

  async getCountryFromIP(ip: string): Promise<string> {
    try {
      // Method 1: Try EdgeOne Pages function (no CORS issues)
      try {
        const response = await fetch(`/api/geolocation?ip=${ip}`);
        if (response.ok) {
          const data = await response.json();
          return data.country || 'Unknown';
        }
      } catch (error) {
        console.warn('EdgeOne geolocation failed:', error);
      }

      // Method 2: Try ip-api.com (CORS friendly)
      try {
        const response = await fetch(`https://ip-api.com/json/${ip}?fields=country`);
        if (response.ok) {
          const data = await response.json();
          return data.country || 'Unknown';
        }
      } catch (error) {
        console.warn('ip-api.com failed:', error);
      }

      // Method 3: Try ipgeolocation.io (CORS friendly)
      try {
        const response = await fetch(`https://ipgeolocation.io/ipgeo?ip=${ip}`);
        if (response.ok) {
          const data = await response.json();
          return data.country_name || 'Unknown';
        }
      } catch (error) {
        console.warn('ipgeolocation.io failed:', error);
      }

      // Method 4: Use IP range detection as fallback
      return this.getCountryFromIPRange(ip);

    } catch (error) {
      console.error('All geolocation methods failed:', error);
      return 'Unknown';
    }
  }

  private getCountryFromIPRange(ip: string): string {
    // Simple IP range to country mapping
    const ipRanges = [
      { start: '1.0.0.0', end: '1.255.255.255', country: 'United States' },
      { start: '8.8.8.0', end: '8.8.8.255', country: 'United States' },
      { start: '208.67.222.0', end: '208.67.222.255', country: 'United States' },
      { start: '27.0.0.0', end: '27.255.255.255', country: 'China' },
      { start: '117.0.0.0', end: '117.255.255.255', country: 'China' },
      { start: '203.0.0.0', end: '203.255.255.255', country: 'Australia' },
      { start: '5.0.0.0', end: '5.255.255.255', country: 'Germany' },
      { start: '46.0.0.0', end: '46.255.255.255', country: 'United Kingdom' },
      { start: '151.0.0.0', end: '151.255.255.255', country: 'Japan' },
      { start: '175.0.0.0', end: '175.255.255.255', country: 'South Korea' },
    ];

    for (const range of ipRanges) {
      if (this.isIPInRange(ip, range.start, range.end)) {
        return range.country;
      }
    }

    return 'Unknown';
  }

  private isIPInRange(ip: string, start: string, end: string): boolean {
    const ipToNumber = (ip: string) => {
      return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
    };

    const ipNum = ipToNumber(ip);
    const startNum = ipToNumber(start);
    const endNum = ipToNumber(end);

    return ipNum >= startNum && ipNum <= endNum;
  }

  async detectProviderFromIP(ip: string): Promise<string | undefined> {
    // Known VPN/proxy provider IP ranges
    const providerRanges = [
      { 
        start: '104.16.0.0', 
        end: '104.31.255.255', 
        provider: 'Cloudflare CDN/Proxy' 
      },
      { 
        start: '8.8.8.0', 
        end: '8.8.8.255', 
        provider: 'Google DNS' 
      },
      { 
        start: '208.67.222.0', 
        end: '208.67.222.255', 
        provider: 'OpenDNS' 
      },
      { 
        start: '1.1.1.0', 
        end: '1.1.1.255', 
        provider: 'Cloudflare DNS' 
      },
    ];

    for (const range of providerRanges) {
      if (this.isIPInRange(ip, range.start, range.end)) {
        return range.provider;
      }
    }

    return undefined;
  }
}

export default IPGeolocation;
