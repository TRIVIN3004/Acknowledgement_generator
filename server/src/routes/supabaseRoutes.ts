import { Router } from 'express';
import { syncFromSupabase } from '../controllers/supabaseController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/sync', authenticateToken, requireRole(['admin']), syncFromSupabase);

export default router;
