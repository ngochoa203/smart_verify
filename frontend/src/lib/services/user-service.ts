import { getAuthHeaders, handleApiResponse } from '../api-utils';
import { getApiBase } from '../api-base';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface UserPayload {
  username: string;
  email: string;
  password?: string;
  role: string;
  is_active: boolean;
}

class UserService {
  private baseUrl = `${getApiBase('auth')}/api/v1/users`;

  async getUsers(): Promise<User[]> {
    const headers = getAuthHeaders();
    const response = await fetch(this.baseUrl, { headers });
    return handleApiResponse<User[]>(response);
  }

  async createUser(data: UserPayload): Promise<User> {
    const headers = {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    };
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return handleApiResponse<User>(response);
  }

  async updateUser(id: number, data: UserPayload): Promise<User> {
    const headers = {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    };
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    return handleApiResponse<User>(response);
  }

  async toggleUserStatus(id: number, is_active: boolean): Promise<User> {
    const headers = {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    };
    const response = await fetch(`${this.baseUrl}/${id}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ is_active }),
    });
    return handleApiResponse<User>(response);
  }

  async deleteUser(id: number): Promise<void> {
    const headers = getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers,
    });
    return handleApiResponse(response);
  }
}

export const userService = new UserService();
