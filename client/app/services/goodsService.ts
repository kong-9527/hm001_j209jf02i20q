import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// 配置axios实例
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // 允许跨域请求携带凭证（Cookies）
});

// 获取所有定价计划
export const getPricingPlans = async () => {
  try {
    const response = await api.get('/goods/pricing-plans');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch pricing plans:', error);
    return null;
  }
};

export default {
  getPricingPlans,
}; 