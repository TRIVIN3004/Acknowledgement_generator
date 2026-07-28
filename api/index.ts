import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from '../server/src/config/db.js';

import authRoutes from '../server/src/routes/authRoutes.js';
import projectRoutes from '../server/src/routes/projectRoutes.js';
import roleRoutes from '../server/src/routes/roleRoutes.js';
import assignmentRoutes from '../server/src/routes/assignmentRoutes.js';
import acknowledgementRoutes from '../server/src/routes/acknowledgementRoutes.js';
import dashboardRoutes from '../server/src/routes/dashboardRoutes.js';
import exportRoutes from '../server/src/routes/exportRoutes.js';
import supabaseRoutes from '../server/src/routes/supabaseRoutes.js';
import csvRoutes from '../server/src/routes/csvRoutes.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/acknowledgements', acknowledgementRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/supabase', supabaseRoutes);
app.use('/api/csv', csvRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Project Role & Digital Acknowledgement Management System (PRDAMS)',
    timestamp: new Date().toISOString()
  });
});

connectDB();

export default app;
