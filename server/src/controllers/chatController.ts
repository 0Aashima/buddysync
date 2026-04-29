import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { getMessagesByBooking } from '../models/messageModel';
import { getBookingById } from '../models/bookingModel';

export const getChatHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId } = req.params;
    const booking = await getBookingById(bookingId as string);

    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    const userId = req.user!.id;
    if (booking.client_id !== userId && booking.companion_id !== userId) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    const messages = await getMessagesByBooking(bookingId as string);
    res.json({ messages });
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};