'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function CreateGardenAdvisorPage() {
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
      <h1 className="text-2xl font-bold mb-8">Create Garden Advisor</h1>
      
      <div className="bg-green-50 rounded-lg p-5 mb-8">
        <div className="flex items-start">
          <div className="mr-3 text-green-600 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">What You'll Get</h3>
            <ul className="text-sm space-y-1">
              <li>Personalized plant recommendations for your unique spaces</li>
              <li>Expert care instructions for each plant</li>
              <li>Optimize your garden layout for maximum yield</li>
              <li>Save time and money with our AI-powered insights</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-10">
        {/* Section 1: General Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-5">
            <div className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold mr-3">1</div>
            <h2 className="text-xl font-semibold">General Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Where is your garden</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md"
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
              <label className="block text-sm font-medium mb-1">Hardiness Zone</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md"
                value={hardinessZone}
                onChange={(e) => setHardinessZone(e.target.value)}
              >
                <option value="">Select a country or a region</option>
                <option value="1">Zone 1</option>
                <option value="2">Zone 2</option>
                <option value="3">Zone 3</option>
                <option value="4">Zone 4</option>
                <option value="5">Zone 5</option>
              </select>
              <Link href="#" className="text-blue-500 text-xs hover:underline">
                Learn more about hardiness zones
              </Link>
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Your Gardening Experience</label>
            <p className="text-xs text-gray-500 mb-2">Select your level of gardening experience:</p>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="experience"
                  checked={experience === 'Beginner'}
                  onChange={() => setExperience('Beginner')}
                  className="mr-2"
                />
                <span>Beginner</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="experience"
                  checked={experience === 'Intermediate'}
                  onChange={() => setExperience('Intermediate')}
                  className="mr-2"
                />
                <span>Intermediate</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="experience"
                  checked={experience === 'Advanced'}
                  onChange={() => setExperience('Advanced')}
                  className="mr-2"
                />
                <span>Advanced</span>
              </label>
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Your Gardening Budget</label>
            <p className="text-xs text-gray-500 mb-2">Select your gardening budget range:</p>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="budget"
                  checked={budget === 'Low'}
                  onChange={() => setBudget('Low')}
                  className="mr-2"
                />
                <span>Low</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="budget"
                  checked={budget === 'Medium'}
                  onChange={() => setBudget('Medium')}
                  className="mr-2"
                />
                <span>Medium</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="budget"
                  checked={budget === 'High'}
                  onChange={() => setBudget('High')}
                  className="mr-2"
                />
                <span>High</span>
              </label>
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Your Gardening Time</label>
            <p className="text-xs text-gray-500 mb-2">Select the amount of time you can dedicate to gardening:</p>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="time"
                  checked={time === 'Low'}
                  onChange={() => setTime('Low')}
                  className="mr-2"
                />
                <span>Low</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="time"
                  checked={time === 'Medium'}
                  onChange={() => setTime('Medium')}
                  className="mr-2"
                />
                <span>Medium</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="time"
                  checked={time === 'High'}
                  onChange={() => setTime('High')}
                  className="mr-2"
                />
                <span>High</span>
              </label>
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Your Maintenance Preference</label>
            <p className="text-xs text-gray-500 mb-2">Select your preferred level of maintenance for your garden:</p>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="maintenance"
                  checked={maintenance === 'Low'}
                  onChange={() => setMaintenance('Low')}
                  className="mr-2"
                />
                <span>Low</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="maintenance"
                  checked={maintenance === 'Medium'}
                  onChange={() => setMaintenance('Medium')}
                  className="mr-2"
                />
                <span>Medium</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="maintenance"
                  checked={maintenance === 'High'}
                  onChange={() => setMaintenance('High')}
                  className="mr-2"
                />
                <span>High</span>
              </label>
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Your Gardening Goals</label>
            <p className="text-xs text-gray-500 mb-2">Select the goals you wish to achieve through gardening:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={goals.includes('Food')}
                  onChange={() => handleGoalChange('Food')}
                  className="mr-2"
                />
                <span>Food</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={goals.includes('Wildlife')}
                  onChange={() => handleGoalChange('Wildlife')}
                  className="mr-2"
                />
                <span>Wildlife</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={goals.includes('Beauty')}
                  onChange={() => handleGoalChange('Beauty')}
                  className="mr-2"
                />
                <span>Beauty</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={goals.includes('Education')}
                  onChange={() => handleGoalChange('Education')}
                  className="mr-2"
                />
                <span>Education</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={goals.includes('Medicinal')}
                  onChange={() => handleGoalChange('Medicinal')}
                  className="mr-2"
                />
                <span>Medicinal</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={goals.includes('Hobby')}
                  onChange={() => handleGoalChange('Hobby')}
                  className="mr-2"
                />
                <span>Hobby</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={goals.includes('Fragrance')}
                  onChange={() => handleGoalChange('Fragrance')}
                  className="mr-2"
                />
                <span>Fragrance</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={goals.includes('Money')}
                  onChange={() => handleGoalChange('Money')}
                  className="mr-2"
                />
                <span>Money</span>
              </label>
            </div>
          </div>
        </div>
        
        {/* Section 2: Custom Planting Plan */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-5">
            <div className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold mr-3">2</div>
            <h2 className="text-xl font-semibold">Custom Planting Plan</h2>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Preferred Plant Types</label>
            <p className="text-xs text-gray-500 mb-2">Select the types of plants you prefer to grow:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {['Flowers', 'Vegetables', 'Trees', 'Grasses', 'Cacti', 'Mosses', 'Aquatics', 'Orchids', 'Herbs', 'Fruits', 'Shrubs', 'Succulents', 'Ferns', 'Vines', 'Bulbs'].map((type) => (
                <div key={type} className={`border rounded-md p-2 cursor-pointer text-center ${plantTypes.includes(type) ? 'border-primary bg-green-50' : 'border-gray-200'}`} onClick={() => handlePlantTypeChange(type)}>
                  {type}
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Fertilizers Type</label>
            <p className="text-xs text-gray-500 mb-2">Select your preferred gardening style:</p>
            <div className="space-y-4">
              <label className="flex items-start">
                <input
                  type="radio"
                  name="fertilizer"
                  checked={fertilizerType === 'Organic'}
                  onChange={() => setFertilizerType('Organic')}
                  className="mt-1 mr-2"
                />
                <div>
                  <span className="font-medium">Organic</span>
                  <p className="text-xs text-gray-500">Organic gardening focuses on using natural methods and materials to grow plants, without the use of synthetic chemicals or pesticides</p>
                </div>
              </label>
              <label className="flex items-start">
                <input
                  type="radio"
                  name="fertilizer"
                  checked={fertilizerType === 'Conventional'}
                  onChange={() => setFertilizerType('Conventional')}
                  className="mt-1 mr-2"
                />
                <div>
                  <span className="font-medium">Conventional</span>
                  <p className="text-xs text-gray-500">Conventional gardening involves using synthetic fertilizers and pesticides to maximize plant growth and manage pests</p>
                </div>
              </label>
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Allergies</label>
            <p className="text-xs text-gray-500 mb-2">Select any allergies or health concerns you have related to gardening:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['Pollen', 'Mold', 'Trees', 'Weeds', 'Bees', 'Dust', 'Shrubs', 'Insects', 'Grass', 'Flowers'].map((allergy) => (
                <label key={allergy} className="flex items-center border rounded-md p-2">
                  <input
                    type="checkbox"
                    checked={allergies.includes(allergy)}
                    onChange={() => handleAllergyChange(allergy)}
                    className="mr-2"
                  />
                  <span>{allergy}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        
        {/* Section 3: Custom Your Planting Space */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-5">
            <div className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold mr-3">3</div>
            <h2 className="text-xl font-semibold">Custom Your Planting Space</h2>
          </div>
          
          <p className="text-sm mb-4">A garden space is an individual area within your garden or home where you grow your plants (like a pot, or a piece of land). You can add up to 25 garden spaces. Each garden space will have up to 10 recommendations. You will only be able to fit this in once, so make sure to add all your garden spaces now, so that we can provide you with the best recommendations. Be sure to include all your indoor and outdoor garden spaces.</p>
          
          <div className="mb-6">
            <h3 className="font-medium mb-3">Frequently Used Planting Space</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="border rounded-md p-3 flex items-center">
                <div className="mr-2">+</div>
                <span>Small Indoor Square Pot</span>
              </div>
              <div className="border rounded-md p-3 flex items-center">
                <div className="mr-2">+</div>
                <span>Big Indoor Round Pot</span>
              </div>
              <div className="border rounded-md p-3 flex items-center">
                <div className="mr-2">+</div>
                <span>Raised Bed Outside</span>
              </div>
              <div className="border rounded-md p-3 flex items-center">
                <div className="mr-2">+</div>
                <span>Piece of Land Outside</span>
              </div>
              <div className="border rounded-md p-3 flex items-center border-dashed">
                <div className="mr-2">+</div>
                <span>Custom your planting space freely</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-3">Your Garden Space List <span className="text-xs text-gray-500">(4 spaces)</span></h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In/Out</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cultivation</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Length</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Width</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Height</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diameter</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sunlight</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Soil</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Water Access</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {gardenSpaces.map((space) => (
                    <tr key={space.id}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{space.inOut}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        {space.type === 'raised-bed' && (
                          <div className="bg-gray-200 h-5 w-5 rounded-sm"></div>
                        )}
                        {space.type === 'ground' && (
                          <div className="bg-gray-200 h-5 w-5 rounded-sm"></div>
                        )}
                        {space.type === 'square-pot' && (
                          <div className="bg-gray-200 h-5 w-5 rounded-sm"></div>
                        )}
                        {space.type === 'round-pot' && (
                          <div className="bg-gray-200 h-5 w-5 rounded-sm"></div>
                        )}
                        {space.type}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{space.length}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{space.width}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{space.height}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{space.diameter}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        {space.sunlight === 'full-sun' && 'full-sun'}
                        {space.sunlight === 'partial-sun' && 'partial-sun'}
                        {space.sunlight === 'partial-shade' && 'partial-shade'}
                        {space.sunlight === 'full-shade' && 'full-shade'}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{space.soil}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{space.waterAccess}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        <button className="text-gray-500 hover:text-gray-700 mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button className="text-gray-500 hover:text-red-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Section 4: Confirm Your Personalized Garden Plan */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-5">
            <div className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold mr-3">4</div>
            <h2 className="text-xl font-semibold">Confirm Your Personalized Garden Plan And Create!</h2>
          </div>
          
          <p className="text-sm mb-6">Our garden plans are generated once, based on the inputs you provide, and cannot be edited afterwards. This is due to the intensive data processing required to create your personalized plan. We recommend thoroughly checking all your inputs before finalizing the plan.</p>
          
          <button 
            onClick={createGardenPlan}
            className="w-full bg-primary hover:bg-green-700 text-white py-3 rounded-md font-medium transition-colors"
          >
            Create My Personalized Garden Plan Now!
          </button>
        </div>
      </div>
    </div>
  );
} 