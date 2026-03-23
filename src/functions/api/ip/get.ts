// EdgeOne Pages function for IP KV retrieval
// This should be placed in your EdgeOne Pages functions directory

interface EdgeOnePagesContext {
  request: Request;
  env: {
    IP: any; // KV namespace binding
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

    // Use the bound KV namespace - IP should be bound in your EdgeOne Pages config
    const ipKV = env.IP; // IP is your bound KV namespace name
    
    if (!ipKV) {
      console.error('IP KV namespace not bound');
      return new Response(JSON.stringify({
        error: 'IP KV namespace not bound in EdgeOne Pages configuration'
      }), {
        status: 500,
        headers: {
          'content-type': 'application/json; charset=UTF-8',
          'Access-Control-Allow-Origin': '*',
        },
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

    return new Response(JSON.stringify({
      value: parsedValue,
      message: parsedValue ? 'IP data retrieved successfully' : 'IP data not found',
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
    console.error('EdgeOne IP KV retrieval error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to retrieve IP data from EdgeOne KV',
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
