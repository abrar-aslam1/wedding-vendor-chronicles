import React from "react";
import { getLocationData } from "@/config/hashtag-locations";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface HashtagFAQProps {
  stateSlug?: string;
  citySlug?: string;
  className?: string;
}

const HashtagFAQ: React.FC<HashtagFAQProps> = ({
  stateSlug,
  citySlug,
  className = ""
}) => {
  // Get location data
  const { state, city } = getLocationData(stateSlug, citySlug);
  
  // Base FAQs for all pages
  const baseFAQs = [
    {
      question: "What is a wedding hashtag?",
      answer: "A wedding hashtag is a unique phrase preceded by the # symbol that couples create for their wedding. Guests can use this hashtag when posting photos and videos on social media, making it easy to collect and view all wedding-related content in one place."
    },
    {
      question: "Why do I need a wedding hashtag?",
      answer: "A wedding hashtag helps you collect all your wedding photos from guests in one place, increases guest engagement, and creates a digital keepsake of your special day. Over 75% of modern weddings now use custom hashtags to organize their wedding memories."
    },
    {
      question: "How do I choose the best wedding hashtag?",
      answer: "The best wedding hashtags are memorable, unique, and easy to spell. Consider using a combination of your names, wedding date, or location. Make sure to check if the hashtag is already being used on social media platforms. Our generator creates multiple options so you can choose the one that feels right for you."
    },
    {
      question: "When should I create my wedding hashtag?",
      answer: "It's best to create your wedding hashtag early in the planning process, ideally 6-12 months before your wedding. This allows you to include it on save-the-dates, invitations, your wedding website, and other pre-wedding communications."
    },
    {
      question: "How do I share my wedding hashtag with guests?",
      answer: "You can share your wedding hashtag on save-the-dates, invitations, your wedding website, and social media. At the wedding, display your hashtag on signage, table cards, programs, or even custom items like napkins and favors."
    },
    {
      question: "Should my wedding hashtag use capital letters?",
      answer: "Using capital letters for each word in your hashtag (known as camelCase, like #JohnAndJaneWedding) makes it easier to read but doesn't affect how the hashtag works. Hashtags aren't case-sensitive on social media platforms, but capitalization improves readability."
    },
    {
      question: "Can I use special characters or spaces in my wedding hashtag?",
      answer: "No, hashtags cannot contain spaces, punctuation, or special characters. Only letters, numbers, and underscores (_) are allowed. Our generator automatically creates hashtags that follow these rules."
    }
  ];
  
  // Location-specific FAQs
  const getLocationFAQs = () => {
    if (!stateSlug) return [];
    
    const locationFAQs = [
      {
        question: `What are popular wedding hashtag trends in ${state?.stateName || stateSlug}?`,
        answer: `Wedding hashtags in ${state?.stateName || stateSlug} often incorporate local landmarks, state nicknames like "${state?.stateNickname || ''}", or regional terms. Couples frequently include the state abbreviation "${state?.stateAbbreviation || ''}" in their hashtags for a local touch.`
      }
    ];
    
    if (citySlug && city) {
      locationFAQs.push({
        question: `How can I incorporate ${city.cityName} into my wedding hashtag?`,
        answer: `For a ${city.cityName}-themed wedding hashtag, consider including the city name, local landmarks like ${city.landmarks?.join(', ') || 'popular attractions'}, or nicknames such as ${city.nicknames?.join(', ') || city.cityName}. This adds a personalized touch that celebrates your wedding location.`
      });
      
      locationFAQs.push({
        question: `What makes a great ${city.cityName} wedding hashtag?`,
        answer: `Great ${city.cityName} wedding hashtags often include local terminology, references to iconic locations, or city-specific themes. Consider incorporating terms like ${city.specialTerms?.join(', ') || 'local features'} for a truly authentic ${city.cityName} wedding hashtag.`
      });
    }
    
    return locationFAQs;
  };
  
  // Combine base FAQs with location-specific FAQs
  const allFAQs = [...baseFAQs, ...getLocationFAQs()];
  
  // Schema for FAQ
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": allFAQs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
  
  return (
    <div className={className}>
      <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions About Wedding Hashtags</h2>
      
      <Accordion type="single" collapsible className="w-full">
        {allFAQs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left font-medium">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-gray-700">{faq.answer}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      
      {/* FAQ Schema */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </div>
  );
};

export default HashtagFAQ;
