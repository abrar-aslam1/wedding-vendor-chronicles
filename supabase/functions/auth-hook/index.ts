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
    const { event, record } = await req.json();
    
    // Only process user signup events
    if (event !== 'user.created') {
      return new Response(JSON.stringify({ success: true, message: 'Event not processed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Add user registration notification to queue
    const { error } = await supabase
      .from('admin_notification_queue')
      .insert({
        notification_type: 'user_registration',
        data: {
          email: record.email,
          created_at: record.created_at,
          email_confirmed_at: record.email_confirmed_at,
          last_sign_in_at: record.last_sign_in_at,
          app_metadata: record.app_metadata
        }
      });

    if (error) {
      throw error;
    }

    console.log(`User registration notification queued for: ${record.email}`);

    return new Response(
      JSON.stringify({ success: true, message: 'User registration notification queued' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error processing auth hook:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});