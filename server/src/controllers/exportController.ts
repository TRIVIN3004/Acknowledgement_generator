import { Response } from 'express';
import { memoryStore } from '../config/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const exportExcelData = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = memoryStore.acknowledgements.map(ack => {
      const project = memoryStore.projects.find(p => p.id === ack.projectId);
      const role = memoryStore.roles.find(r => r.id === ack.roleId);
      const member = memoryStore.users.find(u => u.id === ack.memberId);

      return {
        'Acknowledgement ID': ack.id,
        'Verification Hash': ack.qrCodeHash,
        'Member Name': member?.name || 'N/A',
        'Member Email': member?.email || 'N/A',
        'Department': member?.department || 'N/A',
        'Project Name': project?.title || 'N/A',
        'Assigned Role': role?.title || 'N/A',
        'Signature Type': ack.signatureType.toUpperCase(),
        'Acceptance Date': new Date(ack.timestamp).toLocaleDateString(),
        'IP Address': ack.ipAddress,
        'Consent Status': ack.consentAccepted ? 'VERIFIED_CONSENT' : 'NO'
      };
    });

    return res.json({
      success: true,
      filename: `PRDAMS_Digital_Acknowledgements_${Date.now()}.csv`,
      data: list
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const exportZipArchive = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const archives = memoryStore.acknowledgements.map(ack => {
      const project = memoryStore.projects.find(p => p.id === ack.projectId);
      const role = memoryStore.roles.find(r => r.id === ack.roleId);
      const member = memoryStore.users.find(u => u.id === ack.memberId);

      return {
        filename: `Acknowledgement_${member?.name?.replace(/\s+/g, '_')}_${project?.title?.replace(/\s+/g, '_')}.pdf`,
        hash: ack.qrCodeHash,
        member: member?.name,
        project: project?.title,
        role: role?.title,
        date: ack.timestamp
      };
    });

    return res.json({
      success: true,
      message: 'Archive generated',
      zipFilename: `PRDAMS_Letters_Bundle_${Date.now()}.zip`,
      files: archives
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getSystemReports = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const totalMembers = memoryStore.users.filter(u => u.role === 'member').length;
    const totalProjects = memoryStore.projects.length;
    const totalRoles = memoryStore.roles.length;
    const totalAssignments = memoryStore.assignments.length;
    const acceptedCount = memoryStore.assignments.filter(a => a.status === 'accepted').length;
    const pendingCount = memoryStore.assignments.filter(a => a.status === 'pending').length;
    const rejectedCount = memoryStore.assignments.filter(a => a.status === 'rejected').length;
    const totalDownloads = memoryStore.acknowledgements.length;

    const acceptanceRate = totalAssignments > 0 ? Math.round((acceptedCount / totalAssignments) * 100) : 100;

    return res.json({
      success: true,
      reports: {
        totalMembers,
        totalProjects,
        totalRoles,
        totalAssignments,
        acceptedCount,
        pendingCount,
        rejectedCount,
        acceptanceRate,
        totalDownloads
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
