
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Supabase with Service Role (bypasses RLS for secure background logic)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.use(cors());
app.use(express.json());

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Authentication validation middleware (Firebase ID token)
const admin = require('firebase-admin');
if (!admin.apps.length) {
  admin.initializeApp();
}

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// HEALTH CHECK (protected)
app.get('/api/dashboard', authenticate, async (req, res) => {
  try {
    const userId = req.user.uid;
    // Parallel fetch from Supabase
    const [subs, mats, tasks] = await Promise.all([
      supabase.from('subjects').select('*', { count: 'exact' }).eq('user_id', userId),
      supabase.from('materials').select('*', { count: 'exact' }).eq('user_id', userId),
      supabase.from('tasks').select('*', { count: 'exact' }).eq('user_id', userId).eq('completed', false)
    ]);
    res.json({
      message: "Supabase Cloud Online",
      readiness: 75, // Can be computed based on task completion
      stats: {
        totalSubjects: subs.count || 0,
        totalMaterials: mats.count || 0,
        pendingTasks: tasks.count || 0
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// SUBJECTS API (protected)
app.get('/api/subjects', authenticate, async (req, res) => {
  const userId = req.user.uid;
  const { data, error } = await supabase.from('subjects').select('*').eq('user_id', userId);
  if (error) return res.status(500).json({ error: 'Database error' });
  res.json(data);
});

app.post('/api/subjects', authenticate, async (req, res) => {
  const userId = req.user.uid;
  const body = { ...req.body, user_id: userId };
  const { data, error } = await supabase.from('subjects').insert([body]).select().single();
  if (error) return res.status(500).json({ error: 'Database error' });
  res.json(data);
});

// MATERIALS API (protected)
app.get('/api/materials', authenticate, async (req, res) => {
  const userId = req.user.uid;
  const { data, error } = await supabase.from('materials').select('*').eq('user_id', userId);
  if (error) return res.status(500).json({ error: 'Database error' });
  res.json(data);
});

app.post('/api/materials', authenticate, async (req, res) => {
  const userId = req.user.uid;
  const body = { ...req.body, user_id: userId };
  const { data, error } = await supabase.from('materials').insert([body]).select().single();
  if (error) return res.status(500).json({ error: 'Database error' });
  res.json(data);
});

app.delete('/api/materials/:id', authenticate, async (req, res) => {
  const userId = req.user.uid;
  // Only delete if the material belongs to the user
  const { error } = await supabase.from('materials').delete().eq('id', req.params.id).eq('user_id', userId);
  if (error) return res.status(500).json({ error: 'Database error' });
  res.json({ success: true });
});

// TASKS API (protected)
app.get('/api/tasks', authenticate, async (req, res) => {
  const userId = req.user.uid;
  const { data, error } = await supabase.from('tasks').select('*').eq('user_id', userId);
  if (error) return res.status(500).json({ error: 'Database error' });
  res.json(data);
});

app.post('/api/tasks', authenticate, async (req, res) => {
  const userId = req.user.uid;
  const body = { ...req.body, user_id: userId };
  const { data, error } = await supabase.from('tasks').insert([body]).select().single();
  if (error) return res.status(500).json({ error: 'Database error' });
  res.json(data);
});

app.patch('/api/tasks/:id', authenticate, async (req, res) => {
  const userId = req.user.uid;
  const { data, error } = await supabase.from('tasks').update(req.body).eq('id', req.params.id).eq('user_id', userId).select().single();
  if (error) return res.status(500).json({ error: 'Database error' });
  res.json(data);
});

app.delete('/api/tasks/:id', authenticate, async (req, res) => {
  const userId = req.user.uid;
  const { error } = await supabase.from('tasks').delete().eq('id', req.params.id).eq('user_id', userId);
  if (error) return res.status(500).json({ error: 'Database error' });
  res.json({ success: true });
});

app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Production Server running on http://localhost:${PORT}`);
  }
});
