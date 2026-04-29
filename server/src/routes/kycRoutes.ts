import { Router } from 'express';
import { submitAadhaar, getKYCStatus } from '../controllers/kycController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/verify', protect, submitAadhaar);
router.get('/status', protect, getKYCStatus);

export default router;