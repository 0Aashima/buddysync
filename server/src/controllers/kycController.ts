import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import pool from '../config/db';

export const submitAadhaar = async (req: AuthRequest, res: Response) => {
  try {
    const { aadhaar_number } = req.body;
    const userId = req.user!.id;

    if (!aadhaar_number || aadhaar_number.length !== 12) {
      res.status(400).json({ message: 'Invalid Aadhaar number — must be 12 digits' });
      return;
    }

    const existing = await pool.query(
      `SELECT aadhaar_verified FROM users WHERE id = $1`,
      [userId]
    );

    if (existing.rows[0].aadhaar_verified) {
      res.status(400).json({ message: 'Aadhaar already verified — verification is a one time process' });
      return;
    }

    await pool.query(
      `UPDATE users SET aadhaar_number = $1, aadhaar_verified = true, kyc_status = 'verified'
       WHERE id = $2`,
      [aadhaar_number, userId]
    );

    res.json({ message: 'Aadhaar verified successfully' });
  } catch (error) {
    console.error('KYC error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getKYCStatus = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT kyc_status, aadhaar_verified FROM users WHERE id = $1`,
      [req.user!.id]
    );
    res.json({ kyc: result.rows[0] });
  } catch (error) {
    console.error('KYC status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};