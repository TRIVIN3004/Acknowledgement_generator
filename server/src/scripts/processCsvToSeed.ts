import fs from 'fs';
import path from 'path';

const csvPath = path.join(process.cwd(), '../users_rows.csv');
const rootCsvPath = fs.existsSync(csvPath) ? csvPath : path.join(process.cwd(), 'users_rows.csv');

function parseCSVProper(text: string): string[][] {
  const rows: string[][] = [];
  let currentField = '';
  let currentRow: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentField);
      if (currentRow.some(f => f.trim().length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.some(f => f.trim().length > 0)) rows.push(currentRow);
  }
  return rows;
}

export function parseUsersCsv() {
  if (!fs.existsSync(rootCsvPath)) {
    console.warn('⚠️ users_rows.csv not found at', rootCsvPath);
    return { users: [], projects: [], assignments: [] };
  }

  const content = fs.readFileSync(rootCsvPath, 'utf-8');
  const rawRows = parseCSVProper(content);
  if (rawRows.length < 2) return { users: [], projects: [], assignments: [] };

  const parsedUsers: any[] = [];
  const projectTitleSet = new Set<string>();
  const userProjectPairs: { userId: string; userEmail: string; projectTitle: string }[] = [];

  for (let i = 1; i < rawRows.length; i++) {
    const row = rawRows[i];

    // Columns: id,name,email,password,role,department,assignedProjects,avatar,phone,mustChangePassword
    const empId = (row[0] || '').trim();
    const name = (row[1] || '').trim();
    const email = (row[2] || '').trim();
    const rawPass = (row[3] || '').trim();
    const role = (row[4] || '').trim().toLowerCase() === 'admin' ? 'admin' : 'member';
    const dept = (row[5] || '').trim() || 'Software Engineering';
    const rawProjects = (row[6] || '').trim();
    const phone = (row[8] || '').trim() || '+1 (555) 019-2834';

    if (!email || !name) continue;

    const userId = empId || `usr-${i}`;

    parsedUsers.push({
      id: userId,
      _id: userId,
      name,
      email,
      passwordHash: rawPass,
      role,
      department: dept,
      college: 'Nexora Technologies',
      phone,
      skills: ['React', 'TypeScript', 'Node.js', 'AI Systems'],
      status: 'active',
      memberId: empId,
      avatarUrl: '', // Profile picture removed
      createdAt: '2026-01-15T09:00:00.000Z'
    });

    try {
      let projList: string[] = [];
      if (rawProjects.startsWith('[')) {
        projList = JSON.parse(rawProjects);
      } else if (rawProjects) {
        projList = [rawProjects];
      }

      projList.forEach(pTitle => {
        const cleanTitle = pTitle.trim();
        if (cleanTitle && cleanTitle !== 'All') {
          projectTitleSet.add(cleanTitle);
          userProjectPairs.push({ userId, userEmail: email, projectTitle: cleanTitle });
        }
      });
    } catch (e) {}
  }

  // Create Projects
  const projects = Array.from(projectTitleSet).map((pTitle, idx) => ({
    id: `proj-${idx + 1}`,
    _id: `proj-${idx + 1}`,
    title: pTitle,
    description: `Enterprise ${pTitle} application built by Nexora Technologies.`,
    category: pTitle.toLowerCase().includes('ai') ? 'Artificial Intelligence' : (pTitle.toLowerCase().includes('design') ? 'Product Design' : 'Enterprise Web Application'),
    technologyStack: ['React', 'TypeScript', 'Node.js', 'Python', 'Tailwind CSS'],
    leadId: 'EMP-001',
    leadName: 'Trivin (Admin)',
    deadline: '2026-11-30',
    status: idx % 2 === 0 ? 'in_progress' : 'planning',
    timeline: {
      assignedAt: '2026-02-01T09:00:00.000Z',
      startedAt: '2026-02-05T08:00:00.000Z'
    },
    createdAt: '2026-02-01T09:00:00.000Z'
  }));

  const defaultRoles = [
    { id: 'role-1', title: 'Frontend Developer', category: 'Frontend', department: 'Engineering' },
    { id: 'role-2', title: 'Backend Developer', category: 'Backend', department: 'Engineering' },
    { id: 'role-3', title: 'AI Engineer', category: 'AI', department: 'Engineering' },
    { id: 'role-4', title: 'UI/UX Designer', category: 'Design', department: 'Design' },
    { id: 'role-5', title: 'QA Engineer', category: 'QA', department: 'Quality Assurance' }
  ];

  const assignments = userProjectPairs.map((pair, idx) => {
    const proj = projects.find(p => p.title === pair.projectTitle);
    const user = parsedUsers.find(u => u.id === pair.userId || u.email.toLowerCase() === (pair.userId || '').toLowerCase());
    
    let roleId = 'role-1';
    if (user) {
      const dept = (user.department || '').toLowerCase();
      if (dept.includes('qa') || dept.includes('quality')) roleId = 'role-5'; // QA Engineer
      else if (dept.includes('design')) roleId = 'role-4'; // UI/UX Designer
      else if (dept.includes('ai') || dept.includes('data')) roleId = 'role-3'; // AI Engineer
      else if (idx % 2 === 0) roleId = 'role-1'; // Frontend Developer
      else roleId = 'role-2'; // Backend Developer
    } else {
      roleId = defaultRoles[idx % defaultRoles.length].id;
    }

    return {
      id: `asgn-${idx + 1}`,
      _id: `asgn-${idx + 1}`,
      projectId: proj ? proj.id : 'proj-1',
      roleId,
      memberId: pair.userId,
      assignedBy: 'EMP-001',
      status: 'pending',
      assignedAt: '2026-02-10T10:00:00.000Z'
    };
  });

  return { users: parsedUsers, projects, assignments };
}
