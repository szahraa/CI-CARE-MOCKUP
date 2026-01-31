import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from './database.js';

const app = express();
const PORT = 3001;
const JWT_SECRET = 'ci-care-secret-key-change-in-production';

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Auth
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

app.get('/api/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, email, name, role FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// Dashboard stats
app.get('/api/dashboard/stats', authMiddleware, (req, res) => {
  const totalPatients = db.prepare('SELECT COUNT(*) as count FROM patients').get().count;
  const completedToday = db.prepare(`
    SELECT COUNT(*) as count FROM appointments 
    WHERE date(scheduled_at) = date('now') AND status = 'Selesai'
  `).get().count;
  const inQueue = db.prepare(`
    SELECT COUNT(*) as count FROM appointments 
    WHERE date(scheduled_at) = date('now') AND status = 'Menunggu'
  `).get().count;
  const appointmentsToday = db.prepare(`
    SELECT COUNT(*) as count FROM appointments 
    WHERE date(scheduled_at) = date('now')
  `).get().count;
  res.json({
    totalPatients: totalPatients || 234,
    completedToday: completedToday || 18,
    inQueue: inQueue || 3,
    appointmentsToday: appointmentsToday || 8,
  });
});

// Appointments (schedule)
app.get('/api/appointments', authMiddleware, (req, res) => {
  const list = db.prepare(`
    SELECT a.id, a.scheduled_at, a.type, a.status, p.name as patient_name
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    ORDER BY a.scheduled_at
    LIMIT 20
  `).all();
  res.json(list);
});

// Patients
app.get('/api/patients', authMiddleware, (req, res) => {
  const list = db.prepare('SELECT * FROM patients ORDER BY id DESC').all();
  res.json(list);
});

app.post('/api/patients', authMiddleware, (req, res) => {
  const { name, birth_date, condition, status } = req.body || {};
  if (!name) return res.status(400).json({ error: 'Name required' });
  const result = db.prepare(`
    INSERT INTO patients (name, birth_date, condition, status, last_visit) VALUES (?, ?, ?, ?, ?)
  `).run(name || '', birth_date || null, condition || '', status || 'Stabil', null);
  res.status(201).json({ id: result.lastInsertRowid, name, birth_date, condition, status: status || 'Stabil' });
});

// Medical records
app.get('/api/medical-records', authMiddleware, (req, res) => {
  const list = db.prepare(`
    SELECT mr.*, p.name as patient_name FROM medical_records mr
    JOIN patients p ON mr.patient_id = p.id
    ORDER BY mr.created_at DESC LIMIT 50
  `).all();
  res.json(list);
});

// Analytics (mock)
app.get('/api/analytics/summary', authMiddleware, (req, res) => {
  res.json({
    visitsPerMonth: [120, 135, 142, 138, 155, 168],
    patientGrowth: 12,
    topConditions: ['Diabetes Type 2', 'Hipertensi', 'Pemulihan'],
  });
});

db.ready.then(() => {
  app.listen(PORT, () => console.log(`CI-CARE API running at http://localhost:${PORT}`));
}).catch(err => {
  console.error('Database init failed:', err);
  process.exit(1);
});
