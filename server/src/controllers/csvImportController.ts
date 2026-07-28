import { Response } from 'express';
import { memoryStore } from '../config/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

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

// Simple robust CSV line parser
function parseCSV(csvText: string): Record<string, string>[] {
  const rawRows = parseCSVProper(csvText);
  if (rawRows.length === 0) return [];

  const headers = rawRows[0].map(h => h.trim().replace(/^["']|["']$/g, ''));
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < rawRows.length; i++) {
    const values = rawRows[i];
    const row: Record<string, string> = {};

    headers.forEach((header, idx) => {
      let val = (values[idx] || '').trim().replace(/^["']|["']$/g, '');
      row[header] = val;
      row[header.toLowerCase()] = val;
    });

    rows.push(row);
  }

  return rows;
}

export const importCSVData = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { csvText, targetType } = req.body; // targetType: 'auto' | 'projects' | 'users' | 'roles' | 'assignments'

    if (!csvText) {
      return res.status(400).json({ success: false, message: 'CSV text content is required' });
    }

    const rows = parseCSV(csvText);
    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Parsed CSV contains no valid data rows' });
    }

    let projectsCount = 0;
    let usersCount = 0;
    let rolesCount = 0;
    let assignmentsCount = 0;

    rows.forEach((row, index) => {
      // Detect project rows
      const title = row['title'] || row['project_name'] || row['project_title'] || row['project'] || row['name'];
      const email = row['email'] || row['email_address'] || row['user_email'];
      const roleTitle = row['role'] || row['role_title'] || row['role_name'] || row['job_title'];

      if (email && (targetType === 'users' || targetType === 'auto')) {
        const existing = memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!existing) {
          memoryStore.users.push({
            id: row['id'] || `usr-csv-${Date.now()}-${index}`,
            _id: row['id'] || `usr-csv-${Date.now()}-${index}`,
            name: row['name'] || row['full_name'] || row['user_name'] || email.split('@')[0],
            email,
            passwordHash: '$2a$10$e.w2pZ8o9V2...',
            role: (row['role_type'] || row['user_role'] || 'member').toLowerCase().includes('admin') ? 'admin' : 'member',
            department: row['department'] || row['dept'] || 'Software Engineering',
            college: row['college'] || row['university'] || 'Institute',
            phone: row['phone'] || row['contact'] || '+1 (555) 000-0000',
            skills: row['skills'] ? row['skills'].split(';').map(s => s.trim()) : [],
            status: 'active',
            memberId: row['member_id'] || `DEV-${Math.floor(100 + Math.random() * 900)}`,
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(row['name'] || email)}`,
            createdAt: new Date().toISOString()
          });
          usersCount++;
        }
      }

      if (title && (targetType === 'projects' || targetType === 'auto')) {
        const existing = memoryStore.projects.find(p => p.title.toLowerCase() === title.toLowerCase());
        if (!existing) {
          memoryStore.projects.push({
            id: row['id'] || `proj-csv-${Date.now()}-${index}`,
            _id: row['id'] || `proj-csv-${Date.now()}-${index}`,
            title,
            description: row['description'] || row['details'] || row['summary'] || `Imported project "${title}"`,
            category: row['category'] || row['type'] || 'Software Engineering',
            technologyStack: row['technology_stack'] ? row['technology_stack'].split(';').map(t => t.trim()) : (row['tech_stack'] ? row['tech_stack'].split(';').map(t => t.trim()) : ['React', 'TypeScript']),
            leadId: 'usr-admin-1',
            leadName: row['lead'] || row['lead_name'] || 'Project Lead',
            deadline: row['deadline'] || row['end_date'] || '2026-12-31',
            status: (row['status'] || 'in_progress').toLowerCase().replace(/\s+/g, '_') as any,
            timeline: {
              assignedAt: new Date().toISOString()
            },
            createdAt: new Date().toISOString()
          });
          projectsCount++;
        }
      }

      if (roleTitle && (targetType === 'roles' || targetType === 'auto')) {
        const existing = memoryStore.roles.find(r => r.title.toLowerCase() === roleTitle.toLowerCase());
        if (!existing) {
          memoryStore.roles.push({
            id: row['id'] || `role-csv-${Date.now()}-${index}`,
            _id: row['id'] || `role-csv-${Date.now()}-${index}`,
            title: roleTitle,
            category: row['category'] || 'Engineering',
            department: row['department'] || 'Software Development',
            responsibilities: row['responsibilities'] ? row['responsibilities'].split(';').map(r => r.trim()) : ['Deliver high quality project software components'],
            requiredSkills: row['skills'] ? row['skills'].split(';').map(s => s.trim()) : ['Technical expertise'],
            description: row['description'] || `Professional ${roleTitle} role`,
            createdAt: new Date().toISOString()
          });
          rolesCount++;
        }
      }
    });

    memoryStore.auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'CSV_DATA_IMPORTED',
      performedBy: req.user?.id || 'admin',
      performedByName: req.user?.name || 'Admin',
      performedByRole: 'admin',
      targetType: 'SYSTEM',
      details: `Imported CSV: ${rows.length} rows processed (${usersCount} users, ${projectsCount} projects, ${rolesCount} roles added).`,
      timestamp: new Date().toISOString()
    });

    return res.json({
      success: true,
      message: `Successfully processed CSV file! Added ${projectsCount} projects, ${usersCount} users, and ${rolesCount} roles.`,
      stats: { rowsProcessed: rows.length, projectsCount, usersCount, rolesCount }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
