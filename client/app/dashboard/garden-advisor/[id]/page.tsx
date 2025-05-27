'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import WithProjectCheck from '@/app/components/WithProjectCheck';
import { getGardenAdvisorDetail, getPlantDetail } from '@/app/services/gardenAdvisorService';
import type { GardenAdvisorDetail as GardenAdvisorDetailType, PlantDetail } from '@/app/services/gardenAdvisorService';

// 格式化文本，将多行文本转换为数组
const formatMultilineText = (text: string | null): string[] => {
  if (!text) return [];
  return text.split('\n').filter(line => line.trim() !== '');
};

export default function GardenAdvisorDetail() {
  const params = useParams();
  // 处理params.id可能是string[]的情况
  const advisorId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  // 添加状态来保存API返回的数据
  const [advisorData, setAdvisorData] = useState<GardenAdvisorDetailType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Define state for selected plant
  const [selectedPlant, setSelectedPlant] = useState<string | null>(null);
  const [selectedSpace, setSelectedSpace] = useState<number | null>(null);
  const [plantDetail, setPlantDetail] = useState<PlantDetail | null>(null);
  const [loadingPlantDetail, setLoadingPlantDetail] = useState<boolean>(false);

  // 从API获取数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getGardenAdvisorDetail(advisorId);
        setAdvisorData(data);
        setError(null);
      } catch (err) {
        console.error('获取Garden Advisor详情失败:', err);
        setError('加载数据失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };

    if (advisorId) {
      fetchData();
    }
  }, [advisorId]);

  // 获取植物详情
  useEffect(() => {
    const fetchPlantDetail = async () => {
      if (!selectedPlant || selectedSpace === null) return;
      
      try {
        setLoadingPlantDetail(true);
        const data = await getPlantDetail(selectedSpace, selectedPlant);
        setPlantDetail(data);
      } catch (err) {
        console.error('获取植物详情失败:', err);
        // 不设置全局错误，只在控制台显示错误信息
      } finally {
        setLoadingPlantDetail(false);
      }
    };

    fetchPlantDetail();
  }, [selectedPlant, selectedSpace]);

  // Handler for plant selection
  const handlePlantSelect = (plantName: string, spaceId: number) => {
    setSelectedPlant(plantName);
    setSelectedSpace(spaceId);
  };
  
  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <WithProjectCheck>
        <div className="p-6 flex justify-center">
          <p>正在加载数据...</p>
        </div>
      </WithProjectCheck>
    );
  }

  // 如果有错误，显示错误信息
  if (error) {
    return (
      <WithProjectCheck>
        <div className="p-6">
          <p className="text-red-500">{error}</p>
        </div>
      </WithProjectCheck>
    );
  }

  // 如果没有数据，显示提示信息
  if (!advisorData) {
    return (
      <WithProjectCheck>
        <div className="p-6">
          <p>未找到相关数据</p>
        </div>
      </WithProjectCheck>
    );
  }

  const { gardenPlan, spaces } = advisorData;

  return (
    <WithProjectCheck>
      <div className="p-6">
        <div className="flex items-center mb-8">
          <Link 
            href="/dashboard/garden-advisor" 
            className="flex items-center text-gray-600 hover:text-primary mr-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back
          </Link>
          <h1 className="text-2xl font-semibold">Garden Plant Advisor</h1>
        </div>
        <h2 className="text-xl text-gray-800 mb-4">Garden Plan</h2>
        <div className="bg-green-100 rounded-lg shadow-sm py-3 px-6 mb-1">
          <div className="flex justify-between items-start mb-5">
          {/* <div className="flex space-x-2">
            <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-green-700 transition-colors">
              Edit Plan
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
              Share
            </button>
          </div> */}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 flex items-center justify-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
            <div>
              <span className="text-sm text-gray-500">Location:</span>
              <p className="text-gray-800">{gardenPlan.location}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 flex items-center justify-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
              </svg>
            </div>
            <div>
              <span className="text-sm text-gray-500">Experience:</span>
              <p className="text-gray-800">{gardenPlan.experience}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 flex items-center justify-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 01-.75.75h-.75m-6-1.5H4.5m0 0l-.375-.375a1.125 1.125 0 011.59-1.59L7.5 15.75M15 17.25l-6.75-6.75" />
              </svg>
            </div>
            <div>
              <span className="text-sm text-gray-500">Budget:</span>
              <p className="text-gray-800">{gardenPlan.budget}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 flex items-center justify-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <span className="text-sm text-gray-500">Time:</span>
              <p className="text-gray-800">{gardenPlan.time}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 flex items-center justify-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
              </svg>
            </div>
            <div>
              <span className="text-sm text-gray-500">Maintenance:</span>
              <p className="text-gray-800">{gardenPlan.maintenance}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 flex items-center justify-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m-9-6l9-3m9 3l-9-3" />
              </svg>
            </div>
            <div>
              <span className="text-sm text-gray-500">Fertilizer:</span>
              <p className="text-gray-800">{gardenPlan.fertilizer}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 flex items-center justify-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
              </svg>
            </div>
            <div>
              <span className="text-sm text-gray-500">Spaces:</span>
              <p className="text-gray-800">{gardenPlan.spaces}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 flex items-center justify-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <div>
              <span className="text-sm text-gray-500">Created At:</span>
              <p className="text-gray-800">{gardenPlan.createdAt}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 flex items-center justify-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
              </svg>
            </div>
            <div>
              <span className="text-sm text-gray-500">Goals:</span>
              <p className="text-gray-800">{gardenPlan.goals}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 flex items-center justify-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25" />
              </svg>
            </div>
            <div>
              <span className="text-sm text-gray-500">Plant Types:</span>
              <p className="text-gray-800">{gardenPlan.plantTypes}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 flex items-center justify-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              </svg>
            </div>
            <div>
              <span className="text-sm text-gray-500">Allergies:</span>
              <p className="text-gray-800">{gardenPlan.allergies}</p>
            </div>
          </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Plant Recommendations</h2>
        
        <div className="space-y-6">
          {spaces.map((space, index) => (
            <div key={space.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-white px-6 py-4 border-b border-gray-200">
                <h3 className="font-semibold text-lg">Space {index + 1}: {space.in_out} {space.cultivation}</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-2 text-sm">
                <div className="flex flex-col justify-center">
                  <span className="text-gray-500">In/Out:</span>
                    <p className="mt-1">{space.in_out}</p>
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-gray-500">Cultivation:</span>
                  <div className="flex items-center mt-1">
                      <div className={`${
                        space.cultivation.includes('Round') ? 'bg-[#F9E9FB]' : 
                        space.cultivation.includes('Square') ? 'bg-[#E6F7FF]' : 
                        space.cultivation.includes('Raised') ? 'bg-[#EDFAEF]' : 
                        'bg-[#FFF3E0]'
                      } h-6 w-6 rounded-sm mr-2 flex items-center justify-center`}>
                        {space.cultivation.includes('Round') && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <ellipse cx="8" cy="10.5" rx="7" ry="4.5" fill="#E9C7F9" stroke="#9C27B0" strokeWidth="1.5"/>
                        <path d="M3 10.5V7C3 4.79086 5.23858 3 8 3C10.7614 3 13 4.79086 13 7V10.5" stroke="#9C27B0" strokeWidth="1.5"/>
                        <line x1="5" y1="7.25" x2="11" y2="7.25" stroke="#9C27B0" strokeWidth="1.5"/>
                      </svg>
                        )}
                        {space.cultivation.includes('Square') && (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="1" y="5" width="14" height="10" rx="1" fill="#BAE7FF" stroke="#0D6EFD" strokeWidth="1.5"/>
                            <path d="M3 5V3C3 1.89543 3.89543 1 5 1H11C12.1046 1 13 1.89543 13 3V5" stroke="#0D6EFD" strokeWidth="1.5"/>
                            <line x1="3" y1="8.25" x2="13" y2="8.25" stroke="#0D6EFD" strokeWidth="1.5"/>
                      </svg>
                        )}
                        {space.cultivation.includes('Raised') && (
                      <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="1" y="5" width="20" height="10" rx="1" fill="#B7E4C7" stroke="#2D6A4F" strokeWidth="1.5"/>
                        <line x1="1" y1="8.25" x2="21" y2="8.25" stroke="#2D6A4F" strokeWidth="1.5"/>
                        <line x1="4" y1="1" x2="4" y2="5" stroke="#2D6A4F" strokeWidth="1.5"/>
                        <line x1="18" y1="1" x2="18" y2="5" stroke="#2D6A4F" strokeWidth="1.5"/>
                        <line x1="11" y1="1" x2="11" y2="5" stroke="#2D6A4F" strokeWidth="1.5"/>
                      </svg>
                        )}
                        {space.cultivation.includes('Ground') && (
                      <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 15C1 12 5 1 10 1C15 1 19 12 19 15" stroke="#774D2B" strokeWidth="1.5" strokeLinecap="round"/>
                        <path d="M1 15H19" stroke="#774D2B" strokeWidth="1.5" strokeLinecap="round"/>
                        <path d="M5 10C6.5 8.5 8.5 8 10 8C11.5 8 13.5 8.5 15 10" stroke="#774D2B" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                        )}
                      </div>
                      <span>{space.cultivation}</span>
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-gray-500">Dimensions:</span>
                    <p className="mt-1">{space.dimensions}</p>
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-gray-500">Sunlight:</span>
                  <p className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {space.sunlight}
                    </span>
                  </p>
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-gray-500">Soil:</span>
                  <p className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {space.soil}
                    </span>
                  </p>
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-gray-500">Water Access:</span>
                  <p className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {space.water_access}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {space.plants.map((plant, plantIndex) => (
                  <button 
                      key={plantIndex}
                      onClick={() => handlePlantSelect(plant.name, space.id)}
                    className={`text-left p-3 rounded-md border border-gray-200 transition-colors ${
                        selectedPlant === plant.name && selectedSpace === space.id
                        ? 'bg-green-700 text-white' 
                        : 'bg-grey-100 hover:bg-green-300'
                    }`}
                  >
                    <div className={`font-medium flex items-center ${
                        selectedPlant === plant.name && selectedSpace === space.id ? 'text-white' : 'text-primary'
                    }`}>
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 384 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                        <path d="M378.31 378.49L298.42 288h30.63c9.01 0 16.98-5 20.78-13.06 3.8-8.04 2.55-17.26-3.28-24.05L268.42 160h28.89c9.1 0 17.3-5.35 20.86-13.61 3.52-8.13 1.86-17.59-4.24-24.08L203.66 4.83c-6.03-6.45-17.28-6.45-23.32 0L70.06 122.31c-6.1 6.49-7.75 15.95-4.24 24.08C69.38 154.65 77.59 160 86.69 160h28.89l-78.14 90.91c-5.81 6.78-7.06 15.99-3.27 24.04C37.97 283 45.93 288 54.95 288h30.63L5.69 378.49c-6 6.79-7.36 16.09-3.56 24.26 3.75 8.05 12 13.25 21.01 13.25H160v24.45l-30.29 48.4c-5.32 10.64 2.42 23.16 14.31 23.16h95.96c11.89 0 19.63-12.52 14.31-23.16L224 440.45V416h136.86c9.01 0 17.26-5.2 21.01-13.25 3.8-8.17 2.44-17.47-3.56-24.26z"></path>
                      </svg>
                        &nbsp;{plant.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          ))}
        </div>
      </div>

      {/* Plant Detail Drawer */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-1/3 bg-white shadow-xl transform ${selectedPlant ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out z-50`}>
        {selectedPlant && (
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold">{selectedPlant}</h3>
              <button onClick={() => setSelectedPlant(null)} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {loadingPlantDetail ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-500">Loading plant details...</p>
                </div>
              ) : plantDetail ? (
                <div className="flex-1 overflow-y-auto p-6">
                  {/* 植物图片 */}
              <div className="aspect-w-16 aspect-h-9 mb-6">
                    {plantDetail.image ? (
                      <img 
                        src={plantDetail.image} 
                        alt={plantDetail.name} 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ) : (
                <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">Plant Image</span>
                </div>
                    )}
              </div>
              
                  {/* Why We Recommend - 显示reason */}
                  {plantDetail.reason && (
              <div className="mb-6">
                      <h4 className="font-semibold mb-2">Why We Recommend</h4>
                      <p className="text-gray-700">{plantDetail.reason}</p>
              </div>
                  )}
              
                  {/* Growing Conditions & Plant Characteristics */}
                  <div className="mb-6">
                    <div>
                      <h4 className="font-semibold mb-2">Growing Conditions</h4>
                      <ul className="space-y-2">
                        {plantDetail.growingMonth && (
                          <li className="flex items-start">
                            <span className="w-36 flex-shrink-0 text-gray-500">Growing Month:</span>
                            <span className="flex-1">{plantDetail.growingMonth}</span>
                          </li>
                        )}
                        {plantDetail.flowerHarvest && (
                          <li className="flex items-start">
                            <span className="w-36 flex-shrink-0 text-gray-500">Flower/Harvest:</span>
                            <span className="flex-1">{plantDetail.flowerHarvest}</span>
                          </li>
                        )}
                        {plantDetail.characteristicDistance && (
                          <li className="flex items-start">
                            <span className="w-36 text-gray-500">Distance:</span>
                            <span>{plantDetail.characteristicDistance}</span>
                          </li>
                        )}
                      </ul>
                    </div>
                    {/* <div>
                      <h4 className="font-semibold mb-2">Plant Characteristics</h4>
                      <ul className="space-y-2">
                        {plantDetail.height && (
                          <li className="flex items-start">
                            <span className="w-28 text-gray-500">Height:</span>
                            <span>{plantDetail.height}</span>
                          </li>
                        )}
                        {plantDetail.characteristicDistance && (
                          <li className="flex items-start">
                            <span className="w-28 text-gray-500">Distance:</span>
                            <span>{plantDetail.characteristicDistance}</span>
                          </li>
                        )}
                        {plantDetail.bloom && (
                          <li className="flex items-start">
                            <span className="w-28 text-gray-500">Bloom Time:</span>
                            <span>{plantDetail.bloom}</span>
                          </li>
                        )}
                        {plantDetail.lifespan && (
                          <li className="flex items-start">
                            <span className="w-28 text-gray-500">Lifespan:</span>
                            <span>{plantDetail.lifespan}</span>
                          </li>
                        )}
                      </ul>
                    </div> */}
                  </div>
                  
                  {/* Growth Habits - 显示growing_habits，按行分隔，每行用加号SVG图标 */}
                  {plantDetail.growingHabits && (
                    <div className="mb-6">
                      <h4 className="font-semibold mb-2">Growth Habits</h4>
                      <ul className="space-y-2">
                        {formatMultilineText(plantDetail.growingHabits).map((line, index) => (
                          <li key={index} className="flex items-start">
                            <div className="w-6 h-6 flex-shrink-0 mr-2 text-green-600">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </div>
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* How To Fertilize - 显示growing_fertilizer */}
                  {plantDetail.growingFertilizer && (
                    <div className="mb-6">
                      <h4 className="font-semibold mb-2">How To Fertilize</h4>
                      <ul className="space-y-2">
                        {formatMultilineText(plantDetail.growingFertilizer).map((line, index) => (
                          <li key={index} className="flex items-start">
                            <div className="w-6 h-6 flex-shrink-0 mr-2 text-green-600">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </div>
                            <span>{line}</span>
                    </li>
                        ))}
                  </ul>
                </div>
                  )}
                  
                  {/* How To Plant - 显示planting_instructions */}
                  {plantDetail.plantingInstructions && (
                    <div className="mb-6">
                      <h4 className="font-semibold mb-2">How To Plant</h4>
                      <ul className="space-y-2">
                        {formatMultilineText(plantDetail.plantingInstructions).map((line, index) => (
                          <li key={index} className="flex items-start">
                            <div className="w-6 h-6 flex-shrink-0 mr-2 text-green-600">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </div>
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
              </div>
                  )}
              
                  {/* How To Prune - 显示growing_cutting */}
                  {plantDetail.growingCutting && (
              <div className="mb-6">
                      <h4 className="font-semibold mb-2">How To Prune</h4>
                <ul className="space-y-2">
                        {formatMultilineText(plantDetail.growingCutting).map((line, index) => (
                          <li key={index} className="flex items-start">
                    <div className="w-6 h-6 flex-shrink-0 mr-2 text-green-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                            <span>{line}</span>
                  </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Disease & Pest - 显示growing_pest */}
                  {plantDetail.growingPest && (
                    <div className="mb-6">
                      <h4 className="font-semibold mb-2">Disease & Pest</h4>
                      <ul className="space-y-2">
                        {formatMultilineText(plantDetail.growingPest).map((line, index) => (
                          <li key={index} className="flex items-start">
                    <div className="w-6 h-6 flex-shrink-0 mr-2 text-green-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                            <span>{line}</span>
                  </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Maintenance Tips - 显示tips */}
                  {plantDetail.tips && (
                    <div className="mb-6">
                      <h4 className="font-semibold mb-2">Maintenance Tips</h4>
                      <ul className="space-y-2">
                        {formatMultilineText(plantDetail.tips).map((line, index) => (
                          <li key={index} className="flex items-start">
                    <div className="w-6 h-6 flex-shrink-0 mr-2 text-green-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                            <span>{line}</span>
                  </li>
                        ))}
                </ul>
              </div>
                  )}
                  
                  {/* Grows Well With - 显示growing_match */}
                  {plantDetail.growingMatch && (
                    <div className="mb-6">
                      <h4 className="font-semibold mb-2">Grows Well With</h4>
                      <ul className="space-y-2">
                        {formatMultilineText(plantDetail.growingMatch).map((line, index) => (
                            <li key={index} className="flex items-start">
                              <div className="w-6 h-6 flex-shrink-0 mr-2 text-green-600">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </div>
                              <span>{line}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-500">No detailed information available for this plant.</p>
              </div>
              )}
            </div>
          </div>
        )}
    </div>
  </WithProjectCheck>
  );
}