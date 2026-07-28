import { Router } from 'express';
import { getAssignments, createAssignment, respondToAssignment, updateAssignment, deleteAssignment } from '../controllers/assignmentController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getAssignments);
router.post('/', authenticateToken, requireRole(['admin']), createAssignment);
router.put('/:id/respond', authenticateToken, respondToAssignment);
router.put('/:id', authenticateToken, requireRole(['admin']), updateAssignment);
router.delete('/:id', authenticateToken, requireRole(['admin']), deleteAssignment);

export default router;
