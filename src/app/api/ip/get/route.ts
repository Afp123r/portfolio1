import { NextRequest, NextResponse } from 'next/server';

// EdgeOne KV retrieval endpoint for IP tracking
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const namespace = searchParams.get('namespace');
    const namespaceId = searchParams.get('namespaceId');
    const key = searchParams.get('key');
    
    // Validate inputs
    if (!namespace || !namespaceId || !key) {
      return NextResponse.json({ 
        error: 'Missing required parameters: namespace, namespaceId, and key' 
      }, { status: 400 });
    }

    // EdgeOne Pages KV binding - use the bound KV namespace
    const ipKV = (globalThis as any).IP; // IP should be your bound KV namespace name
    
    if (!ipKV) {
      console.warn('IP KV namespace not bound, using simulation mode');
      // Fallback to simulation for development
      console.log('EdgeOne IP KV Get (Simulation):', {
        namespace,
        namespaceId,
        key,
        timestamp: new Date().toISOString()
      });
      
      return NextResponse.json({ 
        value: null,
        message: 'IP data not found (simulation mode)',
        mode: 'simulation'
      });
    }

    // Retrieve data from EdgeOne KV
    const value = await ipKV.get(key);
    
    console.log('EdgeOne IP KV Get Success:', {
      namespace,
      namespaceId,
      key,
      timestamp: new Date().toISOString()
    });

    // Parse JSON if value exists
    let parsedValue = null;
    if (value) {
      try {
        parsedValue = JSON.parse(value);
      } catch (parseError) {
        parsedValue = value; // Return as string if JSON parsing fails
      }
    }

    return NextResponse.json({ 
      value: parsedValue,
      message: parsedValue ? 'IP data retrieved successfully' : 'IP data not found',
      namespace,
      namespaceId,
      key
    });

  } catch (error) {
    console.error('EdgeOne IP KV retrieval error:', error);
    return NextResponse.json({ 
      error: 'Failed to retrieve IP data from EdgeOne KV',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
