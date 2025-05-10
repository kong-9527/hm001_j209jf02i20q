'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from './UserContext';
import { getUserProjects, Project as ServiceProject } from '../services/projectService';
import { useEventBus } from './EventBus';

// 定义项目类型 - 与服务中的类型保持一致
interface Project {
  id: number;
  project_name: string;
  project_pic: string | null;
  user_id: number;
  ctime: string; // 更改为字符串类型，与服务类型保持一致
  utime: string; // 更改为字符串类型，与服务类型保持一致
}

// 定义上下文类型
interface ProjectContextType {
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  projects: Project[];
  loading: boolean;
  error: string | null;
  refreshProjects: () => Promise<void>;
}

// 创建上下文
const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// 创建提供者组件
export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const { on } = useEventBus();

  // 添加日志记录currentProject变化
  useEffect(() => {
    console.log('ProjectContext: currentProject changed to:', currentProject);
  }, [currentProject]);

  // 定义获取项目列表的函数
  const refreshProjects = async () => {
    try {
      console.log('ProjectContext: Refreshing projects list');
      setLoading(true);
      setError(null);
      
      // 使用服务函数获取项目列表
      const data = await getUserProjects();
      console.log('ProjectContext: Projects fetched successfully:', data);
      
      setProjects(data);
      
      // 获取存储在localStorage中的选中项目ID
      const selectedProjectId = localStorage.getItem('selectedProjectId');
      console.log('ProjectContext: Selected project ID from localStorage:', selectedProjectId);
      
      // 如果存在选中的项目ID，则设置为当前项目
      if (selectedProjectId && data.length > 0) {
        const selectedProject = data.find(p => p.id.toString() === selectedProjectId);
        console.log('ProjectContext: Found selected project from ID:', selectedProject);
        if (selectedProject) {
          setCurrentProject(selectedProject);
        } else {
          // 如果找不到选中的项目，则使用第一个项目
          console.log('ProjectContext: Selected project not found, using first project as default');
          setCurrentProject(data[0]);
          localStorage.setItem('selectedProjectId', data[0].id.toString());
        }
      } else if (data.length > 0) {
        // 如果没有选中的项目ID但项目列表不为空，则使用第一个项目
        console.log('ProjectContext: No selected project ID, using first project as default');
        setCurrentProject(data[0]);
        localStorage.setItem('selectedProjectId', data[0].id.toString());
      }
      
      setLoading(false);
    } catch (error) {
      console.error('ProjectContext: Failed to fetch projects:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
      setLoading(false);
    }
  };

  // 加载项目列表和当前选中的项目
  useEffect(() => {
    refreshProjects();
  }, []);

  // 监听项目选择事件
  useEffect(() => {
    const unsubscribe = on('project_selected', (data: { selectedProjectId?: number }) => {
      console.log('ProjectContext: Received project_selected event with data:', data);
      
      const selectedProjectId = data?.selectedProjectId;
      if (selectedProjectId) {
        // 确保项目ID保存到localStorage
        localStorage.setItem('selectedProjectId', selectedProjectId.toString());
        
        const project = projects.find(p => p.id === selectedProjectId);
        if (project) {
          console.log('ProjectContext: Found project for ID, setting current project to:', project);
          setCurrentProject(project);
        } else {
          console.log('ProjectContext: Project ID not found in projects list:', selectedProjectId);
        }
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [on, projects]);

  // 当用户登录状态改变时，重新获取项目列表
  useEffect(() => {
    if (user) {
      refreshProjects();
    } else {
      // 如果用户未登录，清空项目列表和当前项目
      setProjects([]);
      setCurrentProject(null);
    }
  }, [user]);

  return (
    <ProjectContext.Provider
      value={{
        currentProject,
        setCurrentProject,
        projects,
        loading,
        error,
        refreshProjects
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

// 创建自定义钩子
export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
} 