'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { getCurrentUser } from '../services/authService';

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
  refreshUser: () => Promise<void>;
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
    } finally {
      setLoading(false);
    }
  };

  // 刷新用户数据的函数
  const refreshUser = async () => {
    await fetchUser();
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
    refreshUser
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