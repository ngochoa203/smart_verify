import { getAuthHeaders, handleApiResponse } from '../api-utils';

// Order interface
export interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  status: number; // 0: pending, 1: shipped, 2: completed, 3: cancelled
  created_at: string;
  items: OrderItem[];
  shipping_address: ShippingAddress;
  payment_method: string;
  notes?: string;
}

// Order item interface
export interface OrderItem {
  product_id: number;
  variant_id?: number;
  quantity: number;
  price: number;
  product?: {
    name: string;
    image_url?: string;
  };
}

// Shipping address interface
export interface ShippingAddress {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
}

// Orders response interface
export interface OrdersResponse {
  items: Order[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Order service class
class OrderService {
  private baseUrl = '/api/order';
  
  // Get user orders
  async getOrders(page: number = 1, size: number = 10): Promise<OrdersResponse> {
    const headers = getAuthHeaders();
    const response = await fetch(`${this.baseUrl}s?page=${page}&size=${size}`, {
      headers
    });
    return handleApiResponse<OrdersResponse>(response);
  }

  // Get order by ID
  async getOrderById(id: number): Promise<Order> {
    const headers = getAuthHeaders();
    const response = await fetch(`${this.baseUrl}s/${id}`, {
      headers
    });
    return handleApiResponse<Order>(response);
  }

  // Create order
  async createOrder(data: any): Promise<Order> {
    const headers = getAuthHeaders();
    const response = await fetch(`${this.baseUrl}s`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return handleApiResponse<Order>(response);
  }

  // Cancel order
  async cancelOrder(id: number): Promise<Order> {
    const headers = getAuthHeaders();
    const response = await fetch(`${this.baseUrl}s/${id}/cancel`, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    return handleApiResponse<Order>(response);
  }
}

export const orderService = new OrderService();