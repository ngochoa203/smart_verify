import { NextRequest } from 'next/server';
import { handleAdminRequest } from '@/lib/admin-api-utils';

export async function GET(req: NextRequest) {
  return handleAdminRequest(req, 'admin/categories');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return handleAdminRequest(req, 'admin/categories', 'POST', body);
  } catch (error) {
    console.error('Error parsing request body:', error);
    return handleAdminRequest(req, 'admin/categories', 'POST', {});
  }
}