"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  Loader2,
  ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { orderService, type Order } from '@/lib/services/order-service';
import { useAuthStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.push('/login?callbackUrl=/orders');
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      try {
        // In a real implementation, you would call your order API here
        // const response = await orderService.getOrders();
        // setOrders(response.items);
        
        // For demo, create some mock orders
        const mockOrders: Order[] = [
          {
            id: 1001,
            user_id: user?.id || 1,
            total_amount: 29990000,
            status: 2, // completed
            created_at: '2023-06-15T08:30:00Z',
            items: [
              {
                product_id: 1,
                quantity: 1,
                price: 29990000
              }
            ],
            shipping_address: {
              full_name: user?.username || 'Nguyễn Văn A',
              email: user?.email || 'user@example.com',
              phone: '0901234567',
              address: '123 Đường ABC',
              city: 'TP. Hồ Chí Minh'
            },
            payment_method: 'cod'
          },
          {
            id: 1002,
            user_id: user?.id || 1,
            total_amount: 45990000,
            status: 1, // shipped
            created_at: '2023-07-20T10:15:00Z',
            items: [
              {
                product_id: 3,
                quantity: 1,
                price: 45990000
              }
            ],
            shipping_address: {
              full_name: user?.username || 'Nguyễn Văn A',
              email: user?.email || 'user@example.com',
              phone: '0901234567',
              address: '123 Đường ABC',
              city: 'TP. Hồ Chí Minh'
            },
            payment_method: 'bank_transfer'
          },
          {
            id: 1003,
            user_id: user?.id || 1,
            total_amount: 26990000,
            status: 0, // pending
            created_at: '2023-08-05T14:45:00Z',
            items: [
              {
                product_id: 2,
                quantity: 1,
                price: 26990000
              }
            ],
            shipping_address: {
              full_name: user?.username || 'Nguyễn Văn A',
              email: user?.email || 'user@example.com',
              phone: '0901234567',
              address: '123 Đường ABC',
              city: 'TP. Hồ Chí Minh'
            },
            payment_method: 'momo'
          }
        ];
        
        setOrders(mockOrders);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, router, user]);

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Đang xử lý</Badge>;
      case 1:
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Đang giao hàng</Badge>;
      case 2:
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Hoàn thành</Badge>;
      case 3:
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Đã hủy</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 0:
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Package className="h-5 w-5 text-blue-500" />;
      case 2:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 3:
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="bg-gray-100 p-6 rounded-full">
            <ShoppingBag className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold">Bạn chưa có đơn hàng nào</h2>
          <p className="text-gray-500 max-w-md">
            Hãy khám phá các sản phẩm của chúng tôi và đặt hàng ngay.
          </p>
          <Link href="/products">
            <Button>
              Mua sắm ngay
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
        <span className="text-gray-900 font-medium">Đơn hàng của tôi</span>
      </div>
      
      <h1 className="text-3xl font-bold mb-8">Đơn hàng của tôi</h1>
      
      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardHeader className="bg-gray-50 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Đơn hàng #{order.id}</CardTitle>
              {getStatusBadge(order.status)}
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div className="flex items-center mb-2 md:mb-0">
                  {getStatusIcon(order.status)}
                  <span className="ml-2 text-gray-700">
                    {order.status === 0 && 'Đơn hàng đang được xử lý'}
                    {order.status === 1 && 'Đơn hàng đang được giao'}
                    {order.status === 2 && 'Đơn hàng đã hoàn thành'}
                    {order.status === 3 && 'Đơn hàng đã bị hủy'}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Ngày đặt: {formatDate(order.created_at)}
                </div>
              </div>
              
              <div className="border-t border-b py-4 my-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2">
                    <div>
                      <span className="font-medium">Sản phẩm #{item.product_id}</span>
                      <span className="text-gray-500 ml-2">x{item.quantity}</span>
                    </div>
                    <div className="font-medium">{formatPrice(item.price * item.quantity)}</div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Phương thức thanh toán: {order.payment_method === 'cod' ? 'Thanh toán khi nhận hàng' : 
                                          order.payment_method === 'bank_transfer' ? 'Chuyển khoản ngân hàng' : 
                                          order.payment_method === 'momo' ? 'Ví MoMo' : order.payment_method}
                </div>
                <div className="font-bold text-lg">{formatPrice(order.total_amount)}</div>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 flex justify-between">
              <Link href={`/orders/${order.id}`}>
                <Button variant="outline">Chi tiết</Button>
              </Link>
              {order.status === 0 && (
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                  Hủy đơn hàng
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}