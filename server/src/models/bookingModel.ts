import pool from '../config/db';

export const createBooking = async (booking: {
  client_id: string;
  companion_id: string;
  date: string;
  time: string;
  location: string;
  activity: string;
  booking_details?: string;
}) => {
  const { client_id, companion_id, date, time, location, activity, booking_details } = booking;
  const result = await pool.query(
    `INSERT INTO bookings (client_id, companion_id, date, time, location, activity, booking_details, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending') RETURNING *`,
    [client_id, companion_id, date, time, location, activity, booking_details]
  );
  return result.rows[0];
};


export const getBookingById = async (id: string) => {
  const result = await pool.query(
    `SELECT b.*, 
      c.name as client_name, c.email as client_email,
      cp.name as companion_name, cp.email as companion_email
     FROM bookings b
     JOIN users c ON b.client_id = c.id
     JOIN users cp ON b.companion_id = cp.id
     WHERE b.id = $1`,
    [id]
  );
  return result.rows[0];
};

export const getBookingsByUser = async (user_id: string) => {
  const result = await pool.query(
    `SELECT b.*,
      c.name as client_name,
      cp.name as companion_name
     FROM bookings b
     JOIN users c ON b.client_id = c.id
     JOIN users cp ON b.companion_id = cp.id
     WHERE b.client_id = $1 OR b.companion_id = $1
     ORDER BY b.created_at DESC`,
    [user_id]
  );
  return result.rows;
};

export const updateBookingStatus = async (id: string, status: string) => {
  const result = await pool.query(
    `UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return result.rows[0];
};

export const checkBothAadhaarVerified = async (
  client_id: string,
  companion_id: string
): Promise<boolean> => {
  const result = await pool.query(
    `SELECT 
      (SELECT aadhaar_verified FROM users WHERE id = $1) as client_verified,
      (SELECT aadhaar_verified FROM users WHERE id = $2) as companion_verified`,
    [client_id, companion_id]
  );
  return result.rows[0].client_verified && result.rows[0].companion_verified;
};

export const getTodayBooking = async (user_id: string) => {
  const result = await pool.query(
    `SELECT b.*,
      c.name as client_name,
      cp.name as companion_name
     FROM bookings b
     JOIN users c ON b.client_id = c.id
     JOIN users cp ON b.companion_id = cp.id
     WHERE (b.client_id = $1 OR b.companion_id = $1)
     AND b.date = CURRENT_DATE
     AND b.status NOT IN ('cancelled')
     ORDER BY b.time ASC
     LIMIT 1`,
    [user_id]
  );
  return result.rows[0];
};

export const cancelBookingWithReason = async (id: string, reason: string) => {
  const result = await pool.query(
    `UPDATE bookings SET status = 'cancelled', cancellation_reason = $1 
     WHERE id = $2 RETURNING *`,
    [reason, id]
  );
  return result.rows[0];
};