"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { getToken } from "@/lib/api-utils";
import { Loader2, Users, ShoppingBag, LayoutGrid } from "lucide-react";
import ProductManagement from "@/components/admin/product-management";
import CategoryManagement from "@/components/admin/category-management";
import UserManagement from "@/components/admin/user-management";
import SellerManagement from "@/components/admin/seller-management";
export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Hàm giải mã JWT (decode payload, không kiểm tra chữ ký)
  function decodeJwt(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login?callbackUrl=/admin/dashboard");
      return;
    }
    const payload = decodeJwt(token);
    if (payload?.user_type === 'admin') {
      setIsAdmin(true);
      setLoading(false);
    } else {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive"
      });
      window.location.href = "/";
    }
  }, [router, toast]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="categories">
            <LayoutGrid className="mr-2 h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="products">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="sellers">
            <Users className="mr-2 h-4 w-4" />
            Sellers
          </TabsTrigger>
        </TabsList>
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Category Management</CardTitle>
              <CardDescription>
                Create, edit, and manage product categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryManagement />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Product Management</CardTitle>
              <CardDescription>
                Manage all products in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductManagement />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage users and admins
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagement />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sellers">
          <Card>
            <CardHeader>
              <CardTitle>Seller Management</CardTitle>
              <CardDescription>
                Manage all sellers in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SellerManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}