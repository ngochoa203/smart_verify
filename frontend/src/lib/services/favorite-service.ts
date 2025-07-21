import { getAuthHeaders, handleApiResponse } from '../api-utils';

// Favorite interface
export interface Favorite {
  id: number;
  user_id: number;
  product_id: number;
  created_at: string;
  product?: {
    id: number;
    name: string;
    price: number;
    brand: string;
    image_url?: string;
  };
}

// Favorites response interface
export interface FavoritesResponse {
  items: Favorite[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Favorite service class
class FavoriteService {
  private baseUrl = '/api/favorite';
  
  // Get user favorites
  async getFavorites(page: number = 1, size: number = 10): Promise<FavoritesResponse> {
    const headers = getAuthHeaders();
    const response = await fetch(`${this.baseUrl}s?page=${page}&size=${size}`, {
      headers
    });
    return handleApiResponse<FavoritesResponse>(response);
  }

  // Add product to favorites
  async addFavorite(data: { user_id: number; product_id: number }): Promise<Favorite> {
    const headers = getAuthHeaders();
    const response = await fetch(`${this.baseUrl}s`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return handleApiResponse<Favorite>(response);
  }

  // Remove product from favorites
  async removeFavorite(id: number): Promise<void> {
    const headers = getAuthHeaders();
    const response = await fetch(`${this.baseUrl}s/${id}`, {
      method: 'DELETE',
      headers
    });
    await handleApiResponse(response);
  }

  // Check if product is in favorites
  async checkFavorite(userId: number, productId: number): Promise<boolean> {
    const headers = getAuthHeaders();
    try {
      const response = await fetch(`${this.baseUrl}s/check?user_id=${userId}&product_id=${productId}`, {
        headers
      });
      const data = await handleApiResponse<{is_favorite: boolean}>(response);
      return data.is_favorite;
    } catch (error) {
      return false;
    }
  }

  // Remove favorite by user and product IDs
  async removeFavoriteByUserAndProduct(userId: number, productId: number): Promise<void> {
    const headers = getAuthHeaders();
    const response = await fetch(`${this.baseUrl}s/user/${userId}/product/${productId}`, {
      method: 'DELETE',
      headers
    });
    await handleApiResponse(response);
  }
}

export const favoriteService = new FavoriteService();