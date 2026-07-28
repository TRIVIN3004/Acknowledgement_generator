import { Router } from 'express';
import { 
  getAdminStats, 
  getMemberStats, 
  getNotifications, 
  markNotificationRead, 
  getAuditLogs 
} from '../controllers/dashboardController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/admin', authenticateToken, requireRole(['admin']), getAdminStats);
router.get('/member', authenticateToken, getMemberStats);
router.get('/notifications', authenticateToken, getNotifications);
router.put('/notifications/:id/read', authenticateToken, markNotificationRead);
router.get('/audit-logs', authenticateToken, requireRole(['admin']), getAuditLogs);

export default router;
