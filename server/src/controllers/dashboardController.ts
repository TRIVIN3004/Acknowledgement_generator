import { Response } from 'express';
import { memoryStore } from '../config/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const getAdminStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
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

    const targetUser = memoryStore.users.find(u => 
      u.id === user.id || 
      u.email?.toLowerCase() === (user.email || '').toLowerCase() ||
      (user.name && u.name.toLowerCase() === user.name.toLowerCase())
    );

    const validUserIds = new Set([
      user.id,
      user.email,
      (user.email || '').toLowerCase(),
      user.name,
      (user.name || '').toLowerCase(),
      targetUser?.id,
      targetUser?._id,
      targetUser?.email,
      targetUser?.email?.toLowerCase(),
      targetUser?.name,
      targetUser?.name?.toLowerCase(),
      targetUser?.memberId,
      (targetUser?.memberId || '').toLowerCase()
    ].filter(Boolean));

    const myAssignments = memoryStore.assignments.filter(a => {
      if (validUserIds.has(a.memberId)) return true;
      if (validUserIds.has(String(a.memberId).toLowerCase())) return true;
      const assignedUser = memoryStore.users.find(u => 
        u.id === a.memberId || 
        u.email?.toLowerCase() === String(a.memberId).toLowerCase() ||
        u.name?.toLowerCase() === String(a.memberId).toLowerCase()
      );
      if (assignedUser) {
        if (validUserIds.has(assignedUser.email) || validUserIds.has(assignedUser.email?.toLowerCase())) return true;
        if (validUserIds.has(assignedUser.id)) return true;
        if (validUserIds.has(assignedUser.name) || validUserIds.has(assignedUser.name?.toLowerCase())) return true;
      }
      return false;
    });

    const myAcks = memoryStore.acknowledgements.filter(a => {
      if (validUserIds.has(a.memberId)) return true;
      if (validUserIds.has(String(a.memberId).toLowerCase())) return true;
      if (a.typedName && validUserIds.has(a.typedName.toLowerCase())) return true;
      const assignedUser = memoryStore.users.find(u => 
        u.id === a.memberId || 
        u.email?.toLowerCase() === String(a.memberId).toLowerCase() ||
        (a.typedName && u.name?.toLowerCase() === a.typedName.toLowerCase())
      );
      if (assignedUser) {
        if (validUserIds.has(assignedUser.email) || validUserIds.has(assignedUser.email?.toLowerCase())) return true;
        if (validUserIds.has(assignedUser.id)) return true;
        if (validUserIds.has(assignedUser.name) || validUserIds.has(assignedUser.name?.toLowerCase())) return true;
      }
      return false;
    });

    const pendingAssignments = myAssignments
      .filter(a => {
        if (a.status === 'accepted') return false;
        const hasAck = Boolean(
          a.id && memoryStore.acknowledgements.some(k => k.assignmentId === a.id)
        );
        return !hasAck;
      })
      .map(a => {
        const project = memoryStore.projects.find(p => p.id === a.projectId || p.title === a.projectId);
        const role = memoryStore.roles.find(r => r.id === a.roleId || r.title === a.roleId);
        return { 
          ...a, 
          project: project || { id: a.projectId, title: 'Nexora Project', description: 'Enterprise Project' }, 
          role: role || { id: a.roleId, title: 'Software Developer' } 
        };
      });

    const activeProjectIds = [...new Set(myAssignments.map(a => a.projectId))];
    const activeProjects = memoryStore.projects.filter(p => 
      activeProjectIds.includes(p.id) || activeProjectIds.includes(p.title)
    );

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
      memoryStore.save();
    }
    return res.json({ success: true, message: 'Notification marked as read' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAuditLogs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    return res.json({ success: true, count: memoryStore.auditLogs.length, logs: memoryStore.auditLogs });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
