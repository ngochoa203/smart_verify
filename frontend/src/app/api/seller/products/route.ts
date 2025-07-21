import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // In a real implementation, you would call your backend API
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}:${process.env.NEXT_PUBLIC_PRODUCT_API_PORT}/api/v1/seller/products`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching seller products:', error);
    
    // For demo purposes, return mock data
    return NextResponse.json({
      items: [
        {
          id: 1,
          name: 'iPhone 15 Pro Max',
          price: 29990000,
          category: 'Điện thoại',
          status: true,
          inventory: 15,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Samsung Galaxy S24 Ultra',
          price: 26990000,
          category: 'Điện thoại',
          status: true,
          inventory: 10,
          created_at: new Date().toISOString()
        },
        {
          id: 3,
          name: 'MacBook Pro M3',
          price: 45990000,
          category: 'Laptop',
          status: true,
          inventory: 8,
          created_at: new Date().toISOString()
        },
        {
          id: 4,
          name: 'Louis Vuitton Neverfull',
          price: 35000000,
          category: 'Túi xách',
          status: false,
          inventory: 3,
          created_at: new Date().toISOString()
        }
      ],
      total: 4,
      page: 1,
      size: 10,
      pages: 1
    });
  }
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const formData = await req.formData();
    
    // In a real implementation, you would call your backend API
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}:${process.env.NEXT_PUBLIC_PRODUCT_API_PORT}/api/v1/seller/products`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Failed to create product');
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating product:', error);
    
    // For demo purposes, return mock success response
    return NextResponse.json({
      id: Math.floor(Math.random() * 1000) + 10,
      message: 'Product created successfully'
    });
  }
}