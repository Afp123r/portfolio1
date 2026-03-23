import { NextRequest, NextResponse } from 'next/server';

// Get user's IP address from request headers
export async function GET(request: NextRequest) {
  try {
    // Try multiple methods to get the real IP address
    
    // Method 1: Check forwarded headers (most reliable for proxied requests)
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
      // X-Forwarded-For can contain multiple IPs, take the first one
      const ip = forwardedFor.split(',')[0].trim();
      return NextResponse.json({ 
        ip,
        source: 'x-forwarded-for'
      });
    }

    // Method 2: Check real IP header
    const realIP = request.headers.get('x-real-ip');
    if (realIP) {
      return NextResponse.json({ 
        ip: realIP,
        source: 'x-real-ip'
      });
    }

    // Method 3: Check CF-Connecting-IP (Cloudflare)
    const cfIP = request.headers.get('cf-connecting-ip');
    if (cfIP) {
      return NextResponse.json({ 
        ip: cfIP,
        source: 'cf-connecting-ip'
      });
    }

    // Method 4: Check X-Client-IP
    const clientIP = request.headers.get('x-client-ip');
    if (clientIP) {
      return NextResponse.json({ 
        ip: clientIP,
        source: 'x-client-ip'
      });
    }

    // Method 5: Fallback to request.ip (may not work in all environments)
    const requestIP = request.ip;
    if (requestIP) {
      return NextResponse.json({ 
        ip: requestIP,
        source: 'request-ip'
      });
    }

    // If all methods fail, return a fallback
    return NextResponse.json({ 
      ip: 'Unknown',
      source: 'fallback',
      error: 'Could not determine IP address'
    });

  } catch (error) {
    console.error('Error getting user IP:', error);
    return NextResponse.json({ 
      error: 'Failed to get IP address',
      ip: 'Unknown'
    }, { status: 500 });
  }
}
