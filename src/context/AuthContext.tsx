"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  removeTokens,
} from "@/utils/auth";
import api from "@/lib/api";
import axios from "axios";
import { useRouter } from "next/navigation";

interface User {
  accessToken: string;
  refreshToken: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const validateTokens = async () => {
      try {
        setLoading(true);
        const access = getAccessToken();
        const refresh = getRefreshToken();

        if (!access || !refresh) {
          console.log("No tokens found, redirecting to login");
          setUser(null);
          router.replace("/login");
          return;
        }

        try {
          // 先尝试验证 access token
          await api.post("/api/token/verify", { token: access });
          console.log("Access token is valid");
          setUser({ accessToken: access, refreshToken: refresh });
        } catch (error) {
          // 如果 access token 验证失败，尝试使用 refresh token 获取新的 access token
          console.warn("Access token validation failed, attempting refresh");
          if (axios.isAxiosError(error) && error.response?.status === 401) {
            try {
              console.log("Attempting to refresh token");
              const { data } = await api.post("/api/token/refresh", {
                refresh: refresh,
              });
              // 保存新的 access token
              console.log("Token refreshed successfully");
              setTokens(data.access, refresh);
              setUser({ accessToken: data.access, refreshToken: refresh });
            } catch (refreshError) {
              // 如果刷新 token 也失败，则登出
              console.error("Token refresh failed:", refreshError);
              await logout();
              router.replace("/login");
            }
          } else {
            // 其他错误，登出
            console.error("Token validation failed:", error);
            await logout();
            router.replace("/login");
          }
        }
      } catch (error) {
        console.error("Token validation failed:", error);
        await logout();
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    validateTokens();
  }, [router]);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post<{ access: string; refresh: string }>(
        "/api/token/pair",
        { email, password }
      );
      setTokens(data.access, data.refresh);
      setUser({ accessToken: data.access, refreshToken: data.refresh });
    } catch (error) {
      console.error("Login error:", error);
      if (axios.isAxiosError(error)) {
        // 网络错误
        if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
          throw new Error("Cannot connect to server. Please check if the backend server is running.");
        }
        // 服务器返回的错误
        if (error.response) {
          const statusCode = error.response.status;
          const errorMessage = error.response.data?.detail || "Unknown server error";
          throw new Error(`Login failed (${statusCode}): ${errorMessage}`);
        }
      }
      throw new Error("Login failed. Please check your credentials or try again later.");
    }
  };

  const logout = async () => {
    removeTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user?.accessToken,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error(`useAuth must be used within a AuthProvider.`);
  return context;
};
