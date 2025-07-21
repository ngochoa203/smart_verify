"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Search, Filter, ChevronDown, Grid, List, SlidersHorizontal, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { productService, type Product, type ProductFilters, type Category } from '@/lib/services/product-service';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    size: 12,
    sort_by: 'created_at',
    sort_order: 'desc',
  });
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState([0, 50000000]);
  const [searchQuery, setSearchQuery] = useState('');
  const [brands, setBrands] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.getProducts(filters);
      // Nếu API trả về mảng (không phải object có items/total/pages)
      let items: any[] = [];
      let total = 0;
      let pages = 1;
      if (Array.isArray(response)) {
        items = response;
        total = response.length;
        pages = 1;
      } else {
        items = Array.isArray(response.items) ? response.items : [];
        total = response.total ?? items.length;
        pages = response.pages ?? 1;
      }
      // Map lại product để đảm bảo images, variants luôn là mảng
      const mappedProducts = items.map((p: any) => ({
        ...p,
        images: Array.isArray(p.images) ? p.images : [],
        variants: Array.isArray(p.variants) ? p.variants : [],
      }));
      setProducts(mappedProducts);
      setTotalProducts(total);
      setTotalPages(pages);
      // Extract unique brands
      const uniqueBrands = Array.from(new Set(mappedProducts.map(p => p.brand).filter(Boolean)));
      setBrands(uniqueBrands as string[]);
    } catch (err) {
      setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.');
      console.error('Error fetching products:', err);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const categoriesData = await productService.getCategories();
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      productService.searchProducts(searchQuery, filters)
        .then(response => {
          setProducts(response.items);
          setTotalProducts(response.total);
          setTotalPages(response.pages);
        })
        .catch(err => {
          console.error('Search error:', err);
          toast({
            title: "Lỗi",
            description: "Không thể tìm kiếm sản phẩm. Vui lòng thử lại sau.",
            variant: "destructive",
          });
        });
    } else {
      fetchProducts();
    }
  };

  const handleFilterChange = (newFilters: Partial<ProductFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
    handleFilterChange({ min_price: value[0], max_price: value[1] });
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tất cả sản phẩm</h1>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <form onSubmit={handleSearch} className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="pl-10 pr-4 py-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" size="sm" className="absolute right-1 top-1">
              Tìm
            </Button>
          </form>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden"
            >
              <Filter className="h-4 w-4 mr-2" />
              Bộ lọc
            </Button>
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sắp xếp:</span>
              <select
                className="border rounded-md px-2 py-1 text-sm"
                value={`${filters.sort_by}-${filters.sort_order}`}
                onChange={(e) => {
                  const [sort_by, sort_order] = e.target.value.split('-');
                  handleFilterChange({ sort_by, sort_order: sort_order as 'asc' | 'desc' });
                }}
              >
                <option value="created_at-desc">Mới nhất</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="name-asc">Tên A-Z</option>
                <option value="name-desc">Tên Z-A</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters - Desktop */}
        <div className={`w-full md:w-64 space-y-6 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Bộ lọc</h3>
                <Button variant="ghost" size="sm" onClick={() => setFilters({
                  page: 1,
                  size: 12,
                  sort_by: 'created_at',
                  sort_order: 'desc',
                })}>
                  Đặt lại
                </Button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-medium mb-2">Danh mục</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={filters.category_id === category.id}
                        onCheckedChange={() => 
                          handleFilterChange({ 
                            category_id: filters.category_id === category.id ? undefined : category.id 
                          })
                        }
                      />
                      <label
                        htmlFor={`category-${category.id}`}
                        className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div className="mb-6">
                <h4 className="font-medium mb-2">Thương hiệu</h4>
                <div className="space-y-2">
                  {brands.map((brand) => (
                    <div key={brand} className="flex items-center">
                      <Checkbox
                        id={`brand-${brand}`}
                        checked={filters.brand === brand}
                        onCheckedChange={() => 
                          handleFilterChange({ 
                            brand: filters.brand === brand ? undefined : brand 
                          })
                        }
                      />
                      <label
                        htmlFor={`brand-${brand}`}
                        className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {brand}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="font-medium mb-2">Khoảng giá</h4>
                <div className="px-2">
                  <Slider
                    defaultValue={[0, 50000000]}
                    max={50000000}
                    step={1000000}
                    value={priceRange}
                    onValueChange={handlePriceChange}
                  />
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <span>{formatPrice(priceRange[0])}</span>
                  <span>{formatPrice(priceRange[1])}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
              <Button onClick={fetchProducts} className="mt-4">
                Thử lại
              </Button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Không tìm thấy sản phẩm nào.</p>
            </div>
          ) : (
            <>
              <div className={viewMode === 'grid' ? 
                "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : 
                "space-y-4"
              }>
                {products.map((product) => (
                  <Link href={`/products/${product.id}`} key={product.id}>
                    <Card className={`product-card h-full ${viewMode === 'list' ? 'flex' : ''}`}>
                      <div className={`${viewMode === 'list' ? 'w-1/3' : ''} relative aspect-square overflow-hidden`}>
                        <img
                          src={product.images && product.images.length > 0 
                            ? product.images[0].image_url 
                            : `https://placehold.co/600x400/3B82F6/FFFFFF?text=${encodeURIComponent(product.name.substring(0, 2))}`}
                          alt={product.name}
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute top-2 right-2">
                          <span className="verified-badge">
                            <Shield className="h-3 w-3" /> Đã xác thực
                          </span>
                        </div>
                      </div>
                      <CardContent className={`p-4 ${viewMode === 'list' ? 'w-2/3' : ''}`}>
                        <div className="text-sm text-gray-500 mb-1">{product.brand}</div>
                        <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-lg">{formatPrice(product.price)}</span>
                          <div className="flex items-center">
                            <span className="text-yellow-400 mr-1">★</span>
                            <span className="text-sm">4.8 (124)</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(Math.max(1, filters.page! - 1))}
                      disabled={filters.page === 1}
                    >
                      Trước
                    </Button>
                    {[...Array(totalPages)].map((_, i) => (
                      <Button
                        key={i}
                        variant={filters.page === i + 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(Math.min(totalPages, filters.page! + 1))}
                      disabled={filters.page === totalPages}
                    >
                      Tiếp
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}