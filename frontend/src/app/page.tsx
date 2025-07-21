"use client";

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Shield, Search, TrendingUp, CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { productService, type Product } from '@/lib/services/product-service'
import { formatPrice } from '@/lib/utils'
import ErrorBoundary from '@/components/error-boundary'
import Loading from '@/components/ui/loading'
import ErrorMessage from '@/components/ui/error-message'

function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<{id: number, name: string, icon: string, count: number}[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Icons for categories
  const categoryIcons: Record<string, string> = {
    'Điện thoại': '📱',
    'Laptop': '💻',
    'Thời trang': '👕',
    'Đồng hồ': '⌚',
    'Giày dép': '👟',
    'Túi xách': '👜',
    'default': '📦'
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Lấy sản phẩm nổi bật từ API thật
        const productsResponse = await productService.getProducts({
          sort_by: 'created_at',
          sort_order: 'desc',
          size: 4
        })
        let items: any[] = [];
        if (Array.isArray(productsResponse)) {
          items = productsResponse;
        } else if (Array.isArray(productsResponse?.items)) {
          items = productsResponse.items;
        }
        setFeaturedProducts(items)

        // Lấy danh mục thật từ API
        const categoriesResponse = await productService.getCategories()
        setCategories(Array.isArray(categoriesResponse)
          ? categoriesResponse.map((category: any) => ({
              id: category.id,
              name: category.name,
              icon: categoryIcons[category.name] || categoryIcons.default,
              count: category.product_count || 0
            }))
          : [])
      } catch (err) {
        setFeaturedProducts([])
        setCategories([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-gradient text-white py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Mua sắm an toàn với công nghệ xác thực AI
              </h1>
              <p className="text-lg md:text-xl opacity-90">
                SmartVerify giúp bạn mua sắm với sự an tâm tuyệt đối nhờ công nghệ xác thực sản phẩm bằng AI và blockchain.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <Button size="lg" variant="default" className="bg-white text-brand-primary hover:bg-gray-100">
                    Mua sắm ngay
                  </Button>
                </Link>
                <Link href="/verify">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    Xác thực sản phẩm
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <img 
                src="https://placehold.co/600x400/3B82F6/FFFFFF?text=SmartVerify" 
                alt="SmartVerify" 
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Tại sao chọn SmartVerify?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Chúng tôi kết hợp công nghệ AI và blockchain để mang đến trải nghiệm mua sắm an toàn và đáng tin cậy nhất.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-brand-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Xác thực sản phẩm</h3>
              <p className="text-gray-600">
                Công nghệ AI phân tích và xác thực sản phẩm, giúp phát hiện hàng giả, hàng nhái.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-brand-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Đảm bảo chất lượng</h3>
              <p className="text-gray-600">
                Tất cả sản phẩm đều được kiểm tra và xác nhận chất lượng trước khi đến tay khách hàng.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-brand-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Truy xuất nguồn gốc</h3>
              <p className="text-gray-600">
                Blockchain giúp bạn truy xuất nguồn gốc sản phẩm từ nhà sản xuất đến tay người tiêu dùng.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Mua sắm an toàn</h3>
              <p className="text-gray-600">
                Thanh toán an toàn và bảo mật với nhiều phương thức thanh toán khác nhau.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Sản phẩm nổi bật</h2>
            <Link href="/products" className="text-brand-primary flex items-center hover:underline">
              Xem tất cả <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <Loading text="Đang tải sản phẩm..." />
          ) : error ? (
            <ErrorMessage 
              message={error} 
              retryAction={() => window.location.reload()} 
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts && featuredProducts.length > 0 ? featuredProducts.map((product) => (
                <Link href={`/products/${product.id}`} key={product.id}>
                  <Card className="product-card h-full">
                    <div className="relative aspect-square overflow-hidden">
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
                    <CardContent className="p-4">
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
              )) : (
                <div className="col-span-4 text-center py-8">
                  <p className="text-gray-500">Không có sản phẩm nào.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Khám phá danh mục</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Tìm kiếm sản phẩm theo danh mục yêu thích của bạn
            </p>
          </div>

          {loading ? (
            <Loading text="Đang tải danh mục..." />
          ) : error ? (
            <ErrorMessage 
              message={error} 
              retryAction={() => window.location.reload()} 
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories && categories.length > 0 ? categories.map((category) => (
                <Link href={`/categories/${category.id}`} key={category.id}>
                  <div className="category-card bg-white p-6 rounded-lg shadow-sm text-center hover:shadow-md transition-all">
                    <div className="text-4xl mb-2">{category.icon}</div>
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.count} sản phẩm</p>
                  </div>
                </Link>
              )) : (
                <div className="col-span-6 text-center py-8">
                  <p className="text-gray-500">Không có danh mục nào.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Verification CTA */}
      <section className="py-16 bg-brand-light">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <img 
                src="https://placehold.co/600x400/10B981/FFFFFF?text=Xác+thực+sản+phẩm" 
                alt="Xác thực sản phẩm" 
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Xác thực sản phẩm của bạn</h2>
              <p className="text-lg">
                Bạn đã mua sản phẩm từ nơi khác? Hãy sử dụng công nghệ AI của chúng tôi để xác thực tính chính hãng của sản phẩm.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-brand-secondary mr-2" />
                  <span>Quét mã QR hoặc tải ảnh sản phẩm lên</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-brand-secondary mr-2" />
                  <span>AI phân tích và đối chiếu với cơ sở dữ liệu</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-brand-secondary mr-2" />
                  <span>Nhận kết quả xác thực chính xác trong vài giây</span>
                </li>
              </ul>
              <Link href="/verify">
                <Button variant="brand" size="lg">
                  Xác thực ngay
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Khách hàng nói gì về chúng tôi</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Trải nghiệm mua sắm an toàn và đáng tin cậy từ khách hàng của SmartVerify
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 mr-4"></div>
                <div>
                  <h4 className="font-semibold">Nguyễn Văn A</h4>
                  <div className="text-yellow-400">★★★★★</div>
                </div>
              </div>
              <p className="text-gray-600">
                "Tôi đã mua một chiếc đồng hồ Rolex và sử dụng tính năng xác thực của SmartVerify. Thật tuyệt vời khi biết rằng sản phẩm tôi mua là chính hãng 100%."
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 mr-4"></div>
                <div>
                  <h4 className="font-semibold">Trần Thị B</h4>
                  <div className="text-yellow-400">★★★★★</div>
                </div>
              </div>
              <p className="text-gray-600">
                "Tôi là một người bán hàng trên SmartVerify. Công nghệ xác thực giúp tôi xây dựng niềm tin với khách hàng và tăng doanh số bán hàng đáng kể."
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 mr-4"></div>
                <div>
                  <h4 className="font-semibold">Lê Văn C</h4>
                  <div className="text-yellow-400">★★★★★</div>
                </div>
              </div>
              <p className="text-gray-600">
                "Giao diện dễ sử dụng, thanh toán an toàn và đặc biệt là tính năng xác thực sản phẩm thực sự hữu ích. Tôi sẽ tiếp tục mua sắm trên SmartVerify."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Download App CTA */}
      <section className="py-16 bg-brand-primary text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Tải ứng dụng SmartVerify</h2>
              <p className="text-lg opacity-90">
                Trải nghiệm mua sắm và xác thực sản phẩm mọi lúc, mọi nơi với ứng dụng di động của chúng tôi.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="default" size="lg" className="bg-white text-brand-primary hover:bg-gray-100">
                  <img src="/images/app-store.svg" alt="App Store" className="h-6 mr-2" />
                  App Store
                </Button>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  <img src="/images/google-play.svg" alt="Google Play" className="h-6 mr-2" />
                  Google Play
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <img 
                src="https://placehold.co/300x600/FFFFFF/3B82F6?text=App+Preview" 
                alt="SmartVerify App" 
                className="mx-auto h-96"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function Home() {
  return (
    <ErrorBoundary>
      <HomePage />
    </ErrorBoundary>
  );
}