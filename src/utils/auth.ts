import Cookies from "js-cookie";

// 获取根域名（适用于 railway.app 或自定义域）
const getDomain = () => {
  if (typeof window === "undefined") return ""; // SSR 保护

  const hostname = window.location.hostname;
  
  // 本地开发环境不设置域名
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return undefined;
  }
  
  // 处理 Railway 生产域名
  if (hostname === 'skdjangobackend-production.up.railway.app') {
    return 'skdjangobackend-production.up.railway.app';
  }
  
  // 处理 railway.app 域名格式（如：myapp-production.up.railway.app）
  const hostParts = hostname.split(".");
  if (hostParts.slice(-3).join(".") === "up.railway.app") {
    // 在Railway上，我们通常不设置带点的域名，因为这是不同的应用
    return hostname;
  }
  
  // 处理自定义域名（如：api.example.com -> .example.com）
  return hostParts.length > 1 ? `.${hostParts.slice(-2).join(".")}` : "";
};

// 判断是否使用安全属性的辅助函数
const isSecureEnvironment = () => {
  if (typeof window === "undefined") return false;
  return window.location.protocol === 'https:';
};

// 存储 token（生产环境安全强化）
export const setTokens = (accessToken: string, refreshToken: string) => {
  const domain = getDomain();
  const isSecure = isSecureEnvironment();
  
  console.log("Setting tokens with domain:", domain, "isSecure:", isSecure);
  console.log("Access token (first 10 chars):", accessToken.substring(0, 10) + '...');
  console.log("Refresh token (first 10 chars):", refreshToken.substring(0, 10) + '...');
  
  // 基本 Cookie 选项
  const cookieOptions: Cookies.CookieAttributes = {
    expires: 1, // 1天
    path: "/",
  };
  
  // 针对不同环境进行设置
  if (domain) {
    cookieOptions.domain = domain;
  }
  
  // 在适当情况下添加安全设置
  if (isSecure) {
    cookieOptions.secure = true;
  }
  
  // 设置 SameSite 属性 - 默认使用 Lax，在 Chrome、Safari、Firefox 中都能正常工作
  cookieOptions.sameSite = 'Lax';

  console.log("Cookie options:", cookieOptions);
  
  // 设置 token
  try {
    Cookies.set("accessToken", accessToken, cookieOptions);
    const refreshOptions = { ...cookieOptions, expires: 7 }; // 7天
    Cookies.set("refreshToken", refreshToken, refreshOptions);
    console.log("Tokens saved successfully");
  } catch (error) {
    console.error("Error saving tokens:", error);
  }
};

// 读取 token
export const getAccessToken = () => {
  try {
    const token = Cookies.get("accessToken");
    if (token) {
      console.log("Access token found (first 10 chars):", token.substring(0, 10) + '...');
    } else {
      console.log("No access token found");
    }
    return token || null;
  } catch (error) {
    console.error("Error reading access token:", error);
    return null;
  }
};

export const getRefreshToken = () => {
  try {
    const token = Cookies.get("refreshToken");
    if (token) {
      console.log("Refresh token found (first 10 chars):", token.substring(0, 10) + '...');
    } else {
      console.log("No refresh token found");
    }
    return token || null;
  } catch (error) {
    console.error("Error reading refresh token:", error);
    return null;
  }
};

// 删除 token
export const removeTokens = () => {
  try {
    const domain = getDomain();
    const options: Cookies.CookieAttributes = { path: "/" };
    
    if (domain) {
      options.domain = domain;
    }

    Cookies.remove("accessToken", options);
    Cookies.remove("refreshToken", options);
    console.log("Tokens removed successfully");
  } catch (error) {
    console.error("Error removing tokens:", error);
  }
};
