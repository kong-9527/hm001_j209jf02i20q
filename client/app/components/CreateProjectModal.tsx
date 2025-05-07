'use client';

import { useState } from 'react';
import ImageUploader from './ImageUploader';

interface CreateProjectModalProps {
  onClose: () => void;
  onSubmit: (projectData: { project_name: string; project_pic?: string }) => void;
}

export function CreateProjectModal({ onClose, onSubmit }: CreateProjectModalProps) {
  const [projectName, setProjectName] = useState('');
  const [projectPic, setProjectPic] = useState<string | null>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    
    const projectData = {
      project_name: projectName,
      ...(projectPic && { project_pic: projectPic })
    };
    
    onSubmit(projectData);
    onClose();
  };
  
  const handleImageUploaded = (imageUrl: string) => {
    setProjectPic(imageUrl);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name
              </label>
              <input
                type="text"
                placeholder="Enter project name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Garden Photo
              </label>
              <ImageUploader 
                onImageUploaded={handleImageUploaded}
                currentImage={projectPic}
              />
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                  projectName.trim() ? 'bg-primary hover:bg-primary-dark' : 'bg-gray-300'
                }`}
                disabled={!projectName.trim()}
              >
                Create Project
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 