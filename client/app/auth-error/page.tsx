'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthErrorPage() {
  const router = useRouter();
  
  useEffect(() => {
    // 检测是否是从弹窗中打开的
    if (window.opener) {
      // 尝试关闭窗口
      window.close();
    } else {
      // 如果不是从弹窗打开的，重定向到登录页
      router.push('/signin');
    }
  }, [router]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4 text-red-600">登录失败</h1>
      <p className="text-center mb-4">登录过程中出现了问题，请重试...</p>
    </div>
  );
} 