import { NextRequest, NextResponse } from 'next/server';

/**
 * Helper function to extract auth token from request
 */
export function extractToken(req: NextRequest): string | null {
  // Try to get token from Authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Try to get token from cookies
  const cookieHeader = req.headers.get('cookie') || '';
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key) acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  
  return cookies['auth_token'] || null;
}

/**
 * Helper function to handle admin API requests
 */
export async function handleAdminRequest(
  req: NextRequest,
  endpoint: string,
  method: string = 'GET',
  body?: any
) {
  const token = extractToken(req);
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const port = process.env.NEXT_PUBLIC_PRODUCT_API_PORT || '8002';
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}:${port}/api/v1/${endpoint}`;
    
    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`
    };
    
    if (body) {
      headers['Content-Type'] = 'application/json';
    }
    
    const response = await fetch(apiUrl, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store'
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        message: `HTTP error ${response.status}` 
      }));
      console.error('Backend error:', errorData);
      return NextResponse.json(errorData, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error handling admin request to ${endpoint}:`, error);
    return NextResponse.json(
      { error: 'Failed to connect to backend service', details: (error as Error).message },
      { status: 502 }
    );
  }
}