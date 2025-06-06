import { FaShoppingCart, FaUserCircle, FaSearch, FaHeart, FaChartLine} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function Header() {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [query, setQuery] = useState("");

  const popularSuggestions = ["Váy", "Đầm", "Áo", "Trang Sức", "Phụ Kiện"];

  return (
    <header className="bg-bg-dark-50 shadow-md">
      <div className="main-header flex items-center justify-between mx-auto px-4 py-3 border bg-dark-100">
        <div className="logo text-2xl font-bold text-blue-600 flex items-center">
          <a
            href="/"
            className="hover:text-blue-800 transition-colors duration-300 flex items-center"
          >
            <img src="/vite.svg" alt="SmartVerify Logo" className="h-14 w-14" />
            <span className="ml-2">SmartVerify</span>
          </a>
        </div>

        <div className="relative w-96">
          <form action="/search" method="GET" className="flex">
            <input
              type="text"
              name="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Tìm kiếm..."
              className="w-full px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              aria-label="Tìm kiếm"
              className="px-4 py-2 bg-gray-400 text-white rounded-r-lg hover:bg-gray-900"
            >
              <FaSearch />
            </button>
          </form>

          {showSuggestions && (
            <div className="absolute left-0 top-full mt-1 w-full bg-white border border-gray-200 rounded-md shadow-md z-10">
              <div className="flex items-center px-4 py-2 text-gray-700 font-semibold border-b">
                <FaChartLine className="mr-2" />
                <span>Đề xuất phổ biến</span>
              </div>
              <div className="grid grid-cols-2 gap-2 px-4 py-2">
                {popularSuggestions.map((item, index) => (
                  <a
                    key={index}
                    href={`/search?q=${item}`}
                    className="text-gray-600 hover:text-blue-600 transition-colors text-sm"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4 ml-4">
          <Link
            to="/favorites"
            className="text-gray-200 hover:text-blue-600 transition-colors duration-300"
          >
            <FaHeart className="h-6 w-6" />
          </Link>
          <Link
            to="/cart"
            className="text-gray-200 hover:text-blue-600 transition-colors duration-300"
          >
            <FaShoppingCart className="h-6 w-6" />
          </Link>
          <Link
            to="/profile"
            className="text-gray-200 hover:text-blue-600 transition-colors duration-300"
          >
            <FaUserCircle className="h-6 w-6" />
          </Link>
        </div>
      </div>
    </header>
  );
}
