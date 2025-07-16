#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wpbdveyuuudhmwflrmqw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzg0MzI2NiwiZXhwIjoyMDUzNDE5MjY2fQ.pSd3_JelUGL-hO-gdLM7FWW1br71EOIcOizLqi61svM';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Sample cart vendors for demonstration
const sampleCartVendors = [
  {
    place_id: 'cart_coffee_la_1',
    business_name: 'Brew & Bean Mobile Coffee Cart',
    category: 'carts',
    city: 'Los Angeles',
    state: 'California',
    state_code: 'CA',
    address: '123 Wedding Way, Los Angeles, CA 90001',
    phone: '(310) 555-0100',
    website_url: 'https://brewandbeancart.com',
    email: 'hello@brewandbeancart.com',
    rating: { value: { value: 4.8 }, reviews: 125 },
    description: 'Premium mobile coffee cart service specializing in weddings. We bring artisanal coffee, espresso drinks, and specialty beverages to your special day.',
    images: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085'],
    price_range: '$$',
    latitude: 34.0522,
    longitude: -118.2437,
    reviews_count: 125,
    data_source: 'google_maps'
  },
  {
    place_id: 'cart_matcha_sf_1',
    business_name: 'Zen Matcha Mobile Bar',
    category: 'carts',
    city: 'San Francisco',
    state: 'California',
    state_code: 'CA',
    address: '456 Union Street, San Francisco, CA 94133',
    phone: '(415) 555-0200',
    website_url: 'https://zenmatchabar.com',
    email: 'info@zenmatchabar.com',
    rating: { value: { value: 4.9 }, reviews: 89 },
    description: 'Authentic Japanese matcha cart bringing ceremonial-grade matcha lattes, matcha cocktails, and traditional tea service to Bay Area weddings.',
    images: ['https://images.unsplash.com/photo-1536256263959-770b48d82b0a'],
    price_range: '$$$',
    latitude: 37.7749,
    longitude: -122.4194,
    reviews_count: 89,
    data_source: 'google_maps'
  },
  {
    place_id: 'cart_cocktail_dallas_1',
    business_name: 'The Rolling Bar Co.',
    category: 'carts',
    city: 'Dallas',
    state: 'Texas',
    state_code: 'TX',
    address: '789 Main Street, Dallas, TX 75201',
    phone: '(214) 555-0300',
    website_url: 'https://rollingbarco.com',
    email: 'events@rollingbarco.com',
    rating: { value: { value: 4.7 }, reviews: 210 },
    description: 'Vintage-style mobile cocktail cart service. Craft cocktails, premium spirits, and professional bartenders for your wedding celebration.',
    images: ['https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b'],
    price_range: '$$$',
    latitude: 32.7767,
    longitude: -96.7970,
    reviews_count: 210,
    data_source: 'google_maps'
  },
  {
    place_id: 'cart_dessert_miami_1',
    business_name: 'Sweet Wheels Dessert Cart',
    category: 'carts',
    city: 'Miami',
    state: 'Florida',
    state_code: 'FL',
    address: '321 Ocean Drive, Miami, FL 33139',
    phone: '(305) 555-0400',
    website_url: 'https://sweetwheelscart.com',
    email: 'book@sweetwheelscart.com',
    rating: { value: { value: 4.6 }, reviews: 156 },
    description: 'Mobile dessert cart featuring artisanal ice cream, gelato, macarons, and custom wedding treats. Perfect for cocktail hours and receptions.',
    images: ['https://images.unsplash.com/photo-1488900128323-21503983a07e'],
    price_range: '$$',
    latitude: 25.7617,
    longitude: -80.1918,
    reviews_count: 156,
    data_source: 'google_maps'
  },
  {
    place_id: 'cart_champagne_nyc_1',
    business_name: 'Bubbles & Bliss Mobile Bar',
    category: 'carts',
    city: 'New York',
    state: 'New York',
    state_code: 'NY',
    address: '555 Fifth Avenue, New York, NY 10001',
    phone: '(212) 555-0500',
    website_url: 'https://bubblesandbliss.nyc',
    email: 'events@bubblesandbliss.nyc',
    rating: { value: { value: 4.9 }, reviews: 324 },
    description: 'Luxury champagne and prosecco cart service. Featuring premium sparkling wines, signature cocktails, and elegant mobile bar setups for weddings.',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64'],
    price_range: '$$$$',
    latitude: 40.7128,
    longitude: -74.0060,
    reviews_count: 324,
    data_source: 'google_maps'
  },
  {
    place_id: 'cart_tea_austin_1',
    business_name: 'The Tea Trolley',
    category: 'carts',
    city: 'Austin',
    state: 'Texas',
    state_code: 'TX',
    address: '222 Congress Ave, Austin, TX 78701',
    phone: '(512) 555-0600',
    website_url: 'https://teatrolleyaustin.com',
    email: 'hello@teatrolleyaustin.com',
    rating: { value: { value: 4.5 }, reviews: 98 },
    description: 'Vintage tea cart service offering high tea, bubble tea, and specialty tea cocktails. Perfect for garden weddings and afternoon receptions.',
    images: ['https://images.unsplash.com/photo-1571934811356-5cc061b6821f'],
    price_range: '$$',
    latitude: 30.2672,
    longitude: -97.7431,
    reviews_count: 98,
    data_source: 'google_maps'
  },
  {
    place_id: 'cart_hotchocolate_denver_1',
    business_name: 'Cocoa Cart Co.',
    category: 'carts',
    city: 'Denver',
    state: 'Colorado',
    state_code: 'CO',
    address: '888 Larimer Street, Denver, CO 80202',
    phone: '(303) 555-0700',
    website_url: 'https://cocoacartco.com',
    email: 'weddings@cocoacartco.com',
    rating: { value: { value: 4.7 }, reviews: 145 },
    description: 'Gourmet hot chocolate and coffee cart perfect for mountain and winter weddings. Features artisanal hot chocolates, coffees, and seasonal drinks.',
    images: ['https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed'],
    price_range: '$$',
    latitude: 39.7392,
    longitude: -104.9903,
    reviews_count: 145,
    data_source: 'google_maps'
  },
  {
    place_id: 'cart_lemonade_phoenix_1',
    business_name: 'Sunshine Sips Mobile Bar',
    category: 'carts',
    city: 'Phoenix',
    state: 'Arizona',
    state_code: 'AZ',
    address: '999 Camelback Road, Phoenix, AZ 85013',
    phone: '(602) 555-0800',
    website_url: 'https://sunshinesips.com',
    email: 'book@sunshinesips.com',
    rating: { value: { value: 4.6 }, reviews: 178 },
    description: 'Refreshing lemonade and juice cart specializing in fresh-squeezed beverages, mocktails, and signature wedding drinks for outdoor celebrations.',
    images: ['https://images.unsplash.com/photo-1621263764928-df1444c5e859'],
    price_range: '$$',
    latitude: 33.4484,
    longitude: -112.0740,
    reviews_count: 178,
    data_source: 'google_maps'
  }
];

async function addSampleCartVendors() {
  console.log('🛒 Adding sample cart vendors to database...\n');
  
  try {
    // Insert vendors
    const { data, error } = await supabase
      .from('vendors_google')
      .upsert(sampleCartVendors, { 
        onConflict: 'place_id',
        ignoreDuplicates: false 
      });

    if (error) {
      console.error('❌ Error inserting vendors:', error);
      return;
    }

    console.log(`✅ Successfully added ${sampleCartVendors.length} sample cart vendors!\n`);
    
    // List the vendors added
    console.log('📋 Added vendors:');
    sampleCartVendors.forEach(vendor => {
      console.log(`   - ${vendor.business_name} (${vendor.city}, ${vendor.state})`);
    });
    
    console.log('\n🎉 Cart vendors are now available in your database!');
    console.log('Users can search for "carts" on your website to find these vendors.');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

// Run the script
addSampleCartVendors();