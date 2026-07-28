import { Response } from 'express';
import crypto from 'crypto';
import qrcode from 'qrcode';
import { memoryStore } from '../config/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

export const createAcknowledgement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { assignmentId, signatureType, signatureData, typedName, consentAccepted } = req.body;

    if (!assignmentId || !signatureType || !signatureData) {
      return res.status(400).json({ success: false, message: 'Assignment ID, signature type, and signature data are required' });
    }

    if (!consentAccepted) {
      return res.status(400).json({ success: false, message: 'You must check consent agreement before submitting' });
    }

    // Locate assignment (check memoryStore or Supabase)
    let assignment = memoryStore.assignments.find(a => a.id === assignmentId);
    if (!assignment && supabase) {
      try {
        const { data } = await supabase.from('assignments').select('*').eq('id', assignmentId).maybeSingle();
        if (data) {
          assignment = {
            id: data.id,
            _id: data.id,
            projectId: data.project_id,
            roleId: data.role_id,
            memberId: data.member_id,
            assignedBy: data.assigned_by,
            status: data.status || 'pending',
            assignedAt: data.assigned_at || data.created_at || new Date().toISOString()
          };
          memoryStore.assignments.unshift(assignment);
        }
      } catch (err) {
        console.warn('Supabase assignment lookup notice:', err);
      }
    }

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment record not found' });
    }

    // Locate project, role, member
    let project = memoryStore.projects.find(p => p.id === assignment.projectId);
    let role = memoryStore.roles.find(r => r.id === assignment.roleId);
    let member = memoryStore.users.find(u => u.id === assignment.memberId || u.email.toLowerCase() === String(assignment.memberId).toLowerCase());

    if (!project && supabase) {
      try {
        const { data } = await supabase.from('projects').select('*').eq('id', assignment.projectId).maybeSingle();
        if (data) {
          project = {
            id: data.id,
            _id: data.id,
            title: data.title,
            description: data.description,
            category: data.category || 'Enterprise Web Application',
            technologyStack: Array.isArray(data.technology_stack) ? data.technology_stack : ['React', 'TypeScript'],
            leadName: data.lead_name || 'Admin',
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

    if (!role && supabase) {
      try {
        const { data } = await supabase.from('roles').select('*').eq('id', assignment.roleId).maybeSingle();
        if (data) {
          role = {
            id: data.id,
            _id: data.id,
            title: data.title,
            category: data.category || 'Engineering',
            department: data.department || 'Software Development',
            responsibilities: data.responsibilities || [],
            requiredSkills: data.required_skills || [],
            description: data.description || `Role ${data.title}`
          };
          memoryStore.roles.unshift(role);
        }
      } catch (err) {
        console.warn('Supabase role lookup error:', err);
      }
    }

    if (!member && supabase) {
      try {
        const { data } = await supabase.from('users').select('*').eq('id', assignment.memberId).maybeSingle();
        if (data) {
          member = {
            id: data.id,
            _id: data.id,
            name: data.name,
            email: data.email,
            role: data.role || 'member',
            department: data.department,
            college: data.college,
            avatarUrl: data.avatar_url,
            memberId: data.member_id
          };
          memoryStore.users.push(member);
        }
      } catch (err) {
        console.warn('Supabase member lookup error:', err);
      }
    }

    // Generate unique verification code
    const randomHash = crypto.randomBytes(4).toString('hex').toUpperCase();
    const qrCodeHash = `PRDAMS-ACK-${randomHash}`;

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Modern Web Browser';

    const newAck: any = {
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

    if (supabase) {
      try {
        const { data: supaData, error } = await supabase.from('acknowledgements').insert([{
          assignment_id: newAck.assignmentId,
          project_id: newAck.projectId,
          role_id: newAck.roleId,
          member_id: newAck.memberId,
          signature_type: newAck.signatureType,
          signature_data: newAck.signatureData,
          typed_name: newAck.typedName,
          ip_address: newAck.ipAddress,
          user_agent: newAck.userAgent,
          consent_accepted: true,
          qr_code_hash: newAck.qrCodeHash,
          pdf_url: newAck.pdfUrl
        }]).select();

        if (!error && supaData && supaData[0]) {
          newAck.id = supaData[0].id;
          newAck._id = supaData[0].id;
        }

        // Also update assignment status to accepted in Supabase
        await supabase.from('assignments').update({
          status: 'accepted',
          responded_at: new Date().toISOString()
        }).match({ id: assignment.id });
      } catch (err) {
        console.warn('Supabase createAcknowledgement notice:', err);
      }
    }

    memoryStore.acknowledgements.unshift(newAck);

    // Update assignment status to accepted in memoryStore
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
      details: `Digitally signed role acknowledgement for "${role?.title || 'Role'}" in "${project?.title || 'Project'}". Verification Hash: ${qrCodeHash}`,
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

        if (asgnRes.data) {
          asgnRes.data.forEach((a: any) => {
            const formatted = {
              id: a.id,
              _id: a.id,
              projectId: a.project_id,
              roleId: a.role_id,
              memberId: a.member_id,
              assignedBy: a.assigned_by,
              status: a.status || 'pending',
              changeNote: a.change_note,
              assignedAt: a.assigned_at || a.created_at || new Date().toISOString()
            };
            const idx = memoryStore.assignments.findIndex(x => x.id === formatted.id);
            if (idx !== -1) memoryStore.assignments[idx] = formatted;
            else memoryStore.assignments.unshift(formatted);
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
      } catch (err) {
        console.warn('Supabase getAcknowledgements sync notice:', err);
      }
    }

    const { projectId, roleId, memberId, search } = req.query;
    const currentUser = req.user;

    let list = [...memoryStore.acknowledgements];

    if (projectId) list = list.filter(a => a.projectId === projectId);
    if (roleId) list = list.filter(a => a.roleId === roleId);

    const targetMemberQuery = memberId || (currentUser?.role === 'member' ? currentUser?.id : null);
    if (targetMemberQuery) {
      const matchedUser = memoryStore.users.find(
        u => u.id === targetMemberQuery || 
             u.email.toLowerCase() === String(targetMemberQuery).toLowerCase() ||
             u.id === currentUser?.id ||
             u.email.toLowerCase() === currentUser?.email?.toLowerCase()
      );

      const targetEmails = new Set([
        currentUser?.email?.toLowerCase(),
        matchedUser?.email?.toLowerCase(),
        String(targetMemberQuery).toLowerCase()
      ].filter(Boolean));

      const targetIds = new Set([
        currentUser?.id,
        matchedUser?.id,
        matchedUser?._id,
        String(targetMemberQuery)
      ].filter(Boolean));

      list = list.filter(a => {
        if (targetIds.has(a.memberId)) return true;
        if (targetEmails.has(String(a.memberId).toLowerCase())) return true;
        const assignedUser = memoryStore.users.find(u => u.id === a.memberId || u.email.toLowerCase() === String(a.memberId).toLowerCase());
        if (assignedUser) {
          if (targetEmails.has(assignedUser.email.toLowerCase())) return true;
          if (targetIds.has(assignedUser.id)) return true;
        }
        return false;
      });
    }

    const enriched = list.map(ack => {
      const assignment = memoryStore.assignments.find(a => a.id === ack.assignmentId);
      const project = memoryStore.projects.find(p => p.id === ack.projectId || p.id === assignment?.projectId);
      const role = memoryStore.roles.find(r => r.id === ack.roleId || r.id === assignment?.roleId);
      const member = memoryStore.users.find(u => u.id === ack.memberId || u.id === assignment?.memberId || u.email.toLowerCase() === String(ack.memberId).toLowerCase());

      return {
        ...ack,
        project: project || {
          title: 'Nexora AI Platform',
          description: 'Enterprise AI & Software Engineering Platform.',
          category: 'Software Engineering',
          technologyStack: ['React', 'TypeScript', 'Node.js', 'Python'],
          deadline: '2026-12-31'
        },
        role: role || {
          title: 'Software Engineer',
          department: 'Engineering',
          responsibilities: ['Architect and build scalable web components', 'Ensure high system performance and digital signature verification']
        },
        member: member ? { id: member.id, name: member.name, email: member.email, memberId: member.memberId, department: member.department, college: member.college } : null,
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
