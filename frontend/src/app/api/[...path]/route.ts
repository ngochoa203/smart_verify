import { NextRequest, NextResponse } from 'next/server';

// This is a catch-all API route handler that proxies requests to the appropriate backend service
export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(req, params.path, 'GET');
}

export async function POST(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(req, params.path, 'POST');
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(req, params.path, 'PUT');
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(req, params.path, 'PATCH');
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(req, params.path, 'DELETE');
}

async function handleRequest(req: NextRequest, pathSegments: string[], method: string) {
  // The first segment is the service name (auth, products, etc.)
  const service = pathSegments[0];
  
  // Map service names to their corresponding environment variable names
  const serviceToEnvMap: Record<string, string> = {
    'auth': 'AUTH',
    'product': 'PRODUCT',
    'products': 'PRODUCT',
    'inventory': 'INVENTORY',
    'order': 'ORDER',
    'orders': 'ORDER',
    'payment': 'PAYMENT',
    'payments': 'PAYMENT',
    'review': 'REVIEW',
    'reviews': 'REVIEW',
    'favorite': 'FAVORITE',
    'favorites': 'FAVORITE',
    'ai': 'AI',
    'cart': 'CART',
    'profile': 'AUTH',
    'login': 'AUTH',
    'register': 'AUTH',
    'admin': 'PRODUCT'
  };
  
  // Get the correct service name for the environment variable
  const envServiceName = serviceToEnvMap[service] || service.toUpperCase();
  
  // Get the port for the service
  const portEnvVar = `NEXT_PUBLIC_${envServiceName}_API_PORT`;
  const port = process.env[portEnvVar];
  
  if (!port) {
    return NextResponse.json(
      { error: `Service ${service} not configured (missing ${portEnvVar})` },
      { status: 500 }
    );
  }
  
  // Build the backend URL
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost';
  const apiPath = pathSegments.slice(1).join('/');
  const url = `${baseUrl}:${port}/api/v1/${apiPath}${req.nextUrl.search}`;
  
  try {
    // Get the request body if it exists
    let body = null;
    if (method !== 'GET' && method !== 'HEAD') {
      const contentType = req.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        body = await req.json().catch(() => ({}));
      } else if (contentType.includes('multipart/form-data')) {
        body = await req.formData().catch(() => null);
      } else {
        body = await req.text().catch(() => '');
      }
    }
    
    // Forward headers
    const headers = new Headers();
    req.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'host') {
        headers.append(key, value);
      }
    });
    
    // Extract token from cookies if not in Authorization header
    if (!headers.has('Authorization')) {
      // Try to get from cookie
      const cookieHeader = req.headers.get('cookie') || '';
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key) acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
      
      const token = cookies['auth_token'];
      if (token) {
        headers.append('Authorization', `Bearer ${token}`);
      }
    }
    
    // Make the request to the backend
    const response = await fetch(url, {
      method,
      headers,
      body: body instanceof FormData || body === null ? body : JSON.stringify(body),
      cache: 'no-store'
    });
    
    // Get the response body
    let responseData;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json().catch(() => ({
        error: 'Failed to parse JSON response'
      }));
    } else {
      responseData = await response.text().catch(() => 'No response body');
    }
    
    // Return the response
    if (contentType && contentType.includes('application/json')) {
      return NextResponse.json(responseData, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          'Content-Type': 'application/json'
        },
      });
    } else {
      return new NextResponse(responseData, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
    }
  } catch (error) {
    console.error(`Error proxying request to ${url}:`, error);
    
    return NextResponse.json(
      { error: 'Failed to connect to backend service', details: (error as Error).message },
      { status: 502 }
    );
  }
}