'use client';

import { useState } from 'react';

export default function BillingPage() {
  // 假设这些数据从后端获取
  const currentCredits = 42;
  const subscriptionData = [
    { 
      id: 1, 
      pricingVersion: 'Month Subscription', 
      receivedCredits: 50, 
      refreshDate: '2025/5/11', 
      purchasedDate: '2025/4/12' 
    },
    { 
      id: 2, 
      pricingVersion: 'Month Subscription', 
      receivedCredits: 50, 
      refreshDate: '2025/5/11', 
      purchasedDate: '2025/4/12' 
    },
    { 
      id: 3, 
      pricingVersion: 'Month Subscription', 
      receivedCredits: 50, 
      refreshDate: '2025/5/11', 
      purchasedDate: '2025/4/12' 
    }
  ];

  return (
    <div className="ml-0">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Orders And Services</h1>

      <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-gray-700 mr-2 font-medium">Credits:</span>
              <span className="text-emerald-600 font-medium">{currentCredits}</span>
            </div>
            <div className="flex gap-2">
              <button className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md transition">
                Purchase
              </button>
              <button className="px-5 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-md transition">
                View Pricing
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left bg-gray-50">
                <th className="px-6 py-3 text-gray-500 font-medium text-sm">Pricing Version</th>
                <th className="px-6 py-3 text-gray-500 font-medium text-sm">Received Credits</th>
                <th className="px-6 py-3 text-gray-500 font-medium text-sm">Refresh Date</th>
                <th className="px-6 py-3 text-gray-500 font-medium text-sm">Purchased Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {subscriptionData.map((subscription) => (
                <tr key={subscription.id}>
                  <td className="px-6 py-4 text-gray-700">{subscription.pricingVersion}</td>
                  <td className="px-6 py-4 text-gray-700">{subscription.receivedCredits}</td>
                  <td className="px-6 py-4 text-gray-700">{subscription.refreshDate}</td>
                  <td className="px-6 py-4 text-gray-700">{subscription.purchasedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center mt-8 text-sm text-gray-500">
        Secure payment provided by Stripe
      </div>
    </div>
  );
} 