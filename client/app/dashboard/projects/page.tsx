'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CreateProjectModal } from '@/app/components/CreateProjectModal';
import { EditProjectModal } from '@/app/components/EditProjectModal';
import { DeleteConfirmModal } from '@/app/components/DeleteConfirmModal';

// 示例项目数据
const initialProjects = [
  { id: 1, name: "Flower_garden_for_a", isCurrent: true },
  { id: 2, name: "Flower_garden_for_B", isCurrent: false },
  { id: 3, name: "Flower_garden_for_C", isCurrent: false },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState(initialProjects);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<{id: number, name: string} | null>(null);
  const [deletingProject, setDeletingProject] = useState<{id: number, name: string} | null>(null);
  
  const handleCreateProject = (projectName: string) => {
    const newProject = {
      id: Math.max(...projects.map(p => p.id), 0) + 1,
      name: projectName,
      isCurrent: false
    };
    setProjects([...projects, newProject]);
  };
  
  const handleEditProject = (projectId: number, projectName: string) => {
    setProjects(projects.map(project => 
      project.id === projectId 
        ? { ...project, name: projectName } 
        : project
    ));
  };
  
  const handleOpenEditModal = (project: {id: number, name: string}) => {
    setEditingProject(project);
    setIsEditModalOpen(true);
  };
  
  const handleOpenDeleteModal = (project: {id: number, name: string}) => {
    setDeletingProject(project);
    setIsDeleteModalOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (deletingProject) {
      setProjects(projects.filter(project => project.id !== deletingProject.id));
      setIsDeleteModalOpen(false);
      setDeletingProject(null);
    }
  };
  
  const handleSetCurrentProject = (projectId: number) => {
    setProjects(projects.map(project => ({
      ...project,
      isCurrent: project.id === projectId
    })));
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <div 
            key={project.id}
            className={`border rounded-lg p-4 relative ${project.isCurrent ? 'border-green-500 border-2' : 'border-gray-200'} flex flex-col h-full`}
          >
            <div className="mb-6">
              <h3 className="text-lg font-medium">{project.name}</h3>
              {project.isCurrent && (
                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mt-1">
                  Current Project
                </span>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 mt-auto">
              {!project.isCurrent && (
                <button 
                  onClick={() => handleSetCurrentProject(project.id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded text-sm"
                >
                  Open This Project
                </button>
              )}
              
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
        ))}
      </div>
      
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
          currentName={editingProject.name}
        />
      )}
      
      {isDeleteModalOpen && deletingProject && (
        <DeleteConfirmModal
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          projectName={deletingProject.name}
        />
      )}
    </div>
  );
} 