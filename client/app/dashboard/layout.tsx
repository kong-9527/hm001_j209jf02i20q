'use client';

import Sidebar from '../components/Sidebar';
import DashboardNavbar from '../components/DashboardNavbar';
import { NotificationProvider } from '../components/NotificationCenter';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
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
  );
} 