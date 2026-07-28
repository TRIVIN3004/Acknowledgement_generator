import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const url = process.env.SUPABASE_URL || '';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

console.log('📡 Testing Supabase Connection to:', url);

if (!url || !key) {
  console.error('❌ Supabase URL or Key missing in .env');
  process.exit(1);
}

const supabase = createClient(url, key);

async function testConnection() {
  try {
    const { data, error } = await supabase.from('users').select('*').limit(5);
    if (error) {
      console.log('⚠️ Notice:', error.message);
      console.log('💡 Note: You need to run the SQL schema script in your Supabase SQL Editor first!');
    } else {
      console.log('✅ Connected to Supabase successfully!');
      console.log(`📊 Found ${data.length} users in Supabase.`);
    }
  } catch (err: any) {
    console.error('❌ Connection error:', err.message);
  }
}

testConnection();
