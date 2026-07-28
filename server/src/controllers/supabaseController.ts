import { Response } from 'express';
import { memoryStore } from '../config/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { fetchSupabaseData } from '../config/supabase.js';

export const syncFromSupabase = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { supabaseUrl, supabaseKey, customMappings } = req.body;

    // Use credentials provided in request body or environment variables
    const url = supabaseUrl || process.env.SUPABASE_URL;
    const key = supabaseKey || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      return res.status(400).json({
        success: false,
        message: 'Supabase URL and API Key are required. Provide them in request or configure server/.env.'
      });
    }

    // Dynamic import to avoid crash if env not configured
    const { createClient } = await import('@supabase/supabase-js');
    const client = createClient(url, key);

    const results: any = {
      usersSynced: 0,
      projectsSynced: 0,
      rolesSynced: 0,
      assignmentsSynced: 0,
      acknowledgementsSynced: 0
    };

    // 1. Fetch Users / Members from Supabase
    try {
      const { data: supaUsers } = await client.from('users').select('*');
      if (supaUsers && Array.isArray(supaUsers)) {
        supaUsers.forEach((u: any) => {
          const existing = memoryStore.users.find(x => x.email.toLowerCase() === (u.email || '').toLowerCase());
          if (!existing) {
            memoryStore.users.push({
              id: u.id || `usr-supa-${Date.now()}`,
              _id: u.id || `usr-supa-${Date.now()}`,
              name: u.name || u.full_name || 'Supabase User',
              email: u.email,
              passwordHash: '$2a$10$e.w2pZ8o9V2...', // Mocked hash for imported user
              role: u.role || 'member',
              department: u.department || u.dept || 'Engineering',
              college: u.college || u.university || 'Institute',
              phone: u.phone || u.contact || '+1 (555) 000-0000',
              skills: Array.isArray(u.skills) ? u.skills : [],
              status: 'active',
              memberId: u.member_id || `DEV-${Math.floor(100 + Math.random() * 900)}`,
              avatarUrl: u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.name || 'user')}`,
              createdAt: u.created_at || new Date().toISOString()
            });
            results.usersSynced++;
          }
        });
      }
    } catch (err) {
      console.warn('Supabase Users table sync warning:', err);
    }

    // 2. Fetch Projects / DPR Projects from Supabase
    try {
      const { data: supaProjects } = await client.from('projects').select('*');
      if (supaProjects && Array.isArray(supaProjects)) {
        supaProjects.forEach((p: any) => {
          const existing = memoryStore.projects.find(x => x.id === p.id || x.title.toLowerCase() === (p.title || p.name || '').toLowerCase());
          if (!existing) {
            memoryStore.projects.push({
              id: p.id || `proj-supa-${Date.now()}`,
              _id: p.id || `proj-supa-${Date.now()}`,
              title: p.title || p.name || 'Imported Project',
              description: p.description || p.details || 'Imported from Supabase DPR dataset.',
              category: p.category || p.type || 'Engineering',
              technologyStack: Array.isArray(p.technology_stack) ? p.technology_stack : (Array.isArray(p.tech_stack) ? p.tech_stack : ['React', 'TypeScript']),
              leadId: p.lead_id || 'usr-admin-1',
              leadName: p.lead_name || 'Project Lead',
              deadline: p.deadline || p.end_date || '2026-12-31',
              status: p.status || 'in_progress',
              timeline: {
                assignedAt: p.created_at || new Date().toISOString(),
                acceptedAt: p.accepted_at,
                startedAt: p.started_at,
                completedAt: p.completed_at
              },
              createdAt: p.created_at || new Date().toISOString()
            });
            results.projectsSynced++;
          }
        });
      }
    } catch (err) {
      console.warn('Supabase Projects table sync warning:', err);
    }

    // Log Activity
    memoryStore.auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'SUPABASE_DATA_IMPORTED',
      performedBy: req.user?.id || 'admin',
      performedByName: req.user?.name || 'Admin',
      performedByRole: 'admin',
      targetType: 'SYSTEM',
      details: `Imported data from Supabase: ${results.usersSynced} users, ${results.projectsSynced} projects.`,
      timestamp: new Date().toISOString()
    });

    return res.json({
      success: true,
      message: 'Successfully imported Supabase DPR data into PRDAMS!',
      results
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
