import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { ToastProvider } from "./contexts/ToastContext";
import Layout from "./components/Layout";
import LiveChat from "./components/LiveChat";
import ErrorBoundary from "./components/ErrorBoundary";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/authen/LoginPage";
import RegisterPage from "./pages/authen/RegisterPage";
import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import SearchPage from "./pages/SearchPage";
import CartPage from "./pages/CartPage";
import "./index.css";

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <Routes>
            {/* Landing page without layout */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Auth pages without navigation */}
            <Route path="/authen/login" element={
              <Layout showNavigation={false}>
                <LoginPage />
              </Layout>
            } />
            <Route path="/authen/register" element={
              <Layout showNavigation={false}>
                <RegisterPage />
              </Layout>
            } />
            
            {/* Main app pages with full layout */}
            <Route path="/home" element={
              <Layout>
                <HomePage />
              </Layout>
            } />
            <Route path="/product/:id" element={
              <Layout>
                <ProductDetailPage />
              </Layout>
            } />
            <Route path="/category/:id" element={
              <Layout>
                <HomePage />
              </Layout>
            } />
            <Route path="/search" element={
              <Layout>
                <SearchPage />
              </Layout>
            } />
            <Route path="/cart" element={
              <Layout>
                <CartPage />
              </Layout>
            } />
          </Routes>
          
          {/* Global Components */}
          <LiveChat />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
    </ErrorBoundary>
  );
}
