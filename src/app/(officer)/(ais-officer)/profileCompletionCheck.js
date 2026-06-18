'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ProfileCompletionModal from '../../components/profileCompletionModal';
import axiosInstance from "@/utils/apiClient";
import {
  deriveErProfileModalType,
  deriveErProfileWorkflowState,
  storeErProfileWorkflowContext,
} from "@/utils/erProfileWorkflow";

export default function ProfileCheck() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState('incomplete');
  const [shouldShowModal, setShouldShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const hasFetchedStatus = useRef(false);
  const isFetching = useRef(false);
  const lastPathname = useRef(pathname);
  const abortControllerRef = useRef(null);

  // 🆕 Add debug ref to track modal state changes
  const modalActionRef = useRef({ lastAction: null, timestamp: null });
  const SCHEDULE_WINDOW_MODAL_KEY = 'er_profile_schedule_window_seen';

  const getScheduleWindowMarker = useCallback(() => {
    const workflowContextRaw = sessionStorage.getItem('er_profile_workflow_context');
    let workflowContext = null;
    try {
      workflowContext = workflowContextRaw ? JSON.parse(workflowContextRaw) : null;
    } catch {
      workflowContext = null;
    }

    const activeWindow = workflowContext?.change_preview?.active_window;
    return activeWindow
      ? String(activeWindow.window_id || activeWindow.schedule_code || activeWindow.start_date || 'active')
      : null;
  }, []);

  const fetchProfileStatus = useCallback(async (isInitial = false) => {
    // Prevent multiple simultaneous calls
    if (isFetching.current) {
      return;
    }

    const role_id = sessionStorage.getItem('role_id');
    const ais_per_id = sessionStorage.getItem('ais_per_id');
    

    if (role_id === '2' && ais_per_id) {
      try {
        isFetching.current = true;
        if (isInitial) {
          setIsLoading(true);
        }
        
        // Create abort controller for cleanup
        abortControllerRef.current = new AbortController();
        
        const statusResponse = await axiosInstance.post("/officer/profile-submit-status", {
          ais_per_id: String(ais_per_id),
        }, {
          signal: abortControllerRef.current.signal
        });

        let workflowContext = null;

        try {
          const workflowResponse = await axiosInstance.get(`/officer/er-profile/workflow-context/${ais_per_id}`, {
            signal: abortControllerRef.current.signal
          });
          workflowContext = workflowResponse?.data?.data || null;
          storeErProfileWorkflowContext(workflowContext);
        } catch (workflowError) {
          if (workflowError.name !== 'CanceledError' && workflowError.name !== 'AbortError') {
            console.error('Error fetching workflow context:', workflowError);
          }
        }
        
        
        // Access the profile_status array from the nested data structure
        const { profile_status: timeline } = statusResponse.data.data;
        
        const derivedState = deriveErProfileWorkflowState(workflowContext, timeline);
        const newModalType = deriveErProfileModalType(workflowContext, timeline);
        
        const currentStatus = sessionStorage.getItem('profile_workflow_state');
        const currentModalType = sessionStorage.getItem('profile_modal_type');
        
        if (currentStatus !== derivedState || currentModalType !== newModalType) {
          sessionStorage.setItem('profile_workflow_state', derivedState);
          sessionStorage.setItem('profile_modal_type', newModalType);
        }
        
        if (isInitial) {
          hasFetchedStatus.current = true;
        }
        
      } catch (error) {
        // Don't log if it's an abort error
        if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
          console.error('Error fetching profile status:', error);
          sessionStorage.setItem('profile_workflow_state', 'incomplete');
          sessionStorage.setItem('profile_modal_type', 'incomplete');
          storeErProfileWorkflowContext(null);
        }
      } finally {
        isFetching.current = false;
        if (isInitial) {
          setIsLoading(false);
        }
        abortControllerRef.current = null;
      }
    } else {
      if (isInitial) {
        setIsLoading(false);
      }
      isFetching.current = false;
    }
  }, []);

  const checkAndShowModal = useCallback(() => {
    const normalizedPathname = pathname.replace(/\/$/, '');
    const role = sessionStorage.getItem('role_id');
    const workflowState = sessionStorage.getItem('profile_workflow_state');
    const modalTypeFromStorage = sessionStorage.getItem('profile_modal_type');
    const scheduleWindowMarker = getScheduleWindowMarker();
    const scheduleWindowSeen = scheduleWindowMarker
      ? sessionStorage.getItem(SCHEDULE_WINDOW_MODAL_KEY) === scheduleWindowMarker
      : false;


    // 🆕 CRITICAL FIX: If we're on er-profile routes, NEVER show modal
     if (normalizedPathname === '/er-profile' || normalizedPathname === '/preview-profile' || normalizedPathname === '/er-profile/preview-profile2'|| normalizedPathname === '/preview-profile2' || normalizedPathname === '/er-profile/preview-profile' ||normalizedPathname === '/er-profile/spark-preview') {
      
      setShouldShowModal(false);
      setIsOpen(false);
      return;
    }

    // 🆕 If we recently navigated to profile, don't show modal
    if (modalActionRef.current.lastAction === 'NAVIGATING_TO_PROFILE') {
      return;
    }

    if (
      role === '2' &&
      modalTypeFromStorage &&
      workflowState !== 'approved' &&
      !(modalTypeFromStorage === 'schedule_open' && scheduleWindowSeen)
    ) {
      setModalType(modalTypeFromStorage || 'incomplete');
      setShouldShowModal(true);
      setIsOpen(true);
    } else {
      setShouldShowModal(false);
      setIsOpen(false);
    }
  }, [pathname, getScheduleWindowMarker]);

  const handleModalVisibilityChange = useCallback((nextOpen) => {
    if (!nextOpen && modalType === 'schedule_open') {
      const scheduleWindowMarker = getScheduleWindowMarker();
      if (scheduleWindowMarker) {
        sessionStorage.setItem(SCHEDULE_WINDOW_MODAL_KEY, scheduleWindowMarker);
      }
    }
    setIsOpen(nextOpen);
    if (!nextOpen) {
      setShouldShowModal(false);
    }
  }, [getScheduleWindowMarker, modalType]);

  const handleGoToProfile = useCallback(() => {
    
    // 🆕 Clear any existing timeouts and close modal immediately
    setIsOpen(false);
    setShouldShowModal(false);
    if (modalType === 'schedule_open') {
      const scheduleWindowMarker = getScheduleWindowMarker();
      if (scheduleWindowMarker) {
        sessionStorage.setItem(SCHEDULE_WINDOW_MODAL_KEY, scheduleWindowMarker);
      }
    }
    
    modalActionRef.current = {
      lastAction: 'NAVIGATING_TO_PROFILE',
      timestamp: Date.now()
    };
    
     router.push('/er-profile');
  }, [router, modalType, getScheduleWindowMarker]);

  const refreshProfileStatus = useCallback(async () => {
    hasFetchedStatus.current = false;
    await fetchProfileStatus(true);
    checkAndShowModal();
  }, [fetchProfileStatus, checkAndShowModal]);

  // Initial setup
  useEffect(() => {
    
    const initializeProfileCheck = async () => {
      if (!hasFetchedStatus.current && !isFetching.current) {
        await fetchProfileStatus(true);
      }
      checkAndShowModal();
    };

    initializeProfileCheck();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchProfileStatus, checkAndShowModal]);

  // Navigation effect
  useEffect(() => {
    const normalizedPathname = pathname.replace(/\/$/, '');

    //  Reset navigation flag after successful navigation
    if (modalActionRef.current.lastAction === 'NAVIGATING_TO_PROFILE' && (normalizedPathname === '/er-profile' || normalizedPathname === '/preview-profile' || normalizedPathname === '/er-profile/preview-profile')) {
      modalActionRef.current.lastAction = 'NAVIGATION_COMPLETE';
    }

    //  Use timeout to ensure we check after React state updates
    const timer = setTimeout(async () => {
      await fetchProfileStatus(false);
      checkAndShowModal();
    }, 50);

    lastPathname.current = pathname;

    return () => {
      clearTimeout(timer);
    };
  }, [pathname, fetchProfileStatus, checkAndShowModal]);

   // 🆕 Reset navigation flag after 2 seconds (safety net)
  useEffect(() => {
    if (modalActionRef.current.lastAction === 'NAVIGATING_TO_PROFILE') {
      const safetyTimer = setTimeout(() => {
        modalActionRef.current.lastAction = 'NAVIGATION_COMPLETE';
      }, 2000);

      return () => clearTimeout(safetyTimer);
    }
  }, [modalActionRef.current.lastAction]);

  // Listen for custom events to trigger refresh (called from other components)
  useEffect(() => {
    const handleRefreshEvent = () => {
      refreshProfileStatus();
    };

    // Listen for custom event
    window.addEventListener('refreshProfileStatus', handleRefreshEvent);
    
    return () => {
      window.removeEventListener('refreshProfileStatus', handleRefreshEvent);
    };
  }, [refreshProfileStatus]);

  // Expose refresh function for other components (optional)
  useEffect(() => {
    window.refreshProfileStatus = refreshProfileStatus;
    return () => {
      delete window.refreshProfileStatus;
    };
  }, [refreshProfileStatus]);

 if (isLoading) {
    return null;
  }


  return (
    <ProfileCompletionModal 
      isOpen={isOpen && shouldShowModal} 
      setIsOpen={handleModalVisibilityChange} 
      onNavigate={handleGoToProfile}
      modalType={modalType}
      canClose={modalType === 'schedule_open'}
    />
  );
}
