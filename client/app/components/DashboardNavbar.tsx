'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function DashboardNavbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="flex justify-between items-center px-4 h-14">
        <div className="flex items-center">
          {/* 布局切换按钮 */}
          {/* <button className="p-2 text-gray-500 hover:text-gray-700 mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button> */}
          
          {/* 项目选择 */}
          <div className="flex items-center">
            <div className="text-sm font-medium">Project:</div>
            <div className="relative ml-2">
              <button className="text-sm font-medium flex items-center gap-1 text-gray-800 hover:text-gray-900">
                <span>Default</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* 令牌显示 */}
          <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-purple-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
            <span className="text-xs font-medium">Tokens: 50</span>
          </div>
          
          {/* 项目选择 */}
          {/* <div className="relative">
            <button className="text-sm font-medium flex items-center gap-1 text-gray-800 hover:text-gray-900">
              <span>Projects</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          </div> */}
          
          {/* 用户头像 */}
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-medium"
            >
              H
            </button>
            
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium">user@example.com</p>
                </div>
                <Link href="/dashboard/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Settings
                </Link>
                <Link href="/dashboard/billing" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Billing
                </Link>
                <div className="border-t border-gray-100 mt-1"></div>
                <Link href="/signin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Sign out
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 