import { getAuthHeaders, handleApiResponse } from '../api-utils';
import { getApiBase } from '../api-base';
class SellerProductService {
  private baseUrl = `${getApiBase('product')}/api/v1/products`;

  async getSellerProducts(): Promise<SellerProduct[]> {
    const headers = getAuthHeaders();
    const response = await fetch(this.baseUrl, { headers });
    // Expect API to return array directly
    return handleApiResponse<SellerProduct[]>(response);
  }

  async createProduct(formData: FormData): Promise<any> {
    // Do not set Content-Type for FormData, browser will set it automatically with boundary
    const headers = { ...getAuthHeaders() } as Record<string, string>;
    // Remove Content-Type if it exists as browser will set it for FormData
    delete headers['Content-Type'];
    
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers,
        body: formData,
        // Important for file uploads
        credentials: 'include',
      });
      return handleApiResponse(response);
    } catch (error) {
      console.error('Error uploading product with images:', error);
      throw error;
    }
  }

  async updateProductStatus(id: number, status: boolean): Promise<any> {
    const headers = {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    };
    const response = await fetch(`${this.baseUrl}/${id}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status }),
    });
    return handleApiResponse(response);
  }

  async deleteProduct(id: number): Promise<any> {
    const headers = getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers,
    });
    return handleApiResponse(response);
  }
}

import type { Product } from './product-service';

export interface SellerProduct extends Product {
  inventory?: number;
  created_at?: string;
}


export const sellerProductService = new SellerProductService();
