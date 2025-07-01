import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wpbdveyuuudhmwflrmqw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzg0MzI2NiwiZXhwIjoyMDUzNDE5MjY2fQ.pSd3_JelUGL-hO-gdLM7FWW1br71EOIcOizLqi61svM';

const supabase = createClient(supabaseUrl, supabaseKey);

// Check for Dallas photographers
const { data, error } = await supabase
  .from('instagram_vendors')
  .select('business_name, city, state')
  .eq('category', 'photographers')
  .ilike('city', '%Dallas%')
  .limit(10);

if (error) {
  console.error('Error:', error);
} else {
  console.log(`Found ${data.length} Dallas photographers:`);
  if (data.length === 0) {
    // Check all Texas cities
    const { data: txData } = await supabase
      .from('instagram_vendors')
      .select('city')
      .eq('category', 'photographers')
      .eq('state', 'TX')
      .limit(100);
    
    if (txData) {
      const cities = [...new Set(txData.map(v => v.city))];
      console.log('\nTexas cities with photographers:', cities);
    }
  } else {
    data.forEach(vendor => {
      console.log(`- ${vendor.business_name} (${vendor.city}, ${vendor.state})`);
    });
  }
}