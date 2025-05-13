'use client';

import { useEffect, useState } from 'react';
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
  const [mounted, setMounted] = useState(false);

  // 在客户端挂载后设置状态
  useEffect(() => {
    setMounted(true);
  }, []);

  // 检查登录状态
  useEffect(() => {
    if (mounted && !loading && !isAuthenticated) {
      router.push('/signin');
    }
  }, [mounted, loading, isAuthenticated, router]);

  // 始终返回布局结构，但内容可以根据状态动态调整
  return (
    <>
      {mounted && <IdleTimer timeout={30 * 60 * 1000} />} {/* 30分钟无操作自动登出 */}
      <NotificationProvider>
        <div className="flex h-screen bg-gray-50 overflow-hidden">
          {mounted && !loading && isAuthenticated ? (
            <>
              <Sidebar />
              <div className="flex flex-col flex-1 overflow-hidden">
                <DashboardNavbar />
                <main className="flex-1 overflow-auto p-4">
                  <div className="h-auto pb-8">
                    {children}
                  </div>
                </main>
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center w-full h-screen bg-gray-50">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </div>
          )}
        </div>
      </NotificationProvider>
    </>
  );
} 