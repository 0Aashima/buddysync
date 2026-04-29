import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { generateOTP, storeOTP, verifyOTP, deleteOTP, storeUserVerification, checkBothVerified } from '../services/otpService';
import { getBookingById, updateBookingStatus } from '../models/bookingModel';

export const requestOTP = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId } = req.body;
    const booking = await getBookingById(bookingId);

    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    const userId = req.user!.id;
    if (booking.client_id !== userId && booking.companion_id !== userId) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    const otp = generateOTP();
    await storeOTP(bookingId, otp);

    console.log(`OTP for booking ${bookingId}: ${otp}`);

    res.json({
      message: 'OTP generated successfully',
      otp,
      expiresIn: '10 minutes',
    });
  } catch (error) {
    console.error('OTP request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const submitOTP = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId, otp } = req.body;
    const booking = await getBookingById(bookingId);

    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    const userId = req.user!.id;
    if (booking.client_id !== userId && booking.companion_id !== userId) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    const isValid = await verifyOTP(bookingId, otp);
    if (!isValid) {
      res.status(400).json({ message: 'Invalid or expired OTP' });
      return;
    }

    await storeUserVerification(bookingId, userId);

    const bothVerified = await checkBothVerified(
      bookingId,
      booking.client_id,
      booking.companion_id
    );

    if (bothVerified) {
      await deleteOTP(bookingId);
      await updateBookingStatus(bookingId, 'active');
      res.json({
        message: 'Both users verified — session has begun!',
        sessionStarted: true,
      });
    } else {
      res.json({
        message: 'OTP verified — waiting for other user',
        sessionStarted: false,
      });
    }
  } catch (error) {
    console.error('OTP submit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};