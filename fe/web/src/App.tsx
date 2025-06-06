import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/authen/LoginPage";
import RegisterPage from "./pages/authen/RegisterPage";
import HomePage from "./pages/HomePage";
import "./index.css";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/authen/login" element={<LoginPage />} />
        <Route path="/authen/register" element={<RegisterPage />} />
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </div>
  );
}
