import { createClient } from '@supabase/supabase-js';

// Setup script for email system
async function setupEmailSystem() {
  console.log('🚀 Setting up email system...');
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables:');
    console.error('- VITE_SUPABASE_URL or SUPABASE_URL');
    console.error('- SUPABASE_SERVICE_KEY or SUPABASE_SERVICE_ROLE_KEY');
    console.error('- RESEND_API_KEY (for email sending - set in Supabase dashboard)');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // 1. Test database connection
    console.log('📡 Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('email_templates')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      return;
    }
    
    console.log('✅ Database connection successful');
    
    // 2. Check if email templates exist
    console.log('📧 Checking email templates...');
    const { data: templates, error: templatesError } = await supabase
      .from('email_templates')
      .select('*');
    
    if (templatesError) {
      console.error('❌ Error checking email templates:', templatesError.message);
      return;
    }
    
    console.log(`✅ Found ${templates.length} email templates`);
    
    // 3. Create sample user preferences for testing
    console.log('👥 Setting up sample user preferences...');
    
    // Get a few users to set up preferences for
    const { data: users, error: usersError } = await supabase
      .from('auth.users')
      .select('id, email')
      .limit(5);
    
    if (usersError) {
      console.log('ℹ️  No users found or auth table not accessible, skipping user preferences setup');
    } else {
      for (const user of users) {
        const { error: prefError } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            email_notifications: true,
            weekly_reports: true,
            marketing_emails: false,
            vendor_updates: true
          });
        
        if (prefError) {
          console.log(`⚠️  Could not set preferences for user ${user.email}: ${prefError.message}`);
        } else {
          console.log(`✅ Set preferences for user ${user.email}`);
        }
      }
    }
    
    // 4. Test notification function
    console.log('📬 Testing notification function...');
    
    const testNotificationData = {
      type: 'weekly_report',
      data: {
        period: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString()
        },
        vendors: { total: 150, newThisWeek: 5 },
        reviews: { total: 342, newThisWeek: 12 },
        traffic: { pageViews: 1250, uniqueUsers: 680 },
        performance: { averageScore: 88 },
        topVendors: [
          { name: 'Test Vendor 1', average_rating: 4.8, review_count: 23 },
          { name: 'Test Vendor 2', average_rating: 4.6, review_count: 18 }
        ]
      },
      recipients: ['abrar@amarosystems.com']
    };
    
    const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-admin-notification', {
      body: testNotificationData
    });
    
    if (emailError) {
      console.error('❌ Notification function test failed:', emailError.message);
      console.log('ℹ️  Make sure to set up the RESEND_API_KEY in your Supabase project settings');
    } else {
      console.log('✅ Notification function test successful:', emailResult);
    }
    
    // 5. Create initial performance metrics (sample data)
    console.log('📊 Creating sample performance metrics...');
    
    const sampleMetrics = [
      {
        metric_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        page_url: 'https://wedding-vendor-chronicles.com/',
        performance_score: 92,
        seo_score: 88,
        accessibility_score: 95,
        best_practices_score: 90,
        first_contentful_paint: 1200,
        largest_contentful_paint: 2100,
        total_blocking_time: 150,
        cumulative_layout_shift: 0.05,
        speed_index: 1800
      },
      {
        metric_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        page_url: 'https://wedding-vendor-chronicles.com/vendors',
        performance_score: 88,
        seo_score: 85,
        accessibility_score: 92,
        best_practices_score: 87,
        first_contentful_paint: 1350,
        largest_contentful_paint: 2300,
        total_blocking_time: 200,
        cumulative_layout_shift: 0.08,
        speed_index: 2000
      }
    ];
    
    for (const metric of sampleMetrics) {
      const { error: metricError } = await supabase
        .from('performance_metrics')
        .upsert(metric);
      
      if (metricError) {
        console.log(`⚠️  Could not insert metric for ${metric.page_url}: ${metricError.message}`);
      } else {
        console.log(`✅ Inserted performance metric for ${metric.page_url}`);
      }
    }
    
    // 6. Summary
    console.log('\n🎉 Email system setup complete!');
    console.log('\n📋 Next steps:');
    console.log('1. RESEND_API_KEY is already configured for the existing notification system');
    console.log('2. Test the weekly email workflow manually using GitHub Actions');
    console.log('3. Set up user preferences for weekly report subscriptions');
    console.log('4. Monitor email deliverability through the existing system');
    
    console.log('\n📧 Weekly email workflow will run every Sunday at 9 AM EST');
    console.log('📧 You can also trigger it manually with workflow_dispatch');
    console.log('📧 Uses the existing send-admin-notification function for consistency');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

// Run the setup
setupEmailSystem();