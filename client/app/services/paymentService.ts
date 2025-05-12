import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

// 查询支付状态
export const getPaymentStatus = async (checkoutId: string) => {
  try {
    const response = await api.get(`/payment/status/${checkoutId}`);
    return response.data;
  } catch (error) {
    console.error('查询支付状态失败:', error);
    throw error;
  }
};

// 获取用户订单
export const getUserOrders = async () => {
  try {
    const response = await api.get('/payment/user-orders');
    return response.data;
  } catch (error) {
    console.error('获取用户订单失败:', error);
    throw error;
  }
};

export default {
  createCheckout,
  getPaymentStatus,
  getUserOrders
}; 