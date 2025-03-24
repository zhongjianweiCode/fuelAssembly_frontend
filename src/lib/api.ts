import axios, { AxiosError } from "axios";
import { 
  getAccessToken, 
  getRefreshToken, 
  setTokens, 
  removeTokens 
} from "@/utils/auth";

// Ensure we have a default value even if environment variables are missing
const DEFAULT_BASE_URL = "http://127.0.0.1:8000";
const PRODUCTION_API_URL = "https://skdjangobackend-production.up.railway.app";

// Determine the API base URL
let BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_BASE_URL;

// Production environment check - ensure we use the correct production API
if (process.env.NEXT_PUBLIC_NODE_ENV === 'production') {
  BASE_URL = PRODUCTION_API_URL;
  // console.log('Production mode: Using production API base URL:', BASE_URL);
} else {
  console.log('Development mode: API Base URL:', BASE_URL);
}

// Determine if we're in development or production
const isDevelopment = process.env.NEXT_PUBLIC_NODE_ENV !== 'production';

// 打印配置信息，帮助调试
// console.log('-------- API CONFIGURATION --------');
// console.log('BASE_URL:', BASE_URL);
// console.log('isDevelopment:', isDevelopment);
// console.log('withCredentials:', !isDevelopment);
// console.log('----------------------------------');

// 高级错误处理函数，格式化错误详情
const formatErrorDetails = (error: unknown): Record<string, unknown> => {
  try {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      return {
        type: 'AxiosError',
        message: axiosError.message,
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        url: axiosError.config?.url,
        method: axiosError.config?.method,
        data: axiosError.response?.data || '无响应数据', 
        code: axiosError.code,
        timestamp: new Date().toISOString()
      };
    } else if (error instanceof Error) {
      return {
        type: 'Error',
        name: error.name,
        message: error.message,
        stack: error.stack?.substring(0, 300), // 限制堆栈长度
        timestamp: new Date().toISOString()
      };
    } else {
      return {
        type: 'Unknown',
        value: typeof error === 'object' ? JSON.stringify(error) : String(error),
        timestamp: new Date().toISOString()
      };
    }
  } catch (formatError) {
    return {
      type: 'SerializationFailed',
      errorType: typeof error,
      formatError: String(formatError),
      timestamp: new Date().toISOString()
    };
  }
};

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // Increase timeout to 30 seconds to accommodate network delays
  withCredentials: !isDevelopment, // Only send credentials in production to avoid CORS issues in development
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// Debug helper functions - 改进日志记录
const logRequest = (config: {
  method?: string;
  url?: string;
  headers?: Record<string, unknown>;
  data?: unknown;
}) => {
  if (process.env.NEXT_PUBLIC_NODE_ENV === "development") {
    const sanitizedHeaders = { ...config.headers };
    
    // 隐藏敏感信息
    if (sanitizedHeaders.Authorization) {
      sanitizedHeaders.Authorization = 'Bearer [HIDDEN]';
    }
    
    const logColor = '\x1b[36m%s\x1b[0m'; // 蓝青色
    console.groupCollapsed(`${logColor}`, `📤 Request: ${config.method?.toUpperCase()} ${config.url}`);
    console.log('Headers:', sanitizedHeaders);
    
    // 针对表单数据特殊处理
    if (config.data instanceof FormData) {
      const formEntries: Record<string, string> = {};
      for (const [key, value] of (config.data as FormData).entries()) {
        formEntries[key] = value instanceof File 
          ? `File: ${value.name} (${value.size} bytes)`
          : String(value);
      }
      console.log('FormData:', formEntries);
    } else if (config.data) {
      console.log('Data:', config.data);
    }
    
    console.groupEnd();
  }
};

const logResponse = (response: {
  status: number;
  config: { url?: string; method?: string };
  data?: unknown;
  headers?: Record<string, unknown>;
}) => {
  if (process.env.NEXT_PUBLIC_NODE_ENV === "development") {
    const logColor = '\x1b[32m%s\x1b[0m'; // 绿色表示成功
    console.groupCollapsed(`${logColor}`, `📥 Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    
    if (response.headers) {
      // 将复杂的响应头类型转换为简单对象记录
      const headersObj: Record<string, string> = {};
      
      // 处理 Axios 响应头的各种可能类型
      try {
        // 如果是 Headers 对象或类似的可迭代对象
        if (typeof response.headers.forEach === 'function') {
          response.headers.forEach((value: unknown, key: string) => {
            headersObj[key] = String(value);
          });
        } 
        // 如果是普通对象
        else if (typeof response.headers === 'object') {
          Object.entries(response.headers).forEach(([key, value]) => {
            if (value !== undefined) {
              headersObj[key] = String(value);
            }
          });
        }
        
        console.log('Headers:', headersObj);
      } catch {
        console.log('Headers: [Could not format headers]');
      }
    }
    
    if (response.data) {
      // 如果数据量太大，只显示部分
      const dataStr = JSON.stringify(response.data);
      if (dataStr.length > 500) {
        console.log('Data (truncated):', JSON.stringify(response.data).substring(0, 500) + '...');
        console.log('Full data size:', dataStr.length, 'characters');
      } else {
        console.log('Data:', response.data);
      }
    }
    
    console.groupEnd();
  }
};

const logError = (error: unknown, context?: string) => {
  if (!error) return;
  
  const errorDetails = formatErrorDetails(error);
  const logColor = '\x1b[31m%s\x1b[0m'; // 红色表示错误
  const contextPrefix = context ? `[${context}] ` : '';
  
  console.groupCollapsed(`${logColor}`, `❌ ${contextPrefix}Error: ${errorDetails.status || ''} ${errorDetails.message || 'Unknown error'}`);
  console.error('Error details:', errorDetails);
  
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    console.log('Request URL:', axiosError.config?.url);
    console.log('Request method:', axiosError.config?.method);
    console.log('Request data:', axiosError.config?.data);
    
    if (axiosError.response) {
      console.log('Response status:', axiosError.response.status);
      console.log('Response data:', axiosError.response.data);
    }
  }
  
  console.groupEnd();
};

// Optimized request interceptor
api.interceptors.request.use(
  (config) => {
    // Skip adding auth headers for token-related endpoints to prevent circular dependencies
    const isAuthEndpoint = 
      config.url?.includes('/api/token/pair') || 
      config.url?.includes('/api/token/verify') || 
      config.url?.includes('/api/token/refresh');
    
    // We're now handling the login payload directly in the AuthContext with email/password fields
    // Make sure we don't modify the payload here
    
    // Dynamically handle FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    // Additional debug for token endpoints
    if (isAuthEndpoint) {
      console.log('Auth endpoint detected:', config.url);
      // console.log('Request payload:', config.data);
    }

    // Debug logs
    logRequest(config);

    // Optimized token handling - only add token for non-auth endpoints
    const token = getAccessToken();
    if (token && !isAuthEndpoint && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  error => {
    logError(error, 'Request Interceptor');
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  response => {
    logResponse(response);
    return response;
  },
  async error => {
    const originalRequest = error.config;
    
    logError(error, 'Response Interceptor');
    
    // Skip refresh token logic for auth endpoints to prevent infinite loops
    const isAuthEndpoint = 
      originalRequest.url?.includes('/api/token/pair') || 
      originalRequest.url?.includes('/api/token/verify') || 
      originalRequest.url?.includes('/api/token/refresh');

    // 401 handling logic - only attempt refresh for non-auth endpoints
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      // console.log('Attempting to refresh token due to 401 error');
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          console.error('No refresh token available');
          throw new Error("Missing refresh token");
        }

        // console.log('Sending refresh request');
        
        // Use an independent axios instance to avoid circular interception
        const refreshClient = axios.create({
          baseURL: BASE_URL,
          withCredentials: !isDevelopment,
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          }
        });
        
        const { data } = await refreshClient.post("/api/token/refresh", { 
          refresh: refreshToken 
        });

        // console.log('Token refresh successful, updating tokens');
        
        // Securely store new tokens
        setTokens(data.access, refreshToken);
        
        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        logError(refreshError, 'Token Refresh');
        
        // Clear tokens but don't force redirect
        removeTokens();
        
        return Promise.reject({
          message: "Session expired. Please login again.",
          status: 401,
          details: formatErrorDetails(refreshError)
        });
      }
    }

    // 构建标准化的错误结构
    const standardError = {
      code: error.response?.status || error.code || "NETWORK_ERROR",
      message: error.response?.data?.detail || error.message || "Unknown error occurred",
      status: error.response?.status,
      timestamp: new Date().toISOString(),
      url: error.config?.url,
      method: error.config?.method,
      details: formatErrorDetails(error)
    };

    return Promise.reject(standardError);
  }
);

export default api;