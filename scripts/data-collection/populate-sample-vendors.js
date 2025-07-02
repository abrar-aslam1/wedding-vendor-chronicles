import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  console.error('Required: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Sample vendor data for testing the flow
const sampleVendors = [
  // Alabama vendors
  {
    business_name: "Birmingham Wedding Photography",
    description: "Professional wedding photography serving Birmingham and surrounding areas. Capturing your special moments with artistic flair.",
    contact_info: {
      email: "info@birminghamweddings.com",
      phone: "205-555-0123",
      website: "https://birminghamweddings.com"
    },
    category: "photographers",
    city: "Birmingham",
    state: "Alabama",
    images: ["https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800"]
  },
  {
    business_name: "Montgomery Event Venues",
    description: "Elegant wedding venues in the heart of Montgomery. Historic charm meets modern amenities.",
    contact_info: {
      email: "events@montgomeryvenues.com",
      phone: "334-555-0456",
      website: "https://montgomeryvenues.com"
    },
    category: "venues",
    city: "Montgomery",
    state: "Alabama",
    images: ["https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800"]
  },
  {
    business_name: "Mobile Bay Catering",
    description: "Exquisite catering services for weddings and special events. Fresh, local ingredients and exceptional service.",
    contact_info: {
      email: "catering@mobilebay.com",
      phone: "251-555-0789",
      website: "https://mobilebaycatering.com"
    },
    category: "caterers",
    city: "Mobile",
    state: "Alabama",
    images: ["https://images.unsplash.com/photo-1555244162-803834f70033?w=800"]
  },
  {
    business_name: "Alabama Wedding Planners",
    description: "Full-service wedding planning throughout Alabama. Making your dream wedding a reality.",
    contact_info: {
      email: "plan@alabamaweddings.com",
      phone: "205-555-0321",
      website: "https://alabamaweddings.com"
    },
    category: "wedding planners",
    city: "Birmingham",
    state: "Alabama",
    images: ["https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800"]
  },
  {
    business_name: "Southern Blooms Florist",
    description: "Beautiful wedding florals with a Southern touch. Custom arrangements for your special day.",
    contact_info: {
      email: "flowers@southernblooms.com",
      phone: "334-555-0654",
      website: "https://southernblooms.com"
    },
    category: "florists",
    city: "Montgomery",
    state: "Alabama",
    images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800"]
  },

  // Texas vendors
  {
    business_name: "Dallas Dream Photography",
    description: "Award-winning wedding photographers in Dallas. Capturing love stories with cinematic style.",
    contact_info: {
      email: "hello@dallasdream.com",
      phone: "214-555-0111",
      website: "https://dallasdream.com"
    },
    category: "photographers",
    city: "Dallas",
    state: "Texas",
    images: ["https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800"]
  },
  {
    business_name: "Austin Wedding Venues",
    description: "Unique wedding venues in Austin. From rustic barns to modern lofts.",
    contact_info: {
      email: "venues@austinweddings.com",
      phone: "512-555-0222",
      website: "https://austinweddings.com"
    },
    category: "venues",
    city: "Austin",
    state: "Texas",
    images: ["https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800"]
  },
  {
    business_name: "Houston Gourmet Catering",
    description: "Luxury catering services for Houston weddings. International cuisine with Texas hospitality.",
    contact_info: {
      email: "catering@houstongourmet.com",
      phone: "713-555-0333",
      website: "https://houstongourmet.com"
    },
    category: "caterers",
    city: "Houston",
    state: "Texas",
    images: ["https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800"]
  },

  // California vendors
  {
    business_name: "LA Wedding Studios",
    description: "Hollywood-style wedding photography in Los Angeles. Glamorous and timeless.",
    contact_info: {
      email: "studio@laweddings.com",
      phone: "323-555-0444",
      website: "https://laweddings.com"
    },
    category: "photographers",
    city: "Los Angeles",
    state: "California",
    images: ["https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800"]
  },
  {
    business_name: "San Francisco Bay Venues",
    description: "Stunning waterfront wedding venues with Golden Gate views.",
    contact_info: {
      email: "events@sfbayvenues.com",
      phone: "415-555-0555",
      website: "https://sfbayvenues.com"
    },
    category: "venues",
    city: "San Francisco",
    state: "California",
    images: ["https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800"]
  },

  // New York vendors
  {
    business_name: "NYC Wedding Photography",
    description: "Urban wedding photography in the heart of New York City. Capturing love in the city that never sleeps.",
    contact_info: {
      email: "photos@nycweddings.com",
      phone: "212-555-0666",
      website: "https://nycweddings.com"
    },
    category: "photographers",
    city: "New York",
    state: "New York",
    images: ["https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=800"]
  },
  {
    business_name: "Manhattan Event Spaces",
    description: "Elegant wedding venues in Manhattan. From rooftop terraces to historic ballrooms.",
    contact_info: {
      email: "events@manhattanspaces.com",
      phone: "212-555-0777",
      website: "https://manhattanspaces.com"
    },
    category: "venues",
    city: "New York",
    state: "New York",
    images: ["https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800"]
  }
];

async function populateSampleVendors() {
  try {
    console.log('🚀 Starting sample vendor population...');
    
    // First, get a valid owner_id from existing data
    const { data: existingVendor } = await supabase
      .from('vendors')
      .select('owner_id')
      .limit(1)
      .single();
    
    if (!existingVendor) {
      console.error('❌ No existing vendors found. Need at least one vendor to get owner_id.');
      return;
    }
    
    const ownerId = existingVendor.owner_id;
    console.log(`📋 Using owner_id: ${ownerId}`);
    
    // Prepare vendors with the valid owner_id
    const vendorsToInsert = sampleVendors.map(vendor => ({
      ...vendor,
      owner_id: ownerId
    }));
    
    console.log(`📦 Inserting ${vendorsToInsert.length} sample vendors...`);
    
    // Insert vendors in batches
    const batchSize = 5;
    let insertedCount = 0;
    
    for (let i = 0; i < vendorsToInsert.length; i += batchSize) {
      const batch = vendorsToInsert.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('vendors')
        .insert(batch)
        .select();
      
      if (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error.message);
        continue;
      }
      
      insertedCount += data?.length || 0;
      console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(vendorsToInsert.length / batchSize)} (${data?.length || 0} vendors)`);
    }
    
    console.log(`🎉 Successfully inserted ${insertedCount} sample vendors!`);
    
    // Now update location metadata
    console.log('📊 Updating location metadata...');
    
    // Re-run the location metadata population
    const { spawn } = await import('child_process');
    const populateProcess = spawn('node', ['scripts/data-collection/populate-location-metadata.js'], {
      stdio: 'inherit'
    });
    
    populateProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Location metadata updated successfully!');
        console.log('');
        console.log('🎯 Summary:');
        console.log(`   - Sample vendors inserted: ${insertedCount}`);
        console.log('   - States covered: Alabama, Texas, California, New York');
        console.log('   - Categories: photographers, venues, caterers, wedding planners, florists');
        console.log('');
        console.log('🚀 The states page flow should now work properly!');
      } else {
        console.log('⚠️  Location metadata update completed with warnings');
      }
    });
    
  } catch (error) {
    console.error('❌ Error populating sample vendors:', error.message);
    process.exit(1);
  }
}

// Run the population script
populateSampleVendors();
