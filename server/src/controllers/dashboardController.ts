import { Response } from 'express';
import { memoryStore } from '../config/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const getAdminStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const totalProjects = memoryStore.projects.length;
    const totalMembers = memoryStore.users.filter(u => u.role === 'member').length;
    const totalRoles = memoryStore.roles.length;
    const pendingAcknowledgements = memoryStore.assignments.filter(a => a.status === 'pending').length;
    const completedAcknowledgements = memoryStore.acknowledgements.length;

    // Members per project calculation
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

    // Role Distribution calculation
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

    // Acceptance rate
    const totalAssignments = memoryStore.assignments.length;
    const acceptedCount = memoryStore.assignments.filter(a => a.status === 'accepted').length;
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
    const memberId = req.user?.id;
    if (!memberId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const myAssignments = memoryStore.assignments.filter(a => a.memberId === memberId);
    const myAcks = memoryStore.acknowledgements.filter(a => a.memberId === memberId);

    const pendingAssignments = myAssignments
      .filter(a => a.status === 'pending')
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
    const userId = req.user?.id;
    const userNotifs = memoryStore.notifications.filter(n => n.userId === userId || n.userId === 'all');
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
