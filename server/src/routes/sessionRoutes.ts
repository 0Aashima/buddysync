import pool from '../config/db';
import { Response } from 'express';
import { Router } from 'express';
import { completeSession, submitReview, getCompanionReviews } from '../controllers/sessionController';
import { AuthRequest, protect } from '../middleware/authMiddleware';

const router = Router();
router.get('/reviews/client/:clientId', protect, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT r.*, u.name as reviewer_name
       FROM reviews r
       JOIN bookings b ON r.booking_id = b.id
       JOIN users u ON r.reviewer_id = u.id
       WHERE b.client_id = $1 AND r.reviewer_id = b.companion_id
       ORDER BY r.created_at DESC`,
      [req.params.clientId]
    );
    res.json({ reviews: result.rows });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
router.post('/complete', protect, completeSession);
router.post('/review', protect, submitReview);
router.get('/reviews/:companionId', protect, getCompanionReviews);

export default router;