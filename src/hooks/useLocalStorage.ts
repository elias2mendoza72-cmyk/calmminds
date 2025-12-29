import { useState, useEffect, useCallback } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Get stored value or use initial
  const readValue = useCallback((): T => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version that updates localStorage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Remove value from storage
  const removeValue = useCallback(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
        setStoredValue(initialValue);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [initialValue, key]);

  // Listen for changes to this key from other tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setStoredValue(JSON.parse(event.newValue));
        } catch {
          // Ignore parsing errors
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue];
}

// Hook for storing recent panic mode features
export function useRecentPanicFeatures() {
  const [recentFeatures, setRecentFeatures] = useLocalStorage<string[]>(
    "calmmind_recent_panic_features",
    []
  );

  const addRecentFeature = useCallback(
    (featureId: string) => {
      setRecentFeatures((prev) => {
        const filtered = prev.filter((id) => id !== featureId);
        return [featureId, ...filtered].slice(0, 3); // Keep last 3
      });
    },
    [setRecentFeatures]
  );

  return { recentFeatures, addRecentFeature };
}

// Hook for storing breathing exercise progress
export function useBreathingProgress() {
  const [progress, setProgress, clearProgress] = useLocalStorage<{
    patternIndex: number;
    cyclesCompleted: number;
    lastUsed: string;
  } | null>("calmmind_breathing_progress", null);

  const saveProgress = useCallback(
    (patternIndex: number, cyclesCompleted: number) => {
      setProgress({
        patternIndex,
        cyclesCompleted,
        lastUsed: new Date().toISOString(),
      });
    },
    [setProgress]
  );

  // Check if progress is recent (within last hour)
  const isProgressRecent = progress
    ? Date.now() - new Date(progress.lastUsed).getTime() < 60 * 60 * 1000
    : false;

  return {
    progress: isProgressRecent ? progress : null,
    saveProgress,
    clearProgress,
  };
}
