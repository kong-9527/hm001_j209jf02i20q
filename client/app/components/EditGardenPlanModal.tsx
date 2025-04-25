import React, { useState } from 'react';

interface EditGardenPlanModalProps {
  onClose: () => void;
  onSubmit: (planId: number, planName: string, location?: string, experience?: string, fertilizer?: string) => void;
  planId: number;
  currentName: string;
  location?: string;
  experience?: string;
  fertilizer?: string;
}

export function EditGardenPlanModal({ 
  onClose, 
  onSubmit, 
  planId, 
  currentName,
  location = '',
  experience = 'beginner',
  fertilizer = ''
}: EditGardenPlanModalProps) {
  const [planName, setPlanName] = useState(currentName);
  const [planLocation, setPlanLocation] = useState(location);
  const [planExperience, setPlanExperience] = useState(experience);
  const [planFertilizer, setPlanFertilizer] = useState(fertilizer);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!planName.trim()) {
      setError('Plan name cannot be empty');
      return;
    }
    
    onSubmit(planId, planName, planLocation, planExperience, planFertilizer);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Edit Garden Plan</h2>
        
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
          
          {/* <div className="mb-4">
            <label htmlFor="planLocation" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              id="planLocation"
              value={planLocation}
              onChange={(e) => setPlanLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter location"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="planExperience" className="block text-sm font-medium text-gray-700 mb-1">
              Experience Level
            </label>
            <select
              id="planExperience"
              value={planExperience}
              onChange={(e) => setPlanExperience(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="expert">Expert</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="planFertilizer" className="block text-sm font-medium text-gray-700 mb-1">
              Fertilizer Type
            </label>
            <select
              id="planFertilizer"
              value={planFertilizer}
              onChange={(e) => setPlanFertilizer(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Please select</option>
              <option value="Organic">Organic</option>
              <option value="Chemical">Chemical</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div> */}
          
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 