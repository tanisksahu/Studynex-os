const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

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

// HEALCH CHECK
app.get('/api/dashboard', async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ message: "UserId required" });

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
    res.status(500).json({ error: err.message });
  }
});

// SUBJECTS API
app.get('/api/subjects', async (req, res) => {
  const { userId } = req.query;
  const { data, error } = await supabase.from('subjects').select('*').eq('user_id', userId);
  if (error) return res.status(500).json(error);
  res.json(data);
});

app.post('/api/subjects', async (req, res) => {
  const { data, error } = await supabase.from('subjects').insert([req.body]).select().single();
  if (error) return res.status(500).json(error);
  res.json(data);
});

// MATERIALS API
app.get('/api/materials', async (req, res) => {
  const { userId } = req.query;
  const { data, error } = await supabase.from('materials').select('*').eq('user_id', userId);
  if (error) return res.status(500).json(error);
  res.json(data);
});

app.post('/api/materials', async (req, res) => {
  const { data, error } = await supabase.from('materials').insert([req.body]).select().single();
  if (error) return res.status(500).json(error);
  res.json(data);
});

app.delete('/api/materials/:id', async (req, res) => {
  const { error } = await supabase.from('materials').delete().eq('id', req.params.id);
  if (error) return res.status(500).json(error);
  res.json({ success: true });
});

// TASKS API
app.get('/api/tasks', async (req, res) => {
  const { userId } = req.query;
  const { data, error } = await supabase.from('tasks').select('*').eq('user_id', userId);
  if (error) return res.status(500).json(error);
  res.json(data);
});

app.post('/api/tasks', async (req, res) => {
  const { data, error } = await supabase.from('tasks').insert([req.body]).select().single();
  if (error) return res.status(500).json(error);
  res.json(data);
});

app.patch('/api/tasks/:id', async (req, res) => {
  const { data, error } = await supabase.from('tasks').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json(error);
  res.json(data);
});

app.delete('/api/tasks/:id', async (req, res) => {
  const { error } = await supabase.from('tasks').delete().eq('id', req.params.id);
  if (error) return res.status(500).json(error);
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`Production Server running on http://localhost:${PORT}`));
