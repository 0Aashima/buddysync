import { Router } from 'express';
import { triggerSOS, getAlerts, resolveAlert } from '../controllers/sosController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/trigger', protect, triggerSOS);
router.get('/alerts', protect, getAlerts);
router.patch('/resolve/:id', protect, resolveAlert);

export default router;