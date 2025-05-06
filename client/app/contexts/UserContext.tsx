'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { getCurrentUser, logout as logoutService, refreshSession as refreshSessionService } from '../services/authService';
import { useRouter } from 'next/navigation';

// 用户信息接口
export interface UserInfo {
  id: number;
  email: string;
  nick_name: string | null;
  register_type: number | null;
  head_pic: string | null; 
  points: string | null;
  ctime: number | null;
}

// 上下文状态接口
interface UserContextState {
  user: UserInfo | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<boolean>;
  refreshSession: () => Promise<boolean>;
}

// 创建上下文
const UserContext = createContext<UserContextState | undefined>(undefined);

// 提供者组件Props
interface UserProviderProps {
  children: ReactNode;
}

// 用户上下文提供者
export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // 获取用户数据
  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (err) {
      console.error('获取用户信息失败:', err);
      setError('获取用户信息失败');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // 刷新用户数据的函数
  const refreshUser = async () => {
    await fetchUser();
  };

  // 登出函数
  const logout = async () => {
    try {
      const success = await logoutService();
      if (success) {
        setUser(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('退出登录失败:', error);
      return false;
    }
  };

  // 刷新会话函数
  const refreshSession = async () => {
    try {
      const success = await refreshSessionService();
      return success;
    } catch (error) {
      console.error('刷新会话失败:', error);
      return false;
    }
  };

  // 组件挂载时获取用户数据
  useEffect(() => {
    fetchUser();
  }, []);

  // 提供上下文值
  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    refreshUser,
    logout,
    refreshSession
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// 自定义钩子，用于获取用户上下文
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 