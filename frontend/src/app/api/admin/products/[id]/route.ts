import { NextRequest } from 'next/server';
import { handleAdminRequest } from '@/lib/admin-api-utils';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const productId = params.id;
  return handleAdminRequest(req, `admin/products/${productId}`, 'DELETE');
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const productId = params.id;
  return handleAdminRequest(req, `admin/products/${productId}`);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const productId = params.id;
  
  try {
    const body = await req.json();
    return handleAdminRequest(req, `admin/products/${productId}`, 'PUT', body);
  } catch (error) {
    console.error(`Error parsing request body for product ${productId}:`, error);
    return handleAdminRequest(req, `admin/products/${productId}`, 'PUT', {});
  }
}