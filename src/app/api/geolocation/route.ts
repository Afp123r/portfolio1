import { NextRequest, NextResponse } from 'next/server';

// Server-side geolocation API (no CORS issues)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ip = searchParams.get('ip');

    if (!ip) {
      return NextResponse.json({ 
        error: 'Missing IP parameter' 
      }, { status: 400 });
    }

    // Try multiple geolocation APIs from server side (no CORS)
    const apis = [
      {
        url: `https://ipapi.co/${ip}/json/`,
        parser: (data: any) => data.country_name || data.country
      },
      {
        url: `https://ip-api.com/json/${ip}?fields=country`,
        parser: (data: any) => data.country
      },
      {
        url: `https://ipgeolocation.abstractapi.com/v1/?api_key=demo&ip_address=${ip}`,
        parser: (data: any) => data.country_name
      }
    ];

    for (const api of apis) {
      try {
        const response = await fetch(api.url);
        if (response.ok) {
          const data = await response.json();
          const country = api.parser(data);
          if (country && country !== 'Unknown') {
            return NextResponse.json({ 
              country,
              ip,
              source: api.url
            });
          }
        }
      } catch (error) {
        console.warn(`Server geolocation API ${api.url} failed:`, error);
        continue;
      }
    }

    // Fallback to IP range detection
    const country = getCountryFromIPRange(ip);
    return NextResponse.json({ 
      country,
      ip,
      source: 'IP range detection'
    });

  } catch (error) {
    console.error('Geolocation API error:', error);
    return NextResponse.json({ 
      error: 'Failed to get geolocation',
      country: 'Unknown'
    }, { status: 500 });
  }
}

function getCountryFromIPRange(ip: string): string {
  // Simple IP range to country mapping
  const ipRanges = [
    { start: '1.0.0.0', end: '1.255.255.255', country: 'United States' },
    { start: '8.8.8.0', end: '8.8.8.255', country: 'United States' },
    { start: '208.67.222.0', end: '208.67.222.255', country: 'United States' },
    { start: '27.0.0.0', end: '27.255.255.255', country: 'China' },
    { start: '117.0.0.0', end: '117.255.255.255', country: 'China' },
    { start: '203.0.0.0', end: '203.255.255.255', country: 'Australia' },
    { start: '5.0.0.0', end: '5.255.255.255', country: 'Germany' },
    { start: '46.0.0.0', end: '46.255.255.255', country: 'United Kingdom' },
    { start: '151.0.0.0', end: '151.255.255.255', country: 'Japan' },
    { start: '175.0.0.0', end: '175.255.255.255', country: 'South Korea' },
  ];

  const isIPInRange = (ip: string, start: string, end: string): boolean => {
    const ipToNumber = (ip: string) => {
      return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
    };

    const ipNum = ipToNumber(ip);
    const startNum = ipToNumber(start);
    const endNum = ipToNumber(end);

    return ipNum >= startNum && ipNum <= endNum;
  };

  for (const range of ipRanges) {
    if (isIPInRange(ip, range.start, range.end)) {
      return range.country;
    }
  }

  return 'Unknown';
}
