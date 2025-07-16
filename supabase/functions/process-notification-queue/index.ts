import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get unprocessed notifications
    const { data: notifications, error } = await supabase
      .from('admin_notification_queue')
      .select('*')
      .eq('processed', false)
      .order('created_at', { ascending: true })
      .limit(10);

    if (error) {
      throw error;
    }

    let processedCount = 0;
    let failedCount = 0;

    for (const notification of notifications || []) {
      try {
        // Call the send-admin-notification function
        const { error: emailError } = await supabase.functions.invoke('send-admin-notification', {
          body: {
            type: notification.notification_type,
            data: notification.data
          }
        });

        if (emailError) {
          throw emailError;
        }

        // Mark as processed
        await supabase
          .from('admin_notification_queue')
          .update({ processed: true })
          .eq('id', notification.id);

        processedCount++;
        console.log(`Processed notification ${notification.id}`);

      } catch (error) {
        console.error(`Failed to process notification ${notification.id}:`, error);
        failedCount++;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: processedCount, 
        failed: failedCount,
        total: notifications?.length || 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error processing notification queue:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});