import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // In a real implementation, you would call your backend API
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}:${process.env.NEXT_PUBLIC_AUTH_API_PORT}/api/v1/auth/seller/status`;
    
    try {
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (fetchError) {
      console.warn('Backend API call failed, using mock data');
    }
    
    // Simple string check for seller or admin role
    const isSeller = token && (token.includes('mock_seller') || token.includes('mock_admin'));
    console.log(`Seller check: ${isSeller} for token: ${token}`);
    
    return NextResponse.json({
      is_seller: isSeller,
      shop_name: isSeller ? 'Demo Shop' : null,
      shop_id: isSeller ? 1 : null
    });
  } catch (error) {
    console.error('Error checking seller status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}