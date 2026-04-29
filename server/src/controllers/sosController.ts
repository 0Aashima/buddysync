import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { createSOSAlert, getSOSAlerts, resolveSOSAlert } from '../models/sosModel';
import { getBookingById } from '../models/bookingModel';

export const triggerSOS = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId, latitude, longitude } = req.body;
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

    const alert = await createSOSAlert(bookingId, userId, latitude, longitude);

    res.status(201).json({
      message: 'SOS alert triggered — admin has been notified',
      alert,
    });
  } catch (error) {
    console.error('SOS error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAlerts = async (req: AuthRequest, res: Response) => {
  try {
    const alerts = await getSOSAlerts();
    res.json({ alerts });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const resolveAlert = async (req: AuthRequest, res: Response) => {
  try {
    const alert = await resolveSOSAlert(req.params.id as string);
    res.json({ message: 'Alert resolved', alert });
  } catch (error) {
    console.error('Resolve alert error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};