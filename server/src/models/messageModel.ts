import pool from '../config/db';

export const saveMessage = async (
  booking_id: string,
  sender_id: string,
  content: string
) => {
  const result = await pool.query(
    `INSERT INTO messages (booking_id, sender_id, content)
     VALUES ($1, $2, $3) RETURNING *`,
    [booking_id, sender_id, content]
  );
  return result.rows[0];
};

export const getMessagesByBooking = async (booking_id: string) => {
  const result = await pool.query(
    `SELECT m.*, u.name as sender_name
     FROM messages m
     JOIN users u ON m.sender_id = u.id
     WHERE m.booking_id = $1
     ORDER BY m.created_at ASC`,
    [booking_id]
  );
  return result.rows;
};