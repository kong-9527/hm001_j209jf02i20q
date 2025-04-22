'use client';

import React, { useState, FormEvent } from 'react';
import Image from 'next/image';

export default function PhotoGenerator() {
  const [selectedTab, setSelectedTab] = useState('premade');
  const [uploadedImage, setUploadedImage] = useState(true); // 默认已上传图片状态，实际应用中默认为false
  const [recentImagesState, setRecentImagesState] = useState<'empty' | 'single' | 'multiple'>('single'); // 默认显示单图状态
  const [debugInput, setDebugInput] = useState('');
  
  const handleDebugSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // 控制图片上传状态
    if (debugInput.includes('2：有图')) {
      setUploadedImage(true);
    } else if (debugInput.includes('2：空')) {
      setUploadedImage(false);
    }
    
    // 控制最近图片状态
    if (debugInput.includes('1：空')) {
      setRecentImagesState('empty');
    } else if (debugInput.includes('1：有图')) {
      setRecentImagesState('single');
    } else if (debugInput.includes('1：多图')) {
      setRecentImagesState('multiple');
    }
    
    // 可以在控制台输出当前状态，方便调试
    console.log('Debug input:', debugInput);
    console.log('Uploaded image state:', uploadedImage);
    console.log('Recent images state:', recentImagesState);
  };
  
  // 渲染最近图片内容
  const renderRecentImages = () => {
    switch (recentImagesState) {
      case 'empty':
        return (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-2 text-gray-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <p className="text-sm">No recent images</p>
          </div>
        );
      
      case 'single':
        return (
          <div className="grid grid-cols-4 gap-2">
            {/* 示例最近图片 */}
            <div className="relative aspect-square bg-gray-100 rounded-md overflow-hidden">
              <Image 
                src="/uploads/garden-sample.png" 
                alt="Garden Photo" 
                fill
                sizes="100%"
                style={{objectFit: 'cover'}}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
                2024/4/13
              </div>
            </div>
          </div>
        );
      
      case 'multiple':
        return (
          <div className="grid grid-cols-4 gap-2">
            {/* 多张图片 */}
            {Array(5).fill(0).map((_, index) => (
              <div key={index} className="relative aspect-square bg-gray-100 rounded-md overflow-hidden">
                <Image 
                  src="/uploads/garden-sample.png" 
                  alt={`Garden Photo ${index + 1}`}
                  fill
                  sizes="100%"
                  style={{objectFit: 'cover'}}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
                  2024/{4 + Math.floor(index/2)}/{10 + index}
                </div>
              </div>
            ))}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="w-full h-full">
      {/* <h1 className="text-2xl font-bold mb-6">Images</h1> */}
      
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100%-3rem)]">
        {/* 左侧面板 */}
        <div className="bg-white rounded-lg shadow-sm p-6 flex-1 overflow-y-auto">
          {/* 最近图片 */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="h-6 w-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs mr-2">1</div>
              <h2 className="text-lg font-medium">Recent Images</h2>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 ml-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              {renderRecentImages()}
            </div>
          </div>
          
          {/* 上传图片区域 */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="h-6 w-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs mr-2">2</div>
              <h2 className="text-lg font-medium">Upload Your Image</h2>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 ml-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            </div>
            
            <div className="text-sm text-gray-600 mb-3 bg-green-100 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Tips for the best results:</h3>
                  <p className="text-sm text-green-700">Use square images</p>
                  <p className="text-sm text-green-700">Ensure good lighting</p>
                  <p className="text-sm text-green-700">High resolution</p>
                  <p className="text-sm text-green-700">Full garden view</p>
                </div>
              </div>
            </div>
            
            {/* 上传图片状态 */}
            {!uploadedImage ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
                <div className="w-12 h-12 mb-4 flex items-center justify-center bg-purple-100 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-purple-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-center mb-1">Drop your image here or click to upload</p>
                <p className="text-xs text-gray-500 text-center">Supports JPG, PNG, WEBP</p>
                <label className="mt-4">
                  <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" />
                  <span className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition cursor-pointer">
                    Select File
                  </span>
                </label>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 group cursor-pointer">
                <div className="relative aspect-video overflow-hidden rounded-md">
                  <Image 
                    src="/uploads/garden-sample.png" 
                    alt="Uploaded Garden" 
                    fill
                    sizes="100%"
                    style={{objectFit: 'cover'}}
                    className="transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 flex items-center justify-center transition-all group-hover:bg-opacity-40">
                    <p className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">Click to change image</p>
                  </div>
                </div>
                <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" />
              </div>
            )}
          </div>
          
          {/* Partial Redesign部分 */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="h-6 w-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs mr-2">3</div>
              <h2 className="text-lg font-medium">Partial Redesign</h2>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 ml-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-3">Optionally enhance your garden visualization:</p>
              <ul className="text-sm space-y-2">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600 mr-2 flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Select areas you want to modify with the brush tool</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600 mr-2 flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Use the zoom, region fill and bucket tool to precisely fill in your garden boundaries</span>
                </li>
              </ul>
              
              <button className="mt-4 px-4 py-1.5 border border-gray-300 bg-white rounded-lg text-sm flex items-center justify-center hover:bg-gray-50 transition w-full">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                Edit Garden Image
              </button>
            </div>
          </div>
          
          {/* 选择风格 */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="h-6 w-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs mr-2">4</div>
              <h2 className="text-lg font-medium">Select Style</h2>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 ml-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            </div>
            
            <div className="flex mb-4 border-b border-gray-200">
              <button 
                className={`px-4 py-2 text-sm font-medium ${selectedTab === 'premade' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setSelectedTab('premade')}
              >
                Classic styles
              </button>
              <button 
                className={`px-4 py-2 text-sm font-medium ${selectedTab === 'custom' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setSelectedTab('custom')}
              >
                Custom styles
              </button>
            </div>
            
            <div className="ml-2 flex mb-5">
              <span className="text-xs text-gray-500 mr-1">Step 3:</span>
              <span className="text-xs text-gray-700">Choose a Style</span>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {/* 日式花园风格 */}
              <div className="border border-gray-200 hover:border-primary rounded-lg p-2 cursor-pointer transition">
                <div className="aspect-video bg-gray-100 rounded mb-2 relative overflow-hidden">
                  <Image 
                    src="/uploads/styles/japanese-zen.jpg" 
                    alt="Japanese Zen Garden"
                    fill
                    sizes="100%"
                    style={{objectFit: 'cover'}}
                    className="hover:scale-105 transition-transform"
                  />
                </div>
                <p className="text-xs font-medium">Japanese Zen Garden</p>
              </div>
              
              {/* 英式花园风格 */}
              <div className="border border-gray-200 hover:border-primary rounded-lg p-2 cursor-pointer transition">
                <div className="aspect-video bg-gray-100 rounded mb-2 relative overflow-hidden">
                  <Image 
                    src="/uploads/styles/english-cottage.jpg" 
                    alt="English Cottage Garden"
                    fill
                    sizes="100%"
                    style={{objectFit: 'cover'}}
                    className="hover:scale-105 transition-transform"
                  />
                </div>
                <p className="text-xs font-medium">English Cottage Garden</p>
              </div>
              
              {/* 现代简约风格 */}
              <div className="border border-gray-200 hover:border-primary rounded-lg p-2 cursor-pointer transition">
                <div className="aspect-video bg-gray-100 rounded mb-2 relative overflow-hidden">
                  <Image 
                    src="/uploads/styles/modern-minimalist.jpg" 
                    alt="Modern Minimalist"
                    fill
                    sizes="100%"
                    style={{objectFit: 'cover'}}
                    className="hover:scale-105 transition-transform"
                  />
                </div>
                <p className="text-xs font-medium">Modern Minimalist</p>
              </div>
              
              {/* 地中海风格 */}
              <div className="border border-gray-200 hover:border-primary rounded-lg p-2 cursor-pointer transition">
                <div className="aspect-video bg-gray-100 rounded mb-2 relative overflow-hidden">
                  <Image 
                    src="/uploads/styles/mediterranean.jpg" 
                    alt="Mediterranean Garden"
                    fill
                    sizes="100%"
                    style={{objectFit: 'cover'}}
                    className="hover:scale-105 transition-transform"
                  />
                </div>
                <p className="text-xs font-medium">Mediterranean Garden</p>
              </div>
              
              {/* 热带天堂风格 */}
              <div className="border border-gray-200 hover:border-primary rounded-lg p-2 cursor-pointer transition">
                <div className="aspect-video bg-gray-100 rounded mb-2 relative overflow-hidden">
                  <Image 
                    src="/uploads/styles/tropical-paradise.jpg" 
                    alt="Tropical Paradise"
                    fill
                    sizes="100%"
                    style={{objectFit: 'cover'}}
                    className="hover:scale-105 transition-transform"
                  />
                </div>
                <p className="text-xs font-medium">Tropical Paradise</p>
              </div>
              
              {/* 法式正式风格 */}
              <div className="border border-gray-200 hover:border-primary rounded-lg p-2 cursor-pointer transition">
                <div className="aspect-video bg-gray-100 rounded mb-2 relative overflow-hidden">
                  <Image 
                    src="/uploads/styles/french-formal.jpg" 
                    alt="French Formal Garden"
                    fill
                    sizes="100%"
                    style={{objectFit: 'cover'}}
                    className="hover:scale-105 transition-transform"
                  />
                </div>
                <p className="text-xs font-medium">French Formal Garden</p>
              </div>
              
              {/* 沙漠景观风格 */}
              <div className="border border-gray-200 hover:border-primary rounded-lg p-2 cursor-pointer transition">
                <div className="aspect-video bg-gray-100 rounded mb-2 relative overflow-hidden">
                  <Image 
                    src="/uploads/styles/desert-landscape.jpg" 
                    alt="Desert Landscape"
                    fill
                    sizes="100%"
                    style={{objectFit: 'cover'}}
                    className="hover:scale-105 transition-transform"
                  />
                </div>
                <p className="text-xs font-medium">Desert Landscape</p>
              </div>
              
              {/* 林地花园风格 */}
              <div className="border border-gray-200 hover:border-primary rounded-lg p-2 cursor-pointer transition">
                <div className="aspect-video bg-gray-100 rounded mb-2 relative overflow-hidden">
                  <Image 
                    src="/uploads/styles/woodland-garden.jpg" 
                    alt="Woodland Garden"
                    fill
                    sizes="100%"
                    style={{objectFit: 'cover'}}
                    className="hover:scale-105 transition-transform"
                  />
                </div>
                <p className="text-xs font-medium">Woodland Garden</p>
              </div>
              
              {/* 当代都市风格 */}
              <div className="border border-gray-200 hover:border-primary rounded-lg p-2 cursor-pointer transition">
                <div className="aspect-video bg-gray-100 rounded mb-2 relative overflow-hidden">
                  <Image 
                    src="/uploads/styles/contemporary-urban.jpg" 
                    alt="Contemporary Urban"
                    fill
                    sizes="100%"
                    style={{objectFit: 'cover'}}
                    className="hover:scale-105 transition-transform"
                  />
                </div>
                <p className="text-xs font-medium">Contemporary Urban</p>
              </div>
              
              {/* 中式庭院风格 */}
              <div className="border border-gray-200 hover:border-primary rounded-lg p-2 cursor-pointer transition">
                <div className="aspect-video bg-gray-100 rounded mb-2 relative overflow-hidden">
                  <Image 
                    src="/uploads/styles/chinese-garden.jpg" 
                    alt="Chinese Classical Garden"
                    fill
                    sizes="100%"
                    style={{objectFit: 'cover'}}
                    className="hover:scale-105 transition-transform"
                  />
                </div>
                <p className="text-xs font-medium">Chinese Classical Garden</p>
              </div>
            </div>
          </div>
          
          {/* 结构相似度 */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="h-6 w-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs mr-2">5</div>
              <h2 className="text-lg font-medium">Structural Resemblance</h2>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 ml-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
              <button className="ml-2 text-xs text-gray-500 underline flex items-center">
                Reset
              </button>
            </div>
            
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Weakest Resemblance</span>
              <span>Strongest Resemblance</span>
            </div>
            
            <div className="relative h-2 bg-gray-200 rounded-full mb-2">
              <div className="absolute h-full w-3/4 bg-purple-600 rounded-full"></div>
              <div className="absolute h-4 w-4 bg-white border-2 border-purple-600 rounded-full top-1/2 left-3/4 transform -translate-y-1/2 -translate-x-1/2"></div>
            </div>
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
            
            <div className="mt-2 text-sm font-medium text-center">
              70%
            </div>
          </div>
          
          {/* 生成按钮 */}
          <div>
            <div className="flex items-center mb-4">
              <div className="h-6 w-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs mr-2">6</div>
              <h2 className="text-lg font-medium">Generate</h2>
            </div>
            
            <button className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
              Generate Image
            </button>
          </div>
          
          {/* 调试区域 */}
          <div className="mt-8 border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">调试工具</h3>
            <form onSubmit={handleDebugSubmit} className="flex flex-col space-y-2">
              <input
                type="text"
                value={debugInput}
                onChange={(e) => setDebugInput(e.target.value)}
                placeholder="输入'1：空'/'1：有图'/'1：多图'或'2：有图'/'2：空'"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition"
              >
                提交调试命令
              </button>
            </form>
            <div className="mt-2 text-xs text-gray-500">
              <div>最近图片状态: {recentImagesState}</div>
              <div>当前上传图片状态: {uploadedImage ? '已上传' : '未上传'}</div>
            </div>
          </div>
        </div>
        
        {/* 右侧面板 */}
        <div className="bg-white rounded-lg shadow-sm flex-1 overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Images</h2>
              
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm bg-purple-600 text-white rounded-lg flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download All
                </button>
                
                <button className="p-1 text-purple-600 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                <button className="p-1 text-gray-500 hover:text-gray-700 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="bg-green-100 rounded-lg p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Smart Tips:</h3>
                  <p className="text-sm text-green-700">Try both premade and custom styles for different creative results.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center p-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Images Yet</h3>
            <p className="text-sm text-gray-500 text-center mb-4">Upload an image and choose a style to get started</p>
          </div>
        </div>
      </div>
    </div>
  );
} 