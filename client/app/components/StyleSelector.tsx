'use client';

import React from 'react';
import { GardenStyle } from '../data/gardenStyles';

interface StyleSelectorProps {
  styles: GardenStyle[];
  onSelectStyle: (styleId: string) => void;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({ styles, onSelectStyle }) => {
  return (
    <div className="mb-12 py-6 rounded-lg">
      <h2 className="text-2xl font-semibold text-center text-teal-600 mb-8 pt-8">
        5 design styles to match every house-owner's ideas
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {styles.map((style) => (
          <button
            key={style.id}
            onClick={() => onSelectStyle(style.id)}
            className={`px-4 py-3 rounded-md text-center transition-all ${
              style.isActive
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            {style.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StyleSelector; 