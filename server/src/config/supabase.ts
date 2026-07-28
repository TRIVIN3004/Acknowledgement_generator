import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

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
