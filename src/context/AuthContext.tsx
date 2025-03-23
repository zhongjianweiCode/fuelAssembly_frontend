"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import axios from 'axios';
import { setTokens, getAccessToken, getRefreshToken, removeTokens } from "@/utils/auth";

// Define types
interface User {
  accessToken: string;
  refreshToken: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

// 错误类型定义
// interface ApiError {
//   message: string;
//   response?: {
//     status: number;
//     data?: unknown;
//     headers?: Record<string, string>;
//   };
// }

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  logout: async () => {},
  isAuthenticated: false,
});

// Public paths that don't require authentication
const publicPaths = ['/', '/login', '/register', '/password-reset', '/logout'];

// 获取完整API URL的工具函数
const getApiUrl = (endpoint: string): string => {
  // 开发环境直接使用本地后端
  const baseUrl = process.env.NEXT_PUBLIC_NODE_ENV === 'production' 
    ? "https://skdjangobackend-production.up.railway.app" 
    : "http://127.0.0.1:8000";
  
  // 确保endpoint以/开头
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  return `${baseUrl}${normalizedEndpoint}`;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  // Check if current path is public
  const isPublicPath = publicPaths.some(path => pathname?.startsWith(path) || false);

  // Function to validate auth tokens
  const validateTokens = async (): Promise<void> => {
    try {
      // Get tokens using the utility functions
      const accessToken = getAccessToken();
      const refreshToken = getRefreshToken();
      
      // No tokens found - user isn't logged in
      if (!accessToken || !refreshToken) {
        // console.log("No tokens found");
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      // Attempt to validate the access token with the backend
      try {
        const verifyUrl = getApiUrl('/api/token/verify');
        console.log("Verifying token at:", verifyUrl);
        
        await axios.post(verifyUrl, { token: accessToken }, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        console.log("Access token validated successfully");
        setIsAuthenticated(true);
        setUser({ accessToken, refreshToken });
      } catch (error) {
        console.warn("Access token validation failed, attempting refresh");
        console.error("Access token validation error:", error instanceof Error ? error.message : 'Unknown error');
        
        // Try to refresh the token
        try {
          const refreshUrl = getApiUrl('/api/token/refresh');
          // console.log("Refreshing token at:", refreshUrl);
          
          const response = await axios.post(refreshUrl, { refresh: refreshToken }, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          
          if (!response.data || !response.data.access) {
            throw new Error("Invalid refresh response");
          }
          
          const newAccessToken = response.data.access;
          
          // Update tokens
          setTokens(newAccessToken, refreshToken);
          setIsAuthenticated(true);
          setUser({ accessToken: newAccessToken, refreshToken });
          
          console.log("Token refreshed successfully");
        } catch (refreshError: unknown) {
          console.error("Token refresh failed:", refreshError instanceof Error ? refreshError.message : 'Unknown error');
          removeTokens();
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    } catch (error: unknown) {
      console.error("Token validation error:", error instanceof Error ? error.message : 'Unknown error');
      removeTokens();
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  // Validate tokens on mount and when routes change
  useEffect(() => {
    const checkAuth = async (): Promise<void> => {
      // Skip token validation for public paths
      if (isPublicPath) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      await validateTokens();
      setLoading(false);
    };
    
    checkAuth();
  }, [isPublicPath, pathname]);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      // 使用正确的字段名：email 和 password
      const payload = {
        email: email,
        password: password
      };
      
      // console.log("Sending login payload:", payload);
      
      // 使用直接的 axios 调用来确保完整的URL和正确的参数
      const completeUrl = getApiUrl('/api/token/pair');
      console.log("Sending login request to:", completeUrl);
      
      const response = await axios.post(completeUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      // console.log("Login success. Response:", response.data);
      
      // 确保我们能够从响应中获取到 access 和 refresh 令牌
      const { access, refresh } = response.data;
      
      if (!access || !refresh) {
        console.error("Invalid response format - missing tokens");
        throw new Error("服务器返回了无效的响应格式");
      }
      
      // 保存令牌
      setTokens(access, refresh);
      
      // 更新状态
      setIsAuthenticated(true);
      setUser({ accessToken: access, refreshToken: refresh });
      
      // 获取前一个位置或转到仪表板
      const prevPath = localStorage.getItem('prevPath') || '/dashboard';
      localStorage.removeItem('prevPath');
      router.push(prevPath);
      
      return true;
    } catch (error: unknown) {
      console.error("Login failed:", error instanceof Error ? error.message : 'Unknown error');
      
      // 获取并记录详细错误信息
      let errorMessage = "登录失败";
      
      if (axios.isAxiosError(error) && error.response) {
        console.error("Status:", error.response.status);
        
        // 根据状态码提供更具体的错误消息
        if (error.response.status === 401) {
          errorMessage = "电子邮件或密码不正确";
        } else if (error.response.status === 400) {
          // 尝试从响应中提取字段错误
          if (error.response.data) {
            const responseData = error.response.data as Record<string, unknown>;
            if (typeof responseData === 'object') {
              // 提取字段错误
              const fieldErrors = Object.entries(responseData)
                .map(([field, errors]) => `${field}: ${errors}`)
                .join('; ');
              
              if (fieldErrors) {
                errorMessage = `验证错误: ${fieldErrors}`;
              }
            } else if (typeof responseData === 'string') {
              errorMessage = responseData;
            }
          }
        }
      }
      
      console.error("Login error message:", errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      // Remove tokens using the utility function
      removeTokens();
      
      // Reset state
      setIsAuthenticated(false);
      setUser(null);
      
      // Redirect to login page
      router.push('/login');
    } catch (error: unknown) {
      console.error('Logout error:', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        login, 
        logout, 
        isAuthenticated 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
