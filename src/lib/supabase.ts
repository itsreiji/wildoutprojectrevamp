
import { createClient } from "@jsr/supabase__supabase-js";

// Use environment variables with fallbacks for development
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://yanjivicgslwutjzhzdx.supabase.co";
const SUPABASE_PUBLISHABLE_DEFAULT_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || "sb_publishable_zm-kn6CTFg3epMFOT4_jbA_TDrz0T25";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_DEFAULT_KEY);
export const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1`;
