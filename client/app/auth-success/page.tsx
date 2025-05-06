'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../contexts/UserContext';

export default function AuthSuccessPage() {
  const router = useRouter();
  const { refreshUser, isAuthenticated } = useUser();
  const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error'
  
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        console.log('Auth success page loaded');
        
        // 强制刷新用户状态
        await refreshUser();
        setStatus('success');
        console.log('User refreshed successfully in auth success page');
        
        // 检测是否是从弹窗中打开的
        if (window.opener) {
          try {
            console.log('Attempting to notify parent window of successful login');
            
            // 尝试存储成功状态到localStorage，让父窗口的定时器检测到
            localStorage.setItem('googleAuthSuccess', 'true');
            localStorage.setItem('googleAuthTimestamp', Date.now().toString());
            
            // 直接调用父窗口的刷新方法，确保它能跳转到dashboard
            if (window.opener.refreshUserAfterAuth) {
              console.log('Calling parent window refreshUserAfterAuth');
              window.opener.refreshUserAfterAuth();
            } else {
              // 如果父窗口没有定义刷新方法，尝试直接重定向父窗口
              console.log('Parent window does not have refreshUserAfterAuth, trying to redirect directly');
              try {
                window.opener.location.href = '/dashboard';
              } catch (e) {
                console.error('Failed to redirect parent directly:', e);
              }
            }
          } catch (e) {
            console.error('Unable to notify parent window:', e);
          }
          
          // 关闭窗口，但给一点时间让父窗口先接收消息
          setTimeout(() => {
            window.close();
          }, 800);
        } else {
          // 如果不是从弹窗打开的，直接重定向
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Redirect failed after login:', error);
        setStatus('error');
        
        // 显示错误一段时间后关闭窗口
        if (window.opener) {
          setTimeout(() => {
            window.close();
          }, 1500);
        } else {
          // 尝试重定向到登录页
          setTimeout(() => {
            router.push('/signin');
          }, 1500);
        }
      }
    };
    
    handleRedirect();
  }, [router, refreshUser]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
          {status === 'processing' ? 'Processing login...' : 
           status === 'success' ? 'Login Successful' : 'Login Error'}
        </h1>
        
        <p className="text-center mb-6 text-gray-600">
          {status === 'processing' ? 'Please wait while we complete your login process...' : 
           status === 'success' ? 'You have successfully logged in. Redirecting to dashboard...' : 
           'An error occurred during login. Please try again.'}
        </p>
        
        <div className="flex justify-center">
          {status === 'processing' || status === 'success' ? (
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          ) : (
            <button 
              onClick={() => window.close()} 
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 