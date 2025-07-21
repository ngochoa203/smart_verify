import { NextRequest } from 'next/server';
import { handleAdminUserRequest } from '@/lib/admin-user-api-utils';

export async function GET(req: NextRequest) {
  return handleAdminUserRequest(req, 'admin/users');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return handleAdminUserRequest(req, 'admin/users', 'POST', body);
  } catch (error) {
    console.error('Error parsing request body:', error);
    return handleAdminUserRequest(req, 'admin/users', 'POST', {});
  }
}