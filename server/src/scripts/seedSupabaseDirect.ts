import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { getInitialData } from '../data/initialSeed.js';

dotenv.config();

const url = process.env.SUPABASE_URL || '';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!url || !key) {
  console.error('❌ Supabase credentials missing from server/.env');
  process.exit(1);
}

const supabase = createClient(url, key);

function generateUUID(index: number, prefix: string) {
  const hex = (index + 1).toString(16).padStart(12, '0');
  return `00000000-${prefix}-4000-8000-${hex}`;
}

async function seedSupabase() {
  console.log('🚀 Seeding Supabase database with Nexora employees, roles, projects & assignments...');

  const data = getInitialData();

  // 1. Seed Roles with valid UUIDs
  console.log(`📦 Seeding ${data.roles.length} Roles...`);
  const roleIdMap = new Map<string, string>();
  for (let idx = 0; idx < data.roles.length; idx++) {
    const role = data.roles[idx];
    const uuid = generateUUID(idx, '1111');
    roleIdMap.set(role.id, uuid);

    const { error } = await supabase.from('roles').upsert({
      id: uuid,
      title: role.title,
      category: role.category,
      department: role.department,
      responsibilities: role.responsibilities,
      required_skills: role.requiredSkills,
      description: role.description
    }, { onConflict: 'title' });

    if (error) {
      console.warn(`⚠️ Role insert note (${role.title}):`, error.message);
    }
  }

  // 2. Seed Users without avatar URLs
  console.log(`👥 Seeding ${data.users.length} Users from CSV (No profile pictures)...`);
  let userCount = 0;
  const userEmailMap = new Map<string, string>(); // email -> supabase UUID or user_id
  for (const u of data.users) {
    const { data: insertedUser, error } = await supabase.from('users').upsert({
      name: u.name,
      email: u.email,
      password_hash: u.passwordHash,
      role: u.role,
      department: u.department,
      college: u.college,
      phone: u.phone,
      skills: u.skills,
      status: u.status,
      member_id: u.memberId,
      avatar_url: '' // Empty profile picture
    }, { onConflict: 'email' }).select('id, email').single();

    if (error) {
      console.warn(`⚠️ User insert note (${u.email}):`, error.message);
    } else if (insertedUser) {
      userEmailMap.set(u.email, insertedUser.id);
      userCount++;
    }
  }

  // 3. Seed Projects extracted from database CSV
  console.log(`📂 Seeding ${data.projects.length} Real Projects from database...`);
  let projCount = 0;
  const projectIdMap = new Map<string, string>(); // proj.id -> supabase UUID
  for (let idx = 0; idx < data.projects.length; idx++) {
    const p = data.projects[idx];
    const uuid = generateUUID(idx, '2222');
    projectIdMap.set(p.id, uuid);

    const { data: insertedProj, error } = await supabase.from('projects').upsert({
      id: uuid,
      title: p.title,
      description: p.description,
      category: p.category,
      technology_stack: p.technologyStack,
      deadline: p.deadline,
      status: p.status
    }).select('id').single();

    if (error) {
      console.warn(`⚠️ Project insert note (${p.title}):`, error.message);
    } else {
      projCount++;
    }
  }

  console.log(`🎉 Supabase database seeding complete! Synchronized ${userCount} users, ${data.roles.length} roles, and ${projCount} connected projects.`);
}

seedSupabase();
