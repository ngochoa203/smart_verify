import { getAuthHeaders, handleApiResponse } from '../api-utils';

// Payment interface
export interface Payment {
  id: number;
  order_id: number;
  method: string;
  transaction_id?: string;
  paid_amount: number;
  status: number; // 0: pending, 1: completed, 2: failed
  paid_at?: string;
  created_at: string;
}

// Payment service class
class PaymentService {
  private baseUrl = '/api/payment';
  
  // Create payment
  async createPayment(data: { order_id: number; method: string; paid_amount: number }): Promise<Payment> {
    const headers = getAuthHeaders();
    const response = await fetch(`${this.baseUrl}s`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return handleApiResponse<Payment>(response);
  }

  // Get payment by order ID
  async getPaymentByOrderId(orderId: number): Promise<Payment> {
    const headers = getAuthHeaders();
    const response = await fetch(`${this.baseUrl}s/order/${orderId}`, {
      headers
    });
    return handleApiResponse<Payment>(response);
  }

  // Process payment (for external payment methods)
  async processPayment(paymentId: number, transactionData: any): Promise<Payment> {
    const headers = getAuthHeaders();
    const response = await fetch(`${this.baseUrl}s/${paymentId}/process`, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(transactionData)
    });
    return handleApiResponse<Payment>(response);
  }
}

export const paymentService = new PaymentService();