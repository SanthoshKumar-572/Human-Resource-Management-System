import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export function getDbConfig() {
  if (process.env.DATABASE_URL) {
    try {
      const parsedUrl = new URL(process.env.DATABASE_URL);
      return {
        host: parsedUrl.hostname,
        port: Number(parsedUrl.port) || 3306,
        user: parsedUrl.username,
        password: parsedUrl.password,
        database: parsedUrl.pathname.replace(/^\//, '') || 'defaultdb',
        ssl: { rejectUnauthorized: false },
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      };
    } catch {
      // Fallback if URL parsing fails
    }
  }

  const host = process.env.DB_HOST || 'localhost';
  const sslOption = (host && host !== 'localhost') || process.env.DB_SSL === 'true' || process.env.DATABASE_URL
    ? { rejectUnauthorized: false }
    : undefined;

  return {
    host,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dayflow_db',
    ssl: sslOption,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };
}

// Create a pool for executing queries
export const pool = mysql.createPool(getDbConfig());

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
