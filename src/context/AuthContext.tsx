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
        const access = getAccessToken();
        const refresh = getRefreshToken();

        if (access && refresh) {
          try {
            // 先尝试验证 access token
            await api.post("/api/token/verify", { token: access });
            setUser({ accessToken: access, refreshToken: refresh });
          } catch (error) {
            // 如果 access token 验证失败，尝试使用 refresh token 获取新的 access token
            if (axios.isAxiosError(error) && error.response?.status === 401) {
              try {
                const { data } = await api.post("/api/token/refresh", {
                  refresh: refresh,
                });
                // 保存新的 access token
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
        } else {
          router.replace("/login");
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
    } catch {
      throw new Error("login failed");
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
