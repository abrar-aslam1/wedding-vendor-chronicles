import { FC, useEffect, useState } from 'react';
import { generateCityFAQs } from '@/utils/content-generator';

interface FAQ {
  question: string;
  answer: string;
}

interface EnhancedFAQProps {
  city: string;
  state: string;
  category: string;
  subcategory?: string;
  className?: string;
  showAsAccordion?: boolean;
}

export const EnhancedFAQ: FC<EnhancedFAQProps> = ({
  city,
  state,
  category,
  subcategory,
  className = '',
  showAsAccordion = true
}) => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    const generateFAQs = async () => {
      try {
        setIsLoading(true);
        
        const generatedFAQs = await generateCityFAQs(
          city,
          state,
          category,
          subcategory
        );
        
        setFaqs(generatedFAQs);
      } catch (err) {
        console.error('Error generating FAQs:', err);
        setFaqs([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (city && state && category) {
      generateFAQs();
    }
  }, [city, state, category, subcategory]);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-100 rounded w-full mb-1"></div>
            <div className="h-4 bg-gray-100 rounded w-5/6"></div>
          </div>
        ))}
      </div>
    );
  }

  if (faqs.length === 0) {
    return null;
  }

  if (!showAsAccordion) {
    return (
      <div className={`space-y-6 ${className}`}>
        {faqs.map((faq, index) => (
          <div key={index} className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {faq.question}
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {faqs.map((faq, index) => (
        <div key={index} className="border border-gray-200 rounded-lg">
          <button
            className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
            onClick={() => toggleFAQ(index)}
            aria-expanded={openIndex === index}
          >
            <span className="font-medium text-gray-900 pr-4">
              {faq.question}
            </span>
            <svg
              className={`w-5 h-5 text-gray-500 transform transition-transform ${
                openIndex === index ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {openIndex === index && (
            <div className="px-6 pb-4">
              <p className="text-gray-700 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default EnhancedFAQ;
