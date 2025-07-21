import { NextRequest } from 'next/server';
import { handleAdminUserRequest } from '@/lib/admin-user-api-utils';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = params.id;
  
  try {
    const body = await req.json();
    return handleAdminUserRequest(req, `admin/users/${userId}`, 'PUT', body);
  } catch (error) {
    console.error(`Error parsing request body for user ${userId}:`, error);
    return handleAdminUserRequest(req, `admin/users/${userId}`, 'PUT', {});
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = params.id;
  return handleAdminUserRequest(req, `admin/users/${userId}`, 'DELETE');
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = params.id;
  return handleAdminUserRequest(req, `admin/users/${userId}`);
}