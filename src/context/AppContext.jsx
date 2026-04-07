import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "../services/firebase";
import * as firebaseService from "../services/firebaseService";
import toast from "react-hot-toast";

const AppContext = createContext();

// Default profile template
const DEFAULT_PROFILE = {
  firstName: "Scholar",
  lastName: "Student",
  email: "",
  xp: 500,
  level: 1,
  institution: "Education Institute",
  studyTimeMinutes: 0,
  avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Scholar",
};

// Default settings template
const DEFAULT_SETTINGS = {
  theme: "dark",
  notifications: true,
  emailNotifications: false,
  studyReminders: true,
  dailyGoal: 120,
  soundEnabled: true,
  animationsEnabled: true,
};

/**
 * AppProvider - Wraps entire app with context
 */
export const AppProvider = ({ children }) => {
  // ==================== AUTH STATE ====================
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // ==================== UI STATE ====================
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ==================== DATA STATE ====================
  const [subjects, setSubjects] = useState([]);
  const [materials, setMaterials] = useState({});
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // ==================== LOADING & ERROR STATE ====================
  const [dataLoading, setDataLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // ==================== AUTH MANAGEMENT ====================

  /**
   * Initialize auth listener on mount
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // Initialize or get user document
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          let userData = {
            email: currentUser.email,
            firstName: currentUser.displayName?.split(" ")[0] || "Scholar",
            lastName: currentUser.displayName?.split(" ")[1] || "Student",
            avatarUrl: currentUser.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Scholar",
            createdAt: new Date().toISOString(),
          };

          // If user doesn't exist, create document
          if (!userDocSnap.exists()) {
            await setDoc(userDocRef, userData);
          } else {
            // Load existing user data
            userData = userDocSnap.data();
          }

          // Update profile with loaded data
          setProfile((prev) => ({
            ...prev,
            ...userData,
          }));

          // Load user subjects with real-time sync
          loadUserSubjects(currentUser.uid);
        } catch (error) {
          console.error("Error initializing user:", error);
          toast.error("Failed to load user data");
        }
      } else {
        // Clear data on logout
        setSubjects([]);
        setMaterials({});
        setNotifications([]);
        setProfile(DEFAULT_PROFILE);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Login with Google
   */
  const loginWithGoogle = useCallback(async () => {
    try {
      setAuthError(null);
      await signInWithPopup(auth, googleProvider);
      toast.success("Identity Verified ✓");
    } catch (error) {
      const errorMessage = error.message || "Authentication failed";
      setAuthError(errorMessage);
      toast.error(`Auth Error: ${errorMessage}`);
      console.error("Login error:", error);
    }
  }, []);

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setSubjects([]);
      setMaterials({});
      setNotifications([]);
      setProfile(DEFAULT_PROFILE);
      setSettings(DEFAULT_SETTINGS);
      toast.success("Disconnected ✓");
    } catch (error) {
      toast.error(`Logout failed: ${error.message}`);
      console.error("Logout error:", error);
    }
  }, []);

  // ==================== SUBJECT MANAGEMENT ====================

  /**
   * Load all subjects for user (initial load)
   */
  const loadUserSubjects = useCallback(async (userId) => {
    try {
      setDataLoading(true);

      // Subscribe to real-time updates
      firebaseService.subscribeToSubjects(userId, (subjectsData) => {
        setSubjects(subjectsData);
      });
    } catch (error) {
      toast.error("Failed to load subjects");
      console.error("Error loading subjects:", error);
    } finally {
      setDataLoading(false);
    }
  }, []);

  /**
   * Create new subject
   */
  const addSubject = useCallback(
    async (name) => {
      if (!user) {
        toast.error("You must be logged in");
        return null;
      }

      try {
        setDataLoading(true);
        const docId = await firebaseService.addSubject(user.uid, name);
        toast.success("Subject created ✓");

        // Add optimistic update notification
        addNotification(`"${name}" added to your modules`, "info");

        return docId;
      } catch (error) {
        toast.error(error.message || "Failed to create subject");
        console.error("Error creating subject:", error);
      } finally {
        setDataLoading(false);
      }
    },
    [user]
  );

  /**
   * Delete subject
   */
  const deleteSubject = useCallback(
    async (subjectId) => {
      if (!user) return;

      try {
        await firebaseService.deleteSubject(user.uid, subjectId);
        toast.success("Subject deleted");
        addNotification("Subject removed from your modules", "info");
      } catch (error) {
        toast.error(error.message || "Failed to delete subject");
        console.error("Error deleting subject:", error);
      }
    },
    [user]
  );

  /**
   * Update subject (progress, name, etc)
   */
  const updateSubject = useCallback(
    async (subjectId, updates) => {
      if (!user) return;

      try {
        await firebaseService.updateSubject(user.uid, subjectId, updates);
      } catch (error) {
        toast.error(error.message || "Failed to update subject");
        console.error("Error updating subject:", error);
      }
    },
    [user]
  );

  // ==================== MATERIAL MANAGEMENT ====================

  /**
   * Subscribe to materials for a subject
   */
  const loadSubjectMaterials = useCallback(
    (subjectId) => {
      if (!user) return;

      try {
        // Don't set loading state for material loads
        firebaseService.subscribeToMaterials(
          user.uid,
          subjectId,
          (materialsData) => {
            setMaterials((prev) => ({
              ...prev,
              [subjectId]: materialsData,
            }));
          }
        );
      } catch (error) {
        toast.error("Failed to load materials");
        console.error("Error loading materials:", error);
      }
    },
    [user]
  );

  /**
   * Add material with file upload
   */
  const addMaterial = useCallback(
    async (subjectId, material, file = null) => {
      if (!user) {
        toast.error("You must be logged in");
        return null;
      }

      try {
        setDataLoading(true);
        setUploadProgress(0);

        const docId = await firebaseService.addMaterial(
          user.uid,
          subjectId,
          material,
          file
        );

        setUploadProgress(100);
        toast.success("Material archived ✓");

        const subject = subjects.find((s) => s.id === subjectId);
        addNotification(
          `"${material.title}" added to ${subject?.name || "module"}`,
          "info"
        );

        return docId;
      } catch (error) {
        toast.error(error.message || "Failed to upload material");
        console.error("Error adding material:", error);
      } finally {
        setDataLoading(false);
        setUploadProgress(0);
      }
    },
    [user, subjects]
  );

  /**
   * Delete material
   */
  const deleteMaterial = useCallback(
    async (subjectId, materialId, fileUrl = null) => {
      if (!user) return;

      try {
        await firebaseService.deleteMaterial(
          user.uid,
          subjectId,
          materialId,
          fileUrl
        );
        toast.success("Material removed");
      } catch (error) {
        toast.error(error.message || "Failed to delete material");
        console.error("Error deleting material:", error);
      }
    },
    [user]
  );

  /**
   * Get materials for subject (from local state)
   */
  const getMaterials = useCallback(
    (subjectId) => {
      return materials[subjectId] || [];
    },
    [materials]
  );

  // ==================== NOTIFICATION MANAGEMENT ====================

  /**
   * Add notification
   */
  const addNotification = useCallback((message, type = "info") => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setNotifications((prev) => [notification, ...prev].slice(0, 50));
  }, []);

  /**
   * Mark notification as read
   */
  const markNotificationRead = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  }, []);

  /**
   * Mark all notifications as read
   */
  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  /**
   * Clear all notifications
   */
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // ==================== SETTINGS MANAGEMENT ====================

  /**
   * Update settings
   */
  const updateSettings = useCallback(
    async (newSettings) => {
      if (!user) {
        toast.error("You must be logged in");
        return;
      }

      try {
        // Update Firestore user document settings
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(
          userDocRef,
          {
            settings: newSettings,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        // Update local state
        setSettings((prev) => ({
          ...prev,
          ...newSettings,
        }));

        toast.success("Settings updated ✓");
      } catch (error) {
        console.error("Error updating settings:", error);
        toast.error("Failed to update settings");
      }
    },
    [user]
  );

  // ==================== PROFILE MANAGEMENT ====================

  /**
   * Update profile
   */
  const updateProfile = useCallback(
    async (updates) => {
      if (!user) {
        toast.error("You must be logged in");
        return;
      }

      try {
        setDataLoading(true);

        // Handle avatar file upload
        let profileUpdates = { ...updates };
        if (updates.avatar && updates.avatar instanceof File) {
          try {
            const avatarUrl = await firebaseService.uploadFile(
              user.uid,
              updates.avatar
            );
            profileUpdates.avatarUrl = avatarUrl;
            delete profileUpdates.avatar; // Remove file object
          } catch (error) {
            toast.error(`Avatar upload failed: ${error.message}`);
            throw error;
          }
        }

        // Update Firestore user document
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(
          userDocRef,
          {
            ...profileUpdates,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        // Update local state
        setProfile((prev) => ({
          ...prev,
          ...profileUpdates,
        }));

        toast.success("Profile updated ✓");
      } catch (error) {
        console.error("Error updating profile:", error);
        toast.error(error.message || "Failed to update profile");
      } finally {
        setDataLoading(false);
      }
    },
    [user]
  );

  // ==================== CONTEXT VALUE ====================

  const value = {
    // Auth
    user,
    loading,
    authError,
    loginWithGoogle,
    logout,

    // UI
    isMobileMenuOpen,
    setIsMobileMenuOpen,

    // Subjects
    subjects,
    addSubject,
    deleteSubject,
    updateSubject,
    loadUserSubjects,
    dataLoading,

    // Materials
    materials,
    addMaterial,
    deleteMaterial,
    getMaterials,
    loadSubjectMaterials,
    uploadProgress,

    // Notifications
    notifications,
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,

    // Settings & Profile
    profile,
    updateProfile,
    settings,
    updateSettings,
  };

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  );
};

/**
 * useAppContext Hook
 */
export const useAppContext = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }

  return context;
};

export default AppContext;
