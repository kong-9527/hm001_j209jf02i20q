'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUserOrders } from '../../services/paymentService';
import { createCheckout } from '../../services/paymentService';
import { getCurrentUser } from '../../services/authService';
import { format } from 'date-fns';

// 定义订单数据类型
interface OrderData {
  id: number;
  goods_id: number | null;
  points_num: number | null;
  member_end_date: string | null;
  ctime: number | null;
  goods?: {
    goods_name: string | null;
  };
}

export default function BillingPage() {
  const router = useRouter();
  const [currentCredits, setCurrentCredits] = useState<number>(0);
  const [subscriptionData, setSubscriptionData] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<number | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await getUserOrders();
        if (response.success) {
          setSubscriptionData(response.data || []);
          
          // 计算当前积分总数
          let totalCredits = 0;
          response.data.forEach((order: OrderData) => {
            if (order.points_num) {
              totalCredits += order.points_num;
            }
          });
          setCurrentCredits(totalCredits);
        }
      } catch (err) {
        setError('加载订单数据失败');
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // 格式化日期函数
  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return '-';
    
    // 将Unix时间戳转换为毫秒
    const date = new Date(timestamp * 1000);
    return format(date, 'yyyy/MM/dd');
  };

  // 处理购买按钮点击
  const handlePurchase = async () => {
    // 如果没有订单数据，则返回
    if (subscriptionData.length === 0) return;
    
    // 获取最新一条订单的goods_id
    const latestOrder = subscriptionData[0];
    if (!latestOrder || !latestOrder.goods_id || isSubmitting !== null) return;
    
    try {
      // 设置正在提交的商品ID
      setIsSubmitting(latestOrder.goods_id);
      
      // 检查用户是否已登录
      const user = await getCurrentUser();
      
      if (!user) {
        // 用户未登录，跳转到登录页面
        router.push('/signin');
        return;
      }
      
      // 用户已登录，创建支付订单并获取支付链接
      const result = await createCheckout(latestOrder.goods_id);
      
      if (result && result.success && result.checkoutUrl) {
        // 跳转到支付平台页面
        window.location.href = result.checkoutUrl;
      } else {
        console.error('获取支付链接失败', result);
        setError('获取支付链接失败，请稍后再试');
      }
    } catch (err) {
      console.error('购买处理失败:', err);
      setError('购买请求失败，请稍后再试');
    } finally {
      setIsSubmitting(null);
    }
  };

  return (
    <div className="w-full min-h-full">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Orders And Services</h1>

      <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-gray-700 mr-2 font-medium">Points:</span>
              <span className="text-emerald-600 font-medium">{currentCredits}</span>
            </div>
            <div className="flex gap-2">
              {subscriptionData.length > 0 && (
                <button 
                  onClick={handlePurchase}
                  disabled={isSubmitting !== null}
                  className={`px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md transition ${
                    isSubmitting !== null ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting !== null ? 'Processing...' : 'Purchase'}
                </button>
              )}
              <Link 
                href="/dashboard/pricing"
                className="px-5 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-md transition inline-flex items-center"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : subscriptionData.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No subscription data available</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left bg-gray-50">
                  <th className="px-6 py-3 text-gray-500 font-medium text-sm">Pricing Version</th>
                  <th className="px-6 py-3 text-gray-500 font-medium text-sm">Received Points</th>
                  <th className="px-6 py-3 text-gray-500 font-medium text-sm">Refresh Date</th>
                  <th className="px-6 py-3 text-gray-500 font-medium text-sm">Purchased Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subscriptionData.map((subscription) => (
                  <tr key={subscription.id}>
                    <td className="px-6 py-4 text-gray-700">{subscription.goods?.goods_name || '-'}</td>
                    <td className="px-6 py-4 text-gray-700">{subscription.points_num || '-'}</td>
                    <td className="px-6 py-4 text-gray-700">{subscription.member_end_date ? format(new Date(subscription.member_end_date), 'yyyy/MM/dd') : '-'}</td>
                    <td className="px-6 py-4 text-gray-700">{formatDate(subscription.ctime)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="text-center mt-8 text-sm text-gray-500 pb-4">
        Secure payment provided by Creem
      </div>
    </div>
  );
} 