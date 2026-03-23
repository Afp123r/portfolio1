interface IPRecord {
  id: string;
  timestamp: string;
  ip: string;
  userAgent: string;
  sessionId: string;
  isVPN: boolean;
  country?: string;
  city?: string;
  provider?: string;
}

interface IPAnalytics {
  total: number;
  uniqueIPs: number;
  vpnIPs: number;
  regularIPs: number;
  topCountries: Array<{ country: string; count: number }>;
  topCities: Array<{ city: string; count: number }>;
  recentIPs: Array<{ ip: string; timestamp: string; isVPN: boolean }>;
}

export class IPTracker {
  private static instance: IPTracker;
  private readonly KV_NAMESPACE = 'ip';
  private readonly KV_NAMESPACE_ID = 'ns-AGEYyEqBnK6N';

  private constructor() {}

  static getInstance(): IPTracker {
    if (!IPTracker.instance) {
      IPTracker.instance = new IPTracker();
    }
    return IPTracker.instance;
  }

  async recordIP(ipData: {
    ip: string;
    isVPN: boolean;
    provider?: string;
    country?: string;
    city?: string;
  }): Promise<boolean> {
    try {
      const record: IPRecord = {
        id: this.generateId(),
        timestamp: new Date().toISOString(),
        ip: ipData.ip,
        userAgent: navigator.userAgent,
        sessionId: this.getSessionId(),
        isVPN: ipData.isVPN,
        provider: ipData.provider,
        country: ipData.country,
        city: ipData.city
      };

      // Store individual IP record
      await this.setToKV(record.id, record);
      
      // Store latest IP for quick access
      await this.setToKV('latest', record);
      
      // Update analytics
      await this.updateAnalytics(record);
      
      // Store in IP history (keep last 100)
      await this.addToIPHistory(record);

      console.log('IP Record stored:', {
        ip: record.ip,
        isVPN: record.isVPN,
        country: record.country,
        timestamp: record.timestamp
      });

      return true;
    } catch (error) {
      console.error('Failed to record IP:', error);
      return false;
    }
  }

  async getIPAnalytics(): Promise<IPAnalytics> {
    try {
      const analytics = await this.getFromKV('analytics');
      return analytics || {
        total: 0,
        uniqueIPs: 0,
        vpnIPs: 0,
        regularIPs: 0,
        topCountries: [],
        topCities: [],
        recentIPs: []
      };
    } catch (error) {
      console.error('Failed to get IP analytics:', error);
      return {
        total: 0,
        uniqueIPs: 0,
        vpnIPs: 0,
        regularIPs: 0,
        topCountries: [],
        topCities: [],
        recentIPs: []
      };
    }
  }

  async getLatestIPRecord(): Promise<IPRecord | null> {
    try {
      return await this.getFromKV('latest');
    } catch (error) {
      console.error('Failed to get latest IP record:', error);
      return null;
    }
  }

  async getIPHistory(limit: number = 50): Promise<IPRecord[]> {
    try {
      const history = await this.getFromKV('ip_history');
      return history ? history.slice(-limit) : [];
    } catch (error) {
      console.error('Failed to get IP history:', error);
      return [];
    }
  }

  private async updateAnalytics(record: IPRecord): Promise<void> {
    try {
      const currentAnalytics = await this.getIPAnalytics();
      
      // Update totals
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

      // Update city stats
      if (record.city) {
        const cityIndex = currentAnalytics.topCities.findIndex(c => c.city === record.city);
        if (cityIndex >= 0) {
          currentAnalytics.topCities[cityIndex].count++;
        } else {
          currentAnalytics.topCities.push({ city: record.city, count: 1 });
        }
      }

      // Sort and limit top lists
      currentAnalytics.topCountries.sort((a, b) => b.count - a.count).slice(0, 10);
      currentAnalytics.topCities.sort((a, b) => b.count - a.count).slice(0, 10);

      // Calculate unique IPs (simplified - in production you'd use a Set)
      const uniqueIPs = await this.getUniqueIPCount();
      currentAnalytics.uniqueIPs = uniqueIPs;

      // Store updated analytics
      await this.setToKV('analytics', currentAnalytics);
    } catch (error) {
      console.error('Failed to update IP analytics:', error);
    }
  }

  private async addToIPHistory(record: IPRecord): Promise<void> {
    try {
      const history = await this.getFromKV('ip_history') || [];
      
      // Add new record
      history.push({
        ip: record.ip,
        timestamp: record.timestamp,
        isVPN: record.isVPN
      });

      // Keep only last 100 records
      if (history.length > 100) {
        history.splice(0, history.length - 100);
      }

      await this.setToKV('ip_history', history);
    } catch (error) {
      console.error('Failed to add to IP history:', error);
    }
  }

  private async getUniqueIPCount(): Promise<number> {
    try {
      // This is a simplified approach - in production you'd maintain a Set
      const history = await this.getFromKV('ip_history') || [];
      const uniqueIPs = new Set(history.map((item: any) => item.ip));
      return uniqueIPs.size;
    } catch (error) {
      console.error('Failed to get unique IP count:', error);
      return 0;
    }
  }

  private async setToKV(key: string, value: any): Promise<void> {
    try {
      // Try EdgeOne Pages KV binding first
      const ipKV = (globalThis as any).IP; // IP should be your bound KV namespace name
      
      if (ipKV) {
        await ipKV.put(key, JSON.stringify(value));
        return;
      }

      // Fallback to API call
      const response = await fetch('/api/ip/store', {
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

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('IP KV storage error:', error);
      throw error;
    }
  }

  private async getFromKV(key: string): Promise<any> {
    try {
      // Try EdgeOne Pages KV binding first
      const ipKV = (globalThis as any).IP; // IP should be your bound KV namespace name
      
      if (ipKV) {
        const value = await ipKV.get(key);
        return value ? JSON.parse(value) : null;
      }

      // Fallback to API call
      const response = await fetch(`/api/ip/get?namespace=${this.KV_NAMESPACE}&namespaceId=${this.KV_NAMESPACE_ID}&key=${key}`);
      
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

  // Get location data for IP
  async getIPLocation(ip: string): Promise<{
    country?: string;
    city?: string;
    provider?: string;
  }> {
    try {
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      const data = await response.json();
      
      return {
        country: data.country_name || undefined,
        city: data.city || undefined,
        provider: data.org || undefined
      };
    } catch (error) {
      console.error('Failed to get IP location:', error);
      return {};
    }
  }
}

export default IPTracker;
