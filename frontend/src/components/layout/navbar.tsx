"use client";

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, ShoppingCart, Heart, User, Menu, X, Shield, Bell, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { useCartStore } from '@/lib/store'
import { useAuth } from '@/lib/auth-context'
import { jwtDecode } from 'jwt-decode'
import { useRouter, usePathname } from 'next/navigation'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  // Get user_type from token in localStorage (or sessionStorage)
  const [userType, setUserType] = useState<string | null>(null)
  useEffect(() => {
    let token = null
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token') || sessionStorage.getItem('token')
    }
    if (token) {
      try {
        const decoded: any = jwtDecode(token)
        setUserType(decoded.role || decoded.user_type || null)
      } catch (e) {
        setUserType(null)
      }
    } else {
      setUserType(null)
    }
  }, [isAuthenticated])
  const { items, getTotalItems } = useCartStore()
  const [cartCount, setCartCount] = useState(0)
  const router = useRouter()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setCartCount(getTotalItems())
  }, [items, getTotalItems])

  // Close mobile menu when path changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
  }
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true
    if (path !== '/' && pathname.startsWith(path)) return true
    return false
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1960px]">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-brand-primary" />
              <span className="text-xl font-bold">Smart<span className="text-brand-primary">Verify</span></span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className={`nav-link text-sm font-medium transition-colors ${isActive('/') ? 'text-brand-primary' : 'hover:text-brand-primary'}`}>
              Trang chủ
            </Link>
            <Link href="/products" className={`nav-link text-sm font-medium transition-colors ${isActive('/products') ? 'text-brand-primary' : 'hover:text-brand-primary'}`}>
              Sản phẩm
            </Link>
            <Link href="/categories" className={`nav-link text-sm font-medium transition-colors ${isActive('/categories') ? 'text-brand-primary' : 'hover:text-brand-primary'}`}>
              Danh mục
            </Link>
            <Link href="/flash-sale" className={`nav-link text-sm font-medium transition-colors ${isActive('/flash-sale') ? 'text-brand-primary' : 'hover:text-brand-primary'}`}>
              Flash Sale
            </Link>
            <Link href="/verify" className={`nav-link text-sm font-medium transition-colors ${isActive('/verify') ? 'text-brand-primary' : 'hover:text-brand-primary'}`}>
              Xác thực
            </Link>
          </nav>

          {/* Search and User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative w-80">
              <div className="flex items-center bg-white border border-gray-200 rounded-full shadow-sm focus-within:ring-2 focus-within:ring-brand-primary transition-all">
                <span className="pl-4 text-gray-400">
                  <Search className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-sm focus:ring-0 rounded-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button type="submit" size="sm" className="rounded-full bg-brand-primary text-white font-semibold px-5 py-2 mr-2 hover:bg-brand-primary/90 transition-all shadow-none">
                  Tìm
                </Button>
              </div>
            </form>
            
            <Link href="/cart">
              <Button variant="ghost" size="icon" className={`relative hover:bg-gray-100 ${isActive('/cart') ? 'bg-gray-100' : ''}`}>
                <ShoppingCart className={`h-5 w-5 ${isActive('/cart') ? 'text-brand-primary' : ''}`} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary text-[10px] font-medium text-white">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
            
            <Link href="/favorites">
              <Button variant="ghost" size="icon" className={`hover:bg-gray-100 ${isActive('/favorites') ? 'bg-gray-100' : ''}`}>
                <Heart className={`h-5 w-5 ${isActive('/favorites') ? 'text-brand-primary' : ''}`} />
              </Button>
            </Link>
            
            <Link href="/notifications">
              <Button variant="ghost" size="icon" className={`relative hover:bg-gray-100 ${isActive('/notifications') ? 'bg-gray-100' : ''}`}> 
                <Bell className={`h-5 w-5 ${isActive('/notifications') ? 'text-brand-primary' : ''}`} />
              </Button>
            </Link>
            
            <ThemeToggle />
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                {(userType === 'seller' || userType === 'admin') && (
                  <Link href={userType === 'admin' ? '/admin/dashboard' : '/seller/dashboard'}>
                    <Button variant="default" size="sm" className={userType === 'admin' ? "bg-red-600 text-white hover:bg-red-700" : "bg-brand-primary text-white hover:bg-brand-primary/90"}>
                      {userType === 'admin' ? 'Quản trị' : 'Kênh người bán'}
                    </Button>
                  </Link>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className={`rounded-full ${isActive('/account') ? 'bg-brand-primary text-white' : 'bg-brand-light hover:bg-brand-light/80'}`}>
                      <User className={`h-5 w-5 ${isActive('/account') ? 'text-white' : 'text-brand-primary'}`} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user?.username}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {(userType === 'admin' || userType === 'seller') ? (
                      <>
                        <DropdownMenuItem asChild>
                          <Link
                            href={userType === 'admin' ? '/admin/dashboard' : '/seller/dashboard'}
                            className="cursor-pointer flex items-center font-semibold text-brand-primary"
                          >
                            <Shield className="mr-2 h-4 w-4 text-brand-primary" />
                            {userType === 'admin' ? 'Quản trị hệ thống' : 'Kênh người bán'}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                          <LogOut className="mr-2 h-4 w-4" />
                          Đăng xuất
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/account" className="cursor-pointer">
                            Tài khoản
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/orders" className="cursor-pointer">
                            Đơn hàng
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/favorites" className="cursor-pointer">
                            Yêu thích
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                          <LogOut className="mr-2 h-4 w-4" />
                          Đăng xuất
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">Đăng nhập</Button>
                </Link>
                <Link href="/register">
                  <Button variant="brand" size="sm">Đăng ký</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <Link href="/cart" className="relative mr-1">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary text-[10px] font-medium text-white">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
            
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white">
          <div className="p-4">
            <form onSubmit={handleSearch} className="relative mb-4">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Button type="submit" size="sm" className="absolute right-1 top-1 h-6 rounded-full px-2 text-xs">
                Tìm
              </Button>
            </form>
            
            <div className="space-y-1">
              <Link href="/" className={`block py-2 text-base font-medium ${isActive('/') ? 'text-brand-primary' : 'hover:text-brand-primary'}`}>
                Trang chủ
              </Link>
              <Link href="/products" className={`block py-2 text-base font-medium ${isActive('/products') ? 'text-brand-primary' : 'hover:text-brand-primary'}`}>
                Sản phẩm
              </Link>
              <Link href="/categories" className={`block py-2 text-base font-medium ${isActive('/categories') ? 'text-brand-primary' : 'hover:text-brand-primary'}`}>
                Danh mục
              </Link>
              <Link href="/flash-sale" className={`block py-2 text-base font-medium ${isActive('/flash-sale') ? 'text-brand-primary' : 'hover:text-brand-primary'}`}>
                Flash Sale
              </Link>
              <Link href="/verify" className={`block py-2 text-base font-medium ${isActive('/verify') ? 'text-brand-primary' : 'hover:text-brand-primary'}`}>
                Xác thực
              </Link>
            </div>
            
            <div className="pt-4 pb-3 border-t border-gray-200 mt-4">
              {isAuthenticated ? (
                <div>
                  <div className="flex items-center px-4 mb-4">
                    <div className="flex-shrink-0 bg-brand-light rounded-full p-2">
                      <User className="h-6 w-6 text-brand-primary" />
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium">{user?.username}</div>
                      <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {(userType === 'admin' || userType === 'seller') ? (
                      <>
                        <Link
                          href={userType === 'admin' ? '/admin/dashboard' : '/seller/dashboard'}
                          className={`block px-3 py-2 text-base font-semibold rounded-md flex items-center ${userType === 'admin' ? (isActive('/admin') ? 'bg-red-50 text-red-700' : 'text-red-600 hover:bg-red-50') : (isActive('/seller') ? 'bg-brand-light/50 text-brand-primary' : 'hover:bg-gray-50 text-brand-primary')}`}
                        >
                          <Shield className="mr-2 h-5 w-5" />
                          {userType === 'admin' ? 'Quản trị hệ thống' : 'Kênh người bán'}
                        </Link>
                        <button 
                          onClick={handleLogout}
                          className="flex w-full items-center px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
                        </button>
                      </>
                    ) : (
                      <>
                        <Link href="/account" className={`block px-3 py-2 text-base font-medium rounded-md ${isActive('/account') ? 'bg-gray-50 text-brand-primary' : 'hover:bg-gray-50'}`}>
                          Tài khoản
                        </Link>
                        <Link href="/orders" className={`block px-3 py-2 text-base font-medium rounded-md ${isActive('/orders') ? 'bg-gray-50 text-brand-primary' : 'hover:bg-gray-50'}`}>
                          Đơn hàng
                        </Link>
                        <Link href="/favorites" className={`block px-3 py-2 text-base font-medium rounded-md ${isActive('/favorites') ? 'bg-gray-50 text-brand-primary' : 'hover:bg-gray-50'}`}>
                          Yêu thích
                        </Link>
                        <Link href="/notifications" className={`block px-3 py-2 text-base font-medium rounded-md ${isActive('/notifications') ? 'bg-gray-50 text-brand-primary' : 'hover:bg-gray-50'}`}>
                          Thông báo
                        </Link>
                        <button 
                          onClick={handleLogout}
                          className="flex w-full items-center px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col space-y-3 px-4">
                  <Link href="/login">
                    <Button variant="outline" className="w-full">Đăng nhập</Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="brand" className="w-full">Đăng ký</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar