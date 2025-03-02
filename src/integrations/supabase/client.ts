
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://bwnhaqnwvpftpmynojqh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3bmhhcW53dnBmdHBteW5vanFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MTM4MDcsImV4cCI6MjA1NjM4OTgwN30.YfK8hmd87vf9dVCYF7YR8qMPQB2IhArPSV2uNA-zL8U";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
