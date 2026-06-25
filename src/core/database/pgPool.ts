import { Pool } from 'pg';
import { env } from '../config/env';

export const pool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: env.DB_SSL ? { rejectUnauthorized: false } : undefined,
});

// Verify connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log(`Database connected successfully at: ${res.rows[0].now}`);
  }
});
