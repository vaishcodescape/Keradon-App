import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

if (!process.env.SUPABASE_URL) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

if (!process.env.SUPABASE_ANON_KEY) {
  throw new Error('Missing SUPABASE_ANON_KEY environment variable');
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
); 