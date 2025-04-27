import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface HashtagFAQProps {
  stateSlug?: string;
  citySlug?: string;
  className?: string;
}

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

export const HashtagFAQ: React.FC<HashtagFAQProps> = ({ stateSlug, citySlug, className = '' }) => {
  // Get location-specific FAQs if state and city are provided
  let faqs = getBaseFAQs();
  
  if (stateSlug) {
    const locationFAQs = getLocationFAQs(stateSlug, citySlug);
    faqs = [...locationFAQs, ...faqs];
  }

  return (
    <section className={`mt-12 mb-16 ${className}`} aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-2xl font-bold mb-6">
        Frequently Asked Questions About Wedding Hashtags
        {stateSlug && citySlug ? ` in ${citySlug.replace(/-/g, ' ')}, ${stateSlug.replace(/-/g, ' ')}` : ''}
      </h2>
      
      <Accordion type="single" collapsible className="space-y-4">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg p-1">
            <AccordionTrigger className="text-lg font-semibold px-4">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 text-gray-700">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      
      {/* Structured data for FAQs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map(faq => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: typeof faq.answer === 'string' 
                  ? faq.answer 
                  : React.Children.toArray(faq.answer)
                      .filter(child => typeof child === 'string')
                      .join(' ')
              }
            }))
          })
        }}
      />
    </section>
  );
};

// Base FAQs that apply to all pages
const getBaseFAQs = (): FAQItem[] => {
  return [
    {
      question: "What makes a good wedding hashtag?",
      answer: (
        <>
          <p className="mb-2">A good wedding hashtag should be:</p>
          <ul className="list-disc list-inside space-y-1 mb-2">
            <li><strong>Memorable and easy to spell</strong> - Guests should be able to remember and spell it correctly</li>
            <li><strong>Unique</strong> - Check social media to make sure it's not already being used</li>
            <li><strong>Short and concise</strong> - Long hashtags are harder to type and remember</li>
            <li><strong>Relevant to you as a couple</strong> - Incorporate your names, wedding date, or a pun</li>
            <li><strong>Clear when written</strong> - Use camel case (capitalize the first letter of each word) for readability</li>
          </ul>
          <p>The best hashtags are often clever plays on words, puns, or combinations of your names that feel personal and unique to your relationship.</p>
        </>
      )
    },
    {
      question: "When should I create my wedding hashtag?",
      answer: (
        <>
          <p className="mb-2">It's best to create your wedding hashtag early in the planning process, ideally 6-12 months before your wedding. This allows you to:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Include it on save-the-dates and invitations</li>
            <li>Use it for pre-wedding events like engagement parties and bridal showers</li>
            <li>Build momentum on social media before the big day</li>
            <li>Give guests plenty of time to become familiar with it</li>
            <li>Collect photos from all wedding-related events under one hashtag</li>
          </ul>
        </>
      )
    },
    {
      question: "How do I share my wedding hashtag with guests?",
      answer: (
        <>
          <p className="mb-2">There are many creative ways to share your wedding hashtag with guests:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Include it on your save-the-dates and invitations</li>
            <li>Add it to your wedding website</li>
            <li>Display it on signage at your ceremony and reception</li>
            <li>Print it on cocktail napkins, coasters, or other reception items</li>
            <li>Include it in your wedding program</li>
            <li>Ask your DJ or band to make an announcement</li>
            <li>Place table cards with the hashtag at each place setting</li>
          </ul>
          <p className="mt-2">The more places you include your hashtag, the more likely guests will remember to use it when posting photos.</p>
        </>
      )
    },
    {
      question: "Should I use more than one wedding hashtag?",
      answer: (
        <>
          <p className="mb-2">While it's best to have one main hashtag for your wedding, you can create additional hashtags for:</p>
          <ul className="list-disc list-inside space-y-1 mb-2">
            <li>Different wedding events (e.g., #SmithBachelorParty, #SmithRehearsalDinner)</li>
            <li>Different aspects of your wedding (e.g., #SmithWeddingPhotos, #SmithWeddingFood)</li>
            <li>Different social media platforms if character limits are a concern</li>
          </ul>
          <p>However, having too many hashtags can confuse guests and scatter your photos across multiple tags. If possible, stick with one primary hashtag for the main wedding events.</p>
        </>
      )
    },
    {
      question: "What if someone is already using my wedding hashtag?",
      answer: (
        <>
          <p className="mb-2">If you discover your perfect hashtag is already in use, you have several options:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Add your wedding year (e.g., #SmithJones2025)</li>
            <li>Add your wedding location (e.g., #SmithJonesNYC)</li>
            <li>Use your first names instead of last names</li>
            <li>Try a different play on words or pun</li>
            <li>Add "wedding" to your hashtag (e.g., #SmithJonesWedding)</li>
          </ul>
          <p className="mt-2">Always search your hashtag on Instagram, Twitter, and Facebook before finalizing it to ensure it's not already being used extensively.</p>
        </>
      )
    },
    {
      question: "How can I collect all the photos shared with my wedding hashtag?",
      answer: (
        <>
          <p className="mb-2">There are several ways to collect and save photos shared with your wedding hashtag:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Use a wedding photo app like WedSocial, Veri, or The Guest</li>
            <li>Create a dedicated Instagram collection to save tagged photos</li>
            <li>Use social media aggregator services that collect posts from multiple platforms</li>
            <li>Set up IFTTT (If This Then That) applets to automatically save tagged photos to a cloud storage service</li>
            <li>Hire a service to create a custom photo book of all hashtagged photos after your wedding</li>
          </ul>
          <p className="mt-2">Remember to periodically save photos during and after your wedding, as some guests may post days or weeks later.</p>
        </>
      )
    },
    {
      question: "What are some examples of popular wedding hashtag formats?",
      answer: (
        <>
          <p className="mb-2">Popular wedding hashtag formats include:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Name combinations</strong>: #SmithAndJones, #SmithPlusJones, #TheSmithJones</li>
            <li><strong>Alliteration</strong>: #JessAndJamesJourney, #DavisIDo</li>
            <li><strong>Puns on last names</strong>: #ReadyToBeAMiller, #FinallyFisher, #MeetTheMatthews</li>
            <li><strong>Plays on wedding phrases</strong>: #ToHaveAndToHarris, #ForeverYoung</li>
            <li><strong>Rhyming hashtags</strong>: #GettinHitchedWithHutchinson, #CantWaitToBeCampbell</li>
            <li><strong>Date-based hashtags</strong>: #SmithJones06042025, #BecomingBrown2025</li>
          </ul>
          <p className="mt-2">The most memorable hashtags are often those that incorporate a clever play on words related to your names.</p>
        </>
      )
    }
  ];
};

// Location-specific FAQs
const getLocationFAQs = (stateSlug?: string, citySlug?: string): FAQItem[] => {
  if (!stateSlug) return [];
  
  // Import location data
  const { getState, getCity } = require('@/config/hashtag-locations');
  
  const state = getState(stateSlug);
  if (!state) return [];
  
  const city = citySlug ? getCity(stateSlug, citySlug) : null;
  
  const locationFAQs: FAQItem[] = [];
  
  // Add state-specific FAQ
  locationFAQs.push({
    question: `What are popular wedding hashtag trends in ${state.name}?`,
    answer: (
      <>
        <p className="mb-2">Wedding hashtags in {state.name} often incorporate:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Local themes like {state.weddingStats.popularThemes.join(', ')}</li>
          <li>State abbreviation ({state.abbreviation}) in the hashtag</li>
          <li>References to state nicknames or famous landmarks</li>
          <li>Seasonal references based on the peak wedding season ({state.weddingStats.peakSeason})</li>
        </ul>
        <p className="mt-2">Couples in {state.name} often create hashtags that reflect the local culture and wedding traditions unique to the region.</p>
      </>
    )
  });
  
  // Add city-specific FAQ if city is provided
  if (city) {
    locationFAQs.push({
      question: `How can I incorporate ${city.name} into my wedding hashtag?`,
      answer: (
        <>
          <p className="mb-2">There are several ways to incorporate {city.name} into your wedding hashtag:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Use the city name directly: #SmithJones{city.name.replace(/\s+/g, '')}</li>
            <li>Reference local landmarks: #{city.localLandmarks[0].replace(/\s+/g, '')}Wedding</li>
            <li>Use local nicknames: #{city.localNicknames[0].replace(/\s+/g, '')}Wedding</li>
            <li>Incorporate popular venues: #{city.popularVenues[0].replace(/\s+/g, '')}Couple</li>
            <li>Create location puns: #Getting{city.name.replace(/\s+/g, '')}Married</li>
          </ul>
          <p className="mt-2">{city.name} offers unique opportunities for creative and memorable wedding hashtags that highlight your connection to this special location.</p>
        </>
      )
    });
    
    locationFAQs.push({
      question: `What are the most popular wedding venues in ${city.name} for hashtag-worthy photos?`,
      answer: (
        <>
          <p className="mb-2">The most Instagram-worthy wedding venues in {city.name} include:</p>
          <ul className="list-disc list-inside space-y-1">
            {city.popularVenues.map((venue, index) => (
              <li key={index}><strong>{venue}</strong> - Perfect for #{venue.replace(/\s+/g, '')}Wedding hashtags</li>
            ))}
          </ul>
          <p className="mt-2">These venues not only provide beautiful backdrops for wedding photos but also have name recognition that can make your wedding hashtag more meaningful and memorable.</p>
        </>
      )
    });
  }
  
  return locationFAQs;
};

export default HashtagFAQ;
