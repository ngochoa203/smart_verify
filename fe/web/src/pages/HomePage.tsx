import HeroBanner from "../components/HeroBanner";
import CategoryGrid from "../components/CategoryGrid";
import FlashSale from "../components/FlashSale";
import PromotionBanner from "../components/PromotionBanner";
import ProductGrid from "../components/ProductGrid";

export default function HomePage() {
    return (
        <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
            {/* Hero Banner Section */}
            <div className="max-w-7xl mx-auto px-4 pt-8">
                <HeroBanner />
            </div>
            
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
                {/* Category Grid */}
                <CategoryGrid />
                
                {/* Flash Sale */}
                <FlashSale />
                
                {/* Promotion Banners */}
                <PromotionBanner />
                
                {/* Product Sections */}
                <ProductGrid title="🔥 Sản phẩm bán chạy" />
                <ProductGrid title="⭐ Được đánh giá cao" />
                <ProductGrid title="💻 Điện tử - Công nghệ" />
                <ProductGrid title="👕 Thời trang" />
                <ProductGrid title="🏠 Gia dụng" />
            </div>
        </div>
    )
}