import { getCurrentUser } from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Project {
  id: number;
  project_name: string;
  project_pic: string | null;
  user_id: number;
  ctime: string;
  utime: string;
}

/**
 * 获取当前用户的所有项目
 */
export const getUserProjects = async (): Promise<Project[]> => {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${API_URL}/projects`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch projects');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

/**
 * 创建新项目
 */
export const createProject = async (projectData: { project_name: string; project_pic?: string }): Promise<Project> => {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create project');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

/**
 * 更新项目
 */
export const updateProject = async (id: number, projectData: { project_name: string; project_pic?: string }): Promise<Project> => {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update project');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

/**
 * 删除项目
 */
export const deleteProject = async (id: number): Promise<void> => {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete project');
    }
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
}; 