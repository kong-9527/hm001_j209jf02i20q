'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function CreateGardenAdvisorPage() {
  // 添加步骤状态
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // General Information state
  const [gardenLocation, setGardenLocation] = useState('');
  const [hardinessZone, setHardinessZone] = useState('');
  const [experience, setExperience] = useState('Beginner');
  const [budget, setBudget] = useState('Low');
  const [time, setTime] = useState('Low');
  const [maintenance, setMaintenance] = useState('Low');
  const [goals, setGoals] = useState<string[]>(['Food']);

  // Custom Planting Plan state
  const [plantTypes, setPlantTypes] = useState<string[]>(['Flowers']);
  const [fertilizerType, setFertilizerType] = useState('Organic');
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
              <label className="block text-sm font-semibold mb-1">Where is your garden</label>
              <select 
                className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                value={gardenLocation}
                onChange={(e) => setGardenLocation(e.target.value)}
              >
                <option value="">Select a country or a region</option>
                <option value="us">United States</option>
                <option value="ca">Canada</option>
                <option value="uk">United Kingdom</option>
                <option value="au">Australia</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-1">Hardiness Zone</label>
              <select 
                className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                value={hardinessZone}
                onChange={(e) => setHardinessZone(e.target.value)}
              >
                <option value="">Select a hardiness zone</option>
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
                <p className="text-xs text-gray-500 mb-3">Select your level of gardening experience:</p>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center bg-white border rounded-md px-4 py-2 cursor-pointer hover:border-primary hover:bg-green-50 transition-colors">
                    <input
                      type="radio"
                      name="experience"
                      checked={experience === 'Beginner'}
                      onChange={() => setExperience('Beginner')}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded-full mr-2 border ${experience === 'Beginner' ? 'border-primary bg-primary' : 'border-gray-300'}`}></div>
                    <span className={experience === 'Beginner' ? 'text-primary font-medium' : ''}>Beginner</span>
                  </label>
                  <label className="flex items-center bg-white border rounded-md px-4 py-2 cursor-pointer hover:border-primary hover:bg-green-50 transition-colors">
                    <input
                      type="radio"
                      name="experience"
                      checked={experience === 'Intermediate'}
                      onChange={() => setExperience('Intermediate')}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded-full mr-2 border ${experience === 'Intermediate' ? 'border-primary bg-primary' : 'border-gray-300'}`}></div>
                    <span className={experience === 'Intermediate' ? 'text-primary font-medium' : ''}>Intermediate</span>
                  </label>
                  <label className="flex items-center bg-white border rounded-md px-4 py-2 cursor-pointer hover:border-primary hover:bg-green-50 transition-colors">
                    <input
                      type="radio"
                      name="experience"
                      checked={experience === 'Advanced'}
                      onChange={() => setExperience('Advanced')}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded-full mr-2 border ${experience === 'Advanced' ? 'border-primary bg-primary' : 'border-gray-300'}`}></div>
                    <span className={experience === 'Advanced' ? 'text-primary font-medium' : ''}>Advanced</span>
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
                <p className="text-xs text-gray-500 mb-3">Select your gardening budget range:</p>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center bg-white border rounded-md px-4 py-2 cursor-pointer hover:border-primary hover:bg-green-50 transition-colors">
                    <input
                      type="radio"
                      name="budget"
                      checked={budget === 'Low'}
                      onChange={() => setBudget('Low')}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded-full mr-2 border ${budget === 'Low' ? 'border-primary bg-primary' : 'border-gray-300'}`}></div>
                    <span className={budget === 'Low' ? 'text-primary font-medium' : ''}>Low</span>
                  </label>
                  <label className="flex items-center bg-white border rounded-md px-4 py-2 cursor-pointer hover:border-primary hover:bg-green-50 transition-colors">
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
                  <label className="flex items-center bg-white border rounded-md px-4 py-2 cursor-pointer hover:border-primary hover:bg-green-50 transition-colors">
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
                <p className="text-xs text-gray-500 mb-3">Select the amount of time you can dedicate to gardening:</p>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center bg-white border rounded-md px-4 py-2 cursor-pointer hover:border-primary hover:bg-green-50 transition-colors">
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
                  <label className="flex items-center bg-white border rounded-md px-4 py-2 cursor-pointer hover:border-primary hover:bg-green-50 transition-colors">
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
                  <label className="flex items-center bg-white border rounded-md px-4 py-2 cursor-pointer hover:border-primary hover:bg-green-50 transition-colors">
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
                <p className="text-xs text-gray-500 mb-3">Select your preferred level of maintenance for your garden:</p>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center bg-white border rounded-md px-4 py-2 cursor-pointer hover:border-primary hover:bg-green-50 transition-colors">
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
                  <label className="flex items-center bg-white border rounded-md px-4 py-2 cursor-pointer hover:border-primary hover:bg-green-50 transition-colors">
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
                  <label className="flex items-center bg-white border rounded-md px-4 py-2 cursor-pointer hover:border-primary hover:bg-green-50 transition-colors">
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
                <p className="text-xs text-gray-500 mb-3">Select the goals you wish to achieve through gardening:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Food', 'Wildlife', 'Beauty', 'Education', 'Medicinal', 'Hobby', 'Fragrance', 'Money'].map((goal) => (
                    <label key={goal} className={`flex items-center border rounded-md px-3 py-2 cursor-pointer hover:bg-green-50 transition-colors ${goals.includes(goal) ? 'border-primary bg-green-50' : 'border-gray-200'}`}>
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
                <label className="block text-sm font-semibold mb-1">Preferred Plant Types</label>
              </div>
              <div className="md:col-span-3">
                <p className="text-xs text-gray-500 mb-3">Select the types of plants you prefer to grow:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
                  {['Flowers', 'Vegetables', 'Trees', 'Grasses', 'Cacti', 'Mosses', 'Aquatics', 'Orchids', 'Herbs', 'Fruits', 'Shrubs', 'Succulents', 'Ferns', 'Vines', 'Bulbs'].map((type) => (
                    <div 
                      key={type} 
                      className={`border rounded-md p-2 cursor-pointer text-center transition-all ${
                        plantTypes.includes(type) 
                          ? 'border-primary bg-green-50 shadow-sm' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`} 
                      onClick={() => handlePlantTypeChange(type)}
                    >
                      <div className="flex items-center justify-center h-full">
                        {plantTypes.includes(type) && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-primary mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        <span className={plantTypes.includes(type) ? 'text-primary font-medium' : ''}>{type}</span>
                      </div>
                    </div>
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
                <p className="text-xs text-gray-500 mb-3">Select your preferred gardening style:</p>
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
                      <p className="text-xs text-gray-500 mt-1">Organic gardening focuses on using natural methods and materials to grow plants, without the use of synthetic chemicals or pesticides</p>
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
                      <p className="text-xs text-gray-500 mt-1">Conventional gardening involves using synthetic fertilizers and pesticides to maximize plant growth and manage pests</p>
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
                <p className="text-xs text-gray-500 mb-3">Select any allergies or health concerns you have related to gardening:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {['Pollen', 'Mold', 'Trees', 'Weeds', 'Bees', 'Dust', 'Shrubs', 'Insects', 'Grass', 'Flowers'].map((allergy) => (
                    <label key={allergy} className={`flex items-center border rounded-md p-2 cursor-pointer hover:bg-gray-50 transition-colors ${allergies.includes(allergy) ? 'border-primary bg-green-50' : 'border-gray-200'}`}>
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
              className="border border-gray-300 hover:border-gray-400 bg-white text-gray-700 px-6 py-2 rounded-md font-medium transition-colors flex items-center"
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
            <h2 className="text-xl font-semibold">Custom Your Planting Space</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            <div className="md:col-span-1">
              <label className="block text-sm font-semibold">Description</label>
            </div>
            <div className="md:col-span-3">
              <p className="text-sm text-gray-700 mb-4">A garden space is an individual area within your garden or home where you grow your plants (like a pot, or a piece of land). You can add up to 25 garden spaces. Each garden space will have up to 10 recommendations. You will only be able to fit this in once, so make sure to add all your garden spaces now, so that we can provide you with the best recommendations. Be sure to include all your indoor and outdoor garden spaces.</p>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold">Frequently Used Planting Space</label>
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
                    <span>Custom your planting space freely</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
              <div className="md:col-span-1">
                <div className="flex items-center">
                  <label className="block text-sm font-semibold">Your Garden Space List</label>
                  <span className="text-xs text-gray-500 ml-2">(4 spaces)</span>
                </div>
              </div>
              <div className="md:col-span-3">
                <div className="overflow-x-auto border rounded-md">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In/Out</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cultivation</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Length</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Width</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Height</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diameter</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sunlight</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Soil</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Water Access</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {gardenSpaces.map((space) => (
                        <tr key={space.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{space.inOut}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <div className="flex items-center">
                              {space.type === 'raised-bed' && (
                                <div className="bg-gray-200 h-6 w-6 rounded-sm mr-2"></div>
                              )}
                              {space.type === 'ground' && (
                                <div className="bg-gray-200 h-6 w-6 rounded-sm mr-2"></div>
                              )}
                              {space.type === 'square-pot' && (
                                <div className="bg-gray-200 h-6 w-6 rounded-sm mr-2"></div>
                              )}
                              {space.type === 'round-pot' && (
                                <div className="bg-gray-200 h-6 w-6 rounded-sm mr-2"></div>
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
        </div>
        
        {/* Section 4: Confirm Your Personalized Garden Plan */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-5">
            <div className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold mr-3">4</div>
            <h2 className="text-xl font-semibold">Confirm Your Personalized Garden Plan And Create!</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            <div className="md:col-span-1">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-amber-500 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <span className="font-semibold text-sm">Important</span>
              </div>
            </div>
            <div className="md:col-span-3">
              <p className="text-sm mb-6 text-gray-700">Our garden plans are generated once, based on the inputs you provide, and cannot be edited afterwards. This is due to the intensive data processing required to create your personalized plan. We recommend thoroughly checking all your inputs before finalizing the plan.</p>
              
              <div className="flex justify-between">
                <button
                  onClick={goToPrevStep}
                  className="border border-gray-300 hover:border-gray-400 bg-white text-gray-700 px-6 py-2 rounded-md font-medium transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                
                <button 
                  onClick={createGardenPlan}
                  className="bg-primary hover:bg-green-700 text-white py-3.5 px-8 rounded-md font-medium transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Create My Personalized Garden Plan Now!
                </button>
              </div>
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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-2xl font-bold">Create Garden Advisor</h1>
        
        {/* 添加3步导航 */}
        <div className="mt-4 md:mt-0">
          <div className="flex items-center">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div 
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    currentStep === step 
                      ? 'bg-primary text-white' 
                      : currentStep > step 
                        ? 'bg-green-100 text-primary border border-primary' 
                        : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {currentStep > step ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span>{step}</span>
                  )}
                </div>
                
                {step < 3 && (
                  <div className={`w-10 h-1 mx-1 ${
                    currentStep > step ? 'bg-primary' : 'bg-gray-200'
                  }`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>General Info</span>
            <span className="ml-1">Planting Plan</span>
            <span>Spaces & Create</span>
          </div>
        </div>
      </div>
      
      <div className="bg-green-100 rounded-lg p-5 mb-8">
        <div className="flex items-start">
          <div className="mr-3 text-green-600 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-1 text-green-800">What You'll Get</h3>
            <ul className="text-sm space-y-1 text-green-800">
              <li>Personalized plant recommendations for your unique spaces</li>
              <li>Expert care instructions for each plant</li>
              <li>Optimize your garden layout for maximum yield</li>
              <li>Save time and money with our AI-powered insights</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 根据当前步骤显示内容 */}
      {showContentByStep(currentStep)}
    </div>
  );
} 