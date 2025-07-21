"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  CreditCard, 
  Truck, 
  MapPin, 
  Phone, 
  User, 
  Mail, 
  ChevronRight, 
  CheckCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCartStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { orderService } from '@/lib/services/order-service';
import { paymentService } from '@/lib/services/payment-service';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    paymentMethod: 'COD',
    notes: ''
  });

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.push('/login?callbackUrl=/checkout');
      return;
    }
    
    // Redirect to cart if cart is empty
    if (items.length === 0 && !orderComplete) {
      router.push('/cart');
    }
    
    // Pre-fill form with user data if authenticated
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      }));
    }
  }, [isAuthenticated, user, items, router, orderComplete]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (value: string) => {
    setFormData(prev => ({ ...prev, paymentMethod: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      toast({
        title: "Chưa đăng nhập",
        description: "Vui lòng đăng nhập để tiếp tục thanh toán.",
        variant: "destructive",
      });
      router.push('/login?callbackUrl=/checkout');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create order object
      const orderData = {
        user_id: user.id,
        items: items.map(item => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          price: item.price
        })),
        shipping_address: {
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city
        },
        payment_method: formData.paymentMethod,
        notes: formData.notes,
        total_amount: getTotal(),
        status: 0 // pending
      };
      
      // Create order
      const order = await orderService.createOrder(orderData);
      
      // Create payment
      const paymentData = {
        order_id: order.id,
        method: formData.paymentMethod,
        paid_amount: getTotal()
      };
      
      await paymentService.createPayment(paymentData);
      
      // Set order ID and show success
      setOrderId(order.id);
      setOrderComplete(true);
      
      // Clear cart
      clearCart();
      
      toast({
        title: "Đặt hàng thành công",
        description: "Đơn hàng của bạn đã được tạo thành công.",
      });
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-green-100 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Đặt hàng thành công!</h1>
          <p className="text-gray-600 mb-6">
            Cảm ơn bạn đã mua sắm tại SmartVerify. Đơn hàng của bạn đã được xác nhận.
          </p>
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <p className="text-gray-700 font-medium">Mã đơn hàng: <span className="font-bold">{orderId}</span></p>
            <p className="text-sm text-gray-500 mt-1">Vui lòng lưu lại mã đơn hàng để theo dõi.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/orders">
              <Button variant="outline">Xem đơn hàng</Button>
            </Link>
            <Link href="/products">
              <Button>Tiếp tục mua sắm</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-brand-primary">Trang chủ</Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <Link href="/cart" className="hover:text-brand-primary">Giỏ hàng</Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="text-gray-900 font-medium">Thanh toán</span>
      </div>
      
      <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5 text-brand-primary" />
                  Thông tin người nhận
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Họ và tên</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Tỉnh/Thành phố</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Địa chỉ</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="mr-2 h-5 w-5 text-brand-primary" />
                  Phương thức vận chuyển
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center p-4 border rounded-md">
                  <div className="flex-1">
                    <h3 className="font-medium">Giao hàng tiêu chuẩn</h3>
                    <p className="text-sm text-gray-500">Nhận hàng trong 3-5 ngày</p>
                  </div>
                  <div className="font-medium">Miễn phí</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5 text-brand-primary" />
                  Phương thức thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={formData.paymentMethod} 
                  onValueChange={handleRadioChange}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2 border p-4 rounded-md">
                    <RadioGroupItem value="COD" id="cod" />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer">
                      <div className="font-medium">Thanh toán khi nhận hàng (COD)</div>
                      <p className="text-sm text-gray-500">Thanh toán bằng tiền mặt khi nhận hàng</p>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 border p-4 rounded-md">
                    <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                    <Label htmlFor="bank_transfer" className="flex-1 cursor-pointer">
                      <div className="font-medium">Chuyển khoản ngân hàng</div>
                      <p className="text-sm text-gray-500">Chuyển khoản trước khi giao hàng</p>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 border p-4 rounded-md">
                    <RadioGroupItem value="Momo" id="momo" />
                    <Label htmlFor="momo" className="flex-1 cursor-pointer">
                      <div className="font-medium">Ví MoMo</div>
                      <p className="text-sm text-gray-500">Thanh toán qua ví điện tử MoMo</p>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Ghi chú đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-md min-h-[100px] focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay địa điểm giao hàng chi tiết"
                ></textarea>
              </CardContent>
            </Card>
          </form>
        </div>
        
        {/* Order Summary */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Tóm tắt đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Products */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.variant?.size && `Size: ${item.variant.size}`}
                        {item.variant?.size && item.variant?.color && ', '}
                        {item.variant?.color && `Màu: ${item.variant.color}`}
                        {(item.variant?.size || item.variant?.color) && ' • '}
                        SL: {item.quantity}
                      </p>
                    </div>
                    <div className="font-medium">{formatPrice(item.price * item.quantity)}</div>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              {/* Subtotal */}
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính</span>
                <span>{formatPrice(getTotal())}</span>
              </div>
              
              {/* Shipping */}
              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển</span>
                <span>Miễn phí</span>
              </div>
              
              <Separator />
              
              {/* Total */}
              <div className="flex justify-between font-medium">
                <span>Tổng cộng</span>
                <span className="text-lg text-brand-primary">{formatPrice(getTotal())}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
                onClick={handleSubmit}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý...
                  </>
                ) : (
                  'Đặt hàng'
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}