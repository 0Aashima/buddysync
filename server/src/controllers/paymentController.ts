import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { createRazorpayOrder, verifyPaymentSignature } from '../services/paymentService';
import { createPayment, updatePaymentStatus, getPaymentByBooking } from '../models/paymentModel';
import { getBookingById, updateBookingStatus, checkBothAadhaarVerified } from '../models/bookingModel';


export const initiatePayment = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId, amount } = req.body;

    const booking = await getBookingById(bookingId);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    if (booking.client_id !== req.user!.id) {
      res.status(403).json({ message: 'Only client can make payment' });
      return;
    }

    const bothVerified = await checkBothAadhaarVerified(
      booking.client_id,
      booking.companion_id
    );

    if (!bothVerified) {
      res.status(403).json({
        message: 'Aadhaar verification required for both client and companion before payment'
      });
      return;
    }

    const order = await createRazorpayOrder(amount, bookingId);
    await createPayment(bookingId, amount, order.id);

    res.json({
      message: 'Order created',
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export const confirmPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      res.status(400).json({ message: 'Invalid payment signature' });
      return;
    }

    await updatePaymentStatus(bookingId, 'escrow');
    await updateBookingStatus(bookingId, 'confirmed');

    res.json({ message: 'Payment confirmed, funds in escrow' });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export const releasePayment = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId } = req.body;

    const booking = await getBookingById(bookingId);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    await updatePaymentStatus(bookingId, 'completed');
    await updateBookingStatus(bookingId, 'completed');

    res.json({ message: 'Payment released to companion, session complete' });
  } catch (error) {
    console.error('Payment release error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getPaymentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const payment = await getPaymentByBooking(req.params.bookingId as string);
    if (!payment) {
      res.status(404).json({ message: 'Payment not found' });
      return;
    }
    res.json({ payment });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
export const getMyPayments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const pool = (await import('../config/db')).default;

    const result = await pool.query(
      `SELECT 
        p.id,
        p.amount,
        p.status,
        p.razorpay_order_id,
        p.created_at,
        b.id as booking_id,
        b.activity,
        b.date,
        u.name as companion_name
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN users u ON b.companion_id = u.id
      WHERE b.client_id = $1
      ORDER BY p.created_at DESC`,
      [userId]
    );

    res.json({ payments: result.rows });
  } catch (error) {
    console.error('Get my payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};