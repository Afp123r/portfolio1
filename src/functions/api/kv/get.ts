// EdgeOne Pages function for KV retrieval
// This should be placed in your EdgeOne Pages functions directory

interface EdgeOnePagesContext {
  request: Request;
  env: {
    VPN: any; // KV namespace binding
  };
}

export async function onRequestGet({ request, env }: EdgeOnePagesContext) {
  try {
    const url = new URL(request.url);
    const namespace = url.searchParams.get('namespace');
    const namespaceId = url.searchParams.get('namespaceId');
    const key = url.searchParams.get('key');
    
    // Validate inputs
    if (!namespace || !namespaceId || !key) {
      return new Response(JSON.stringify({
        error: 'Missing required parameters: namespace, namespaceId, and key'
      }), {
        status: 400,
        headers: {
          'content-type': 'application/json; charset=UTF-8',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Use the bound KV namespace - VPN should be bound in your EdgeOne Pages config
    const vpnKV = env.VPN; // VPN is your bound KV namespace name
    
    if (!vpnKV) {
      console.error('VPN KV namespace not bound');
      return new Response(JSON.stringify({
        error: 'VPN KV namespace not bound in EdgeOne Pages configuration'
      }), {
        status: 500,
        headers: {
          'content-type': 'application/json; charset=UTF-8',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Retrieve data from EdgeOne KV
    const value = await vpnKV.get(key);
    
    console.log('EdgeOne KV Get Success:', {
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

    return new Response(JSON.stringify({
      value: parsedValue,
      message: parsedValue ? 'Data retrieved successfully' : 'Data not found',
      namespace,
      namespaceId,
      key
    }), {
      headers: {
        'content-type': 'application/json; charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('EdgeOne KV retrieval error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to retrieve data from EdgeOne KV',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'content-type': 'application/json; charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
