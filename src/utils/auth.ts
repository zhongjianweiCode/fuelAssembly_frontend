import Cookies from 'js-cookie';

// 存储 token
export const setTokens = (accessToken: string, refreshToken: string) => {
  console.log('Setting tokens:', { accessToken, refreshToken }); // 调试日志
  Cookies.set('accessToken', accessToken, { expires: 1 });  // 1天过期
  Cookies.set('refreshToken', refreshToken, { expires: 7 }); // 7天过期
};

// 读取 access token
export const getAccessToken = (): string | undefined => {
  return Cookies.get('accessToken');
};

// 读取 refresh token
export const getRefreshToken = (): string | undefined => {
  return Cookies.get('refreshToken');
};

// 删除 token
export const removeTokens = () => {
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');
};