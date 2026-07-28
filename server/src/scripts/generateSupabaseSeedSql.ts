import fs from 'fs';
import path from 'path';

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let startValueIndex = 0;
  let inQuotes = false;

  for (let currentPosition = 0; currentPosition < line.length; currentPosition++) {
    const currentChar = line[currentPosition];

    if (currentChar === '"') {
      inQuotes = !inQuotes;
    } else if (currentChar === ',' && !inQuotes) {
      let val = line.substring(startValueIndex, currentPosition).trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1).replace(/""/g, '"');
      }
      result.push(val);
      startValueIndex = currentPosition + 1;
    }
  }

  let val = line.substring(startValueIndex).trim();
  if (val.startsWith('"') && val.endsWith('"')) {
    val = val.substring(1, val.length - 1).replace(/""/g, '"');
  }
  result.push(val);

  return result;
}

function generateCleanSql() {
  const csvPath = path.join(process.cwd(), '../users_rows.csv');
  const rootCsvPath = fs.existsSync(csvPath) ? csvPath : path.join(process.cwd(), 'users_rows.csv');

  if (!fs.existsSync(rootCsvPath)) {
    console.error('users_rows.csv not found');
    return;
  }

  const content = fs.readFileSync(rootCsvPath, 'utf-8');
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);

  let sql = `-- ========================================================\n`;
  sql += `-- NEXORA TECHNOLOGIES - SUPABASE SEED DATA SCRIPT (NO AVATARS)\n`;
  sql += `-- Paste this into your Supabase SQL Editor: https://supabase.com/dashboard/project/kuvlsmcdxxfspabovunh/sql/new\n`;
  sql += `-- ========================================================\n\n`;

  sql += `-- 1. INSERT DEFAULT ROLES\n`;
  sql += `INSERT INTO roles (id, title, category, department, responsibilities, required_skills, description)\nVALUES\n`;
  sql += `('11111111-1111-1111-1111-111111111111', 'Frontend Developer', 'Engineering', 'Engineering', ARRAY['Develop UI components', 'Integrate APIs'], ARRAY['React', 'TypeScript'], 'Frontend Specialist'),\n`;
  sql += `('22222222-2222-2222-2222-222222222222', 'Backend Developer', 'Engineering', 'Engineering', ARRAY['API Endpoints', 'Database Migration'], ARRAY['Node.js', 'PostgreSQL'], 'Backend Specialist'),\n`;
  sql += `('33333333-3333-3333-3333-333333333333', 'AI Engineer', 'Engineering', 'AI & Data Science', ARRAY['Train LLM models', 'Vector DB search'], ARRAY['Python', 'PyTorch'], 'AI Specialist'),\n`;
  sql += `('44444444-4444-4444-4444-444444444444', 'UI/UX Designer', 'Design', 'Design', ARRAY['User wireframes', 'Figma prototypes'], ARRAY['Figma', 'UI Design'], 'Design Specialist')\n`;
  sql += `ON CONFLICT (title) DO NOTHING;\n\n`;

  sql += `-- 2. INSERT USERS (NO AVATAR URLs)\n`;
  sql += `INSERT INTO users (name, email, password_hash, role, department, member_id, phone, avatar_url, status)\nVALUES\n`;

  const userSqlRows: string[] = [];
  const projectTitles = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);
    if (fields.length < 3) continue;

    const empId = (fields[0] || `EMP-${i}`).replace(/'/g, "''");
    const name = (fields[1] || 'Team Member').replace(/'/g, "''");
    const email = (fields[2] || '').trim();
    const rawPassword = (fields[3] || '123456').replace(/'/g, "''");
    const rawRole = (fields[4] || 'member').toLowerCase() === 'admin' ? 'admin' : 'member';
    const dept = (fields[5] || 'Engineering').replace(/'/g, "''");
    const rawProjects = fields[6] || '';
    const phone = (fields[8] || '+1 (555) 019-2834').replace(/'/g, "''");

    if (!email) continue;

    userSqlRows.push(`('${name}', '${email}', '${rawPassword}', '${rawRole}', '${dept}', '${empId}', '${phone}', '', 'active')`);

    try {
      if (rawProjects.startsWith('[')) {
        const arr = JSON.parse(rawProjects);
        arr.forEach((p: string) => { if (p && p !== 'All') projectTitles.add(p.trim()); });
      }
    } catch (e) {}
  }

  sql += userSqlRows.join(',\n') + `\nON CONFLICT (email) DO NOTHING;\n\n`;

  sql += `-- 3. INSERT EXTRACTED NEXORA PROJECTS\n`;
  sql += `INSERT INTO projects (title, description, category, technology_stack, deadline, status)\nVALUES\n`;

  const projSqlRows: string[] = [];
  Array.from(projectTitles).forEach(pTitle => {
    const cleanTitle = pTitle.replace(/'/g, "''");
    projSqlRows.push(`('${cleanTitle}', 'Enterprise ${cleanTitle} software platform developed by Nexora Technologies.', 'Software Engineering', ARRAY['React', 'TypeScript', 'Node.js', 'PostgreSQL'], '2026-12-31', 'in_progress')`);
  });

  sql += projSqlRows.join(',\n') + `;\n`;

  const targetPath = path.join(process.cwd(), '../supabase/seed_data.sql');
  fs.writeFileSync(targetPath, sql);
  console.log('✅ Generated Supabase seed SQL script without avatars at:', targetPath);
}

generateCleanSql();
