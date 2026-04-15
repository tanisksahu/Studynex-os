import { useState, useEffect } from 'react';
import { getLeaderboard } from '../services/firestoreService';

export const useLeaderboard = (max = 5) => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard(max)
      .then(data => setLeaders(data))
      .catch(() => setLeaders([]))
      .finally(() => setLoading(false));
  }, [max]);

  return { leaders, loading };
};
