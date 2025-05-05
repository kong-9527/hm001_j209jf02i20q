'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../contexts/UserContext';

export default function AuthSuccessPage() {
  const router = useRouter();
  const { refreshUser, isAuthenticated } = useUser();
  
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // 强制刷新用户状态
        await refreshUser();
        
        // 检测是否是从弹窗中打开的
        if (window.opener) {
          try {
            // 通知父窗口刷新用户状态
            if (window.opener.refreshUserAfterAuth) {
              window.opener.refreshUserAfterAuth();
            }
          } catch (e) {
            console.error('无法通知父窗口:', e);
          }
          
          // 尝试关闭窗口
          window.close();
        }
        
        // 如果窗口没有关闭或不是从弹窗打开的，直接重定向
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
      } catch (error) {
        console.error('登录后重定向失败:', error);
        // 即使出错也尝试重定向
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      }
    };
    
    handleRedirect();
  }, [router, refreshUser]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">登录成功</h1>
      <p className="text-center mb-4">您已成功登录，正在重定向到仪表板...</p>
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mt-4"></div>
    </div>
  );
} 