import axios from "axios";
import { 
  getAccessToken, 
  getRefreshToken, 
  setTokens, 
  removeTokens 
} from "@/utils/auth";

// 确保即使环境变量丢失也有一个默认值
const DEFAULT_BASE_URL = "http://127.0.0.1:8000";
const PRODUCTION_API_URL = "https://skdjangobackend-production.up.railway.app";

// 确定 API 基础 URL
let BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_BASE_URL;

// 生产环境检查 - 确保使用正确的生产API
if (process.env.NEXT_PUBLIC_NODE_ENV === 'production') {
  BASE_URL = PRODUCTION_API_URL;
  console.log('Production mode: Using production API base URL:', BASE_URL);
} else {
  console.log('Development mode: API Base URL:', BASE_URL);
}

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 增加超时时间到30秒，适应网络延迟
  withCredentials: true, // 跨域凭证携带
  headers: {
    "Content-Type": "application/json",
  },
});

// 调试辅助函数
const logRequest = (config: {
  method?: string;
  url?: string;
  headers?: Record<string, unknown>;
  data?: unknown;
}) => {
  if (process.env.NEXT_PUBLIC_NODE_ENV === "development") {
    console.groupCollapsed(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    console.log('Headers:', config.headers);
    console.log('Data:', config.data);
    console.groupEnd();
  }
};

const logResponse = (response: {
  status: number;
  config: { url?: string };
  data?: unknown;
}) => {
  if (process.env.NEXT_PUBLIC_NODE_ENV === "development") {
    console.log(`📥 ${response.status} ${response.config.url}`, response.data);
  }
};

// 请求拦截器优化
api.interceptors.request.use(
  (config) => {
    // 动态处理 FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    // 调试日志
    logRequest(config);

    // 令牌处理优化
    const token = getAccessToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  error => Promise.reject(error)
);

// 响应拦截器
api.interceptors.response.use(
  response => {
    logResponse(response);
    return response;
  },
  async error => {
    const originalRequest = error.config;
    
    console.warn('API Error:', error.response?.status, error.response?.config?.url);
    
    // 401 处理逻辑
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('Attempting to refresh token due to 401 error');
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          console.error('No refresh token available');
          throw new Error("Missing refresh token");
        }

        console.log('Sending refresh request');
        
        // 使用独立 axios 实例避免循环拦截
        const refreshClient = axios.create({
          baseURL: BASE_URL,
          withCredentials: true
        });
        
        const { data } = await refreshClient.post("/api/token/refresh", { 
          refresh: refreshToken 
        });

        console.log('Token refresh successful, updating tokens');
        
        // 安全存储新令牌
        setTokens(data.access, refreshToken);
        
        // 重试原始请求
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // 清除令牌
        removeTokens();
        
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname;
          console.log(`Redirecting to login from ${currentPath}`);
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
        
        return Promise.reject({
                     message: "Session expired. Please login again."
        });
      }
    }

    // 其他错误处理
    return Promise.reject({
      code: error.response?.status || "NETWORK_ERROR",
      message: error.response?.data?.detail || "Unknown error occurred",
      raw: error
    });
  }
);

export default api;