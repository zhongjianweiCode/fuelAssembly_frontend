import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  removeTokens,
} from "@/utils/auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

// create a new instance of axios with a custom config
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器
// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Do something before request is sent
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 如果是 FormData，删除 Content-Type header
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];  // 让浏览器自动设置正确的 Content-Type
    }

    // 开发环境日志
    if (process.env.NODE_ENV === "development") {
      console.log(
        `📤 send request: ${config.method?.toUpperCase()}, url:${BASE_URL}${config.url}`,
        '\nHeaders:', config.headers,
        '\nData:', config.data
      );
    }
    return config;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error);
  }
);

// 响应拦截器
// Add a response interceptor
api.interceptors.response.use(
  // Any status code that lie within the range of 2xx cause this function to trigger
  // Do something with response data
  (response) => {
    // 开发环境日志
    if (process.env.NODE_ENV === "development") {
      console.log(
        `📥 recieve response: ${response.status}, url: ${BASE_URL}${response.config.url}`
      );
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 处理401错误且不是认证相关端点
    // 1. 处理 401 未授权错误
    if (
      // Any status codes that falls outside the range of 2xx cause this function to trigger
      // Do something with response error
      error.response?.status === 401 &&
      !originalRequest.url.includes("/token/") &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // 2. 尝试刷新访问令牌
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw new Error("No refresh token");
        // `data` is the response that was provided by the server,data: {},
        const { data } = await api.post("/api/token/refresh", {
          refresh: refreshToken,
        });

        // 3. 存储新令牌
        setTokens(data.access, refreshToken);
        // 4. 重试原始请求
        originalRequest.headers.Authorization = `Bearer ${data.access}`;

        return api(originalRequest);
      } catch (refreshError) {
        // 5. 刷新失败时清除令牌并跳转登录
        removeTokens();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
