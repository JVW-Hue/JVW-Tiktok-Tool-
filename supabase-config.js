// Supabase Configuration
// TODO: Replace these with your actual Supabase project credentials
// Get them from: https://app.supabase.com/project/_/settings/api

const SUPABASE_URL = 'https://jpyuvsbvqtusybsfaqfg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpweXV2c2J2cXR1c3lic2ZhcWZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NzgwNTgsImV4cCI6MjA4MDQ1NDA1OH0.zVsHjZrd-yJUUX-gresuTL6czTgJUaqb4zPh_cjLLh4';

// Initialize Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
