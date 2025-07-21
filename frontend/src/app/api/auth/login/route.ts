import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;
    
    // Simple mock authentication
    // In a real app, you would validate credentials against a database
    if (password !== 'password123') {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Determine role based on email
    let role = 'user';
    if (email.includes('admin')) {
      role = 'admin';
      console.log('Admin login detected');
    } else if (email.includes('seller')) {
      role = 'seller';
      console.log('Seller login detected');
    }
    
    // Create mock user based on role
    const user = {
      id: Math.floor(Math.random() * 1000) + 1,
      username: email.split('@')[0],
      email,
      role,
      is_active: true
    };
    
    // Generate a simple token that includes the role for easy parsing
    const token = `mock_${role}_${Date.now()}`;
    
    // Log the response for debugging
    console.log('Login response:', { user, token });
    
    return NextResponse.json({
      user,
      access_token: token,
      token_type: 'bearer',
      expires_in: 3600
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}