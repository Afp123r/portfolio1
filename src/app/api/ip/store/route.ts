import { NextRequest, NextResponse } from 'next/server';

// EdgeOne IP KV storage endpoint using Pages KV binding
export async function POST(request: NextRequest) {
  try {
    const { namespace, namespaceId, key, value } = await request.json();
    
    // Validate inputs
    if (!namespace || !namespaceId || !key || value === undefined) {
      return NextResponse.json({ 
        error: 'Missing required fields: namespace, namespaceId, key, or value' 
      }, { status: 400 });
    }

    // EdgeOne Pages KV binding - use the bound IP KV namespace
    const ipKV = (globalThis as any).ip; // ip should be your bound KV namespace name
    
    if (!ipKV) {
      console.warn('IP KV namespace not bound, using simulation mode');
      // Fallback to simulation for development
      console.log('EdgeOne IP KV Store (Simulation):', {
        namespace,
        namespaceId,
        key,
        value,
        timestamp: new Date().toISOString()
      });
      
      return NextResponse.json({ 
        success: true,
        message: 'IP data stored successfully (simulation mode)',
        namespace,
        namespaceId,
        key,
        mode: 'simulation'
      });
    }

    // Store data in EdgeOne IP KV
    await ipKV.put(key, JSON.stringify(value));
    
    console.log('EdgeOne IP KV Store Success:', {
      namespace,
      namespaceId,
      key,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true,
      message: 'IP data stored successfully',
      namespace,
      namespaceId,
      key
    });

  } catch (error) {
    console.error('EdgeOne IP KV storage error:', error);
    return NextResponse.json({ 
      error: 'Failed to store IP data to EdgeOne KV',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
