'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, User } from './services/auth-service';
import { getToken, setToken, removeToken } from './api-utils';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<{ message: string; user_id: number; }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => {},
  register: async () => ({ message: '', user_id: 0 }),
  logout: () => {},
  loading: true
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (initialized) return;
      
      const token = getToken();
      
      if (token) {
        try {
          const userProfile = await authService.getProfile();
          setUser(userProfile);
          setIsAuthenticated(true);
          
          // Handle role-based redirections for already authenticated users
          // Only redirect if user is on login or register page
          const path = window.location.pathname;
          if (path === '/login' || path === '/register') {
            if (userProfile.role === 'admin') {
              router.push('/admin/dashboard');
            } else if (userProfile.role === 'seller') {
              router.push('/seller/dashboard');
            }
          }
        } catch (error) {
          console.error('Auth check failed', error);
          removeToken();
        }
      }
      
      setLoading(false);
      setInitialized(true);
    };

    checkAuth();
  }, [initialized, router]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      if (response && response.access_token) {
        setToken(response.access_token);
        setUser(response.user);
        setIsAuthenticated(true);
        
        // Handle role-based redirections
        if (response.user && response.user.role) {
          if (response.user.role === 'admin') {
            router.push('/admin/dashboard');
          } else if (response.user.role === 'seller') {
            router.push('/seller/dashboard');
          }
        }
        
        return;
      }
      throw new Error('Invalid response from server');
    } catch (error) {
      console.error('Login failed', error);
      toast({
        title: "Đăng nhập thất bại",
        description: "Vui lòng kiểm tra thông tin đăng nhập và thử lại.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const register = async (data: any) => {
    try {
      const response = await authService.register(data);
      return response;
    } catch (error) {
      console.error('Registration failed', error);
      toast({
        title: "Đăng ký thất bại",
        description: "Vui lòng thử lại sau.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
    setIsAuthenticated(false);
    
    toast({
      title: "Đã đăng xuất",
      description: "Bạn đã đăng xuất thành công.",
    });
    
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};