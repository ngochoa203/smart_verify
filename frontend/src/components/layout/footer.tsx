"use client";

import Link from 'next/link'
import { Shield, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-100 pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-brand-primary mr-2" />
              <span className="text-lg font-bold">Smart<span className="text-brand-primary">Verify</span></span>
            </div>
            <p className="text-gray-600 mb-4">
              Nền tảng thương mại điện tử với công nghệ xác thực sản phẩm bằng AI và blockchain.
            </p>
            <div className="space-y-2">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-brand-primary mr-2" />
                <span className="text-gray-600">Hòa Hải, Ngũ Hành Sơn, Đà Nẵng</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-brand-primary mr-2" />
                <span className="text-gray-600">1900 1000 99</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-brand-primary mr-2" />
                <span className="text-gray-600">contact@smartverify.vn</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-brand-primary">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-600 hover:text-brand-primary">
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link href="/verify" className="text-gray-600 hover:text-brand-primary">
                  Xác thực sản phẩm
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-600 hover:text-brand-primary">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-brand-primary">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Hỗ trợ khách hàng</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="text-gray-600 hover:text-brand-primary">
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-600 hover:text-brand-primary">
                  Chính sách vận chuyển
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-600 hover:text-brand-primary">
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-brand-primary">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-brand-primary">
                  Điều khoản sử dụng
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Đăng ký nhận tin</h3>
            <p className="text-gray-600 mb-4">
              Nhận thông tin mới nhất về sản phẩm và khuyến mãi.
            </p>
            <form className="mb-4">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="px-4 py-2 w-full border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
                <button
                  type="submit"
                  className="bg-brand-primary text-white px-4 py-2 rounded-r-md hover:bg-brand-primary/90"
                >
                  Đăng ký
                </button>
              </div>
            </form>
            <div className="flex space-x-4">
              <a href="#" className="text-brand-primary hover:text-brand-primary/80">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-brand-primary hover:text-brand-primary/80">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-brand-primary hover:text-brand-primary/80">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-brand-primary hover:text-brand-primary/80">
                <Youtube className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} Smart Verify. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex space-x-4">
              <img src="/images/payment/visa.png" alt="Visa" className="h-8" />
              <img src="/images/payment/mastercard.png" alt="Mastercard" className="h-8" />
              <img src="/images/payment/momo.png" alt="Momo" className="h-8" />
              <img src="/images/payment/zalopay.png" alt="ZaloPay" className="h-8" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer