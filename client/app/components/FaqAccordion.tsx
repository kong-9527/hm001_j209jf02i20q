'use client';

import React, { useState } from 'react';

interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

interface FaqAccordionProps {
  title: string;
  subtitle: string;
  faqs: FaqItem[];
}

const FaqAccordion: React.FC<FaqAccordionProps> = ({ title, subtitle, faqs }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-16 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">{title}</h2>
          <div className="w-24 h-0.5 bg-teal-600 mx-auto mb-6"></div>
          <p className="text-gray-600">{subtitle}</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-gray-50 border border-gray-100 rounded-lg overflow-hidden shadow-sm transition-all duration-200"
            >
              <button
                className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
                onClick={() => toggleFaq(index)}
                aria-expanded={expandedIndex === index}
              >
                <span className="font-semibold text-lg text-gray-800">{faq.question}</span>
                <span 
                  className={`transform transition-transform duration-200 ${
                    expandedIndex === index ? 'rotate-180' : ''
                  }`}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    className="w-6 h-6 text-teal-600"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M19 9l-7 7-7-7" 
                    />
                  </svg>
                </span>
              </button>
              
              {expandedIndex === index && (
                <div className="px-6 pb-5 text-gray-600">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqAccordion; 