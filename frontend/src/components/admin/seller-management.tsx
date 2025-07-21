"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

interface Seller {
  id: number;
  username: string;
  email: string;
  shop_name: string;
  shop_description: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
}

interface SellerPayload {
  username: string;
  email: string;
  password?: string;
  shop_name: string;
  shop_description: string;
  is_verified: boolean;
  is_active: boolean;
}

// Mock seller service
const sellerService = {
  getSellers: async (): Promise<Seller[]> => {
    // In a real implementation, this would call an API
    return [
      {
        id: 1,
        username: "seller1",
        email: "seller1@example.com",
        shop_name: "Tech Store",
        shop_description: "Selling the latest tech gadgets",
        is_verified: true,
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        username: "seller2",
        email: "seller2@example.com",
        shop_name: "Fashion Hub",
        shop_description: "Trendy fashion items",
        is_verified: false,
        is_active: true,
        created_at: new Date().toISOString()
      }
    ];
  },
  
  createSeller: async (data: SellerPayload): Promise<Seller> => {
    // Mock implementation
    return {
      id: Math.floor(Math.random() * 1000) + 1,
      ...data,
      created_at: new Date().toISOString()
    };
  },
  
  updateSeller: async (id: number, data: SellerPayload): Promise<Seller> => {
    // Mock implementation
    return {
      id,
      ...data,
      created_at: new Date().toISOString()
    };
  },
  
  toggleSellerStatus: async (id: number, is_active: boolean): Promise<Seller> => {
    // Mock implementation
    return {
      id,
      username: "seller",
      email: "seller@example.com",
      shop_name: "Shop",
      shop_description: "Description",
      is_verified: true,
      is_active,
      created_at: new Date().toISOString()
    };
  },
  
  toggleSellerVerification: async (id: number, is_verified: boolean): Promise<Seller> => {
    // Mock implementation
    return {
      id,
      username: "seller",
      email: "seller@example.com",
      shop_name: "Shop",
      shop_description: "Description",
      is_verified,
      is_active: true,
      created_at: new Date().toISOString()
    };
  },
  
  deleteSeller: async (id: number): Promise<void> => {
    // Mock implementation
    return;
  }
};

export default function SellerManagement() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSeller, setCurrentSeller] = useState<Seller | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    shop_name: "",
    shop_description: "",
    is_verified: false,
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    setLoading(true);
    try {
      const data = await sellerService.getSellers();
      setSellers(data);
    } catch (error: any) {
      console.error("Error fetching sellers:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to fetch sellers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (seller?: Seller) => {
    if (seller) {
      setIsEditing(true);
      setCurrentSeller(seller);
      setFormData({
        username: seller.username,
        email: seller.email,
        password: "",
        shop_name: seller.shop_name,
        shop_description: seller.shop_description,
        is_verified: seller.is_verified,
        is_active: seller.is_active
      });
    } else {
      setIsEditing(false);
      setCurrentSeller(null);
      setFormData({
        username: "",
        email: "",
        password: "",
        shop_name: "",
        shop_description: "",
        is_verified: false,
        is_active: true
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.username.trim() || !formData.email.trim() || !formData.shop_name.trim()) {
      toast({
        title: "Error",
        description: "Username, email, and shop name are required",
        variant: "destructive",
      });
      return;
    }

    if (!isEditing && !formData.password) {
      toast({
        title: "Error",
        description: "Password is required for new sellers",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload: SellerPayload = {
        username: formData.username,
        email: formData.email,
        password: formData.password || undefined,
        shop_name: formData.shop_name,
        shop_description: formData.shop_description,
        is_verified: formData.is_verified,
        is_active: formData.is_active,
      };
      
      if (isEditing && currentSeller) {
        await sellerService.updateSeller(currentSeller.id, payload);
        toast({
          title: "Success",
          description: "Seller updated successfully",
        });
      } else {
        await sellerService.createSeller(payload);
        toast({
          title: "Success",
          description: "Seller created successfully",
        });
      }
      fetchSellers();
      handleCloseDialog();
    } catch (error: any) {
      console.error("Error saving seller:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to save seller",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (seller: Seller) => {
    try {
      await sellerService.toggleSellerStatus(seller.id, !seller.is_active);
      toast({
        title: "Success",
        description: `Seller ${seller.is_active ? "deactivated" : "activated"} successfully`,
      });
      fetchSellers();
    } catch (error: any) {
      console.error("Error updating seller status:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update seller status",
        variant: "destructive",
      });
    }
  };

  const handleToggleVerification = async (seller: Seller) => {
    try {
      await sellerService.toggleSellerVerification(seller.id, !seller.is_verified);
      toast({
        title: "Success",
        description: `Seller ${seller.is_verified ? "unverified" : "verified"} successfully`,
      });
      fetchSellers();
    } catch (error: any) {
      console.error("Error updating seller verification:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update seller verification",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this seller?")) {
      return;
    }
    try {
      await sellerService.deleteSeller(id);
      toast({
        title: "Success",
        description: "Seller deleted successfully",
      });
      fetchSellers();
    } catch (error: any) {
      console.error("Error deleting seller:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to delete seller",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Sellers</h2>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Add Seller
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
        </div>
      ) : sellers.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No sellers found.</p>
          </CardContent>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Shop Name</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sellers.map((seller) => (
              <TableRow key={seller.id}>
                <TableCell>{seller.id}</TableCell>
                <TableCell>{seller.username}</TableCell>
                <TableCell>{seller.email}</TableCell>
                <TableCell>{seller.shop_name}</TableCell>
                <TableCell>
                  {seller.is_verified ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Verified</Badge>
                  ) : (
                    <Badge variant="outline">Unverified</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {seller.is_active ? (
                    <span className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" /> Active
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600">
                      <XCircle className="h-4 w-4 mr-1" /> Inactive
                    </span>
                  )}
                </TableCell>
                <TableCell>{new Date(seller.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(seller)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleVerification(seller)}
                      className={seller.is_verified ? "text-orange-500" : "text-green-500"}
                    >
                      {seller.is_verified ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(seller)}
                      className={seller.is_active ? "text-red-500" : "text-green-500"}
                    >
                      {seller.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(seller.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Seller" : "Add New Seller"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password {isEditing && "(leave blank to keep current)"}
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={isEditing ? "Leave blank to keep current" : "Enter password"}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="shop_name" className="text-sm font-medium">
                Shop Name
              </label>
              <Input
                id="shop_name"
                name="shop_name"
                value={formData.shop_name}
                onChange={handleChange}
                placeholder="Enter shop name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="shop_description" className="text-sm font-medium">
                Shop Description
              </label>
              <Textarea
                id="shop_description"
                name="shop_description"
                value={formData.shop_description}
                onChange={handleChange}
                placeholder="Enter shop description"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_verified"
                name="is_verified"
                checked={formData.is_verified}
                onChange={(e) => setFormData(prev => ({ ...prev, is_verified: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <label htmlFor="is_verified" className="text-sm font-medium">
                Verified
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <label htmlFor="is_active" className="text-sm font-medium">
                Active
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {isEditing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}