'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getPricingPlans } from '../services/goodsService';
import { createCheckout } from '../services/paymentService';
import { getCurrentUser } from '../services/authService';

interface PlanFeature {
  feature: string;
}

interface PricingPlan {
  id: number;
  goods_name: string;
  goods_description: string;
  price_original?: number;
  price_compare?: number;
  price_pay: number;
  price_per_month: number;
  design_num: number;
  goods_version: number;
  during: number;
  creem_product_id: string;
  features: PlanFeature[];
  buttonText?: string;
  buttonLink?: string;
  isPrimary?: boolean;
  photosCount?: string;
  period?: string;
  yearlyPrice?: string;
  showViewBilling?: boolean;
}

interface PricingPlansProps {
  title?: string;
}

const PricingPlans: React.FC<PricingPlansProps> = ({ title = "Subscription Plans" }) => {
  const router = useRouter();
  const [isYearly, setIsYearly] = useState(true);
  const [allPlans, setAllPlans] = useState<PricingPlan[]>([]);
  const [displayPlans, setDisplayPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<number | null>(null);
  const [hasMonthlyPlans, setHasMonthlyPlans] = useState(false);
  const [hasYearlyPlans, setHasYearlyPlans] = useState(false);

  useEffect(() => {
    // 从数据库获取价格数据
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const data = await getPricingPlans();
        
        if (data) {
          // 处理从API获取的数据
          const formattedPlans = data.map((plan: any) => {
            // 确保features是一个数组
            let parsedFeatures = [];
            try {
              // 如果features是字符串，尝试解析
              if (typeof plan.features === 'string') {
                parsedFeatures = JSON.parse(plan.features);
              } else if (Array.isArray(plan.features)) {
                parsedFeatures = plan.features;
              }
            } catch (e) {
              console.error('解析features失败:', e);
              parsedFeatures = [];
            }
            
            return {
              ...plan,
              // 格式化显示文本
              isPrimary: plan.goods_name === 'Pro', // 设置Pro计划为主要计划
              buttonText: 'Subscribe →',
              buttonLink: `/checkout/${plan.goods_name.toLowerCase()}?id=${plan.id}&version=${plan.goods_version}&product=${plan.creem_product_id}`,
              period: '/month',
              // 确保价格为数字
              price_per_month: parseFloat(plan.price_per_month),
              price_pay: parseFloat(plan.price_pay),
              price_compare: plan.price_compare ? parseFloat(plan.price_compare) : null,
              photosCount: `Take ${plan.design_num} AI Photos (per month)`,
              showViewBilling: true,
              features: parsedFeatures
            };
          });
          
          // 检查是否存在月付和年付选项
          const monthlyPlans = formattedPlans.filter((plan: PricingPlan) => plan.goods_version === 1);
          const yearlyPlans = formattedPlans.filter((plan: PricingPlan) => plan.goods_version === 2);
          
          setHasMonthlyPlans(monthlyPlans.length > 0);
          setHasYearlyPlans(yearlyPlans.length > 0);
          
          // 如果只有月付或只有年付，自动设置isYearly
          if (yearlyPlans.length > 0 && monthlyPlans.length === 0) {
            setIsYearly(true);
          } else if (monthlyPlans.length > 0 && yearlyPlans.length === 0) {
            setIsYearly(false);
          }
          
          setAllPlans(formattedPlans);
          // 根据当前选择的计费周期筛选计划
          filterPlansByBillingCycle(formattedPlans, isYearly);
        }
      } catch (err) {
        console.error('Failed to fetch pricing plans:', err);
        setError('Failed to load pricing plans. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // 根据计费周期筛选计划
  const filterPlansByBillingCycle = (plans: PricingPlan[], yearly: boolean) => {
    // yearly对应goods_version=2，monthly对应goods_version=1
    const version = yearly ? 2 : 1;
    const filtered = plans.filter(plan => plan.goods_version === version);
    setDisplayPlans(filtered);
  };

  // 当计费周期改变时，更新显示的计划
  useEffect(() => {
    if (allPlans.length > 0) {
      filterPlansByBillingCycle(allPlans, isYearly);
    }
  }, [isYearly, allPlans]);

  // 切换计费周期
  const toggleBillingCycle = () => {
    setIsYearly(!isYearly);
  };

  // 处理订阅按钮点击
  const handleSubscribe = async (goodsId: number) => {
    try {
      setIsSubmitting(goodsId);
      
      // 检查用户是否已登录
      const user = await getCurrentUser();
      
      if (!user) {
        // 用户未登录，跳转到登录页面
        router.push('/signin');
        return;
      }
      
      // 用户已登录，创建支付订单并获取支付链接
      const result = await createCheckout(goodsId);
      
      if (result && result.success && result.checkoutUrl) {
        // 跳转到支付平台页面
        window.location.href = result.checkoutUrl;
      } else {
        console.error('获取支付链接失败');
        alert('获取支付链接失败，请稍后再试');
      }
    } catch (error) {
      console.error('订阅过程中发生错误:', error);
      alert('订阅失败，请稍后再试');
    } finally {
      setIsSubmitting(null);
    }
  };

  // 加载状态显示
  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-6"></div>
            <div className="flex flex-wrap justify-center gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-full md:w-80 h-96 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // 错误状态显示
  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-red-500 mb-4">
            <p>{error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">{title}</h2>
          </div>
        )}

        {/* 计费周期切换 - 仅当同时存在月付和年付选项时显示 */}
        {hasMonthlyPlans && hasYearlyPlans && (
          <div className="flex justify-center mb-12">
            <div className="inline-flex rounded-full p-1 bg-gray-100">
              <button
                className={`px-6 py-2 rounded-full text-sm font-medium flex items-center ${
                  isYearly 
                    ? 'bg-teal-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setIsYearly(true)}
              >
                <span className="mr-2">🔥</span> Yearly: Get 6+ months free
              </button>
              <button
                className={`px-6 py-2 rounded-full text-sm font-medium ${
                  !isYearly 
                    ? 'bg-teal-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setIsYearly(false)}
              >
                Monthly
              </button>
            </div>
          </div>
        )}
        
        {/* 仅年付选项 */}
        {hasYearlyPlans && !hasMonthlyPlans && (
          <div className="flex justify-center mb-12">
            <div className="inline-flex rounded-full p-1 bg-gray-100">
              <div className="px-6 py-2 rounded-full text-sm font-medium flex items-center bg-teal-600 text-white">
                <span className="mr-2">🔥</span> Yearly: Get 6+ months free
              </div>
            </div>
          </div>
        )}
        
        {/* 仅月付选项 */}
        {hasMonthlyPlans && !hasYearlyPlans && (
          <div className="flex justify-center mb-12">
            <div className="inline-flex rounded-full p-1 bg-gray-100">
              <div className="px-6 py-2 rounded-full text-sm font-medium bg-teal-600 text-white">
                Monthly
              </div>
            </div>
          </div>
        )}

        {/* 定价卡片 */}
        <div className="flex flex-wrap justify-center gap-6">
          {displayPlans.map((plan, index) => (
            <div 
              key={index}
              className={`rounded-lg overflow-hidden w-full md:w-80 ${
                plan.isPrimary 
                  ? 'border-2 border-teal-600 shadow-lg' 
                  : 'border border-gray-200 shadow-sm'
              }`}
            >
              <div className={`px-6 py-8 ${plan.isPrimary ? 'bg-gray-50' : 'bg-white'}`}>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.goods_name}</h3>
                <p className="text-gray-600 h-12 mb-4">{plan.goods_description}</p>
                
                <div className="mb-6">
                  {plan.price_compare && plan.price_per_month < plan.price_compare && (
                    <span className="text-gray-400 line-through text-sm">
                      ${plan.price_compare}/month
                    </span>
                  )}
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">
                      ${plan.price_per_month}
                    </span>
                    {plan.period && (
                      <span className="ml-1 text-gray-600">{plan.period}</span>
                    )}
                  </div>
                  {isYearly && (
                    <div className="text-sm text-gray-500 mt-1">
                      billed yearly ${plan.price_pay}
                    </div>
                  )}
                </div>

                {plan.photosCount && (
                  <div className="py-3 px-4 bg-gray-50 rounded-lg text-center mb-6 text-gray-700">
                    {plan.photosCount}
                  </div>
                )}

                <button 
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isSubmitting === plan.id}
                  className={`block w-full text-center py-3 px-4 rounded-md font-medium transition-colors ${
                    plan.isPrimary
                      ? 'bg-teal-600 hover:bg-teal-700 text-white'
                      : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-800'
                  } ${isSubmitting === plan.id ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting === plan.id ? 'Processing...' : (plan.buttonText || 'Subscribe →')}
                </button>

                {plan.showViewBilling && hasMonthlyPlans && hasYearlyPlans && (
                  <div className="text-center mt-4">
                    <button 
                      className="text-sm text-gray-500 hover:text-gray-700"
                      onClick={toggleBillingCycle}
                    >
                      {isYearly ? 'View monthly billing →' : 'View yearly billing →'}
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 px-6 py-8">
                <p className="font-medium text-gray-700 mb-4">Features:</p>
                <ul className="space-y-3">
                  {plan.features && plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <svg
                        className="h-5 w-5 text-teal-500 mr-2 mt-0.5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-600">{feature.feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingPlans; 