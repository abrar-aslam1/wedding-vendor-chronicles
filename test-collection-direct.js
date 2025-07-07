// Direct test of collection script subcategory functionality
import { VendorCollector } from './scripts/collect-all-vendors.js';

async function testCollectionDirect() {
  console.log('🧪 Testing Collection Script Directly...');
  
  try {
    const collector = new VendorCollector();
    
    // Test the cache checking function directly
    console.log('\n1️⃣ Testing cache check for wedding subcategory...');
    const weddingCached = await collector.checkIfCached('Orlando', 'FL', 'photographer', 'wedding');
    console.log(`Wedding cached: ${weddingCached}`);
    
    console.log('\n2️⃣ Testing cache check for portrait subcategory...');
    const portraitCached = await collector.checkIfCached('Orlando', 'FL', 'photographer', 'portrait');
    console.log(`Portrait cached: ${portraitCached}`);
    
    console.log('\n3️⃣ Testing cache check for no subcategory...');
    const noCached = await collector.checkIfCached('Orlando', 'FL', 'photographer', null);
    console.log(`No subcategory cached: ${noCached}`);
    
    // Test API call function
    console.log('\n4️⃣ Testing API call with portrait subcategory...');
    const apiSuccess = await collector.callVendorAPI('Orlando', 'FL', 'photographer', 'portrait');
    console.log(`API call success: ${apiSuccess}`);
    
    // Wait for cache to be written
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check if portrait is now cached
    console.log('\n5️⃣ Checking if portrait is now cached...');
    const portraitCachedAfter = await collector.checkIfCached('Orlando', 'FL', 'photographer', 'portrait');
    console.log(`Portrait cached after API call: ${portraitCachedAfter}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCollectionDirect();
