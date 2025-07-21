import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const sort_by = searchParams.get('sort_by') || 'created_at';
    const sort_order = searchParams.get('sort_order') || 'desc';
    const size = parseInt(searchParams.get('size') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    
    // Mock products data
    const mockProducts = [
      {
        id: 1,
        name: 'iPhone 15 Pro Max',
        description: 'The latest iPhone with A17 Pro chip',
        price: 29990000,
        brand: 'Apple',
        category_id: 2,
        seller_id: 1,
        images: [
          { id: 1, product_id: 1, image_url: 'https://placehold.co/600x600/3B82F6/FFFFFF?text=iPhone', is_primary: true }
        ],
        status: true
      },
      {
        id: 2,
        name: 'Samsung Galaxy S24 Ultra',
        description: 'Samsung flagship with advanced AI features',
        price: 26990000,
        brand: 'Samsung',
        category_id: 2,
        seller_id: 1,
        images: [
          { id: 2, product_id: 2, image_url: 'https://placehold.co/600x600/10B981/FFFFFF?text=Samsung', is_primary: true }
        ],
        status: true
      },
      {
        id: 3,
        name: 'MacBook Pro M3',
        description: 'Powerful laptop with M3 chip',
        price: 45990000,
        brand: 'Apple',
        category_id: 3,
        seller_id: 1,
        images: [
          { id: 3, product_id: 3, image_url: 'https://placehold.co/600x600/8B5CF6/FFFFFF?text=MacBook', is_primary: true }
        ],
        status: true
      },
      {
        id: 4,
        name: 'Louis Vuitton Neverfull',
        description: 'Luxury handbag',
        price: 35000000,
        brand: 'Louis Vuitton',
        category_id: 6,
        seller_id: 2,
        images: [
          { id: 4, product_id: 4, image_url: 'https://placehold.co/600x600/F59E0B/FFFFFF?text=LV', is_primary: true }
        ],
        status: true
      }
    ];
    
    return NextResponse.json({
      items: mockProducts.slice(0, size),
      total: mockProducts.length,
      page,
      size,
      pages: Math.ceil(mockProducts.length / size)
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}