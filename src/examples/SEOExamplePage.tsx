import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  SEOHead, 
  SchemaMarkup, 
  CategoryFAQ, 
  Breadcrumbs 
} from '@/components/SEO';
import { SearchResult } from '@/types/search';
import { searchVendors } from '@/utils/dataForSeoApi';

/**
 * This is an example page that demonstrates how to use all the SEO components together.
 * It's not meant to be used in production, but rather as a reference for how to implement
 * these components on your own pages.
 */
const SEOExamplePage: React.FC = () => {
  const { category, city, state, subcategory } = useParams<{
    category: string;
    city: string;
    state: string;
    subcategory?: string;
  }>();
  
  const [vendors, setVendors] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        if (category && city && state) {
          setLoading(true);
          const results = await searchVendors(category, `${city}, ${state}`);
          setVendors(results);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching vendors:', err);
        setError('Failed to load vendors. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchVendors();
  }, [category, city, state]);
  
  // Format the category and location for display
  const formatText = (text: string) => {
    return text
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  const formattedCategory = category ? formatText(category) : '';
  const formattedSubcategory = subcategory ? formatText(subcategory) : '';
  const locationString = city && state ? `in ${city}, ${state}` : '';
  
  // Generate a canonical URL for this page
  const canonicalUrl = subcategory
    ? `https://findmyweddingvendor.com/top-20/${category}/${subcategory}/${city}/${state}`
    : `https://findmyweddingvendor.com/top-20/${category}/${city}/${state}`;
  
  // Generate an image URL for this page (example)
  const imageUrl = vendors[0]?.main_image || 'https://findmyweddingvendor.com/og-image.png';
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* SEO Head Component - Manages all meta tags */}
      <SEOHead
        category={category}
        city={city}
        state={state}
        subcategory={subcategory}
        totalVendors={vendors.length}
        imageUrl={imageUrl}
        canonicalUrl={canonicalUrl}
      />
      
      {/* Schema Markup Component - Adds structured data */}
      <SchemaMarkup
        category={category}
        city={city}
        state={state}
        vendors={vendors}
        totalListings={vendors.length}
        subcategory={subcategory}
      />
      
      {/* Breadcrumbs Component - Adds navigation and structured data */}
      <Breadcrumbs
        category={category}
        subcategory={subcategory}
        city={city}
        state={state}
        className="mb-6"
      />
      
      {/* Page Content */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Top {vendors.length} {formattedSubcategory} {formattedCategory} {locationString}
        </h1>
        <p className="text-gray-600">
          Find and compare the best {formattedSubcategory.toLowerCase()} {formattedCategory.toLowerCase()} {locationString} for your wedding day.
        </p>
      </header>
      
      {/* Main Content */}
      <main>
        {loading ? (
          <p>Loading vendors...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            {/* Vendor List */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">
                {formattedSubcategory} {formattedCategory} in {city}, {state}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vendors.map((vendor, index) => (
                  <div key={index} className="border rounded-lg p-4 shadow-sm">
                    {vendor.main_image && (
                      <img 
                        src={vendor.main_image} 
                        alt={vendor.title} 
                        className="w-full h-48 object-cover rounded-md mb-3"
                      />
                    )}
                    <h3 className="text-xl font-semibold mb-2">{vendor.title}</h3>
                    {vendor.rating && (
                      <div className="flex items-center mb-2">
                        <span className="text-yellow-500 mr-1">★</span>
                        <span>{vendor.rating.value} ({vendor.rating.votes_count} reviews)</span>
                      </div>
                    )}
                    <p className="text-gray-600 mb-2">{vendor.address}</p>
                    <p className="text-gray-700 mb-3">{vendor.snippet}</p>
                    {vendor.phone && (
                      <p className="text-blue-600">{vendor.phone}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
            
            {/* Introduction Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">
                Finding the Perfect {formattedSubcategory} {formattedCategory} in {city}, {state}
              </h2>
              <div className="prose max-w-none">
                <p>
                  Planning a wedding in {city}, {state} requires finding the right {formattedCategory.toLowerCase()} 
                  who can bring your vision to life. {formattedSubcategory} {formattedCategory.toLowerCase()} 
                  services are particularly popular in this area, known for their exceptional quality and attention to detail.
                </p>
                <p>
                  When choosing a {formattedCategory.toLowerCase()} for your wedding, it's important to consider their experience,
                  portfolio, reviews from past clients, and whether their style matches your vision. Most couples book their
                  {formattedCategory.toLowerCase()} 9-12 months before their wedding date, so it's best to start your search early.
                </p>
                <p>
                  The {formattedCategory.toLowerCase()} listed above represent the top options in {city}, {state}, based on
                  reviews, ratings, and overall quality of service. Each brings their unique style and approach to weddings,
                  ensuring you can find the perfect match for your special day.
                </p>
              </div>
            </section>
            
            {/* FAQ Section with CategoryFAQ Component */}
            <CategoryFAQ
              category={category}
              city={city}
              state={state}
              subcategory={subcategory}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default SEOExamplePage;
