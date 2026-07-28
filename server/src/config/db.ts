import mongoose from 'mongoose';
import { getInitialData } from '../data/initialSeed.js';

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
