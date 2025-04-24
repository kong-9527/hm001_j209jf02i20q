'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CreateGardenPlanModal } from '@/app/components/CreateGardenPlanModal';
import { EditGardenPlanModal } from '@/app/components/EditGardenPlanModal';
import { DeleteConfirmModal } from '@/app/components/DeleteConfirmModal';

// Example garden plan data
const initialGardenPlans = [
  { 
    id: 1, 
    name: "Spring Vegetable Garden", 
    status: "completed", // possible values: "completed", "generating", "failed"
    createdAt: "2025/4/21",
    location: "Canada A7",
    experience: "beginner",
    fertilizer: "Organic"
  },
  { 
    id: 2, 
    name: "Summer Flower Arrangement", 
    status: "generating",
    createdAt: "2025/5/12",
    location: "USA B3",
    experience: "intermediate",
    fertilizer: "Chemical"
  },
  { 
    id: 3, 
    name: "Herb Garden Layout", 
    status: "failed",
    createdAt: "2025/6/05",
    location: "France C2",
    experience: "expert",
    fertilizer: "Mixed"
  },
];

export default function GardenPlansPage() {
  const [gardenPlans, setGardenPlans] = useState(initialGardenPlans);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<{id: number, name: string, createdAt?: string, location?: string, experience?: string, fertilizer?: string} | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<{id: number, name: string, createdAt?: string, location?: string, experience?: string, fertilizer?: string} | null>(null);
  
  const handleCreateGardenPlan = (planName: string) => {
    const newPlan = {
      id: Math.max(...gardenPlans.map(p => p.id), 0) + 1,
      name: planName,
      status: "generating",
      createdAt: new Date().toISOString().split('T')[0].replace(/-/g, '/'),
      location: "Not specified",
      experience: "beginner",
      fertilizer: "Not specified"
    };
    setGardenPlans([...gardenPlans, newPlan]);
  };
  
  const handleEditGardenPlan = (planId: number, planName: string, location?: string, experience?: string, fertilizer?: string) => {
    setGardenPlans(gardenPlans.map(plan => 
      plan.id === planId 
        ? { 
            ...plan, 
            name: planName,
            location: location || plan.location,
            experience: experience || plan.experience,
            fertilizer: fertilizer || plan.fertilizer
          } 
        : plan
    ));
  };
  
  const handleOpenEditModal = (plan: {id: number, name: string, createdAt?: string, location?: string, experience?: string, fertilizer?: string}) => {
    setEditingPlan(plan);
    setIsEditModalOpen(true);
  };
  
  const handleOpenDeleteModal = (plan: {id: number, name: string, createdAt?: string, location?: string, experience?: string, fertilizer?: string}) => {
    setDeletingPlan(plan);
    setIsDeleteModalOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (deletingPlan) {
      setGardenPlans(gardenPlans.filter(plan => plan.id !== deletingPlan.id));
      setIsDeleteModalOpen(false);
      setDeletingPlan(null);
    }
  };
  
  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'generating':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">Manage garden advisor</h1>
        <div className="flex space-x-3">
          <Link 
            href="/dashboard/garden-advisor/create"
            className="flex items-center bg-primary hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Advisor
          </Link>
          {/* <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Garden Plan
          </button> */}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {gardenPlans.map(plan => (
          <div 
            key={plan.id}
            className={`border rounded-lg overflow-hidden flex flex-col h-full shadow-sm hover:shadow-md hover:bg-green-50 transition-shadow`}
          >
            <div className="p-4 flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-medium">{plan.name}</h3>
                <div className="flex items-center">
                  <button 
                    onClick={() => handleOpenEditModal(plan)}
                    className="text-gray-500 hover:text-gray-700"
                    title="Edit garden plan"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21h-9.5A2.25 2.25 0 014 18.75V8.25A2.25 2.25 0 016.25 6H8" />
                    </svg>
                  </button>

                  {plan.status === 'failed' && (
                    <button 
                      onClick={() => handleOpenDeleteModal(plan)}
                      className="text-gray-500 hover:text-red-600 ml-3"
                      title="Delete garden plan"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600 flex-grow">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-gray-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <span>Location: {plan.location}</span>
                </div>
                
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-gray-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                  </svg>
                  <span>Experience: {plan.experience}</span>
                </div>
                
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-gray-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m-9-6l9-3m9 3l-9-3" />
                  </svg>
                  <span>Fertilizer: {plan.fertilizer}</span>
                </div>

                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-gray-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  <span>Created At: {plan.createdAt}</span>
                </div>
              </div>
              
              <span className={`inline-block ${getStatusColorClass(plan.status)} text-xs px-2 py-1 rounded mt-2 w-fit`}>
                {plan.status}
              </span>

            </div>
          </div>
        ))}
      </div>
      
      {isCreateModalOpen && (
        <CreateGardenPlanModal 
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateGardenPlan}
        />
      )}
      
      {isEditModalOpen && editingPlan && (
        <EditGardenPlanModal 
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditGardenPlan}
          planId={editingPlan.id}
          currentName={editingPlan.name}
          location={editingPlan.location}
          experience={editingPlan.experience}
          fertilizer={editingPlan.fertilizer}
        />
      )}
      
      {isDeleteModalOpen && deletingPlan && (
        <DeleteConfirmModal
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          projectName={deletingPlan.name}
          title="Delete Garden Plan"
          messageText={`Are you sure you want to delete the garden plan "<span class="font-medium">${deletingPlan.name}</span>"? This action cannot be undone.`}
        />
      )}
    </div>
  );
} 