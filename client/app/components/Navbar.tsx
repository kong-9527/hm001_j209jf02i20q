'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image 
              src="/logo.png" 
              alt="Garden AI Logo" 
              width={40} 
              height={40} 
              className="mr-2"
            />
            <span className="text-xl font-semibold text-green-600">AI Garden Design</span>
          </Link>
        </div>
        
        <div className="hidden md:flex space-x-8">
          <Link href="/design" className="text-gray-600 hover:text-green-600">
            AI Garden Design
          </Link>
          <Link href="/landscapers" className="text-gray-600 hover:text-green-600">
            For Landscapers
          </Link>
          <Link href="/plant-advisor" className="text-gray-600 hover:text-green-600">
            AI Plant Advisor
          </Link>
          <Link href="/pricing" className="text-gray-600 hover:text-green-600">
            Pricing
          </Link>
          <Link href="/blog" className="text-gray-600 hover:text-green-600">
            Gardening Blog
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link href="/signin" className="bg-gray-900 text-white rounded-md px-4 py-2 text-sm font-medium">
            Sign in
          </Link>
          <Link href="/register" className="bg-white border border-gray-300 text-gray-900 rounded-md px-4 py-2 text-sm font-medium">
            Register
          </Link>
        </div>
      </nav>
    </header>
  );
}