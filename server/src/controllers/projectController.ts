import { Response } from 'express';
import { memoryStore } from '../config/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

export const getProjects = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // If Supabase DB is connected, fetch latest projects into memoryStore
    if (supabase) {
      try {
        const { data: supaProjects } = await supabase.from('projects').select('*');
        if (supaProjects && Array.isArray(supaProjects)) {
          supaProjects.forEach((p: any) => {
            const formatted = {
              id: p.id,
              _id: p.id,
              title: p.title,
              description: p.description,
              category: p.category || 'Enterprise Web Application',
              technologyStack: Array.isArray(p.technology_stack) ? p.technology_stack : (Array.isArray(p.tech_stack) ? p.tech_stack : ['React', 'TypeScript']),
              leadId: p.lead_id || 'usr-admin-1',
              leadName: p.lead_name || 'Project Lead',
              deadline: p.deadline || '2026-12-31',
              status: p.status || 'planning',
              timeline: {
                assignedAt: p.timeline_assigned_at || p.created_at || new Date().toISOString(),
                acceptedAt: p.timeline_accepted_at,
                startedAt: p.timeline_started_at,
                completedAt: p.timeline_completed_at
              },
              createdAt: p.created_at || new Date().toISOString()
            };

            const idx = memoryStore.projects.findIndex(x => x.id === formatted.id || x.title === formatted.title);
            if (idx !== -1) {
              memoryStore.projects[idx] = { ...memoryStore.projects[idx], ...formatted };
            } else {
              memoryStore.projects.unshift(formatted);
            }
          });
        }
      } catch (err) {
        console.warn('Supabase getProjects sync warning:', err);
      }
    }

    const { status, category, search } = req.query;
    let list = [...memoryStore.projects];

    if (status && status !== 'all') {
      list = list.filter(p => p.status === status);
    }

    if (category && category !== 'all') {
      list = list.filter(p => p.category === category);
    }

    if (search) {
      const query = (search as string).toLowerCase();
      list = list.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.technologyStack.some((t: string) => t.toLowerCase().includes(query))
      );
    }

    return res.json({ success: true, count: list.length, projects: list });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getProjectById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const project = memoryStore.projects.find(p => p.id === id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const assignments = memoryStore.assignments.filter(a => a.projectId === id).map(a => {
      const role = memoryStore.roles.find(r => r.id === a.roleId);
      const member = memoryStore.users.find(u => u.id === a.memberId);
      const ack = memoryStore.acknowledgements.find(k => k.assignmentId === a.id);
      return {
        ...a,
        role,
        member: member ? { id: member.id, name: member.name, email: member.email, avatarUrl: member.avatarUrl } : null,
        acknowledgement: ack || null
      };
    });

    return res.json({ success: true, project, assignments });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, category, technologyStack, deadline, leadId, leadName } = req.body;

    if (!title || !description || !deadline) {
      return res.status(400).json({ success: false, message: 'Title, description, and deadline are required' });
    }

    const techArray = Array.isArray(technologyStack) 
      ? technologyStack 
      : (technologyStack ? technologyStack.split(',').map((t: string) => t.trim()) : []);

    const newProject: any = {
      id: `proj-${Date.now()}`,
      _id: `proj-${Date.now()}`,
      title,
      description,
      category: category || 'Enterprise Web Application',
      technologyStack: techArray,
      leadId: leadId || req.user?.id || 'usr-admin-1',
      leadName: leadName || req.user?.name || 'Project Admin',
      deadline,
      status: 'planning',
      timeline: {
        assignedAt: new Date().toISOString()
      },
      createdAt: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { data: supaData, error } = await supabase.from('projects').insert([{
          title: newProject.title,
          description: newProject.description,
          category: newProject.category,
          technology_stack: newProject.technologyStack,
          lead_name: newProject.leadName,
          deadline: newProject.deadline,
          status: newProject.status,
          timeline_assigned_at: newProject.timeline.assignedAt
        }]).select();

        if (!error && supaData && supaData[0]) {
          newProject.id = supaData[0].id;
          newProject._id = supaData[0].id;
        } else if (error) {
          console.warn('Supabase project insert notice:', error.message);
        }
      } catch (err) {
        console.warn('Supabase project insert fallback:', err);
      }
    }

    memoryStore.projects.unshift(newProject);

    memoryStore.auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'PROJECT_CREATED',
      performedBy: req.user?.id || 'admin',
      performedByName: req.user?.name || 'Admin',
      performedByRole: 'admin',
      targetType: 'PROJECT',
      targetId: newProject.id,
      details: `Created new project "${newProject.title}" in category "${newProject.category}"`,
      timestamp: new Date().toISOString()
    });

    return res.status(201).json({ success: true, message: 'Project created successfully', project: newProject });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const project = memoryStore.projects.find(p => p.id === id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const { title, description, category, technologyStack, deadline, status, leadId, leadName } = req.body;

    if (title) project.title = title;
    if (description) project.description = description;
    if (category) project.category = category;
    if (technologyStack) {
      project.technologyStack = Array.isArray(technologyStack) 
        ? technologyStack 
        : technologyStack.split(',').map((t: string) => t.trim());
    }
    if (deadline) project.deadline = deadline;
    if (leadId) project.leadId = leadId;
    if (leadName) project.leadName = leadName;

    if (status && status !== project.status) {
      project.status = status;
      if (status === 'in_progress' && !project.timeline.startedAt) {
        project.timeline.startedAt = new Date().toISOString();
      } else if (status === 'completed' && !project.timeline.completedAt) {
        project.timeline.completedAt = new Date().toISOString();
      }
    }

    if (supabase) {
      try {
        await supabase.from('projects').update({
          title: project.title,
          description: project.description,
          category: project.category,
          technology_stack: project.technologyStack,
          deadline: project.deadline,
          status: project.status,
          lead_name: project.leadName,
          timeline_started_at: project.timeline?.startedAt,
          timeline_completed_at: project.timeline?.completedAt
        }).match({ id: project.id });
      } catch (err) {
        console.warn('Supabase updateProject error:', err);
      }
    }

    memoryStore.auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'PROJECT_UPDATED',
      performedBy: req.user?.id || 'admin',
      performedByName: req.user?.name || 'Admin',
      performedByRole: 'admin',
      targetType: 'PROJECT',
      targetId: project.id,
      details: `Updated project "${project.title}" attributes`,
      timestamp: new Date().toISOString()
    });

    return res.json({ success: true, message: 'Project updated successfully', project });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const archiveProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const project = memoryStore.projects.find(p => p.id === id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    project.status = 'archived';

    if (supabase) {
      try {
        await supabase.from('projects').update({ status: 'archived' }).match({ id: project.id });
      } catch (err) {
        console.warn('Supabase archiveProject error:', err);
      }
    }

    memoryStore.auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'PROJECT_ARCHIVED',
      performedBy: req.user?.id || 'admin',
      performedByName: req.user?.name || 'Admin',
      performedByRole: 'admin',
      targetType: 'PROJECT',
      targetId: project.id,
      details: `Archived project "${project.title}"`,
      timestamp: new Date().toISOString()
    });

    return res.json({ success: true, message: 'Project archived successfully', project });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const idx = memoryStore.projects.findIndex(p => p.id === id);

    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const deleted = memoryStore.projects.splice(idx, 1)[0];

    if (supabase) {
      try {
        await supabase.from('projects').delete().match({ id: id });
      } catch (err) {
        console.warn('Supabase deleteProject error:', err);
      }
    }

    memoryStore.auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'PROJECT_DELETED',
      performedBy: req.user?.id || 'admin',
      performedByName: req.user?.name || 'Admin',
      performedByRole: 'admin',
      targetType: 'PROJECT',
      targetId: id,
      details: `Deleted project "${deleted.title}"`,
      timestamp: new Date().toISOString()
    });

    return res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
