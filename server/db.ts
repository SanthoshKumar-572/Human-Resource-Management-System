import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const sslOption = process.env.DB_SSL === 'true' || process.env.DATABASE_URL || (process.env.DB_HOST && process.env.DB_HOST !== 'localhost')
  ? { rejectUnauthorized: false }
  : undefined;

const dbConfig = process.env.DATABASE_URL ? {
  uri: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
} : {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dayflow_db',
  ssl: sslOption,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create a pool for executing queries
export const pool = mysql.createPool(dbConfig);

// Helper function to check connection health
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    connection.release();
    console.log('✅ Connected to MySQL Database successfully');
    return true;
  } catch (error: any) {
    console.error('❌ Failed to connect to MySQL database:', error?.message || error);
    return false;
  }
}
