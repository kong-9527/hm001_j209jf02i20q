'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import WithProjectCheck from '@/app/components/WithProjectCheck';
import PlantingPlaceModal from '@/app/components/PlantingPlaceModal';
import axios from 'axios';
import { useNotification } from '@/app/components/NotificationCenter';
import { useProject } from '@/app/contexts/ProjectContext';
import { useUser } from '@/app/contexts/UserContext';
import { createGardenAdvisor } from '@/app/services/gardenAdvisorService';

// 添加字典表常量
const EXPERIENCE_DICT = {
  1: { id: 1, label: 'Novice', value: 'Beginner' },
  2: { id: 2, label: 'Proficient', value: 'Intermediate' },
  3: { id: 3, label: 'Expert', value: 'Advanced' }
};

const BUDGET_DICT = {
  1: { id: 1, label: 'Low', value: 'Low' },
  2: { id: 2, label: 'Medium', value: 'Medium' },
  3: { id: 3, label: 'High', value: 'High' }
};

const TIME_DICT = {
  1: { id: 1, label: 'Low', value: 'Low' },
  2: { id: 2, label: 'Medium', value: 'Medium' },
  3: { id: 3, label: 'High', value: 'High' }
};

const MAINTENANCE_DICT = {
  1: { id: 1, label: 'Low', value: 'Low' },
  2: { id: 2, label: 'Medium', value: 'Medium' },
  3: { id: 3, label: 'High', value: 'High' }
};

const FERTILIZER_DICT = {
  1: { id: 1, label: 'Organic', value: 'Organic' },
  2: { id: 2, label: 'Conventional', value: 'Conventional' }
};

// Points required to create a garden advisor
const REQUIRED_POINTS = 5;

export default function CreateGardenAdvisorPage() {
  const router = useRouter();
  const { currentProject } = useProject();
  const { user } = useUser();
  const { addNotification } = useNotification();
  
  // 添加步骤状态
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // 添加弹窗状态
  const [isPlantingPlaceModalOpen, setIsPlantingPlaceModalOpen] = useState(false);
  const [editingPlantingPlace, setEditingPlantingPlace] = useState<any>(null);
  const [plantingPlaceModalTitle, setPlantingPlaceModalTitle] = useState("Add Planting Place");

  // General Information state - 将所有默认值设为空
  const [gardenLocation, setGardenLocation] = useState('');
  const [hardinessZone, setHardinessZone] = useState('');
  // 使用字典表中的值
  const [experience, setExperience] = useState('');
  const [budget, setBudget] = useState('');
  const [time, setTime] = useState('');
  const [maintenance, setMaintenance] = useState('');
  const [goals, setGoals] = useState<string[]>([]);

  // Custom Planting Plan state - 将所有默认值设为空
  const [plantTypes, setPlantTypes] = useState<string[]>([]);
  // 使用字典表中的值
  const [fertilizerType, setFertilizerType] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);

  // Garden Space state
  const [gardenSpaces, setGardenSpaces] = useState<Array<{
    id: number;
    inOut: string;
    type: string;
    length: string;
    width: string;
    height: string;
    diameter: string;
    sunlight: string;
    soil: string;
    waterAccess: string;
    measurement: string;
  }>>([]);

  // 添加发送API请求状态
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 当前用户点数
  const userPoints = user?.points ? parseInt(user.points) : 0;
  
  // 检查用户是否有足够的点数
  const hasEnoughPoints = userPoints >= REQUIRED_POINTS;

  // 打开添加种植位置弹窗
  const openAddPlantingPlaceModal = () => {
    setEditingPlantingPlace(null);
    setPlantingPlaceModalTitle("Add Planting Place");
    setIsPlantingPlaceModalOpen(true);
  };

  // 打开编辑种植位置弹窗
  const openEditPlantingPlaceModal = (place: any) => {
    setEditingPlantingPlace({...place});
    setPlantingPlaceModalTitle("Edit Planting Place");
    setIsPlantingPlaceModalOpen(true);
  };

  // 添加4个常用种植位置的函数
  const addSmallIndoorSquarePot = () => {
    const newPlace = {
      id: Date.now(),
      inOut: 'indoor',
      type: 'square-pot',
      length: '25',
      width: '25',
      height: '25',
      diameter: '',
      measurement: 'cm',
      sunlight: 'full-sun',
      soil: 'clay',
      waterAccess: 'easy'
    };
    setGardenSpaces([...gardenSpaces, newPlace]);
  };

  const addBigIndoorRoundPot = () => {
    const newPlace = {
      id: Date.now(),
      inOut: 'indoor',
      type: 'round-pot',
      length: '',
      width: '',
      height: '25',
      diameter: '25',
      measurement: 'cm',
      sunlight: 'full-sun',
      soil: 'clay',
      waterAccess: 'easy'
    };
    setGardenSpaces([...gardenSpaces, newPlace]);
  };

  const addRaisedBedOutside = () => {
    const newPlace = {
      id: Date.now(),
      inOut: 'outdoor',
      type: 'raised-bed',
      length: '50',
      width: '50',
      height: '25',
      diameter: '',
      measurement: 'cm',
      sunlight: 'full-sun',
      soil: 'clay',
      waterAccess: 'easy'
    };
    setGardenSpaces([...gardenSpaces, newPlace]);
  };

  const addPieceOfLandOutside = () => {
    const newPlace = {
      id: Date.now(),
      inOut: 'outdoor',
      type: 'ground',
      length: '50',
      width: '50',
      height: '',
      diameter: '',
      measurement: 'cm',
      sunlight: 'full-sun',
      soil: 'clay',
      waterAccess: 'easy'
    };
    setGardenSpaces([...gardenSpaces, newPlace]);
  };

  // 处理保存种植位置
  const handleSavePlantingPlace = (place: any) => {
    if (editingPlantingPlace) {
      // 编辑现有位置
      setGardenSpaces(
        gardenSpaces.map(space => 
          space.id === editingPlantingPlace.id ? place : space
        )
      );
    } else {
      // 添加新位置
      setGardenSpaces([...gardenSpaces, place]);
    }
  };

  // 处理删除种植位置
  const handleDeletePlantingPlace = (id: number) => {
    setGardenSpaces(gardenSpaces.filter(space => space.id !== id));
  };

  // 步骤切换函数
  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  // 根据步骤显示相应内容
  const showContentByStep = (step: number) => {
    switch (step) {
      case 1:
        return showStep1Content();
      case 2:
        return showStep2Content();
      case 3:
        return showStep3Content();
      default:
        return showStep1Content();
    }
  };

  // 各步骤内容展示函数占位 - 将在后面实现
  const showStep1Content = () => {
    return (
      <div className="space-y-10">
        {/* Section 1: General Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <div className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold mr-3">1</div>
            <h2 className="text-xl font-semibold">General Information</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-1">Where is your geographic location (optional)</label>
              <select 
                className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                value={gardenLocation}
                onChange={(e) => setGardenLocation(e.target.value)}
              >
                <option value="">Select a country or a region (optional)</option>
                <option value="us">United States</option>
                <option value="ca">Canada</option>
                <option value="uk">United Kingdom</option>
                <option value="au">Australia</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-1">Hardiness Zone (optional)</label>
              <select 
                className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                value={hardinessZone}
                onChange={(e) => setHardinessZone(e.target.value)}
              >
                <option value="">Select a hardiness zone (optional)</option>
                <option value="1">Zone 1</option>
                <option value="2">Zone 2</option>
                <option value="3">Zone 3</option>
                <option value="4">Zone 4</option>
                <option value="5">Zone 5</option>
              </select>
              <Link href="#" className="text-blue-500 text-xs hover:underline inline-block mt-1.5">
                Learn more about hardiness zones
              </Link>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold mb-1">Your Gardening Experience</label>
              </div>
              <div className="md:col-span-3">
                <p className="text-xs text-gray-500 mb-3">Your gardening experience (optional):</p>
                <div className="flex flex-wrap gap-4">
                  {Object.values(EXPERIENCE_DICT).map((item) => (
                    <label key={item.id} className={`flex items-center bg-white border rounded-md px-4 py-2 cursor-pointer transition-colors hover:bg-green-50 ${experience === item.value ? 'border-primary bg-green-50' : 'border-gray-300 hover:bg-green-50'}`}>
                      <input
                        type="radio"
                        name="experience"
                        checked={experience === item.value}
                        onChange={() => setExperience(item.value)}
                        className="hidden"
                      />
                      <div className={`w-4 h-4 rounded-full mr-2 border ${experience === item.value ? 'border-primary bg-primary' : 'border-gray-300'}`}>  </div>
                      <span className={experience === item.value ? 'text-primary font-medium' : ''}>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold mb-1">Your Gardening Budget</label>
              </div>
              <div className="md:col-span-3">
                <p className="text-xs text-gray-500 mb-3">Your funds range for gardening (optional):</p>
                <div className="flex flex-wrap gap-4">
                  {Object.values(BUDGET_DICT).map((item) => (
                    <label key={item.id} className={`flex items-center bg-white border rounded-md px-4 py-2 cursor-pointer transition-colors hover:bg-green-50 ${budget === item.value ? 'border-primary bg-green-50' : 'border-gray-300 hover:bg-green-50'}`}>
                      <input
                        type="radio"
                        name="budget"
                        checked={budget === item.value}
                        onChange={() => setBudget(item.value)}
                        className="hidden"
                      />
                      <div className={`w-4 h-4 rounded-full mr-2 border ${budget === item.value ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                      </div>
                      <span className={budget === item.value ? 'text-primary font-medium' : ''}>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold mb-1">Your Gardening Time</label>
              </div>
              <div className="md:col-span-3">
                <p className="text-xs text-gray-500 mb-3">How much time you spending on gardening (optional):</p>
                <div className="flex flex-wrap gap-4">
                  {Object.values(TIME_DICT).map((item) => (
                    <label key={item.id} className={`flex items-center bg-white border rounded-md px-4 py-2 cursor-pointer  hover:bg-green-50 ${time === item.value ? 'border-primary bg-green-50' : 'border-gray-300 hover:bg-green-50'}`}>
                      <input
                        type="radio"
                        name="time"
                        checked={time === item.value}
                        onChange={() => setTime(item.value)}
                        className="hidden"
                      />
                      <div className={`w-4 h-4 rounded-full mr-2 border ${time === item.value ? 'border-primary bg-primary' : 'border-gray-300'}`}></div>
                      <span className={time === item.value ? 'text-primary font-medium' : ''}>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold mb-1">Your Maintenance Preference</label>
              </div>
              <div className="md:col-span-3">
                <p className="text-xs text-gray-500 mb-3">Select the level of difficulty you want to maintain (optional):</p>
                <div className="flex flex-wrap gap-4">
                  {Object.values(MAINTENANCE_DICT).map((item) => (
                    <label key={item.id} className={`flex items-center bg-white border rounded-md px-4 py-2 cursor-pointer transition-colors hover:bg-green-50 ${maintenance === item.value ? 'border-primary bg-green-50' : 'border-gray-300 hover:bg-green-50'}`}>
                      <input
                        type="radio"
                        name="maintenance"
                        checked={maintenance === item.value}
                        onChange={() => setMaintenance(item.value)}
                        className="hidden"
                      />
                      <div className={`w-4 h-4 rounded-full mr-2 border ${maintenance === item.value ? 'border-primary bg-primary' : 'border-gray-300'}`}></div>
                      <span className={maintenance === item.value ? 'text-primary font-medium' : ''}>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold mb-1">Your Gardening Goals</label>
              </div>
              <div className="md:col-span-3">
                <p className="text-xs text-gray-500 mb-3">What are you maintaining your garden for (optional):</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Food', 'Wildlife', 'Beauty', 'Education', 'Medicinal', 'Hobby', 'Fragrance', 'Money'].map((goal) => (
                    <label key={goal} className={`flex items-center border rounded-md px-3 py-2 cursor-pointer hover:bg-green-50 transition-colors ${goals.includes(goal) ? 'border-primary' : 'border-gray-200'}`}>
                      <input
                        type="checkbox"
                        checked={goals.includes(goal)}
                        onChange={() => handleGoalChange(goal)}
                        className="hidden"
                      />
                      <div className={`w-4 h-4 rounded mr-2 flex items-center justify-center border ${goals.includes(goal) ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                        {goals.includes(goal) && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={goals.includes(goal) ? 'text-primary font-medium' : ''}>{goal}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              onClick={goToNextStep}
              className="bg-primary hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition-colors flex items-center"
            >
              Next Step
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const showStep2Content = () => {
    return (
      <div className="space-y-10">
        {/* Section 2: Custom Planting Plan */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-5">
            <div className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold mr-3">2</div>
            <h2 className="text-xl font-semibold">Custom Planting Plan</h2>
          </div>
          
          <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold mb-1">Plant Classification</label>
              </div>
              <div className="md:col-span-3">
                <p className="text-xs text-gray-500 mb-3">What kind of plants you prefer to grow (optional):</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Flowers', 'Vegetables', 'Trees', 'Grasses', 'Cacti', 'Mosses', 'Aquatics', 'Orchids', 'Herbs', 'Fruits', 'Shrubs', 'Succulents', 'Ferns', 'Vines', 'Bulbs'].map((type) => (
                    <label key={type} className={`flex items-center border rounded-md px-3 py-3 cursor-pointer hover:bg-green-50 transition-colors ${plantTypes.includes(type) ? 'border-primary' : 'border-gray-200'}`}>
                      <input
                        type="checkbox"
                        checked={plantTypes.includes(type)}
                        onChange={() => handlePlantTypeChange(type)}
                        className="hidden"
                      />
                      <div className={`w-4 h-4 rounded mr-2 flex items-center justify-center border ${plantTypes.includes(type) ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                        {plantTypes.includes(type) && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={plantTypes.includes(type) ? 'text-primary font-medium' : ''}>{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold mb-1">Fertilizers Type</label>
              </div>
              <div className="md:col-span-3">
                <p className="text-xs text-gray-500 mb-3">What kind of fertilizer do you prefer to use to maintain plants (optional):</p>
                <div className="space-y-3">
                  {Object.values(FERTILIZER_DICT).map((item) => (
                    <label key={item.id} className="flex items-start p-3 border rounded-md cursor-pointer hover:bg-green-50 transition-colors">
                      <input
                        type="radio"
                        name="fertilizer"
                        checked={fertilizerType === item.value}
                        onChange={() => setFertilizerType(item.value)}
                        className="hidden"
                      />
                      <div className="flex h-5 items-center mr-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${fertilizerType === item.value ? 'border-primary' : 'border-gray-300'}`}>
                          {fertilizerType === item.value && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                        </div>
                      </div>
                      <div>
                        <span className={`font-medium ${fertilizerType === item.value ? 'text-primary' : ''}`}>{item.label}</span>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.value === 'Organic' ? 
                            'Organic gardening emphasizes the utilization of natural techniques and substances for plant cultivation. It strictly avoids the application of synthetic chemicals and pesticides, instead relying on nature - friendly approaches to ensure healthy plant growth.' : 
                            'In contrast, conventional gardening typically makes use of synthetic fertilizers and pesticides. The main goal of this method is to boost plant growth to the maximum extent and effectively control pests, often through the use of artificial chemical substances.'}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold mb-1">Allergies</label>
              </div>
              <div className="md:col-span-3">
                <p className="text-xs text-gray-500 mb-3">Allergens and options that may affect your health or mood (optional):</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {['Pollen', 'Mold', 'Trees', 'Weeds', 'Bees', 'Dust', 'Shrubs', 'Insects', 'Grass', 'Flowers'].map((allergy) => (
                    <label key={allergy} className={`flex items-center border rounded-md px-3 py-3 cursor-pointer hover:bg-green-50 transition-colors ${allergies.includes(allergy) ? 'border-primary' : 'border-gray-200'}`}>
                      <input
                        type="checkbox"
                        checked={allergies.includes(allergy)}
                        onChange={() => handleAllergyChange(allergy)}
                        className="hidden"
                      />
                      <div className={`w-4 h-4 rounded mr-2 flex items-center justify-center border ${allergies.includes(allergy) ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                        {allergies.includes(allergy) && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={allergies.includes(allergy) ? 'text-primary font-medium' : ''}>{allergy}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-between">
            <button
              onClick={goToPrevStep}
              className="w-[130px] border border-gray-300 hover:border-gray-400 bg-white text-gray-700 px-6 py-2 rounded-md font-medium transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            <button
              onClick={goToNextStep}
              className="bg-primary hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition-colors flex items-center"
            >
              Next Step
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const showStep3Content = () => {
    return (
      <div className="space-y-10">
        {/* Section 3: Custom Your Planting Space */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-5">
            <div className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold mr-3">3</div>
            <h2 className="text-xl font-semibold">Custom Your Planting Places</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            {/* <div className="md:col-span-1">
              <label className="block text-sm font-semibold">Description</label>
            </div> */}
            <div className="md:col-span-3">
              <p className="text-sm text-gray-700 mb-4 bg-green-50 p-4 rounded-md gap-2">Planting Place: You can divide your garden or separate area for planting plants in your home into several planting places. We suggest that you divide different garden spaces based on factors such as pot size, soil type, lighting conditions, water supply conditions, indoor or outdoor conditions, and so on. We will provide individual planting suggestions and plans for each planting place.</p>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold">Frequently Used Planting Places</label>
              </div>
              <div className="md:col-span-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div 
                    className="border rounded-md p-3 flex items-center hover:bg-green-50 hover:border-primary cursor-pointer transition-colors"
                    onClick={addSmallIndoorSquarePot}
                  >
                    <div className="w-6 h-6 rounded-full bg-green-100 text-primary flex items-center justify-center mr-3">+</div>
                    <span>Small Indoor Square Pot</span>
                  </div>
                  <div 
                    className="border rounded-md p-3 flex items-center hover:bg-green-50 hover:border-primary cursor-pointer transition-colors"
                    onClick={addBigIndoorRoundPot}
                  >
                    <div className="w-6 h-6 rounded-full bg-green-100 text-primary flex items-center justify-center mr-3">+</div>
                    <span>Big Indoor Round Pot</span>
                  </div>
                  <div 
                    className="border rounded-md p-3 flex items-center hover:bg-green-50 hover:border-primary cursor-pointer transition-colors"
                    onClick={addRaisedBedOutside}
                  >
                    <div className="w-6 h-6 rounded-full bg-green-100 text-primary flex items-center justify-center mr-3">+</div>
                    <span>Raised Bed Outside</span>
                  </div>
                  <div 
                    className="border rounded-md p-3 flex items-center hover:bg-green-50 hover:border-primary cursor-pointer transition-colors"
                    onClick={addPieceOfLandOutside}
                  >
                    <div className="w-6 h-6 rounded-full bg-green-100 text-primary flex items-center justify-center mr-3">+</div>
                    <span>Piece of Land Outside</span>
                  </div>
                  <div 
                    className="border border-dashed rounded-md p-3 flex items-center hover:bg-green-50 hover:border-primary cursor-pointer transition-colors"
                    onClick={openAddPlantingPlaceModal}
                  >
                    <div className="w-6 h-6 rounded-full bg-green-100 text-primary flex items-center justify-center mr-3">+</div>
                    <span>Customize Freely</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
              <div className="md:col-span-1">
                <div className="flex items-center mb-2.5">
                  <label className="block text-sm font-semibold">Your Planting Place List</label>
                  <span className="text-xs text-gray-500 ml-2">({gardenSpaces.length} spaces)</span>
                </div>
              </div>
              <div className="md:col-span-3">
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="col-span-1">
                <div className="overflow-x-auto border rounded-md">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">In/Out</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Cultivation</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Length</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Width</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Height</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Diameter</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Sunlight</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Soil</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Water Access</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {gardenSpaces.length > 0 ? (
                        gardenSpaces.map((space) => (
                          <tr key={space.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm">{space.inOut}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              <div className="flex items-center">
                                {space.type === 'raised-bed' && (
                                  <div className="bg-[#EDFAEF] h-6 w-10 rounded-sm mr-2 flex items-center justify-center">
                                    <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <rect x="1" y="5" width="20" height="10" rx="1" fill="#B7E4C7" stroke="#2D6A4F" strokeWidth="1.5"/>
                                      <line x1="1" y1="8.25" x2="21" y2="8.25" stroke="#2D6A4F" strokeWidth="1.5"/>
                                      <line x1="4" y1="1" x2="4" y2="5" stroke="#2D6A4F" strokeWidth="1.5"/>
                                      <line x1="18" y1="1" x2="18" y2="5" stroke="#2D6A4F" strokeWidth="1.5"/>
                                      <line x1="11" y1="1" x2="11" y2="5" stroke="#2D6A4F" strokeWidth="1.5"/>
                                    </svg>
                                  </div>
                                )}
                                {space.type === 'ground' && (
                                  <div className="bg-[#FFF3E0] h-6 w-6 rounded-sm mr-2 flex items-center justify-center">
                                    <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M1 15C1 12 5 1 10 1C15 1 19 12 19 15" stroke="#774D2B" strokeWidth="1.5" strokeLinecap="round"/>
                                      <path d="M1 15H19" stroke="#774D2B" strokeWidth="1.5" strokeLinecap="round"/>
                                      <path d="M5 10C6.5 8.5 8.5 8 10 8C11.5 8 13.5 8.5 15 10" stroke="#774D2B" strokeWidth="1.5" strokeLinecap="round"/>
                                    </svg>
                                  </div>
                                )}
                                {space.type === 'square-pot' && (
                                  <div className="bg-[#E6F7FF] h-6 w-6 rounded-sm mr-2 flex items-center justify-center">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <rect x="1" y="5" width="14" height="10" rx="1" fill="#BAE7FF" stroke="#0D6EFD" strokeWidth="1.5"/>
                                      <path d="M3 5V3C3 1.89543 3.89543 1 5 1H11C12.1046 1 13 1.89543 13 3V5" stroke="#0D6EFD" strokeWidth="1.5"/>
                                      <line x1="3" y1="8.25" x2="13" y2="8.25" stroke="#0D6EFD" strokeWidth="1.5"/>
                                    </svg>
                                  </div>
                                )}
                                {space.type === 'round-pot' && (
                                  <div className="bg-[#F9E9FB] h-6 w-6 rounded-sm mr-2 flex items-center justify-center">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <ellipse cx="8" cy="10.5" rx="7" ry="4.5" fill="#E9C7F9" stroke="#9C27B0" strokeWidth="1.5"/>
                                      <path d="M3 10.5V7C3 4.79086 5.23858 3 8 3C10.7614 3 13 4.79086 13 7V10.5" stroke="#9C27B0" strokeWidth="1.5"/>
                                      <line x1="5" y1="7.25" x2="11" y2="7.25" stroke="#9C27B0" strokeWidth="1.5"/>
                                    </svg>
                                  </div>
                                )}
                                <span>{space.type}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">{space.length}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">{space.width}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">{space.height}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">{space.diameter}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                space.sunlight === 'full-sun' ? 'bg-yellow-100 text-yellow-800' :
                                space.sunlight === 'partial-sun' ? 'bg-yellow-50 text-yellow-600' :
                                space.sunlight === 'partial-shade' ? 'bg-gray-100 text-gray-800' :
                                'bg-gray-200 text-gray-800'
                              }`}>
                                {space.sunlight}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                space.soil === 'clay' ? 'bg-orange-100 text-orange-800' :
                                space.soil === 'loam' ? 'bg-amber-100 text-amber-800' :
                                space.soil === 'sandy' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {space.soil}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                space.waterAccess === 'easy' ? 'bg-blue-100 text-blue-800' :
                                space.waterAccess === 'limited' ? 'bg-blue-50 text-blue-600' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {space.waterAccess}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              <div className="flex space-x-2">
                                <button 
                                  className="p-1 rounded-full text-gray-500 hover:text-primary hover:bg-green-50"
                                  onClick={() => openEditPlantingPlaceModal(space)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </button>
                                <button 
                                  className="p-1 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50"
                                  onClick={() => handleDeletePlantingPlace(space.id)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={10} className="px-4 py-8 text-center text-sm text-gray-500">
                            Please add your planting places.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* <div className="border-t border-gray-200 my-6"></div> */}
          <div className="flex items-center mb-5 justify-center mt-8">
            {/* <div className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold mr-3">4</div> */}
            <h2 className="text-2xl font-bold text-center">Confirm Your Personalized Garden Plan And Create!</h2>
          </div>
          
          <div className="text-center max-w-2xl mx-auto">            
            {/* <div className="md:col-span-1">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-amber-500 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <span className="font-semibold text-sm">Important</span>
              </div>
            </div> */}
            <p className="text-sm mb-6 text-gray-700">To ensure you're completely satisfied with the end result, we strongly advise carefully reviewing all your inputs before finalizing the plan.</p>
          </div>

          {/* Points requirement notice */}
          <div className={`text-center max-w-2xl mx-auto mb-6 p-4 rounded-md ${hasEnoughPoints ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
            <div className="flex items-center justify-center mb-2">
              {hasEnoughPoints ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span className="font-medium">Points Required: {REQUIRED_POINTS}</span>
            </div>
            <p className="text-sm">
              {hasEnoughPoints 
                ? `You have ${userPoints} points, which is sufficient to create a garden plan.` 
                : `You have ${userPoints} points. You need at least ${REQUIRED_POINTS} points to create a garden plan.`}
            </p>
          </div>

          <div className="mt-8 flex justify-between">
            <div>
              <button
                onClick={goToPrevStep}
                className="w-[130px] border border-gray-300 hover:border-gray-400 bg-white text-gray-700 px-6 py-2 rounded-md font-medium transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
            </div>
            <div>
              <button 
                onClick={createGardenPlan}
                disabled={isSubmitting || !hasEnoughPoints}
                className={`bg-primary hover:bg-green-700 text-white py-3.5 px-8 rounded-md font-medium transition-colors flex items-center justify-center ml-4 ${(isSubmitting || !hasEnoughPoints) ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Create My Personalized Garden Plan Now!
                  </>
                )}
              </button>
            </div>
            <div className="w-[130px] px-6 py-2 rounded-md font-medium transition-colors flex items-center">
              {/* <button
                onClick={goToPrevStep}
                className="border border-gray-300 hover:border-gray-400 bg-white text-gray-700 px-6 py-2 rounded-md font-medium transition-colors flex items-center hidden"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Next
              </button> */}
            </div>
          </div>
        </div>

        {/* 添加种植位置弹窗 */}
        <PlantingPlaceModal
          isOpen={isPlantingPlaceModalOpen}
          onClose={() => setIsPlantingPlaceModalOpen(false)}
          onSave={handleSavePlantingPlace}
          editData={editingPlantingPlace}
          modalTitle={plantingPlaceModalTitle}
        />
      </div>
    );
  };

  const handleGoalChange = (goal: string) => {
    if (goals.includes(goal)) {
      setGoals(goals.filter(g => g !== goal));
    } else {
      setGoals([...goals, goal]);
    }
  };

  const handlePlantTypeChange = (type: string) => {
    if (plantTypes.includes(type)) {
      setPlantTypes(plantTypes.filter(t => t !== type));
    } else {
      setPlantTypes([...plantTypes, type]);
    }
  };

  const handleAllergyChange = (allergy: string) => {
    if (allergies.includes(allergy)) {
      setAllergies(allergies.filter(a => a !== allergy));
    } else {
      setAllergies([...allergies, allergy]);
    }
  };

  const createGardenPlan = async () => {
    if (isSubmitting) return; // 防止重复提交
    
    // 检查是否有项目
    if (!currentProject?.id) {
      addNotification({ type: 'error', message: 'No active project found. Please select a project first.' });
      return;
    }
    
    // 检查是否有至少一个种植空间
    if (gardenSpaces.length === 0) {
      addNotification({ type: 'error', message: 'Please add at least one planting place' });
      return;
    }
    
    // 检查用户是否有足够的点数
    if (!hasEnoughPoints) {
      addNotification({ 
        type: 'error', 
        message: `Insufficient points. You need at least ${REQUIRED_POINTS} points to create a garden plan.` 
      });
      return;
    }
    
    // 将字典值转换为ID
    const getIdFromDictValue = (dict: any, value: string): number | null => {
      const entry = Object.values(dict).find(item => (item as any).value === value);
      return entry ? (entry as any).id : null;
    };
    
    // 转换值为ID
    const experienceId = getIdFromDictValue(EXPERIENCE_DICT, experience);
    const budgetId = getIdFromDictValue(BUDGET_DICT, budget);
    const timeId = getIdFromDictValue(TIME_DICT, time);
    const maintenanceId = getIdFromDictValue(MAINTENANCE_DICT, maintenance);
    const fertilizerId = getIdFromDictValue(FERTILIZER_DICT, fertilizerType);
    
    // 准备提交的数据
    const submitData = {
      projectId: currentProject.id,
      gardenLocation,
      hardinessZone,
      experienceId,
      budgetId,
      timeId,
      maintenanceId,
      goals,
      plantTypes,
      fertilizerId,
      allergies,
      gardenSpaces
    };
    
    // 设置提交状态
    setIsSubmitting(true);
    
    try {
      // 使用服务方法调用API
      await createGardenAdvisor(submitData);
      
      // 处理成功响应
      addNotification({ type: 'success', message: 'Garden plan created successfully!' });
      
      // 重定向到花园顾问列表页
      router.push(`/dashboard/garden-advisor?project_id=${currentProject.id}`);
    } catch (error: any) {
      console.error('Failed to create garden plan:', error);
      
      // 检查是否是点数不足的错误
      if (error.response && error.response.data && error.response.data.msg === 'Insufficient points') {
        addNotification({ 
          type: 'error', 
          message: `Insufficient points. You need at least ${REQUIRED_POINTS} points to create a garden plan.` 
        });
      } else {
        addNotification({ type: 'error', message: 'Failed to create garden plan. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <WithProjectCheck>
      <div className="p-6">
        {/* Page header with Progress bar in same row */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/dashboard/garden-advisor" className="mr-4 text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </Link>
            <h1 className="text-2xl font-semibold">Create Garden Plan</h1>
          </div>
          
          {/* Progress bar */}
          <div className="flex flex-col w-1/3">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
              <span className="text-sm text-gray-500">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-primary h-2.5 rounded-full" style={{ width: `${(currentStep / totalSteps) * 100}%` }}></div>
            </div>
          </div>
        </div>
        
        {/* Steps content */}
        {showContentByStep(currentStep)}
      </div>
    </WithProjectCheck>
  );
} 