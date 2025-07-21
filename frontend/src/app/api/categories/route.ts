import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // In a real implementation, you would call your backend API
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}:${process.env.NEXT_PUBLIC_PRODUCT_API_PORT}/api/v1/categories`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching categories:', error);
    
    // For demo purposes, return mock data
    return NextResponse.json([
      { id: 1, name: 'Electronics', parent_id: null, product_count: 5 },
      { id: 2, name: 'Smartphones', parent_id: 1, product_count: 2 },
      { id: 3, name: 'Laptops', parent_id: 1, product_count: 2 },
      { id: 4, name: 'Fashion', parent_id: null, product_count: 3 },
      { id: 5, name: 'Shoes', parent_id: 4, product_count: 2 },
      { id: 6, name: 'Bags', parent_id: 4, product_count: 1 },
    ]);
  }
}