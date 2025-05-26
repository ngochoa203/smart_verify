import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 to-white px-4 py-12">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-extrabold text-gray-800 mb-4">
          Chào mừng đến với
        </h1>
        <h2 className="text-4xl font-bold text-blue-600 mb-6">
          Anti-Counterfeit App
        </h2>
        <p className="text-gray-600 mb-10 text-lg">
          Nền tảng giúp kiểm tra hàng giả, bảo vệ người tiêu dùng và tăng độ tin cậy cho sản phẩm.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/authen/login"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition"
          >
            Đăng nhập
          </Link>
          <Link
            href="/authen/register"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition"
          >
            Đăng ký
          </Link>
          <Link
            href="/verify"
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition"
          >
            Kiểm tra hàng giả
          </Link>
        </div>
      </div>
    </div>
  );
}
