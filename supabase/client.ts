import { createClient } from '@jsr/supabase__supabase-js'

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

if (!supabaseKey) {
  throw new Error('Missing SUPABASE_KEY environment variable');
}

export const supabase = createClient(
    supabaseUrl,
    supabaseKey,
)

export default supabase