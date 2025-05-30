'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CreateGardenPlanModal } from '@/app/components/CreateGardenPlanModal';
import { EditGardenPlanModal } from '@/app/components/EditGardenPlanModal';
import { DeleteConfirmModal } from '@/app/components/DeleteConfirmModal';
import WithProjectCheck from '@/app/components/WithProjectCheck';
import { useEventBus } from '@/app/contexts/EventBus';
import { getGardenAdvisorList, GardenAdvisor, updateGardenAdvisor } from '@/app/services/gardenAdvisorService';
import { useProject } from '@/app/contexts/ProjectContext';
import { useRouter } from 'next/navigation';

// 定义编辑和删除计划的参数类型
interface PlanActionParams {
  id: number;
  name: string;
  createdAt?: string;
  location?: string;
  experience?: string;
  fertilizer?: string;
}

// 临时扩展GardenAdvisor类型，将status视为数字类型
interface GardenAdvisorWithNumericStatus extends Omit<GardenAdvisor, 'status'> {
  status: number;
}

export default function GardenPlansPage() {
  const [gardenPlans, setGardenPlans] = useState<GardenAdvisorWithNumericStatus[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<PlanActionParams | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<PlanActionParams | null>(null);
  
  // 使用事件总线
  const { on } = useEventBus();
  // 使用项目上下文
  const { currentProject } = useProject();
  // 使用路由
  const router = useRouter();
  
  // 获取Garden Advisor列表数据
  const fetchGardenAdvisorList = async (projectId: number) => {
    try {
      setIsLoading(true);
      const data = await getGardenAdvisorList(projectId);
      // 将数据视为具有数字类型status的数组
      setGardenPlans(data as unknown as GardenAdvisorWithNumericStatus[]);
    } catch (error) {
      console.error('获取Garden Advisor列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 在组件加载和currentProject变化时获取数据
  useEffect(() => {
    if (currentProject) {
      console.log('Garden Advisor页面: 当前项目ID:', currentProject.id);
      fetchGardenAdvisorList(currentProject.id);
    }
  }, [currentProject]);
  
  // 监听项目选择事件
  useEffect(() => {
    const unsubscribe = on('project_selected', ({ selectedProjectId }) => {
      console.log('Garden Advisor页面: 接收到项目选择事件, 项目ID:', selectedProjectId);
      if (selectedProjectId) {
        fetchGardenAdvisorList(selectedProjectId);
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [on]);
  
  // 格式化经验水平
  const formatExperience = (experience: number): string => {
    switch (experience) {
      case 1:
        return 'Novice';
      case 2:
        return 'Proficient';
      case 3:
        return 'Expert';
      default:
        return 'Unknown';
    }
  };
  
  // 格式化肥料类型
  const formatFertilizer = (fertilizer: number): string => {
    switch (fertilizer) {
      case 1:
        return 'Organic';
      case 2:
        return 'Conventional';
      default:
        return 'Unknown';
    }
  };
  
  // 将UNIX时间戳转换为可读日期
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toISOString().split('T')[0].replace(/-/g, '/');
  };
  
  const handleCreateGardenPlan = (planName: string) => {
    // 这里需要实现创建Garden Advisor的逻辑
    console.log('创建Garden Advisor:', planName);
  };
  
  const handleEditGardenPlan = async (planId: number, planName: string, location?: string, experience?: string, fertilizer?: string) => {
    try {
      // 调用更新Garden Advisor的API
      await updateGardenAdvisor(planId, planName);
      
      // 更新成功后重新获取Garden Advisor列表
      if (currentProject) {
        await fetchGardenAdvisorList(currentProject.id);
      }
    } catch (error) {
      console.error('Error updating garden advisor:', error);
    }
  };
  
  const handleOpenEditModal = (plan: PlanActionParams) => {
    setEditingPlan(plan);
    setIsEditModalOpen(true);
  };
  
  const handleOpenDeleteModal = (plan: PlanActionParams) => {
    setDeletingPlan(plan);
    setIsDeleteModalOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (deletingPlan) {
      // 这里需要实现删除Garden Advisor的逻辑
      console.log('删除Garden Advisor:', deletingPlan.id);
      setIsDeleteModalOpen(false);
      setDeletingPlan(null);
    }
  };
  
  const getStatusColorClass = (status: number) => {
    switch (status) {
      case 1:
        return 'bg-green-100 text-green-800';
      case 0:
        return 'bg-blue-100 text-blue-800';
      case 2:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // 根据status数值返回对应的状态文本
  const getStatusText = (status: number): string => {
    switch (status) {
      case 0:
        return 'Generating';
      case 1:
        return 'Completed';
      case 2:
        return 'Failed';
      default:
        return 'Unknown';
    }
  };
  
  return (
    <WithProjectCheck>
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
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : gardenPlans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No garden advisors found. Create one to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {gardenPlans.map(plan => (
              <div 
                key={plan.id}
                className={`border rounded-lg overflow-hidden flex flex-col h-full shadow-sm ${plan.status === 1 ? 'hover:shadow-md hover:bg-green-50 transition-shadow cursor-pointer' : ''}`}
                onClick={() => {
                  if (plan.status === 1) {
                    router.push(`/dashboard/garden-advisor/detail?did=${plan.id}`);
                  }
                }}
              >
                <div className="p-4 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-medium">{plan.plan_name}</h3>
                    <div className="flex items-center">
                      <button 
                        onClick={(e) => {
                          e.preventDefault(); // 阻止导航事件
                          e.stopPropagation(); // 阻止事件冒泡
                          handleOpenEditModal({
                            id: plan.id,
                            name: plan.plan_name,
                            location: `${plan.location}, ${plan.hardiness_zone}`,
                            experience: formatExperience(plan.experience),
                            fertilizer: formatFertilizer(plan.fertilizer)
                          });
                        }}
                        className="text-gray-500 hover:text-gray-700"
                        title="Edit garden plan"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21h-9.5A2.25 2.25 0 014 18.75V8.25A2.25 2.25 0 016.25 6H8" />
                        </svg>
                      </button>

                      {plan.status === 2 && (
                        <button 
                          onClick={(e) => {
                            e.preventDefault(); // 阻止导航事件
                            e.stopPropagation(); // 阻止事件冒泡
                            handleOpenDeleteModal({
                              id: plan.id,
                              name: plan.plan_name
                            });
                          }}
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
                      <span>Location: {plan.location}, {plan.hardiness_zone}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-gray-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                      </svg>
                      <span>Experience: {formatExperience(plan.experience)}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-gray-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m-9-6l9-3m9 3l-9-3" />
                      </svg>
                      <span>Fertilizer: {formatFertilizer(plan.fertilizer)}</span>
                    </div>

                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-gray-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      <span>Created At: {formatDate(plan.ctime)}</span>
                    </div>
                  </div>
                  
                  <span className={`inline-block ${getStatusColorClass(plan.status)} text-xs px-2 py-1 rounded mt-2 w-fit`}>
                    {getStatusText(plan.status)}
                  </span>
                  
                  {plan.status === 1 && (
                    <div className="mt-2 text-xs text-primary">
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                        Click to view details
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
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
    </WithProjectCheck>
  );
} 