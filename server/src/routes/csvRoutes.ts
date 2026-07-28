import { Router } from 'express';
import { importCSVData } from '../controllers/csvImportController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/import', authenticateToken, requireRole(['admin']), importCSVData);

export default router;
