'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import DashboardNavbar from '../components/DashboardNavbar';
import { NotificationProvider } from '../components/NotificationCenter';
import { useUser } from '../contexts/UserContext';
import IdleTimer from '../components/IdleTimer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, isAuthenticated } = useUser();
  const router = useRouter();

  // 检查登录状态
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/signin');
    }
  }, [loading, isAuthenticated, router]);

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // 如果未登录，不显示内容
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <IdleTimer timeout={30 * 60 * 1000} /> {/* 30分钟无操作自动登出 */}
      <NotificationProvider>
        <div className="flex h-screen bg-gray-50 overflow-hidden">
          <Sidebar />
          
          <div className="flex flex-col flex-1 overflow-hidden">
            <DashboardNavbar />
            
            <main className="flex-1 overflow-auto p-4">
              <div className="h-auto pb-8">
                {children}
              </div>
            </main>
          </div>
        </div>
      </NotificationProvider>
    </>
  );
} 