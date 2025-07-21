import { getAuthHeaders, handleApiResponse } from '../api-utils';
import { CartItem } from '../store';

// Cart response interface
export interface CartResponse {
  items: CartItem[];
}

// Cart service class
class CartService {
  private baseUrl = '/api/cart';
  
  // Get user cart
  async getUserCart(userId: number): Promise<CartResponse> {
    const headers = getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/${userId}`, {
      headers
    });
    return handleApiResponse<CartResponse>(response);
  }

  // Add item to cart
  async addToCart(item: Omit<CartItem, 'id'>): Promise<CartItem> {
    const headers = getAuthHeaders();
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(item)
    });
    return handleApiResponse<CartItem>(response);
  }

  // Update cart item
  async updateCartItem(id: number, data: { quantity: number }): Promise<CartItem> {
    const headers = getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return handleApiResponse<CartItem>(response);
  }

  // Remove item from cart
  async removeFromCart(id: number): Promise<void> {
    const headers = getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers
    });
    await handleApiResponse(response);
  }

  // Clear cart
  async clearCart(userId: number): Promise<void> {
    const headers = getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/user/${userId}`, {
      method: 'DELETE',
      headers
    });
    await handleApiResponse(response);
  }
}

export const cartService = new CartService();