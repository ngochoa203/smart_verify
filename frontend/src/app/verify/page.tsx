"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  Upload, 
  QrCode, 
  Camera, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  ChevronRight,
  ArrowRight,
  Loader2,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { aiService, type VerificationResult } from '@/lib/services/ai-service';

export default function VerifyPage() {
  const [activeTab, setActiveTab] = useState('qr');
  const [qrCode, setQrCode] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleQrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrCode.trim()) return;
    
    setLoading(true);
    try {
      const verificationResult = await aiService.verifyByQR(qrCode);
      setResult(verificationResult);
    } catch (err) {
      console.error('Error verifying QR code:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedImage(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;
    
    setLoading(true);
    try {
      const verificationResult = await aiService.verifyByImage(selectedImage);
      setResult(verificationResult);
    } catch (err) {
      console.error('Error verifying image:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetVerification = () => {
    setResult(null);
    setQrCode('');
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-brand-light py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold leading-tight">
                Xác thực sản phẩm với công nghệ AI
              </h1>
              <p className="text-lg">
                SmartVerify sử dụng công nghệ AI tiên tiến và blockchain để xác thực tính chính hãng của sản phẩm, giúp bạn tránh mua phải hàng giả, hàng nhái.
              </p>
            </div>
            <div className="hidden lg:block">
              <img 
                src="https://placehold.co/600x400/3B82F6/FFFFFF?text=Xác+thực+sản+phẩm" 
                alt="Xác thực sản phẩm" 
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Verification Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            {result ? (
              <Card className="overflow-hidden">
                <CardHeader className={`${result.is_authentic ? 'bg-green-50' : 'bg-red-50'} p-6`}>
                  <div className="flex items-center">
                    {result.is_authentic ? (
                      <div className="bg-green-100 p-3 rounded-full mr-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                    ) : (
                      <div className="bg-red-100 p-3 rounded-full mr-4">
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                      </div>
                    )}
                    <div>
                      <CardTitle className={`text-2xl ${result.is_authentic ? 'text-green-800' : 'text-red-800'}`}>
                        {result.is_authentic ? 'Sản phẩm chính hãng' : 'Sản phẩm không chính hãng'}
                      </CardTitle>
                      <p className={`mt-1 ${result.is_authentic ? 'text-green-700' : 'text-red-700'}`}>
                        Độ tin cậy: {Math.round(result.confidence * 100)}%
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Product Details */}
                  {result.product_details && (
                    <div className="flex items-center mb-6">
                      <div className="h-20 w-20 bg-gray-100 rounded-md overflow-hidden mr-4">
                        <img
                          src={result.product_details.image_url}
                          alt={result.product_details.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold">{result.product_details.name}</h3>
                        <p className="text-sm text-gray-500">{result.product_details.brand} • {result.product_details.category}</p>
                        {result.product_id && (
                          <Link href={`/products/${result.product_id}`} className="text-sm text-brand-primary hover:underline">
                            Xem sản phẩm
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Verification Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Chi tiết xác thực</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500 mb-1">Điểm rủi ro</div>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                            <div 
                              className={`h-2.5 rounded-full ${result.risk_score < 0.3 ? 'bg-green-500' : result.risk_score < 0.7 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                              style={{ width: `${result.risk_score * 100}%` }}
                            ></div>
                          </div>
                          <span className="font-medium">{Math.round(result.risk_score * 100)}%</span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500 mb-1">Xác thực blockchain</div>
                        <div className="flex items-center">
                          {result.blockchain_verified ? (
                            <>
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                              <span className="font-medium text-green-700">Đã xác thực</span>
                            </>
                          ) : (
                            <>
                              <X className="h-5 w-5 text-red-500 mr-2" />
                              <span className="font-medium text-red-700">Không xác thực</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold mt-6">Phân tích AI</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Đối chiếu hình ảnh</span>
                          <span className="text-sm font-medium">{Math.round(result.ai_analysis.visual_match * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${result.ai_analysis.visual_match * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Phân tích chất liệu</span>
                          <span className="text-sm font-medium">{Math.round(result.ai_analysis.material_analysis * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-purple-600 h-2.5 rounded-full" 
                            style={{ width: `${result.ai_analysis.material_analysis * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Nhận dạng mẫu</span>
                          <span className="text-sm font-medium">{Math.round(result.ai_analysis.pattern_recognition * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-green-600 h-2.5 rounded-full" 
                            style={{ width: `${result.ai_analysis.pattern_recognition * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Xác thực logo</span>
                          <span className="text-sm font-medium">{Math.round(result.ai_analysis.logo_verification * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-yellow-600 h-2.5 rounded-full" 
                            style={{ width: `${result.ai_analysis.logo_verification * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="font-semibold">Phương pháp xác thực</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {result.features_used.map((feature, index) => (
                          <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <Button onClick={resetVerification}>
                      Xác thực sản phẩm khác
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Xác thực sản phẩm</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2 mb-8">
                      <TabsTrigger value="qr" className="flex items-center">
                        <QrCode className="mr-2 h-4 w-4" /> Quét mã QR
                      </TabsTrigger>
                      <TabsTrigger value="image" className="flex items-center">
                        <Upload className="mr-2 h-4 w-4" /> Tải ảnh lên
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="qr">
                      <div className="space-y-6">
                        <div className="text-center mb-6">
                          <p className="text-gray-600">
                            Nhập mã QR từ sản phẩm để xác thực tính chính hãng
                          </p>
                        </div>
                        
                        <form onSubmit={handleQrSubmit} className="space-y-4">
                          <div className="flex">
                            <Input
                              placeholder="Nhập mã QR..."
                              value={qrCode}
                              onChange={(e) => setQrCode(e.target.value)}
                              className="flex-1"
                              required
                            />
                            <Button 
                              type="submit" 
                              className="ml-2"
                              disabled={loading || !qrCode.trim()}
                            >
                              {loading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xác thực...
                                </>
                              ) : (
                                <>
                                  <Search className="mr-2 h-4 w-4" /> Xác thực
                                </>
                              )}
                            </Button>
                          </div>
                        </form>
                        
                        <div className="text-center">
                          <p className="text-sm text-gray-500">
                            Hoặc quét mã QR bằng camera
                          </p>
                          <Button variant="outline" className="mt-2">
                            <Camera className="mr-2 h-4 w-4" /> Mở camera
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="image">
                      <div className="space-y-6">
                        <div className="text-center mb-6">
                          <p className="text-gray-600">
                            Tải lên hình ảnh sản phẩm để AI phân tích và xác thực
                          </p>
                        </div>
                        
                        <div className="space-y-4">
                          {previewUrl ? (
                            <div className="relative">
                              <img
                                src={previewUrl}
                                alt="Preview"
                                className="w-full h-64 object-contain border rounded-md"
                              />
                              <button
                                onClick={clearImage}
                                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
                                aria-label="Remove image"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div 
                              className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center cursor-pointer hover:bg-gray-50"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-600">Nhấp để tải ảnh lên hoặc kéo thả vào đây</p>
                              <p className="text-sm text-gray-500 mt-1">PNG, JPG, JPEG (tối đa 5MB)</p>
                            </div>
                          )}
                          
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/png, image/jpeg, image/jpg"
                            className="hidden"
                          />
                          
                          <Button 
                            onClick={handleImageUpload}
                            className="w-full"
                            disabled={loading || !selectedImage}
                          >
                            {loading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang phân tích...
                              </>
                            ) : (
                              <>
                                <Shield className="mr-2 h-4 w-4" /> Xác thực sản phẩm
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Cách thức hoạt động</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Quy trình xác thực sản phẩm đơn giản và nhanh chóng với công nghệ AI và blockchain
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="h-8 w-8 text-brand-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quét mã QR hoặc tải ảnh</h3>
              <p className="text-gray-600">
                Quét mã QR trên sản phẩm hoặc tải ảnh sản phẩm lên hệ thống để bắt đầu quá trình xác thực.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-brand-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI phân tích sản phẩm</h3>
              <p className="text-gray-600">
                Hệ thống AI của chúng tôi phân tích sản phẩm và đối chiếu với cơ sở dữ liệu blockchain.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-brand-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Nhận kết quả xác thực</h3>
              <p className="text-gray-600">
                Nhận kết quả xác thực chi tiết về tính chính hãng của sản phẩm trong vài giây.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Câu hỏi thường gặp</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Giải đáp những thắc mắc về công nghệ xác thực sản phẩm của SmartVerify
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-2">Công nghệ xác thực của SmartVerify hoạt động như thế nào?</h3>
              <p className="text-gray-600">
                SmartVerify sử dụng kết hợp công nghệ AI và blockchain để xác thực sản phẩm. AI phân tích hình ảnh và đặc điểm của sản phẩm, trong khi blockchain lưu trữ thông tin xác thực không thể thay đổi.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-2">Độ chính xác của hệ thống xác thực là bao nhiêu?</h3>
              <p className="text-gray-600">
                Hệ thống xác thực của chúng tôi có độ chính xác lên đến 98% đối với xác thực bằng mã QR và trên 92% đối với xác thực bằng hình ảnh, tùy thuộc vào chất lượng hình ảnh và loại sản phẩm.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-2">Tôi có thể xác thực những loại sản phẩm nào?</h3>
              <p className="text-gray-600">
                SmartVerify hỗ trợ xác thực nhiều loại sản phẩm khác nhau, bao gồm điện thoại, laptop, đồng hồ, túi xách, giày dép và nhiều sản phẩm cao cấp khác. Danh sách sản phẩm được hỗ trợ liên tục được cập nhật.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}