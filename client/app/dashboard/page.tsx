'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to AI Garden Designer!</h1>
      
      <p className="text-gray-600 mb-8">
        Start by creating your first garden project!
      </p>
      
      <Link 
        href="/dashboard/new-project"
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors shadow-md"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Create Your First Project
      </Link>
    </div>
  );
} 