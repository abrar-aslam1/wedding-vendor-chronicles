'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MapPin, Users, Camera, Home, Utensils, Music, Palette, Scissors, Heart, Coffee } from 'lucide-react';
import Link from 'next/link';

const vendorCategories = [
  { name: "Photographers", icon: Camera, slug: "photographers", color: "bg-blue-500" },
  { name: "Venues", icon: Home, slug: "venues", color: "bg-green-500" },
  { name: "Caterers", icon: Utensils, slug: "caterers", color: "bg-orange-500" },
  { name: "DJs & Bands", icon: Music, slug: "djs-and-bands", color: "bg-purple-500" },
  { name: "Florists", icon: Palette, slug: "florists", color: "bg-pink-500" },
  { name: "Hair Stylists", icon: Scissors, slug: "hair-stylists", color: "bg-yellow-500" },
  { name: "Makeup Artists", icon: Heart, slug: "makeup-artists", color: "bg-red-500" },
  { name: "Wedding Planners", icon: Users, slug: "wedding-planners", color: "bg-indigo-500" },
  { name: "Wedding Decorators", icon: Palette, slug: "wedding-decorators", color: "bg-teal-500" },
  { name: "Carts", icon: Coffee, slug: "carts", color: "bg-amber-500" },
];

interface StateDetailClientProps {
  stateName: string;
  stateSlug: string;
  vendorCount: number;
  popularCities: string[];
}

export function StateDetailClient({ stateName, stateSlug, vendorCount, popularCities }: StateDetailClientProps) {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-wedding-text mb-4">
          Wedding Vendors in {stateName}
        </h1>
        <p className="text-gray-600 text-lg mb-6">
          Choose what you're looking for and where you want to find it
        </p>
        <div className="flex justify-center items-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{vendorCount.toLocaleString()} vendors</span>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span>{popularCities.length} cities</span>
          </div>
        </div>
      </div>

      {/* Main Cities Selection */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-wedding-text mb-6 text-center">
          Choose a city in {stateName}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {popularCities.map((city) => (
            <Link
              key={city}
              href={`/states/${stateSlug}/${city.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="p-4 flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-wedding-primary flex-shrink-0" />
                  <span className="font-medium text-sm">{city}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Vendor Categories */}
      <div>
        <h2 className="text-2xl font-semibold text-wedding-text mb-6 text-center">
          Browse by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {vendorCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Link
                key={category.slug}
                href={`/top-20/${category.slug}/all-cities/${stateSlug}`}
              >
                <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
                  <CardHeader className="p-4">
                    <div className={`${category.color} w-12 h-12 rounded-full flex items-center justify-center mb-2 mx-auto`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-sm font-semibold text-center text-wedding-text">
                      {category.name}
                    </h3>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
