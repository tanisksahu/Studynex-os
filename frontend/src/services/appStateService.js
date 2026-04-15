import { db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export const defaultAppState = {
  settings: {
    theme: 'dark',
    dataPersistence: true,
    aiInjection: true,
    notifications: true,
    reminders: true,
  },
  profile: {
    firstName: 'User',
    lastName: '',
    email: '',
    institution: '',
    xp: 0,
    level: 1,
    streak: 0,
    targetGpa: 3.9,
    studyTimeMinutes: 0,
    avatarUrl: '',
  },
  notifications: [
    { id: 1, type: 'alert', message: 'Exam for Data Structures in 30 Days', timestamp: new Date().toISOString(), read: false },
    { id: 2, type: 'ai', message: 'AI Plan Available: Finish Microeconomics Unit 3', timestamp: new Date(Date.now() - 3600000).toISOString(), read: false },
  ],
  rawSubjects: [
    { id: 1, name: 'Data Structures', code: 'CS201', difficulty: 'Hard', examDate: '2026-05-15', totalUnits: 8 },
    { id: 2, name: 'Microeconomics', code: 'ECON101', difficulty: 'Medium', examDate: '2026-06-01', totalUnits: 10 },
    { id: 3, name: 'Systems Architecture', code: 'CS301', difficulty: 'Hard', examDate: '2026-05-20', totalUnits: 6 },
    { id: 4, name: 'Linear Algebra', code: 'MATH200', difficulty: 'Medium', examDate: '2026-05-12', totalUnits: 5 },
  ],
  units: [
    { subjectId: 1, unitNumber: 1, completed: true },
    { subjectId: 1, unitNumber: 2, completed: true },
    { subjectId: 1, unitNumber: 3, completed: true },
    { subjectId: 2, unitNumber: 1, completed: true },
    { subjectId: 2, unitNumber: 2, completed: true },
    { subjectId: 2, unitNumber: 3, completed: true },
    { subjectId: 2, unitNumber: 4, completed: true },
    { subjectId: 2, unitNumber: 5, completed: true },
    { subjectId: 2, unitNumber: 6, completed: true },
    { subjectId: 2, unitNumber: 7, completed: true },
    { subjectId: 2, unitNumber: 8, completed: true },
  ],
  masteryData: [
    { subjectId: 1, retention: 82, timeSpent: 300, level: 'Advanced' },
    { subjectId: 2, retention: 95, timeSpent: 450, level: 'Expert' },
    { subjectId: 3, retention: 64, timeSpent: 120, level: 'Beginner' },
    { subjectId: 4, retention: 71, timeSpent: 180, level: 'Intermediate' },
  ],
  tasks: [
    { id: 1, title: 'Review System Calls (Ch 4)', time: '09:00 AM', completed: true, isLive: false, priority: true },
    { id: 2, title: 'Mock Exam: Microeconomics', time: '11:30 AM', completed: false, isLive: true, priority: true },
  ],
  materials: [
    { id: 101, title: 'Midterm Outline 2026', type: 'pdf', subject: 'Data Structures', unit: 'Unit 4', addedAt: new Date().toISOString(), confidence: 98 },
  ],
};

function cloneDefaults() {
  return JSON.parse(JSON.stringify(defaultAppState));
}

function stateDocRef(uid) {
  return doc(db, 'users', uid, 'appState', 'main');
}

function safeArray(value, fallback) {
  return Array.isArray(value) ? value : fallback;
}

function sanitizeString(value, maxLen = 180) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

function sanitizeDate(value) {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().split('T')[0];
}

export function normalizeAppState(data) {
  const defaults = cloneDefaults();
  if (!data || typeof data !== 'object') return defaults;

  const settings = {
    ...defaults.settings,
    ...(data.settings || {}),
  };

  const profile = {
    ...defaults.profile,
    ...(data.profile || {}),
    firstName: sanitizeString((data.profile || {}).firstName || defaults.profile.firstName, 64) || 'User',
    lastName: sanitizeString((data.profile || {}).lastName || defaults.profile.lastName, 64),
    institution: sanitizeString((data.profile || {}).institution || defaults.profile.institution, 120),
    email: sanitizeString((data.profile || {}).email || defaults.profile.email, 254),
    avatarUrl: sanitizeString((data.profile || {}).avatarUrl || defaults.profile.avatarUrl, 2048),
  };

  return {
    settings,
    profile,
    notifications: safeArray(data.notifications, defaults.notifications),
    rawSubjects: safeArray(data.rawSubjects, defaults.rawSubjects),
    units: safeArray(data.units, defaults.units),
    masteryData: safeArray(data.masteryData, defaults.masteryData),
    tasks: safeArray(data.tasks, defaults.tasks),
    materials: safeArray(data.materials, defaults.materials),
  };
}

export async function loadUserAppState(uid) {
  const ref = stateDocRef(uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const defaults = cloneDefaults();
    await setDoc(ref, { ...defaults, updatedAt: serverTimestamp() });
    return defaults;
  }
  return normalizeAppState(snap.data());
}

export async function saveUserAppState(uid, appState) {
  const ref = stateDocRef(uid);
  const sanitized = normalizeAppState(appState);
  await setDoc(ref, { ...sanitized, updatedAt: serverTimestamp() }, { merge: true });
}

export function validateSubjectInput(subject) {
  const name = sanitizeString(subject.name, 100);
  const code = sanitizeString(subject.code, 24).toUpperCase();
  const difficulty = ['Easy', 'Medium', 'Hard'].includes(subject.difficulty) ? subject.difficulty : 'Medium';
  const totalUnits = Number(subject.totalUnits);
  const examDate = sanitizeDate(subject.examDate);

  if (!name || !code || !examDate) {
    return { ok: false, message: 'Subject name, code, and exam date are required.' };
  }
  if (!Number.isInteger(totalUnits) || totalUnits < 1 || totalUnits > 25) {
    return { ok: false, message: 'Total units must be an integer between 1 and 25.' };
  }

  return {
    ok: true,
    value: { name, code, difficulty, totalUnits, examDate },
  };
}

export function validateTaskInput(task) {
  const title = sanitizeString(task.title, 160);
  const time = sanitizeString(task.time || 'Pending', 40) || 'Pending';
  if (!title) {
    return { ok: false, message: 'Task title is required.' };
  }
  return {
    ok: true,
    value: {
      ...task,
      title,
      time,
      completed: !!task.completed,
      isLive: !!task.isLive,
      priority: !!task.priority,
    },
  };
}

export function validateMaterialInput(material) {
  const title = sanitizeString(material.title, 180);
  const content = sanitizeString(material.content || '', 10000);
  const allowedTypes = ['pdf', 'image', 'youtube', 'link', 'text', 'gdrive'];
  const type = allowedTypes.includes(material.type) ? material.type : 'text';

  if (!title && !content) {
    return { ok: false, message: 'Material title or content is required.' };
  }

  return {
    ok: true,
    value: {
      ...material,
      title: title || 'Untitled Material',
      content,
      type,
    },
  };
}
