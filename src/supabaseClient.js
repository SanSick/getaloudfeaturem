import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://pksizacutbmvchsdrtwf.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrc2l6YWN1dGJtdmNoc2RydHdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4ODMyMzQsImV4cCI6MjA4MzQ1OTIzNH0.Mfv-fMTzoRoDcY-bjPHYmvAc7jnvbem6FfVQ515r5uo";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
