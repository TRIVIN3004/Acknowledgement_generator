import { Response } from 'express';
import crypto from 'crypto';
import qrcode from 'qrcode';
import { memoryStore } from '../config/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const createAcknowledgement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { assignmentId, signatureType, signatureData, typedName, consentAccepted } = req.body;

    if (!assignmentId || !signatureType || !signatureData) {
      return res.status(400).json({ success: false, message: 'Assignment ID, signature type, and signature data are required' });
    }

    if (!consentAccepted) {
      return res.status(400).json({ success: false, message: 'You must check consent agreement before submitting' });
    }

    const assignment = memoryStore.assignments.find(a => a.id === assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment record not found' });
    }

    const project = memoryStore.projects.find(p => p.id === assignment.projectId);
    const role = memoryStore.roles.find(r => r.id === assignment.roleId);
    const member = memoryStore.users.find(u => u.id === assignment.memberId);

    // Generate unique verification code
    const randomHash = crypto.randomBytes(4).toString('hex').toUpperCase();
    const qrCodeHash = `PRDAMS-ACK-${randomHash}`;

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Modern Web Browser';

    const newAck = {
      id: `ack-${Date.now()}`,
      _id: `ack-${Date.now()}`,
      assignmentId,
      projectId: assignment.projectId,
      roleId: assignment.roleId,
      memberId: assignment.memberId,
      signatureType,
      signatureData,
      typedName: typedName || member?.name,
      ipAddress: Array.isArray(clientIp) ? clientIp[0] : String(clientIp),
      userAgent,
      consentAccepted: true,
      timestamp: new Date().toISOString(),
      qrCodeHash,
      pdfUrl: `/api/acknowledgements/verify/${qrCodeHash}`
    };

    memoryStore.acknowledgements.unshift(newAck);

    // Update assignment status to accepted if not already
    assignment.status = 'accepted';
    assignment.respondedAt = new Date().toISOString();

    if (project && !project.timeline.acceptedAt) {
      project.timeline.acceptedAt = new Date().toISOString();
    }

    // Log activity
    memoryStore.auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'DIGITAL_ACKNOWLEDGEMENT_SIGNED',
      performedBy: member?.id || req.user?.id || 'user',
      performedByName: member?.name || req.user?.name || 'Member',
      performedByRole: 'member',
      targetType: 'ACKNOWLEDGEMENT',
      targetId: newAck.id,
      details: `Digitally signed role acknowledgement for "${role?.title}" in "${project?.title}". Verification Hash: ${qrCodeHash}`,
      timestamp: new Date().toISOString()
    });

    return res.status(201).json({
      success: true,
      message: 'Digital Acknowledgement successfully recorded and verified',
      acknowledgement: newAck
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAcknowledgements = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { projectId, roleId, memberId, search } = req.query;

    let list = [...memoryStore.acknowledgements];

    if (projectId) list = list.filter(a => a.projectId === projectId);
    if (roleId) list = list.filter(a => a.roleId === roleId);
    if (memberId) list = list.filter(a => a.memberId === memberId);

    const enriched = list.map(ack => {
      const project = memoryStore.projects.find(p => p.id === ack.projectId);
      const role = memoryStore.roles.find(r => r.id === ack.roleId);
      const member = memoryStore.users.find(u => u.id === ack.memberId);
      const assignment = memoryStore.assignments.find(a => a.id === ack.assignmentId);

      return {
        ...ack,
        project,
        role,
        member: member ? { id: member.id, name: member.name, email: member.email, memberId: member.memberId, department: member.department } : null,
        assignment
      };
    });

    let filtered = enriched;
    if (search) {
      const q = (search as string).toLowerCase();
      filtered = enriched.filter(item => 
        item.project?.title?.toLowerCase().includes(q) ||
        item.role?.title?.toLowerCase().includes(q) ||
        item.member?.name?.toLowerCase().includes(q) ||
        item.qrCodeHash.toLowerCase().includes(q)
      );
    }

    return res.json({ success: true, count: filtered.length, acknowledgements: filtered });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyQRCode = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { hash } = req.params;
    const ack = memoryStore.acknowledgements.find(a => a.qrCodeHash === hash);

    if (!ack) {
      return res.status(404).json({ success: false, message: 'Invalid or unknown Verification Hash' });
    }

    const project = memoryStore.projects.find(p => p.id === ack.projectId);
    const role = memoryStore.roles.find(r => r.id === ack.roleId);
    const member = memoryStore.users.find(u => u.id === ack.memberId);

    return res.json({
      success: true,
      verified: true,
      verificationData: {
        hash: ack.qrCodeHash,
        timestamp: ack.timestamp,
        ipAddress: ack.ipAddress,
        consentAccepted: ack.consentAccepted,
        signatureType: ack.signatureType,
        project: project ? { title: project.title, category: project.category, technologyStack: project.technologyStack } : null,
        role: role ? { title: role.title, department: role.department, responsibilities: role.responsibilities } : null,
        member: member ? { name: member.name, email: member.email, memberId: member.memberId, college: member.college } : null
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
