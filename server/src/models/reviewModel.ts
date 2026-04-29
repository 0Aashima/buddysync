import pool from '../config/db';

export const createReview = async (review: {
  booking_id: string;
  reviewer_id: string;
  rating: number;
  punctuality: number;
  professionalism: number;
  skill_accuracy: number;
  feedback?: string;
}) => {
  const { booking_id, reviewer_id, rating, punctuality, professionalism, skill_accuracy, feedback } = review;
  const result = await pool.query(
    `INSERT INTO reviews (booking_id, reviewer_id, rating, punctuality, professionalism, skill_accuracy, feedback)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [booking_id, reviewer_id, rating, punctuality, professionalism, skill_accuracy, feedback]
  );
  return result.rows[0];
};

export const getReviewsByCompanion = async (companion_id: string) => {
  const result = await pool.query(
    `SELECT r.*, u.name as reviewer_name
     FROM reviews r
     JOIN bookings b ON r.booking_id = b.id
     JOIN users u ON r.reviewer_id = u.id
     WHERE b.companion_id = $1
     ORDER BY r.created_at DESC`,
    [companion_id]
  );
  return result.rows;
};

export const updateCompanionRating = async (companion_id: string) => {
  const result = await pool.query(
    `UPDATE users 
     SET rating = (
       SELECT ROUND(AVG(r.rating)::numeric, 2)
       FROM reviews r
       JOIN bookings b ON r.booking_id = b.id
       WHERE b.companion_id = $1
     )
     WHERE id = $1 RETURNING rating`,
    [companion_id]
  );
  return result.rows[0];
};