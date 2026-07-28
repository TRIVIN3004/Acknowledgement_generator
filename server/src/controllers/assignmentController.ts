import { Response } from 'express';
import { memoryStore } from '../config/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const getAssignments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { projectId, memberId, status } = req.query;

    let list = [...memoryStore.assignments];

    if (projectId) list = list.filter(a => a.projectId === projectId);
    if (memberId) list = list.filter(a => a.memberId === memberId);
    if (status && status !== 'all') list = list.filter(a => a.status === status);

    // Populate relations
    const enriched = list.map(a => {
      const project = memoryStore.projects.find(p => p.id === a.projectId);
      const role = memoryStore.roles.find(r => r.id === a.roleId);
      const member = memoryStore.users.find(u => u.id === a.memberId);
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

    const project = memoryStore.projects.find(p => p.id === projectId);
    const role = memoryStore.roles.find(r => r.id === roleId);
    const member = memoryStore.users.find(u => u.id === memberId);

    if (!project || !role || !member) {
      return res.status(404).json({ success: false, message: 'Specified Project, Role, or Member was not found' });
    }

    // Check existing pending assignment
    const existing = memoryStore.assignments.find(
      a => a.projectId === projectId && a.memberId === memberId && a.roleId === roleId && a.status === 'pending'
    );
    if (existing) {
      return res.status(400).json({ success: false, message: 'This member has already been assigned this pending role' });
    }

    const newAssignment = {
      id: `asgn-${Date.now()}`,
      _id: `asgn-${Date.now()}`,
      projectId,
      roleId,
      memberId,
      assignedBy: req.user?.id || 'admin',
      status: 'pending',
      assignedAt: new Date().toISOString()
    };

    memoryStore.assignments.unshift(newAssignment);

    // Send notification to assigned member
    memoryStore.notifications.unshift({
      id: `notif-${Date.now()}`,
      _id: `notif-${Date.now()}`,
      userId: memberId,
      title: 'New Role Assigned!',
      message: `You have been assigned as "${role.title}" for project "${project.title}". Please review and sign digital acknowledgement.`,
      type: 'assignment',
      read: false,
      link: '/member/roles',
      createdAt: new Date().toISOString()
    });

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

    // Notify admins
    const adminUser = memoryStore.users.find(u => u.role === 'admin');
    if (adminUser) {
      memoryStore.notifications.unshift({
        id: `notif-${Date.now()}`,
        _id: `notif-${Date.now()}`,
        userId: adminUser.id,
        title: `Assignment ${action.replace('_', ' ').toUpperCase()}`,
        message: `${member?.name} has ${action.replace('_', ' ')}ed the "${role?.title}" role in "${project?.title}".`,
        type: 'acceptance',
        read: false,
        link: '/admin/acknowledgements',
        createdAt: new Date().toISOString()
      });
    }

    return res.json({ success: true, message: `Assignment ${action}ed successfully`, assignment });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
