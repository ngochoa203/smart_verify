"use client";

import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Shield, Star } from 'lucide-react';
import { Card, CardContent } from './card';
import { Button } from './button';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/lib/store';
import { useToast } from './use-toast';

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  image: string;
  brand?: string;
  rating?: number;
  reviewCount?: number;
  isVerified?: boolean;
  isNew?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
  className?: string;
}

export function ProductCard({
  id,
  name,
  price,
  image,
  brand,
  rating = 0,
  reviewCount = 0,
  isVerified = false,
  isNew = false,
  isFavorite = false,
  onFavoriteToggle,
  className
}: ProductCardProps) {
  const { addItem } = useCartStore();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      id: Date.now(),
      product_id: id,
      name,
      price,
      quantity: 1,
      image
    });
    
    toast({
      title: "Thêm vào giỏ hàng",
      description: "Sản phẩm đã được thêm vào giỏ hàng.",
    });
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle();
    }
  };

  return (
    <Link href={`/products/${id}`}>
      <Card className="product-card h-full overflow-hidden group" hoverable>
        <div className="relative aspect-square overflow-hidden">
          <img
            src={image || `https://placehold.co/600x600/3B82F6/FFFFFF?text=${encodeURIComponent(name.substring(0, 2))}`}
            alt={name}
            className="object-cover w-full h-full transition-transform group-hover:scale-105"
          />
          
          {isVerified && (
            <div className="absolute top-2 right-2">
              <span className="verified-badge">
                <Shield className="h-3 w-3" /> Đã xác thực
              </span>
            </div>
          )}
          
          {isNew && (
            <div className="absolute top-2 left-2">
              <span className="bg-brand-primary text-white text-xs px-2 py-1 rounded-full">
                Mới
              </span>
            </div>
          )}
          
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <Button 
                size="icon" 
                variant="default" 
                className="rounded-full bg-white text-gray-800 hover:bg-white/90 shadow-lg"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
              
              <Button 
                size="icon" 
                variant={isFavorite ? "destructive" : "default"}
                className={`rounded-full ${isFavorite ? 'bg-red-500 hover:bg-red-600' : 'bg-white text-gray-800 hover:bg-white/90'} shadow-lg`}
                onClick={handleFavoriteToggle}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-white' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
        
        <CardContent className="p-4">
          {brand && (
            <div className="text-sm text-gray-500 mb-1">{brand}</div>
          )}
          
          <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-brand-primary transition-colors">{name}</h3>
          
          <div className="flex justify-between items-center">
            <span className="font-bold text-lg">{formatPrice(price)}</span>
            
            {rating > 0 && (
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                <span className="text-sm">{rating.toFixed(1)} ({reviewCount})</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default ProductCard;