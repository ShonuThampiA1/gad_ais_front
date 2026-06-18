// contexts/ProfileStatusContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import {
  deriveErProfileWorkflowState,
  getErProfileStatusPresentation,
  readStoredErProfileWorkflowContext,
  storeErProfileWorkflowContext,
} from '@/utils/erProfileWorkflow';

const ProfileStatusContext = createContext();

export const ProfileStatusProvider = ({ children }) => {
  const [workflowContext, setWorkflowContext] = useState(null);
  const [profileStatus, setProfileStatus] = useState('incomplete');

  useEffect(() => {
    const storedContext = readStoredErProfileWorkflowContext();
    setWorkflowContext(storedContext);
    setProfileStatus(deriveErProfileWorkflowState(storedContext));
  }, []);

  const updateProfileStatus = (contextOrStatus) => {
    if (typeof contextOrStatus === 'string') {
      setProfileStatus(contextOrStatus);
      return;
    }

    setWorkflowContext(contextOrStatus || null);
    storeErProfileWorkflowContext(contextOrStatus || null);
    setProfileStatus(deriveErProfileWorkflowState(contextOrStatus));
  };

  const statusPresentation = getErProfileStatusPresentation(workflowContext);

  return (
    <ProfileStatusContext.Provider
      value={{ profileStatus, workflowContext, statusPresentation, updateProfileStatus }}
    >
      {children}
    </ProfileStatusContext.Provider>
  );
};

export const useProfileStatus = () => {
  const context = useContext(ProfileStatusContext);
  if (!context) {
    throw new Error('useProfileStatus must be used within a ProfileStatusProvider');
  }
  return context;
};
