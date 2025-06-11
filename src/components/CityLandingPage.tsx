import React from 'react';
import { CityData, generateCityMetaDescription, generateCityKeywords } from '@/config/cities';
import { SEOHead } from '@/components/SEOHead';
import { SchemaMarkup } from '@/components/SchemaMarkup';
import { Breadcrumbs } from '@/components/SEO/Breadcrumbs';
import { CategoryFAQ } from '@/components/SEO/CategoryFAQ';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Calendar, DollarSign, Heart, Users, Camera, Music } from 'lucide-react';

interface CityLandingPageProps {
  city: CityData;
  category?: string;
  vendors?: any[];
  totalVendors?: number;
}

export const CityLandingPage: React.FC<CityLandingPageProps> = ({
  city,
  category,
  vendors = [],
  totalVendors = 0
}) => {
  const categoryText = category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Wedding Vendors';
  const pageTitle = `${totalVendors || 'Top'} Best ${categoryText} in ${city.name}, ${city.stateCode}`;
  const metaDescription = generateCityMetaDescription(city, category);
  const keywords = generateCityKeywords(city, category);

  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'photographers': return <Camera className="h-5 w-5" />;
      case 'venues': return <MapPin className="h-5 w-5" />;
      case 'djs-and-bands': return <Music className="h-5 w-5" />;
      case 'florists': return <Heart className="h-5 w-5" />;
      default: return <Star className="h-5 w-5" />;
    }
  };

  const getTierBadgeColor = (tier: number) => {
    switch (tier) {
      case 1: return 'bg-gold text-gold-foreground';
      case 2: return 'bg-silver text-silver-foreground';
      case 3: return 'bg-bronze text-bronze-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getCategoryBadgeColor = (cat: string) => {
    switch (cat) {
      case 'major-market': return 'bg-blue-100 text-blue-800';
      case 'destination': return 'bg-purple-100 text-purple-800';
      case 'regional-hub': return 'bg-green-100 text-green-800';
      case 'emerging': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        customTitle={pageTitle}
        customDescription={metaDescription}
        customKeywords={keywords}
        city={city.name}
        state={city.stateCode}
        category={category}
        canonicalUrl={`https://findmyweddingvendor.com/city/${city.name.toLowerCase().replace(/\s+/g, '-')}/${city.stateCode.toLowerCase()}${category ? `/${category}` : ''}`}
      />
      
      <SchemaMarkup
        city={city.name}
        state={city.stateCode}
        category={category}
        vendors={vendors}
        totalListings={totalVendors}
        isHomePage={false}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          city={city.name}
          state={city.stateCode}
          category={category}
          className="mb-6"
        />

        {/* Hero Section */}
        <div className="mb-12">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge className={getTierBadgeColor(city.tier)}>
              Tier {city.tier}
            </Badge>
            <Badge className={getCategoryBadgeColor(city.category)}>
              {city.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {pageTitle}
          </h1>
          
          <p className="text-xl text-muted-foreground mb-6 max-w-3xl">
            {city.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-5 w-5" />
              <span>{city.name}, {city.state}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-5 w-5" />
              <span>{city.averageBudget}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-5 w-5" />
              <span>Best: {city.weddingSeasons.join(', ')}</span>
            </div>
          </div>

          {category && (
            <Button size="lg" className="mb-8">
              {getCategoryIcon(category)}
              <span className="ml-2">Find {categoryText} in {city.name}</span>
            </Button>
          )}
        </div>

        {/* City Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Why Choose This City */}
            <Card>
              <CardHeader>
                <CardTitle>Why Choose {city.name} for Your Wedding?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {city.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-primary" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Popular Venues */}
            <Card>
              <CardHeader>
                <CardTitle>Popular Wedding Venues in {city.name}</CardTitle>
                <CardDescription>
                  Discover the most sought-after wedding venues that make {city.name} special
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {city.popularVenues.map((venue, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{venue}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Wedding Specialties */}
            <Card>
              <CardHeader>
                <CardTitle>{city.name} Wedding Specialties</CardTitle>
                <CardDescription>
                  What makes weddings in {city.name} unique and memorable
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {city.specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Vendor Statistics */}
            {totalVendors > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Wedding Vendor Statistics</CardTitle>
                  <CardDescription>
                    Current vendor availability in {city.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{totalVendors}</div>
                      <div className="text-sm text-muted-foreground">Total Vendors</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{vendors.length}</div>
                      <div className="text-sm text-muted-foreground">Available Now</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">4.8</div>
                      <div className="text-sm text-muted-foreground">Avg Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">24h</div>
                      <div className="text-sm text-muted-foreground">Response Time</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Facts */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Facts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="font-medium">Location</div>
                  <div className="text-sm text-muted-foreground">{city.name}, {city.state}</div>
                </div>
                <div>
                  <div className="font-medium">Market Tier</div>
                  <div className="text-sm text-muted-foreground">Tier {city.tier}</div>
                </div>
                <div>
                  <div className="font-medium">Category</div>
                  <div className="text-sm text-muted-foreground">
                    {city.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                </div>
                <div>
                  <div className="font-medium">Best Seasons</div>
                  <div className="text-sm text-muted-foreground">{city.weddingSeasons.join(', ')}</div>
                </div>
                <div>
                  <div className="font-medium">Average Budget</div>
                  <div className="text-sm text-muted-foreground">{city.averageBudget}</div>
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <Card>
              <CardHeader>
                <CardTitle>Ready to Plan Your Wedding?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect with top-rated wedding vendors in {city.name} and start planning your perfect day.
                </p>
                <Button className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Browse All Vendors
                </Button>
              </CardContent>
            </Card>

            {/* Related Cities */}
            <Card>
              <CardHeader>
                <CardTitle>Similar Wedding Destinations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {/* This would be populated with similar cities */}
                  <div className="text-sm text-muted-foreground">
                    Explore other {city.category.replace('-', ' ')} wedding destinations
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        {category && (
          <div className="mb-12">
            <CategoryFAQ
              category={category}
              city={city.name}
              state={city.stateCode}
              className="max-w-4xl"
            />
          </div>
        )}

        {/* Local SEO Content */}
        <div className="bg-muted rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">
            Wedding Planning in {city.name}, {city.state}
          </h2>
          <div className="prose prose-gray max-w-none">
            <p>
              Planning a wedding in {city.name} offers couples access to {city.description.toLowerCase()} 
              With an average wedding budget of {city.averageBudget}, couples can expect to find 
              {category ? ` exceptional ${category.toLowerCase()}` : ' top-quality vendors'} that 
              specialize in {city.specialties.slice(0, 3).join(', ')}.
            </p>
            <p>
              The best time to get married in {city.name} is during {city.weddingSeasons.join(' and ')}, 
              when the weather is ideal and venues are at their most beautiful. Popular venues include 
              {city.popularVenues.slice(0, 3).join(', ')}, each offering unique settings for your special day.
            </p>
            <p>
              What sets {city.name} apart as a wedding destination is its {city.highlights.slice(0, 2).join(' and ').toLowerCase()}. 
              Whether you're planning an intimate ceremony or a grand celebration, {city.name} provides 
              the perfect backdrop for creating lasting memories.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CityLandingPage;
