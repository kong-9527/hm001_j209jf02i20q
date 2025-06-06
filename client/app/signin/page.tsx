'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { getGoogleLoginUrl, loginWithGooglePopup, getCurrentUser } from '../services/authService';
import { useUser } from '../contexts/UserContext';

// 添加全局函数用于弹窗授权成功后刷新用户状态
declare global {
  interface Window {
    refreshUserAfterAuth?: () => void;
    googleLoginPopup?: Window | null;
    googleLoginTimeout?: NodeJS.Timeout;
    googleLoginInterval?: NodeJS.Timeout;
    googleLoginInProgress?: boolean;
  }
}

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  // 使用用户上下文来检查登录状态
  const { user, loading, isAuthenticated, refreshUser } = useUser();
  
  // 存储用于检查登录状态的定时器ID
  const loginCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const popupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 设置全局刷新函数
  useEffect(() => {
    // 定义全局函数用于弹窗调用
    window.refreshUserAfterAuth = async () => {
      console.log('refreshUserAfterAuth called from popup');
      
      try {
        // 刷新用户信息
        await refreshUser();
        console.log('User refreshed successfully, redirecting to dashboard');
        
        // 重置loading状态
        setIsGoogleLoading(false);
        
        // 延迟一点跳转，确保状态已更新
        setTimeout(() => {
          router.push('/dashboard');
        }, 100);
      } catch (error) {
        console.error('Failed to refresh user:', error);
        setIsGoogleLoading(false);
        setErrorMessage('Login succeeded but failed to refresh user info. Please try again.');
      }
    };

    console.log('Global refreshUserAfterAuth function set');

    return () => {
      // 清理函数
      window.refreshUserAfterAuth = undefined;
      console.log('Global refreshUserAfterAuth function cleaned up');
      
      // 清理登录检查定时器
      if (loginCheckIntervalRef.current) {
        clearInterval(loginCheckIntervalRef.current);
      }
      if (popupTimeoutRef.current) {
        clearTimeout(popupTimeoutRef.current);
      }
      
      // 清理全局定时器
      if (window.googleLoginInterval) {
        clearInterval(window.googleLoginInterval);
        window.googleLoginInterval = undefined;
      }
      if (window.googleLoginTimeout) {
        clearTimeout(window.googleLoginTimeout);
        window.googleLoginTimeout = undefined;
      }
    };
  }, [refreshUser, router]);

  // 定期检查用户是否已经登录的函数
  const startLoginCheck = () => {
    // 清理旧的定时器
    if (loginCheckIntervalRef.current) {
      clearInterval(loginCheckIntervalRef.current);
    }
    
    console.log('Starting login check interval');
    
    // 定期检查用户状态
    loginCheckIntervalRef.current = setInterval(async () => {
      console.log('Checking user login status...');
      
      try {
        // 检查localStorage是否有登录成功标记
        const authSuccess = localStorage.getItem('googleAuthSuccess');
        const authTimestamp = localStorage.getItem('googleAuthTimestamp');
        
        if (authSuccess === 'true' && authTimestamp) {
          const timestamp = parseInt(authTimestamp);
          const now = Date.now();
          // 检查时间戳是否在60秒内
          if (now - timestamp < 60000) {
            console.log('Auth success detected from localStorage!');
            
            // 清理localStorage的登录标记
            localStorage.removeItem('googleAuthSuccess');
            localStorage.removeItem('googleAuthTimestamp');
            
            // 清理定时器
            clearInterval(loginCheckIntervalRef.current!);
            loginCheckIntervalRef.current = null;
            
            // 更新状态
            setIsGoogleLoading(false);
            
            // 刷新用户信息
            await refreshUser();
            
            // 跳转到dashboard
            router.push('/dashboard');
            return;
          }
        }
        
        // 如果没有localStorage标记，则尝试获取用户信息
        const user = await getCurrentUser();
        if (user) {
          console.log('User detected from interval check, authenticated!');
          
          // 清理定时器
          clearInterval(loginCheckIntervalRef.current!);
          loginCheckIntervalRef.current = null;
          
          // 更新状态
          setIsGoogleLoading(false);
          
          // 刷新用户信息
          await refreshUser();
          
          // 跳转到dashboard
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('Error checking user status:', err);
      }
    }, 1000); // 每秒检查一次
    
    // 设置超时，防止无限检查
    popupTimeoutRef.current = setTimeout(() => {
      if (loginCheckIntervalRef.current) {
        clearInterval(loginCheckIntervalRef.current);
        loginCheckIntervalRef.current = null;
        
        // 如果用户还在Google登录中，则重置状态
        if (isGoogleLoading) {
          console.log('Login check timeout, resetting state');
          setIsGoogleLoading(false);
          setErrorMessage('Login timeout. Please try again.');
        }
      }
    }, 60000); // 1分钟超时
  };

  // 检查登录状态并重定向
  useEffect(() => {
    if (!loading && isAuthenticated) {
      console.log('User already authenticated, redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [loading, isAuthenticated, router]);

  // Check for error parameters in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    if (error === 'authentication_failed') {
      setErrorMessage('登录失败，请重试');
    } else if (error === 'server_error') {
      setErrorMessage('服务器错误，请稍后重试');
    } else if (error === 'google_auth_not_configured') {
      setErrorMessage('Google登录未配置，请联系管理员');
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
      setEmailError('请输入有效的电子邮件地址');
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
      setEmailError('请输入有效的电子邮件地址');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Implement regular login logic here
      console.log('Logging in with email and password:', email, password);
      // Redirect to dashboard after successful login
      // router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      setErrorMessage('登录失败，请检查您的凭据');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google login (popup method)
  const handleGoogleLogin = async () => {
    try {
      // 先检查全局登录状态，如果异常则重置
      if (window.googleLoginInProgress) {
        console.log('Google login flag is true, but no popup is open. Resetting state.');
        window.googleLoginInProgress = false;
        
        // 清理可能存在的登录检查定时器
        if (loginCheckIntervalRef.current) {
          clearInterval(loginCheckIntervalRef.current);
          loginCheckIntervalRef.current = null;
        }
        if (popupTimeoutRef.current) {
          clearTimeout(popupTimeoutRef.current);
          popupTimeoutRef.current = null;
        }
        
        // 清理全局定时器
        if (window.googleLoginInterval) {
          clearInterval(window.googleLoginInterval);
          window.googleLoginInterval = undefined;
        }
        if (window.googleLoginTimeout) {
          clearTimeout(window.googleLoginTimeout);
          window.googleLoginTimeout = undefined;
        }
      }
      
      // 避免重复点击
      if (isGoogleLoading) {
        console.log('Google login loading state is true, ignoring click');
        return;
      }
      
      setIsGoogleLoading(true);
      setErrorMessage('');
      
      // 设置全局标志表示登录正在进行中
      window.googleLoginInProgress = true;
      
      console.log('Opening Google login popup');
      
      // 开始登录状态检查
      startLoginCheck();
      
      // 使用弹窗方法进行登录，等待明确的成功或失败结果
      loginWithGooglePopup().then(user => {
        console.log('Google login popup returned successfully with user data');
        window.googleLoginInProgress = false;
        
        // 清理登录检查定时器
        if (loginCheckIntervalRef.current) {
          clearInterval(loginCheckIntervalRef.current);
          loginCheckIntervalRef.current = null;
        }
        if (popupTimeoutRef.current) {
          clearTimeout(popupTimeoutRef.current);
          popupTimeoutRef.current = null;
        }
        
        setIsGoogleLoading(false);
        refreshUser().then(() => {
          router.push('/dashboard');
        });
      }).catch(error => {
        console.error('Google login popup error:', error);
        window.googleLoginInProgress = false;
        
        // 清理登录检查定时器
        if (loginCheckIntervalRef.current) {
          clearInterval(loginCheckIntervalRef.current);
          loginCheckIntervalRef.current = null;
        }
        if (popupTimeoutRef.current) {
          clearTimeout(popupTimeoutRef.current);
          popupTimeoutRef.current = null;
        }
        
        setIsGoogleLoading(false);
        
        // 处理特定错误
        if (error.message === 'Authentication was cancelled by the user') {
          setErrorMessage('Google登录已取消，您可以重试或使用其他登录方式');
        } else if (error.message === 'Authentication timeout. Please try again.') {
          setErrorMessage('Google登录超时，请重试');
        } else if (error.message === 'Login window was closed before authorization completed') {
          setErrorMessage('登录窗口被关闭，请重试');
        } else {
          setErrorMessage('Google登录失败，请稍后重试或使用其他登录方式');
        }
      });
    } catch (error: any) {
      console.error('Failed to initiate Google login:', error);
      window.googleLoginInProgress = false;
      setIsGoogleLoading(false);
      setErrorMessage('无法启动Google登录，请稍后重试');
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
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Login</h1>
        
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {errorMessage}
          </div>
        )}
        
        <div className="bg-white rounded-lg p-8 shadow-md">
          {/* <form onSubmit={handleSubmit} className="space-y-5">
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
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-md transition-colors shadow-md disabled:bg-teal-400"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-gray-300"></div>
            <span className="px-3 text-gray-500">OR</span>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>
           */}
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
          
          {/* <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account? <Link href="/register" className="text-teal-600 hover:underline font-medium">Register</Link>
            </p>
          </div> */}
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          By signing in, you agree to our <Link href="/terms" className="text-teal-600">Terms</Link> and <Link href="/privacy" className="text-teal-600">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
} 