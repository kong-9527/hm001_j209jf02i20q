'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, logout } from '../services/authService';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getCurrentUser();
        if (userData) {
          setUser(userData);
        } else {
          // 如果没有用户数据，重定向到登录页面
          router.push('/signin');
        }
      } catch (error) {
        console.error('获取用户数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      router.push('/signin');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">仪表板</h1>
          <div className="flex items-center">
            {user && (
              <div className="flex items-center">
                <span className="mr-4 text-gray-700">欢迎, {user.nick_name}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
                >
                  退出
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">个人信息</h2>
          {user && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">邮箱</p>
                  <p>{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">昵称</p>
                  <p>{user.nick_name || '未设置'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">积分</p>
                  <p>{user.points || '0'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">注册方式</p>
                  <p>{user.register_type === 1 ? '邮箱注册' : '谷歌登录'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 