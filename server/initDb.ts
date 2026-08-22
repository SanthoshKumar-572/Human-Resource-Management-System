import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { format, addDays } from 'date-fns';

dotenv.config();

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = Number(process.env.DB_PORT) || 3306;
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'dayflow_db';

const sslOption = (dbHost && dbHost !== 'localhost') || process.env.DATABASE_URL
  ? { rejectUnauthorized: false }
  : undefined;

export async function initializeDatabase() {
  console.log(`🔌 Connecting to MySQL server at ${dbHost}:${dbPort}...`);
  try {
    // 1. Connect without database selected to ensure database exists
    const rootConnection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      ssl: sslOption
    });

    await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`✅ Database '${dbName}' verified/created.`);
    await rootConnection.end();

    // 2. Connect to the specific database
    const connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      ssl: sslOption,
      multipleStatements: true
    });

    // 3. Create Users Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` VARCHAR(36) PRIMARY KEY,
        \`name\` VARCHAR(255) NOT NULL,
        \`email\` VARCHAR(255) NOT NULL UNIQUE,
        \`password\` VARCHAR(255) NOT NULL DEFAULT 'password123',
        \`role\` ENUM('employee', 'admin') NOT NULL DEFAULT 'employee',
        \`department\` VARCHAR(255) NOT NULL,
        \`position\` VARCHAR(255) NOT NULL,
        \`salary\` DECIMAL(12, 2) NULL,
        \`avatar\` VARCHAR(500) NULL,
        \`join_date\` DATE NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Migration: ensure password column exists on existing installations
    try {
      await connection.query(`
        ALTER TABLE \`users\` ADD COLUMN \`password\` VARCHAR(255) NOT NULL DEFAULT 'password123';
      `);
    } catch (e: any) {
      // Column might already exist, ignore duplicate column error ER_DUP_FIELDNAME (1060)
      if (e?.errno !== 1060 && !e?.message?.includes('Duplicate column name')) {
        console.warn('Migration warning for password column:', e?.message || e);
      }
    }

    // 4. Create Attendance Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`attendance\` (
        \`id\` VARCHAR(36) PRIMARY KEY,
        \`user_id\` VARCHAR(36) NOT NULL,
        \`date\` DATE NOT NULL,
        \`status\` ENUM('present', 'absent', 'half-day', 'leave') NOT NULL DEFAULT 'present',
        \`check_in\` DATETIME NULL,
        \`check_out\` DATETIME NULL,
        FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
        UNIQUE KEY \`unique_user_date\` (\`user_id\`, \`date\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. Create Leave Requests Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`leave_requests\` (
        \`id\` VARCHAR(36) PRIMARY KEY,
        \`user_id\` VARCHAR(36) NOT NULL,
        \`type\` ENUM('paid', 'sick', 'unpaid') NOT NULL,
        \`start_date\` DATE NOT NULL,
        \`end_date\` DATE NOT NULL,
        \`remarks\` TEXT NOT NULL,
        \`status\` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
        \`admin_comment\` TEXT NULL,
        \`created_at\` DATETIME NOT NULL,
        FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('✅ MySQL tables verified/created successfully.');

    // 6. Seed initial users if empty
    const [userRows]: any = await connection.query('SELECT COUNT(*) as count FROM users');
    if (userRows[0].count === 0) {
      console.log('🌱 Seeding initial user data...');
      await connection.query(`
        INSERT INTO users (id, name, email, password, role, department, position, salary, join_date)
        VALUES 
        ('1', 'Sarah Connor', 'sarah@dayflow.com', 'password123', 'employee', 'Engineering', 'Frontend Developer', 95000.00, '2023-01-15'),
        ('2', 'Admin User', 'admin@dayflow.com', 'password123', 'admin', 'HR', 'HR Manager', 110000.00, '2021-06-01');
      `);

      const yesterdayStr = format(addDays(new Date(), -1), 'yyyy-MM-dd');
      const yesterdayCheckIn = new Date(new Date(yesterdayStr).setHours(9, 0, 0, 0));
      const yesterdayCheckOut = new Date(new Date(yesterdayStr).setHours(17, 30, 0, 0));

      await connection.query(`
        INSERT INTO attendance (id, user_id, date, status, check_in, check_out)
        VALUES ('a1', '1', ?, 'present', ?, ?);
      `, [yesterdayStr, yesterdayCheckIn, yesterdayCheckOut]);

      console.log('✅ Seed data inserted successfully!');
    }

    await connection.end();
    return true;
  } catch (error: any) {
    console.error('❌ Error initializing MySQL database:', error?.message || error);
    return false;
  }
}

// Allow direct execution from CLI
if (process.argv[1]?.includes('initDb')) {
  initializeDatabase().then(() => process.exit(0));
}
