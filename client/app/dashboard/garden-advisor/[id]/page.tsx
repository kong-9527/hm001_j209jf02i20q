 'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function GardenAdvisorDetail() {
  const params = useParams();
  const advisorId = params.id;
  
  // Mock data based on the UI screenshot
  const gardenPlan = {
    id: advisorId,
    name: "Garden Plan",
    location: "Canada A7",
    budget: "low",
    maintenance: "low",
    time: "low",
    experience: "beginner",
    goals: "flower, beauty, money",
    plantTypes: "food, fruits, trees, grasses, food, fruits, trees, grasses",
    spaces: "7",
    fertilizer: "Organic",
    allergies: "pollen, mold, bees, dust",
    createdAt: "2025/4/21",
  };
  
  return (
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
        <h1 className="text-2xl font-semibold">Garden Advisor</h1>
      </div>
      
      <div className="bg-green-100 rounded-lg shadow-sm p-6 mb-1">
        <div className="flex justify-between items-start mb-5">
          <h2 className="text-xl font-bold text-gray-800">Garden Plan:</h2>
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
  );
}