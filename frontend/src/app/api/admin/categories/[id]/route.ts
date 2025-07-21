import { NextRequest } from 'next/server';
import { handleAdminRequest } from '@/lib/admin-api-utils';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const categoryId = params.id;
  
  try {
    const body = await req.json();
    return handleAdminRequest(req, `admin/categories/${categoryId}`, 'PUT', body);
  } catch (error) {
    console.error(`Error parsing request body for category ${categoryId}:`, error);
    return handleAdminRequest(req, `admin/categories/${categoryId}`, 'PUT', {});
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const categoryId = params.id;
  return handleAdminRequest(req, `admin/categories/${categoryId}`, 'DELETE');
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const categoryId = params.id;
  return handleAdminRequest(req, `admin/categories/${categoryId}`);
}