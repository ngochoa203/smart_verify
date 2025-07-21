"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { cartService } from '@/lib/services/cart-service';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [syncingCart, setSyncingCart] = useState(false);
  const { toast } = useToast();
  
  // Sync cart with backend when user is authenticated
  useEffect(() => {
    const syncCartWithBackend = async () => {
      if (!isAuthenticated || !user) return;
      
      setSyncingCart(true);
      try {
        // Get user's cart from backend
        const userCart = await cartService.getUserCart(user.id);
        
        // TODO: Implement cart syncing logic
        // This would involve comparing local cart with backend cart
        // and reconciling differences
        
      } catch (error) {
        console.error('Error syncing cart:', error);
      } finally {
        setSyncingCart(false);
      }
    };
    
    syncCartWithBackend();
  }, [isAuthenticated, user]);
  
  const handleRemoveItem = async (id: number | string) => {
    removeItem(id);
    
    // If authenticated, also remove from backend
    if (isAuthenticated && user) {
      try {
        // Note: This assumes the id in the local cart matches the backend id
        // In a real implementation, you might need to map between them
        await cartService.removeFromCart(Number(id));
      } catch (error) {
        console.error('Error removing item from cart:', error);
        toast({
          title: "Lỗi",
          description: "Không thể xóa sản phẩm khỏi giỏ hàng. Vui lòng thử lại sau.",
          variant: "destructive",
        });
      }
    }
  };
  
  const handleUpdateQuantity = async (id: number | string, newQuantity: number) => {
    updateQuantity(id, newQuantity);
    
    // If authenticated, also update in backend
    if (isAuthenticated && user) {
      try {
        await cartService.updateCartItem(Number(id), { quantity: newQuantity });
      } catch (error) {
        console.error('Error updating cart item quantity:', error);
      }
    }
  };
  
  const handleClearCart = async () => {
    clearCart();
    
    // If authenticated, also clear in backend
    if (isAuthenticated && user) {
      try {
        await cartService.clearCart(user.id);
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    }
  };
  
  if (loading || syncingCart) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    );
  }
  
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="bg-gray-100 p-6 rounded-full">
            <ShoppingBag className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold">Giỏ hàng của bạn đang trống</h2>
          <p className="text-gray-500 max-w-md">
            Có vẻ như bạn chưa thêm bất kỳ sản phẩm nào vào giỏ hàng.
          </p>
          <Link href="/products">
            <Button>
              Tiếp tục mua sắm
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Giỏ hàng</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="px-6">
              <div className="flex justify-between items-center">
                <CardTitle>Sản phẩm ({items.length})</CardTitle>
                <Button variant="ghost" size="sm" onClick={handleClearCart} className="text-red-500">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa tất cả
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-6">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center py-4 border-b last:border-0">
                    <div className="h-20 w-20 bg-gray-100 rounded-md overflow-hidden mr-4">
                      <img
                        src={item.image || `https://placehold.co/200x200/3B82F6/FFFFFF?text=${encodeURIComponent(item.name.substring(0, 2))}`}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <Link href={`/products/${item.product_id}`}>
                        <h3 className="font-medium hover:text-brand-primary">{item.name}</h3>
                      </Link>
                      {item.variant && (
                        <p className="text-sm text-gray-500">
                          {item.variant.size && `Size: ${item.variant.size}`}
                          {item.variant.size && item.variant.color && ', '}
                          {item.variant.color && `Màu: ${item.variant.color}`}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border rounded-md">
                          <button
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                            onClick={() => handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-4 py-1">{item.quantity}</span>
                          <button
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium mr-4">{formatPrice(item.price * item.quantity)}</span>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Tóm tắt đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính</span>
                <span>{formatPrice(getTotal())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển</span>
                <span>Miễn phí</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Tổng cộng</span>
                <span className="text-lg">{formatPrice(getTotal())}</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Link href="/checkout" className="w-full">
                <Button className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" /> Thanh toán
                </Button>
              </Link>
              <Link href="/products" className="w-full">
                <Button variant="outline" className="w-full">
                  <ArrowRight className="mr-2 h-4 w-4" /> Tiếp tục mua sắm
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}