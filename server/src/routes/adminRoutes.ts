import { Router } from 'express';
import { getAllBookings, getAllUsers, getAllPayments, updateUserKYC } from '../controllers/adminController';
import { protect } from '../middleware/authMiddleware';
import { adminOnly } from '../middleware/adminMiddleware';

const router = Router();

router.get('/bookings', protect, adminOnly, getAllBookings);
router.get('/users', protect, adminOnly, getAllUsers);
router.get('/payments', protect, adminOnly, getAllPayments);
router.patch('/kyc', protect, adminOnly, updateUserKYC);

export default router;