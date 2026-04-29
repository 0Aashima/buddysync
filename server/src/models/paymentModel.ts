import pool from '../config/db';

export const createPayment = async (
  booking_id: string,
  amount: number,
  razorpay_order_id: string
) => {
  const result = await pool.query(
    `INSERT INTO payments (booking_id, amount, status, razorpay_order_id)
     VALUES ($1, $2, 'pending', $3) RETURNING *`,
    [booking_id, amount, razorpay_order_id]
  );
  return result.rows[0];
};

export const getPaymentByBooking = async (booking_id: string) => {
  const result = await pool.query(
    `SELECT * FROM payments WHERE booking_id = $1`,
    [booking_id]
  );
  return result.rows[0];
};

export const updatePaymentStatus = async (
  booking_id: string,
  status: string
) => {
  const result = await pool.query(
    `UPDATE payments SET status = $1 WHERE booking_id = $2 RETURNING *`,
    [status, booking_id]
  );
  return result.rows[0];
};