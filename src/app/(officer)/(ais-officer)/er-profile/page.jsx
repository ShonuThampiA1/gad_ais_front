'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Breadcrumb } from '@/app/components/breadcrumb';
import { ProfileSection } from '@/app/components/AISDashboardComponents/ProfileSection';
import { CompactProfileSection } from '@/app/components/AISDashboardComponents/CompactProfileSection';
import { Accordion } from '@/app/components/accordion';
import { ProfileCompletionProvider, useProfileCompletion } from '@/contexts/Profile-completion-context';
import { ProfileAccordion } from './profile-accordion';
import ConfirmModal from "@/app/components/confirmModal";
import axiosInstance from '@/utils/apiClient';
import { toast } from 'react-toastify';
import { XMarkIcon, QuestionMarkCircleIcon, AcademicCapIcon, ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { buildMappedServiceDetails } from './service-details-utils';
import { fetchBulkMasters, mapBulkMasters } from '@/utils/masters';

const getServiceDuplicateKey = (service) => {
  const additionalChargeValue = service?.is_additional_charge ?? service?.additional_charge;
  const isAdditionalCharge =
    additionalChargeValue === true ||
    additionalChargeValue === 'true' ||
    additionalChargeValue === 'True' ||
    additionalChargeValue === 'YES' ||
    additionalChargeValue === 'Yes' ||
    additionalChargeValue === 'yes';

  if (isAdditionalCharge) return '';

  const start = service?.start_date ? String(service.start_date).split('T')[0] : '';
  const end = service?.end_date ? String(service.end_date).split('T')[0] : 'ongoing';
  if (!start) return '';

  return `${start}__${end}`;
};

const hasDuplicateServiceEntries = (services = []) => {
  const counts = new Map();

  services.forEach((service) => {
    const key = getServiceDuplicateKey(service);
    if (!key) return;
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  return Array.from(counts.values()).some((count) => count > 1);
};

const ER_PROFILE_MASTER_KEYS = [
  'administrative_department',
  'agency',
  'blood_group',
  'cadre',
  'category',
  'country',
  'deputation_type',
  'designation',
  'disability',
  'district',
  'gender',
  'grade',
  'institution',
  'language',
  'level',
  'ministry',
  'occupation_category',
  'posting_type',
  'qualification',
  'recruitment',
  'relation',
  'retirement',
  'state',
  'tenure',
  'training_type',
];

const buildERProfileMasters = (payload) => ({
  personal: mapBulkMasters(payload, {
    recruitment: 'recruitment',
    cadre: 'cadre',
    gender: 'gender',
    state: 'state',
    tenure: 'tenure',
    district: 'district',
    motherTongue: 'language',
    languageKnown: 'language',
    retirement: 'retirement',
    designation: 'designation',
    category: 'category',
    bloodGroup: 'blood_group',
  }),
  dependent: mapBulkMasters(payload, {
    gender: 'gender',
    relationship: 'relation',
    occupationCategory: 'occupation_category',
    institution: 'institution',
  }),
  service: mapBulkMasters(payload, {
    departments: 'administrative_department',
    designations: 'designation',
    districts: 'district',
    states: 'state',
    levels: 'level',
    ministries: 'ministry',
    grades: 'grade',
    postingTypes: 'posting_type',
    implementingAgencies: 'agency',
  }),
  centralDeputation: mapBulkMasters(payload, {
    state: 'state',
    tenures: 'tenure',
    ministry: 'ministry',
    administrative_department: 'administrative_department',
    agency: 'agency',
    deputation_type: 'deputation_type',
  }),
  training: mapBulkMasters(payload, {
    training_types: 'training_type',
    countries: 'country',
  }),
  education: {
    qualification: payload?.qualification || [],
  },
  disability: payload?.disability || [],
});

// Create a mapping between section titles and indices
const SECTION_MAPPING = {
  'Officer Details': 0,
  'Educational Qualifications': 1,
  'Service Details': 2,
  'Deputation Details': 3,
  'Training Details': 4,
  'Awards and Publications': 5,
  'Disability Details': 6,
  'Disciplinary Details': 7,
};

// Define all required sections for progress tracking
const ALL_REQUIRED_SECTIONS = [
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

// Backward-compatibility guard for older cached bundles during hot reload.
// (Some environments may still reference this symbol from previous iterations.)
const HELP_PANEL_STORAGE_KEY = 'er_profile_help_panel_dismissed';

const FLOW_STEPS = [
  { title: 'Open Spark Profile', description: 'Review synced SPARK data and identify mandatory fields.' },
  { title: 'Prepare and edit', description: 'Collect missing details, then start from Officer Details and update each section.' },
  { title: 'Save each entry', description: 'Every form/card must be saved before progress is counted.' },
  { title: 'Preview and submit', description: 'Open Profile Preview and submit through OTP e-sign for AS-II approval.' },
];

const GUIDED_MODE_STORAGE_KEY = 'er_profile_guided_mode';

const GUIDED_SECTION_ORDER = [
  'Officer Details',
  'Educational Qualifications',
  'Service Details',
  'Deputation Details',
  'Training Details',
  'Awards and Publications',
  'Disability Details',
];

const formatSparkFetchedTime = (rawTimestamp) => {
  if (!rawTimestamp) return null;
  const raw = String(rawTimestamp).trim();
  if (!raw) return null;

  // Handles backend format like: 2026-02-24T09:07:19.632912
  const parts = raw.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2}):(\d{2})/);
  if (parts) {
    const [, year, month, day, hour, minute, second] = parts;
    const localDate = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    );
    if (!Number.isNaN(localDate.getTime())) {
      return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).format(localDate);
    }
  }

  // Fallback for other valid date strings
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(parsed);
  }

  return raw;
};

function ProfileContent() {
  const [openIndices, setOpenIndices] = useState(new Set([0]));
  const [profileData, setProfileData] = useState(null);
  const [sharedMasterData, setSharedMasterData] = useState(null);
  const [sharedMastersReady, setSharedMastersReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  const [showInitLoader, setShowInitLoader] = useState(false);
  const [activeSection, setActiveSection] = useState('Officer Details');
  const [isInitializing, setIsInitializing] = useState(false);
  const [isAllCollapsed, setIsAllCollapsed] = useState(false);
  const [layoutTransition, setLayoutTransition] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [showHelpPanel, setShowHelpPanel] = useState(false);
  const [showHelpBadge, setShowHelpBadge] = useState(false);
  const [guidedModeEnabled, setGuidedModeEnabled] = useState(false);
  const [isRefreshingSpark, setIsRefreshingSpark] = useState(false);
  const [isSparkRefreshConfirmOpen, setIsSparkRefreshConfirmOpen] = useState(false);
  const [manualButtonHighlight, setManualButtonHighlight] = useState({
    help: false,
    guided: false,
    spark: false,
    profile: false,
  });
  const [helpSectionFocus, setHelpSectionFocus] = useState(null);
  const [isCoachDetailsExpanded, setIsCoachDetailsExpanded] = useState(false);
  const [skippedZeroInfoSections, setSkippedZeroInfoSections] = useState(new Set());
  const [coachPosition, setCoachPosition] = useState(null);
  const [isDraggingCoach, setIsDraggingCoach] = useState(false);
  const coachPanelRef = useRef(null);
  const highlightTimeoutRef = useRef({});
  const helpSectionTimeoutRef = useRef(null);
  const sparkHelpSectionRef = useRef(null);
  const profileHelpSectionRef = useRef(null);
  const guidedHelpSectionRef = useRef(null);
  const coachDragStateRef = useRef({ pointerOffsetX: 0, pointerOffsetY: 0 });
  const sectionRefs = useRef([]);
  const contentContainerRef = useRef(null);
  const sharedMastersPromiseRef = useRef(null);
  const hasLoadedProfileRef = useRef(false);
  const {
    sectionProgress,
    markInitialLoadComplete,
    initialLoadComplete,
    hydrateSectionProgress,
    removeSectionProgress,
  } = useProfileCompletion();

  const duplicateSections = useMemo(() => {
    const flaggedSections = new Set();
    const dbServices = profileData?.officer_data?.get_all_officer_info_by_user_id?.service_history || [];
    const sparkServices = profileData?.spark_data?.data?.service_details || [];
    const serviceMasters = sharedMasterData?.service;

    if (!serviceMasters) {
      if (hasDuplicateServiceEntries(dbServices)) {
        flaggedSections.add('Service Details');
      }
      return flaggedSections;
    }

    const { details: mappedServices } = buildMappedServiceDetails({
      serviceDetails: sparkServices,
      dbServices,
      designations: serviceMasters.designations || [],
      departments: serviceMasters.departments || [],
      districts: serviceMasters.districts || [],
      states: serviceMasters.states || [],
    });

    if (hasDuplicateServiceEntries(mappedServices)) {
      flaggedSections.add('Service Details');
    }

    return flaggedSections;
  }, [profileData, sharedMasterData]);

  const loadERProfileMasters = useCallback(async () => {
    if (sharedMasterData) {
      return sharedMasterData;
    }

    if (sharedMastersPromiseRef.current) {
      return sharedMastersPromiseRef.current;
    }

    const mastersPromise = fetchBulkMasters(ER_PROFILE_MASTER_KEYS)
      .then((payload) => {
        const mappedMasters = buildERProfileMasters(payload);
        setSharedMasterData(mappedMasters);
        return mappedMasters;
      })
      .finally(() => {
        setSharedMastersReady(true);
        sharedMastersPromiseRef.current = null;
      });

    sharedMastersPromiseRef.current = mastersPromise;
    return mastersPromise;
  }, [sharedMasterData]);

  const getAccurateServiceProgress = useCallback(async (responseData, mastersOverride = null) => {
    const officerRoot = responseData?.officer_data?.get_all_officer_info_by_user_id || {};
    const dbServices = Array.isArray(officerRoot?.service_history) ? officerRoot.service_history : [];
    const sparkServices = Array.isArray(responseData?.spark_data?.data?.service_details)
      ? responseData.spark_data.data.service_details
      : [];

    if (dbServices.length === 0 && sparkServices.length === 0) {
      return { completed: 0, total: 0 };
    }
    let designations = mastersOverride?.service?.designations || [];
    let departments = mastersOverride?.service?.departments || [];
    let districts = mastersOverride?.service?.districts || [];
    let states = mastersOverride?.service?.states || [];

    try {
      if (!designations.length || !departments.length || !districts.length || !states.length) {
        const sharedMasters = await loadERProfileMasters();
        designations = sharedMasters?.service?.designations || [];
        departments = sharedMasters?.service?.departments || [];
        districts = sharedMasters?.service?.districts || [];
        states = sharedMasters?.service?.states || [];
      }
    } catch (error) {
      console.warn('Failed to load service masters for accurate progress count.', error);
    }

    const { details } = buildMappedServiceDetails({
      serviceDetails: sparkServices,
      dbServices,
      designations,
      departments,
      districts,
      states,
    });

    return {
      completed: details.filter((item) => item?.isSaved).length,
      total: details.length,
    };
  }, [loadERProfileMasters]);

  const deriveInitialSectionProgress = useCallback((responseData) => {
    const officerRoot = responseData?.officer_data?.get_all_officer_info_by_user_id || {};
    const officerInfo = officerRoot?.officer_info?.[0] || {};
    const sparkData = responseData?.spark_data?.data || {};
    const fields = officerInfo?.fields || {};

    const getOfficerFieldValue = (fieldName) => {
      const directValue = officerInfo?.[fieldName];
      if (directValue !== undefined && directValue !== null && String(directValue).trim() !== '') {
        return directValue;
      }

      const sourceOrder = ['GAD_OFFICER', 'AIS_OFFICER', 'DB_SPARK_API', 'UNKNOWN'];
      for (const sourceKey of sourceOrder) {
        const value = fields?.[sourceKey]?.[fieldName];
        if (value !== undefined && value !== null && String(value).trim() !== '') {
          return value;
        }
      }

      return '';
    };

    const getSavedCounts = (dbItems = [], sparkItems = []) => {
      const dbCount = Array.isArray(dbItems) ? dbItems.length : 0;
      const sparkCount = Array.isArray(sparkItems) ? sparkItems.length : 0;

      return {
        completed: dbCount,
        total: Math.max(dbCount, sparkCount),
      };
    };

    const mandatoryPersonalFields = [
      'honorifics', 'first_name', 'last_name', 'ais_number', 'email', 'allotment_year', 'date_of_joining',
      'pen_number', 'source_of_recruitment_id', 'cadre_id', 'dob', 'gender_id',
      'blood_group_id', 'mother_tongue_id', 'service_type_id', 'mobile_no',
      'address_line1_com', 'district_id_com', 'state_id_com', 'pin_code_com',
      'address_line1_per', 'district_id_per', 'state_id_per', 'pin_code_per',
    ];

    const completedPersonal = mandatoryPersonalFields.filter((fieldName) => {
      const value = getOfficerFieldValue(fieldName);
      return value !== undefined && value !== null && String(value).trim() !== '' && value !== 'N/A';
    }).length;

    const profileImageValue =
      getOfficerFieldValue('profile_image') ||
      officerInfo?.profile_image ||
      '';

    return {
      personal: {
        completed: completedPersonal,
        total: mandatoryPersonalFields.length,
      },
      dependent: {
        completed: 0,
        total: 0,
      },
      profile_photo: {
        completed: profileImageValue ? 1 : 0,
        total: 1,
      },
      education: getSavedCounts(officerRoot?.edu_qualification || [], sparkData?.education_details || []),
      service: getSavedCounts(officerRoot?.service_history || [], sparkData?.service_details || []),
      central_deputation: getSavedCounts(officerRoot?.central_deputation || [], sparkData?.deputation_details || []),
      training: getSavedCounts(officerRoot?.training_info || [], sparkData?.trainingList || []),
      awards: getSavedCounts(officerRoot?.rewards || [], sparkData?.awards || []),
      disability: getSavedCounts(officerRoot?.officer_disability || [], sparkData?.disability || []),
      disciplinary: getSavedCounts(officerRoot?.suspension_info || [], sparkData?.suspension_details || []),
    };
  }, []);

  // Initialize refs for each section
  useEffect(() => {
    sectionRefs.current = sectionRefs.current.slice(0, 8);
  }, []);

  useEffect(() => {
    if (!initialLoadComplete) {
      removeSectionProgress('service');
    }
  }, [initialLoadComplete, removeSectionProgress]);

  // Handle modal state from CompactProfileSection
  useEffect(() => {
    const handleModalStateChange = (event) => {
      if (event.detail && typeof event.detail.isOpen !== 'undefined') {
        setModalOpen(event.detail.isOpen);
      }
    };

    window.addEventListener('modal-state-change', handleModalStateChange);
    
    return () => {
      window.removeEventListener('modal-state-change', handleModalStateChange);
    };
  }, []);

  // Check if all sections are closed
  useEffect(() => {
    const allClosed = openIndices.size === 0;
    setIsAllCollapsed(allClosed);
    
    // Add transition class when state changes
    if (allClosed || openIndices.size > 0) {
      setLayoutTransition(true);
      const timer = setTimeout(() => {
        setLayoutTransition(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [openIndices]);

  // Handle section selection from left sidebar
  const handleSectionSelect = (sectionTitle) => {
    setActiveSection(sectionTitle);
    
    // Get the index from mapping
    const sectionIndex = SECTION_MAPPING[sectionTitle];
    if (sectionIndex === undefined) return;
    
    // Open the accordion section
    setOpenIndices(new Set([sectionIndex]));
    
    // Scroll to the section after a small delay to allow DOM update
    setTimeout(() => {
      if (sectionRefs.current[sectionIndex]) {
        sectionRefs.current[sectionIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }, 100);
  };

  // Toggle accordion (with scroll support)
  const toggleAccordion = (index) => {
    setOpenIndices((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
    
    // Update active section
    const sectionTitle = Object.keys(SECTION_MAPPING).find(
      key => SECTION_MAPPING[key] === index
    );
    if (sectionTitle) {
      setActiveSection(sectionTitle);
      
      // Scroll to section when opening
      if (!openIndices.has(index)) {
        setTimeout(() => {
          if (sectionRefs.current[index]) {
            sectionRefs.current[index].scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          }
        }, 100);
      }
    }
  };

  // Check if all sections have loaded their data
  const checkAllSectionsLoaded = () => {
    return ALL_REQUIRED_SECTIONS.every(section => {
      const progress = sectionProgress[section];
      return progress && typeof progress.completed === 'number' && typeof progress.total === 'number';
    });
  };

  // Initialize all sections temporarily for progress calculation
  useEffect(() => {
    if (profileData && !initialLoadComplete && !isInitializing) {
      setIsInitializing(true);
      setShowInitLoader(true);
      
      // Open ALL sections temporarily
      const allIndices = new Set([0, 1, 2, 3, 4, 5, 6, 7]);
      setOpenIndices(allIndices);
    }
  }, [profileData, initialLoadComplete, isInitializing]);

  // Monitor when all sections have loaded
  useEffect(() => {
    if (isInitializing) {
      
      const allSectionsLoaded = checkAllSectionsLoaded();
      
      if (allSectionsLoaded) {
        
        // Give a small delay for UI to settle and ensure all data is rendered
        const timer = setTimeout(() => {
          // Close all sections and open only the first one
          setOpenIndices(new Set([0]));
          setActiveSection('Officer Details');
          
          // Hide loader after animation completes
          setTimeout(() => {
            setShowInitLoader(false);
            markInitialLoadComplete();
            setIsInitializing(false);
          }, 120);
        }, 120);
        
        return () => clearTimeout(timer);
      } else {
        const checkTimer = setTimeout(() => {
          if (isInitializing) {
            const loaded = checkAllSectionsLoaded();
            if (!loaded) {
            }
          }
        }, 2000);
        
        return () => clearTimeout(checkTimer);
      }
    }
  }, [isInitializing, sectionProgress, markInitialLoadComplete]);

  // Fallback timeout in case sections don't load properly
  useEffect(() => {
    if (isInitializing) {
      const fallbackTimer = setTimeout(() => {
        setOpenIndices(new Set([0]));
        setActiveSection('Officer Details');
        setShowInitLoader(false);
        markInitialLoadComplete();
        setIsInitializing(false);
      }, 4000);
      
      return () => clearTimeout(fallbackTimer);
    }
  }, [isInitializing, markInitialLoadComplete]);

  useEffect(() => {
    if (!loading && !isInitializing && openIndices.size === 0) {
      setOpenIndices(new Set([0]));
      setActiveSection('Officer Details');
    }
  }, [loading, isInitializing, openIndices]);

  const fetchProfileData = useCallback(async ({ forceRefresh = false, useCachedData = true } = {}) => {
    try {
      const sharedMasters = await loadERProfileMasters().catch((error) => {
        console.warn('Failed to load shared ER-profile masters.', error);
        return null;
      });

      if (useCachedData) {
        const cachedData = sessionStorage.getItem('profileData');
        if (cachedData) {
          const parsedCachedData = JSON.parse(cachedData);
          const initialProgress = deriveInitialSectionProgress(parsedCachedData);
          initialProgress.service = await getAccurateServiceProgress(parsedCachedData, sharedMasters);
          hydrateSectionProgress(initialProgress, {
            markComplete: false,
            markLoaded: false,
          });
          setProfileData(parsedCachedData);
          setInfoMessage('Using cached profile data');
        }
      }

      const response = await axiosInstance.get('/officer/officer', {
        params: forceRefresh ? { force_refresh: true } : undefined,
      });
      const responseData = response.data.data;
      const initialProgress = deriveInitialSectionProgress(responseData);
      initialProgress.service = await getAccurateServiceProgress(responseData, sharedMasters);
      hydrateSectionProgress(initialProgress, {
        markComplete: false,
        markLoaded: false,
      });
      setProfileData(responseData);
      sessionStorage.setItem('profileData', JSON.stringify(responseData));

      // SPARK check
      const spark = responseData?.spark_data?.data?.personal_details;

      // Officer info array
      const officerInfo = responseData?.officer_data?.get_all_officer_info_by_user_id?.officer_info?.[0];
      const fields = officerInfo?.fields;

      // AIS & GAD
      const ais = fields?.AIS_OFFICER;
      const gad = fields?.GAD_OFFICER;

      const sparkDOJ = spark?.date_of_joining || null;
      const sparkRetirement = spark?.retirement_date || null;

      // STEP 2 -> From AIS
      const aisDOJ = ais?.date_of_joining || null;

      // STEP 3 -> From GAD
      const gadRetirement = gad?.retirement_date || null;

      // FINAL VALUES
      const finalDOJ = sparkDOJ ?? aisDOJ ?? null;
      const finalRetirement = sparkRetirement ?? gadRetirement ?? null;

      // STORE
      sessionStorage.setItem('date_of_joining', finalDOJ);
      sessionStorage.setItem('retirement_date', finalRetirement);


      if (response.data.success) {
        setInfoMessage(response.data.message);
        setError(null);
        return {
          success: true,
          message: response.data.message || 'SPARK data refreshed successfully.',
        };
      } else {
        const failureMessage = response.data.detail || 'Failed to fetch profile data';
        setError(failureMessage);
        return {
          success: false,
          message: failureMessage,
        };
      }
    } catch (err) {
      const status = err.response?.status;
      const responseData = err.response?.data?.data;
      setProfileData(responseData);
      sessionStorage.setItem('profileData', JSON.stringify(responseData));

      let errorMessage = 'Failed to fetch profile data. Please try again later.';
      if (status === 404) {
        errorMessage = 'Profile not found. Please verify your account details.';
      } else if (status === 400) {
        errorMessage = err.response?.data?.detail || 'Invalid profile data provided.';
      } else if (status === 502 || status === 503) {
        errorMessage = err.response?.data?.detail || 'Profile service is temporarily unavailable. Please try again later.';
      }

      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      if (!forceRefresh) {
        setLoading(false);
      }
    }
  }, [deriveInitialSectionProgress, getAccurateServiceProgress, hydrateSectionProgress, loadERProfileMasters]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const syncProfileDataFromCache = () => {
      const cachedData = sessionStorage.getItem('profileData');
      if (!cachedData) return;

      try {
        setProfileData(JSON.parse(cachedData));
      } catch {
        // Ignore malformed cache and preserve current state.
      }
    };

    window.addEventListener('er-profile-data-updated', syncProfileDataFromCache);
    return () => {
      window.removeEventListener('er-profile-data-updated', syncProfileDataFromCache);
    };
  }, []);

  const refreshSparkNow = useCallback(async () => {
    if (isRefreshingSpark) {
      return;
    }

    setIsRefreshingSpark(true);
    const refreshResult = await fetchProfileData({ forceRefresh: true, useCachedData: false });
    if (refreshResult?.success) {
      toast.success(refreshResult.message || 'SPARK data refreshed successfully.');
    } else {
      toast.error(refreshResult?.message || 'Failed to refresh data from SPARK.');
    }
    setIsRefreshingSpark(false);
  }, [fetchProfileData, isRefreshingSpark]);

  const handleRefreshFromSpark = useCallback(() => {
    if (isRefreshingSpark) {
      return;
    }
    setIsSparkRefreshConfirmOpen(true);
  }, [isRefreshingSpark]);

  useEffect(() => {
    const hideHelpBadge = localStorage.getItem(HELP_PANEL_STORAGE_KEY);
    if (hideHelpBadge !== 'true') {
      setShowHelpBadge(true);
    }

    const storedGuidedMode = localStorage.getItem(GUIDED_MODE_STORAGE_KEY);
    if (storedGuidedMode === 'true') {
      setGuidedModeEnabled(true);
    }
  }, []);

  useEffect(() => {
    if (hasLoadedProfileRef.current) {
      return;
    }

    hasLoadedProfileRef.current = true;
    fetchProfileData();
  }, [fetchProfileData]);

  const refreshProfileCardData = useCallback(async () => {
    await fetchProfileData({ forceRefresh: false, useCachedData: false });
  }, [fetchProfileData]);

  const getCurrentGuidedIndex = () => {
    const index = GUIDED_SECTION_ORDER.indexOf(activeSection);
    return index === -1 ? 0 : index;
  };

  const currentGuidedIndex = getCurrentGuidedIndex();
  const currentStep = currentGuidedIndex + 1;
  const totalGuidedSteps = GUIDED_SECTION_ORDER.length;
  const previousGuidedSection = currentGuidedIndex > 0 ? GUIDED_SECTION_ORDER[currentGuidedIndex - 1] : null;
  const nextGuidedSection = currentGuidedIndex < totalGuidedSteps - 1 ? GUIDED_SECTION_ORDER[currentGuidedIndex + 1] : null;

  const orderedSections = [
    { title: 'Officer Details', key: 'personal' },
    { title: 'Educational Qualifications', key: 'education' },
    { title: 'Service Details', key: 'service' },
    { title: 'Deputation Details', key: 'central_deputation' },
    { title: 'Training Details', key: 'training' },
    { title: 'Awards and Publications', key: 'awards' },
    { title: 'Disability Details', key: 'disability' },
  ];

  const dependentProgress = sectionProgress.dependent || { completed: 0, total: 0 };
  const hasUnsavedDependentDetails = dependentProgress.total > 0 && dependentProgress.completed < dependentProgress.total;

  const getOfficerDetailsProgress = () => {
    const personalProgress = sectionProgress.personal || { completed: 0, total: 0 };
    return {
      ...personalProgress,
      blockedByDependents: hasUnsavedDependentDetails,
    };
  };

  const getProgressBySectionTitle = (sectionTitle) => {
    if (sectionTitle === 'Officer Details') {
      return getOfficerDetailsProgress();
    }

    const sectionMeta = orderedSections.find((section) => section.title === sectionTitle);
    if (!sectionMeta) return { completed: 0, total: 0 };
    return sectionProgress[sectionMeta.key] || { completed: 0, total: 0 };
  };

  const isZeroInfoSection = (sectionTitle) => {
    const progress = getProgressBySectionTitle(sectionTitle);
    return progress.completed === 0 && progress.total === 0;
  };

  const getNextPendingSection = (skippedSections = skippedZeroInfoSections) => {
    return orderedSections.find(({ title, key }) => {
      const progress = title === 'Officer Details'
        ? getOfficerDetailsProgress()
        : (sectionProgress[key] || { completed: 0, total: 0 });
      const isIncomplete = progress.total > 0 && progress.completed < progress.total;
      const isZeroInfo = progress.completed === 0 && progress.total === 0;
      const isBlocked = title === 'Officer Details' && progress.blockedByDependents;

      if (isZeroInfo && skippedSections.has(title)) {
        return false;
      }

      return isBlocked || isIncomplete || isZeroInfo;
    });
  };

  const pendingSection = getNextPendingSection();
  const formattedSparkFetchedTime = formatSparkFetchedTime(profileData?.spark_inserted_at);
  const activeSectionIsZeroInfo = isZeroInfoSection(activeSection);
  const activeSectionProgress = getProgressBySectionTitle(activeSection);
  const isActiveSectionCompleted = activeSectionProgress.total > 0 &&
    activeSectionProgress.completed === activeSectionProgress.total &&
    !activeSectionProgress.blockedByDependents;
  const isActivePendingSection = pendingSection?.title === activeSection;
  const shouldShowPendingUnsavedTip = isActivePendingSection && !activeSectionIsZeroInfo && !isActiveSectionCompleted;
  const officerDetailsProgress = getOfficerDetailsProgress();
  const isOfficerDetailsCompleted = officerDetailsProgress.total > 0 &&
    officerDetailsProgress.completed === officerDetailsProgress.total &&
    !officerDetailsProgress.blockedByDependents;
  const shouldHighlightSparkButton = guidedModeEnabled && !isOfficerDetailsCompleted;
  const shouldHighlightProfileButton = guidedModeEnabled && !pendingSection;
  const shouldPulseHelpButton = !showHelpPanel || manualButtonHighlight.help;
  const shouldPulseGuidedButton = !guidedModeEnabled || manualButtonHighlight.guided;
  const effectiveHighlightSparkButton = shouldHighlightSparkButton || manualButtonHighlight.spark;
  const effectiveHighlightProfileButton = shouldHighlightProfileButton || manualButtonHighlight.profile;
  const zeroInfoTipBySection = {
    'Officer Details': 'This section has 0/0 right now. Open Personal Information and Dependent Details, add required details, then save to reflect progress.',
    'Educational Qualifications': 'This section has 0/0 right now. Click Add, enter qualification details with mandatory fields, and save each card.',
    'Service Details': 'This section has 0/0 right now. Click Add, fill mandatory service fields, and save the card to start progress.',
    'Deputation Details': 'This section has 0/0 right now. Click Add Deputation, complete mandatory fields, and save to reflect progress.',
    'Training Details': 'This section has 0/0 right now. Click Add, provide mandatory training details, and save each card.',
    'Awards and Publications': 'This section has 0/0 right now. Add at least one award/publication entry, complete mandatory fields, and save.',
    'Disability Details': 'This section has 0/0 right now. Add disability details only if applicable, complete required fields, and save.',
  };
  const activeZeroInfoTip = zeroInfoTipBySection[activeSection] || 'This section has 0/0 right now. Add at least one record, complete mandatory fields, and save.';

  const coachPrimaryMessage = shouldHighlightSparkButton
    ? 'Start with Spark Profile and review the preview data before editing.'
    : shouldHighlightProfileButton
      ? 'Profile completion is 100%. Next step: open Profile Preview, verify details, and submit with OTP e-sign for AS-II approval.'
      : activeSectionIsZeroInfo
        ? `You are on ${activeSection}. This section currently has no records (0/0). Use Add to create entries and enrich your profile, or use Skip to continue.`
        : isActiveSectionCompleted
          ? `You are on ${activeSection}. This section is complete. You can still add more details if needed.`
          : `You are on ${activeSection}. Complete the required edits and save this section to continue.`;

  const coachProgressMessage = shouldHighlightSparkButton
    ? 'After Spark review, continue from Officer Details and save each section after editing.'
    : shouldHighlightProfileButton
      ? 'Next action: Open Profile Preview and submit your profile.'
      : pendingSection && pendingSection.title !== activeSection
        ? `Next pending section: ${pendingSection.title}.`
        : pendingSection?.title === activeSection
          ? 'You are currently on the next pending section.'
          : 'All tracked sections are complete. Please open Profile Preview and submit.';

  const getGuidedStartSection = () => {
    if (!isOfficerDetailsCompleted) {
      return 'Officer Details';
    }

    return pendingSection?.title || activeSection || 'Officer Details';
  };

  const guidedGhostButtonClass = 'inline-flex h-8 shrink-0 items-center justify-center rounded-md border px-2.5 py-1 text-xs font-semibold shadow-sm transition-colors';
  const guidedSolidButtonClass = 'inline-flex h-9 w-full items-center justify-center rounded-md border px-3 py-2 text-xs font-semibold shadow-sm transition-colors sm:h-8 sm:w-auto sm:py-1.5';

  const clampCoachPositionToViewport = useCallback(() => {
    const panelWidth = coachPanelRef.current?.offsetWidth ?? 320;
    const panelHeight = coachPanelRef.current?.offsetHeight ?? 280;
    const maxX = Math.max(8, window.innerWidth - panelWidth - 8);
    const maxY = Math.max(8, window.innerHeight - panelHeight - 8);

    setCoachPosition((prev) => {
      if (!prev) {
        return prev;
      }

      const nextX = Math.min(Math.max(8, prev.x), maxX);
      const nextY = Math.min(Math.max(8, prev.y), maxY);

      if (nextX === prev.x && nextY === prev.y) {
        return prev;
      }

      return {
        x: nextX,
        y: nextY,
      };
    });
  }, []);

  const handleSkipZeroInfoSection = () => {
    if (!activeSectionIsZeroInfo) return;

    const updatedSkippedSections = new Set(skippedZeroInfoSections);
    updatedSkippedSections.add(activeSection);
    setSkippedZeroInfoSections(updatedSkippedSections);

    const nextSection = getNextPendingSection(updatedSkippedSections);
    if (nextSection?.title) {
      handleGoToGuidedSection(nextSection.title);
      return;
    }

    if (nextGuidedSection) {
      handleGoToGuidedSection(nextGuidedSection);
    }
  };

  const handleOpenHelp = () => {
    localStorage.setItem(HELP_PANEL_STORAGE_KEY, 'true');
    setShowHelpBadge(false);
    setManualButtonHighlight((prev) => ({ ...prev, help: false }));
    setShowHelpPanel(true);
  };

  const triggerButtonHighlight = useCallback((target, duration = 3200) => {
    if (!target) return;

    setManualButtonHighlight((prev) => ({ ...prev, [target]: true }));

    if (highlightTimeoutRef.current[target]) {
      clearTimeout(highlightTimeoutRef.current[target]);
    }

    highlightTimeoutRef.current[target] = setTimeout(() => {
      setManualButtonHighlight((prev) => ({ ...prev, [target]: false }));
      highlightTimeoutRef.current[target] = null;
    }, duration);
  }, []);

  const scrollToHelpSection = useCallback((sectionKey) => {
    const refMap = {
      spark: sparkHelpSectionRef,
      profile: profileHelpSectionRef,
      guided: guidedHelpSectionRef,
    };

    const targetRef = refMap[sectionKey];
    const element = targetRef?.current;
    if (!element) return;

    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setHelpSectionFocus(sectionKey);

    if (helpSectionTimeoutRef.current) {
      clearTimeout(helpSectionTimeoutRef.current);
    }

    helpSectionTimeoutRef.current = setTimeout(() => {
      setHelpSectionFocus(null);
      helpSectionTimeoutRef.current = null;
    }, 2600);
  }, []);

  const focusTopAction = useCallback((target) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setShowHelpPanel(false);
    triggerButtonHighlight(target);
  }, [triggerButtonHighlight]);

  const toggleGuidedMode = () => {
    setGuidedModeEnabled((prev) => {
      const nextValue = !prev;
      localStorage.setItem(GUIDED_MODE_STORAGE_KEY, String(nextValue));
      if (nextValue) {
        setSkippedZeroInfoSections(new Set());
        handleSectionSelect(getGuidedStartSection());
      }
      return nextValue;
    });
  };

  const handleGoToGuidedSection = (sectionTitle) => {
    if (!sectionTitle) return;
    handleSectionSelect(sectionTitle);
  };

  const handleGuidedNextAction = () => {
    if (shouldHighlightProfileButton) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    handleGoToGuidedSection(pendingSection?.title || nextGuidedSection);
  };

  useEffect(() => {
    if (!guidedModeEnabled || coachPosition) {
      return;
    }

    const panelWidth = coachPanelRef.current?.offsetWidth ?? Math.min(window.innerWidth - 16, 448);
    const panelHeight = coachPanelRef.current?.offsetHeight ?? 280;
    const defaultLeft = Math.max(8, window.innerWidth - panelWidth - 16);
    const defaultTop = Math.max(8, window.innerHeight - panelHeight - 16);
    setCoachPosition({ x: defaultLeft, y: defaultTop });
  }, [guidedModeEnabled, coachPosition]);

  useEffect(() => {
    if (!coachPosition) {
      return;
    }

    const handleResize = () => {
      clampCoachPositionToViewport();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [coachPosition, clampCoachPositionToViewport, isCoachDetailsExpanded, activeSection, pendingSection?.title, shouldHighlightSparkButton, shouldHighlightProfileButton, activeSectionIsZeroInfo]);

  useEffect(() => {
    return () => {
      Object.values(highlightTimeoutRef.current).forEach((timerId) => {
        if (timerId) {
          clearTimeout(timerId);
        }
      });

      if (helpSectionTimeoutRef.current) {
        clearTimeout(helpSectionTimeoutRef.current);
      }
    };
  }, []);

  const handleCoachDragStart = (event) => {
    const panelRect = coachPanelRef.current?.getBoundingClientRect();
    if (!panelRect) {
      return;
    }

    const targetElement = event.target instanceof Element ? event.target : null;
    if (targetElement?.closest('button, a, input, textarea, select, [role="button"], [data-coach-no-drag="true"]')) {
      return;
    }

    event.preventDefault();
    coachDragStateRef.current = {
      pointerOffsetX: event.clientX - panelRect.left,
      pointerOffsetY: event.clientY - panelRect.top,
    };
    setIsDraggingCoach(true);
  };

  const handleCoachDragMove = (event) => {
    if (!isDraggingCoach || !coachPanelRef.current) {
      return;
    }

    const panelWidth = coachPanelRef.current.offsetWidth;
    const panelHeight = coachPanelRef.current.offsetHeight;
    const maxX = Math.max(8, window.innerWidth - panelWidth - 8);
    const maxY = Math.max(8, window.innerHeight - panelHeight - 8);
    const nextX = event.clientX - coachDragStateRef.current.pointerOffsetX;
    const nextY = event.clientY - coachDragStateRef.current.pointerOffsetY;

    setCoachPosition({
      x: Math.min(Math.max(8, nextX), maxX),
      y: Math.min(Math.max(8, nextY), maxY),
    });
  };

  const handleCoachDragEnd = () => {
    if (isDraggingCoach) {
      setIsDraggingCoach(false);
    }
  };

  useEffect(() => {
    if (!isDraggingCoach) {
      return;
    }

    window.addEventListener('pointermove', handleCoachDragMove);
    window.addEventListener('pointerup', handleCoachDragEnd);

    return () => {
      window.removeEventListener('pointermove', handleCoachDragMove);
      window.removeEventListener('pointerup', handleCoachDragEnd);
    };
  }, [isDraggingCoach]);

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="flex flex-col items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <div>Fetching Data from spark...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Breadcrumb without rightContent */}
      <Breadcrumb />

      <div className="bg-white rounded-md px-1 py-3 dark:bg-gray-800/50">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          {/* Timestamp on the left */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs text-gray-600 dark:bg-gray-900 dark:text-gray-300">
            <ClockIcon className="h-4 w-4" />
            <span>
              Last fetched from SPARK: <span className='text-amber-600 font-semibold'>{formattedSparkFetchedTime || 'Not available'}</span> 
            </span>
            <button
              type="button"
              onClick={handleRefreshFromSpark}
              disabled={isRefreshingSpark || loading}
              title="Refresh from spark"
              aria-label="Refresh from spark"
              className="inline-flex items-center p-0.5 text-indigo-600 transition-colors hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              <ArrowPathIcon className={`h-4 w-4 stroke-[2.5] ${isRefreshingSpark ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Buttons on the right */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleOpenHelp}
              className={`inline-flex min-h-10 items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 shadow-sm transition-colors hover:bg-red-50 dark:border-red-800 dark:bg-gray-900 dark:text-red-300 dark:hover:bg-red-950/30 ${
                shouldPulseHelpButton ? 'help-attention-button' : ''
              }`}
            >
              <QuestionMarkCircleIcon className="h-4 w-4" />
              Help: How to complete profile?
              {showHelpBadge && (
                <span className="ml-1 inline-flex h-5 items-center rounded-full bg-indigo-600 px-1.5 text-[10px] leading-none text-white">
                  New
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={toggleGuidedMode}
              className={`ml-1 inline-flex min-h-10 items-center gap-2 overflow-hidden rounded-lg border px-3 py-1.5 text-sm font-medium shadow-sm transition-colors ${
                shouldPulseGuidedButton ? 'guided-attention-button' : ''
              } ${
                guidedModeEnabled
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200'
                  : 'border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:bg-gray-900 dark:text-emerald-300 dark:hover:bg-emerald-950/30'
              }`}
            >
              {shouldPulseGuidedButton && (
                <span
                  aria-hidden="true"
                  className="guided-attention-shine pointer-events-none absolute inset-y-0 -left-10 w-8 -skew-x-12 bg-white/60 blur-[1px]"
                />
              )}
              <AcademicCapIcon className="h-4 w-4" />
              {guidedModeEnabled ? 'Guided Mode: On' : 'Start Guided Mode'}
            </button>
          </div>
        </div>
      </div>

      {/* Guided Mode Banner */}
      {guidedModeEnabled && (
        <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 sm:px-4 dark:border-emerald-700 dark:bg-emerald-950/30">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Guided completion</p>
              <p className="text-sm text-emerald-900 dark:text-emerald-100">
                Step {currentStep} of {totalGuidedSteps}: <span className="font-semibold">{activeSection}</span>
              </p>
            </div>
            <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
              <button
                type="button"
                onClick={() => handleGoToGuidedSection(previousGuidedSection)}
                disabled={!previousGuidedSection}
                className={`${guidedGhostButtonClass} border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-600 dark:bg-gray-900 dark:text-emerald-200`}
              >
                Prev
              </button>
              <button
                type="button"
                onClick={handleGuidedNextAction}
                className="rounded-md border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-600 dark:bg-gray-900 dark:text-emerald-200"
              >
                Open Next Pending
              </button>
              <button
                type="button"
                onClick={handleSkipZeroInfoSection}
                disabled={!activeSectionIsZeroInfo}
                className={`${guidedGhostButtonClass} border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-sky-700 dark:bg-sky-950/30 dark:text-sky-200`}
              >
                Skip
              </button>
              <button
                type="button"
                onClick={toggleGuidedMode}
                className={`${guidedSolidButtonClass} border-transparent bg-emerald-600 text-white hover:bg-emerald-700`}
              >
                Exit Guided Mode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Message */}
      {infoMessage && (
        <div className="p-4 text-center">
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg max-w-lg mx-auto">
            <p className="font-bold">Information</p>
            <p>{infoMessage}</p>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {error && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 dark:bg-gray-800 dark:text-gray-100">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Error Loading Profile</h3>
                <p className="mt-2 text-sm text-gray-600">{error}</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                onClick={() => setError(null)}
              >
                Close
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div 
        ref={contentContainerRef}
        className={`profile-layout-container relative isolate z-0 ${layoutTransition ? 'transition-all duration-300 ease-in-out' : ''} ${modalOpen ? 'overflow-hidden' : ''}`}
      >

        {/* When all collapsed - Horizontal compact ProfileSection at top */}
          {isAllCollapsed ? (
          <div className="space-y-3 py-2">
            {/* Compact Horizontal ProfileSection at top */}
            <div className={`w-full transform transition-all duration-300 relative z-10 ${layoutTransition ? 'scale-[0.98] opacity-90' : ''}`}>
              {profileData && (
                <CompactProfileSection
                  profileData={profileData}
                  onRefreshProfileData={refreshProfileCardData}
                  highlightSparkButton={effectiveHighlightSparkButton}
                  highlightProfileButton={effectiveHighlightProfileButton}
                />
              )}
            </div>
            
            {/* Main content area with sidebar and accordions */}
            <div className={`grid grid-cols-1 lg:grid-cols-12 gap-3 mt-4 relative z-0 ${modalOpen ? 'blur-sm pointer-events-none' : ''}`}>
              {/* Sidebar */}
              <div className="lg:col-span-3 relative z-0">
                {profileData && (
                  <Accordion 
                    onSectionSelect={handleSectionSelect}
                    activeSection={activeSection}
                    duplicateSections={duplicateSections}
                  />
                )}
              </div>
              
              {/* ProfileAccordion */}
              <div className="lg:col-span-9 relative z-0">
                {profileData ? (
                  <ProfileAccordion
                    openIndices={openIndices}
                    toggleAccordion={toggleAccordion}
                    profileData={profileData}
                    sharedMasterData={sharedMasterData}
                    sharedMastersReady={sharedMastersReady}
                    sectionRefs={sectionRefs}
                    activeSection={activeSection}
                    guidedModeEnabled={guidedModeEnabled}
                  />
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No profile data available to display sections.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Normal layout - ProfileSection in sidebar */
          <div className={`grid grid-cols-1 lg:grid-cols-12 gap-3 py-2 transition-all duration-300 relative z-0 ${layoutTransition ? 'opacity-90' : ''} ${modalOpen ? 'blur-sm pointer-events-none' : ''}`}>
            {/* Sidebar with ProfileSection */}
            <div className="lg:col-span-3 space-y-3 relative z-0">
              {profileData && (
                <>
                  <ProfileSection
                    compactMode={false}
                    profileData={profileData}
                    onRefreshProfileData={refreshProfileCardData}
                    highlightSparkButton={effectiveHighlightSparkButton}
                    highlightProfileButton={effectiveHighlightProfileButton}
                  />
                  <Accordion 
                    onSectionSelect={handleSectionSelect}
                    activeSection={activeSection}
                    duplicateSections={duplicateSections}
                  />
                </>
              )}
            </div>
            
            {/* ProfileAccordion */}
            <div className="lg:col-span-9 relative z-0">
              {profileData ? (
                <ProfileAccordion
                  openIndices={openIndices}
                  toggleAccordion={toggleAccordion}
                  profileData={profileData}
                  sharedMasterData={sharedMasterData}
                  sharedMastersReady={sharedMastersReady}
                  sectionRefs={sectionRefs}
                  activeSection={activeSection}
                  guidedModeEnabled={guidedModeEnabled}
                />
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No profile data available to display sections.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Blur overlay when modal is open */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-10 z-40 pointer-events-none"></div>
        )}
      </div>


      {showHelpPanel && (
        <div className="fixed inset-0 z-[95] bg-black/40 backdrop-blur-[1px]">
          <div
            className="absolute inset-0 w-full overflow-y-auto border-gray-200 bg-white shadow-2xl sm:inset-y-10 sm:right-0 sm:left-auto sm:max-w-2xl sm:rounded-l-2xl sm:border-l dark:border-gray-700 dark:bg-gray-900"
            role="dialog"
            aria-modal="true"
            aria-label="Profile completion help"
          >
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6 dark:border-slate-700 dark:bg-slate-900/95">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300">
                    <QuestionMarkCircleIcon className="h-3.5 w-3.5" />
                    Completion Guide
                  </div>
                  <h3 className="mt-3 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Profile completion help</h3>
                  <p className="mt-1 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Clear steps for Spark review, section editing, card saves, and final OTP submission.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHelpPanel(false)}
                  className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="space-y-5 p-4 sm:p-6">
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 sm:p-5 text-sm text-rose-900 dark:border-rose-700 dark:bg-rose-950/30 dark:text-rose-200">
                <p className="text-sm font-semibold">SPARK Data Correction Notice</p>
                <p className="mt-1 leading-6">
                  If you notice any errors, validation issues, or duplicate records in the SPARK data displayed in KARMASRI, kindly update the respective details in the SPARK portal first. Once the correction is completed, use the Refresh option in the KARMASRI dashboard to reflect the updated changes in the portal.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-white p-4 dark:border-slate-700 dark:from-indigo-950/20 dark:to-slate-900">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700 dark:text-indigo-300">Start here</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">Review Spark first</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">Use Spark Profile to understand synced data and identify missing mandatory fields.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-white p-4 dark:border-slate-700 dark:from-emerald-950/20 dark:to-slate-900">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">Editing rule</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">Save every card</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">Progress updates only after each form or card is saved successfully.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-4 dark:border-slate-700 dark:from-amber-950/20 dark:to-slate-900">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">Final step</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">Submit from preview</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">Open Profile Preview only after completion, then submit using OTP and e-sign.</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5 dark:border-slate-700 dark:bg-slate-800/60">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">Completion flow</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Follow these four steps in order.</p>
                  </div>
                </div>
                <ol className="mt-4 grid gap-3 sm:grid-cols-2">
                  {FLOW_STEPS.map((step, index) => (
                    <li
                      key={step.title}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div className="flex items-start gap-3">
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{step.title}</p>
                          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{step.description}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">Quick actions</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Jump fast to the most common questions and actions.</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => scrollToHelpSection('spark')}
                    className="rounded-2xl border border-indigo-200 bg-indigo-50/70 px-4 py-3 text-left transition-colors hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/35"
                  >
                    <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">What is Spark Profile?</p>
                    <p className="mt-1 text-sm leading-6 text-indigo-800/80 dark:text-indigo-200/80">Understand synced data before editing.</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToHelpSection('profile')}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                  >
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">What is Profile?</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">Review your saved ER data before submission.</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToHelpSection('guided')}
                    className="rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-left transition-colors hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/35"
                  >
                    <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">What is Guided Mode?</p>
                    <p className="mt-1 text-sm leading-6 text-emerald-800/80 dark:text-emerald-200/80">Follow the next pending action when unsure.</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (pendingSection) {
                        handleSectionSelect(pendingSection.title);
                      }
                      setShowHelpPanel(false);
                    }}
                    className="rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-left transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-800 dark:bg-amber-950/20 dark:hover:bg-amber-950/35"
                    disabled={!pendingSection}
                  >
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">Next step</p>
                    <p className="mt-1 text-sm leading-6 text-amber-800/80 dark:text-amber-200/80">
                      {pendingSection ? `Open ${pendingSection.title}` : 'All trackable sections completed'}
                    </p>
                  </button>
                </div>
              </div>

              <div className="grid gap-4">
                <div
                  ref={sparkHelpSectionRef}
                  className={`rounded-2xl border p-4 sm:p-5 ${helpSectionFocus === 'spark' ? 'help-section-focus border-indigo-300 bg-indigo-50 dark:border-indigo-600 dark:bg-indigo-950/30' : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60'} text-slate-700 dark:text-slate-200`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-slate-900 dark:text-slate-100">Spark Profile</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        Spark Profile shows only SPARK-synced data. Use it to check missing mandatory fields, take print if required, and prepare details before editing.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => focusTopAction('spark')}
                      className="shrink-0 rounded-lg border border-indigo-300 bg-white px-3 py-2 text-xs font-semibold text-indigo-800 hover:bg-indigo-50 dark:border-indigo-700 dark:bg-gray-900 dark:text-indigo-200 dark:hover:bg-indigo-950/30"
                    >
                      Locate Spark Profile
                    </button>
                  </div>
                </div>

                <div
                  ref={profileHelpSectionRef}
                  className={`rounded-2xl border p-4 sm:p-5 ${helpSectionFocus === 'profile' ? 'help-section-focus border-indigo-300 bg-indigo-50 dark:border-indigo-600 dark:bg-indigo-950/30' : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60'} text-slate-700 dark:text-slate-200`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-slate-900 dark:text-slate-100">Profile</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        Profile shows your saved ER data in one consolidated view. Verify details there before final submission.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => focusTopAction('profile')}
                      className="shrink-0 rounded-lg border border-indigo-300 bg-white px-3 py-2 text-xs font-semibold text-indigo-800 hover:bg-indigo-50 dark:border-indigo-700 dark:bg-gray-900 dark:text-indigo-200 dark:hover:bg-indigo-950/30"
                    >
                      Locate Profile
                    </button>
                  </div>
                </div>

                <div
                  ref={guidedHelpSectionRef}
                  className={`rounded-2xl border p-4 sm:p-5 ${helpSectionFocus === 'guided' ? 'help-section-focus border-emerald-300 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-950/30' : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60'} text-slate-700 dark:text-slate-200`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-slate-900 dark:text-slate-100">Guided Mode</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        Guided Mode assists when you are unsure. It highlights the next pending actions and the next section to complete.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => focusTopAction('guided')}
                      className="shrink-0 rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 dark:border-emerald-700 dark:bg-gray-900 dark:text-emerald-200 dark:hover:bg-emerald-950/30"
                    >
                      Locate Guided Mode
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200">
                <p className="text-sm font-semibold">Submission note</p>
                <p className="mt-1 leading-6">
                  OTP submission is available only after full completion. In card-based sections, each card must be saved separately before progress is counted.
                </p>
              </div>

            </div>
          </div>
        </div>
      )}

      {guidedModeEnabled && (
        <div
          ref={coachPanelRef}
          style={coachPosition ? { left: `${coachPosition.x}px`, top: `${coachPosition.y}px` } : undefined}
          className="fixed z-[90] flex max-h-[calc(100dvh-1rem)] w-[min(26rem,calc(100vw-1rem))] flex-col overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-white via-emerald-50/40 to-white shadow-2xl ring-1 ring-emerald-100 backdrop-blur dark:border-emerald-700 dark:from-gray-900 dark:via-emerald-950/20 dark:to-gray-900 dark:ring-emerald-900/60"
        >
          <div
            onPointerDown={handleCoachDragStart}
            className="cursor-grab border-b border-emerald-200/80 bg-emerald-50/70 px-3 py-2.5 active:cursor-grabbing sm:px-4 dark:border-emerald-800 dark:bg-emerald-950/30"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300">Guidance Coach</p>
                <p className="mt-0.5 text-xs font-medium text-gray-700 dark:text-gray-200">Compact step-by-step help</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsCoachDetailsExpanded((prev) => !prev)}
                  className="inline-flex items-center rounded-md border border-emerald-200 bg-white px-2 py-1 text-[11px] font-semibold text-emerald-800 shadow-sm dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200"
                >
                  {isCoachDetailsExpanded ? 'Less' : 'More'} tips
                </button>
                <button
                  type="button"
                  onClick={toggleGuidedMode}
                  className="inline-flex items-center rounded-md border border-rose-200 bg-white p-1.5 text-rose-700 shadow-sm hover:bg-rose-50 dark:border-rose-700 dark:bg-rose-950/20 dark:text-rose-300 dark:hover:bg-rose-950/40"
                  aria-label="Close guidance coach"
                  title="Close guidance coach"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
                
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2.5 sm:p-3">
            <div className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm dark:border-emerald-800 dark:bg-gray-900 dark:text-gray-100">
              {coachPrimaryMessage}
            </div>

            {isCoachDetailsExpanded && (shouldHighlightSparkButton || activeSection === 'Disciplinary Details' || activeSection === 'Officer Details' || shouldHighlightProfileButton || shouldShowPendingUnsavedTip || activeSectionIsZeroInfo) && (
              <div className="space-y-2">
                {shouldHighlightSparkButton && (
                  <p className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs leading-5 text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300">
                    New user flow: click the slowly pulsating <span className="font-semibold">Spark Profile</span> button first. Review the preview to understand Spark Data and what details are still pending, identify mandatory fields, and organize/collect that data in advance. Then start editing and saving from <span className="font-semibold">Officer Details</span>.
                  </p>
                )}
                {shouldShowPendingUnsavedTip && (
                  <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-800 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300">
                    You need to click the <span className="font-semibold">Edit</span> button of unsaved cards and review, add mandatory fields, and save. Then it will reflect as <span className="font-semibold">Saved</span>.
                  </p>
                )}
                {activeSection === 'Disciplinary Details' && (
                  <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                    Disciplinary Details are updated by <span className="font-semibold">AS-II officer</span>. No save or edit action is required for AIS officer in this section.
                  </p>
                )}
                {activeSection === 'Officer Details' && (
                  <p className="guided-hint-card relative overflow-hidden rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs leading-5 text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300">
                    <span
                      aria-hidden="true"
                      className="guided-hint-shine pointer-events-none absolute inset-y-0 -left-12 w-10 -skew-x-12 bg-white/45 blur-[1px]"
                    />
                    {shouldHighlightSparkButton
                      ? <>After Spark Profile Preview, go to <span className="font-semibold">Officer Details</span> and complete <span className="font-semibold">Personal Information</span> first (Edit button inside that card), then continue with the <span className="font-semibold">Dependent Details</span> tree.</>
                      : <>Officer Details order: complete <span className="font-semibold">Personal Information</span> first (Edit button inside that card), then continue with the <span className="font-semibold">Dependent Details</span> tree.</>}
                  </p>
                )}
                {shouldHighlightProfileButton && (
                  <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs leading-5 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
                    Completion flow: open <span className="font-semibold">Profile Preview</span>, verify all details, then click <span className="font-semibold">Submit</span> for OTP + e-sign. Final submission goes to <span className="font-semibold">AS-II</span> for approval.
                  </p>
                )}
                {activeSectionIsZeroInfo && (
                  <p className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs leading-5 text-sky-800 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-300">
                    <span className="font-semibold">{activeSection}:</span> {activeZeroInfoTip}
                  </p>
                )}
              </div>
            )}

            <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {coachProgressMessage}
            </p>

            <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-0.5">
              <button
                type="button"
                onClick={() => handleGoToGuidedSection(previousGuidedSection)}
                disabled={!previousGuidedSection}
                className={`${guidedGhostButtonClass} border-gray-200 text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800`}
              >
                Prev
              </button>
              <button
                type="button"
                onClick={handleGuidedNextAction}
                className={`${guidedGhostButtonClass} border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200`}
              >
                Next
              </button>
              <button
                type="button"
                onClick={handleSkipZeroInfoSection}
                disabled={!activeSectionIsZeroInfo}
                className={`${guidedGhostButtonClass} border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-sky-700 dark:bg-sky-950/30 dark:text-sky-200`}
              >
                Skip
              </button>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={`${guidedGhostButtonClass} border-indigo-300 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 dark:border-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-200`}
              >
                Top
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Initial Loading Modal */}
      {showInitLoader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center max-w-sm dark:bg-gray-800 dark:text-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <div className="text-lg font-medium">Initializing profile sections...</div>
            <div className="text-sm text-gray-500 mt-2 text-center">
              Loading all section data to calculate accurate progress
              <div className="mt-1 text-xs">
                {Object.keys(sectionProgress).length} of {ALL_REQUIRED_SECTIONS.length} sections loaded
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isSparkRefreshConfirmOpen}
        setIsOpen={setIsSparkRefreshConfirmOpen}
        onConfirm={refreshSparkNow}
        title="Refresh From SPARK"
        message="Do you want to fetch the latest profile data from SPARK now?"
        iconType="info"
        confirmText="Refresh"
      />

      <style jsx global>{`
        @keyframes helpBorderPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.45);
          }
          50% {
            box-shadow: 0 0 0 5px rgba(220, 38, 38, 0.12);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.45);
          }
        }
        @keyframes guidedBorderPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.45);
          }
          50% {
            box-shadow: 0 0 0 5px rgba(22, 163, 74, 0.12);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.45);
          }
        }
        .help-attention-button {
          animation: helpBorderPulse 2.4s ease-in-out infinite;
        }
        .guided-attention-button {
          animation: guidedBorderPulse 2.4s ease-in-out infinite;
          position: relative;
          box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.18), 0 6px 18px rgba(16, 185, 129, 0.18);
        }
        .guided-attention-shine {
          animation: guidedShineSweep 2.8s ease-in-out infinite;
        }
        .guided-hint-card {
          box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.08), 0 6px 16px rgba(99, 102, 241, 0.08);
        }
        .guided-hint-shine {
          animation: guidedHintSweep 3.2s ease-in-out infinite;
        }
        .help-section-focus {
          animation: guidedBorderPulse 2.1s ease-in-out 2;
        }
        @keyframes guidedShineSweep {
          0% {
            transform: translateX(-28px) skewX(-12deg);
            opacity: 0;
          }
          18% {
            opacity: 0.85;
          }
          45% {
            transform: translateX(220px) skewX(-12deg);
            opacity: 0;
          }
          100% {
            transform: translateX(220px) skewX(-12deg);
            opacity: 0;
          }
        }
        @keyframes guidedHintSweep {
          0% {
            transform: translateX(-36px) skewX(-12deg);
            opacity: 0;
          }
          15% {
            opacity: 0.65;
          }
          42% {
            transform: translateX(420px) skewX(-12deg);
            opacity: 0;
          }
          100% {
            transform: translateX(420px) skewX(-12deg);
            opacity: 0;
          }
        }
      `}</style>

    </>
  );
}

export default function UpdateProfile() {
  return (
    <ProfileCompletionProvider>
      <ProfileContent />
    </ProfileCompletionProvider>
  );
}
