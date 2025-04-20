import React from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface CategoryFAQProps {
  category: string;
  city?: string;
  state?: string;
  subcategory?: string;
  className?: string;
}

export const CategoryFAQ: React.FC<CategoryFAQProps> = ({
  category,
  city,
  state,
  subcategory,
  className = ''
}) => {
  const formatText = (text: string) => {
    return text
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formattedCategory = formatText(category);
  const formattedSubcategory = subcategory ? formatText(subcategory) : '';
  const locationString = city && state ? `in ${city}, ${state}` : '';
  
  // Base FAQs that apply to all categories
  const baseFAQs: FAQItem[] = [
    {
      question: `How do I choose a wedding ${category.toLowerCase()}${locationString}?`,
      answer: `When choosing a wedding ${category.toLowerCase()} ${locationString}, consider their experience, portfolio, reviews from past clients, pricing, and availability for your wedding date. Schedule consultations with multiple vendors to find the best fit for your vision and budget. Ask for references and examples of their previous work similar to what you're looking for.`
    },
    {
      question: `What should I look for in a wedding ${category.toLowerCase()}?`,
      answer: `Look for a ${category.toLowerCase()} with proven experience in weddings, positive reviews, clear pricing, and good communication. They should understand your vision and style while providing professional guidance and support. Make sure they have backup plans for emergencies and a contract that clearly outlines all services and policies.`
    },
    {
      question: `How far in advance should I book a wedding ${category.toLowerCase()}?`,
      answer: `Most wedding ${category.toLowerCase()} vendors should be booked 9-12 months before your wedding date. Popular vendors in high-demand seasons may require booking 12-18 months in advance to secure your date. If you're planning a wedding during peak season (typically May through October), consider booking even earlier.`
    },
    {
      question: `What questions should I ask before hiring a wedding ${category.toLowerCase()}?`,
      answer: `Important questions to ask include: Are you available on my wedding date? What's included in your packages and pricing? Do you have insurance? Can I see examples of your previous work? What is your cancellation policy? How much experience do you have with weddings specifically? Do you have backup equipment/staff in case of emergencies? How do you handle unexpected situations?`
    }
  ];
  
  // Category-specific FAQs
  const categorySpecificFAQs: Record<string, FAQItem[]> = {
    'photographers': [
      {
        question: 'How many hours of coverage do I need for wedding photography?',
        answer: 'Most weddings require 8-10 hours of photography coverage to capture everything from getting ready through the reception. For smaller weddings, 6 hours may be sufficient, while larger events might need 12+ hours. Consider your timeline, ceremony length, and how much of the reception you want documented when deciding on coverage hours.'
      },
      {
        question: 'Do wedding photographers provide raw, unedited photos?',
        answer: 'Most professional wedding photographers do not provide raw, unedited photos as part of their service. Editing is considered an essential part of their artistic process and final product. The edited photos you receive represent the photographer\'s complete vision and professional standard of quality.'
      },
      {
        question: 'How many wedding photos should I expect to receive?',
        answer: 'For a typical 8-hour wedding, you can expect to receive between 400-800 professionally edited photos, depending on the photographer\'s style and shooting approach. Documentary-style photographers tend to deliver more images, while fine art photographers may deliver fewer, more curated images.'
      }
    ],
    'venues': [
      {
        question: 'What should be included in a wedding venue contract?',
        answer: 'A comprehensive wedding venue contract should include the date and time of your event, rental fees, deposit amount, payment schedule, cancellation policy, liability insurance requirements, catering options, alcohol policies, decoration restrictions, and setup/cleanup responsibilities. Always read the fine print and ask questions about anything that isn\'t clear.'
      },
      {
        question: 'How do I calculate how much space I need for my wedding venue?',
        answer: 'As a general rule, allow 25-30 square feet per guest for a seated dinner with a dance floor. For a cocktail-style reception, you can estimate 15-20 square feet per guest. Always confirm with your venue about their maximum capacity guidelines and how they calculate space requirements for different event styles.'
      },
      {
        question: 'What\'s the difference between an all-inclusive venue and a venue-only rental?',
        answer: 'An all-inclusive venue typically provides catering, bar service, tables, chairs, linens, tableware, setup, and cleanup as part of their package. A venue-only rental (sometimes called a "dry hire") provides just the space, requiring you to bring in all vendors separately. All-inclusive venues offer convenience but less flexibility, while venue-only rentals offer more customization but require more planning.'
      }
    ],
    'caterers': [
      {
        question: 'How much food should I order for my wedding reception?',
        answer: 'For a plated dinner, plan for one serving per person. For buffet-style service, caterers typically prepare for 1.5 servings per person to ensure you don\'t run out. For appetizers during cocktail hour, plan for 3-5 pieces per person per hour. Your caterer can help you determine exact quantities based on your menu selection and guest demographics.'
      },
      {
        question: 'Do wedding caterers provide tastings before booking?',
        answer: 'Most reputable wedding caterers offer tastings, though policies vary. Some provide complimentary tastings once you\'ve expressed serious interest, while others charge a fee that may be applied to your final bill if you book their services. Group tastings (where multiple couples sample menu items together) are also common and may be offered at a lower cost or for free.'
      },
      {
        question: 'How do I accommodate dietary restrictions at my wedding?',
        answer: 'Discuss dietary restrictions with your caterer early in the planning process. Most experienced wedding caterers can accommodate common restrictions like vegetarian, vegan, gluten-free, and allergies. Include a section on your RSVP cards for guests to note dietary needs, and provide this information to your caterer at least 2-4 weeks before the wedding.'
      }
    ],
    'florists': [
      {
        question: 'What flowers are in season for my wedding date?',
        answer: 'Spring (March-May): Tulips, peonies, lilacs, and cherry blossoms. Summer (June-August): Roses, sunflowers, dahlias, and hydrangeas. Fall (September-November): Chrysanthemums, marigolds, and dahlias. Winter (December-February): Amaryllis, camellias, and poinsettias. Using in-season flowers can significantly reduce your floral budget while ensuring the freshest blooms.'
      },
      {
        question: 'How can I preserve my wedding bouquet?',
        answer: 'Popular methods for preserving wedding bouquets include air-drying (hanging upside down), pressing, silica gel drying, freeze-drying (professional service), or having it professionally preserved in resin or a shadow box. For best results, start the preservation process within 48 hours after your wedding. Many florists can recommend local preservation specialists.'
      },
      {
        question: 'How much should I budget for wedding flowers?',
        answer: 'Wedding flowers typically account for 8-10% of your total wedding budget. For a $30,000 wedding, that\'s about $2,400-$3,000 for all floral elements including bouquets, boutonnieres, centerpieces, and ceremony decorations. Costs vary widely based on flower types, seasonality, design complexity, and your location.'
      }
    ],
    'wedding-planners': [
      {
        question: 'What\'s the difference between a full-service planner, partial planner, and day-of coordinator?',
        answer: 'A full-service planner handles every aspect of wedding planning from start to finish. A partial planner typically comes in midway through planning to help with remaining tasks and vendor coordination. A day-of coordinator (actually more like month-of) focuses on creating timelines, confirming vendors, and managing the wedding day itself. Prices reflect the level of service, with full-service being the most expensive option.'
      },
      {
        question: 'How much does a wedding planner cost?',
        answer: 'Wedding planner costs vary widely based on location and service level. Full-service planners typically charge 10-20% of your total wedding budget (minimum $5,000-$10,000). Partial planning ranges from $2,000-$6,000, while day-of coordination typically costs $1,000-$3,000. Some planners charge flat fees rather than percentages.'
      },
      {
        question: 'Is hiring a wedding planner worth the cost?',
        answer: 'A wedding planner can save you time, stress, and sometimes money through vendor connections and discounts. They\'re particularly valuable if you have a demanding job, are planning from a distance, have a complex vision, or are hosting at a venue without on-site coordination. Many couples find that the peace of mind alone makes the investment worthwhile.'
      }
    ]
  };
  
  // Get the appropriate category-specific FAQs
  const specificFAQs = categorySpecificFAQs[category.toLowerCase()] || [];
  
  // Combine base and specific FAQs
  const allFAQs = [...baseFAQs, ...specificFAQs];
  
  // If subcategory is provided, add a subcategory-specific question
  if (subcategory) {
    allFAQs.unshift({
      question: `What should I look for in a ${formattedSubcategory} ${formattedCategory.toLowerCase()}${locationString}?`,
      answer: `When choosing a ${formattedSubcategory.toLowerCase()} ${formattedCategory.toLowerCase()} ${locationString}, look for specialists with experience in this specific style. Review their portfolio for examples of ${formattedSubcategory.toLowerCase()} work, ask about their training or specialization in this area, and discuss how they would approach your specific needs. Make sure they have the right equipment, team, and expertise to deliver the ${formattedSubcategory.toLowerCase()} experience you're looking for.`
    });
  }
  
  // If location is provided, add a location-specific question
  if (city && state) {
    allFAQs.unshift({
      question: `How much do ${formattedCategory.toLowerCase()} services cost in ${city}, ${state}?`,
      answer: `${formattedCategory} prices in ${city}, ${state} vary based on experience, reputation, and the specific services you need. On average, you can expect to pay [price range] for professional ${formattedCategory.toLowerCase()} services in this area. Always get detailed quotes from multiple vendors to compare what's included and find the best value for your budget.`
    });
  }

  return (
    <section className={`mt-12 mb-16 ${className}`} aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-2xl font-bold mb-6">
        Frequently Asked Questions about {formattedSubcategory} {formattedCategory} {locationString}
      </h2>
      
      <div className="space-y-6">
        {allFAQs.map((faq, index) => (
          <div key={index} className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
            <p className="text-gray-700">{faq.answer}</p>
          </div>
        ))}
      </div>
      
      {/* Structured data for FAQs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: allFAQs.map(faq => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer
              }
            }))
          })
        }}
      />
    </section>
  );
};
