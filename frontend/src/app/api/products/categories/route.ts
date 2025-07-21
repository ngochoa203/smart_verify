import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Try to call the backend API
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}:${process.env.NEXT_PUBLIC_PRODUCT_API_PORT}/api/v1/categories`;
    console.log(`Attempting to fetch categories from: ${apiUrl}`);
    
    try {
      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Categories fetched successfully from API');
        return NextResponse.json(data);
      }
    } catch (fetchError) {
      console.warn('Backend API call failed, using mock data', fetchError);
    }
    
    // Mock categories data as fallback
    console.log('Using mock categories data');
    const mockCategories = [
      { id: 1, name: 'Điện thoại', parent_id: null, product_count: 5 },
      { id: 2, name: 'Laptop', parent_id: null, product_count: 2 },
      { id: 3, name: 'Thời trang', parent_id: null, product_count: 3 },
      { id: 4, name: 'Đồng hồ', parent_id: null, product_count: 2 },
      { id: 5, name: 'Giày dép', parent_id: 3, product_count: 2 },
      { id: 6, name: 'Túi xách', parent_id: 3, product_count: 1 },
    ];
    
    return NextResponse.json(mockCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}