// Category create/update payload
export interface CategoryPayload {
  name: string;
  parent_id?: number | null;
}
import { getAuthHeaders, handleApiResponse } from '../api-utils';
import { getApiBase } from '../api-base';

// Product interface
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  brand: string;
  category_id: number;
  seller_id: number;
  images?: ProductImage[];
  variants?: ProductVariant[];
  category?: Category;
  seller?: Seller;
  status?: boolean;
}

// Product with details interface
export interface ProductWithDetails extends Product {
  category?: Category;
  seller?: Seller;
}

// Product image interface
export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  is_primary?: boolean;
}

// Product variant interface
export interface ProductVariant {
  id: number;
  product_id: number;
  size?: string;
  color?: string;
  quantity: number;
  price: number;
}

// Category interface
export interface Category {
  id: number;
  name: string;
  parent_id?: number | null;
  product_count?: number;
}

// Seller interface
export interface Seller {
  id: number;
  shop_name: string;
  is_verified: boolean;
}

// Product filters interface
export interface ProductFilters {
  page?: number;
  size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  category_id?: number;
  brand?: string;
  min_price?: number;
  max_price?: number;
  search?: string;
}

// Product response interface
export interface ProductsResponse {
  items: Product[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Product service class
class ProductService {
  // Admin: Create category
  async createCategory(data: CategoryPayload): Promise<Category> {
    const headers = {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    };
    const apiBase = getApiBase('product');
    const response = await fetch(`${apiBase}/api/v1/categories`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return handleApiResponse<Category>(response);
  }

  // Admin: Update category
  async updateCategory(id: number, data: CategoryPayload): Promise<Category> {
    const headers = {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    };
    const apiBase = getApiBase('product');
    const response = await fetch(`${apiBase}/api/v1/categories/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    return handleApiResponse<Category>(response);
  }

  // Admin: Delete category
  async deleteCategory(id: number): Promise<any> {
    const headers = getAuthHeaders();
    const apiBase = getApiBase('product');
    const response = await fetch(`${apiBase}/api/v1/admin/categories/${id}`, {
      method: 'DELETE',
      headers,
    });
    return handleApiResponse(response);
  }
  private baseUrl = `${getApiBase("product")}/api/v1/products`;
  
  // Get products with filters
  async getProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    const apiBase = getApiBase('product');
    const response = await fetch(`${apiBase}/api/v1/products?${queryParams.toString()}`);
    return handleApiResponse<ProductsResponse>(response);
  }

  // Get product by ID
  async getProductById(id: number): Promise<ProductWithDetails> {
    const apiBase = getApiBase('product');
    const response = await fetch(`${apiBase}/api/v1/products/${id}`);
    return handleApiResponse<ProductWithDetails>(response);
  }

  // Get categories
  async getCategories(): Promise<Category[]> {
    const apiBase = getApiBase("product");
    const response = await fetch(`${apiBase}/api/v1/categories`);
    return handleApiResponse<Category[]>(response);
  }

  // Search products
  async searchProducts(query: string, filters: ProductFilters = {}): Promise<ProductsResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('search', query);
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'search') {
        queryParams.append(key, value.toString());
      }
    });
    const apiBase = getApiBase('product');
    const response = await fetch(`${apiBase}/api/v1/products/search?${queryParams.toString()}`);
    return handleApiResponse<ProductsResponse>(response);
  }
  
  // Admin: Get all products
  async getAllProducts(): Promise<Product[]> {
    const headers = getAuthHeaders();
    const apiBase = getApiBase('product');
    const response = await fetch(`${apiBase}/api/v1/products`, {
      headers
    });
    return handleApiResponse<Product[]>(response);
  }
  
  // Admin: Update product status
  async updateProductStatus(id: number, status: boolean): Promise<any> {
    const headers = getAuthHeaders();
    const apiBase = getApiBase('product');
    const response = await fetch(`${apiBase}/api/v1/admin/products/${id}/status`, {
      method: 'PATCH',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    return handleApiResponse(response);
  }
  
  // Admin: Delete product
  async deleteProduct(id: number): Promise<any> {
    const headers = getAuthHeaders();
    const apiBase = getApiBase('product');
    const response = await fetch(`${apiBase}/api/v1/admin/products/${id}`, {
      method: 'DELETE',
      headers
    });
    return handleApiResponse(response);
  }
}

export const productService = new ProductService();