import { db } from '../firebase';
import {
  doc, getDoc, setDoc, updateDoc, collection,
  query, orderBy, limit, getDocs, addDoc, serverTimestamp, Timestamp
} from 'firebase/firestore';

// ─── USER PROFILE (Phase 2) ───────────────────────────────────
// Creates user doc on first login, fetches on subsequent

export const ensureUserProfile = async (firebaseUser) => {
  const ref = doc(db, 'users', firebaseUser.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    // First login — create profile
    const profileData = {
      uid: firebaseUser.uid,
      name: firebaseUser.displayName || 'User',
      email: firebaseUser.email || '',
      photoURL: firebaseUser.photoURL || '',
      createdAt: serverTimestamp(),
      lastActiveDate: todayString(),
      streakCount: 1,
      xp: 0,
      level: 1,
    };
    await setDoc(ref, profileData);
    return profileData;
  } else {
    // Returning user — update streak + return profile
    const data = snap.data();
    const updatedStreak = computeStreak(data.lastActiveDate, data.streakCount);
    
    await updateDoc(ref, {
      lastActiveDate: todayString(),
      streakCount: updatedStreak,
      // Sync name/photo in case they changed on Google side
      name: firebaseUser.displayName || data.name,
      photoURL: firebaseUser.photoURL || data.photoURL,
    });

    return { ...data, streakCount: updatedStreak, lastActiveDate: todayString() };
  }
};

// ─── STREAK LOGIC (Phase 3) ──────────────────────────────────

function todayString() {
  return new Date().toISOString().split('T')[0]; // "2026-04-10"
}

function computeStreak(lastActiveDate, currentStreak) {
  if (!lastActiveDate) return 1;

  const today = new Date(todayString());
  const last = new Date(lastActiveDate);
  const diffMs = today - last;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return currentStreak;      // same day
  if (diffDays === 1) return currentStreak + 1;   // consecutive day
  return 1;                                        // gap > 1 day → reset
}

// ─── LEADERBOARD (Phase 4) ───────────────────────────────────

export const updateLeaderboard = async (uid, name, photoURL, streakCount, xp) => {
  const ref = doc(db, 'leaderboard', uid);
  await setDoc(ref, {
    uid,
    name: name || 'User',
    photoURL: photoURL || '',
    streakCount: streakCount || 0,
    xp: xp || 0,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};

export const getLeaderboard = async (max = 10) => {
  const q = query(
    collection(db, 'leaderboard'),
    orderBy('xp', 'desc'),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ─── ACTIVITY TRACKING (Phase 5) ─────────────────────────────

export const logActivity = async (uid, type, meta = {}) => {
  await addDoc(collection(db, 'activity'), {
    uid,
    type,          // 'login' | 'study_session' | 'task_complete' | 'xp_gain'
    meta,
    timestamp: serverTimestamp(),
  });
};

// ─── XP SYNC ─────────────────────────────────────────────────

export const syncXpToFirestore = async (uid, xp, level) => {
  const ref = doc(db, 'users', uid);
  await updateDoc(ref, { xp, level });
};
