
import { createClient } from "@jsr/supabase__supabase-js";

// Use environment variables with fallbacks for development
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://yanjivicgslwutjzhzdx.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhbmppdmljZ3Nsd3V0anpoemR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MTY5NDQsImV4cCI6MjA4MjI5Mjk0NH0.wfmyTNuPA6evVTCG88BsuBqIF9UxJvouv1Vue23dD0M";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1`;
