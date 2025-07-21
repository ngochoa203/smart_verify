"use client";

import axios from 'axios';

// Create API instances for each service
export const authApi = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}:${process.env.NEXT_PUBLIC_AUTH_API_PORT}/api/v1`,
});

export const productApi = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}:${process.env.NEXT_PUBLIC_PRODUCT_API_PORT}/api/v1`,
});

export const inventoryApi = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}:${process.env.NEXT_PUBLIC_INVENTORY_API_PORT}/api/v1`,
});

export const orderApi = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}:${process.env.NEXT_PUBLIC_ORDER_API_PORT}/api/v1`,
});

export const paymentApi = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}:${process.env.NEXT_PUBLIC_PAYMENT_API_PORT}/api/v1`,
});

export const reviewApi = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}:${process.env.NEXT_PUBLIC_REVIEW_API_PORT}/api/v1`,
});

export const favoriteApi = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}:${process.env.NEXT_PUBLIC_FAVORITE_API_PORT}/api/v1`,
});

export const aiApi = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}:${process.env.NEXT_PUBLIC_AI_API_PORT}/api/v1`,
});

// Add request interceptor for authentication
const addAuthInterceptor = (apiInstance: any) => {
  apiInstance.interceptors.request.use(
    (config: any) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: any) => Promise.reject(error)
  );
};

// Add auth interceptor to all API instances
[authApi, productApi, inventoryApi, orderApi, paymentApi, reviewApi, favoriteApi, aiApi].forEach(
  addAuthInterceptor
);