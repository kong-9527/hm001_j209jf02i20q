import axios from 'axios';

// 使用固定的API URL
const DEFAULT_API_URL = 'https://aigardendesign.vercel.app/api';
const API_URL = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;

console.log('API配置URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,  // 允许跨域请求携带凭证
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 从localStorage或cookie中获取token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API请求错误:', error);
    return Promise.reject(error);
  }
);

export default api;