// Centralized API base URL builder for all services

export const API_BASES = {
  auth: `${process.env.NEXT_PUBLIC_API_BASE_URL}:${process.env.NEXT_PUBLIC_AUTH_API_PORT}`,
  product: `${process.env.NEXT_PUBLIC_API_BASE_URL}:${process.env.NEXT_PUBLIC_PRODUCT_API_PORT}`,
  inventory: `${process.env.NEXT_PUBLIC_API_BASE_URL}:${process.env.NEXT_PUBLIC_INVENTORY_API_PORT}`,
  order: `${process.env.NEXT_PUBLIC_API_BASE_URL}:${process.env.NEXT_PUBLIC_ORDER_API_PORT}`,
  payment: `${process.env.NEXT_PUBLIC_API_BASE_URL}:${process.env.NEXT_PUBLIC_PAYMENT_API_PORT}`,
  review: `${process.env.NEXT_PUBLIC_API_BASE_URL}:${process.env.NEXT_PUBLIC_REVIEW_API_PORT}`,
  favorite: `${process.env.NEXT_PUBLIC_API_BASE_URL}:${process.env.NEXT_PUBLIC_FAVORITE_API_PORT}`,
  ai: `${process.env.NEXT_PUBLIC_API_BASE_URL}:${process.env.NEXT_PUBLIC_AI_API_PORT}`,
};

export function getApiBase(service: keyof typeof API_BASES) {
  return API_BASES[service];
}

