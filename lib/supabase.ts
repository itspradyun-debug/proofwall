import { createClient } from '@supabase/supabase-js';

// Both values are public by design (the publishable key is safe in the browser;
// row-level security in the database does the protecting).
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vblmuayawlcyxcmnnses.supabase.co';
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_l3p4p_GHul3SXH444NcwWQ_FqYa42aF';

export const BUCKET = 'testimonial-videos';
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
