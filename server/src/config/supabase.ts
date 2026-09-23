import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Ensure dotenv is loaded immediately when this module is imported
dotenv.config();
dotenv.config({ path: path.join(process.cwd(), 'server', '.env') });
dotenv.config({ path: path.join(process.cwd(), '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://kuvlsmcdxxfspabovunh.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1dmxzbWNkeHhmc3BhYm92dW5oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTE0NjY2MCwiZXhwIjoyMTAwNzIyNjYwfQ.iE6U9k6owhCCh4R7C2TZR8vrtoR3K1OhZYFnoCPtStg';

export const supabase = (SUPABASE_URL && SUPABASE_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_KEY) 
  : null;

export const fetchSupabaseData = async (tableName: string) => {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Please set SUPABASE_URL and SUPABASE_ANON_KEY in server/.env');
  }

  const { data, error } = await supabase.from(tableName).select('*');
  if (error) throw error;
  return data;
};

