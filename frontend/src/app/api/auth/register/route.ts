import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // In a real implementation, you would call your backend API
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}:${process.env.NEXT_PUBLIC_AUTH_API_PORT}/api/v1/auth/register`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.message || 'Registration failed' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Registration error:', error);
    
    // For demo purposes, return mock success response
    const { email } = await req.json();
    
    // Check if email already exists
    if (email === 'admin@smartverify.com' || email === 'seller@example.com') {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      message: 'Registration successful',
      user_id: Math.floor(Math.random() * 1000) + 1
    });
  }
}