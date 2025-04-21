'use client';

import React from 'react';
import Link from 'next/link';

interface CallToActionProps {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
}

const CallToAction: React.FC<CallToActionProps> = ({
  title,
  subtitle,
  buttonText,
  buttonLink
}) => {
  return (
    <section className="py-16 bg-white/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
          {title}
        </h2>
        <p className="text-xl text-gray-600 mb-10">
          {subtitle}
        </p>
        <Link 
          href={buttonLink}
          className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-medium px-8 py-4 rounded-md text-lg shadow-md transition-colors"
        >
          {buttonText}
        </Link>
      </div>
    </section>
  );
};

export default CallToAction; 