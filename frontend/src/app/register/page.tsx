"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Mail, Lock, User, Phone, MapPin, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth-context';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';


// Zod schema cho user
const userSchema = z.object({
  username: z.string().min(3, 'Tên đăng nhập tối thiểu 3 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(['user', 'seller']),
});

const sellerExtraSchema = z.object({
  shop_name: z.string().min(3, 'Tên shop tối thiểu 3 ký tự'),
  shop_description: z.string().min(10, 'Mô tả tối thiểu 10 ký tự'),
  logo_url: z.string().optional(),
});

type UserFormValues = z.infer<typeof userSchema>;
type SellerExtraFormValues = z.infer<typeof sellerExtraSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState<'user' | 'seller'>('user');

  // User form
  const [formData, setFormData] = useState<UserFormValues>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    role: 'user',
  });

  // Seller extra form
  const [sellerData, setSellerData] = useState<SellerExtraFormValues>({
    shop_name: '',
    shop_description: '',
    logo_url: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'role') {
      setRole(value as 'user' | 'seller');
      setFormData(prev => ({ ...prev, role: value as 'user' | 'seller' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSellerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSellerData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu không khớp. Vui lòng kiểm tra lại.');
      return;
    }

    // Validate user form
    const userParse = userSchema.safeParse(formData);
    if (!userParse.success) {
      setError(userParse.error.errors[0].message);
      return;
    }

    // Nếu là seller thì validate thêm seller form
    if (role === 'seller') {
      const sellerParse = sellerExtraSchema.safeParse(sellerData);
      if (!sellerParse.success) {
        setError(sellerParse.error.errors[0].message);
        return;
      }
    }

    setIsLoading(true);

    try {
      const { username, email, password, phone, address } = formData;
      if (role === 'seller') {
        // Không gửi user_type, backend sẽ tự set
        const payload = {
          username,
          email,
          password,
          phone,
          shop_name: sellerData.shop_name,
          shop_description: sellerData.shop_description,
          logo_url: sellerData.logo_url || '',
        };
        await register(payload);
        router.push('/login?registered=true');
        toast({
          title: 'Đăng ký người bán thành công',
          description: 'Vui lòng đăng nhập với tài khoản mới của bạn.',
        });
      } else {
        await register({ username, email, password, phone, address });
        router.push('/login?registered=true');
        toast({
          title: 'Đăng ký thành công',
          description: 'Vui lòng đăng nhập với tài khoản mới của bạn.',
        });
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        JSON.stringify(err.response?.data) ||
        'Đăng ký thất bại. Vui lòng thử lại.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="h-8 w-8 text-brand-primary" />
            <span className="text-2xl font-bold">Smart<span className="text-brand-primary">Verify</span></span>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Đăng ký tài khoản</CardTitle>
          <CardDescription className="text-center">
            Tạo tài khoản để mua sắm và xác thực sản phẩm
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  name="username"
                  placeholder="username"
                  className="pl-10"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@example.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {/* Phone: chỉ hiển thị nếu là user */}
            {role === 'user' && (
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại (tùy chọn)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="0901234567"
                    className="pl-10"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}
            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ (tùy chọn)</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="address"
                  name="address"
                  placeholder="123 Đường ABC, Quận XYZ, TP. HCM"
                  className="pl-10"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>
            {/* Role select */}
            <div className="space-y-2">
              <Label htmlFor="role">Đăng ký với vai trò</Label>
              <select
                id="role"
                name="role"
                className="w-full p-2 border rounded-md"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="user">Người dùng</option>
                <option value="seller">Người bán</option>
              </select>
              <p className="text-xs text-gray-500">
                {role === 'seller'
                  ? 'Bạn sẽ cần cung cấp thêm thông tin về cửa hàng bên dưới'
                  : 'Người dùng có thể mua sắm và xác thực sản phẩm'}
              </p>
            </div>
            {/* Seller extra form */}
            {role === 'seller' && (
              <div className="space-y-2 border-t pt-4 mt-4">
                <Label className="font-semibold">Thông tin cửa hàng</Label>
                <div className="space-y-2">
                  <Label htmlFor="shop_name">Tên shop</Label>
                  <Input
                    id="shop_name"
                    name="shop_name"
                    placeholder="Tên shop"
                    className="pl-3"
                    value={sellerData.shop_name}
                    onChange={handleSellerChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại shop</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="Số điện thoại shop"
                      className="pl-10"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
            <div className="space-y-2">
              <Label htmlFor="shop_description">Mô tả shop</Label>
              <Textarea
                id="shop_description"
                name="shop_description"
                placeholder="Mô tả về shop và sản phẩm bạn bán"
                className="pl-3 min-h-[80px]"
                value={sellerData.shop_description}
                onChange={handleSellerChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo_url">Logo shop (URL, tuỳ chọn)</Label>
              <Input
                id="logo_url"
                name="logo_url"
                placeholder="https://example.com/logo.png"
                className="pl-3"
                value={sellerData.logo_url}
                onChange={handleSellerChange}
              />
            </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
            </Button>
            <div className="text-center text-sm">
              Đã có tài khoản?{' '}
              <Link href="/login" className="text-brand-primary hover:underline">
                Đăng nhập
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}