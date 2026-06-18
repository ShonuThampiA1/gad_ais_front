import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const ProfileCompletionContext = createContext();
export const useProfileCompletion = () => useContext(ProfileCompletionContext);

const REQUIRED_SECTIONS = [
  'personal',
  'dependent',
  'profile_photo',
  'education',
  'service',
  'central_deputation',
  'training',
  'awards',
  'disability',
  'disciplinary',
];

const LEGACY_PROGRESS_KEY = 'profile_completion';

const getProgressStorageKey = () => {
  if (typeof window === 'undefined') return LEGACY_PROGRESS_KEY;

  try {
    const selectedProfileId = sessionStorage.getItem('selected_profile_id');
    if (selectedProfileId) {
      return `${LEGACY_PROGRESS_KEY}:${selectedProfileId}`;
    }

    const rawUserDetails = sessionStorage.getItem('user_details');
    if (rawUserDetails) {
      const userDetails = JSON.parse(rawUserDetails);
      if (userDetails?.user_id) {
        return `${LEGACY_PROGRESS_KEY}:${userDetails.user_id}`;
      }
    }
  } catch (error) {
    console.error('Failed to resolve profile completion storage key:', error);
  }

  return LEGACY_PROGRESS_KEY;
};

const hasNumericProgress = (value) =>
  value &&
  typeof value.completed === 'number' &&
  typeof value.total === 'number';

const CARD_SECTION_CACHE_BYPASS = new Set(['service']);

const sanitizeSavedProgress = (progress) => {
  if (!progress || typeof progress !== 'object') return {};

  const next = { ...progress };
  CARD_SECTION_CACHE_BYPASS.forEach((section) => {
    delete next[section];
  });
  return next;
};

const getSavedProgress = () => {
  if (typeof window === 'undefined') return {};
  const storageKey = getProgressStorageKey();
  const saved =
    sessionStorage.getItem(storageKey) ||
    localStorage.getItem(storageKey) ||
    sessionStorage.getItem(LEGACY_PROGRESS_KEY) ||
    localStorage.getItem(LEGACY_PROGRESS_KEY);
  if (!saved) return {};

  try {
    return sanitizeSavedProgress(JSON.parse(saved) || {});
  } catch (error) {
    console.error('Failed to parse cached profile completion state:', error);
    return {};
  }
};

const hasCompleteCachedProgress = (progress) =>
  REQUIRED_SECTIONS.every((section) => hasNumericProgress(progress?.[section]));

const calculateProgressPercentage = (progressMap = {}) => {
  let totalFields = 0;
  let completedFields = 0;

  REQUIRED_SECTIONS.forEach((section) => {
    const progress = progressMap?.[section];
    if (hasNumericProgress(progress)) {
      totalFields += progress.total || 0;
      completedFields += progress.completed || 0;
    }
  });

  return totalFields === 0 ? 0 : Math.round((completedFields / totalFields) * 100);
};

export const ProfileCompletionProvider = ({ children }) => {
  const [sectionProgress, setSectionProgress] = useState(() => getSavedProgress());
  const [lastStableProgress, setLastStableProgress] = useState(() => {
    const savedProgress = getSavedProgress();
    return hasCompleteCachedProgress(savedProgress)
      ? calculateProgressPercentage(savedProgress)
      : null;
  });
  const [isProgressReady, setIsProgressReady] = useState(() => {
    const savedProgress = getSavedProgress();
    return hasCompleteCachedProgress(savedProgress);
  });
  
  const [sectionLoaded, setSectionLoaded] = useState(() => {
    const savedProgress = getSavedProgress();
    return REQUIRED_SECTIONS.reduce((acc, section) => {
      acc[section] = hasNumericProgress(savedProgress?.[section]);
      return acc;
    }, {});
  });
  const [initialLoadComplete, setInitialLoadComplete] = useState(() => {
    const savedProgress = getSavedProgress();
    return hasCompleteCachedProgress(savedProgress);
  });

  // Save to session storage when progress changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storageKey = getProgressStorageKey();
      const serialized = JSON.stringify(sectionProgress);
      sessionStorage.setItem(storageKey, serialized);
      localStorage.setItem(storageKey, serialized);
      sessionStorage.setItem(LEGACY_PROGRESS_KEY, serialized);
    }
  }, [sectionProgress]);

  // Log initial state
  useEffect(() => {
  }, []);

  // Mark a section as loaded (even if it has 0 fields)
  const markSectionLoaded = useCallback((sectionName) => {
    setSectionLoaded((prev) => {
      const newState = {
        ...prev,
        [sectionName]: true,
      };
      return newState;
    });
  }, []);

  const updateSectionProgress = useCallback((sectionName, completed, total) => {
    
    setSectionProgress((prev) => {
      if (
        prev[sectionName]?.completed === completed &&
        prev[sectionName]?.total === total
      ) {
        return prev;
      }
      
      const newState = {
        ...prev,
        [sectionName]: { 
          completed, 
          total,
          lastUpdated: Date.now(),
          completionPercentage: total > 0 ? (completed / total) * 100 : 0
        },
      };
      
      
      return newState;
    });
    
    // Mark this section as loaded
    markSectionLoaded(sectionName);
  }, [sectionProgress, markSectionLoaded]);

  const removeSectionProgress = useCallback((sectionName) => {
    setSectionProgress((prev) => {
      const updated = { ...prev };
      delete updated[sectionName];
      return updated;
    });
  }, []);

  const resetSectionProgress = useCallback(() => {
    setSectionProgress({});
    setSectionLoaded({});
    setInitialLoadComplete(false);
    setLastStableProgress(null);
    setIsProgressReady(false);
  }, []);

  const markInitialLoadComplete = useCallback(() => {
    setInitialLoadComplete(true);
    setLastStableProgress(calculateProgressPercentage(sectionProgress));
    setIsProgressReady(true);
  }, [sectionProgress]);

  const hydrateSectionProgress = useCallback((progressMap = {}, options = {}) => {
    const { markComplete = true, markLoaded = true } = options;
    const entries = Object.entries(progressMap).filter(([, value]) => hasNumericProgress(value));

    if (entries.length === 0) return;

    setIsProgressReady(false);

    setSectionProgress((prev) => {
      const next = { ...prev };
      entries.forEach(([section, value]) => {
        next[section] = {
          ...value,
          lastUpdated: value.lastUpdated || Date.now(),
          completionPercentage:
            typeof value.total === 'number' && value.total > 0
              ? (value.completed / value.total) * 100
              : 0,
        };
      });
      return next;
    });

    if (markLoaded) {
      setSectionLoaded((prev) => {
        const next = { ...prev };
        entries.forEach(([section]) => {
          next[section] = true;
        });
        return next;
      });
    }

    if (markComplete) {
      setInitialLoadComplete(true);
    }
  }, []);

  useEffect(() => {
    if (Object.keys(sectionProgress).length === 0) return;

    setIsProgressReady(false);

    const timer = setTimeout(() => {
      setLastStableProgress(calculateProgressPercentage(sectionProgress));
      setIsProgressReady(true);
    }, 700);

    return () => clearTimeout(timer);
  }, [sectionProgress]);

  // Log when sectionProgress changes
  useEffect(() => {
    if (Object.keys(sectionProgress).length > 0) {
      
      // Calculate and log each section's completion
      REQUIRED_SECTIONS.forEach(section => {
        const data = sectionProgress[section];
        if (data) {
        } else {
        }
      });
    }
  }, [sectionProgress]);

  // Log when sectionLoaded changes
  useEffect(() => {
    if (Object.keys(sectionLoaded).length > 0) {
      const loadedSections = REQUIRED_SECTIONS.filter(section => sectionLoaded[section]);
      const notLoadedSections = REQUIRED_SECTIONS.filter(section => !sectionLoaded[section]);
    }
  }, [sectionLoaded]);

  // Get overall progress with fallback for unloaded sections
  const overallProgress = useCallback(() => {
    let totalFields = 0;
    let completedFields = 0;
    let loadedSectionsCount = 0;

    for (const section of REQUIRED_SECTIONS) {
      const sec = sectionProgress[section];
      
      if (sec) {
        // Section is loaded and reported progress
        completedFields += sec.completed || 0;
        totalFields += sec.total || 0;
        loadedSectionsCount++;
      } else if (sectionLoaded[section]) {
        // Section was loaded but has 0 fields (empty section)
        loadedSectionsCount++;
      } else {
      }
    }


    // Don't calculate progress until all sections are loaded at least once
    if (loadedSectionsCount < REQUIRED_SECTIONS.length) {
      return 0;
    }

    const percentage = totalFields === 0 ? 0 : Math.round((completedFields / totalFields) * 100);
    
    return percentage;
  }, [sectionProgress, sectionLoaded]);

  // Alternative: Progressive loading that doesn't jump dramatically
  const overallProgressStable = useCallback(() => {
    const allProgress = {};
    
    for (const section of REQUIRED_SECTIONS) {
      const sec = sectionProgress[section];
      if (sec) {
        allProgress[section] = sec;
      } else {
        // For sections not yet loaded, use default values
        // This prevents jumps when sections load
        allProgress[section] = { completed: 0, total: 1 };
      }
    }

    let totalFields = 0;
    let completedFields = 0;

    Object.values(allProgress).forEach((sec) => {
      completedFields += sec.completed || 0;
      totalFields += sec.total || 0;
    });

    const percentage = totalFields === 0 ? 0 : Math.round((completedFields / totalFields) * 100);
    
    return percentage;
  }, [sectionProgress]);

  // Check if all sections have been loaded at least once
  const isLoaded = useMemo(() => {
    const loaded = REQUIRED_SECTIONS.every((sec) => {
      return sectionLoaded[sec] || sectionProgress[sec];
    });
    
    
    REQUIRED_SECTIONS.forEach(sec => {
    });
    
    return loaded;
  }, [sectionProgress, sectionLoaded]);

  // Initialize all sections as "pending" on first load
  useEffect(() => {
    if (!initialLoadComplete && Object.keys(sectionLoaded).length === 0) {
      const initialLoaded = {};
      REQUIRED_SECTIONS.forEach(section => {
        initialLoaded[section] = false;
      });
      setSectionLoaded(initialLoaded);
    }
  }, [initialLoadComplete, sectionLoaded]);

  // Provide a consistent progress value that doesn't jump
  const getConsistentProgress = useCallback(() => {

    if (!isProgressReady) {
      return typeof lastStableProgress === 'number' ? lastStableProgress : null;
    }

    const progress = calculateProgressPercentage(sectionProgress);
    
    return progress;
  }, [initialLoadComplete, isProgressReady, lastStableProgress, sectionProgress]);

  // Log the final progress value whenever it changes
  useEffect(() => {
    const progress = getConsistentProgress();
  }, [getConsistentProgress]);

  return (
    <ProfileCompletionContext.Provider
      value={{
        sectionProgress,
        sectionLoaded,
        updateSectionProgress,
        removeSectionProgress,
        resetSectionProgress,
        markSectionLoaded,
        overallProgress: getConsistentProgress, // Use consistent progress
        isProgressReady,
        isLoaded,
        initialLoadComplete,
        markInitialLoadComplete,
        hydrateSectionProgress,
      }}
    >
      {children}
    </ProfileCompletionContext.Provider>
  );
};
