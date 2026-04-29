import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { findUserById } from '../models/userModel';
import { sendBookingConfirmation } from '../services/emailService';
import { createBooking, getBookingById, getBookingsByUser, updateBookingStatus, checkBothAadhaarVerified, getTodayBooking, cancelBookingWithReason } from '../models/bookingModel';

export const makeBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { companion_id, date, time, location, activity, booking_details } = req.body;
    const client_id = req.user!.id;

    const client = await findUserById(client_id);
    const companion = await findUserById(companion_id);

    if (!companion || companion.role !== 'companion') {
      res.status(404).json({ message: 'Companion not found' });
      return;
    }

    const booking = await createBooking({
      client_id,
      companion_id,
      date,
      time,
      location,
      activity,
      booking_details,
    });

    await sendBookingConfirmation(
      client.email,
      client.name,
      companion.email,
      companion.name,
      {
        id: booking.id,
        date: booking.date,
        time: booking.time,
        location: booking.location,
        activity: booking.activity,
      }
    );

    res.status(201).json({
      message: 'Booking created successfully',
      booking,
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getBooking = async (req: AuthRequest, res: Response) => {
  try {
    const booking = await getBookingById(req.params.id as string);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }
    res.json({ booking });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await getBookingsByUser(req.user!.id);
    res.json({ bookings });
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { reason } = req.body;

    const validReasons = [
      'Change of plans',
      'Found another companion',
      'Emergency came up',
      'Companion not responding',
      'Incorrect booking details',
      'Other',
    ];

    if (!reason || !validReasons.includes(reason)) {
      res.status(400).json({
        message: 'Please select a valid cancellation reason',
        validReasons,
      });
      return;
    }

    const booking = await getBookingById(req.params.id as string);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    if (booking.client_id !== req.user!.id) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    if (booking.status === 'active' || booking.status === 'completed') {
      res.status(400).json({ message: 'Cannot cancel an active or completed session' });
      return;
    }

    const updated = await cancelBookingWithReason(req.params.id as string, reason);
    res.json({ message: 'Booking cancelled', booking: updated });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};