import { getAuthHeaders, handleApiResponse } from '../api-utils';
import { getApiBase } from '../api-base';

// Verification result interface
export interface VerificationResult {
  product_id?: number;
  is_authentic: boolean;
  confidence: number;
  risk_score: number;
  blockchain_verified: boolean;
  features_used: string[];
  ai_analysis: {
    visual_match: number;
    material_analysis: number;
    pattern_recognition: number;
    logo_verification: number;
  };
  product_details?: {
    name: string;
    brand: string;
    category: string;
    image_url: string;
  };
}

// Risk score interface
export interface RiskScore {
  score: number;
  confidence: number;
}

// AI service class

class AIService {
  private baseUrl = `${getApiBase('ai')}/api/ai`;

  // Verify product by QR code
  async verifyByQR(qrCode: string): Promise<VerificationResult> {
    const response = await fetch(`${this.baseUrl}/verify/qr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ qr_code: qrCode })
    });
    return handleApiResponse<VerificationResult>(response);
  }

  // Verify product by image
  async verifyByImage(image: File): Promise<VerificationResult> {
    const formData = new FormData();
    formData.append('image', image);

    const response = await fetch(`${this.baseUrl}/verify/image`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        // 'Content-Type' should NOT be set for FormData
      },
      body: formData
    });
    return handleApiResponse<VerificationResult>(response);
  }

  // Get risk score for a product
  async getRiskScore(productId: number): Promise<RiskScore> {
    const response = await fetch(`${this.baseUrl}/risk-score/${productId}`, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      }
    });
    return handleApiResponse<RiskScore>(response);
  }
}

export const aiService = new AIService();