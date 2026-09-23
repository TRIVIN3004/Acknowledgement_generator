import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { getInitialData } from '../data/initialSeed.js';
import { supabase } from './supabase.js';

const storeFilePath = path.join(process.cwd(), 'data', 'persistent_store.json');

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
        if (data.users && data.users.length > 0) this.users = data.users;
        if (data.projects && data.projects.length > 0) this.projects = data.projects;
        if (data.roles && data.roles.length > 0) this.roles = data.roles;
        if (data.assignments && data.assignments.length > 0) this.assignments = data.assignments;
        if (Array.isArray(data.acknowledgements)) this.acknowledgements = data.acknowledgements;
        if (Array.isArray(data.notifications)) this.notifications = data.notifications;
        if (Array.isArray(data.auditLogs)) this.auditLogs = data.auditLogs;
        console.log(`💾 [PRDAMS Data Engine] Loaded persistent store from disk (${this.acknowledgements.length} signed letters, ${this.users.length} users).`);
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
      console.log('🔄 [PRDAMS Data Engine] Executing cached startup sync from Supabase...');
      const [usersRes, projRes, rolesRes, asgnRes, ackRes] = await Promise.all([
        supabase.from('users').select('*').limit(200),
        supabase.from('projects').select('*').limit(200),
        supabase.from('roles').select('*').limit(200),
        supabase.from('assignments').select('*').limit(300),
        supabase.from('acknowledgements').select('*').limit(300)
      ]);

      if (usersRes.data && usersRes.data.length > 0) {
        usersRes.data.forEach((u: any) => {
          const idx = this.users.findIndex(x => x.email?.toLowerCase() === (u.email || '').toLowerCase() || x.id === u.id);
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
            skills: u.skills || [],
            status: u.status || 'active',
            memberId: u.member_id || 'DEV-101',
            avatarUrl: u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.name || 'user')}`,
            defaultSignature: u.default_signature,
            createdAt: u.created_at || new Date().toISOString()
          };
          if (idx !== -1) this.users[idx] = { ...this.users[idx], ...formatted };
          else this.users.push(formatted);
        });
      }

      if (projRes.data && projRes.data.length > 0) {
        projRes.data.forEach((p: any) => {
          const idx = this.projects.findIndex(x => x.id === p.id || x.title?.toLowerCase() === (p.title || '').toLowerCase());
          const formatted = {
            id: p.id,
            _id: p.id,
            title: p.title,
            description: p.description,
            category: p.category || 'Enterprise Web Application',
            technologyStack: Array.isArray(p.technology_stack) ? p.technology_stack : (Array.isArray(p.tech_stack) ? p.tech_stack : ['React', 'TypeScript']),
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
          if (idx !== -1) this.projects[idx] = { ...this.projects[idx], ...formatted };
          else this.projects.unshift(formatted);
        });
      }

      if (rolesRes.data && rolesRes.data.length > 0) {
        rolesRes.data.forEach((r: any) => {
          const idx = this.roles.findIndex(x => x.id === r.id || x.title?.toLowerCase() === (r.title || '').toLowerCase());
          const formatted = {
            id: r.id,
            _id: r.id,
            title: r.title,
            category: r.category || 'Engineering',
            department: r.department || 'Software Development',
            responsibilities: r.responsibilities || [],
            requiredSkills: r.required_skills || [],
            description: r.description || `Professional ${r.title} role.`,
            createdAt: r.created_at || new Date().toISOString()
          };
          if (idx !== -1) this.roles[idx] = { ...this.roles[idx], ...formatted };
          else this.roles.unshift(formatted);
        });
      }

      if (ackRes.data && ackRes.data.length > 0) {
        ackRes.data.forEach((k: any) => {
          const idx = this.acknowledgements.findIndex(x => x.id === k.id || x.qrCodeHash === k.qr_code_hash);
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
            qrCodeHash: k.qr_code_hash,
            pdfUrl: k.pdf_url,
            consentAccepted: true
          };
          if (idx !== -1) this.acknowledgements[idx] = { ...this.acknowledgements[idx], ...formatted };
          else this.acknowledgements.unshift(formatted);
        });
      }

      if (asgnRes.data && asgnRes.data.length > 0) {
        asgnRes.data.forEach((a: any) => {
          const hasAck = Boolean(
            a.id && this.acknowledgements.some((k: any) => k.assignmentId === a.id)
          );
          const idx = this.assignments.findIndex(x => x.id === a.id);
          const formatted = {
            id: a.id,
            _id: a.id,
            projectId: a.project_id,
            roleId: a.role_id,
            memberId: a.member_id,
            assignedBy: a.assigned_by,
            status: hasAck ? 'accepted' : (a.status || 'pending'),
            changeNote: a.change_note,
            assignedAt: a.assigned_at || a.created_at || new Date().toISOString(),
            respondedAt: a.responded_at
          };
          if (idx !== -1) this.assignments[idx] = { ...this.assignments[idx], ...formatted };
          else this.assignments.unshift(formatted);
        });
      }

      this.lastSupabaseSync = Date.now();
      this.save();
      console.log('✅ [PRDAMS Data Engine] Startup Supabase Sync Completed. Egress optimized.');
    } catch (err: any) {
      console.warn('ℹ️ [PRDAMS Data Engine] Supabase startup sync notice (operating locally):', err.message);
    }
  }
}

export const memoryStore = new InMemoryStore();

export const connectDB = async () => {
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

