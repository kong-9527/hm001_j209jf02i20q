'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from './UserContext';
import { getUserProjects, Project as ServiceProject } from '../services/projectService';

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
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  // 获取用户的项目列表
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 使用服务函数获取项目列表
      const data = await getUserProjects();
      console.log('Fetched projects:', data);
      
      setProjects(data);
      
      // 如果没有当前选中的项目，且有项目列表，则自动选择第一个项目
      if (!currentProject && data.length > 0) {
        setCurrentProject(data[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  // 当用户登录状态改变时，重新获取项目列表
  useEffect(() => {
    if (user) {
      fetchProjects();
    } else {
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
        refreshProjects: fetchProjects,
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