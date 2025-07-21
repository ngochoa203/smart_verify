// Authentication service for Smart Verify frontend
import { getAuthHeaders, handleApiResponse } from '../api-utils';
import { getApiBase } from "../api-base";

// User interface
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
  avatar_url?: string;
  is_active: boolean;
}

// Seller interface
export interface Seller {
  id: number;
  username: string;
  email: string;
  role: string;
  phone?: string;
  shop_name: string;
  shop_description: string;
  logo_url?: string;
  is_verified: boolean;
  is_active: boolean;
}

// Admin interface
export interface Admin {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
}

// Login response interface
export interface LoginResponse {
  user: User;
  access_token: string;
}

// Register data interface
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  role?: string;
}

// Auth service class
class AuthService {
  // Login user
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${getApiBase('auth')}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    return handleApiResponse<LoginResponse>(response);
  }

  // Register user or seller
  async register(data: RegisterData): Promise<{ message: string; user_id: number }> {
    let url = '';
    if (data.role === 'seller') {
      url = `${getApiBase('auth')}/api/v1/sellers/register`;
    } else {
      url = `${getApiBase('auth')}/api/v1/user/register`;
    }
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    return handleApiResponse(response);
  }

  // Get user/seller/admin profile
  async getProfile(): Promise<User | Seller | Admin> {
    const headers = getAuthHeaders();
    if (!Object.keys(headers).length) {
      throw new Error('No authentication token found');
    }
    const response = await fetch(`${getApiBase('auth')}/api/v1/profile`, {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    });
    return handleApiResponse<User | Seller | Admin>(response);
  }

  // Update user profile
  async updateProfile(data: Partial<User>): Promise<User> {
    const headers = getAuthHeaders();
    if (!Object.keys(headers).length) {
      throw new Error('No authentication token found');
    }
    const response = await fetch(`${getApiBase('auth')}/api/v1/profile`, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleApiResponse<User>(response);
  }

  // Check admin status
  async checkAdminStatus(): Promise<{ is_admin: boolean }> {
    const headers = getAuthHeaders();
    if (!Object.keys(headers).length) {
      throw new Error('No authentication token found');
    }
    const response = await fetch(`${getApiBase('auth')}/api/v1/auth/admin/status`, {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    });
    return handleApiResponse(response);
  }

  // Check seller status
  async checkSellerStatus(): Promise<{ is_seller: boolean; shop_name?: string; shop_id?: number }> {
    const headers = getAuthHeaders();
    if (!Object.keys(headers).length) {
      throw new Error('No authentication token found');
    }
    const response = await fetch(`${getApiBase('auth')}/api/v1/auth/seller/status`, {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    });
    return handleApiResponse(response);
  }
}

export const authService = new AuthService();