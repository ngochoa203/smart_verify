import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Customer Service */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-orange-400">🛡️ CHĂM SÓC KHÁCH HÀNG</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/help" className="hover:text-orange-400 transition-colors">Trung tâm trợ giúp</Link></li>
              <li><Link to="/contact" className="hover:text-orange-400 transition-colors">Liên hệ với chúng tôi</Link></li>
              <li><Link to="/guide" className="hover:text-orange-400 transition-colors">Hướng dẫn mua hàng</Link></li>
              <li><Link to="/shipping" className="hover:text-orange-400 transition-colors">Hướng dẫn vận chuyển</Link></li>
              <li><Link to="/returns" className="hover:text-orange-400 transition-colors">Chính sách đổi trả</Link></li>
              <li><Link to="/warranty" className="hover:text-orange-400 transition-colors">Chính sách bảo hành</Link></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-orange-400">ℹ️ VỀ SMARTVERIFY</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-orange-400 transition-colors">Giới thiệu về SmartVerify</Link></li>
              <li><Link to="/careers" className="hover:text-orange-400 transition-colors">Tuyển dụng</Link></li>
              <li><Link to="/press" className="hover:text-orange-400 transition-colors">Tin tức</Link></li>
              <li><Link to="/terms" className="hover:text-orange-400 transition-colors">Điều khoản SmartVerify</Link></li>
              <li><Link to="/privacy" className="hover:text-orange-400 transition-colors">Chính sách bảo mật</Link></li>
              <li><Link to="/cookies" className="hover:text-orange-400 transition-colors">Chính sách cookie</Link></li>
            </ul>
          </div>

          {/* Payment */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-orange-400">💳 THANH TOÁN</h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-white p-2 rounded flex items-center justify-center">
                <img src="/visa.png" alt="Visa" className="h-6" />
              </div>
              <div className="bg-white p-2 rounded flex items-center justify-center">
                <img src="/mastercard.png" alt="Mastercard" className="h-6" />
              </div>
              <div className="bg-white p-2 rounded flex items-center justify-center">
                <img src="/jcb.png" alt="JCB" className="h-6" />
              </div>
              <div className="bg-white p-2 rounded flex items-center justify-center">
                <img src="/atm.png" alt="ATM" className="h-6" />
              </div>
              <div className="bg-white p-2 rounded flex items-center justify-center">
                <img src="/momo.png" alt="Momo" className="h-6" />
              </div>
              <div className="bg-white p-2 rounded flex items-center justify-center">
                <img src="/zalopay.png" alt="ZaloPay" className="h-6" />
              </div>
            </div>
            <h4 className="font-semibold mb-2 text-orange-400">🚚 ĐƠN VỊ VẬN CHUYỂN</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white p-2 rounded flex items-center justify-center">
                <span className="text-red-600 font-bold text-xs">GHTK</span>
              </div>
              <div className="bg-white p-2 rounded flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xs">GHN</span>
              </div>
              <div className="bg-white p-2 rounded flex items-center justify-center">
                <span className="text-green-600 font-bold text-xs">VNPOST</span>
              </div>
            </div>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-orange-400">👥 THEO DÕI CHÚNG TÔI</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-orange-400 transition-colors flex items-center">
                  <span className="mr-2">📘</span> Facebook
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-400 transition-colors flex items-center">
                  <span className="mr-2">📷</span> Instagram
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-400 transition-colors flex items-center">
                  <span className="mr-2">🐦</span> Twitter
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-400 transition-colors flex items-center">
                  <span className="mr-2">🎵</span> TikTok
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-400 transition-colors flex items-center">
                  <span className="mr-2">📺</span> YouTube
                </a>
              </li>
            </ul>
          </div>

          {/* Download App */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-orange-400">📱 TẢI ỨNG DỤNG</h3>
            <div className="space-y-3">
              <div className="bg-white p-3 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-black rounded mr-3 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">QR</span>
                  </div>
                  <span className="text-gray-800 text-sm">Quét mã QR để tải ứng dụng</span>
                </div>
                <div className="w-16 h-16 bg-gray-200 rounded mx-auto mb-2 flex items-center justify-center">
                  <span className="text-gray-500 text-xs">QR Code</span>
                </div>
              </div>
              <div className="space-y-2">
                <a href="#" className="block bg-black text-white p-2 rounded text-center hover:bg-gray-800 transition-colors">
                  <div className="flex items-center justify-center">
                    <span className="mr-2">🍎</span>
                    <div className="text-left">
                      <div className="text-xs">Tải xuống trên</div>
                      <div className="text-sm font-semibold">App Store</div>
                    </div>
                  </div>
                </a>
                <a href="#" className="block bg-black text-white p-2 rounded text-center hover:bg-gray-800 transition-colors">
                  <div className="flex items-center justify-center">
                    <span className="mr-2">🤖</span>
                    <div className="text-left">
                      <div className="text-xs">Tải xuống trên</div>
                      <div className="text-sm font-semibold">Google Play</div>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm text-gray-400">
            <div>
              <p className="mb-2">© 2024 SmartVerify. Tất cả các quyền được bảo lưu.</p>
              <p>Quốc gia & Khu vực: Singapore | Indonesia | Thái Lan | Malaysia | Việt Nam | Philippines | Brazil | México | Colombia | Chile</p>
            </div>
            <div className="lg:text-center">
              <div className="flex items-center justify-center lg:justify-center space-x-4">
                <div className="flex items-center">
                  <span className="mr-2">🛡️</span>
                  <span>Chính sách bảo mật</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">📄</span>
                  <span>Điều khoản dịch vụ</span>
                </div>
              </div>
            </div>
            <div className="lg:text-right">
              <p className="mb-2">Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM</p>
              <p>Hotline: 1900-123456 | Email: support@smartverify.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        <button className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-colors">
          <span className="text-xl">💬</span>
        </button>
        <button className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-colors">
          <span className="text-xl">📞</span>
        </button>
        <button className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full shadow-lg transition-colors">
          <span className="text-xl">⬆️</span>
        </button>
      </div>
    </footer>
  );
};

export default Footer;
