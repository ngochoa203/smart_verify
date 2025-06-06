import React, { useState } from "react";
import bgImage from '@/assets/images/background.jpg';
import axios from "axios";
import { API_URL } from "../../services/api";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [image_url, setImageUrl] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !email || !phone || !address || !password || !confirmPassword) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (password !== confirmPassword) {
      alert("Mật khẩu không khớp!");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/register/user`, {
        username,
        email,
        phone,
        address,
        image_url,
        password,
      });

      alert(`Đăng ký thành công! Chào mừng ${res.data.username} đến với SmartVerify!`);
      window.location.href = "/authen/login";
    } catch (error: any) {
      console.error("Registration error:", error);
      const message = error?.response?.data?.detail || "Đăng ký không thành công.";
      alert(`Lỗi: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-10 px-6 bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-slate-500 bg-opacity-85 p-12 rounded-xl shadow-2xl text-white animate-fadeIn"
      >
        <h2 className="text-5xl font-bold text-center mb-10">Đăng ký tài khoản</h2>

        <div className="space-y-6">
          <Input label="Tên người dùng" value={username} onChange={setUsername} disabled={loading} />
          <Input label="Email" type="email" value={email} onChange={setEmail} disabled={loading} />
          <Input label="Số điện thoại" value={phone} onChange={setPhone} disabled={loading} />
          <Input label="Địa chỉ" value={address} onChange={setAddress} disabled={loading} />
          <Input label="URL ảnh đại diện (tuỳ chọn)" value={image_url} onChange={setImageUrl} disabled={loading} />
          <Input label="Mật khẩu" type="password" value={password} onChange={setPassword} disabled={loading} />
          <Input label="Xác nhận mật khẩu" type="password" value={confirmPassword} onChange={setConfirmPassword} disabled={loading} />
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

function Input({
  label,
  value,
  onChange,
  disabled,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-lg font-semibold mb-2">{label}</label>
      <input
        type={type}
        required={type !== "url"}
        placeholder={`Nhập ${label.toLowerCase()}`}
        className="w-full px-5 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg text-gray-900"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
}
