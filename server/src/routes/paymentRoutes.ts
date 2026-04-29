import { Router } from 'express';
import {
  initiatePayment,
  confirmPayment,
  releasePayment,
  getPaymentStatus,
  getMyPayments
} from '../controllers/paymentController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/initiate', protect, initiatePayment);
router.post('/confirm', protect, confirmPayment);
router.post('/release', protect, releasePayment);
router.get('/my', protect, getMyPayments);
router.get('/:bookingId', protect, getPaymentStatus);

export default router;