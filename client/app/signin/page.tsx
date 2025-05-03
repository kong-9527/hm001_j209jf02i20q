'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { getGoogleLoginUrl } from '../services/authService';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 检查 URL 中是否有错误参数
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    if (error === 'authentication_failed') {
      setErrorMessage('登录失败，请重试');
    } else if (error === 'server_error') {
      setErrorMessage('服务器错误，请稍后重试');
    } else if (error === 'google_auth_not_configured') {
      setErrorMessage('Google 登录功能未配置，请联系管理员');
    }
  }, []);

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value && !validateEmail(value)) {
      setEmailError('请输入有效的邮箱地址');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError('请输入有效的邮箱地址');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 这里实现普通登录逻辑
      console.log('使用邮箱密码登录:', email, password);
      // 实现登录逻辑后重定向到仪表板
      // router.push('/dashboard');
    } catch (error) {
      console.error('登录失败:', error);
      setErrorMessage('登录失败，请检查您的凭据');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理 Google 登录
  const handleGoogleLogin = () => {
    try {
      const googleLoginUrl = getGoogleLoginUrl();
      // 重定向到 Google 认证页面
      window.location.href = googleLoginUrl;
    } catch (error) {
      console.error('Google 登录错误:', error);
      setErrorMessage('Google 登录功能暂时不可用，请稍后再试或使用邮箱登录');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-800 px-4 relative">
      <Script 
        defer 
        data-domain="aigardendesign.org" 
        src="https://plausible.io/js/script.file-downloads.hash.outbound-links.pageview-props.revenue.tagged-events.js"
      />
      <Script id="plausible-setup">
        {`window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }`}
      </Script>
      
      {/* 回到首页的链接 */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 flex items-center text-gray-600 hover:text-primary transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        返回首页
      </Link>
      
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">登录</h1>
        
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {errorMessage}
          </div>
        )}
        
        <div className="bg-white rounded-lg p-8 shadow-md">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="您的邮箱"
                className={`w-full px-4 py-3 bg-white border ${
                  emailError ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-1 focus:ring-primary`}
                required
              />
              {emailError && (
                <p className="mt-1 text-sm text-red-500">{emailError}</p>
              )}
            </div>
            
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="您的密码"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-md transition-colors shadow-md disabled:bg-teal-400"
            >
              {isLoading ? '登录中...' : '登录'}
            </button>
          </form>
          
          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-gray-300"></div>
            <span className="px-3 text-gray-500">或</span>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>
          
          <button
            onClick={handleGoogleLogin}
            className="w-full py-3 flex items-center justify-center gap-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors shadow-sm"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
              </g>
            </svg>
            使用 Google 账号登录
          </button>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              还没有账号？ <Link href="/register" className="text-teal-600 hover:underline font-medium">注册</Link>
            </p>
          </div>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          登录即表示您同意我们的 <Link href="/terms" className="text-teal-600">条款</Link> 和 <Link href="/privacy" className="text-teal-600">隐私政策</Link>
        </div>
      </div>
    </div>
  );
} 