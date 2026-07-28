import { Router } from 'express';
import { exportExcelData, exportZipArchive, getSystemReports } from '../controllers/exportController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/excel', authenticateToken, requireRole(['admin']), exportExcelData);
router.get('/zip', authenticateToken, requireRole(['admin']), exportZipArchive);
router.get('/reports', authenticateToken, requireRole(['admin']), getSystemReports);

export default router;
