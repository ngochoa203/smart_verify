import { getAuthHeaders, handleApiResponse } from '../api-utils';
import { getApiBase } from '../api-base';

// Review interface
export interface Review {
  id: number;
  user_id: number;
  product_id: number;
  content: string;
  rating: number;
  sentiment?: number;
  created_at: string;
  user?: {
    username: string;
    avatar_url?: string;
  };
}

// Rating summary interface
export interface RatingSummary {
  average_sentiment: number;
  average_rating: number;
  comment_count: number;
}

// Reviews response interface
export interface ReviewsResponse {
  items: Review[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

class ReviewService {
  private baseUrl = `${getApiBase("review")}/api/v1/reviews`;

  // Get reviews for a product
  async getProductReviews(productId: number, page: number = 1, size: number = 10): Promise<ReviewsResponse> {
    const response = await fetch(`${this.baseUrl}s?product_id=${productId}&page=${page}&size=${size}`);
    return handleApiResponse<ReviewsResponse>(response);
  }

  // Get rating summary for a product
  async getProductRating(productId: number): Promise<RatingSummary> {
    const response = await fetch(`${this.baseUrl}s/rating/${productId}`);
    return handleApiResponse<RatingSummary>(response);
  }

  // Create a review
  async createReview(data: { product_id: number; content: string; rating: number }): Promise<Review> {
    const headers = getAuthHeaders();
    const response = await fetch(`${this.baseUrl}s`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return handleApiResponse<Review>(response);
  }

  // Update a review
  async updateReview(id: number, data: { content?: string; rating?: number }): Promise<Review> {
    const headers = getAuthHeaders();
    const response = await fetch(`${this.baseUrl}s/${id}`, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return handleApiResponse<Review>(response);
  }

  // Delete a review
  async deleteReview(id: number): Promise<void> {
    const headers = getAuthHeaders();
    const response = await fetch(`${this.baseUrl}s/${id}`, {
      method: 'DELETE',
      headers
    });
    await handleApiResponse(response);
  }
}

export const reviewService = new ReviewService();