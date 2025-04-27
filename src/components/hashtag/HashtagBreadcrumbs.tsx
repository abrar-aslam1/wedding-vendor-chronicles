import React from 'react';
import { Link } from 'react-router-dom';
import { getState, getCity } from '@/config/hashtag-locations';

interface HashtagBreadcrumbsProps {
  stateSlug?: string;
  citySlug?: string;
  className?: string;
}

interface BreadcrumbItem {
  label: string;
  path: string;
  isLast: boolean;
}

export const HashtagBreadcrumbs: React.FC<HashtagBreadcrumbsProps> = ({
  stateSlug,
  citySlug,
  className = ''
}) => {
  // Build breadcrumb items array
  const breadcrumbs: BreadcrumbItem[] = [
    {
      label: 'Home',
      path: '/',
      isLast: false
    },
    {
      label: 'Wedding Tools',
      path: '/tools',
      isLast: false
    },
    {
      label: 'Wedding Hashtag Generator',
      path: '/tools/wedding-hashtag-generator',
      isLast: !stateSlug
    }
  ];

  // Add state if provided
  if (stateSlug) {
    const state = getState(stateSlug);
    
    if (state) {
      breadcrumbs.push({
        label: state.name,
        path: `/tools/wedding-hashtag-generator/states/${stateSlug}`,
        isLast: !citySlug
      });
      
      // Add city if provided
      if (citySlug) {
        const city = getCity(stateSlug, citySlug);
        
        if (city) {
          breadcrumbs.push({
            label: city.name,
            path: `/tools/wedding-hashtag-generator/states/${stateSlug}/${citySlug}`,
            isLast: true
          });
        }
      }
    }
  }

  // Ensure the last item is marked as last
  if (breadcrumbs.length > 0) {
    breadcrumbs[breadcrumbs.length - 1].isLast = true;
  }

  return (
    <nav aria-label="Breadcrumb" className={`py-3 ${className}`}>
      <ol className="flex flex-wrap items-center text-sm text-gray-600">
        {breadcrumbs.map((crumb, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-2 text-gray-400" aria-hidden="true">
                /
              </span>
            )}
            
            {crumb.isLast ? (
              <span className="font-medium text-gray-900" aria-current="page">
                {crumb.label}
              </span>
            ) : (
              <Link 
                to={crumb.path} 
                className="hover:text-blue-600 hover:underline"
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
      
      {/* Structured data for breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            'itemListElement': breadcrumbs.map((crumb, index) => ({
              '@type': 'ListItem',
              'position': index + 1,
              'item': {
                '@id': `${window.location.origin}${crumb.path}`,
                'name': crumb.label
              }
            }))
          })
        }}
      />
    </nav>
  );
};

export default HashtagBreadcrumbs;
