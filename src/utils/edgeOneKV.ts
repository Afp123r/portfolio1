interface EdgeOneKVConfig {
  namespace: string;
  namespaceId: string;
  endpoint?: string;
  apiKey?: string;
}

interface VPNStorageData {
  id: string;
  timestamp: string;
  isVPN: boolean;
  provider?: string;
  country?: string;
  ip?: string;
  userAgent: string;
  sessionId: string;
}

export class EdgeOneKVStorage {
  private config: EdgeOneKVConfig;
  private readonly KV_NAMESPACE = 'vpn';
  private readonly KV_NAMESPACE_ID = 'ns-QrCNnpxdZcmU';

  constructor(config?: EdgeOneKVConfig) {
    this.config = {
      namespace: this.KV_NAMESPACE,
      namespaceId: this.KV_NAMESPACE_ID,
      ...config
    };
  }

  async storeVPNData(vpnData: Omit<VPNStorageData, 'id' | 'timestamp' | 'userAgent' | 'sessionId'>): Promise<boolean> {
    try {
      const storageData: VPNStorageData = {
        id: this.generateId(),
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: this.getSessionId(),
        ...vpnData
      };

      // Store in EdgeOne KV
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

  async getVPNData(id: string): Promise<VPNStorageData | null> {
    try {
      return await this.getFromKV(id);
    } catch (error) {
      console.error('Failed to get VPN data from EdgeOne KV:', error);
      return null;
    }
  }

  async getLatestVPNData(): Promise<VPNStorageData | null> {
    try {
      return await this.getFromKV('latest');
    } catch (error) {
      console.error('Failed to get latest VPN data from EdgeOne KV:', error);
      return null;
    }
  }

  async getVPNAnalytics(): Promise<{
    total: number;
    vpnUsers: number;
    regularUsers: number;
    topProviders: Array<{ provider: string; count: number }>;
    topCountries: Array<{ country: string; count: number }>;
  }> {
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

  private async setToKV(key: string, value: any): Promise<boolean> {
    try {
      // For EdgeOne KV, we need to use the appropriate API
      // This is a mock implementation - you'll need to replace with actual EdgeOne KV API calls
      
      if (typeof window !== 'undefined' && window.edgeOneKV) {
        // Client-side EdgeOne KV (if available)
        await window.edgeOneKV.put(key, JSON.stringify(value));
        return true;
      } else {
        // Server-side or API call
        const response = await fetch('/api/kv/store', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            namespace: this.config.namespace,
            namespaceId: this.config.namespaceId,
            key,
            value
          })
        });

        return response.ok;
      }
    } catch (error) {
      console.error('KV storage error:', error);
      return false;
    }
  }

  private async getFromKV(key: string): Promise<any> {
    try {
      if (typeof window !== 'undefined' && window.edgeOneKV) {
        // Client-side EdgeOne KV (if available)
        const value = await window.edgeOneKV.get(key);
        return value ? JSON.parse(value) : null;
      } else {
        // Server-side or API call
        const response = await fetch(`/api/kv/get?namespace=${this.config.namespace}&namespaceId=${this.config.namespaceId}&key=${key}`);
        
        if (response.ok) {
          const data = await response.json();
          return data.value;
        }
        
        return null;
      }
    } catch (error) {
      console.error('KV retrieval error:', error);
      return null;
    }
  }

  private async addToAnalytics(data: VPNStorageData): Promise<void> {
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

  private generateId(): string {
    return `vpn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getSessionId(): string {
    // Get or create session ID
    let sessionId = sessionStorage.getItem('vpn_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('vpn_session_id', sessionId);
    }
    return sessionId;
  }

  // API endpoint for server-side KV operations
  static createAPIRoutes() {
    return {
      'POST /api/kv/store': async (req: Request) => {
        try {
          const { namespace, namespaceId, key, value } = await req.json();
          
          // Here you would implement actual EdgeOne KV server-side storage
          // This is a mock implementation
          console.log('Storing to EdgeOne KV:', { namespace, namespaceId, key, value });
          
          return Response.json({ success: true });
        } catch (error) {
          return Response.json({ error: 'Failed to store data' }, { status: 500 });
        }
      },

      'GET /api/kv/get': async (req: Request) => {
        try {
          const url = new URL(req.url);
          const namespace = url.searchParams.get('namespace');
          const namespaceId = url.searchParams.get('namespaceId');
          const key = url.searchParams.get('key');
          
          // Here you would implement actual EdgeOne KV server-side retrieval
          // This is a mock implementation
          console.log('Getting from EdgeOne KV:', { namespace, namespaceId, key });
          
          return Response.json({ value: null });
        } catch (error) {
          return Response.json({ error: 'Failed to get data' }, { status: 500 });
        }
      }
    };
  }
}

// Extend Window interface for client-side EdgeOne KV
declare global {
  interface Window {
    edgeOneKV?: {
      put: (key: string, value: string) => Promise<void>;
      get: (key: string) => Promise<string | null>;
    };
  }
}

export default EdgeOneKVStorage;
