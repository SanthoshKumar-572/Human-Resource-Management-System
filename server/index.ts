import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { format } from 'date-fns';
import { pool, testConnection } from './db';
import { initializeDatabase } from './initDb';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Helper function to format DB user to frontend User
function formatUser(row: any) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    department: row.department,
    position: row.position,
    salary: row.salary ? Number(row.salary) : undefined,
    avatar: row.avatar || undefined,
    joinDate: row.join_date ? format(new Date(row.join_date), 'yyyy-MM-dd') : row.joinDate
  };
}

// Helper function to format DB attendance record
function formatAttendance(row: any) {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date ? format(new Date(row.date), 'yyyy-MM-dd') : row.date,
    status: row.status,
    checkIn: row.check_in ? new Date(row.check_in).toISOString() : undefined,
    checkOut: row.check_out ? new Date(row.check_out).toISOString() : undefined,
  };
}

// Helper function to format DB leave request
function formatLeave(row: any) {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    startDate: row.start_date ? format(new Date(row.start_date), 'yyyy-MM-dd') : row.startDate,
    endDate: row.end_date ? format(new Date(row.end_date), 'yyyy-MM-dd') : row.endDate,
    remarks: row.remarks,
    status: row.status,
    adminComment: row.admin_comment || undefined,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : row.createdAt,
  };
}

// Health check endpoint
app.get('/api/health', async (_req: Request, res: Response) => {
  const dbConnected = await testConnection();
  res.json({
    status: 'ok',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Authentication / User Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !role) {
      return res.status(400).json({ error: 'Email and role are required' });
    }

    const [rows]: any = await pool.query(
      'SELECT * FROM users WHERE email = ? AND role = ?',
      [email, role]
    );

    if (rows.length > 0) {
      const user = rows[0];
      if (user.password && password && user.password !== password) {
        return res.status(401).json({ error: 'Invalid password. Please check your credentials.' });
      }
      return res.json(formatUser(user));
    }

    // If user does not exist, create new user (mock login behavior)
    const newId = Math.random().toString(36).substr(2, 9);
    const rawName = email.split('@')[0];
    const newName = rawName
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
    const today = format(new Date(), 'yyyy-MM-dd');
    const userPassword = password || 'password123';

    await pool.query(
      `INSERT INTO users (id, name, email, password, role, department, position, join_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [newId, newName, email, userPassword, role, 'General', 'Staff', today]
    );

    const [createdRows]: any = await pool.query('SELECT * FROM users WHERE id = ?', [newId]);
    return res.json(formatUser(createdRows[0]));
  } catch (error: any) {
    console.error('Error during login:', error);
    res.status(500).json({ error: error.message || 'Database error during login' });
  }
});

// Get all users
app.get('/api/users', async (_req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM users ORDER BY name ASC');
    res.json(rows.map(formatUser));
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message || 'Database error' });
  }
});

// Create new user / employee
app.post('/api/users', async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, department, position, salary, avatar, joinDate } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const newId = Math.random().toString(36).substr(2, 9);
    const dateStr = joinDate || format(new Date(), 'yyyy-MM-dd');
    const userPassword = password || 'password123';

    await pool.query(
      `INSERT INTO users (id, name, email, password, role, department, position, salary, avatar, join_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [newId, name, email, userPassword, role || 'employee', department || 'General', position || 'Staff', salary || 0, avatar || null, dateStr]
    );

    const [rows]: any = await pool.query('SELECT * FROM users WHERE id = ?', [newId]);
    return res.json(formatUser(rows[0]));
  } catch (error: any) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message || 'Database error creating user' });
  }
});

// Update user details
app.put('/api/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, department, position, salary, avatar } = req.body;

    const fields: string[] = [];
    const values: any[] = [];

    if (name !== undefined) { fields.push('name = ?'); values.push(name); }
    if (department !== undefined) { fields.push('department = ?'); values.push(department); }
    if (position !== undefined) { fields.push('position = ?'); values.push(position); }
    if (salary !== undefined) { fields.push('salary = ?'); values.push(salary); }
    if (avatar !== undefined) { fields.push('avatar = ?'); values.push(avatar); }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields provided to update' });
    }

    values.push(id);

    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    const [updated]: any = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    res.json(formatUser(updated[0]));
  } catch (error: any) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: error.message || 'Database error' });
  }
});

// Get attendance records
app.get('/api/attendance', async (_req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM attendance ORDER BY date DESC');
    res.json(rows.map(formatAttendance));
  } catch (error: any) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: error.message || 'Database error' });
  }
});

// Check-in endpoint
app.post('/api/attendance/check-in', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const now = new Date();
    const dateStr = format(now, 'yyyy-MM-dd');
    const newId = Math.random().toString(36).substr(2, 9);

    // Insert or update check-in, clearing check_out so user is active again
    await pool.query(
      `INSERT INTO attendance (id, user_id, date, status, check_in, check_out)
       VALUES (?, ?, ?, 'present', ?, NULL)
       ON DUPLICATE KEY UPDATE check_in = VALUES(check_in), check_out = NULL, status = 'present'`,
      [newId, userId, dateStr, now]
    );

    const [rows]: any = await pool.query('SELECT * FROM attendance WHERE user_id = ? AND date = ?', [userId, dateStr]);
    res.json(formatAttendance(rows[0]));
  } catch (error: any) {
    console.error('Error recording check-in:', error);
    res.status(500).json({ error: error.message || 'Database error' });
  }
});

// Check-out endpoint
app.post('/api/attendance/check-out', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const now = new Date();
    const dateStr = format(now, 'yyyy-MM-dd');

    await pool.query(
      `UPDATE attendance SET check_out = ? WHERE user_id = ? AND date = ?`,
      [now, userId, dateStr]
    );

    const [rows]: any = await pool.query('SELECT * FROM attendance WHERE user_id = ? AND date = ?', [userId, dateStr]);
    res.json(formatAttendance(rows[0]));
  } catch (error: any) {
    console.error('Error recording check-out:', error);
    res.status(500).json({ error: error.message || 'Database error' });
  }
});

// Get leave requests
app.get('/api/leave', async (_req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM leave_requests ORDER BY created_at DESC');
    res.json(rows.map(formatLeave));
  } catch (error: any) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ error: error.message || 'Database error' });
  }
});

// Create leave request
app.post('/api/leave', async (req: Request, res: Response) => {
  try {
    const { userId, type, startDate, endDate, remarks } = req.body;
    if (!userId || !type || !startDate || !endDate || !remarks) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newId = Math.random().toString(36).substr(2, 9);
    const createdAt = new Date();

    await pool.query(
      `INSERT INTO leave_requests (id, user_id, type, start_date, end_date, remarks, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [newId, userId, type, startDate, endDate, remarks, createdAt]
    );

    const [rows]: any = await pool.query('SELECT * FROM leave_requests WHERE id = ?', [newId]);
    res.json(formatLeave(rows[0]));
  } catch (error: any) {
    console.error('Error creating leave request:', error);
    res.status(500).json({ error: error.message || 'Database error' });
  }
});

// Update leave request status
app.patch('/api/leave/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;

    if (!status) return res.status(400).json({ error: 'Status is required' });

    await pool.query(
      `UPDATE leave_requests SET status = ?, admin_comment = ? WHERE id = ?`,
      [status, comment || null, id]
    );

    const [rows]: any = await pool.query('SELECT * FROM leave_requests WHERE id = ?', [id]);
    res.json(formatLeave(rows[0]));
  } catch (error: any) {
    console.error('Error updating leave status:', error);
    res.status(500).json({ error: error.message || 'Database error' });
  }
});

import path from 'path';

// Serve static frontend files from dist directory in production
const distPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(distPath));

app.get('*', (req: Request, res: Response, next) => {
  if (req.path.startsWith('/api')) return next();
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).send('Application built static files missing. Please ensure build command "npm run build" is executed during deployment.');
    }
  });
});

// Start Express Server
async function startServer() {
  try {
    await initializeDatabase();
  } catch (err) {
    console.error('Failed to initialize database, starting server anyway:', err);
  }

  const portNum = Number(PORT) || 5000;
  app.listen(portNum, '0.0.0.0', () => {
    console.log(`🚀 Express server running on 0.0.0.0:${portNum} with MySQL integration.`);
  });
}

startServer();
