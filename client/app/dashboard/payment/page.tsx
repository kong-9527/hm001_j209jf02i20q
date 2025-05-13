'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 支付状态类型
type PaymentStatus = 'success' | 'pending' | 'error' | 'loading';

// 支付状态数据
interface PaymentStatusData {
  status: PaymentStatus;
  orderNumber?: string;
  goodsName?: string;
  message?: string;
}

export default function PaymentResultPage() {
  const searchParams = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusData>({
    status: 'loading',
    message: 'Verifying payment status...'
  });

  useEffect(() => {
    const processPayment = async () => {
      // 从URL获取支付平台返回的参数
      const checkoutId = searchParams.get('checkout_id');
      const signature = searchParams.get('signature');
      
      // 如果没有提供必要参数，显示错误
      if (!checkoutId) {
        setPaymentStatus({
          status: 'error',
          message: 'Invalid payment information. Missing checkout ID.'
        });
        return;
      }

      try {
        // 构建回调参数对象，将URL中的所有参数发送给后端
        const callbackData: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          callbackData[key] = value;
        });

        // 将回调参数发送到后端处理
        const response = await axios.post(`${API_URL}/payment/callback`, callbackData, {
          withCredentials: true
        });

        // 根据回调处理结果设置支付状态
        if (response.data.success) {
          setPaymentStatus({
            status: response.data.status,
            message: response.data.message,
            orderNumber: response.data.orderNumber,
            goodsName: response.data.goodsName
          });
        } else {
          // 回调处理失败，显示错误信息
          setPaymentStatus({
            status: 'error',
            message: response.data.message || 'Failed to process payment callback'
          });
        }
      } catch (error) {
        console.error('Error processing payment:', error);
        setPaymentStatus({
          status: 'error',
          message: 'An error occurred while processing your payment'
        });
      }
    };

    processPayment();
  }, [searchParams]);

  // 根据支付状态渲染不同的内容
  const renderStatusContent = () => {
    switch (paymentStatus.status) {
      case 'success':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your purchase of <span className="font-medium">{paymentStatus.goodsName}</span>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Order Number: <span className="font-medium">{paymentStatus.orderNumber}</span>
            </p>
            <Link 
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              Go to Dashboard
            </Link>
          </div>
        );
      
      case 'pending':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Processing</h2>
            <p className="text-gray-600 mb-6">
              Your payment is being processed. Please check back later.
            </p>
            {paymentStatus.orderNumber && (
              <p className="text-sm text-gray-500 mb-6">
                Order Number: <span className="font-medium">{paymentStatus.orderNumber}</span>
              </p>
            )}
            <Link 
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              Go to Dashboard
            </Link>
          </div>
        );
      
      case 'error':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h2>
            <p className="text-gray-600 mb-6">
              {paymentStatus.message || 'There was an error processing your payment.'}
            </p>
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 justify-center">
              <Link 
                href="/dashboard/pricing"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Try Again
              </Link>
              <Link 
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        );
      
      case 'loading':
      default:
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 mb-4">
              <svg className="animate-spin h-6 w-6 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
            <p className="text-gray-600">
              Please wait while we verify your payment status...
            </p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
      <div className="bg-white shadow sm:rounded-lg p-6">
        {renderStatusContent()}
      </div>
    </div>
  );
} 