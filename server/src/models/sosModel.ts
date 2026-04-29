import pool from '../config/db';

export const createSOSAlert = async (
  booking_id: string,
  triggered_by: string,
  latitude: number,
  longitude: number
) => {
  const result = await pool.query(
    `INSERT INTO sos_alerts (booking_id, triggered_by, latitude, longitude)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [booking_id, triggered_by, latitude, longitude]
  );
  return result.rows[0];
};

export const getSOSAlerts = async () => {
  const result = await pool.query(
    `SELECT 
      s.*,
      u.name as triggered_by_name,
      b.location as booking_location,
      c.name as client_name,
      c.phone as client_phone,
      c.email as client_email,
      cp.name as companion_name,
      cp.phone as companion_phone,
      cp.email as companion_email
     FROM sos_alerts s
     JOIN users u ON s.triggered_by = u.id
     JOIN bookings b ON s.booking_id = b.id
     JOIN users c ON b.client_id = c.id
     JOIN users cp ON b.companion_id = cp.id
     WHERE s.resolved = false
     ORDER BY s.created_at DESC`
  );
  return result.rows;
};

export const resolveSOSAlert = async (id: string) => {
  const result = await pool.query(
    `UPDATE sos_alerts SET resolved = true WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};