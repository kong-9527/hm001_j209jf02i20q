'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthSuccessPage() {
  const router = useRouter();
  
  useEffect(() => {
    // 检测是否是从弹窗中打开的
    if (window.opener) {
      // 尝试关闭窗口
      window.close();
    } else {
      // 如果不是从弹窗打开的，重定向到仪表板
      router.push('/dashboard');
    }
  }, [router]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">登录成功</h1>
      <p className="text-center mb-4">您已成功登录，正在重定向到仪表板...</p>
    </div>
  );
} 