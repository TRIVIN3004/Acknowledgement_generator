import { Response } from 'express';
import { memoryStore } from '../config/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

export const getAssignments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Sync from Supabase DB if available
    if (supabase) {
      try {
        const { data: supaAssignments } = await supabase.from('assignments').select('*');
        if (supaAssignments && Array.isArray(supaAssignments)) {
          supaAssignments.forEach((a: any) => {
            const formatted = {
              id: a.id,
              _id: a.id,
              projectId: a.project_id,
              roleId: a.role_id,
              memberId: a.member_id,
              assignedBy: a.assigned_by,
              status: a.status || 'pending',
              changeNote: a.change_note,
              assignedAt: a.assigned_at || a.created_at || new Date().toISOString(),
              respondedAt: a.responded_at
            };

            const idx = memoryStore.assignments.findIndex(x => x.id === formatted.id);
            if (idx !== -1) {
              memoryStore.assignments[idx] = { ...memoryStore.assignments[idx], ...formatted };
            } else {
              memoryStore.assignments.unshift(formatted);
            }
          });
        }
      } catch (err) {
        console.warn('Supabase getAssignments sync notice:', err);
      }
    }

    const { projectId, memberId, status } = req.query;

    let list = [...memoryStore.assignments];

    if (projectId) list = list.filter(a => a.projectId === projectId);

    if (memberId) {
      const targetUser = memoryStore.users.find(u => u.id === memberId || u.email.toLowerCase() === (memberId as string).toLowerCase());
      const userIdsToMatch = new Set([
        memberId as string,
        targetUser?.id,
        targetUser?._id,
        targetUser?.email
      ].filter(Boolean));

      list = list.filter(a => {
        if (userIdsToMatch.has(a.memberId)) return true;
        const assignedUser = memoryStore.users.find(u => u.id === a.memberId);
        return assignedUser && userIdsToMatch.has(assignedUser.email);
      });
    }

    if (status && status !== 'all') list = list.filter(a => a.status === status);

    // Populate relations
    const enriched = list.map(a => {
      const project = memoryStore.projects.find(p => p.id === a.projectId);
      const role = memoryStore.roles.find(r => r.id === a.roleId);
      const member = memoryStore.users.find(u => u.id === a.memberId || u.email === a.memberId);
      const ack = memoryStore.acknowledgements.find(k => k.assignmentId === a.id);

      return {
        ...a,
        projectTitle: project?.title || 'Unknown Project',
        roleTitle: role?.title || 'Unknown Role',
        memberName: member?.name || 'Unknown Member',
        memberEmail: member?.email,
        project,
        role,
        member: member ? { id: member.id, name: member.name, email: member.email, avatarUrl: member.avatarUrl, department: member.department, college: member.college } : null,
        acknowledgement: ack || null
      };
    });

    return res.json({ success: true, count: enriched.length, assignments: enriched });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createAssignment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { projectId, roleId, memberId } = req.body;

    if (!projectId || !roleId || !memberId) {
      return res.status(400).json({ success: false, message: 'Project, Role, and Member are required' });
    }

    // 1. Locate Project (memoryStore -> Supabase fallback)
    let project = memoryStore.projects.find(p => p.id === projectId || p._id === projectId || p.title === projectId);
    if (!project && supabase) {
      try {
        const { data } = await supabase.from('projects').select('*').or(`id.eq.${projectId},title.eq.${projectId}`).maybeSingle();
        if (data) {
          project = {
            id: data.id,
            _id: data.id,
            title: data.title,
            description: data.description,
            category: data.category || 'Enterprise Web Application',
            technologyStack: Array.isArray(data.technology_stack) ? data.technology_stack : ['React', 'TypeScript'],
            leadId: data.lead_id || 'usr-admin-1',
            leadName: data.lead_name || 'Project Lead',
            deadline: data.deadline || '2026-12-31',
            status: data.status || 'planning',
            timeline: { assignedAt: data.created_at || new Date().toISOString() },
            createdAt: data.created_at || new Date().toISOString()
          };
          memoryStore.projects.unshift(project);
        }
      } catch (err) {
        console.warn('Supabase project lookup error:', err);
      }
    }

    // 2. Locate Role (memoryStore -> Supabase fallback)
    let role = memoryStore.roles.find(r => r.id === roleId || r._id === roleId || r.title === roleId);
    if (!role && supabase) {
      try {
        const { data } = await supabase.from('roles').select('*').or(`id.eq.${roleId},title.eq.${roleId}`).maybeSingle();
        if (data) {
          role = {
            id: data.id,
            _id: data.id,
            title: data.title,
            category: data.category || 'Engineering',
            department: data.department || 'Software Development',
            responsibilities: data.responsibilities || [],
            requiredSkills: data.required_skills || [],
            description: data.description || `Role ${data.title}`,
            createdAt: data.created_at || new Date().toISOString()
          };
          memoryStore.roles.unshift(role);
        }
      } catch (err) {
        console.warn('Supabase role lookup error:', err);
      }
    }

    // 3. Locate Member (memoryStore -> Supabase fallback)
    let member = memoryStore.users.find(u => u.id === memberId || u._id === memberId || u.email.toLowerCase() === (memberId as string).toLowerCase());
    if (!member && supabase) {
      try {
        const { data } = await supabase.from('users').select('*').or(`id.eq.${memberId},email.eq.${memberId}`).maybeSingle();
        if (data) {
          member = {
            id: data.id,
            _id: data.id,
            name: data.name,
            email: data.email,
            passwordHash: data.password_hash,
            role: data.role || 'member',
            department: data.department || 'Engineering',
            college: data.college || 'University',
            phone: data.phone || '+1 (555) 000-0000',
            skills: data.skills || [],
            status: data.status || 'active',
            memberId: data.member_id || 'DEV-101',
            avatarUrl: data.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
            createdAt: data.created_at || new Date().toISOString()
          };
          memoryStore.users.push(member);
        }
      } catch (err) {
        console.warn('Supabase member lookup error:', err);
      }
    }

    if (!project || !role || !member) {
      const missing = !project ? 'Project' : !role ? 'Role' : 'Member';
      return res.status(404).json({ success: false, message: `Specified ${missing} was not found` });
    }

    // Check existing pending assignment
    const existing = memoryStore.assignments.find(
      a => (a.projectId === project.id || a.projectId === projectId) && 
           (a.memberId === member.id || a.memberId === memberId) && 
           (a.roleId === role.id || a.roleId === roleId) && 
           a.status === 'pending'
    );
    if (existing) {
      return res.status(400).json({ success: false, message: 'This member has already been assigned this pending role' });
    }

    const newAssignment: any = {
      id: `asgn-${Date.now()}`,
      _id: `asgn-${Date.now()}`,
      projectId: project.id,
      roleId: role.id,
      memberId: member.id,
      assignedBy: req.user?.id || 'admin',
      status: 'pending',
      assignedAt: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { data: supaData, error } = await supabase.from('assignments').insert([{
          project_id: newAssignment.projectId,
          role_id: newAssignment.roleId,
          member_id: newAssignment.memberId,
          assigned_by: newAssignment.assignedBy,
          status: newAssignment.status,
          assigned_at: newAssignment.assignedAt
        }]).select();

        if (!error && supaData && supaData[0]) {
          newAssignment.id = supaData[0].id;
          newAssignment._id = supaData[0].id;
        }
      } catch (err) {
        console.warn('Supabase createAssignment notice:', err);
      }
    }

    memoryStore.assignments.unshift(newAssignment);

    // Create notification
    const newNotif = {
      id: `notif-${Date.now()}`,
      _id: `notif-${Date.now()}`,
      userId: member.id,
      title: 'New Role Assigned!',
      message: `You have been assigned as "${role.title}" for project "${project.title}". Please review and sign digital acknowledgement.`,
      type: 'assignment',
      read: false,
      link: '/member/roles',
      createdAt: new Date().toISOString()
    };
    memoryStore.notifications.unshift(newNotif);

    if (supabase) {
      try {
        await supabase.from('notifications').insert([{
          user_id: newNotif.userId,
          title: newNotif.title,
          message: newNotif.message,
          type: newNotif.type,
          read: false,
          link: newNotif.link
        }]);
      } catch (err) {
        console.warn('Supabase notification insert notice:', err);
      }
    }

    // Audit log
    memoryStore.auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'ROLE_ASSIGNED',
      performedBy: req.user?.id || 'admin',
      performedByName: req.user?.name || 'Admin',
      performedByRole: 'admin',
      targetType: 'ASSIGNMENT',
      targetId: newAssignment.id,
      details: `Assigned ${member.name} as ${role.title} in project "${project.title}"`,
      timestamp: new Date().toISOString()
    });

    return res.status(201).json({
      success: true,
      message: `Assigned ${member.name} as ${role.title} successfully`,
      assignment: newAssignment
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const respondToAssignment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { action, changeNote } = req.body; // action: 'accept' | 'reject' | 'request_change'

    const assignment = memoryStore.assignments.find(a => a.id === id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    if (assignment.memberId !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to respond to this assignment' });
    }

    const project = memoryStore.projects.find(p => p.id === assignment.projectId);
    const role = memoryStore.roles.find(r => r.id === assignment.roleId);
    const member = memoryStore.users.find(u => u.id === assignment.memberId);

    if (action === 'accept') {
      assignment.status = 'accepted';
      assignment.respondedAt = new Date().toISOString();
      if (project && !project.timeline.acceptedAt) {
        project.timeline.acceptedAt = new Date().toISOString();
      }
    } else if (action === 'reject') {
      assignment.status = 'rejected';
      assignment.respondedAt = new Date().toISOString();
      assignment.changeNote = changeNote || 'Member declined role assignment';
    } else if (action === 'request_change') {
      assignment.status = 'change_requested';
      assignment.respondedAt = new Date().toISOString();
      assignment.changeNote = changeNote || 'Member requested role modification';
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action provided' });
    }

    if (supabase) {
      try {
        await supabase.from('assignments').update({
          status: assignment.status,
          change_note: assignment.changeNote,
          responded_at: assignment.respondedAt
        }).match({ id: assignment.id });
      } catch (err) {
        console.warn('Supabase respondToAssignment notice:', err);
      }
    }

    // Notify admins
    const adminUser = memoryStore.users.find(u => u.role === 'admin');
    if (adminUser) {
      const notif = {
        id: `notif-${Date.now()}`,
        _id: `notif-${Date.now()}`,
        userId: adminUser.id,
        title: `Assignment ${action.replace('_', ' ').toUpperCase()}`,
        message: `${member?.name} has ${action.replace('_', ' ')}ed the "${role?.title}" role in "${project?.title}".`,
        type: 'acceptance',
        read: false,
        link: '/admin/acknowledgements',
        createdAt: new Date().toISOString()
      };
      memoryStore.notifications.unshift(notif);

      if (supabase) {
        try {
          await supabase.from('notifications').insert([{
            user_id: notif.userId,
            title: notif.title,
            message: notif.message,
            type: notif.type,
            read: false,
            link: notif.link
          }]);
        } catch (err) {
          console.warn('Supabase admin notification notice:', err);
        }
      }
    }

    return res.json({ success: true, message: `Assignment ${action}ed successfully`, assignment });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
