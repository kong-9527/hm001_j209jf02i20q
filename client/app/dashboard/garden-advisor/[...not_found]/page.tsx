'use client';

import { useEffect } from 'react';
import { notFound } from 'next/navigation';

// 设置为force-dynamic确保页面在服务器端渲染
export const dynamic = 'force-dynamic';

export default function NotFoundCatchAll() {
  useEffect(() => {
    // 记录捕获到的404请求
    console.log('捕获到未匹配的路径，重定向到404页面');
  }, []);

  // 调用notFound函数触发404页面
  return notFound();
} 