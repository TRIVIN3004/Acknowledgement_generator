import { Router } from 'express';
import { 
  getProjects, 
  getProjectById, 
  createProject, 
  updateProject, 
  archiveProject, 
  deleteProject 
} from '../controllers/projectController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getProjects);
router.get('/:id', authenticateToken, getProjectById);
router.post('/', authenticateToken, requireRole(['admin']), createProject);
router.put('/:id', authenticateToken, requireRole(['admin']), updateProject);
router.put('/:id/archive', authenticateToken, requireRole(['admin']), archiveProject);
router.delete('/:id', authenticateToken, requireRole(['admin']), deleteProject);

export default router;
