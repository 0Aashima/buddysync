import { Router } from 'express';
import { requestOTP, submitOTP } from '../controllers/otpController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/request', protect, requestOTP);
router.post('/verify', protect, submitOTP);

export default router;