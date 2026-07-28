import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function runImport() {
  console.log('🚀 [Supabase Importer] Starting Supabase DPR Data Migration...');

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Error: SUPABASE_URL and SUPABASE_ANON_KEY are missing from server/.env!');
    console.log('👉 Please add your Supabase credentials to server/.env:');
    console.log('   SUPABASE_URL=https://your-project.supabase.co');
    console.log('   SUPABASE_ANON_KEY=your-anon-key');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  console.log(`📡 Connected to Supabase Instance: ${SUPABASE_URL}`);

  try {
    // 1. Fetch Projects
    console.log('📦 Fetching Projects from Supabase...');
    const { data: projects, error: pErr } = await supabase.from('projects').select('*');
    if (pErr) console.warn('⚠️ Projects query warning:', pErr.message);
    else console.log(`✅ Fetched ${projects?.length || 0} Projects.`);

    // 2. Fetch Users / Members
    console.log('👥 Fetching Users from Supabase...');
    const { data: users, error: uErr } = await supabase.from('users').select('*');
    if (uErr) console.warn('⚠️ Users query warning:', uErr.message);
    else console.log(`✅ Fetched ${users?.length || 0} Users.`);

    // 3. Save as local seed dump
    const dumpPath = path.join(process.cwd(), 'src/data/supabaseDump.json');
    fs.writeFileSync(dumpPath, JSON.stringify({ projects, users, importedAt: new Date() }, null, 2));

    console.log(`🎉 Supabase DPR dataset successfully imported and saved to ${dumpPath}`);
  } catch (error: any) {
    console.error('❌ Supabase migration failed:', error.message);
  }
}

runImport();
