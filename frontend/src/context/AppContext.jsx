import React, { createContext, useContext, useState, useMemo, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { syncXpToFirestore, updateLeaderboard, logActivity } from '../services/firestoreService';
import {
  defaultAppState,
  loadUserAppState,
  saveUserAppState,
  validateMaterialInput,
  validateSubjectInput,
  validateTaskInput,
} from '../services/appStateService';
import toast from 'react-hot-toast';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Global Layout State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  const hasHydratedRef = useRef(false);

  // Get real user from Firebase Auth
  const { user, firestoreProfile } = useAuth();

  // Settings & Gamification
  const [settings, setSettings] = useState(defaultAppState.settings);

  const [profile, setProfile] = useState(defaultAppState.profile);
  const [notifications, setNotifications] = useState(defaultAppState.notifications);
  const [rawSubjects, setRawSubjects] = useState(defaultAppState.rawSubjects);
  const [units, setUnits] = useState(defaultAppState.units);
  const [masteryData, setMasteryData] = useState(defaultAppState.masteryData);
  const [tasksRaw, setTasksRaw] = useState(defaultAppState.tasks);
  const [materials, setMaterials] = useState(defaultAppState.materials);
  const tasks = tasksRaw;

  const setTasks = (updater) => {
    setTasksRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (!Array.isArray(next)) {
        return prev;
      }

      return next
        .map(task => {
          const validated = validateTaskInput(task);
          return validated.ok ? validated.value : null;
        })
        .filter(Boolean);
    });
  };

  const resetUserData = () => {
    setSettings(defaultAppState.settings);
    setProfile(defaultAppState.profile);
    setNotifications(defaultAppState.notifications);
    setRawSubjects(defaultAppState.rawSubjects);
    setUnits(defaultAppState.units);
    setMasteryData(defaultAppState.masteryData);
    setTasksRaw(defaultAppState.tasks);
    setMaterials(defaultAppState.materials);
  };

  useEffect(() => {
    let active = true;

    const hydrate = async () => {
      if (!user?.uid) {
        hasHydratedRef.current = false;
        resetUserData();
        setIsHydrating(false);
        return;
      }

      setIsHydrating(true);

      try {
        const state = await loadUserAppState(user.uid);
        if (!active) return;

        setSettings(state.settings);
        setProfile(state.profile);
        setNotifications(state.notifications);
        setRawSubjects(state.rawSubjects);
        setUnits(state.units);
        setMasteryData(state.masteryData);
        setTasksRaw(state.tasks);
        setMaterials(state.materials);
      } catch {
        if (!active) return;
        resetUserData();
      } finally {
        if (active) {
          hasHydratedRef.current = true;
          setIsHydrating(false);
        }
      }
    };

    hydrate();

    return () => {
      active = false;
    };
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid || !hasHydratedRef.current || isHydrating) {
      return;
    }

    const timer = setTimeout(() => {
      saveUserAppState(user.uid, {
        settings,
        profile,
        notifications,
        rawSubjects,
        units,
        masteryData,
        tasks: tasksRaw,
        materials,
      }).catch(() => {
        // Keep UX responsive if a background save fails.
      });
    }, 450);

    return () => clearTimeout(timer);
  }, [
    user?.uid,
    isHydrating,
    settings,
    profile,
    notifications,
    rawSubjects,
    units,
    masteryData,
    tasksRaw,
    materials,
  ]);

  // Seed profile from Firebase user on login
  useEffect(() => {
    if (user) {
      const nameParts = (user.displayName || 'User').split(' ');
      setProfile(prev => ({
        ...prev,
        firstName: nameParts[0] || 'User',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email || prev.email,
        avatarUrl: user.photoURL || prev.avatarUrl,
        streak: firestoreProfile?.streakCount ?? prev.streak,
        xp: firestoreProfile?.xp ?? prev.xp,
        level: firestoreProfile?.level ?? prev.level,
      }));
    }
  }, [user, firestoreProfile]);

  const addXp = (amount) => {
    setProfile(prev => {
      let newXp = prev.xp + amount;
      let newLevel = Math.floor(newXp / 200) + 1;
      if (newLevel > prev.level) toast.success(`Leveled Up to ${newLevel}! 🎉`, { style: { background: '#333', color: '#fff' } });

      // Sync to Firestore in background (non-blocking)
      if (user) {
        syncXpToFirestore(user.uid, newXp, newLevel).catch(() => {});
        updateLeaderboard(user.uid, user.displayName, user.photoURL, firestoreProfile?.streakCount || 0, newXp).catch(() => {});
        logActivity(user.uid, 'xp_gain', { amount, newTotal: newXp }).catch(() => {});
      }

      return { ...prev, xp: newXp, level: newLevel };
    });
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };
  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications cleared');
  };
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Backward-Compatible Computed 'subjects' state
  const subjects = useMemo(() => {
    return rawSubjects.map(sub => {
      const subUnits = units.filter(u => u.subjectId === sub.id);
      const completed = subUnits.filter(u => u.completed).length;
      const progress = sub.totalUnits > 0 ? Math.round((completed / sub.totalUnits) * 100) : 0;
      const mastery = masteryData.find(m => m.subjectId === sub.id) || { retention: 0, timeSpent: 0, level: 'Unset' };
      
      return {
        ...sub,
        units: sub.totalUnits, 
        progress,
        retention: mastery.retention,
        timeSpent: mastery.timeSpent,
        masteryLevel: mastery.level,
        weak: progress < 50 || mastery.retention < 70,
      };
    }).sort((a,b) => new Date(a.examDate) - new Date(b.examDate));
  }, [rawSubjects, units, masteryData]);

  const addSubject = (newSub) => {
    const validated = validateSubjectInput(newSub);
    if (!validated.ok) {
      toast.error(validated.message, { style: { background: '#333', color: '#fff' }});
      return false;
    }

    const normalized = validated.value;

    // Duplicate guard logic
    if (rawSubjects.find(s => s.code.toLowerCase() === normalized.code.toLowerCase() || s.name.toLowerCase() === normalized.name.toLowerCase())) {
       toast.error(`Course ${normalized.code} already exists!`, { style: { background: '#333', color: '#fff' }});
       return false;
    }
    const createdSubjectId = Date.now();
    setRawSubjects(prev => [...prev, { ...normalized, id: createdSubjectId }]);
    toast.success(`${normalized.code} successfully registered!`, { style: { background: '#222', color: '#fff' }});
    // Units actually don't NEED pre-generation in the units array until completed, but we can seed them
    return true;
  };

  const removeSubject = (subjectId) => {
    setRawSubjects(prev => prev.filter(s => s.id !== subjectId));
    setUnits(prev => prev.filter(u => u.subjectId !== subjectId));
    setMasteryData(prev => prev.filter(m => m.subjectId !== subjectId));
    toast.success('Subject removed from the system.', { icon: '🗑️', style: { background: '#222', color: '#fff' } });
  };

  const toggleUnitCompletion = (subjectId, unitNumber) => {
    setUnits(prev => {
      const existing = prev.find(u => u.subjectId === subjectId && u.unitNumber === unitNumber);
      if (existing) {
        return prev.map(u => u === existing ? { ...u, completed: !u.completed } : u);
      }
      return [...prev, { subjectId, unitNumber, completed: true }];
    });
    addXp(50);
  };

  const [activityData] = useState([
    { day: 'Mon', hours: 4 }, { day: 'Tue', hours: 2.5 }, { day: 'Wed', hours: 5 }, { day: 'Thu', hours: 3 }, { day: 'Fri', hours: 6 }, { day: 'Sat', hours: 2 }, { day: 'Sun', hours: 4.5 }
  ]);

  const addMaterial = (newMaterial) => {
    const validated = validateMaterialInput(newMaterial);
    if (!validated.ok) {
      toast.error(validated.message);
      return null;
    }

    const material = {
      ...validated.value,
      id: Date.now(),
      addedAt: new Date().toISOString(),
      confidence: Math.floor(Math.random() * (99 - 80 + 1) + 80),
    };
    setMaterials((prevMaterials) => [...prevMaterials, material]);
    addXp(50);
    return material;
  };

  const deleteMaterial = (id) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
    toast.success('Material safely removed.', { style: { background: '#222', color: '#fff' }});
  };

  // Add material directly to a subject unit (bypasses inbox)
  const addMaterialToUnit = (subjectId, unitNumber, materialData) => {
    const validated = validateMaterialInput(materialData);
    if (!validated.ok) {
      toast.error(validated.message);
      return null;
    }

    const sub = rawSubjects.find(s => s.id === subjectId);
    const newMat = {
      ...validated.value,
      id: Date.now(),
      subjectId,
      unitNumber,
      subject: sub?.name || 'Unknown',
      unit: `Unit ${unitNumber}`,
      createdAt: new Date().toISOString(),
      confidence: Math.floor(Math.random() * 15 + 85),
      importance: null,
      summary: null,
      status: 'active',
    };
    setMaterials(prev => [...prev, newMat]);
    addXp(30);
    toast.success(`Added to Unit ${unitNumber}`, { icon: '📎', style: { background: '#222', color: '#fff' } });
    return newMat;
  };

  // Update a unit's display name
  const updateUnitName = (subjectId, unitNumber, name) => {
    const trimmed = (name || '').trim().slice(0, 80);
    if (!trimmed) return;

    setUnits(prev => {
      const existing = prev.find(u => u.subjectId === subjectId && u.unitNumber === unitNumber);
      if (existing) {
        return prev.map(u => u.subjectId === subjectId && u.unitNumber === unitNumber ? { ...u, name: trimmed } : u);
      }
      return [...prev, { subjectId, unitNumber, completed: false, name: trimmed }];
    });
  };

  // Route a pending inbox material to a specific subject + unit
  const routeMaterialToUnit = (materialId, subjectId, unitNumber) => {
    const sub = rawSubjects.find(s => s.id === subjectId);
    setMaterials(prev => prev.map(m =>
      m.id === materialId
        ? { ...m, subjectId, unitNumber, subject: sub?.name || m.subject, unit: `Unit ${unitNumber}`, status: 'active' }
        : m
    ));
    toast.success(`Routed to ${sub?.name} — Unit ${unitNumber}`, { icon: '✅', style: { background: '#222', color: '#4edea3', border: '1px solid #4edea3' } });
  };

  // Mock AI classifier — suggests subject + unit based on title keywords
  const generateAiSuggestion = (title = '', content = '') => {
    const text = (title + ' ' + content).toLowerCase();
    const subjectKeywords = [
      { keywords: ['tree', 'graph', 'sort', 'algorithm', 'stack', 'queue', 'linked'], subIdx: 0 },
      { keywords: ['supply', 'demand', 'elastic', 'market', 'gdp', 'price', 'economic'], subIdx: 1 },
      { keywords: ['cpu', 'memory', 'cache', 'pipeline', 'register', 'bus', 'arch'], subIdx: 2 },
      { keywords: ['matrix', 'vector', 'eigen', 'linear', 'determinant', 'algebra'], subIdx: 3 },
    ];
    let bestMatch = { subIdx: 0, score: 0 };
    subjectKeywords.forEach(({ keywords, subIdx }) => {
      const score = keywords.filter(k => text.includes(k)).length;
      if (score > bestMatch.score) bestMatch = { subIdx, score };
    });
    const suggestedSub = rawSubjects[bestMatch.subIdx] || rawSubjects[0];
    const suggestedUnit = bestMatch.score > 0 ? Math.min(2, (suggestedSub?.totalUnits || 1)) : 1;
    return {
      subjectId: suggestedSub?.id,
      subjectName: suggestedSub?.name || 'Unknown',
      unitNumber: suggestedUnit,
      confidence: bestMatch.score > 0 ? Math.floor(Math.random() * 10 + 80) : Math.floor(Math.random() * 20 + 55),
    };
  };

  const toggleTask = (taskId) => {
    setTasks(prev => {
      let newlyCompleted = false;
      const updated = prev.map(t => {
        if (t.id === taskId) { if (!t.completed) newlyCompleted = true; return { ...t, completed: !t.completed }; }
        return t;
      });
      if (newlyCompleted) { addXp(100); toast.success('Task Completed! +100 XP', { icon: '🔥', style: { background: '#333', color: '#fff' }}); }
      return updated;
    });
  };

  const updateSettings = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast.success(`Settings dynamically updated`, { style: { background: '#222', color: '#fff' }});
  };

  // Structured AI Action Engine (Intent Matcher)
  const dispatchAiAction = (input) => {
    return new Promise((resolve) => {
      const lowerInput = input.toLowerCase();
      let response = {
        message: 'Command unverified. Try asking me to "mark [Subject] Unit [X] complete" or "plan my day".',
        proposedAction: null
      };
      
      // Intent 1: Mark Unit Complete
      const completeMatch = lowerInput.match(/(?:mark|complete|finish).+?(?:unit|chapter)\s*(\d+)/i);
      if (completeMatch) {
         const unitNum = parseInt(completeMatch[1]);
         const targetSub = subjects.find(s => lowerInput.includes(s.name.toLowerCase().split(' ')[0]));
         if (targetSub && unitNum <= targetSub.totalUnits) {
           response = {
             message: `Found goal: Mark Unit ${unitNum} of ${targetSub.name} as complete. Shall I execute the state update?`,
             proposedAction: {
               type: 'TOGGLE_UNIT',
               params: { subjectId: targetSub.id, unitNumber: unitNum }
             }
           };
         } else {
           response.message = `⚠️ Missing parameters. I extracted Unit ${unitNum}, but please specify the exact Subject name attached to it.`;
         }
      } 
      // Intent 2: Generate Study Plan
      else if (lowerInput.includes('plan') || lowerInput.includes('schedule')) {
         const incompleteSubs = subjects.filter(s => s.progress < 100);
         if (incompleteSubs.length > 0) {
           response = {
             message: `Analytical scan complete. The ${incompleteSubs[0].name} exam is approaching. Shall I inject an emergency review task into your planner?`,
             proposedAction: {
               type: 'ADD_TASK',
               params: { title: `AI Re-Review: ${incompleteSubs[0].name}`, subId: incompleteSubs[0].id }
             }
           };
         }
      }
      
      setTimeout(() => resolve(response), 1000);
    });
  };

  const executeAction = (action) => {
    if (action.type === 'TOGGLE_UNIT') {
      toggleUnitCompletion(action.params.subjectId, action.params.unitNumber);
      toast.success('Unit Identity Synchronized');
    } else if (action.type === 'ADD_TASK') {
      setTasks(prev => [...prev, { id: Date.now(), title: action.params.title, time: 'AI Queue', completed: false, priority: true }]);
      toast.success('Task Injected into Mission Protocol');
    }
  };

  const contextValue = useMemo(() => ({
    isMobileMenuOpen, setIsMobileMenuOpen,
    notifications, markNotificationRead, markAllNotificationsRead, clearNotifications,
    subjects, rawSubjects, units, materials, tasks,
    addSubject, removeSubject, deleteMaterial,
    addMaterial, addMaterialToUnit, routeMaterialToUnit, updateUnitName, generateAiSuggestion,
    toggleTask, setTasks,
    toggleUnitCompletion,
    dispatchAiAction, executeAction,
    settings, updateSettings,
    profile, setProfile, addXp,
    isHydrating, resetUserData,
    activityData,
  }), [
    isMobileMenuOpen,
    notifications,
    subjects,
    rawSubjects,
    units,
    materials,
    tasks,
    settings,
    profile,
    isHydrating,
    activityData,
    addSubject,
    addMaterial,
    addMaterialToUnit,
    routeMaterialToUnit,
    generateAiSuggestion,
    toggleTask,
    toggleUnitCompletion,
    dispatchAiAction,
    executeAction,
    addXp,
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
