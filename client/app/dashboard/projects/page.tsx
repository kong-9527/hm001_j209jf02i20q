'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { CreateProjectModal } from '@/app/components/CreateProjectModal';
import { EditProjectModal } from '@/app/components/EditProjectModal';
import { DeleteConfirmModal } from '@/app/components/DeleteConfirmModal';
import { getUserProjects, createProject, updateProject, deleteProject, Project } from '@/app/services/projectService';
import { useRouter } from 'next/navigation';
import { useEventBus } from '@/app/contexts/EventBus';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  // 使用事件总线
  const { emit, on } = useEventBus();
  
  // 加载项目列表
  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const projectsData = await getUserProjects();
      
      // 对项目进行排序，按照创建时间降序（最新创建的项目排在前面）
      const sortedProjects = projectsData.sort((a, b) => {
        return Number(b.ctime) - Number(a.ctime);
      });
      
      setProjects(sortedProjects);
    } catch (err) {
      setError('Failed to load projects');
      console.error('Error loading projects:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // 初始加载项目列表
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);
  
  // 监听项目更新事件
  useEffect(() => {
    // 订阅项目刷新事件，当在DashboardNavbar中创建项目后，刷新项目列表
    const unsubscribe = on('projects_updated', ({ refreshProjectsPage }) => {
      if (refreshProjectsPage) {
        console.log('Refreshing projects page by event');
        fetchProjects();
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [on, fetchProjects]);
  
  // 创建新项目
  const handleCreateProject = async (projectData: { project_name: string; project_pic?: string }) => {
    try {
      const newProject = await createProject(projectData);
      
      // 创建项目后，重新获取完整的项目列表以确保排序正确
      await fetchProjects();
      
      // 获取当前选中的项目ID
      const currentSelectedProjectId = localStorage.getItem('selectedProjectId');
      const hasSelectedProject = currentSelectedProjectId !== null;
      
      if (!hasSelectedProject) {
        // 如果当前没有选中的项目，则选中新创建的
        localStorage.setItem('selectedProjectId', newProject.id.toString());
        // 通知DashboardNavbar更新项目列表和选中的项目
        emit('projects_updated', { selectedProjectId: newProject.id });
      } else {
        // 如果已有选中的项目，则保持当前选中状态
        emit('projects_updated', { selectedProjectId: parseInt(currentSelectedProjectId!) });
      }
    } catch (err) {
      console.error('Error creating project:', err);
    }
  };
  
  // 编辑项目
  const handleEditProject = async (projectId: number, projectData: { project_name: string; project_pic?: string }) => {
    try {
      const updatedProject = await updateProject(projectId, projectData);
      
      // 编辑后重新获取完整的项目列表以确保数据一致性
      await fetchProjects();
      
      // 判断编辑的是否为当前选中的项目
      const selectedProjectId = localStorage.getItem('selectedProjectId');
      
      // 通知DashboardNavbar更新项目列表
      emit('projects_updated', { 
        selectedProjectId: selectedProjectId ? parseInt(selectedProjectId) : null 
      });
    } catch (err) {
      console.error('Error updating project:', err);
    }
  };
  
  // 打开编辑模态框
  const handleOpenEditModal = (project: Project) => {
    setEditingProject(project);
    setIsEditModalOpen(true);
  };
  
  // 打开删除模态框
  const handleOpenDeleteModal = (project: Project) => {
    setDeletingProject(project);
    setIsDeleteModalOpen(true);
  };
  
  // 确认删除项目
  const handleConfirmDelete = async () => {
    if (deletingProject) {
      try {
        await deleteProject(deletingProject.id);
        
        // 获取当前选中的项目ID
        const selectedProjectId = localStorage.getItem('selectedProjectId');
        const isSelectedProject = selectedProjectId && parseInt(selectedProjectId) === deletingProject.id;
        
        // 删除后重新获取项目列表
        await fetchProjects();
        
        // 根据删除后的项目列表和是否删除了当前选中的项目来决定如何更新
        if (isSelectedProject) {
          // 删除的是当前选中的项目
          if (projects.length > 0) {
            // 如果还有其他项目，选中第一个
            localStorage.setItem('selectedProjectId', projects[0].id.toString());
            emit('projects_updated', { selectedProjectId: projects[0].id });
          } else {
            // 如果没有项目了，清除选中的项目
            localStorage.removeItem('selectedProjectId');
            emit('projects_updated', { selectedProjectId: null });
          }
        } else {
          // 删除的不是当前选中的项目，只需通知更新项目列表
          emit('projects_updated', { selectedProjectId: selectedProjectId ? parseInt(selectedProjectId) : null });
        }
      } catch (err) {
        console.error('Error deleting project:', err);
      } finally {
        setIsDeleteModalOpen(false);
        setDeletingProject(null);
      }
    }
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">Manage Projects</h1>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Project
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4 border-t-green-500 animate-spin"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No projects found. Create your first project!
            </div>
          ) : (
            projects.map(project => (
              <div 
                key={project.id}
                className="border rounded-lg overflow-hidden flex flex-col h-full shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                  {project.project_pic ? (
                    <img 
                      src={project.project_pic} 
                      alt={project.project_name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <svg 
                        className="w-16 h-16 text-gray-300" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="2" 
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        ></path>
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="p-4 flex-grow">
                  <h3 className="text-lg font-medium mb-2">{project.project_name}</h3>
                  
                  <div className="text-sm text-gray-500">
                    Created: {new Date(Number(project.ctime) * 1000).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 p-4 border-t">
                  <button 
                    onClick={() => handleOpenEditModal(project)}
                    className="text-gray-500 hover:text-gray-700"
                    title="Edit project"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21h-9.5A2.25 2.25 0 014 18.75V8.25A2.25 2.25 0 016.25 6H8" />
                    </svg>
                  </button>
                  
                  <button 
                    onClick={() => handleOpenDeleteModal(project)}
                    className="text-gray-500 hover:text-red-600"
                    title="Delete project"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      {isCreateModalOpen && (
        <CreateProjectModal 
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateProject}
        />
      )}
      
      {isEditModalOpen && editingProject && (
        <EditProjectModal 
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditProject}
          projectId={editingProject.id}
          currentName={editingProject.project_name}
          currentPic={editingProject.project_pic}
        />
      )}
      
      {isDeleteModalOpen && deletingProject && (
        <DeleteConfirmModal
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          projectName={deletingProject.project_name}
        />
      )}
    </div>
  );
} 