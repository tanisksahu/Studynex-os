import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, onAuthStateChanged, signInWithGoogle, logOut } from '../firebase';
import { ensureUserProfile, logActivity, updateLeaderboard } from '../services/firestoreService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [firestoreProfile, setFirestoreProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          // Persist/fetch Firestore profile + compute streak
          const profile = await ensureUserProfile(currentUser);
          setFirestoreProfile(profile);

          // Log login activity
          await logActivity(currentUser.uid, 'login', {
            name: currentUser.displayName,
          });

          // Seed leaderboard entry
          await updateLeaderboard(
            currentUser.uid,
            currentUser.displayName,
            currentUser.photoURL,
            profile.streakCount,
            profile.xp || 0
          );
        } catch (err) {
          if (import.meta.env.DEV) {
            console.error('Firestore profile sync failed:', err);
          }
          // Fallback — app still works without Firestore
          setFirestoreProfile(null);
        }
      } else {
        setFirestoreProfile(null);
      }

      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, firestoreProfile, setFirestoreProfile, loading, signInWithGoogle, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
