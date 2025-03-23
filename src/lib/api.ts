import axios from "axios";
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

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // Increase timeout to 30 seconds to accommodate network delays
  withCredentials: !isDevelopment, // Only send credentials in production to avoid CORS issues in development
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// Debug helper functions
const logRequest = (config: {
  method?: string;
  url?: string;
  headers?: Record<string, unknown>;
  data?: unknown;
}) => {
  if (process.env.NEXT_PUBLIC_NODE_ENV === "development") {
    console.groupCollapsed(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    // console.log('Headers:', config.headers);
    // console.log('Data:', config.data);
    console.groupEnd();
  }
};

const logResponse = (response: {
  status: number;
  config: { url?: string };
  data?: unknown;
}) => {
  if (process.env.NEXT_PUBLIC_NODE_ENV === "development") {
    // console.log(`📥 ${response.status} ${response.config.url}`, response.data);
    console.log(`📥 ${response.status}`);
  }
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
  error => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  response => {
    logResponse(response);
    return response;
  },
  async error => {
    const originalRequest = error.config;
    
    console.warn('API Error:', error.response?.status, error.response?.config?.url);
    
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
        console.error('Token refresh failed:', refreshError);
        
        // Clear tokens but don't force redirect
        removeTokens();
        
        return Promise.reject({
          message: "Session expired. Please login again.",
          status: 401
        });
      }
    }

    // Other error handling
    return Promise.reject({
      code: error.response?.status || "NETWORK_ERROR",
      message: error.response?.data?.detail || "Unknown error occurred",
      status: error.response?.status,
      raw: error
    });
  }
);

export default api;