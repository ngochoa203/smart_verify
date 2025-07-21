import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function generateImagePlaceholder(text: string): string {
  // Simple placeholder image URL based on text
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(text)}&background=random`
}

export function getDiscountPercentage(originalPrice: number, salePrice: number): number {
  if (originalPrice <= 0) return 0
  const discount = ((originalPrice - salePrice) / originalPrice) * 100
  return Math.round(discount)
}