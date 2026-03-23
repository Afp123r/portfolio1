// EdgeOne Pages function for KV storage
// This should be placed in your EdgeOne Pages functions directory

interface EdgeOnePagesContext {
  request: Request;
  env: {
    VPN: any; // KV namespace binding
  };
}

export async function onRequestPost({ request, env }: EdgeOnePagesContext) {
  try {
    const { namespace, namespaceId, key, value } = await request.json();
    
    // Validate inputs
    if (!namespace || !namespaceId || !key || value === undefined) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: namespace, namespaceId, key, or value'
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

    // Store data in EdgeOne KV
    await vpnKV.put(key, JSON.stringify(value));
    
    console.log('EdgeOne KV Store Success:', {
      namespace,
      namespaceId,
      key,
      timestamp: new Date().toISOString()
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Data stored successfully',
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
    console.error('EdgeOne KV storage error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to store data to EdgeOne KV',
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
