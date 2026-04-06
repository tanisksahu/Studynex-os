const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(express.json());

// Persistent Data Helper
const loadData = () => {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
      subjects: [
        { id: 1, name: "Business Analytics", units: [{ name: "Unit 1", topics: ["Intro", "Basics"] }] }
      ],
      materials: [
        { id: 1, title: "Stats Notes PDF", type: "pdf", content: "https://example.com/file.pdf", subjectId: 1, unit: "Unit 1", topic: "Probability", createdAt: new Date().toISOString() }
      ],
      tasks: [
        { id: 1, title: "Review Unit 1", subjectId: 1, deadline: new Date().toISOString(), priority: "high", completed: false }
      ]
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
};

const saveData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// Initial Load
let db = loadData();

// Helper to update DB and write to file
const updateDb = (key, value) => {
  db[key] = value;
  saveData(db);
};

// --- ROUTES ---

app.get('/', (req, res) => res.send('Studynex Backend Live'));

// Dashboard & Analytics (Stage 6)
app.get('/api/dashboard', (req, res) => {
  const totalTasks = db.tasks.length;
  const completedTasks = db.tasks.filter(t => t.completed).length;
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  // Readiness Score: Weighted average of tasks and materials (simplified)
  const readiness = Math.round(taskProgress);

  res.json({
    message: "System Synchronized",
    readiness: readiness || 0,
    stats: {
      totalSubjects: db.subjects.length,
      totalMaterials: db.materials.length,
      pendingTasks: totalTasks - completedTasks
    }
  });
});

// SUBJECTS (Stage 3 Refined)
app.get('/api/subjects', (req, res) => res.json(db.subjects));
app.post('/api/subjects', (req, res) => {
  const newSub = { id: Date.now(), ...req.body };
  db.subjects.push(newSub);
  updateDb('subjects', db.subjects);
  res.status(201).json(newSub);
});
app.delete('/api/subjects/:id', (req, res) => {
  db.subjects = db.subjects.filter(s => s.id != req.params.id);
  updateDb('subjects', db.subjects);
  res.status(204).send();
});

// MATERIALS (Stage 4 Refined)
app.get('/api/materials', (req, res) => res.json(db.materials));
app.post('/api/materials', (req, res) => {
  const newMat = { id: Date.now(), ...req.body, createdAt: new Date().toISOString() };
  db.materials.push(newMat);
  updateDb('materials', db.materials);
  res.status(201).json(newMat);
});
app.delete('/api/materials/:id', (req, res) => {
  db.materials = db.materials.filter(m => m.id != req.params.id);
  updateDb('materials', db.materials);
  res.status(204).send();
});

// TASKS (Stage 5)
app.get('/api/tasks', (req, res) => res.json(db.tasks));
app.post('/api/tasks', (req, res) => {
  const newTask = { id: Date.now(), ...req.body, completed: false };
  db.tasks.push(newTask);
  updateDb('tasks', db.tasks);
  res.status(201).json(newTask);
});
app.patch('/api/tasks/:id', (req, res) => {
  db.tasks = db.tasks.map(t => t.id == req.params.id ? { ...t, ...req.body } : t);
  updateDb('tasks', db.tasks);
  res.json(db.tasks.find(t => t.id == req.params.id));
});
app.delete('/api/tasks/:id', (req, res) => {
  db.tasks = db.tasks.filter(t => t.id != req.params.id);
  updateDb('tasks', db.tasks);
  res.status(204).send();
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
