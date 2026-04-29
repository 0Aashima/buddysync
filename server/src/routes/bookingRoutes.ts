import pool from '../config/db';
import { Router } from 'express';

import {
  makeBooking,
  getBooking,
  getMyBookings,
  cancelBooking
} from '../controllers/bookingController';
import { AuthRequest, protect } from '../middleware/authMiddleware';
import { createBooking, getBookingById, getBookingsByUser, updateBookingStatus, checkBothAadhaarVerified, getTodayBooking } from '../models/bookingModel';
import { Response } from 'express';

const router = Router();

router.post('/', protect, makeBooking);
router.get('/my', protect, getMyBookings);
router.get('/today', protect, async (req: AuthRequest, res: Response) => {
  try {
    const booking = await getTodayBooking(req.user!.id);
    res.json({ booking: booking || null });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/upcoming', protect, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT b.*,
        c.name as client_name,
        cp.name as companion_name,
        cp.specialization
       FROM bookings b
       JOIN users c ON b.client_id = c.id
       JOIN users cp ON b.companion_id = cp.id
       WHERE (b.client_id = $1 OR b.companion_id = $1)
       AND b.date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
       AND b.status NOT IN ('cancelled', 'completed')
       ORDER BY b.date ASC, b.time ASC`,
      [req.user!.id]
    );
    res.json({ bookings: result.rows });
  } catch (error) {
    console.error('Upcoming bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/:id', protect, getBooking);
router.patch('/:id/accept', protect, async (req: AuthRequest, res: Response) => {
  try {
    const booking = await getBookingById(req.params.id as string);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }
    if (booking.companion_id !== req.user!.id) {
      res.status(403).json({ message: 'Only the companion can accept this booking' });
      return;
    }
    const updated = await updateBookingStatus(req.params.id as string, 'confirmed');

    const transporter = require('nodemailer').createTransport({
      host: 'smtp.gmail.com', port: 587, secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      tls: { rejectUnauthorized: false },
    });
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: booking.client_email,
      subject: 'Buddy4day — Booking Accepted!',
      text: `Hi ${booking.client_name},\n\nYour booking with ${booking.companion_name} has been accepted!\n\nLocation: ${booking.location}\nDate: ${new Date(booking.date).toLocaleDateString('en-IN')}\nTime: ${booking.time}\n\nPlease make payment to confirm your session.\n\nTeam Buddy4day`,
    });

    res.json({ message: 'Booking accepted', booking: updated });
  } catch (error) {
    console.error('Accept booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id/reject', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { reason } = req.body;
    const booking = await getBookingById(req.params.id as string);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }
    if (booking.companion_id !== req.user!.id) {
      res.status(403).json({ message: 'Only the companion can reject this booking' });
      return;
    }
    const updated = await updateBookingStatus(req.params.id as string, 'cancelled');
    res.json({ message: 'Booking rejected', booking: updated });
  } catch (error) {
    console.error('Reject booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.patch('/:id/cancel', protect, cancelBooking);

export default router;