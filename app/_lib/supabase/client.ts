import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wpbdveyuuudhmwflrmqw.supabase.co';
  // Use new publishable key (sb_publishable_...) — replaces deprecated legacy JWT anon key
  // See: https://github.com/orgs/supabase/discussions/42949
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    || 'sb_publishable_FFHBhR9e1yxbt-rA_JfGsw_HtyEgdoG';

  return createBrowserClient(supabaseUrl, supabaseKey);
}
