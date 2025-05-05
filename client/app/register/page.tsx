'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Script from 'next/script';
import { loginWithGooglePopup } from '../services/authService';
import { useUser } from '../contexts/UserContext';

// 添加全局函数用于弹窗授权成功后刷新用户状态
declare global {
  interface Window {
    refreshUserAfterAuth?: () => void;
  }
}

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // 使用用户上下文来检查登录状态
  const { user, loading, isAuthenticated, refreshUser } = useUser();

  // 设置全局刷新函数
  useEffect(() => {
    // 添加全局函数，供弹窗调用
    window.refreshUserAfterAuth = async () => {
      await refreshUser();
      router.push('/dashboard');
    };

    return () => {
      // 清理函数
      window.refreshUserAfterAuth = undefined;
    };
  }, [refreshUser, router]);

  // 检查登录状态并重定向
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [loading, isAuthenticated, router]);

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value && !validateEmail(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    
    if (confirmPassword && value !== confirmPassword) {
      setPasswordError('Passwords do not match');
    } else {
      setPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    
    if (value && password !== value) {
      setPasswordError('Passwords do not match');
    } else {
      setPasswordError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    // Here you would typically handle the registration logic
    console.log('Signing up with:', email, password);
    
    // For demonstration, we'll just redirect to home
    // router.push('/');
  };

  // Handle Google login (popup method)
  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      setErrorMessage('');
      
      // Use popup method for login
      const user = await loginWithGooglePopup();
      
      // 刷新用户信息，确保上下文状态更新
      if (user) {
        await refreshUser();
        // 等待用户信息刷新后再跳转
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Google login error:', error);
      setErrorMessage('Google login failed, please try again later or use email registration');
    } finally {
      setIsGoogleLoading(false);
    }
  };
  
  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Logo返回首页链接 */}
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-gray-800 hover:text-teal-600 transition-colors">
        <div className="w-8 h-8 bg-teal-600 rounded-md flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l7.5-7.5 7.5 7.5m-15 6l7.5-7.5 7.5 7.5" />
          </svg>
        </div>
        <span className="font-medium">AI Garden Design</span>
      </Link>
      
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Sign up</h1>
        
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
                placeholder="Your email"
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
                onChange={handlePasswordChange}
                placeholder="Your password"
                className={`w-full px-4 py-3 bg-white border ${
                  passwordError ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-1 focus:ring-primary`}
                required
              />
            </div>
            
            <div>
              <input
                type="password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder="Confirm your password"
                className={`w-full px-4 py-3 bg-white border ${
                  passwordError ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-1 focus:ring-primary`}
                required
              />
              {passwordError && (
                <p className="mt-1 text-sm text-red-500">{passwordError}</p>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-md transition-colors shadow-md"
            >
              Sign Up
            </button>
          </form>
          
          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-gray-300"></div>
            <span className="px-3 text-gray-500">OR</span>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>
          
          <button
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full py-3 flex items-center justify-center gap-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors shadow-sm disabled:bg-gray-100"
          >
            {isGoogleLoading ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-r-0 border-b-0 border-gray-500 rounded-full mr-2"></div>
                Logging in...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                  <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                    <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                    <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                    <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                  </g>
                </svg>
                Sign in with Google
              </>
            )}
          </button>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account? <Link href="/signin" className="text-teal-600 hover:underline font-medium">Sign in</Link>
            </p>
          </div>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          By signing up, you agree to our <Link href="/terms" className="text-teal-600">Terms</Link> and <Link href="/privacy" className="text-teal-600">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
} 