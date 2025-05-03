'use client';

import { useEffect } from 'react';
import PricingPlans from '../../components/PricingPlans';

export default function PricingPage() {
  // 添加自定义样式使PricingPlans可以在main元素内滚动
  useEffect(() => {
    // 添加自定义样式
    const style = document.createElement('style');
    style.id = 'pricing-page-style';
    style.innerHTML = `
      #pricing {
        padding-top: 0;
        padding-bottom: 2rem;
      }
      .pricing-content {
        width: 100%;
        height: 100%;
      }
    `;
    document.head.appendChild(style);

    // 清理样式
    return () => {
      const existingStyle = document.getElementById('pricing-page-style');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  return (
    <div className="pricing-content">
      <div className="w-full">
        <PricingPlans title="" />
      </div>
    </div>
  );
} 