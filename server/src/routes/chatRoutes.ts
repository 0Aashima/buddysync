import { Router } from 'express';
import { getChatHistory } from '../controllers/chatController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.get('/:bookingId/messages', protect, getChatHistory);

export default router;