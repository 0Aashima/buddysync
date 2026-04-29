import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import pool from '../config/db';

export const getAllBookings = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT b.*,
        c.name as client_name, c.email as client_email, c.phone as client_phone,
        cp.name as companion_name, cp.email as companion_email, cp.phone as companion_phone
       FROM bookings b
       JOIN users c ON b.client_id = c.id
       JOIN users cp ON b.companion_id = cp.id
       ORDER BY b.created_at DESC`
    );
    res.json({ bookings: result.rows });
  } catch (error) {
    console.error('Admin get bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, phone, role, kyc_status, rating, specialization, created_at
       FROM users ORDER BY created_at DESC`
    );
    res.json({ users: result.rows });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllPayments = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT p.*, b.activity, b.location,
        c.name as client_name,
        cp.name as companion_name
       FROM payments p
       JOIN bookings b ON p.booking_id = b.id
       JOIN users c ON b.client_id = c.id
       JOIN users cp ON b.companion_id = cp.id
       ORDER BY p.created_at DESC`
    );
    res.json({ payments: result.rows });
  } catch (error) {
    console.error('Admin get payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUserKYC = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, status } = req.body;
    const result = await pool.query(
      `UPDATE users SET kyc_status = $1 WHERE id = $2 RETURNING id, name, email, kyc_status`,
      [status, userId]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json({ message: 'KYC status updated', user: result.rows[0] });
  } catch (error) {
    console.error('Admin KYC update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};