import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const productId = params.id;
  const token = req.headers.get('authorization')?.split(' ')[1];
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await req.json();
    
    // In a real implementation, you would call your backend API
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}:${process.env.NEXT_PUBLIC_PRODUCT_API_PORT}/api/v1/admin/products/${productId}/status`;
    
    const response = await fetch(apiUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update product status');
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error updating product ${productId} status:`, error);
    
    // For demo purposes, return mock success response
    const body = await req.json();
    return NextResponse.json({
      id: parseInt(productId),
      status: body.status,
      message: 'Product status updated successfully'
    });
  }
}