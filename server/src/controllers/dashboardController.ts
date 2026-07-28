import { Response } from 'express';
import { memoryStore } from '../config/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

export const getAdminStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (supabase) {
      try {
        const [projRes, rolesRes, usersRes, asgnRes, ackRes] = await Promise.all([
          supabase.from('projects').select('*'),
          supabase.from('roles').select('*'),
          supabase.from('users').select('*'),
          supabase.from('assignments').select('*'),
          supabase.from('acknowledgements').select('*')
        ]);

        if (usersRes.data) {
          usersRes.data.forEach((u: any) => {
            const formatted = {
              id: u.id,
              _id: u.id,
              name: u.name,
              email: u.email,
              role: u.role || 'member',
              department: u.department,
              college: u.college,
              memberId: u.member_id,
              avatarUrl: u.avatar_url
            };
            const idx = memoryStore.users.findIndex(x => x.email.toLowerCase() === (u.email || '').toLowerCase() || x.id === u.id);
            if (idx !== -1) memoryStore.users[idx] = { ...memoryStore.users[idx], ...formatted };
            else memoryStore.users.push(formatted);
          });
        }

        if (projRes.data) {
          projRes.data.forEach((p: any) => {
            const formatted = {
              id: p.id,
              _id: p.id,
              title: p.title,
              description: p.description,
              category: p.category || 'Enterprise Web Application',
              technologyStack: Array.isArray(p.technology_stack) ? p.technology_stack : ['React', 'TypeScript'],
              leadName: p.lead_name || 'Admin',
              deadline: p.deadline || '2026-12-31',
              status: p.status || 'planning',
              timeline: { assignedAt: p.created_at || new Date().toISOString() },
              createdAt: p.created_at || new Date().toISOString()
            };
            const idx = memoryStore.projects.findIndex(x => x.id === formatted.id);
            if (idx !== -1) memoryStore.projects[idx] = formatted;
            else memoryStore.projects.unshift(formatted);
          });
        }

        if (rolesRes.data) {
          rolesRes.data.forEach((r: any) => {
            const formatted = {
              id: r.id,
              _id: r.id,
              title: r.title,
              category: r.category || 'Engineering',
              department: r.department || 'Software Development',
              responsibilities: r.responsibilities || [],
              requiredSkills: r.required_skills || [],
              description: r.description || `Role ${r.title}`
            };
            const idx = memoryStore.roles.findIndex(x => x.id === formatted.id);
            if (idx !== -1) memoryStore.roles[idx] = formatted;
            else memoryStore.roles.unshift(formatted);
          });
        }

        if (ackRes.data) {
          ackRes.data.forEach((k: any) => {
            const formatted = {
              id: k.id,
              _id: k.id,
              assignmentId: k.assignment_id,
              projectId: k.project_id,
              roleId: k.role_id,
              memberId: k.member_id,
              signatureType: k.signature_type,
              signatureData: k.signature_data,
              typedName: k.typed_name,
              ipAddress: k.ip_address,
              timestamp: k.timestamp,
              qrCodeHash: k.qr_code_hash
            };
            const idx = memoryStore.acknowledgements.findIndex(x => x.id === formatted.id);
            if (idx !== -1) memoryStore.acknowledgements[idx] = formatted;
            else memoryStore.acknowledgements.unshift(formatted);
          });
        }

        if (asgnRes.data) {
          asgnRes.data.forEach((a: any) => {
            const hasAck = ackRes.data?.some((k: any) => 
              k.assignment_id === a.id || 
              (k.project_id === a.project_id && k.role_id === a.role_id && k.member_id === a.member_id)
            ) || memoryStore.acknowledgements.some((k: any) => 
              k.assignmentId === a.id || 
              (k.projectId === a.project_id && k.roleId === a.role_id && k.memberId === a.member_id)
            );

            const formatted = {
              id: a.id,
              _id: a.id,
              projectId: a.project_id,
              roleId: a.role_id,
              memberId: a.member_id,
              assignedBy: a.assigned_by,
              status: hasAck ? 'accepted' : (a.status || 'pending'),
              changeNote: a.change_note,
              assignedAt: a.assigned_at || a.created_at || new Date().toISOString()
            };
            const idx = memoryStore.assignments.findIndex(x => x.id === formatted.id);
            if (idx !== -1) memoryStore.assignments[idx] = formatted;
            else memoryStore.assignments.unshift(formatted);
          });
        }
      } catch (err) {
        console.warn('Supabase admin stats sync notice:', err);
      }
    }

    const totalProjects = memoryStore.projects.length;
    const totalMembers = memoryStore.users.filter(u => u.role === 'member').length;
    const totalRoles = memoryStore.roles.length;

    const isAccepted = (a: any) => {
      if (a.status === 'accepted') return true;
      return memoryStore.acknowledgements.some(k => 
        k.assignmentId === a.id || 
        (k.projectId === a.projectId && k.roleId === a.roleId && k.memberId === a.memberId)
      );
    };

    const pendingAcknowledgements = memoryStore.assignments.filter(a => !isAccepted(a) && a.status !== 'rejected').length;
    const completedAcknowledgements = memoryStore.acknowledgements.length;

    const membersPerProjectMap: Record<string, number> = {};
    memoryStore.assignments.forEach(a => {
      const proj = memoryStore.projects.find(p => p.id === a.projectId);
      if (proj) {
        membersPerProjectMap[proj.title] = (membersPerProjectMap[proj.title] || 0) + 1;
      }
    });

    const membersPerProject = Object.keys(membersPerProjectMap).map(title => ({
      name: title.length > 18 ? title.slice(0, 18) + '...' : title,
      value: membersPerProjectMap[title]
    }));

    const roleDistMap: Record<string, number> = {};
    memoryStore.assignments.forEach(a => {
      const role = memoryStore.roles.find(r => r.id === a.roleId);
      if (role) {
        roleDistMap[role.title] = (roleDistMap[role.title] || 0) + 1;
      }
    });

    const roleDistribution = Object.keys(roleDistMap).map(title => ({
      name: title,
      value: roleDistMap[title]
    }));

    const totalAssignments = memoryStore.assignments.length;
    const acceptedCount = memoryStore.assignments.filter(a => isAccepted(a)).length;
    const acceptanceRate = totalAssignments > 0 ? Math.round((acceptedCount / totalAssignments) * 100) : 100;

    return res.json({
      success: true,
      stats: {
        totalProjects,
        totalMembers,
        totalRoles,
        pendingAcknowledgements,
        completedAcknowledgements,
        acceptanceRate,
        membersPerProject,
        roleDistribution,
        recentActivities: memoryStore.auditLogs.slice(0, 10)
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMemberStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (supabase) {
      try {
        const [usersRes, projRes, rolesRes, asgnRes, ackRes] = await Promise.all([
          supabase.from('users').select('*'),
          supabase.from('projects').select('*'),
          supabase.from('roles').select('*'),
          supabase.from('assignments').select('*'),
          supabase.from('acknowledgements').select('*')
        ]);

        if (usersRes.data) {
          usersRes.data.forEach((u: any) => {
            const formatted = {
              id: u.id,
              _id: u.id,
              name: u.name,
              email: u.email,
              role: u.role || 'member',
              department: u.department,
              college: u.college,
              memberId: u.member_id,
              avatarUrl: u.avatar_url
            };
            const idx = memoryStore.users.findIndex(x => x.email.toLowerCase() === (u.email || '').toLowerCase() || x.id === u.id);
            if (idx !== -1) memoryStore.users[idx] = { ...memoryStore.users[idx], ...formatted };
            else memoryStore.users.push(formatted);
          });
        }

        if (projRes.data) {
          projRes.data.forEach((p: any) => {
            const formatted = {
              id: p.id,
              _id: p.id,
              title: p.title,
              description: p.description,
              category: p.category || 'Enterprise Web Application',
              technologyStack: Array.isArray(p.technology_stack) ? p.technology_stack : ['React', 'TypeScript'],
              leadName: p.lead_name || 'Admin',
              deadline: p.deadline || '2026-12-31',
              status: p.status || 'planning',
              timeline: { assignedAt: p.created_at || new Date().toISOString() },
              createdAt: p.created_at || new Date().toISOString()
            };
            const idx = memoryStore.projects.findIndex(x => x.id === formatted.id);
            if (idx !== -1) memoryStore.projects[idx] = formatted;
            else memoryStore.projects.unshift(formatted);
          });
        }

        if (rolesRes.data) {
          rolesRes.data.forEach((r: any) => {
            const formatted = {
              id: r.id,
              _id: r.id,
              title: r.title,
              category: r.category || 'Engineering',
              department: r.department || 'Software Development',
              responsibilities: r.responsibilities || [],
              requiredSkills: r.required_skills || [],
              description: r.description || `Role ${r.title}`
            };
            const idx = memoryStore.roles.findIndex(x => x.id === formatted.id);
            if (idx !== -1) memoryStore.roles[idx] = formatted;
            else memoryStore.roles.unshift(formatted);
          });
        }

        if (ackRes.data) {
          ackRes.data.forEach((k: any) => {
            const formatted = {
              id: k.id,
              _id: k.id,
              assignmentId: k.assignment_id,
              projectId: k.project_id,
              roleId: k.role_id,
              memberId: k.member_id,
              signatureType: k.signature_type,
              signatureData: k.signature_data,
              typedName: k.typed_name,
              ipAddress: k.ip_address,
              timestamp: k.timestamp,
              qrCodeHash: k.qr_code_hash
            };
            const idx = memoryStore.acknowledgements.findIndex(x => x.id === formatted.id);
            if (idx !== -1) memoryStore.acknowledgements[idx] = formatted;
            else memoryStore.acknowledgements.unshift(formatted);
          });
        }

        if (asgnRes.data) {
          asgnRes.data.forEach((a: any) => {
            const hasAck = ackRes.data?.some((k: any) => 
              k.assignment_id === a.id || 
              (k.project_id === a.project_id && k.role_id === a.role_id && k.member_id === a.member_id)
            ) || memoryStore.acknowledgements.some((k: any) => 
              k.assignmentId === a.id || 
              (k.projectId === a.project_id && k.roleId === a.role_id && k.memberId === a.member_id)
            );

            const formatted = {
              id: a.id,
              _id: a.id,
              projectId: a.project_id,
              roleId: a.role_id,
              memberId: a.member_id,
              assignedBy: a.assigned_by,
              status: hasAck ? 'accepted' : (a.status || 'pending'),
              changeNote: a.change_note,
              assignedAt: a.assigned_at || a.created_at || new Date().toISOString()
            };
            const idx = memoryStore.assignments.findIndex(x => x.id === formatted.id);
            if (idx !== -1) memoryStore.assignments[idx] = formatted;
            else memoryStore.assignments.unshift(formatted);
          });
        }
      } catch (err) {
        console.warn('Supabase member stats sync notice:', err);
      }
    }

    const targetUser = memoryStore.users.find(u => 
      u.id === user.id || 
      u.email.toLowerCase() === (user.email || '').toLowerCase()
    );

    const validUserIds = new Set([
      user.id,
      user.email,
      (user.email || '').toLowerCase(),
      targetUser?.id,
      targetUser?._id,
      targetUser?.email,
      targetUser?.email?.toLowerCase()
    ].filter(Boolean));

    const myAssignments = memoryStore.assignments.filter(a => {
      if (validUserIds.has(a.memberId)) return true;
      if (validUserIds.has(String(a.memberId).toLowerCase())) return true;
      const assignedUser = memoryStore.users.find(u => 
        u.id === a.memberId || 
        u.email.toLowerCase() === String(a.memberId).toLowerCase()
      );
      if (assignedUser) {
        if (validUserIds.has(assignedUser.email) || validUserIds.has(assignedUser.email.toLowerCase())) return true;
        if (validUserIds.has(assignedUser.id)) return true;
      }
      return false;
    });

    const myAcks = memoryStore.acknowledgements.filter(a => {
      if (validUserIds.has(a.memberId)) return true;
      if (validUserIds.has(String(a.memberId).toLowerCase())) return true;
      const assignedUser = memoryStore.users.find(u => 
        u.id === a.memberId || 
        u.email.toLowerCase() === String(a.memberId).toLowerCase()
      );
      if (assignedUser && (validUserIds.has(assignedUser.email) || validUserIds.has(assignedUser.email.toLowerCase()))) return true;
      return false;
    });

    const pendingAssignments = myAssignments
      .filter(a => {
        if (a.status === 'accepted') return false;
        const hasAck = memoryStore.acknowledgements.some(k => 
          k.assignmentId === a.id || 
          (k.projectId === a.projectId && k.roleId === a.roleId)
        );
        return !hasAck;
      })
      .map(a => {
        const project = memoryStore.projects.find(p => p.id === a.projectId);
        const role = memoryStore.roles.find(r => r.id === a.roleId);
        return { ...a, project, role };
      });

    const activeProjectIds = [...new Set(myAssignments.map(a => a.projectId))];
    const activeProjects = memoryStore.projects.filter(p => activeProjectIds.includes(p.id));

    return res.json({
      success: true,
      stats: {
        myProjectsCount: activeProjects.length,
        assignedRolesCount: myAssignments.length,
        pendingAcceptanceCount: pendingAssignments.length,
        completedProjectsCount: activeProjects.filter(p => p.status === 'completed').length,
        downloadedLettersCount: myAcks.length,
        pendingAssignments,
        activeProjects
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (supabase) {
      try {
        const { data: supaNotifs } = await supabase.from('notifications').select('*');
        if (supaNotifs && Array.isArray(supaNotifs)) {
          supaNotifs.forEach((n: any) => {
            const formatted = {
              id: n.id,
              _id: n.id,
              userId: n.user_id,
              title: n.title,
              message: n.message,
              type: n.type || 'system',
              read: n.read || false,
              link: n.link,
              createdAt: n.created_at || new Date().toISOString()
            };
            const idx = memoryStore.notifications.findIndex(x => x.id === formatted.id);
            if (idx !== -1) memoryStore.notifications[idx] = formatted;
            else memoryStore.notifications.unshift(formatted);
          });
        }
      } catch (err) {
        console.warn('Supabase notifications sync notice:', err);
      }
    }

    const targetUser = memoryStore.users.find(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    const validUserIds = new Set([user.id, user.email, targetUser?.id, targetUser?._id, targetUser?.email, 'all'].filter(Boolean));

    const userNotifs = memoryStore.notifications.filter(n => validUserIds.has(n.userId));

    return res.json({ success: true, count: userNotifs.length, notifications: userNotifs });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markNotificationRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const notif = memoryStore.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
    }
    if (supabase) {
      try {
        await supabase.from('notifications').update({ read: true }).match({ id });
      } catch (err) {
        console.warn('Supabase notification update notice:', err);
      }
    }
    return res.json({ success: true, message: 'Notification marked as read' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAuditLogs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (supabase) {
      try {
        const { data: supaLogs } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(50);
        if (supaLogs && Array.isArray(supaLogs)) {
          supaLogs.forEach((l: any) => {
            const formatted = {
              id: l.id,
              _id: l.id,
              action: l.action,
              performedBy: l.performed_by,
              performedByName: l.performed_by_name || 'Admin',
              performedByRole: l.performed_by_role || 'admin',
              targetType: l.target_type,
              targetId: l.target_id,
              details: l.details,
              timestamp: l.timestamp || new Date().toISOString()
            };
            const idx = memoryStore.auditLogs.findIndex(x => x.id === formatted.id);
            if (idx !== -1) memoryStore.auditLogs[idx] = formatted;
            else memoryStore.auditLogs.push(formatted);
          });
        }
      } catch (err) {
        console.warn('Supabase audit logs sync notice:', err);
      }
    }

    return res.json({ success: true, count: memoryStore.auditLogs.length, logs: memoryStore.auditLogs });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
