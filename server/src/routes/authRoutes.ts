import { Router } from 'express';
import { 
  login, 
  register, 
  getProfile, 
  updateProfile, 
  getAllMembers, 
  updateMemberStatus, 
  deleteMember 
} from '../controllers/authController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);

// Admin member management routes
router.get('/members', authenticateToken, requireRole(['admin']), getAllMembers);
router.put('/members/:id/status', authenticateToken, requireRole(['admin']), updateMemberStatus);
router.delete('/members/:id', authenticateToken, requireRole(['admin']), deleteMember);

export default router;
