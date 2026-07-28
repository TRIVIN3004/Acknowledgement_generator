import { Response } from 'express';
import { memoryStore } from '../config/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

export const getRoles = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (supabase) {
      try {
        const { data: supaRoles } = await supabase.from('roles').select('*');
        if (supaRoles && Array.isArray(supaRoles)) {
          supaRoles.forEach((r: any) => {
            const formatted = {
              id: r.id,
              _id: r.id,
              title: r.title,
              category: r.category || 'Engineering',
              department: r.department || 'Software Development',
              responsibilities: r.responsibilities || [],
              requiredSkills: r.required_skills || [],
              description: r.description || `Professional ${r.title} role responsible for project excellence.`,
              createdAt: r.created_at || new Date().toISOString()
            };

            const idx = memoryStore.roles.findIndex(x => x.id === formatted.id || x.title.toLowerCase() === formatted.title.toLowerCase());
            if (idx !== -1) {
              memoryStore.roles[idx] = { ...memoryStore.roles[idx], ...formatted };
            } else {
              memoryStore.roles.unshift(formatted);
            }
          });
        }
      } catch (err) {
        console.warn('Supabase getRoles sync notice:', err);
      }
    }

    return res.json({ success: true, count: memoryStore.roles.length, roles: memoryStore.roles });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createRole = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, category, department, responsibilities, requiredSkills, description } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Role title is required' });
    }

    const existing = memoryStore.roles.find(r => r.title.toLowerCase() === title.toLowerCase());
    if (existing) {
      return res.status(400).json({ success: false, message: 'Role title already exists' });
    }

    const respArray = Array.isArray(responsibilities)
      ? responsibilities
      : (responsibilities ? responsibilities.split('\n').map((s: string) => s.trim()).filter(Boolean) : []);

    const skillsArray = Array.isArray(requiredSkills)
      ? requiredSkills
      : (requiredSkills ? requiredSkills.split(',').map((s: string) => s.trim()).filter(Boolean) : []);

    const newRole: any = {
      id: `role-${Date.now()}`,
      _id: `role-${Date.now()}`,
      title,
      category: category || 'Engineering',
      department: department || 'Software Development',
      responsibilities: respArray,
      requiredSkills: skillsArray,
      description: description || `Professional ${title} role responsible for project excellence.`,
      createdAt: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { data: supaData, error } = await supabase.from('roles').insert([{
          title: newRole.title,
          category: newRole.category,
          department: newRole.department,
          responsibilities: newRole.responsibilities,
          required_skills: newRole.requiredSkills,
          description: newRole.description
        }]).select();

        if (!error && supaData && supaData[0]) {
          newRole.id = supaData[0].id;
          newRole._id = supaData[0].id;
        }
      } catch (err) {
        console.warn('Supabase createRole notice:', err);
      }
    }

    memoryStore.roles.unshift(newRole);

    memoryStore.auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'ROLE_CREATED',
      performedBy: req.user?.id || 'admin',
      performedByName: req.user?.name || 'Admin',
      performedByRole: 'admin',
      targetType: 'ROLE',
      targetId: newRole.id,
      details: `Created new role "${newRole.title}"`,
      timestamp: new Date().toISOString()
    });

    return res.status(201).json({ success: true, message: 'Role created successfully', role: newRole });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRole = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const role = memoryStore.roles.find(r => r.id === id);

    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    const { title, category, department, responsibilities, requiredSkills, description } = req.body;

    if (title) role.title = title;
    if (category) role.category = category;
    if (department) role.department = department;
    if (description) role.description = description;

    if (responsibilities) {
      role.responsibilities = Array.isArray(responsibilities)
        ? responsibilities
        : responsibilities.split('\n').map((s: string) => s.trim()).filter(Boolean);
    }

    if (requiredSkills) {
      role.requiredSkills = Array.isArray(requiredSkills)
        ? requiredSkills
        : requiredSkills.split(',').map((s: string) => s.trim()).filter(Boolean);
    }

    if (supabase) {
      try {
        await supabase.from('roles').update({
          title: role.title,
          category: role.category,
          department: role.department,
          responsibilities: role.responsibilities,
          required_skills: role.requiredSkills,
          description: role.description
        }).match({ id: role.id });
      } catch (err) {
        console.warn('Supabase updateRole notice:', err);
      }
    }

    return res.json({ success: true, message: 'Role updated successfully', role });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteRole = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const idx = memoryStore.roles.findIndex(r => r.id === id);

    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    const deleted = memoryStore.roles.splice(idx, 1)[0];

    if (supabase) {
      try {
        await supabase.from('roles').delete().match({ id: id });
      } catch (err) {
        console.warn('Supabase deleteRole notice:', err);
      }
    }

    return res.json({ success: true, message: `Role "${deleted.title}" deleted successfully` });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
