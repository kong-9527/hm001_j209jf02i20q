'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthErrorPage() {
  const router = useRouter();
  const [errorType, setErrorType] = useState('unknown');
  
  useEffect(() => {
    // 尝试从URL获取错误类型
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error') || 'unknown';
    setErrorType(error);
    
    // 检测是否是从弹窗中打开的
    if (window.opener) {
      try {
        console.log('Auth error page opened - attempting to notify parent window');
        
        // 尝试直接调用父窗口刷新函数
        if (window.opener.refreshUserAfterAuth) {
          console.log('Parent has refreshUserAfterAuth, notifying failure');
          // 设置全局状态表明登录失败
          window.opener.document.loginFailed = true;
        }
        
        // 直接尝试设置父窗口的Google登录状态为非loading
        try {
          if (window.opener.setIsGoogleLoading) {
            console.log('Attempting to reset parent loading state');
            window.opener.setIsGoogleLoading(false);
          }
        } catch (e) {
          console.error('Failed to reset parent loading state:', e);
        }
      } catch (e) {
        console.error('Unable to notify parent window:', e);
      }
      
      // 延迟关闭窗口，让用户看到错误消息
      setTimeout(() => {
        window.close();
      }, 1500);
    } else {
      // 如果不是从弹窗打开的，延迟重定向到登录页
      setTimeout(() => {
        router.push('/signin?error=' + error);
      }, 1500);
    }
  }, [router]);
  
  // 根据错误类型显示不同消息
  const getErrorMessage = () => {
    switch(errorType) {
      case 'access_denied':
        return 'You denied access to your Google account.';
      case 'authentication_failed':
        return 'Authentication failed. Please try again.';
      case 'server_error':
        return 'Server error occurred. Please try again later.';
      default:
        return 'An error occurred during the login process. Please try again.';
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center text-red-600">Login Failed</h1>
        <p className="text-center mb-6 text-gray-700">
          {getErrorMessage()}
        </p>
        <div className="flex justify-center">
          <button 
            onClick={() => window.close()} 
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 