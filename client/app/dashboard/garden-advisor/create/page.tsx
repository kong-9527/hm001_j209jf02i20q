'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import WithProjectCheck from '@/app/components/WithProjectCheck';

export default function CreateGardenAdvisorPage() {
  // 添加步骤状态
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // General Information state - 将所有默认值设为空
  const [gardenLocation, setGardenLocation] = useState('');
  const [hardinessZone, setHardinessZone] = useState('');
  const [experience, setExperience] = useState('');
  const [budget, setBudget] = useState('');
  const [time, setTime] = useState('');
  const [maintenance, setMaintenance] = useState('');
  const [goals, setGoals] = useState<string[]>([]);

  // Custom Planting Plan state - 将所有默认值设为空
  const [plantTypes, setPlantTypes] = useState<string[]>([]);
  const [fertilizerType, setFertilizerType] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);

  // Garden Space state
  const [gardenSpaces, setGardenSpaces] = useState([
    { 
      id: 1, 
      inOut: 'indoor', 
      type: 'raised-bed', 
      length: '50cm', 
      width: '50cm', 
      height: '50cm', 
      diameter: '', 
      sunlight: 'full-sun', 
      soil: 'clay', 
      waterAccess: 'easy'
    },
    { 
      id: 2, 
      inOut: 'outdoor', 
      type: 'ground', 
      length: '50cm', 
      width: '50cm', 
      height: '', 
      diameter: '', 
      sunlight: 'partial-sun', 
      soil: 'loam', 
      waterAccess: 'limited'
    },
    { 
      id: 3, 
      inOut: 'indoor', 
      type: 'square-pot', 
      length: '50cm', 
      width: '50cm', 
      height: '50cm', 
      diameter: '', 
      sunlight: 'partial-shade', 
      soil: 'sandy', 
      waterAccess: 'rainfall'
    },
    {
      id: 4,
      inOut: 'indoor',
      type: 'round-pot',
      length: '',
      width: '',
      height: '50cm',
      diameter: '50cm',
      sunlight: 'full-shade',
      soil: 'silty',
      waterAccess: 'rainfall'
    }
  ]);

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
                  <label className={`flex items-center bg-white border rounded-md px-4 py-2 cursor-pointer transition-colors hover:bg-green-50 ${experience === 'Beginner' ? 'border-primary bg-green-50' : 'border-gray-300 hover:bg-green-50'}`}>
                    <input
                      type="radio"
                      name="experience"
                      checked={experience === 'Beginner'}
                      onChange={() => setExperience('Beginner')}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded-full mr-2 border ${experience === 'Beginner' ? 'border-primary bg-primary' : 'border-gray-300'}`}>  </div>
                    <span className={experience === 'Beginner' ? 'text-primary font-medium' : ''}>Novice</span>
                  </label>
                  <label className={`flex items-center bg-white border rounded-md px-4 py-2 cursor-pointer transition-colors hover:bg-green-50 ${experience === 'Intermediate' ? 'border-primary bg-green-50' : 'border-gray-300 hover:bg-green-50'}`}>
                    <input
                      type="radio"
                      name="experience"
                      checked={experience === 'Intermediate'}
                      onChange={() => setExperience('Intermediate')}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded-full mr-2 border ${experience === 'Intermediate' ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                    </div>
                    <span className={experience === 'Intermediate' ? 'text-primary font-medium' : ''}>Proficient</span>
                  </label>
                  <label className={`flex items-center bg-white border rounded-md px-4 py-2 cursor-pointer transition-colors hover:bg-green-50 ${experience === 'Advanced' ? 'border-primary bg-green-50' : 'border-gray-300 hover:bg-green-50'}`}>
                    <input
                      type="radio"
                      name="experience"
                      checked={experience === 'Advanced'}
                      onChange={() => setExperience('Advanced')}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded-full mr-2 border ${experience === 'Advanced' ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                    </div>
                    <span className={experience === 'Advanced' ? 'text-primary font-medium' : ''}>Expert</span>
                  </label>
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
                  <label className={`flex items-center bg-white border rounded-md px-4 py-2 cursor-pointer transition-colors hover:bg-green-50 ${budget === 'Low' ? 'border-primary bg-green-50' : 'border-gray-300 hover:bg-green-50'}`}>
                    <input
                      type="radio"
                      name="budget"
                      checked={budget === 'Low'}
                      onChange={() => setBudget('Low')}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded-full mr-2 border ${budget === 'Low' ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                    </div>
                    <span className={budget === 'Low' ? 'text-primary font-medium' : ''}>Low</span>
                  </label>
                  <label className={`flex items-center bg-white border rounded-md px-4 py-2 cursor-pointer transition-colors hover:bg-green-50 ${budget === 'Medium' ? 'border-primary bg-green-50' : 'border-gray-300 hover:bg-green-50'}`}>
                    <input
                      type="radio"
                      name="budget"
                      checked={budget === 'Medium'}
                      onChange={() => setBudget('Medium')}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded-full mr-2 border ${budget === 'Medium' ? 'border-primary bg-primary' : 'border-gray-300'}`}></div>
                    <span className={budget === 'Medium' ? 'text-primary font-medium' : ''}>Medium</span>
                  </label>
                  <label className={`flex items-center bg-white border rounded-md px-4 py-2 cursor-pointer transition-colors hover:bg-green-50 ${budget === 'High' ? 'border-primary bg-green-50' : 'border-gray-300 hover:bg-green-50'}`}>
                    <input
                      type="radio"
                      name="budget"
                      checked={budget === 'High'}
                      onChange={() => setBudget('High')}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded-full mr-2 border ${budget === 'High' ? 'border-primary bg-primary' : 'border-gray-300'}`}></div>
                    <span className={budget === 'High' ? 'text-primary font-medium' : ''}>High</span>
                  </label>
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
                  <label className={`flex items-center bg-white border rounded-md px-4 py-2 cursor-pointer  hover:bg-green-50 ${time === 'Low' ? 'border-primary bg-green-50' : 'border-gray-300 hover:bg-green-50'}`}>
                    <input
                      type="radio"
                      name="time"
                      checked={time === 'Low'}
                      onChange={() => setTime('Low')}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded-full mr-2 border ${time === 'Low' ? 'border-primary bg-primary' : 'border-gray-300'}`}></div>
                    <span className={time === 'Low' ? 'text-primary font-medium' : ''}>Low</span>
                  </label>
                  <label className={`flex items-center bg-white border rounded-md px-4 py-2 cursor-pointer transition-colors hover:bg-green-50 ${time === 'Medium' ? 'border-primary bg-green-50' : 'border-gray-300 hover:bg-green-50'}`}>
                    <input
                      type="radio"
                      name="time"
                      checked={time === 'Medium'}
                      onChange={() => setTime('Medium')}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded-full mr-2 border ${time === 'Medium' ? 'border-primary bg-primary' : 'border-gray-300'}`}></div>
                    <span className={time === 'Medium' ? 'text-primary font-medium' : ''}>Medium</span>
                  </label>
                  <label className={`flex items-center bg-white border rounded-md px-4 py-2 cursor-pointer transition-colors hover:bg-green-50 ${time === 'High' ? 'border-primary bg-green-50' : 'border-gray-300 hover:bg-green-50'}`}>
                    <input
                      type="radio"
                      name="time"
                      checked={time === 'High'}
                      onChange={() => setTime('High')}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded-full mr-2 border ${time === 'High' ? 'border-primary bg-primary' : 'border-gray-300'}`}></div>
                    <span className={time === 'High' ? 'text-primary font-medium' : ''}>High</span>
                  </label>
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
                  <label className={`flex items-center bg-white border rounded-md px-4 py-2 cursor-pointer transition-colors hover:bg-green-50 ${maintenance === 'Low' ? 'border-primary bg-green-50' : 'border-gray-300 hover:bg-green-50'}`}>
                    <input
                      type="radio"
                      name="maintenance"
                      checked={maintenance === 'Low'}
                      onChange={() => setMaintenance('Low')}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded-full mr-2 border ${maintenance === 'Low' ? 'border-primary bg-primary' : 'border-gray-300'}`}></div>
                    <span className={maintenance === 'Low' ? 'text-primary font-medium' : ''}>Low</span>
                  </label>
                  <label className={`flex items-center bg-white border rounded-md px-4 py-2 cursor-pointer transition-colors hover:bg-green-50 ${maintenance === 'Medium' ? 'border-primary bg-green-50' : 'border-gray-300 hover:bg-green-50'}`}>
                    <input
                      type="radio"
                      name="maintenance"
                      checked={maintenance === 'Medium'}
                      onChange={() => setMaintenance('Medium')}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded-full mr-2 border ${maintenance === 'Medium' ? 'border-primary bg-primary' : 'border-gray-300'}`}></div>
                    <span className={maintenance === 'Medium' ? 'text-primary font-medium' : ''}>Medium</span>
                  </label>
                  <label className={`flex items-center bg-white border rounded-md px-4 py-2 cursor-pointer transition-colors hover:bg-green-50 ${maintenance === 'High' ? 'border-primary bg-green-50' : 'border-gray-300 hover:bg-green-50'}`}>
                    <input
                      type="radio"
                      name="maintenance"
                      checked={maintenance === 'High'}
                      onChange={() => setMaintenance('High')}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded-full mr-2 border ${maintenance === 'High' ? 'border-primary bg-primary' : 'border-gray-300'}`}></div>
                    <span className={maintenance === 'High' ? 'text-primary font-medium' : ''}>High</span>
                  </label>
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
                  <label className="flex items-start p-3 border rounded-md cursor-pointer hover:bg-green-50 transition-colors">
                    <input
                      type="radio"
                      name="fertilizer"
                      checked={fertilizerType === 'Organic'}
                      onChange={() => setFertilizerType('Organic')}
                      className="hidden"
                    />
                    <div className="flex h-5 items-center mr-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${fertilizerType === 'Organic' ? 'border-primary' : 'border-gray-300'}`}>
                        {fertilizerType === 'Organic' && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                      </div>
                    </div>
                    <div>
                      <span className={`font-medium ${fertilizerType === 'Organic' ? 'text-primary' : ''}`}>Organic</span>
                      <p className="text-xs text-gray-500 mt-1">Organic gardening emphasizes the utilization of natural techniques and substances for plant cultivation. It strictly avoids the application of synthetic chemicals and pesticides, instead relying on nature - friendly approaches to ensure healthy plant growth.</p>
                    </div>
                  </label>
                  <label className="flex items-start p-3 border rounded-md cursor-pointer hover:bg-green-50 transition-colors">
                    <input
                      type="radio"
                      name="fertilizer"
                      checked={fertilizerType === 'Conventional'}
                      onChange={() => setFertilizerType('Conventional')}
                      className="hidden"
                    />
                    <div className="flex h-5 items-center mr-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${fertilizerType === 'Conventional' ? 'border-primary' : 'border-gray-300'}`}>
                        {fertilizerType === 'Conventional' && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                      </div>
                    </div>
                    <div>
                      <span className={`font-medium ${fertilizerType === 'Conventional' ? 'text-primary' : ''}`}>Conventional</span>
                      <p className="text-xs text-gray-500 mt-1">In contrast, conventional gardening typically makes use of synthetic fertilizers and pesticides. The main goal of this method is to boost plant growth to the maximum extent and effectively control pests, often through the use of artificial chemical substances.</p>
                    </div>
                  </label>
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
              className="w-[130px] bg-primary hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition-colors flex items-center"
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
                  <div className="border rounded-md p-3 flex items-center hover:bg-green-50 hover:border-primary cursor-pointer transition-colors">
                    <div className="w-6 h-6 rounded-full bg-green-100 text-primary flex items-center justify-center mr-3">+</div>
                    <span>Small Indoor Square Pot</span>
                  </div>
                  <div className="border rounded-md p-3 flex items-center hover:bg-green-50 hover:border-primary cursor-pointer transition-colors">
                    <div className="w-6 h-6 rounded-full bg-green-100 text-primary flex items-center justify-center mr-3">+</div>
                    <span>Big Indoor Round Pot</span>
                  </div>
                  <div className="border rounded-md p-3 flex items-center hover:bg-green-50 hover:border-primary cursor-pointer transition-colors">
                    <div className="w-6 h-6 rounded-full bg-green-100 text-primary flex items-center justify-center mr-3">+</div>
                    <span>Raised Bed Outside</span>
                  </div>
                  <div className="border rounded-md p-3 flex items-center hover:bg-green-50 hover:border-primary cursor-pointer transition-colors">
                    <div className="w-6 h-6 rounded-full bg-green-100 text-primary flex items-center justify-center mr-3">+</div>
                    <span>Piece of Land Outside</span>
                  </div>
                  <div className="border border-dashed rounded-md p-3 flex items-center hover:bg-green-50 hover:border-primary cursor-pointer transition-colors">
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
                  <span className="text-xs text-gray-500 ml-2">(4 spaces)</span>
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
                      {gardenSpaces.map((space) => (
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
                              <button className="p-1 rounded-full text-gray-500 hover:text-primary hover:bg-green-50">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              <button className="p-1 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
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
                className="bg-primary hover:bg-green-700 text-white py-3.5 px-8 rounded-md font-medium transition-colors flex items-center justify-center ml-4"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Create My Personalized Garden Plan Now!
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

  const createGardenPlan = () => {
    // Implement the creation logic here
    console.log('Creating garden plan with the following data:');
    console.log({
      gardenLocation,
      hardinessZone,
      experience,
      budget,
      time,
      maintenance,
      goals,
      plantTypes,
      fertilizerType,
      allergies,
      gardenSpaces
    });
    // Navigate or show success message
  };

  return (
    <WithProjectCheck>
      <div className="p-6">
        {/* Page header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/dashboard/garden-advisor" className="mr-4 text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </Link>
            <h1 className="text-2xl font-semibold">Create Garden Plan</h1>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-gray-500">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${(currentStep / totalSteps) * 100}%` }}></div>
          </div>
        </div>
        
        {/* Steps content */}
        {showContentByStep(currentStep)}
        
        {/* Navigation buttons */}
        <div className="mt-10 flex justify-between">
          <button 
            onClick={goToPrevStep}
            className={`px-6 py-2 rounded-md border border-gray-300 
              ${currentStep === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            disabled={currentStep === 1}
          >
            Previous
          </button>
          
          {currentStep < totalSteps ? (
            <button 
              onClick={goToNextStep}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              Next
            </button>
          ) : (
            <button 
              onClick={createGardenPlan}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              Create Plan
            </button>
          )}
        </div>
      </div>
    </WithProjectCheck>
  );
} 