"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Mật khẩu không khớp!");
      return;
    }

    setLoading(true);

    // Giả lập gọi API
    setTimeout(() => {
      alert(`Đăng ký thành công với email: ${email}`);
      setLoading(false);
    }, 1500);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-10 px-6 bg-cover bg-center"
      style={{ backgroundImage: "url('/images/background.jpg')" }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-slate-500 bg-opacity-85 p-12 rounded-xl shadow-2xl text-white animate-fadeIn"
      >
        <h2 className="text-5xl font-bold text-center mb-10">Đăng ký tài khoản</h2>

        <div className="space-y-8">
          <div>
            <label htmlFor="email" className="block text-lg font-semibold mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="Nhập email của bạn"
              className="w-full px-5 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg text-gray-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-lg font-semibold mb-2">
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              required
              placeholder="Tạo mật khẩu"
              className="w-full px-5 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg text-gray-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-lg font-semibold mb-2">
              Xác nhận mật khẩu
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              placeholder="Nhập lại mật khẩu"
              className="w-full px-5 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg text-gray-900"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`mt-10 w-full py-4 text-lg text-white font-semibold rounded-lg shadow-lg transition-colors ${
            loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </button>

        <p className="text-center mt-6 text-md text-white">
          Đã có tài khoản?{" "}
          <a href="/authen/login" className="underline font-bold hover:text-yellow-100">
            Đăng nhập
          </a>
        </p>
      </form>

      <style>
        {`
          .animate-fadeIn {
            animation: fadeIn 0.6s ease forwards;
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
}
