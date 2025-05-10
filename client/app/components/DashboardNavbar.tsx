'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { CreateProjectModal } from './CreateProjectModal';
import { useUser } from '../contexts/UserContext';
import { getUserProjects, createProject, Project } from '../services/projectService';
import { useEventBus } from '../contexts/EventBus';
import { getCurrentUser } from '../services/authService';

export default function DashboardNavbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProjectOpen, setIsProjectOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // 使用用户上下文
  const { user, loading, logout } = useUser();
  const router = useRouter();
  // 使用事件总线
  const { on, emit } = useEventBus();
  
  const projectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const profileTimerRef = useRef<NodeJS.Timeout | null>(null);

  console.log('DashboardNavbar render, selectedProject:', selectedProject);

  // 获取用户项目列表
  const fetchProjects = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const projectsData = await getUserProjects();
      setProjects(projectsData);
      
      // 当获取到项目列表后，判断是否有项目
      if (projectsData.length > 0) {
        // 读取localStorage中保存的项目ID
        const savedProjectId = localStorage.getItem('selectedProjectId');
        
        if (savedProjectId) {
          // 如果有保存的项目ID，查找匹配的项目
          const savedProject = projectsData.find(p => p.id.toString() === savedProjectId);
          
          // 如果找到了匹配的项目，则选中它
          if (savedProject) {
            setSelectedProject(savedProject);
          }
          // 如果没找到匹配的项目但有项目列表，选择第一个
          else {
            setSelectedProject(projectsData[0]);
            localStorage.setItem('selectedProjectId', projectsData[0].id.toString());
          }
        } 
        // 如果没有保存的项目ID，但有项目，则选中第一个
        else if (!selectedProject) {
          setSelectedProject(projectsData[0]);
          localStorage.setItem('selectedProjectId', projectsData[0].id.toString());
        }
      } else {
        // 如果没有项目了，将selectedProject设为null
        setSelectedProject(null);
        localStorage.removeItem('selectedProjectId');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始加载项目列表
  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);
  
  // 监听项目更新事件
  useEffect(() => {
    // 订阅项目更新事件
    const unsubscribe = on('projects_updated', ({ selectedProjectId, refreshProjectsPage }) => {
      console.log('Projects updated event received, refreshing projects list');
      fetchProjects();
    });
    
    // 订阅用户点数更新事件
    const unsubscribePoints = on('user_points_updated', ({ points }) => {
      console.log('User points updated event received:', points);
      if (user) {
        // 更新用户上下文中的点数
        user.points = points.toString();
      }
    });
    
    // 清理订阅
    return () => {
      unsubscribe();
      unsubscribePoints();
    };
  }, [on, user]);
  
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
  
  const handleCreateProject = async (projectData: { project_name: string; project_pic?: string }) => {
    try {
      const newProject = await createProject(projectData);
      
      // 获取当前是否已有选中的项目
      const hasSelectedProject = selectedProject !== null;
      const currentSelectedProjectId = selectedProject?.id;
      
      // 更新项目列表
      const updatedProjects = [...projects, newProject];
      setProjects(updatedProjects);
      
      if (!hasSelectedProject) {
        // 如果当前没有选中的项目，则选中新创建的项目
        setSelectedProject(newProject);
        localStorage.setItem('selectedProjectId', newProject.id.toString());
        
        // 发送项目选择事件，通知其他组件刷新数据
        emit('project_selected', { 
          selectedProjectId: newProject.id
        });
        
        // 如果这是第一个创建的项目，则重定向到garden-design页面
        if (updatedProjects.length === 1) {
          router.push('/dashboard/garden-design');
        } else {
          // 通知项目列表页面更新，但保持当前选中的项目
          emit('projects_updated', { 
            selectedProjectId: newProject.id, 
            refreshProjectsPage: true 
          });
        }
      } else {
        // 如果当前已有选中的项目，则保持不变
        // 通知项目列表页面更新，保持当前选中的项目
        emit('projects_updated', { 
          selectedProjectId: currentSelectedProjectId, 
          refreshProjectsPage: true 
        });
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };
  
  // 处理项目选择
  const handleSelectProject = (project: Project) => {
    console.log('DashboardNavbar: handleSelectProject called with project:', project);
    
    setSelectedProject(project);
    localStorage.setItem('selectedProjectId', project.id.toString());
    console.log('DashboardNavbar: Selected project set to:', project);
    console.log('DashboardNavbar: localStorage updated with project ID:', project.id);
    
    setIsProjectOpen(false);
    
    // 发送项目选择事件，通知其他组件刷新数据
    console.log('DashboardNavbar: Emitting project_selected event with ID:', project.id);
    emit('project_selected', { 
      selectedProjectId: project.id
    });
    
    // 当选择项目时，跳转到garden-design页面
    console.log('DashboardNavbar: Navigating to garden-design page');
    router.push('/dashboard/garden-design');
  };
  
  // 处理登出
  const handleLogout = async () => {
    // 清理 Google 登录相关的全局状态
    window.googleLoginInProgress = false;
    
    // 清理定时器
    if (window.googleLoginInterval) {
      clearInterval(window.googleLoginInterval);
      window.googleLoginInterval = undefined;
    }
    
    if (window.googleLoginTimeout) {
      clearTimeout(window.googleLoginTimeout);
      window.googleLoginTimeout = undefined;
    }
    
    // 清理 localStorage 中的登录标记
    localStorage.removeItem('googleAuthSuccess');
    localStorage.removeItem('googleAuthTimestamp');
    localStorage.removeItem('selectedProjectId');
    
    // 调用登出服务
    const success = await logout();
    if (success) {
      router.push('/');
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
  
  // 处理导航链接点击
  const handleNavigation = async (path: string) => {
    try {
      // 获取最新的用户信息
      const userData = await getCurrentUser();
      if (userData) {
        // 更新用户上下文中的点数
        if (user) {
          user.points = userData.points;
        }
        // 发送更新事件
        emit('user_points_updated', { 
          points: userData.points
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
    router.push(path);
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
                  <span>{selectedProject ? selectedProject.project_name : "Select Project"}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                
                {isProjectOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10">
                    {isLoading ? (
                      <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
                    ) : projects.length > 0 ? (
                      <div className="max-h-48 overflow-y-auto">
                        {projects.map(project => (
                          <button 
                            key={project.id} 
                            className={`block w-full text-left px-4 py-2 text-sm ${
                              selectedProject?.id === project.id 
                                ? 'bg-gray-100 text-gray-900 font-medium' 
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                            onClick={() => handleSelectProject(project)}
                          >
                            {project.project_name}
                          </button>
                        ))}
                      </div>
                    ) : null}
                    
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
                      
                      <button 
                        onClick={() => handleNavigation('/dashboard/projects')} 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                        </svg>
                        My Projects
                      </button>
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
                  <button 
                    onClick={() => handleNavigation('/dashboard/settings')} 
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </button>
                  <button 
                    onClick={() => handleNavigation('/dashboard/billing')} 
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Billing
                  </button>
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