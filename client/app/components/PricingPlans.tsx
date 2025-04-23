'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface PricingPlan {
  name: string;
  description: string;
  originalPrice?: number;
  price: number | string;
  period?: string;
  yearlyPrice?: string;
  photosCount?: string;
  features: PlanFeature[];
  buttonText: string;
  buttonLink: string;
  isPrimary?: boolean;
  showViewBilling?: boolean;
}

interface PricingPlansProps {
  title: string;
}

const PricingPlans: React.FC<PricingPlansProps> = ({ title }) => {
  const [isYearly, setIsYearly] = useState(true);

  const plans: PricingPlan[] = [
    {
      name: 'Pay As You Go',
      description: 'For individuals who want flexibility without a subscription.',
      price: '$15',
      period: 'one-time',
      photosCount: 'Take 15 AI Photos (credits)',
      features: [
        { text: 'No custom styles', included: true },
        { text: 'Personal-use only', included: true },
        { text: 'Includes watermark', included: true },
        { text: '1 project', included: true },
        { text: '1 generation at a time', included: true },
        { text: 'Basic support', included: true },
        { text: 'No commitment', included: true },
        { text: 'Access to AI Plant Advisor', included: true },
      ],
      buttonText: 'Buy Now',
      buttonLink: '/checkout/pay-as-you-go',
    },
    {
      name: 'Starter',
      description: 'Ideal entry-level plan for consistent design generation.',
      originalPrice: 19,
      price: 9,
      period: '/month',
      yearlyPrice: 'billed yearly $99',
      photosCount: 'Take 50 AI Photos (per month)',
      features: [
        { text: 'Create your own styles', included: true },
        { text: 'Personal-use only', included: true },
        { text: 'No watermark', included: true },
        { text: 'Up to 4 projects', included: true },
        { text: 'Up to 4 parallel generations', included: true },
        { text: 'Standard support', included: true },
        { text: 'Early feature access', included: true },
        { text: 'Access to AI Plant Advisor', included: true },
      ],
      buttonText: 'Subscribe →',
      buttonLink: '/checkout/starter',
      showViewBilling: true,
    },
    {
      name: 'Pro',
      description: 'Perfect for professionals requiring advanced features.',
      originalPrice: 49,
      price: 21,
      period: '/month',
      yearlyPrice: 'billed yearly $249',
      photosCount: 'Take 200 AI Photos (per month)',
      features: [
        { text: 'Create your own styles', included: true },
        { text: 'Commercial license', included: true },
        { text: 'No watermark', included: true },
        { text: 'Up to 50 projects', included: true },
        { text: 'Up to 8 parallel generations', included: true },
        { text: 'Priority support', included: true },
        { text: 'Early feature access', included: true },
        { text: 'Access to AI Plant Advisor', included: true },
      ],
      buttonText: 'Subscribe →',
      buttonLink: '/checkout/pro',
      isPrimary: true,
      showViewBilling: true,
    },
    {
      name: 'Premium',
      description: 'Comprehensive solution for serious creators and businesses.',
      originalPrice: 99,
      price: 42,
      period: '/month',
      yearlyPrice: 'billed yearly $499',
      photosCount: 'Take 500 AI Photos (per month)',
      features: [
        { text: 'Create your own styles', included: true },
        { text: 'Commercial license', included: true },
        { text: 'No watermark', included: true },
        { text: 'Up to 1000 projects', included: true },
        { text: 'Up to 16 parallel generations', included: true },
        { text: 'Priority support', included: true },
        { text: 'Early feature access', included: true },
        { text: 'Access to AI Plant Advisor', included: true },
      ],
      buttonText: 'Subscribe →',
      buttonLink: '/checkout/premium',
      showViewBilling: true,
    },
  ];

  return (
    <section id="pricing" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">{title}</h2>
        </div>

        {/* 计费周期切换 */}
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

        {/* 定价卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`rounded-lg overflow-hidden ${
                plan.isPrimary 
                  ? 'border-2 border-teal-600 shadow-lg' 
                  : 'border border-gray-200 shadow-sm'
              }`}
            >
              <div className={`px-6 py-8 ${plan.isPrimary ? 'bg-gray-50' : 'bg-white'}`}>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 h-12 mb-4">{plan.description}</p>
                
                <div className="mb-6">
                  {plan.originalPrice && (
                    <span className="text-gray-400 line-through text-sm">
                      ${plan.originalPrice}/month
                    </span>
                  )}
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    {plan.period && (
                      <span className="ml-1 text-gray-600">{plan.period}</span>
                    )}
                  </div>
                  {plan.yearlyPrice && (
                    <div className="text-sm text-gray-500 mt-1">
                      {plan.yearlyPrice}
                    </div>
                  )}
                </div>

                {plan.photosCount && (
                  <div className="py-3 px-4 bg-gray-50 rounded-lg text-center mb-6 text-gray-700">
                    {plan.photosCount}
                  </div>
                )}

                <Link 
                  href={plan.buttonLink}
                  className={`block w-full text-center py-3 px-4 rounded-md font-medium transition-colors ${
                    plan.isPrimary
                      ? 'bg-teal-600 hover:bg-teal-700 text-white'
                      : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-800'
                  }`}
                >
                  {plan.buttonText}
                </Link>

                {plan.showViewBilling && (
                  <div className="text-center mt-4">
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                      View monthly billing →
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 px-6 py-8">
                <p className="font-medium text-gray-700 mb-4">Features:</p>
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
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
                      <span className="text-gray-600">{feature.text}</span>
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