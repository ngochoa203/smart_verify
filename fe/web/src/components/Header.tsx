import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCartIcon, UserIcon, MagnifyingGlassIcon, HeartIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import NotificationPanel from './NotificationPanel';

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  return (
    <header className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg sticky top-0 z-50">
      {/* Top Bar */}
      <div className="border-b border-orange-400/30">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-4">
              <span>📞 Hotline: 1900-123456</span>
              <span>📧 Email: support@smartverify.com</span>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationPanel />
              <Link to="/help" className="hover:text-orange-200">
                ❓ Hỗ trợ
              </Link>
              <div className="flex items-center space-x-2">
                <span>🌐</span>
                <select className="bg-transparent text-white text-sm">
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/home" className="flex items-center space-x-2">
            <div className="bg-white text-orange-500 p-2 rounded-lg font-bold text-xl shadow-lg">
              🛒 SmartVerify
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                className="w-full px-4 py-3 pr-12 text-gray-800 bg-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-orange-300 placeholder-gray-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-500 hover:bg-orange-600 p-2 rounded-md text-white transition-colors"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>
            </div>
            
            {/* Popular searches */}
            <div className="flex space-x-2 mt-2 text-sm">
              <span className="text-orange-200">Tìm kiếm phổ biến:</span>
              <Link to="/search?q=iphone" className="bg-orange-400/20 px-2 py-1 rounded hover:bg-orange-400/30">
                iPhone
              </Link>
              <Link to="/search?q=samsung" className="bg-orange-400/20 px-2 py-1 rounded hover:bg-orange-400/30">
                Samsung
              </Link>
              <Link to="/search?q=laptop" className="bg-orange-400/20 px-2 py-1 rounded hover:bg-orange-400/30">
                Laptop
              </Link>
            </div>
          </form>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="flex flex-col items-center hover:text-orange-200 transition-colors group"
            >
              <div className="relative">
                <HeartIcon className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </div>
              <span className="text-xs mt-1">Yêu thích</span>
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="flex flex-col items-center hover:text-orange-200 transition-colors group"
            >
              <div className="relative">
                <ShoppingCartIcon className="w-6 h-6" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getTotalItems() > 9 ? '9+' : getTotalItems()}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1">Giỏ hàng</span>
            </Link>

            {/* User Menu */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex flex-col items-center hover:text-orange-200 transition-colors"
                  >
                    <div className="w-8 h-8 bg-white text-orange-500 rounded-full flex items-center justify-center font-semibold">
                      {user.username?.charAt(0).toUpperCase() || '👤'}
                    </div>
                    <span className="text-xs mt-1">Tài khoản</span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg border z-50">
                      <div className="p-4 border-b">
                        <p className="font-semibold">{user.username}</p>
                        <p className="text-sm text-gray-600">Thành viên SmartVerify</p>
                      </div>
                      <div className="py-2">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          👤 Hồ sơ của tôi
                        </Link>
                        <Link
                          to="/orders"
                          className="block px-4 py-2 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          📦 Đơn mua
                        </Link>
                        <Link
                          to="/addresses"
                          className="block px-4 py-2 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          📍 Địa chỉ
                        </Link>
                        <Link
                          to="/settings"
                          className="block px-4 py-2 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          ⚙️ Cài đặt
                        </Link>
                        <hr className="my-2" />
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-red-600"
                        >
                          🚪 Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Link
                    to="/authen/login"
                    className="bg-white text-orange-500 px-4 py-2 rounded-md hover:bg-orange-50 transition-colors font-medium"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/authen/register"
                    className="border border-white px-4 py-2 rounded-md hover:bg-white hover:text-orange-500 transition-colors font-medium"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Categories Navigation */}
      <div className="border-t border-orange-400/30 bg-orange-600/20">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center space-x-8 text-sm">
            <Link to="/category/all" className="hover:text-orange-200 font-medium">
              📱 Điện thoại
            </Link>
            <Link to="/category/laptop" className="hover:text-orange-200 font-medium">
              💻 Laptop
            </Link>
            <Link to="/category/tablet" className="hover:text-orange-200 font-medium">
              📲 Tablet
            </Link>
            <Link to="/category/watch" className="hover:text-orange-200 font-medium">
              ⌚ Đồng hồ
            </Link>
            <Link to="/category/audio" className="hover:text-orange-200 font-medium">
              🎧 Âm thanh
            </Link>
            <Link to="/category/accessories" className="hover:text-orange-200 font-medium">
              🔌 Phụ kiện
            </Link>
            <Link to="/flash-sale" className="hover:text-orange-200 font-medium text-yellow-300">
              ⚡ Flash Sale
            </Link>
            <Link to="/deals" className="hover:text-orange-200 font-medium">
              🎯 Khuyến mãi
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
