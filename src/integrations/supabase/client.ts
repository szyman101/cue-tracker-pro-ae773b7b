
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database as GeneratedDatabase } from './types';
import type { Database as CustomDatabase } from '@/types/supabase';

// Merge the generated database types with our custom types
type Database = GeneratedDatabase & CustomDatabase;

const SUPABASE_URL = "https://chwnqholiwujfficqzua.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNod25xaG9saXd1amZmaWNxenVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyMTQ3NzIsImV4cCI6MjA1Nzc5MDc3Mn0.UVj9ragbXnsMEA2oVVPq_jbi4GOTs9-s2c7Kuf2FJGk";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
