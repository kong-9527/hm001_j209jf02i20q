'use client';

import { useState, useEffect } from 'react';
import ImageUploader from './ImageUploader';

interface EditProjectModalProps {
  onClose: () => void;
  onSubmit: (projectId: number, projectData: { project_name: string; project_pic?: string }) => void;
  projectId: number;
  currentName: string;
  currentPic?: string | null;
}

export function EditProjectModal({ 
  onClose, 
  onSubmit, 
  projectId, 
  currentName,
  currentPic = null
}: EditProjectModalProps) {
  const [projectName, setProjectName] = useState(currentName);
  const [projectPic, setProjectPic] = useState<string | null>(currentPic);
  
  useEffect(() => {
    setProjectName(currentName);
    setProjectPic(currentPic);
  }, [currentName, currentPic]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    
    const projectData = {
      project_name: projectName,
      ...(projectPic && { project_pic: projectPic })
    };
    
    onSubmit(projectId, projectData);
    onClose();
  };
  
  const handleImageUploaded = (imageUrl: string) => {
    setProjectPic(imageUrl);
  };
  
  const isFormChanged = projectName !== currentName || projectPic !== currentPic;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Edit Project</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name
              </label>
              <input
                type="text"
                placeholder="Enter project name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  projectName.trim() && isFormChanged ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300'
                }`}
                disabled={!projectName.trim() || !isFormChanged}
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 