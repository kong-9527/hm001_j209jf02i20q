'use client';

import React from 'react';
import Image from 'next/image';

interface MovingStylesProps {
  title?: string;
  images: Array<{ id: number, src: string, alt: string }>;
}

const MovingStyles: React.FC<MovingStylesProps> = ({ 
  // title = "Try any of these styles in the app",
  images
}) => {
  // 复制图片以确保滚动效果连续
  const duplicatedImages = [...images, ...images, ...images];
  
  return (
    <section className="pt-0 pb-8">      
      {/* 横向滚动 */}
      <div className="overflow-hidden">
        <div className="flex animate-marquee">
          {duplicatedImages.map((image, index) => (
            <div key={`image-${image.id}-${index}`} className="flex-shrink-0 w-64 px-4">
              <div className="relative w-full h-40">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 256px"
                  className="object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MovingStyles; 