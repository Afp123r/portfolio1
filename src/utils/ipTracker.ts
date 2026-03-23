interface IPRecord {
  id: string;
  timestamp: string;
  ip: string;
  userAgent: string;
  sessionId: string;
  isVPN?: boolean;
  country?: string;
  provider?: string;
}

interface IPAnalytics {
  total: number;
  uniqueIPs: number;
  topCountries: Array<{ country: string; count: number }>;
  vpnIPs: number;
  regularIPs: number;
}

export class IPTracker {
  private static instance: IPTracker;
  private readonly IP_NAMESPACE = 'ip';
  private readonly IP_NAMESPACE_ID = 'ns-AGEYyEqBnK6N';
  private readonly IP_BINDING = 'ip';

  private constructor() {}

  static getInstance(): IPTracker {
    if (!IPTracker.instance) {
      IPTracker.instance = new IPTracker();
    }
    return IPTracker.instance;
  }

  async recordIPAddress(ipData: {
    ip: string;
    isVPN?: boolean;
    country?: string;
    provider?: string;
  }): Promise<boolean> {
    try {
      const record: IPRecord = {
        id: this.generateId(),
        timestamp: new Date().toISOString(),
        ip: ipData.ip,
        userAgent: navigator.userAgent,
        sessionId: this.getSessionId(),
        isVPN: ipData.isVPN,
        country: ipData.country,
        provider: ipData.provider
      };

      // Store in EdgeOne KV
      const success = await this.setToKV(record.ip, record);
      
      if (success) {
        // Also store in analytics
        await this.updateAnalytics(record);
        
        // Store unique IP list
        await this.addToUniqueIPs(record.ip);
      }

      return success;
    } catch (error) {
      console.error('Failed to record IP address:', error);
      return false;
    }
  }

  async getIPRecord(ip: string): Promise<IPRecord | null> {
    try {
      return await this.getFromKV(ip);
    } catch (error) {
      console.error('Failed to get IP record:', error);
      return null;
    }
  }

  async getIPAnalytics(): Promise<IPAnalytics> {
    try {
      const analytics = await this.getFromKV('analytics');
      return analytics || {
        total: 0,
        uniqueIPs: 0,
        topCountries: [],
        vpnIPs: 0,
        regularIPs: 0
      };
    } catch (error) {
      console.error('Failed to get IP analytics:', error);
      return {
        total: 0,
        uniqueIPs: 0,
        topCountries: [],
        vpnIPs: 0,
        regularIPs: 0
      };
    }
  }

  async getUniqueIPs(): Promise<string[]> {
    try {
      const uniqueIPs = await this.getFromKV('unique_ips');
      return uniqueIPs || [];
    } catch (error) {
      console.error('Failed to get unique IPs:', error);
      return [];
    }
  }

  private async setToKV(key: string, value: any): Promise<boolean> {
    try {
      // Try EdgeOne Pages KV binding first
      const ipKV = (globalThis as any).ip;
      
      if (ipKV) {
        await ipKV.put(key, JSON.stringify(value));
        return true;
      }

      // Fallback to API call
      const response = await fetch('/api/ip/store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          namespace: this.IP_NAMESPACE,
          namespaceId: this.IP_NAMESPACE_ID,
          key,
          value
        })
      });

      return response.ok;
    } catch (error) {
      console.error('IP KV storage error:', error);
      return false;
    }
  }

  private async getFromKV(key: string): Promise<any> {
    try {
      // Try EdgeOne Pages KV binding first
      const ipKV = (globalThis as any).ip;
      
      if (ipKV) {
        const value = await ipKV.get(key);
        return value ? JSON.parse(value) : null;
      }

      // Fallback to API call
      const response = await fetch(`/api/ip/get?namespace=${this.IP_NAMESPACE}&namespaceId=${this.IP_NAMESPACE_ID}&key=${key}`);
      
      if (response.ok) {
        const data = await response.json();
        return data.value;
      }
      
      return null;
    } catch (error) {
      console.error('IP KV retrieval error:', error);
      return null;
    }
  }

  private async updateAnalytics(record: IPRecord): Promise<void> {
    try {
      const currentAnalytics = await this.getIPAnalytics();
      
      // Update analytics
      currentAnalytics.total++;
      
      if (record.isVPN) {
        currentAnalytics.vpnIPs++;
      } else {
        currentAnalytics.regularIPs++;
      }
      
      // Update country stats
      if (record.country) {
        const countryIndex = currentAnalytics.topCountries.findIndex(c => c.country === record.country);
        if (countryIndex >= 0) {
          currentAnalytics.topCountries[countryIndex].count++;
        } else {
          currentAnalytics.topCountries.push({ country: record.country, count: 1 });
        }
      }
      
      // Sort and limit top countries
      currentAnalytics.topCountries.sort((a, b) => b.count - a.count).slice(0, 10);

      // Store updated analytics
      await this.setToKV('analytics', currentAnalytics);
    } catch (error) {
      console.error('Failed to update IP analytics:', error);
    }
  }

  private async addToUniqueIPs(ip: string): Promise<void> {
    try {
      const uniqueIPs = await this.getUniqueIPs();
      
      if (!uniqueIPs.includes(ip)) {
        uniqueIPs.push(ip);
        await this.setToKV('unique_ips', uniqueIPs);
        
        // Update unique count
        const analytics = await this.getIPAnalytics();
        analytics.uniqueIPs = uniqueIPs.length;
        await this.setToKV('analytics', analytics);
      }
    } catch (error) {
      console.error('Failed to add to unique IPs:', error);
    }
  }

  private generateId(): string {
    return `ip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('ip_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('ip_session_id', sessionId);
    }
    return sessionId;
  }
}

export default IPTracker;
