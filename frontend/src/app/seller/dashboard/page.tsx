"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import ProductTable from "@/components/seller/product-table";
import CreateProductForm from "@/components/seller/create-product-form";
import { useAuth } from "@/lib/auth-context";
import { getToken } from "@/lib/api-utils";
import { jwtDecode } from "jwt-decode";
import { Loader2 } from "lucide-react";

export default function SellerDashboard() {
  const router = useRouter();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSeller, setIsSeller] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Wait for auth to be initialized
    if (authLoading) {
      return;
    }
    
    // Check if user is authenticated and is a seller
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      window.location.href = "/login?callbackUrl=/seller/dashboard";
      return;
    }
    
    console.log('Checking seller status for user:', user);
    
    // Listen for the custom event to open the dialog
    const handleOpenDialog = () => setIsDialogOpen(true);
    window.addEventListener('open-product-dialog', handleOpenDialog);

    const checkSellerStatus = async () => {
      try {
        // Check if user object or token has seller/admin role
        let role: string | undefined = undefined;
        if (user && (user.role === 'seller' || user.role === 'admin')) {
          setIsSeller(true);
          setLoading(false);
          return;
        }
        const token = getToken();
        if (token) {
          try {
            const decoded: any = jwtDecode(token);
            role = decoded.role || decoded.user_type;
          } catch (err) {
            console.error('Error decoding token:', err);
          }
        }
        if (role === 'seller' || role === 'admin') {
          setIsSeller(true);
          setLoading(false);
          return;
        }
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the seller dashboard.",
          variant: "destructive"
        });
      } catch (error) {
        console.error("Error checking seller status:", error);
        toast({
          title: "Error",
          description: "Could not verify seller status. Please try again later.",
          variant: "destructive"
        });
        window.location.href = "/";
      } finally {
        setLoading(false);
      }
    };

    checkSellerStatus();
    
    // Clean up event listener
    return () => {
      window.removeEventListener('open-product-dialog', handleOpenDialog);
    };
  }, [isAuthenticated, router, toast, user, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  if (!isSeller) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Seller Dashboard</h1>
      
      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Product Management</CardTitle>
                <CardDescription>
                  Manage your products, edit details, and control inventory
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProductTable />
              </CardContent>
            </Card>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-500">Active Products</p>
                      <p className="text-2xl font-bold text-brand-primary">12</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-500">Total Sales</p>
                      <p className="text-2xl font-bold text-brand-secondary">32</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Button 
                className="w-full" 
                onClick={() => setIsDialogOpen(true)}
              >
                Create New Product
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
              <CardDescription>
                View and manage customer orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Order management features will be available soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                View your store performance and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Analytics features will be available soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Create Product Dialog using Dialog component */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-11/12 max-w-5xl">
          <DialogHeader>
            <DialogTitle>Create New Product</DialogTitle>
          </DialogHeader>
          <CreateProductForm onSuccess={() => {
            setIsDialogOpen(false);
            toast({
              title: "Success",
              description: "Product created successfully",
            });
          }} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}