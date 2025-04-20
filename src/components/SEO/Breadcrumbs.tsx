import React from 'react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path: string;
  isLast: boolean;
}

interface BreadcrumbsProps {
  category?: string;
  subcategory?: string;
  city?: string;
  state?: string;
  vendorName?: string;
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  category,
  subcategory,
  city,
  state,
  vendorName,
  className = ''
}) => {
  const formatText = (text: string) => {
    return text
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Build breadcrumb items array
  const breadcrumbs: BreadcrumbItem[] = [
    {
      label: 'Home',
      path: '/',
      isLast: !category && !city && !state && !vendorName
    }
  ];

  // Add category if provided
  if (category) {
    const formattedCategory = formatText(category);
    breadcrumbs.push({
      label: formattedCategory,
      path: `/search/${category}`,
      isLast: !subcategory && !city && !state && !vendorName
    });
  }

  // Add subcategory if provided
  if (category && subcategory) {
    const formattedSubcategory = formatText(subcategory);
    breadcrumbs.push({
      label: formattedSubcategory,
      path: `/search/${category}?subcategory=${subcategory}`,
      isLast: !city && !state && !vendorName
    });
  }

  // Add state if provided
  if (state) {
    breadcrumbs.push({
      label: state,
      path: `/states/${state.toLowerCase()}`,
      isLast: !city && !category && !vendorName
    });
  }

  // Add city if provided
  if (city && state) {
    const cityStatePath = category 
      ? `/top-20/${category}/${city}/${state}`
      : `/states/${state.toLowerCase()}/${city.toLowerCase()}`;
    
    breadcrumbs.push({
      label: city,
      path: cityStatePath,
      isLast: !vendorName
    });
  }

  // Add vendor name if provided
  if (vendorName) {
    breadcrumbs.push({
      label: vendorName,
      path: '', // Current page, no link needed
      isLast: true
    });
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
