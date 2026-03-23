import { NextRequest, NextResponse } from 'next/server';

// EdgeOne KV storage endpoint using Pages KV binding
export async function POST(request: NextRequest) {
  try {
    const { namespace, namespaceId, key, value } = await request.json();
    
    // Validate inputs
    if (!namespace || !namespaceId || !key || value === undefined) {
      return NextResponse.json({ 
        error: 'Missing required fields: namespace, namespaceId, key, or value' 
      }, { status: 400 });
    }

    // EdgeOne Pages KV binding - use the bound KV namespace
    // The KV namespace should be bound in your EdgeOne Pages configuration
    const vpnKV = (globalThis as any).VPN; // VPN should be your bound KV namespace name
    
    if (!vpnKV) {
      console.warn('VPN KV namespace not bound, using simulation mode');
      // Fallback to simulation for development
      console.log('EdgeOne KV Store (Simulation):', {
        namespace,
        namespaceId,
        key,
        value,
        timestamp: new Date().toISOString()
      });
      
      return NextResponse.json({ 
        success: true,
        message: 'Data stored successfully (simulation mode)',
        namespace,
        namespaceId,
        key,
        mode: 'simulation'
      });
    }

    // Store data in EdgeOne KV
    await vpnKV.put(key, JSON.stringify(value));
    
    console.log('EdgeOne KV Store Success:', {
      namespace,
      namespaceId,
      key,
      value,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true,
      message: 'Data stored successfully',
      namespace,
      namespaceId,
      key
    });

  } catch (error) {
    console.error('EdgeOne KV storage error:', error);
    return NextResponse.json({ 
      error: 'Failed to store data to EdgeOne KV',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
