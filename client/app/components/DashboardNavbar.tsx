'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { CreateProjectModal } from './CreateProjectModal';
import { useUser } from '../contexts/UserContext';

export default function DashboardNavbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProjectOpen, setIsProjectOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // 使用用户上下文
  const { user, loading, logout } = useUser();
  const router = useRouter();
  
  const projectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const profileTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const projects = [
    { id: 1, name: "My Backyard Garden" },
    { id: 2, name: "Front Yard Renovation" },
    { id: 3, name: "Rooftop Garden" },
    { id: 4, name: "Community Project" }
  ];
  
  const handleProjectMouseEnter = () => {
    if (projectTimerRef.current) {
      clearTimeout(projectTimerRef.current);
      projectTimerRef.current = null;
    }
    setIsProjectOpen(true);
  };

  const handleProjectMouseLeave = () => {
    projectTimerRef.current = setTimeout(() => {
      setIsProjectOpen(false);
    }, 50);
  };

  const handleProfileMouseEnter = () => {
    if (profileTimerRef.current) {
      clearTimeout(profileTimerRef.current);
      profileTimerRef.current = null;
    }
    setIsProfileOpen(true);
  };

  const handleProfileMouseLeave = () => {
    profileTimerRef.current = setTimeout(() => {
      setIsProfileOpen(false);
    }, 50);
  };
  
  const openCreateModal = () => {
    setIsProjectOpen(false);
    setIsCreateModalOpen(true);
  };
  
  const handleCreateProject = (projectName: string) => {
    // 这里处理创建项目的逻辑
    console.log('Creating project:', projectName);
    // 创建完成后可以执行其他操作
  };
  
  // 处理登出
  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      router.push('/signin');
    }
  };
  
  // 获取用户头像或首字母
  const getUserAvatar = () => {
    if (user?.head_pic) {
      // 如果有头像，显示头像
      return (
        <Image 
          src={user.head_pic} 
          alt={user.nick_name || user.email}
          width={32}
          height={32}
          className="h-8 w-8 rounded-full"
        />
      );
    } else if (user?.nick_name) {
      // 如果没有头像，显示昵称首字母
      return <span>{user.nick_name.charAt(0).toUpperCase()}</span>;
    } else if (user?.email) {
      // 如果没有昵称，显示邮箱首字母
      return <span>{user.email.charAt(0).toUpperCase()}</span>;
    } else {
      // 默认情况
      return <span>U</span>;
    }
  };
  
  useEffect(() => {
    // 组件卸载时清除所有定时器
    return () => {
      if (projectTimerRef.current) clearTimeout(projectTimerRef.current);
      if (profileTimerRef.current) clearTimeout(profileTimerRef.current);
    };
  }, []);
  
  return (
    <>
      <nav className="bg-white border-b border-gray-200">
        <div className="flex justify-between items-center px-4 h-14">
          <div className="flex items-center">
            {/* 项目选择 */}
            <div className="flex items-center">
              <div className="text-sm font-medium">Project:</div>
              <div 
                className="relative ml-2 group" 
                onMouseEnter={handleProjectMouseEnter}
                onMouseLeave={handleProjectMouseLeave}
              >
                <button 
                  className="text-sm font-medium flex items-center gap-1 text-gray-800 hover:text-gray-900"
                >
                  <span>Select Project</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                
                {isProjectOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10">
                    <div className="max-h-48 overflow-y-auto">
                      {projects.map(project => (
                        <button 
                          key={project.id} 
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {project.name}
                        </button>
                      ))}
                    </div>
                    
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button 
                        onClick={openCreateModal}
                        className="flex items-center w-full px-4 py-2 text-sm text-primary hover:bg-gray-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Create New Project
                      </button>
                      
                      <Link 
                        href="/dashboard/projects" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                        </svg>
                        My Projects
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* 积分显示 */}
            <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-purple-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
              <span className="text-xs font-medium">
                {loading ? 'Loading...' : `points: ${user?.points || '0'}`}
              </span>
            </div>
            
            {/* 用户头像 */}
            <div 
              className="relative"
              onMouseEnter={handleProfileMouseEnter}
              onMouseLeave={handleProfileMouseLeave}
            >
              <button 
                className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-medium overflow-hidden"
              >
                {loading ? 'U' : getUserAvatar()}
              </button>
              
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium">
                      {loading ? 'Loading...' : (user?.email || 'user@example.com')}
                    </p>
                  </div>
                  <Link href="/dashboard/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Settings
                  </Link>
                  <Link href="/dashboard/billing" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Billing
                  </Link>
                  <div className="border-t border-gray-100 mt-1"></div>
                  <button 
                    onClick={handleLogout} 
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* 创建项目弹窗 */}
      {isCreateModalOpen && (
        <CreateProjectModal 
          onClose={() => setIsCreateModalOpen(false)} 
          onSubmit={handleCreateProject}
        />
      )}
    </>
  );
} 