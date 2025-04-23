'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CreateGardenPlanModal } from '@/app/components/CreateGardenPlanModal';
import { EditGardenPlanModal } from '@/app/components/EditGardenPlanModal';
import { DeleteConfirmModal } from '@/app/components/DeleteConfirmModal';

// 示例garden plan数据
const initialGardenPlans = [
  { id: 1, name: "Spring Vegetable Garden", isCurrent: true },
  { id: 2, name: "Summer Flower Arrangement", isCurrent: false },
  { id: 3, name: "Herb Garden Layout", isCurrent: false },
];

export default function GardenPlansPage() {
  const [gardenPlans, setGardenPlans] = useState(initialGardenPlans);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<{id: number, name: string} | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<{id: number, name: string} | null>(null);
  
  const handleCreateGardenPlan = (planName: string) => {
    const newPlan = {
      id: Math.max(...gardenPlans.map(p => p.id), 0) + 1,
      name: planName,
      isCurrent: false
    };
    setGardenPlans([...gardenPlans, newPlan]);
  };
  
  const handleEditGardenPlan = (planId: number, planName: string) => {
    setGardenPlans(gardenPlans.map(plan => 
      plan.id === planId 
        ? { ...plan, name: planName } 
        : plan
    ));
  };
  
  const handleOpenEditModal = (plan: {id: number, name: string}) => {
    setEditingPlan(plan);
    setIsEditModalOpen(true);
  };
  
  const handleOpenDeleteModal = (plan: {id: number, name: string}) => {
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
  
  const handleSetCurrentPlan = (planId: number) => {
    setGardenPlans(gardenPlans.map(plan => ({
      ...plan,
      isCurrent: plan.id === planId
    })));
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
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Garden Plan
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gardenPlans.map(plan => (
          <div 
            key={plan.id}
            className={`border rounded-lg p-4 relative ${plan.isCurrent ? 'border-green-500 border-2' : 'border-gray-200'} flex flex-col h-full`}
          >
            <div className="mb-6">
              <h3 className="text-lg font-medium">{plan.name}</h3>
              {plan.isCurrent && (
                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mt-1">
                  Current Plan
                </span>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 mt-auto">
              {!plan.isCurrent && (
                <button 
                  onClick={() => handleSetCurrentPlan(plan.id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded text-sm"
                >
                  Open This Plan
                </button>
              )}
              
              <button 
                onClick={() => handleOpenEditModal(plan)}
                className="text-gray-500 hover:text-gray-700"
                title="Edit garden plan"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21h-9.5A2.25 2.25 0 014 18.75V8.25A2.25 2.25 0 016.25 6H8" />
                </svg>
              </button>
              
              <button 
                onClick={() => handleOpenDeleteModal(plan)}
                className="text-gray-500 hover:text-red-600"
                title="Delete garden plan"
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