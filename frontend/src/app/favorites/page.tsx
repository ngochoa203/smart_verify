"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Heart, 
  Trash2, 
  ChevronRight, 
  Loader2,
  ShoppingCart,
  ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { favoriteService, type Favorite } from '@/lib/services/favorite-service';
import { useAuthStore, useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';

export default function FavoritesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.push('/login?callbackUrl=/favorites');
      return;
    }

    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const response = await favoriteService.getFavorites();
        setFavorites(response.items);
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setError('Không thể tải danh sách yêu thích. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [isAuthenticated, router]);

  const handleRemoveFavorite = async (id: number) => {
    try {
      await favoriteService.removeFavorite(id);
      setFavorites(favorites.filter(fav => fav.id !== id));
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  };

  const handleAddToCart = (favorite: Favorite) => {
    if (!favorite.product) return;
    
    addItem({
      id: Date.now(),
      product_id: favorite.product.id,
      name: favorite.product.name,
      price: favorite.product.price,
      quantity: 1,
      image: favorite.product.image_url || `https://placehold.co/200x200/3B82F6/FFFFFF?text=${encodeURIComponent(favorite.product.name.substring(0, 2))}`
    });
    
    router.push('/cart');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Thử lại</Button>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="bg-gray-100 p-6 rounded-full">
            <Heart className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold">Danh sách yêu thích trống</h2>
          <p className="text-gray-500 max-w-md">
            Bạn chưa thêm sản phẩm nào vào danh sách yêu thích.
          </p>
          <Link href="/products">
            <Button>
              Khám phá sản phẩm
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-brand-primary">Trang chủ</Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="text-gray-900 font-medium">Sản phẩm yêu thích</span>
      </div>
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Sản phẩm yêu thích</h1>
        <span className="text-gray-500">{favorites.length} sản phẩm</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {favorites.map((favorite) => (
          <Card key={favorite.id} className="relative group">
            <button
              onClick={() => handleRemoveFavorite(favorite.id)}
              className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
              aria-label="Remove from favorites"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </button>
            
            <Link href={`/products/${favorite.product_id}`}>
              <div className="aspect-square overflow-hidden">
                <img
                  src={favorite.product?.image_url || `https://placehold.co/600x400/3B82F6/FFFFFF?text=${encodeURIComponent((favorite.product?.name || 'Product').substring(0, 2))}`}
                  alt={favorite.product?.name || 'Product'}
                  className="object-cover w-full h-full transition-transform group-hover:scale-105"
                />
              </div>
            </Link>
            
            <CardContent className="p-4">
              <Link href={`/products/${favorite.product_id}`}>
                <div className="text-sm text-gray-500 mb-1">{favorite.product?.brand}</div>
                <h3 className="font-semibold mb-2 line-clamp-2">{favorite.product?.name}</h3>
                <div className="font-bold text-lg mb-4">{formatPrice(favorite.product?.price || 0)}</div>
              </Link>
              
              <Button 
                variant="default" 
                className="w-full"
                onClick={() => handleAddToCart(favorite)}
              >
                <ShoppingCart className="mr-2 h-4 w-4" /> Thêm vào giỏ
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}