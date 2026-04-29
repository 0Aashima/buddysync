import pool from '../config/db';
import { Response } from 'express';
import { Router } from 'express';
import { listCompanions, getCompanion } from '../controllers/companionController';
import { AuthRequest, protect } from '../middleware/authMiddleware';

const router = Router();
router.get('/nearby', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      res.status(400).json({ message: 'Location required' });
      return;
    }
    const result = await pool.query(
      `SELECT id, name, specialization, rating, kyc_status, is_online,
        user_lat, user_lng,
        (6371 * acos(
          cos(radians($1)) * cos(radians(user_lat)) *
          cos(radians(user_lng) - radians($2)) +
          sin(radians($1)) * sin(radians(user_lat))
        )) AS distance
       FROM users
       WHERE role = 'companion'
       AND user_lat IS NOT NULL
       AND user_lng IS NOT NULL
       HAVING (6371 * acos(
          cos(radians($1)) * cos(radians(user_lat)) *
          cos(radians(user_lng) - radians($2)) +
          sin(radians($1)) * sin(radians(user_lat))
        )) < 10
       ORDER BY distance ASC
       LIMIT 10`,
      [parseFloat(lat as string), parseFloat(lng as string)]
    );
    res.json({ companions: result.rows });
  } catch (error) {
    console.error('Nearby companions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/', protect, listCompanions);
router.get('/:id', protect, getCompanion);
router.post('/save/:companionId', protect, async (req: AuthRequest, res: Response) => {
  try {
    await pool.query(
      `INSERT INTO saved_companions (user_id, companion_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [req.user!.id, req.params.companionId]
    );
    res.json({ message: 'Companion saved' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/save/:companionId', protect, async (req: AuthRequest, res: Response) => {
  try {
    await pool.query(
      `DELETE FROM saved_companions WHERE user_id = $1 AND companion_id = $2`,
      [req.user!.id, req.params.companionId]
    );
    res.json({ message: 'Companion unsaved' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/saved', protect, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.specialization, u.rating, u.kyc_status, u.is_online
       FROM saved_companions sc
       JOIN users u ON sc.companion_id = u.id
       WHERE sc.user_id = $1
       ORDER BY sc.created_at DESC`,
      [req.user!.id]
    );
    res.json({ companions: result.rows });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;