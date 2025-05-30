'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function NotFound() {
  useEffect(() => {
    // 记录404错误
    console.log('显示自定义404页面');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">页面未找到</h2>
        <p className="text-gray-600 mb-8">
          抱歉，您请求的页面不存在或已被移除。
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            href="/"
            className="px-6 py-3 bg-primary text-white rounded-md hover:bg-green-700 transition-colors"
          >
            返回首页
          </Link>
          <Link 
            href="/dashboard"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            进入控制台
          </Link>
        </div>
      </div>
    </div>
  );
} 