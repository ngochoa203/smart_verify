"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Define the form schema with Zod
const productSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive("Price must be positive"),
  category_id: z.string().min(1, "Please select a category"),
  brand: z.string().min(1, "Brand is required"),
  inventory: z.coerce.number().int().nonnegative("Inventory must be 0 or higher"),
  variants: z.array(
    z.object({
      size: z.string().optional(),
      color: z.string().optional(),
      price: z.coerce.number().positive("Variant price must be positive"),
      inventory: z.coerce.number().int().nonnegative("Variant inventory must be 0 or higher"),
    })
  ).optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface CreateProductFormProps {
  onSuccess: () => void;
}

export default function CreateProductForm({ onSuccess }: CreateProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [variants, setVariants] = useState<{size?: string, color?: string, price: number, inventory: number}[]>([]);
  const { toast } = useToast();
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category_id: "",
      brand: "",
      inventory: 0,
      variants: [],
    },
  });

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await (await import("@/lib/services/product-service")).productService.getCategories();
        setCategories(categoriesData.map(cat => ({
          id: cat.id.toString(),
          name: cat.name
        })));
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      
      // Kiểm tra kích thước và loại file
      const validFiles = newFiles.filter(file => {
        // Kiểm tra loại file (chỉ chấp nhận ảnh)
        const isImage = file.type.startsWith('image/');
        
        // Kiểm tra kích thước (giới hạn 5MB)
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
        
        if (!isImage) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not an image file`,
            variant: "destructive",
          });
        }
        
        if (!isValidSize) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds 5MB limit`,
            variant: "destructive",
          });
        }
        
        return isImage && isValidSize;
      });
      
      // Giới hạn số lượng ảnh (tối đa 5 ảnh)
      const totalImages = images.length + validFiles.length;
      if (totalImages > 5) {
        toast({
          title: "Too many images",
          description: "Maximum 5 images allowed",
          variant: "destructive",
        });
        const allowedNewFiles = validFiles.slice(0, 5 - images.length);
        setImages([...images, ...allowedNewFiles]);
        
        // Create preview URLs
        const newUrls = allowedNewFiles.map(file => URL.createObjectURL(file));
        setImageUrls([...imageUrls, ...newUrls]);
      } else {
        setImages([...images, ...validFiles]);
        
        // Create preview URLs
        const newUrls = validFiles.map(file => URL.createObjectURL(file));
        setImageUrls([...imageUrls, ...newUrls]);
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    const newUrls = [...imageUrls];
    
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(newUrls[index]);
    
    newImages.splice(index, 1);
    newUrls.splice(index, 1);
    
    setImages(newImages);
    setImageUrls(newUrls);
  };

  const addVariant = () => {
    setVariants([...variants, { price: 0, inventory: 0 }]);
  };

  const removeVariant = (index: number) => {
    const newVariants = [...variants];
    newVariants.splice(index, 1);
    setVariants(newVariants);
  };

  const updateVariant = (index: number, field: string, value: string | number) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const onSubmit = async (data: ProductFormValues) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("price", data.price.toString());
      formData.append("category_id", data.category_id);
      formData.append("brand", data.brand);
      formData.append("seller_id", "1"); // Thêm seller_id (sẽ được thay thế bằng ID thực từ auth)
      formData.append("inventory", data.inventory.toString());
      if (variants.length > 0) {
        formData.append("variants", JSON.stringify(variants));
      }
      
      // Thêm từng ảnh vào formData với tên file
      images.forEach((image, index) => {
        // Đảm bảo tên file là duy nhất để tránh xung đột
        const fileName = `${Date.now()}_${index}_${image.name.replace(/\s+/g, '_')}`;
        formData.append("images", image, fileName);
      });
      
      const response = await (await import("@/lib/services/seller-product-service")).sellerProductService.createProduct(formData);
      
      toast({
        title: "Success",
        description: "Product created successfully with images uploaded to S3",
        variant: "default",
      });
      
      form.reset();
      setImages([]);
      setImageUrls([]);
      setVariants([]);
      onSuccess();
    } catch (error) {
      console.error("Error creating product:", error);
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (VND)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="1000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="inventory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inventory</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter brand name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter product description" 
                      className="min-h-[120px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="space-y-6">
            {/* Image Upload */}
            <div>
              <FormLabel>Product Images</FormLabel>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square border rounded-md overflow-hidden">
                    <img 
                      src={url} 
                      alt={`Product preview ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs py-1 text-center">
                        Main Image
                      </div>
                    )}
                  </div>
                ))}
                
                {images.length < 5 && (
                  <label className="aspect-square border border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                    <Plus className="h-6 w-6 text-gray-400" />
                    <span className="text-sm text-gray-500 mt-1">Add Image</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageChange}
                      multiple
                    />
                  </label>
                )}
              </div>
              <FormDescription className="mt-2">
                Upload up to 5 images (max 5MB each). First image will be the main product image.
              </FormDescription>
              <div className="text-xs text-gray-500 mt-1">
                {images.length} of 5 images added
              </div>
            </div>
            
            {/* Variants */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <FormLabel>Product Variants (Optional)</FormLabel>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addVariant}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Variant
                </Button>
              </div>
              
              {variants.length === 0 ? (
                <p className="text-sm text-gray-500">No variants added yet.</p>
              ) : (
                <div className="space-y-3">
                  {variants.map((variant, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium">Variant {index + 1}</h4>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeVariant(index)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <FormLabel className="text-xs">Size</FormLabel>
                            <Input 
                              placeholder="e.g. S, M, L, XL" 
                              value={variant.size || ''}
                              onChange={(e) => updateVariant(index, 'size', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <FormLabel className="text-xs">Color</FormLabel>
                            <Input 
                              placeholder="e.g. Red, Blue" 
                              value={variant.color || ''}
                              onChange={(e) => updateVariant(index, 'color', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <FormLabel className="text-xs">Price</FormLabel>
                            <Input 
                              type="number" 
                              min="0" 
                              step="1000"
                              value={variant.price}
                              onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value))}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <FormLabel className="text-xs">Inventory</FormLabel>
                            <Input 
                              type="number" 
                              min="0" 
                              step="1"
                              value={variant.inventory}
                              onChange={(e) => updateVariant(index, 'inventory', parseInt(e.target.value))}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
              </>
            ) : (
              'Create Product'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}