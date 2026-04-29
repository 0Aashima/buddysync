import pool from '../config/db';

export const getAllCompanions = async (filters: {
  specialization?: string | string[];
  minRating?: number;
  sortByRating?: boolean;
  verifiedOnly?: boolean;
}) => {
  let query = `
    SELECT id, name, gender, age, height, bio, rating, specialization, kyc_status, is_online
FROM users
WHERE role = 'companion'
  `;
  const values: (string | number)[] = [];
  let paramCount = 1;

  if (filters.verifiedOnly) {
    query += ` AND kyc_status = 'verified'`;
  }

  if (filters.specialization) {
    const specs = Array.isArray(filters.specialization)
      ? filters.specialization
      : [filters.specialization];
    const conditions = specs.map((s) => {
      values.push(`%${s}%`);
      return `specialization ILIKE $${paramCount++}`;
    });
    query += ` AND (${conditions.join(' OR ')})`;
  }

  if (filters.minRating) {
    query += ` AND rating >= $${paramCount}`;
    values.push(filters.minRating);
    paramCount++;
  }

  if (filters.sortByRating) {
    query += ` ORDER BY rating DESC`;
  }

  const result = await pool.query(query, values);
  return result.rows;
};

export const getCompanionById = async (id: string) => {
  const result = await pool.query(
    `SELECT id, name, gender, age, height, bio, rating, specialization, kyc_status, is_online
FROM users WHERE id = $1 AND role = 'companion'`,
    [id]
  );
  return result.rows[0];
};