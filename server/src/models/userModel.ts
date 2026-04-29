import pool from '../config/db';

export interface User {
  id?: string;
  name: string;
  email: string;
  password: string;
  role: 'client' | 'companion';
  age?: number;
  gender?: string;
  phone?: string;
  kyc_status?: string;
  rating?: number;
  specialization?: string;
}

export const createUser = async (user: User) => {
  const { name, email, password, role, age, gender, phone } = user;
  const result = await pool.query(
    `INSERT INTO users (name, email, password, role, age, gender, phone)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [name, email, password, role, age, gender, phone]
  );
  return result.rows[0];
};

export const findUserByEmail = async (email: string) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
};

export const findUserById = async (id: string) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
};