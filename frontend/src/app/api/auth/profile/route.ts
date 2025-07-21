import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1] || getToken();
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Try to call the backend API if environment variables are set
    if (process.env.NEXT_PUBLIC_API_BASE_URL && process.env.NEXT_PUBLIC_AUTH_API_PORT) {
      try {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}:${process.env.NEXT_PUBLIC_AUTH_API_PORT}/api/v1/profile`;
        
        const response = await fetch(apiUrl, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          return NextResponse.json(data);
        }
      } catch (apiError) {
        console.warn('Backend API call failed, falling back to mock data');
      }
    }
    
    // Extract role from token
    let role = 'user';
    if (token.includes('mock_admin')) {
      role = 'admin';
    } else if (token.includes('mock_seller')) {
      role = 'seller';
    }
    
    // Generate a username based on role
    const username = role === 'admin' ? 'admin' : role === 'seller' ? 'seller' : 'user';
    
    // Return user data
    return NextResponse.json({
      id: Math.floor(Math.random() * 1000) + 1,
      username,
      email: `${role}@example.com`,
      role,
      is_active: true
    });
    
  } catch (error) {
    console.error('Profile error:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}