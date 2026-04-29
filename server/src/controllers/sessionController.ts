import pool from '../config/db';
import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { getBookingById, updateBookingStatus } from '../models/bookingModel';
import { updatePaymentStatus } from '../models/paymentModel';
import { createReview, getReviewsByCompanion, updateCompanionRating } from '../models/reviewModel';

export const completeSession = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user!.id;

    const booking = await getBookingById(bookingId);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    if (booking.client_id !== userId && booking.companion_id !== userId) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    if (booking.status !== 'active') {
      res.status(400).json({ message: 'Session is not active' });
      return;
    }

    await updateBookingStatus(bookingId, 'completed');
    await updatePaymentStatus(bookingId, 'completed');

    res.json({
      message: 'Session completed — payment released to companion',
      bookingId,
    });
  } catch (error) {
    console.error('Session complete error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const submitReview = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId, rating, punctuality, professionalism, skill_accuracy, feedback } = req.body;
    const reviewer_id = req.user!.id;

    const booking = await getBookingById(bookingId);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    if (booking.client_id !== reviewer_id && booking.companion_id !== reviewer_id) {
      res.status(403).json({ message: 'Only booking participants can submit a review' });
      return;
    }

    if (booking.status !== 'completed') {
      res.status(400).json({ message: 'Can only review completed sessions' });
      return;
    }

    const review = await createReview({
      booking_id: bookingId,
      reviewer_id,
      rating,
      punctuality,
      professionalism,
      skill_accuracy,
      feedback,
    });

    if (booking.companion_id === reviewer_id) {
      await pool.query(
        `UPDATE users SET rating = (
          SELECT ROUND(AVG(r.rating)::numeric, 2)
          FROM reviews r
          JOIN bookings b ON r.booking_id = b.id
          WHERE b.client_id = $1 AND r.reviewer_id = b.companion_id
        ) WHERE id = $1`,
        [booking.client_id]
      );
    } else {
      await updateCompanionRating(booking.companion_id);
    }

    res.status(201).json({
      message: 'Review submitted successfully',
      review,
    });
  } catch (error) {
    console.error('Review submit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCompanionReviews = async (req: AuthRequest, res: Response) => {
  try {
    const { companionId } = req.params;
    const reviews = await getReviewsByCompanion(companionId as string);
    res.json({ reviews });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};