'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StyleSelector from '../components/StyleSelector';
import ImageComparison from '../components/ImageComparison';
import gardenStyles, { GardenStyle } from '../data/gardenStyles';
import MovingStyles from '../components/MovingStyles';
import FeatureGrid from '../components/FeatureGrid';
import { 
  AutomatedIcon, 
  GlobalIcon, 
  PreviewIcon, 
  StorageIcon, 
  SharingIcon, 
  UpdatesIcon 
} from '../components/Icons';
import FaqAccordion from '../components/FaqAccordion';

export default function Home() {
  // 轮播图片数据
  const gardenImages = [
    '/images/garden1.jfif',
    '/images/garden1.jfif',
    '/images/garden3.jpg',
    '/images/garden4.jpg',
  ];

  // 轮播图状态
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // 花园风格状态
  const [styles, setStyles] = useState<GardenStyle[]>(gardenStyles);
  const [selectedStyle, setSelectedStyle] = useState<GardenStyle>(gardenStyles[0]);

  // 切换选中的风格
  const handleSelectStyle = (styleId: string) => {
    const updatedStyles = styles.map(style => ({
      ...style,
      isActive: style.id === styleId
    }));
    
    setStyles(updatedStyles);
    setSelectedStyle(updatedStyles.find(style => style.id === styleId) || updatedStyles[0]);
  };

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
      <Navbar />

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
            Build Your Dream Garden<br />With AI
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mt-6">
            Create dream designs and advisors for your garden<br />
            through our powerful <span className="text-teal-600 font-medium">AI technology</span>
          </p>
          
          {/* 行动按钮 */}
          <div className="mt-16 flex flex-col sm:flex-row justify-center gap-4 pt-8">
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
          
          {/* <p className="mt-6 text-gray-500">
            1130 people joined this week!
          </p> */}
        </div>

        {/* 花园示例展示 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-0">
          <MovingStyles 
            // title="Explore garden design inspirations"
            images={[
              { id: 1, src: '/images/style_example_1.jfif', alt: 'Garden style example 1' },
              { id: 2, src: '/images/style_example_2.jfif', alt: 'Garden style example 2' },
              { id: 3, src: '/images/style_example_3.jfif', alt: 'Garden style example 3' },
              { id: 4, src: '/images/style_example_4.jfif', alt: 'Garden style example 4' },
              { id: 5, src: '/images/style_example_3.jfif', alt: 'Garden style example 5' },
              { id: 6, src: '/images/style_example_2.jfif', alt: 'Garden style example 6' },
            ]}
          />
        </div>

        {/* 特性展示 */}
        <FeatureGrid
          title="Features of AI Garden Design"
          subtitle="Our AI garden design platform offers a wide range of features that make it easy for anyone to create beautiful gardens. Whether you're a professional or a hobbyist, we've got you covered."
          features={[
            {
              icon: <AutomatedIcon />,
              title: "AI-Powered Design",
              description: "Utilizing AI-driven technologies to automatically enhance garden designs, saving users time and effort while making the designs appear more professional."
            },
            {
              icon: <GlobalIcon />,
              title: "Global Plant Database",
              description: "Access to plants from diverse climatic backgrounds, ensuring that users can create gardens suited to their specific regions and environmental conditions."
            },
            {
              icon: <PreviewIcon />,
              title: "Real-time Preview",
              description: "See changes to your garden design in real-time, ensuring that the selected elements meet your personal needs and enhancing user experience."
            },
            {
              icon: <StorageIcon />,
              title: "Cloud Storage",
              description: "Safely preserve your projects for easy access and management at any time and location, making your creative processes more flexible and efficient."
            },
            {
              icon: <SharingIcon />,
              title: "Easy Sharing",
              description: "Quickly share designs to major social platforms with a simple click, making it easier for friends and followers to see your work and enhancing visibility."
            },
            {
              icon: <UpdatesIcon />,
              title: "Regular Updates",
              description: "We're constantly improving our platform with new features and plant varieties, ensuring that users always have access to the latest gardening trends."
            }
          ]}
        />

        {/* FAQ部分 */}
        <FaqAccordion
          title="Garden Design Help Center: FAQ"
          subtitle="Commonly Asked Questions About Our AI Garden Designer"
          faqs={[
            {
              question: "What is AI Garden Designer?",
              answer: "AI Garden Designer is an advanced platform that uses artificial intelligence to transform your outdoor spaces into stunning garden designs. It analyzes your space, considers your preferences, and generates professional landscape designs tailored to your needs."
            },
            {
              question: "How does AI Garden Designer work?",
              answer: "Our platform works by taking images of your space, analyzing the terrain, light conditions, and local climate. You provide preferences about styles, plants, and features you'd like, and our AI generates multiple design options. You can then refine these designs until you're completely satisfied."
            },
            {
              question: "What types of gardens can I create?",
              answer: (
                <div>
                  <p className="mb-2">AI Garden Designer can generate various types of gardens, including:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Residential gardens and backyards</li>
                    <li>Japanese Zen gardens</li>
                    <li>English cottage gardens</li>
                    <li>Modern minimalist landscapes</li>
                    <li>Desert xeriscapes</li>
                    <li>Tropical paradises</li>
                    <li>And many more styles!</li>
                  </ul>
                  <p className="mt-2">The platform is designed to adapt to multiple styles and requirements, offering endless possibilities.</p>
                </div>
              )
            },
            {
              question: "Is AI Garden Designer easy to use?",
              answer: "Yes! Our platform is designed with simplicity in mind. Even without prior garden design experience, you can easily use the interface. Just upload your space photos, select your preferences, and let the AI do the rest. The intuitive interface and automated features ensure a smooth user experience."
            },
            {
              question: "What is the quality of designs produced?",
              answer: "Our AI produces professional-quality garden designs that follow established landscape design principles. The designs are realistic, implementable, and tailored to your specific space and conditions. Many professional landscapers use our platform as a starting point for their client projects."
            },
            {
              question: "How long does it take to get my garden design?",
              answer: "Most designs are generated within minutes of submitting your requirements. More complex projects might take up to an hour for the AI to process. You can then make revisions and adjustments in real-time."
            },
            {
              question: "Can I use the designs for commercial purposes?",
              answer: "Yes, all designs created with your account are yours to use for personal or commercial purposes. Many landscape professionals use our platform to create initial concepts for client presentations."
            },
            {
              question: "How do I implement the garden design?",
              answer: "Once your design is finalized, you'll receive detailed plant lists, material specifications, and implementation guidelines. You can implement the design yourself as a DIY project, or share these specifications with a professional landscaper for installation."
            }
          ]}
        />

        {/* 风格选择区域 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">
            How AI Generates brilliant designs
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mt-6">
            Witness how our AI effortlessly converts ordinary gardens into breathtaking designs within mere seconds. Become part of a community of countless delighted homeowners and professional landscapers who have unlocked the hidden beauty and potential of their outdoor spaces.
          </p>

          <StyleSelector 
            styles={styles} 
            onSelectStyle={handleSelectStyle} 
          />
        </div>

        {/* 效果对比区域 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-gray-800">
              {selectedStyle.name}
            </h3>
            <p className="text-gray-600 mt-2">
              Drag the slider to compare the front and rear effects
            </p>
          </div>

          <ImageComparison 
            beforeImage={selectedStyle.before} 
            afterImage={selectedStyle.after}
            beforeAlt={`${selectedStyle.name} Before`}
            afterAlt={`${selectedStyle.name} After`}
          />
        </div>


      </main>

      {/* 页脚 */}
      <Footer />
    </div>
  );
}
