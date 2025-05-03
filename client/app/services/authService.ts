import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// 配置 axios 实例
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // 允许跨域请求携带凭证（Cookie）
});

// 获取当前登录用户信息
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
};

// 用户登出
export const logout = async () => {
  try {
    await api.get('/auth/logout');
    return true;
  } catch (error) {
    console.error('登出失败:', error);
    return false;
  }
};

// 谷歌登录 URL
export const getGoogleLoginUrl = () => {
  return `${API_URL}/auth/google`;
};

export default {
  getCurrentUser,
  logout,
  getGoogleLoginUrl,
}; 