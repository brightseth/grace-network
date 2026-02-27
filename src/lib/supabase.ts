import { createClient } from '@supabase/supabase-js';

// Create a Supabase client - this should only be used on the client side
export const createSupabaseClient = () => {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    console.error('Missing env.PUBLIC_SUPABASE_URL');
    return null;
  }
  if (!supabaseAnonKey) {
    console.error('Missing env.PUBLIC_SUPABASE_ANON_KEY');
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
};

// For server-side only usage
let _supabaseClient: ReturnType<typeof createClient> | null = null;

export const supabase = () => {
  if (typeof window !== 'undefined') {
    // In browser context, always create a new client
    return createSupabaseClient();
  }
  
  // In server context, reuse the client
  if (!_supabaseClient) {
    _supabaseClient = createSupabaseClient();
  }
  return _supabaseClient;
};