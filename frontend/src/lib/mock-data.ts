import { Product, Category, ProductsResponse } from './services/product-service';

export const mockProducts: Product[] = [
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    description: "Flagship smartphone from Apple",
    price: 29990000,
    brand: "Apple",
    category_id: 2,
    seller_id: 1,
    status: true,
    created_at: "2023-06-15T08:30:00Z",
    images: [
      {
        id: 1,
        product_id: 1,
        image_url: "https://placehold.co/600x400/3B82F6/FFFFFF?text=iPhone",
        uploaded_at: "2023-06-15T08:30:00Z"
      }
    ],
    seller: {
      id: 1,
      shop_name: "TechStore Vietnam",
      is_verified: true
    }
  },
  {
    id: 2,
    name: "Samsung Galaxy S24 Ultra",
    description: "Premium Android smartphone",
    price: 26990000,
    brand: "Samsung",
    category_id: 2,
    seller_id: 1,
    status: true,
    created_at: "2023-07-20T10:15:00Z",
    images: [
      {
        id: 2,
        product_id: 2,
        image_url: "https://placehold.co/600x400/3B82F6/FFFFFF?text=Samsung",
        uploaded_at: "2023-07-20T10:15:00Z"
      }
    ],
    seller: {
      id: 1,
      shop_name: "TechStore Vietnam",
      is_verified: true
    }
  },
  {
    id: 3,
    name: "MacBook Pro M3",
    description: "Professional laptop with M3 chip",
    price: 45990000,
    brand: "Apple",
    category_id: 3,
    seller_id: 1,
    status: true,
    created_at: "2023-08-05T14:45:00Z",
    images: [
      {
        id: 3,
        product_id: 3,
        image_url: "https://placehold.co/600x400/3B82F6/FFFFFF?text=MacBook",
        uploaded_at: "2023-08-05T14:45:00Z"
      }
    ],
    seller: {
      id: 1,
      shop_name: "TechStore Vietnam",
      is_verified: true
    }
  },
  {
    id: 4,
    name: "Louis Vuitton Neverfull",
    description: "Luxury handbag",
    price: 35000000,
    brand: "Louis Vuitton",
    category_id: 6,
    seller_id: 2,
    status: true,
    created_at: "2023-09-10T09:20:00Z",
    images: [
      {
        id: 4,
        product_id: 4,
        image_url: "https://placehold.co/600x400/3B82F6/FFFFFF?text=LV",
        uploaded_at: "2023-09-10T09:20:00Z"
      }
    ],
    seller: {
      id: 2,
      shop_name: "Fashion Hub",
      is_verified: true
    }
  }
];

export const mockCategories: Category[] = [
  { id: 1, name: "Electronics", parent_id: null, product_count: 5 },
  { id: 2, name: "Smartphones", parent_id: 1, product_count: 2 },
  { id: 3, name: "Laptops", parent_id: 1, product_count: 2 },
  { id: 4, name: "Fashion", parent_id: null, product_count: 3 },
  { id: 5, name: "Shoes", parent_id: 4, product_count: 2 },
  { id: 6, name: "Bags", parent_id: 4, product_count: 1 },
];

export const mockProductsResponse: ProductsResponse = {
  items: mockProducts,
  total: mockProducts.length,
  page: 1,
  size: mockProducts.length,
  pages: 1
};