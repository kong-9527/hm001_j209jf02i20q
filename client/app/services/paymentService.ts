import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// 配置axios实例
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // 允许跨域请求携带凭证(Cookies)
});

// 创建支付订单并获取支付链接
export const createCheckout = async (goodsId: number) => {
  try {
    const response = await api.post('/payment/checkout', { goodsId });
    return response.data;
  } catch (error) {
    // 判断是否需要重定向到登录页面
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const redirectUrl = error.response.data.redirect;
      if (redirectUrl) {
        window.location.href = redirectUrl;
        return null;
      }
    }
    console.error('创建支付订单失败:', error);
    throw error;
  }
};

export default {
  createCheckout,
}; 