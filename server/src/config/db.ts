import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { getInitialData } from '../data/initialSeed.js';
import { supabase } from './supabase.js';

const getStoreFilePath = () => {
  const inServerData = path.join(process.cwd(), 'server', 'data');
  if (fs.existsSync(inServerData)) {
    return path.join(inServerData, 'persistent_store.json');
  }
  return path.join(process.cwd(), 'data', 'persistent_store.json');
};

const storeFilePath = getStoreFilePath();

class InMemoryStore {
  users: any[] = [];
  projects: any[] = [];
  roles: any[] = [];
  assignments: any[] = [];
  acknowledgements: any[] = [];
  notifications: any[] = [];
  auditLogs: any[] = [];
  isInMemoryMode = true;
  lastSupabaseSync: number = 0;

  constructor() {
    this.seed();
    this.load();
    this.syncInitialFromSupabase();
  }

  seed() {
    const initial = getInitialData();
    this.users = initial.users;
    this.projects = initial.projects;
    this.roles = initial.roles;
    this.assignments = initial.assignments;
    this.acknowledgements = initial.acknowledgements;
    this.notifications = initial.notifications;
    this.auditLogs = initial.auditLogs;
    console.log('⚡ [PRDAMS Data Engine] In-Memory Data Store Seeded Successfully.');
  }

  load() {
    try {
      if (fs.existsSync(storeFilePath)) {
        const raw = fs.readFileSync(storeFilePath, 'utf-8');
        const data = JSON.parse(raw);
        if (data.users && data.users.length > 0) {
          data.users.forEach((u: any) => {
            const idx = this.users.findIndex(x => x.id === u.id || x.email?.toLowerCase() === (u.email || '').toLowerCase());
            if (idx !== -1) this.users[idx] = { ...this.users[idx], ...u };
            else this.users.push(u);
          });
        }
        if (data.projects && data.projects.length > 0) {
          data.projects.forEach((p: any) => {
            const idx = this.projects.findIndex(x => x.id === p.id || x.title?.toLowerCase() === (p.title || '').toLowerCase());
            if (idx !== -1) this.projects[idx] = { ...this.projects[idx], ...p };
            else this.projects.push(p);
          });
        }
        if (data.roles && data.roles.length > 0) {
          data.roles.forEach((r: any) => {
            const idx = this.roles.findIndex(x => x.id === r.id || x.title?.toLowerCase() === (r.title || '').toLowerCase());
            if (idx !== -1) this.roles[idx] = { ...this.roles[idx], ...r };
            else this.roles.push(r);
          });
        }
        if (data.assignments && data.assignments.length > 0) {
          data.assignments.forEach((a: any) => {
            const idx = this.assignments.findIndex(x => x.id === a.id);
            if (idx !== -1) this.assignments[idx] = { ...this.assignments[idx], ...a };
            else this.assignments.push(a);
          });
        }
        if (Array.isArray(data.acknowledgements) && data.acknowledgements.length > 0) {
          data.acknowledgements.forEach((k: any) => {
            const idx = this.acknowledgements.findIndex(x => x.id === k.id || (k.assignmentId && x.assignmentId === k.assignmentId));
            if (idx !== -1) this.acknowledgements[idx] = { ...this.acknowledgements[idx], ...k };
            else this.acknowledgements.push(k);
          });
        }
        if (Array.isArray(data.notifications)) this.notifications = data.notifications;
        if (Array.isArray(data.auditLogs)) this.auditLogs = data.auditLogs;
        console.log(`💾 [PRDAMS Data Engine] Loaded persistent store from disk (${this.projects.length} projects, ${this.assignments.length} assignments, ${this.acknowledgements.length} signed letters, ${this.users.length} users).`);
      }
    } catch (e) {
      console.warn('⚠️ Failed to load persistent_store.json:', e);
    }
  }

  save() {
    try {
      const dir = path.dirname(storeFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const data = {
        users: this.users,
        projects: this.projects,
        roles: this.roles,
        assignments: this.assignments,
        acknowledgements: this.acknowledgements,
        notifications: this.notifications,
        auditLogs: this.auditLogs
      };
      fs.writeFileSync(storeFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.warn('⚠️ Failed to save persistent_store.json:', e);
    }
  }

  async syncInitialFromSupabase() {
    if (!supabase) return;
    try {
      console.log('🔄 [PRDAMS Data Engine] Executing complete sync from Supabase...');
      const [usersRes, projRes, rolesRes, asgnRes, ackRes] = await Promise.all([
        supabase.from('users').select('*').limit(1000),
        supabase.from('projects').select('*').limit(1000),
        supabase.from('roles').select('*').limit(1000),
        supabase.from('assignments').select('*').limit(1000),
        supabase.from('acknowledgements').select('*').limit(1000)
      ]);

      // 1. Sync Users
      if (usersRes.data && usersRes.data.length > 0) {
        usersRes.data.forEach((u: any) => {
          const idx = this.users.findIndex(x => 
            x.id === u.id || 
            (x.email && u.email && x.email.toLowerCase() === u.email.toLowerCase())
          );
          const formatted = {
            id: u.id,
            _id: u.id,
            name: u.name || u.full_name || 'Team Member',
            email: u.email,
            passwordHash: u.password_hash,
            role: u.role || 'member',
            department: u.department || 'Software Engineering',
            college: u.college || 'Institute of Technology',
            phone: u.phone || '+1 (555) 000-0000',
            skills: Array.isArray(u.skills) ? u.skills : [],
            status: u.status || 'active',
            memberId: u.member_id || (idx !== -1 ? this.users[idx].memberId : 'DEV-101'),
            avatarUrl: u.avatar_url || '',
            defaultSignature: u.default_signature,
            createdAt: u.created_at || new Date().toISOString()
          };
          if (idx !== -1) {
            const oldId = this.users[idx].id;
            this.users[idx] = { ...this.users[idx], ...formatted };
            if (oldId && oldId !== u.id) {
              this.assignments.forEach(a => { if (a.memberId === oldId) a.memberId = u.id; });
              this.acknowledgements.forEach(k => { if (k.memberId === oldId) k.memberId = u.id; });
            }
          } else {
            this.users.push(formatted);
          }
        });
      }

      // 2. Sync Roles
      if (rolesRes.data && rolesRes.data.length > 0) {
        rolesRes.data.forEach((r: any) => {
          const idx = this.roles.findIndex(x => 
            x.id === r.id || 
            (x.title && r.title && x.title.toLowerCase() === r.title.toLowerCase())
          );
          const formatted = {
            id: r.id,
            _id: r.id,
            title: r.title,
            category: r.category || 'Engineering',
            department: r.department || 'Software Development',
            responsibilities: Array.isArray(r.responsibilities) ? r.responsibilities : [],
            requiredSkills: Array.isArray(r.required_skills) ? r.required_skills : [],
            description: r.description || `Professional ${r.title} role.`,
            createdAt: r.created_at || new Date().toISOString()
          };
          if (idx !== -1) {
            const oldId = this.roles[idx].id;
            this.roles[idx] = { ...this.roles[idx], ...formatted };
            if (oldId && oldId !== r.id) {
              this.assignments.forEach(a => { if (a.roleId === oldId) a.roleId = r.id; });
              this.acknowledgements.forEach(k => { if (k.roleId === oldId) k.roleId = r.id; });
            }
          } else {
            this.roles.push(formatted);
          }
        });
      }

      // 3. Sync Projects
      if (projRes.data && projRes.data.length > 0) {
        projRes.data.forEach((p: any) => {
          const idx = this.projects.findIndex(x => 
            x.id === p.id || 
            (x.title && p.title && x.title.toLowerCase() === p.title.toLowerCase())
          );
          const techStack = Array.isArray(p.technology_stack) ? p.technology_stack : (Array.isArray(p.tech_stack) ? p.tech_stack : ['React', 'TypeScript']);
          const formatted = {
            id: p.id,
            _id: p.id,
            title: p.title,
            description: p.description || `Enterprise ${p.title} software platform.`,
            category: p.category || 'Enterprise Web Application',
            technologyStack: techStack,
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
          if (idx !== -1) {
            const oldId = this.projects[idx].id;
            this.projects[idx] = { ...this.projects[idx], ...formatted };
            if (oldId && oldId !== p.id) {
              this.assignments.forEach(a => { if (a.projectId === oldId) a.projectId = p.id; });
              this.acknowledgements.forEach(k => { if (k.projectId === oldId) k.projectId = p.id; });
            }
          } else {
            this.projects.push(formatted);
          }
        });
      }

      // 4. Sync Assignments
      if (asgnRes.data && asgnRes.data.length > 0) {
        asgnRes.data.forEach((a: any) => {
          const idx = this.assignments.findIndex(x => x.id === a.id);
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
          if (idx !== -1) this.assignments[idx] = { ...this.assignments[idx], ...formatted };
          else this.assignments.push(formatted);
        });
      }

      // 5. Sync Acknowledgements
      if (ackRes.data && ackRes.data.length > 0) {
        ackRes.data.forEach((k: any) => {
          const assignment = this.assignments.find(a => a.id === k.assignment_id);
          let memberId = k.member_id || assignment?.memberId;
          let projectId = k.project_id || assignment?.projectId;
          let roleId = k.role_id || assignment?.roleId;

          if (!memberId && k.typed_name) {
            const matchedUser = this.users.find(u => u.name?.toLowerCase() === k.typed_name.toLowerCase());
            if (matchedUser) memberId = matchedUser.id;
          }

          const idx = this.acknowledgements.findIndex(x => x.id === k.id || x.qrCodeHash === k.qr_code_hash);
          const formatted = {
            id: k.id,
            _id: k.id,
            assignmentId: k.assignment_id,
            projectId: projectId,
            roleId: roleId,
            memberId: memberId,
            signatureType: k.signature_type || 'draw',
            signatureData: k.signature_data,
            typedName: k.typed_name,
            ipAddress: k.ip_address || '127.0.0.1',
            userAgent: k.user_agent || 'Mozilla/5.0 Web Browser',
            timestamp: k.timestamp || new Date().toISOString(),
            qrCodeHash: k.qr_code_hash,
            pdfUrl: k.pdf_url || `/api/acknowledgements/verify/${k.qr_code_hash}`,
            consentAccepted: true
          };

          if (idx !== -1) this.acknowledgements[idx] = { ...this.acknowledgements[idx], ...formatted };
          else this.acknowledgements.unshift(formatted);

          // Update assignment status to accepted if acknowledgement exists
          if (assignment) {
            assignment.status = 'accepted';
            if (!assignment.respondedAt) assignment.respondedAt = formatted.timestamp;
          }
        });
      }

      this.lastSupabaseSync = Date.now();
      this.save();
      console.log(`✅ [PRDAMS Data Engine] Supabase Full Sync Completed (${this.projects.length} projects, ${this.assignments.length} assignments, ${this.acknowledgements.length} signed letters, ${this.users.length} users).`);
    } catch (err: any) {
      console.warn('ℹ️ [PRDAMS Data Engine] Supabase startup sync notice (operating locally):', err.message);
    }
  }
}

export const memoryStore = new InMemoryStore();

export const connectDB = async () => {
  await memoryStore.syncInitialFromSupabase();

  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.log('ℹ️ [PRDAMS Data Engine] Operating in ultra-fast in-memory + cached persistence mode.');
    return;
  }

  try {
    await mongoose.connect(mongoURI);
    memoryStore.isInMemoryMode = false;
    console.log('✅ [PRDAMS Data Engine] MongoDB Connected Successfully.');
  } catch (error) {
    console.warn('⚠️ [PRDAMS Data Engine] MongoDB connection failed. Falling back to robust In-Memory Store.', error);
  }
};


