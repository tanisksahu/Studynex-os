import { useState, useCallback } from 'react';

/**
 * Hook for managing optimistic UI updates
 * Immediately updates UI while Firebase operation is in progress
 * Rolls back on error
 */
export const useOptimisticUpdate = (initialState = null) => {
  const [data, setData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateOptimistic = useCallback(
    async (optimisticData, asyncOperation) => {
      const previousData = data;
      
      try {
        setError(null);
        setIsLoading(true);
        
        // Immediately update UI
        setData(optimisticData);

        // Wait for async operation
        const result = await asyncOperation();

        // Update with confirmed data if returned
        if (result) {
          setData(result);
        }

        return result;
      } catch (err) {
        // Rollback on error
        setData(previousData);
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [data]
  );

  return {
    data,
    isLoading,
    error,
    updateOptimistic,
    reset: () => {
      setData(initialState);
      setError(null);
    }
  };
};

/**
 * Hook for managing list optimistic updates
 * Add/remove/update items optimistically
 */
export const useOptimisticList = (initialList = []) => {
  const [list, setList] = useState(initialList);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const addOptimistic = useCallback(
    async (tempItem, asyncOperation) => {
      const tempId = `temp_${Date.now()}`;
      const tempItemWithId = { ...tempItem, id: tempId, _isOptimistic: true };

      const previousList = list;

      try {
        setError(null);
        setIsLoading(true);

        // Add to UI immediately
        setList(prev => [tempItemWithId, ...prev]);

        // Execute async operation
        const result = await asyncOperation();

        // Replace temp item with real item
        setList(prev =>
          prev.map(item => (item.id === tempId ? result : item)).filter(item => !item._isOptimistic)
        );

        return result;
      } catch (err) {
        // Rollback on error
        setList(previousList);
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [list]
  );

  const removeOptimistic = useCallback(
    async (itemId, asyncOperation) => {
      const previousList = list;

      try {
        setError(null);
        setIsLoading(true);

        // Remove from UI immediately
        setList(prev => prev.filter(item => item.id !== itemId));

        // Execute async operation
        await asyncOperation();

        return true;
      } catch (err) {
        // Rollback on error
        setList(previousList);
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [list]
  );

  const updateOptimistic = useCallback(
    async (itemId, updates, asyncOperation) => {
      const previousList = list;

      try {
        setError(null);
        setIsLoading(true);

        // Update in UI immediately
        setList(prev =>
          prev.map(item =>
            item.id === itemId ? { ...item, ...updates, _isOptimistic: true } : item
          )
        );

        // Execute async operation
        const result = await asyncOperation();

        // Update with confirmed data
        setList(prev =>
          prev.map(item =>
            item.id === itemId ? { ...result, _isOptimistic: false } : item
          )
        );

        return result;
      } catch (err) {
        // Rollback on error
        setList(previousList);
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [list]
  );

  return {
    list,
    isLoading,
    error,
    addOptimistic,
    removeOptimistic,
    updateOptimistic,
    reset: () => {
      setList(initialList);
      setError(null);
    }
  };
};
