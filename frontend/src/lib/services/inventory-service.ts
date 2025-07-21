import { apiRequest } from '../api-utils';

export interface QRCode {
  id: number;
  product_id: number;
  code: string;
  is_verified: boolean;
  blockchain_hash?: string;
  created_at: string;
}

export interface VerificationResult {
  is_authentic: boolean;
  product_id: number;
  product_details?: {
    name: string;
    brand: string;
    category: string;
    image_url: string;
  };
}

export const inventoryService = {
  getProductQRCode: async (productId: number): Promise<QRCode> => {
    return apiRequest<QRCode>(`/api/inventory/products/${productId}/qrcode`);
  },
  
  verifyQRCode: async (code: string): Promise<VerificationResult> => {
    return apiRequest<VerificationResult>(`/api/inventory/verify/qrcode/${code}`);
  },
  
  getBlockchainVerification: async (productId: number): Promise<{ is_verified: boolean; blockchain_hash?: string }> => {
    return apiRequest<{ is_verified: boolean; blockchain_hash?: string }>(`/api/inventory/products/${productId}/blockchain`);
  }
};