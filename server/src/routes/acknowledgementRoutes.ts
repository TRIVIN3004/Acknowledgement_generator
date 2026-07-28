import { Router } from 'express';
import { createAcknowledgement, getAcknowledgements, verifyQRCode } from '../controllers/acknowledgementController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getAcknowledgements);
router.post('/', authenticateToken, createAcknowledgement);
router.get('/verify/:hash', verifyQRCode); // Public lookup verification route!

export default router;
