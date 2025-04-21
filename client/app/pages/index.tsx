'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  // 轮播图片数据
  const gardenImages = [
    '/images/garden1.jpg',
    '/images/garden2.jpg',
    '/images/garden3.jpg',
    '/images/garden4.jpg',
  ];

  // 轮播图状态
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 自动轮播
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === gardenImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // 手动切换图片
  const goToPrevious = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? gardenImages.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === gardenImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* 导航栏 */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo.svg" 
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

      {/* 主要内容 */}
      <main className="flex-grow">
        {/* 背景画廊 */}
        <div className="relative overflow-hidden h-[500px]">
          <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-transparent to-white/70 z-10"></div>
          
          <div className="flex overflow-hidden w-full h-full relative">
            {gardenImages.map((src, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <Image
                  src={src}
                  alt={`Garden design ${index + 1}`}
                  fill
                  style={{ objectFit: 'cover' }}
                  priority={index === 0}
                />
              </div>
            ))}
          </div>
          
          {/* 轮播控制按钮 */}
          <button 
            onClick={goToPrevious}
            className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-2 z-20"
            aria-label="Previous image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          
          <button 
            onClick={goToNext}
            className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-2 z-20"
            aria-label="Next image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        {/* 主标题和副标题 */}
        <div className="relative z-20 -mt-60 text-center px-4 sm:px-6 lg:px-8 pb-16">
          <h1 className="text-5xl sm:text-6xl font-bold text-teal-600 mb-4">
            Design Your Dream<br />Garden With AI
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mt-6">
            Transform your outdoor space into a professional landscape design<br />
            using our powerful <span className="text-teal-600 font-medium">AI technology</span>
          </p>
          
          {/* 行动按钮 */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/design"
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-8 py-3 rounded-md text-lg shadow-md transition-colors"
            >
              Start your design
            </Link>
            <Link 
              href="/pricing"
              className="bg-white hover:bg-gray-50 text-gray-800 font-medium px-8 py-3 rounded-md text-lg shadow-md border border-gray-200 transition-colors"
            >
              View pricing
            </Link>
          </div>
          
          <p className="mt-6 text-gray-500">
            1130 people joined this week!
          </p>
        </div>

        {/* 花园示例展示 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="relative overflow-hidden">
            <div className="flex space-x-6 py-4 overflow-x-auto hide-scrollbar">
              {[1, 2, 3, 4].map((id) => (
                <div key={id} className="flex-none w-80 h-48 rounded-lg overflow-hidden shadow-md transition-transform hover:scale-105">
                  <Image
                    src={`/images/example${id}.jpg`}
                    alt={`Garden example ${id}`}
                    width={320}
                    height={192}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center">
                <Image 
                  src="/logo.svg" 
                  alt="Garden AI Logo" 
                  width={32} 
                  height={32} 
                  className="mr-2"
                />
                <span className="text-lg font-semibold text-green-600">AI Garden Design</span>
              </div>
              <p className="text-gray-500 mt-2">创建您梦想中的花园</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">服务</h3>
                <ul className="mt-4 space-y-2">
                  <li><Link href="/design" className="text-gray-600 hover:text-green-600">AI花园设计</Link></li>
                  <li><Link href="/plant-advisor" className="text-gray-600 hover:text-green-600">植物顾问</Link></li>
                  <li><Link href="/landscapers" className="text-gray-600 hover:text-green-600">景观设计师专区</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">公司</h3>
                <ul className="mt-4 space-y-2">
                  <li><Link href="/about" className="text-gray-600 hover:text-green-600">关于我们</Link></li>
                  <li><Link href="/contact" className="text-gray-600 hover:text-green-600">联系我们</Link></li>
                  <li><Link href="/blog" className="text-gray-600 hover:text-green-600">园艺博客</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">法律</h3>
                <ul className="mt-4 space-y-2">
                  <li><Link href="/privacy" className="text-gray-600 hover:text-green-600">隐私政策</Link></li>
                  <li><Link href="/terms" className="text-gray-600 hover:text-green-600">使用条款</Link></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-8 border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">&copy; 2023 AI Garden Design. 保留所有权利。</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-500 hover:text-gray-900">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900">
                <span className="sr-only">Pinterest</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
