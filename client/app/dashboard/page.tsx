'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CreateProjectModal } from '@/app/components/CreateProjectModal';

export default function Dashboard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const handleCreateProject = (projectName: string) => {
    // 这里可以添加创建项目的逻辑，例如跳转到新创建的项目页面
    console.log(`Created project: ${projectName}`);
    // 创建后可以重定向到projects页面
    window.location.href = '/dashboard/projects';
  };

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to AI Garden Designer!</h1>
      
      <p className="text-gray-600 mb-8">
        Start by creating your first garden project!
      </p>
      
      <button 
        onClick={() => setIsCreateModalOpen(true)}
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors shadow-md"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Create Your First Project
      </button>

      {isCreateModalOpen && (
        <CreateProjectModal 
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateProject}
        />
      )}
    </div>
  );
} 