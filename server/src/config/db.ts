import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { getInitialData } from '../data/initialSeed.js';

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

  constructor() {
    this.seed();
    this.load();
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
        console.log(`💾 [PRDAMS Data Engine] Loaded persistent store from disk (${this.acknowledgements.length} signed letters).`);
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
}

export const memoryStore = new InMemoryStore();

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.log('ℹ️ [PRDAMS Data Engine] MONGODB_URI not provided. Operating in-memory mode seamlessly.');
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
