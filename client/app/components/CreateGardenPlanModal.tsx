import React, { useState } from 'react';

interface CreateGardenPlanModalProps {
  onClose: () => void;
  onSubmit: (planName: string) => void;
}

export function CreateGardenPlanModal({ onClose, onSubmit }: CreateGardenPlanModalProps) {
  const [planName, setPlanName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!planName.trim()) {
      setError('Plan name is required');
      return;
    }
    
    onSubmit(planName);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Create New Garden Plan</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="planName" className="block text-sm font-medium text-gray-700 mb-1">
              Plan Name
            </label>
            <input
              type="text"
              id="planName"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter garden plan name"
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              Create Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 