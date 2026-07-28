import { Router } from 'express';
import { getRoles, createRole, updateRole, deleteRole } from '../controllers/roleController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getRoles);
router.post('/', authenticateToken, requireRole(['admin']), createRole);
router.put('/:id', authenticateToken, requireRole(['admin']), updateRole);
router.delete('/:id', authenticateToken, requireRole(['admin']), deleteRole);

export default router;
