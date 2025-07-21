"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Chuyển hướng nếu đã đăng nhập hoặc vừa đăng ký
  useEffect(() => {
    if (isAuthenticated) {
      let token = '';
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('token') || '';
      }
      const payload = decodeJwt(token);
      const userType = payload?.user_type || payload?.role || '';
      // Luôn chuyển hướng dựa vào userType trong token
      if (userType === 'admin') {
        window.location.href = '/admin/dashboard';
      } else if (userType === 'seller') {
        window.location.href = '/seller/dashboard';
      } else {
        const callbackUrl = searchParams.get('callbackUrl');
        window.location.href = callbackUrl || '/';
      }
    }
    const registered = searchParams.get('registered');
    if (registered) {
      toast({
        title: "Đăng ký thành công",
        description: "Vui lòng đăng nhập với tài khoản mới của bạn.",
      });
    }
  }, [isAuthenticated, searchParams, toast]);

  // Hàm giải mã JWT (decode payload, không kiểm tra chữ ký)
  function decodeJwt(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(emailOrUsername, password);
      // Lấy access_token từ localStorage
      let token = '';
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('token') || '';
      }
      const payload = decodeJwt(token);
      const userType = payload?.user_type || payload?.role || '';
      // Điều hướng theo role
      if (userType === 'admin') {
        window.location.href = '/admin/dashboard';
      } else if (userType === 'seller') {
        window.location.href = '/seller/dashboard';
      } else {
        const callbackUrl = searchParams.get('callbackUrl');
        window.location.href = callbackUrl || '/';
      }
    } catch (err: any) {
      setError('Đăng nhập thất bại. Vui lòng kiểm tra email/username và mật khẩu.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-1 flex flex-col items-center pb-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="bg-brand-primary/10 p-2 rounded-full">
              <Shield className="h-8 w-8 text-brand-primary" />
            </div>
            <span className="text-2xl font-bold">Smart<span className="text-brand-primary">Verify</span></span>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Đăng nhập</CardTitle>
          <CardDescription className="text-center">
            Nhập thông tin đăng nhập của bạn để tiếp tục
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="emailOrUsername">Email hoặc Username</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="emailOrUsername"
                  type="text"
                  placeholder="Email hoặc Username"
                  className="pl-10"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Bạn có thể đăng nhập bằng email hoặc username</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="password">Mật khẩu</Label>
                <Link href="/forgot-password" className="text-sm text-brand-primary hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Nhập bất kỳ mật khẩu nào cho tài khoản demo</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
            <div className="text-center text-sm">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="text-brand-primary hover:underline font-medium">
                Đăng ký ngay
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}