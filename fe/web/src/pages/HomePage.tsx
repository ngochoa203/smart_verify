import Banner from "../components/Banner";
import Header from "../components/MainHeader";

export default function HomePage() {
    return (
        <div>
            <Header />
            <div className="w-full max-h-[1600px] mx-auto px-4">
                <Banner />
            </div>
            <div className="category-list">
                <span>Danh muc</span>
            </div>
        </div>
    )
}