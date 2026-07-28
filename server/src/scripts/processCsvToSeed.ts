import fs from 'fs';
import path from 'path';

const csvPath = path.join(process.cwd(), '../users_rows.csv');
const rootCsvPath = fs.existsSync(csvPath) ? csvPath : path.join(process.cwd(), 'users_rows.csv');

export function parseUsersCsv() {
  if (!fs.existsSync(rootCsvPath)) {
    console.warn('⚠️ users_rows.csv not found at', rootCsvPath);
    return { users: [], projects: [], assignments: [] };
  }

  const content = fs.readFileSync(rootCsvPath, 'utf-8');
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return { users: [], projects: [], assignments: [] };

  const parsedUsers: any[] = [];
  const projectTitleSet = new Set<string>();
  const userProjectPairs: { userId: string; userEmail: string; projectTitle: string }[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
    
    // Columns: id,name,email,password,role,department,assignedProjects,avatar,phone,mustChangePassword
    const empId = (matches[0] || '').replace(/"/g, '').trim();
    const name = (matches[1] || '').replace(/"/g, '').trim();
    const email = (matches[2] || '').replace(/"/g, '').trim();
    const rawPass = (matches[3] || '').replace(/"/g, '').trim();
    const role = (matches[4] || '').replace(/"/g, '').trim().toLowerCase() === 'admin' ? 'admin' : 'member';
    const dept = (matches[5] || '').replace(/"/g, '').trim() || 'Software Engineering';
    const rawProjects = (matches[6] || '').replace(/^"|"$/g, '').trim();
    const phone = (matches[8] || '').replace(/"/g, '').trim() || '+1 (555) 019-2834';

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
      avatarUrl: '', // Profile picture removed as requested!
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
    const roleId = defaultRoles[idx % defaultRoles.length].id;
    return {
      id: `asgn-${idx + 1}`,
      _id: `asgn-${idx + 1}`,
      projectId: proj ? proj.id : 'proj-1',
      roleId,
      memberId: pair.userId,
      assignedBy: 'EMP-001',
      status: idx % 3 === 0 ? 'accepted' : 'pending',
      assignedAt: '2026-02-10T10:00:00.000Z'
    };
  });

  return { users: parsedUsers, projects, assignments };
}
