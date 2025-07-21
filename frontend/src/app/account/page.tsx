"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Package, 
  Heart, 
  LogOut, 
  ChevronRight,
  Loader2,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/lib/store';
import { authService } from '@/lib/services/auth-service';

export default function AccountPage() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileUpdated, setProfileUpdated] = useState(false);
  
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    phone: '',
    address: '',
    avatar_url: ''
  });

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.push('/login?callbackUrl=/account');
      return;
    }

    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        // In a real implementation, you would call your auth API here
        // const profile = await authService.getProfile();
        
        // For demo, use the user data from auth store
        if (user) {
          setProfileData({
            username: user.username || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || '',
            avatar_url: user.avatar_url || ''
          });
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [isAuthenticated, router, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // In a real implementation, you would call your auth API here
      // await authService.updateProfile(profileData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProfileUpdated(true);
      setTimeout(() => setProfileUpdated(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  // Determine if user is admin or seller
  const isAdminOrSeller = user && (user.role === 'admin' || user.role === 'seller');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-brand-primary">Trang chủ</Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="text-gray-900 font-medium">Tài khoản</span>
      </div>

      <h1 className="text-3xl font-bold mb-8">Tài khoản của tôi</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="flex flex-row items-center">
              <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center mr-4">
                <User className="h-6 w-6 text-brand-primary" />
              </div>
              <div>
                <CardTitle>{profileData.username}</CardTitle>
                <p className="text-sm text-gray-500">{profileData.email}</p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {isAdminOrSeller ? (
                  <>
                    <Link href="/dashboard" className="flex items-center px-4 py-3 text-brand-primary bg-brand-light/50 border-l-4 border-brand-primary">
                      <User className="h-5 w-5 mr-3" />
                      Dashboard
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center px-4 py-3 text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/account" className="flex items-center px-4 py-3 text-brand-primary bg-brand-light/50 border-l-4 border-brand-primary">
                      <User className="h-5 w-5 mr-3" />
                      Thông tin tài khoản
                    </Link>
                    <Link href="/orders" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50">
                      <Package className="h-5 w-5 mr-3" />
                      Đơn hàng của tôi
                    </Link>
                    <Link href="/favorites" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50">
                      <Heart className="h-5 w-5 mr-3" />
                      Sản phẩm yêu thích
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center px-4 py-3 text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      Đăng xuất
                    </button>
                  </>
                )}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="profile">
            <TabsList className="mb-6">
              <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
              <TabsTrigger value="security">Bảo mật</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <form onSubmit={handleSubmit}>
                  <CardHeader>
                    <CardTitle>Thông tin cá nhân</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profileUpdated && (
                      <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                        Thông tin cá nhân đã được cập nhật thành công.
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="username">Tên đăng nhập</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="username"
                          name="username"
                          className="pl-10"
                          value={profileData.username}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          className="pl-10"
                          value={profileData.email}
                          onChange={handleChange}
                          required
                          readOnly
                        />
                      </div>
                      <p className="text-xs text-gray-500">Email không thể thay đổi.</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          name="phone"
                          className="pl-10"
                          value={profileData.phone}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Địa chỉ</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="address"
                          name="address"
                          className="pl-10"
                          value={profileData.address}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang lưu...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" /> Lưu thay đổi
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Bảo mật</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
                    <Input id="current-password" type="password" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">Mật khẩu mới</Label>
                    <Input id="new-password" type="password" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Đổi mật khẩu</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}