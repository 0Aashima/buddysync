import pool from '../config/db';
import { Router } from 'express';
import { signup, login, requestPasswordReset, confirmPasswordReset, getProfile, updateProfile } from '../controllers/authController';
import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { authLimiter } from '../middleware/rateLimiter';
import { AuthRequest, protect } from '../middleware/authMiddleware';

const router = Router();

const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};
router.get('/user/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, name, gender, age, rating, kyc_status, is_online
       FROM users WHERE id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json({ user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', confirmPasswordReset);
router.get('/profile', protect, getProfile);
router.patch('/profile', protect, updateProfile);
router.post('/signup',
  authLimiter,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['client', 'companion']).withMessage('Role must be client or companion'),
  ],
  validate,
  signup
);

router.post('/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.delete('/account', protect, async (req: AuthRequest, res: Response) => {
  try {
    await pool.query(`DELETE FROM users WHERE id = $1`, [req.user!.id]);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
export default router;