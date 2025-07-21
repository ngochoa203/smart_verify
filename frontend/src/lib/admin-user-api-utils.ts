import { NextRequest, NextResponse } from 'next/server';
import { extractToken } from './admin-api-utils';

/**
 * Helper function to handle admin user API requests
 */
export async function handleAdminUserRequest(
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
    const port = process.env.NEXT_PUBLIC_AUTH_API_PORT || '8001';
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
    console.error(`Error handling admin user request to ${endpoint}:`, error);
    return NextResponse.json(
      { error: 'Failed to connect to backend service', details: (error as Error).message },
      { status: 502 }
    );
  }
}