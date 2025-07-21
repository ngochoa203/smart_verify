"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  Star, 
  ShoppingCart, 
  Heart, 
  Share2, 
  ChevronRight, 
  Truck, 
  RotateCcw, 
  CheckCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { productService, type ProductWithDetails } from '@/lib/services/product-service';
import { reviewService } from '@/lib/services/review-service';
import { favoriteService } from '@/lib/services/favorite-service';
import { aiService } from '@/lib/services/ai-service';
import { useCartStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface ProductPageProps {
  params: {
    id: string
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  const productId = parseInt(params.id);
  const [product, setProduct] = useState<ProductWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [rating, setRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [addingToFavorites, setAddingToFavorites] = useState(false);
  const [riskScore, setRiskScore] = useState<number | null>(null);
  
  const { addItem } = useCartStore();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchProduct();
    fetchProductRating();
    fetchRiskScore();
    
    if (isAuthenticated && user) {
      checkFavorite();
    }
  }, [productId, isAuthenticated, user]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const data = await productService.getProductById(productId);
      setProduct(data);
      
      // Set default variant if available
      if (data.variants && data.variants.length > 0) {
        setSelectedVariant(data.variants[0].id);
      }
      
      // Set default color if available
      if (data.variants && data.variants.length > 0 && data.variants[0].color) {
        setSelectedColor(data.variants[0].color);
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.');
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProductRating = async () => {
    try {
      const ratingData = await reviewService.getProductRating(productId);
      setRating(ratingData.average_sentiment);
      setReviewCount(ratingData.comment_count);
    } catch (err) {
      console.error('Error fetching product rating:', err);
    }
  };

  const fetchRiskScore = async () => {
    try {
      const riskData = await aiService.getRiskScore(productId);
      setRiskScore(riskData.score);
    } catch (err) {
      console.error('Error fetching risk score:', err);
    }
  };

  const checkFavorite = async () => {
    if (!user) return;
    
    try {
      const isFav = await favoriteService.checkFavorite(user.id, productId);
      setIsFavorite(isFav);
    } catch (err) {
      console.error('Error checking favorite status:', err);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    const selectedVariantData = product.variants?.find(v => v.id === selectedVariant);
    const price = selectedVariantData ? selectedVariantData.price || product.price : product.price;
    
    addItem({
      id: Date.now(), // Generate a unique ID for the cart item
      product_id: product.id,
      variant_id: selectedVariant || undefined,
      name: product.name,
      price: price,
      quantity: quantity,
      image: product.images && product.images.length > 0 
        ? product.images[0].image_url 
        : `https://placehold.co/600x400/3B82F6/FFFFFF?text=${encodeURIComponent(product.name.substring(0, 2))}`,
      variant: selectedVariant ? {
        size: selectedVariantData?.size,
        color: selectedVariantData?.color
      } : undefined
    });
    
    toast({
      title: "Thêm vào giỏ hàng",
      description: "Sản phẩm đã được thêm vào giỏ hàng.",
    });
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Chưa đăng nhập",
        description: "Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích.",
        variant: "destructive",
      });
      return;
    }
    
    if (!user) return;
    
    setAddingToFavorites(true);
    try {
      if (isFavorite) {
        await favoriteService.removeFavoriteByUserAndProduct(user.id, productId);
        setIsFavorite(false);
        toast({
          title: "Đã xóa khỏi yêu thích",
          description: "Sản phẩm đã được xóa khỏi danh sách yêu thích.",
        });
      } else {
        await favoriteService.addFavorite({
          user_id: user.id,
          product_id: productId
        });
        setIsFavorite(true);
        toast({
          title: "Đã thêm vào yêu thích",
          description: "Sản phẩm đã được thêm vào danh sách yêu thích.",
        });
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      toast({
        title: "Lỗi",
        description: "Không thể thực hiện thao tác. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setAddingToFavorites(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Không thể tải sản phẩm</h2>
        <p className="text-gray-500 mb-4">{error || 'Đã xảy ra lỗi khi tải thông tin sản phẩm.'}</p>
        <Button onClick={() => window.location.reload()}>Thử lại</Button>
      </div>
    );
  }

  const productImages = product.images && product.images.length > 0 
    ? product.images.map(img => img.image_url) 
    : [`https://placehold.co/600x600/3B82F6/FFFFFF?text=${encodeURIComponent(product.name.substring(0, 2))}`];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-brand-primary">Trang chủ</Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <Link href="/products" className="hover:text-brand-primary">Sản phẩm</Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        {product.category && (
          <>
            <Link href={`/categories/${product.category_id}`} className="hover:text-brand-primary">
              {product.category.name}
            </Link>
            <ChevronRight className="h-4 w-4 mx-1" />
          </>
        )}
        <span className="text-gray-900 font-medium">{product.name}</span>
      </div>

      {/* Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg border">
            <img
              src={productImages[activeImage]}
              alt={product.name}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {productImages.map((image, index) => (
              <div
                key={index}
                className={`aspect-square overflow-hidden rounded-md border cursor-pointer ${
                  index === activeImage ? 'ring-2 ring-brand-primary' : ''
                }`}
                onClick={() => setActiveImage(index)}
              >
                <img
                  src={image}
                  alt={`${product.name} - Ảnh ${index + 1}`}
                  className="object-cover w-full h-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <Link href={`/brands/${product.brand}`} className="text-gray-500 hover:text-brand-primary text-sm">
                {product.brand}
              </Link>
              {riskScore !== null && riskScore < 0.3 && (
                <span className="verified-badge ml-2">
                  <Shield className="h-3 w-3" /> Đã xác thực
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center mb-4">
              <div className="flex items-center text-yellow-400 mr-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.floor(rating || 0) * 5 ? 'fill-current' : 'fill-none'}`}
                  />
                ))}
              </div>
              <span className="text-gray-500">
                {rating ? (rating * 5).toFixed(1) : 'N/A'} ({reviewCount} đánh giá)
              </span>
              <span className="mx-2">•</span>
              <span className="text-gray-500">Đã bán 1.2k+</span>
            </div>
            <div className="mb-4">
              <span className="text-3xl font-bold text-brand-primary">
                {formatPrice(product.price)}
              </span>
            </div>
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Phiên bản</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    className={`px-4 py-2 border rounded-md ${
                      selectedVariant === variant.id
                        ? 'border-brand-primary bg-brand-light text-brand-primary'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setSelectedVariant(variant.id)}
                  >
                    {variant.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors */}
          {product.variants && product.variants.some(v => v.color) && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Màu sắc</h3>
              <div className="flex flex-wrap gap-3">
                {Array.from(new Set(product.variants.map(v => v.color))).map((color, index) => (
                  <button
                    key={index}
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      selectedColor === color ? 'ring-2 ring-brand-primary ring-offset-2' : ''
                    }`}
                    style={{ backgroundColor: color === 'Black' ? '#000' : 
                                            color === 'White' ? '#fff' : 
                                            color === 'Red' ? '#f00' : '#ccc' }}
                    title={color}
                    onClick={() => setSelectedColor(color ?? null)}
                  >
                    {selectedColor === color && (
                      <CheckCircle className="h-5 w-5 text-white" />
                    )}
                  </button>
                ))}
              </div>
              {selectedColor && (
                <p className="text-sm text-gray-500 mt-2">Đã chọn: {selectedColor}</p>
              )}
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Số lượng</h3>
            <div className="flex items-center">
              <button
                className="w-10 h-10 border border-gray-300 rounded-l-md flex items-center justify-center"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 h-10 border-t border-b border-gray-300 text-center"
              />
              <button
                className="w-10 h-10 border border-gray-300 rounded-r-md flex items-center justify-center"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </button>
              <span className="ml-3 text-sm text-gray-500">
                Còn {product.variants?.find(v => v.id === selectedVariant)?.quantity || 'nhiều'} sản phẩm
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Button variant="brand" size="lg" className="flex-1" onClick={handleAddToCart}>
              <ShoppingCart className="mr-2 h-5 w-5" /> Thêm vào giỏ hàng
            </Button>
            <Link href="/checkout" className="flex-1">
              <Button variant="outline" size="lg" className="w-full">
                Mua ngay
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="icon" 
              className={`w-12 h-12 ${isFavorite ? 'text-red-500' : ''}`}
              onClick={handleToggleFavorite}
              disabled={addingToFavorites}
            >
              {addingToFavorites ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
              )}
            </Button>
            <Button variant="outline" size="icon" className="w-12 h-12">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Seller Info */}
          <div className="border rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                <div>
                  <h3 className="font-medium">{product.seller?.shop_name || 'Người bán'}</h3>
                  <div className="flex items-center text-sm">
                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                    <span>4.9</span>
                    {product.seller?.is_verified && (
                      <span className="verified-badge ml-2 text-xs">
                        <Shield className="h-3 w-3" /> Đã xác thực
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Xem shop
              </Button>
            </div>
          </div>

          {/* Shipping & Returns */}
          <div className="border rounded-lg p-4 mb-6">
            <div className="flex items-start mb-3">
              <Truck className="h-5 w-5 text-brand-primary mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium">Miễn phí vận chuyển</h3>
                <p className="text-sm text-gray-500">Cho đơn hàng từ 500.000đ</p>
              </div>
            </div>
            <div className="flex items-start">
              <RotateCcw className="h-5 w-5 text-brand-primary mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium">Đổi trả trong 30 ngày</h3>
                <p className="text-sm text-gray-500">Nếu sản phẩm có lỗi từ nhà sản xuất</p>
              </div>
            </div>
          </div>

          {/* Verification Info */}
          {riskScore !== null && riskScore < 0.3 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <Shield className="h-6 w-6 text-green-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-medium text-green-800">Sản phẩm đã được xác thực</h3>
                  <p className="text-sm text-green-700 mb-2">
                    Sản phẩm này đã được xác thực bởi SmartVerify với độ tin cậy {Math.round((1 - (riskScore || 0)) * 100)}%.
                  </p>
                  <Link href={`/verify/${product.id}`}>
                    <Button variant="outline" size="sm" className="text-green-700 border-green-300 hover:bg-green-100">
                      Xem chi tiết xác thực
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Description & Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Mô tả sản phẩm</h2>
          <div className="prose max-w-none">
            <p>{product.description}</p>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Thông số kỹ thuật</h2>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <tbody>
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">Thương hiệu</td>
                  <td className="px-4 py-3 text-sm">{product.brand}</td>
                </tr>
                <tr className="bg-white">
                  <td className="px-4 py-3 text-sm font-medium">Danh mục</td>
                  <td className="px-4 py-3 text-sm">{product.category?.name || 'Chưa phân loại'}</td>
                </tr>
                {product.variants && product.variants.length > 0 && (
                  <tr className="bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">Phiên bản</td>
                    <td className="px-4 py-3 text-sm">
                      {product.variants.map(v => v.size).join(', ')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Sản phẩm liên quan</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((id) => (
            <Link href={`/products/${id}`} key={id}>
              <Card className="product-card h-full">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={`https://placehold.co/600x600/${id % 2 === 0 ? '3B82F6' : '10B981'}/FFFFFF?text=Product+${id}`}
                    alt={`Related Product ${id}`}
                    className="object-cover w-full h-full"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2">Sản phẩm liên quan {id}</h3>
                  <span className="font-bold">{formatPrice(product.price * (0.8 + id * 0.1))}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}