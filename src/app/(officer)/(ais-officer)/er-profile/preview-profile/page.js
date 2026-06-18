"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownTrayIcon, CheckBadgeIcon, ArrowLeftIcon, ArrowRightIcon, ExclamationCircleIcon, CheckCircleIcon, DocumentTextIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { BoltIcon, UserIcon } from '@heroicons/react/24/solid';
import axiosInstance from "@/utils/apiClient";
import ConfirmModal from "../../../../components/confirmModal";
import SignerPortModal from "../../../../components/SignerPortModal";
import OTPModal from "../../../../components/otpModal";
import pdfGenerator from "../../../../../utils/pdfGenerator";
import { toast } from "react-toastify";
import { axiosInstanceFile } from "../../../../../utils/apiClient";
import downloadFile from '@/utils/downloadFile';
import saveDocument from "../../../../../utils/saveDocument";
import { formatDateToDDMMYYYY } from '@/utils/dateFormat';
import { storeErProfileWorkflowContext } from "@/utils/erProfileWorkflow";

const DEFAULT_AVATAR = "/images/avatar.jpg";

const normalizeFieldSource = (source) => {
  if (!source) return null;
  if (source === 'DB_SPARK_API' || source === 'SPARK_API' || source === 'SPARK') return 'SPARK';
  if (source === 'GAD_OFFICER') return 'GAD_OFFICER';
  if (source === 'AIS_OFFICER') return 'AIS_OFFICER';
  return null;
};

const getDisplayValue = (field) => {
  if (field && typeof field === 'object' && 'value' in field) {
    return field.value;
  }
  return field;
};

const createPreviewField = (value, source = null) => {
  const normalizedValue = value || "N/A";
  return {
    value: normalizedValue,
    source: normalizedValue === "N/A" ? null : normalizeFieldSource(source),
  };
};

const getFieldSourceFromRecord = (record, fieldNames = []) => {
  if (!record?.fields) return null;
  const fields = record.fields;

  for (const fieldName of fieldNames) {
    const flatSource = normalizeFieldSource(fields[fieldName]);
    if (flatSource) return flatSource;
  }

  for (const sourceKey of Object.keys(fields)) {
    const sourceFields = fields[sourceKey];
    if (!sourceFields || typeof sourceFields !== 'object' || Array.isArray(sourceFields)) continue;

    for (const fieldName of fieldNames) {
      if (
        sourceFields[fieldName] !== undefined &&
        sourceFields[fieldName] !== null &&
        sourceFields[fieldName] !== ""
      ) {
        return normalizeFieldSource(sourceKey);
      }
    }
  }

  return null;
};

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

const getServiceDuplicateMetaMap = (services = []) => {
  const grouped = new Map();

  services.forEach((service) => {
    const key = getServiceDuplicateKey(service);
    if (!key) return;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(service);
  });

  const duplicates = new Map();
  grouped.forEach((items, key) => {
    if (items.length > 1) {
      duplicates.set(key, { count: items.length });
    }
  });

  return duplicates;
};

const formatDisabilityPercentage = (value) => {
  if (value === null || value === undefined || value === "") return "N/A";

  const percentage = Number(value);
  if (Number.isNaN(percentage) || percentage <= 0 || percentage > 100) {
    return "N/A";
  }

  return `${value}%`;
};

const SourceIndicator = ({ source }) => {
  if (!source) return null;

  if (source === 'SPARK') {
    return (
      <div className="group relative inline-flex">
        <span className="inline-flex items-center rounded-full bg-orange-100 p-0.5 text-orange-700">
          <BoltIcon className="h-2.5 w-2.5" />
        </span>
        <div className="pointer-events-none absolute right-0 top-full z-20 mt-1 hidden group-hover:block">
          <div className="whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] font-medium text-white shadow-lg">
            Synced from SPARK
          </div>
        </div>
      </div>
    );
  }

  if (source === 'GAD_OFFICER') {
    return (
      <div className="group relative inline-flex">
        <span className="inline-flex items-center rounded-full bg-indigo-100 p-0.5 text-indigo-700">
          <span className="h-2 w-2 rounded-full bg-indigo-500" />
        </span>
        <div className="pointer-events-none absolute right-0 top-full z-20 mt-1 hidden group-hover:block">
          <div className="whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] font-medium text-white shadow-lg">
            Updated by AS-II Officer
          </div>
        </div>
      </div>
    );
  }

  if (source === 'AIS_OFFICER') {
    return (
      <div className="group relative inline-flex">
        <span className="inline-flex items-center rounded-full bg-violet-100 p-0.5 text-violet-700">
          <UserIcon className="h-2.5 w-2.5" />
        </span>
        <div className="pointer-events-none absolute right-0 top-full z-20 mt-1 hidden group-hover:block">
          <div className="whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] font-medium text-white shadow-lg">
            Updated by you
          </div>
        </div>
      </div>
    );
  }

  return null;
};

const getStatusFlowLabel = (status) => {
  const actionKey = String(status?.action_key || '').trim().toLowerCase();

  if (actionKey === 'return_for_correction' || actionKey === 'returned_for_correction' || actionKey === 'returned for correction') {
    return 'AS II Review -->Officer (RETURN FOR CORRECTION)';
  }

  if (actionKey === 'resubmit' || actionKey === 'resubmitted' || actionKey === 're_submit') {
    return 'Officer (RESUBMITTED ) -->AS II Review';
  }

  return `${status?.from_activity_name || 'N/A'} -> ${status?.to_activity_name || 'N/A'}`;
};

const SourceLegend = () => (
  <div className="mb-4 flex flex-wrap items-center gap-3 rounded-md border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
      <span className="inline-flex items-center rounded-full bg-orange-100 p-0.5 text-orange-600">
        <BoltIcon className="h-3 w-3" />
      </span>
      <span>Synced from SPARK</span>
    </div>
    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
      <span className="inline-flex items-center rounded-full bg-indigo-100 p-0.5 text-indigo-600">
        <span className="mx-[3px] my-[3px] h-2 w-2 rounded-full bg-indigo-500" />
      </span>
      <span>Updated by AS-II Officer</span>
    </div>
    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
      <span className="inline-flex items-center rounded-full bg-violet-100 p-0.5 text-violet-600">
        <UserIcon className="h-3 w-3" />
      </span>
      <span>Updated by you</span>
    </div>
  </div>
);

const normalizeChangeKey = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

const buildChangeLookup = (diffItems = []) => {
  const lookup = new Map();

  diffItems.forEach((item) => {
    const fieldKeys = [
      normalizeChangeKey(item?.field_label),
      normalizeChangeKey(item?.field),
    ].filter(Boolean);

    fieldKeys.forEach((key) => {
      const existing = lookup.get(key) || [];
      existing.push(item);
      lookup.set(key, existing);
    });
  });

  return lookup;
};

const buildSectionChangeLookup = (diffItems = []) => {
  const lookup = new Map();

  diffItems.forEach((item) => {
    const sectionKeys = [
      normalizeChangeKey(item?.section_label),
      normalizeChangeKey(item?.section),
    ].filter(Boolean);

    sectionKeys.forEach((key) => {
      const existing = lookup.get(key) || [];
      existing.push(item);
      lookup.set(key, existing);
    });
  });

  return lookup;
};

const getSectionLookupKeys = (title = "") => {
  const normalized = normalizeChangeKey(title);
  const aliasMap = {
    personaldetails: ["aisofficerinfo", "personaldetails"],
    addressdetails: ["addressdetails"],
    dependentsdetails: ["dependentdetails", "family", "dependentsdetails"],
    educationalqualifications: ["educationalqualifications", "qualification", "qualifications"],
    deputationdetails: ["centraldeputation", "deputationdetails"],
    servicedetails: ["servicedetails", "servicehistory"],
    trainingdetails: ["trainingdetails", "traininginfo"],
    awardsandpublications: ["awardsandpublications", "awardinfo"],
    disabilitydetails: ["disabilitydetails", "disabilityofficer"],
    disciplinarydetails: ["disciplinarydetails", "suspensioninfo"],
  };

  return aliasMap[normalized] || [normalized];
};

const getSectionChanges = (sectionChangeLookup, title) => {
  const keys = getSectionLookupKeys(title);
  const merged = [];
  const seen = new Set();

  keys.forEach((key) => {
    (sectionChangeLookup.get(key) || []).forEach((item) => {
      const itemKey = `${item.path || item.field}-${item.change_type}-${item.new_value}`;
      if (!seen.has(itemKey)) {
        seen.add(itemKey);
        merged.push(item);
      }
    });
  });

  return merged;
};

const sectionHasAddedContent = (sectionChanges = []) =>
  sectionChanges.some((item) => String(item?.change_type || "").toUpperCase() === "ADDED");

const SectionChangeBadge = ({ sectionChanges = [], compact = false }) => {
  if (!sectionChanges.length) return null;

  const added = sectionHasAddedContent(sectionChanges);
  const label = added ? "New Content" : "Changed";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
      added
        ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
        : 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200'
    }`}>
      <CheckBadgeIcon className={`${compact ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
      {label}
    </span>
  );
};

const ChangedFieldBadge = ({ change }) => {
  if (!change) return null;

  return (
    <div className="group relative inline-flex shrink-0">
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
        <CheckBadgeIcon className="h-3.5 w-3.5" />
        Changed
      </span>
      <div className="pointer-events-none absolute right-0 top-full z-20 mt-2 hidden min-w-56 max-w-80 rounded-lg border border-slate-200 bg-slate-900 px-3 py-2 text-[11px] text-white shadow-xl group-hover:block dark:border-slate-700">
        <div className="font-semibold text-slate-100">Previous value</div>
        <div className="mt-1 break-words text-slate-200">{String(change.old_value ?? "-")}</div>
      </div>
    </div>
  );
};

const InlineChangeSummary = ({ changePreview, workflowContext }) => {
  if (!changePreview?.has_approved_baseline) return null;

  const scheduleLabel =
    changePreview.active_window?.schedule_code ||
    changePreview.active_window?.window_name ||
    (changePreview.window_status === "CLOSED" ? "Window Closed" : "No Active Window");

  return (
    <div className="mb-5 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 dark:border-sky-800 dark:bg-sky-950/30">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-full border border-sky-200 bg-white px-3 py-1 font-semibold text-sky-900 dark:border-sky-700 dark:bg-gray-900 dark:text-sky-200">
          Schedule: {scheduleLabel}
        </span>
        <span className="rounded-full border border-sky-200 bg-white px-3 py-1 text-slate-700 dark:border-sky-700 dark:bg-gray-900 dark:text-slate-200">
          Baseline: v{changePreview.base_version_no || "-"}
        </span>
        <span className="rounded-full border border-sky-200 bg-white px-3 py-1 text-slate-700 dark:border-sky-700 dark:bg-gray-900 dark:text-slate-200">
          Changes: {changePreview.changed_fields_count || 0} fields / {changePreview.changed_sections_count || 0} sections
        </span>
        <span className="rounded-full border border-sky-200 bg-white px-3 py-1 text-slate-700 dark:border-sky-700 dark:bg-gray-900 dark:text-slate-200">
          Flow: {workflowContext?.workflow_mode || "SRV002"}
        </span>
      </div>
      {(changePreview.changed_fields_count || 0) > 0 && (
        <p className="mt-2 text-xs text-sky-800 dark:text-sky-200">
          Updated fields are highlighted inline. Hover the <span className="font-semibold">Changed</span> label to view the base approved value.
        </p>
      )}
    </div>
  );
};

const ProfilePreviewPage = () => {
  const [progress, setProgress] = useState(0);
  const [currentStatus, setCurrentStatus] = useState("pending");
  const roleId = sessionStorage.getItem('role_id');

  useEffect(() => {
    const storedProgress = sessionStorage.getItem('profileProgress');
    if (storedProgress) {
      const progressValue = parseInt(storedProgress, 10);
      setProgress(progressValue);
    } else {
      setProgress(0);
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'profileProgress') {
        const progressValue = parseInt(e.newValue, 10) || 0;
        setProgress(progressValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isOtpClicked, setIsOtpClicked] = useState(false);
  const [otpId, setOtpId] = useState('');
  const [signerPortModalOpen, setSignerPortModalOpen] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState('');
  const [isConsentChecked, setIsConsentChecked] = useState(false);
  const [isConsentDisabled, setIsConsentDisabled] = useState(false);
  const [consentError, setConsentError] = useState('');
  const [aisPerId, setAisPerId] = useState(null);
  const [fullName, setFullName] = useState(null);
  const [mobile, setMobile] = useState(null);
  const [statusTimeline, setStatusTimeline] = useState([]);
  const [workflowContext, setWorkflowContext] = useState(null);
  const [allowedActions, setAllowedActions] = useState([]);
  const [changePreview, setChangePreview] = useState(null);
  const router = useRouter();
  const contentRef = useRef(null);

  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [documentData, setDocumentData] = useState(null);
  const [currentDocIndex, setCurrentDocIndex] = useState(0);
  const [loadingDocument, setLoadingDocument] = useState(false);
  const [documentError, setDocumentError] = useState(null);

  const latestStatus = statusTimeline.find(status => status.is_current) || statusTimeline[statusTimeline.length - 1] || {};
  const hasDuplicateServicePeriods = Boolean(
    userDetails?.service_details?.length &&
    getServiceDuplicateMetaMap(userDetails.service_details).size > 0
  );
  const visibleActions = allowedActions.filter((action) => action?.is_visible !== false);
  const changeLookup = useMemo(
    () => buildChangeLookup(changePreview?.diff_json || []),
    [changePreview?.diff_json]
  );
  const sectionChangeLookup = useMemo(
    () => buildSectionChangeLookup(changePreview?.diff_json || []),
    [changePreview?.diff_json]
  );

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const rawValue = String(dateString).trim();
      if (!rawValue) return "N/A";

      const datePart = rawValue.split(" ")[0];
      let branch = "unknown";
      let formattedValue = "N/A";

      if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
        branch = "iso";
        formattedValue = formatDateToDDMMYYYY(datePart);
        return formattedValue;
      }

      if (/^\d{2}\/\d{2}\/\d{4}$/.test(datePart)) {
        branch = "slash-preserved";
        formattedValue = datePart;
        return formattedValue;
      }

      if (/^\d{2}-\d{2}-\d{4}$/.test(datePart)) {
        const [day, month, year] = datePart.split("-");
        branch = "dash-day-first";
        formattedValue = `${day}/${month}/${year}`;
        return formattedValue;
      }

      const date = new Date(rawValue);
      if (isNaN(date.getTime())) return "N/A";

      const isoDate = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
      ].join('-');

      branch = "native-date-parse";
      formattedValue = formatDateToDDMMYYYY(isoDate);
      return formattedValue;
    } catch (error) {
      console.error("Date formatting error:", error);
      return "N/A";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "N/A";
    }
  };


  // Helper function to get value from any source dynamically
  const getFieldValue = (dep, fieldNames) => {
    // Check direct fields first
    for (const fieldName of fieldNames) {
      if (dep[fieldName] !== undefined && dep[fieldName] !== null && dep[fieldName] !== "") {
        return dep[fieldName];
      }
    }

    // Check nested fields (AIS_OFFICER, DB_SPARK_API, etc.)
    if (dep.fields) {
      for (const sourceKey in dep.fields) {
        const source = dep.fields[sourceKey];
        if (source && typeof source === 'object') {
          for (const fieldName of fieldNames) {
            if (source[fieldName] !== undefined && source[fieldName] !== null && source[fieldName] !== "") {
              return source[fieldName];
            }
          }
        }
      }
    }

    return null;
  };

  const transformOfficerData = useCallback((data) => {
    const officerInfo = data.ais_officer_info;
    const officerSource = (fieldNames) => getFieldSourceFromRecord(officerInfo, fieldNames);

    // Create a map of family members for parent lookup
    const familyMap = {};
    if (data.family) {
      data.family.forEach(member => {
        familyMap[member.person_id] = {
          name: `${getFieldValue(member, ['first_name']) || ''} ${getFieldValue(member, ['last_name']) || ''}`.trim(),
          relation: getFieldValue(member, ['relation', 'relation_type']) || 'Dependent'
        };
      });
    }


    return {
      full_name: `${officerInfo.honorifics ? formatField(officerInfo.honorifics, "Honorifics") + " " : ""}${officerInfo.first_name || ""} ${officerInfo.last_name || ""}`.trim(),
      position: formatField(officerInfo.service_type_name, "Service Type") || "N/A",
      profile_image: officerInfo.profile_image
        ? `${process.env.NEXT_PUBLIC_API_URL}/officer/get-image/${officerInfo.profile_image}?t=${new Date().getTime()}`
        : DEFAULT_AVATAR,
      personal_details: {
        "Full Name": createPreviewField(
          `${officerInfo.honorifics ? formatField(officerInfo.honorifics, "Honorifics") + " " : ""}${officerInfo.first_name || ""} ${officerInfo.last_name || ""}`.trim(),
          officerSource(['honorifics', 'first_name', 'last_name'])
        ),
        "Date of Birth": createPreviewField(formatDate(officerInfo.dob), officerSource(['dob'])),
        "Gender": createPreviewField(formatField(officerInfo.gender, "Gender") || "N/A", officerSource(['gender_id', 'gender'])),
        "Blood Group": createPreviewField(formatField(officerInfo.blood_group, "Blood Group") || "N/A", officerSource(['blood_group_id', 'blood_group'])),
        "Email": createPreviewField(officerInfo.email || "N/A", officerSource(['email'])),
        "Alternative Email": createPreviewField(officerInfo.alternative_email || "N/A", officerSource(['alternative_email'])),
        "Mobile No": createPreviewField(officerInfo.mobile_no || "N/A", officerSource(['mobile_no'])),
        "Alternative Mobile No": createPreviewField(officerInfo.alternative_mobile_no || "N/A", officerSource(['alternative_mobile_no'])),
        "Karmasri ID": createPreviewField(officerInfo.identity_number || "N/A", officerSource(['identity_number'])),
        "PEN": createPreviewField(officerInfo.pen_number || "N/A", officerSource(['pen_number'])),
        "AIS Number": createPreviewField(formatField(officerInfo.ais_number, "AIS Number") || "N/A", officerSource(['ais_number'])),
        "PAN": createPreviewField(formatField(officerInfo.pan_no, "PAN") || "N/A", officerSource(['pan_no'])),
        "PRAN": createPreviewField(officerInfo.praan_number || "N/A", officerSource(['praan_number'])),
        "PF Number": createPreviewField(officerInfo.pf_number || "N/A", officerSource(['pf_number'])),
        "Source of Recruitment": createPreviewField(formatField(officerInfo.recruitment, "Source of Recruitment") || "N/A", officerSource(['source_of_recruitment_id', 'recruitment'])),
        "Cadre": createPreviewField(formatField(officerInfo.cadre, "Cadre") || "N/A", officerSource(['cadre_id', 'cadre'])),
        "Allotment Year": createPreviewField(officerInfo.allotment_year || "N/A", officerSource(['allotment_year'])),
        "Date of Joining": createPreviewField(formatDate(officerInfo.date_of_joining), officerSource(['date_of_joining'])),
        "Service Type": createPreviewField(formatField(officerInfo.service_type_name, "Service Type") || "N/A", officerSource(['service_type_id', 'service_type_name'])),
        "Mother Tongue": createPreviewField(formatField(officerInfo.mother_tongue, "Mother Tongue") || "N/A", officerSource(['mother_tongue_id', 'mother_tongue'])),
        "Languages Known": createPreviewField(officerInfo.languages_known?.map(lang => formatField(lang, "Languages Known")).join(", ") || "N/A", officerSource(['languages_known', 'languages_known_ids'])),
        "Category": createPreviewField(
          formatField(officerInfo.category, "Category") ||
          officerInfo.category_id?.toString() ||
          "N/A",
          officerSource(['category_id', 'category'])
        ),
        "Retirement Date": createPreviewField(formatDate(officerInfo.retirement_date), officerSource(['retirement_date'])),
        "Mode of Retirement": createPreviewField(formatField(officerInfo.retirement, "Mode of Retirement") || "N/A", officerSource(['retirement_id', 'retirement'])),
      },
      address_details: [
        {
          title: "Official Address",
          value: [
            formatField(officerInfo.address_line1_com, "Address Line1 Com"),
            formatField(officerInfo.address_line2_com, "Address Line2 Com"),
            formatField(officerInfo.district_com, "District Com"),
            formatField(officerInfo.state_com, "State Com"),
            officerInfo.pin_code_com,
          ].filter(Boolean).join(", ") || "N/A",
          source: officerSource(['address_line1_com', 'address_line2_com', 'district_id_com', 'state_id_com', 'pin_code_com']),
        },
        {
          title: "Permanent Address",
          value: [
            formatField(officerInfo.address_line1_per, "Address Line1 Per"),
            formatField(officerInfo.address_line2_per, "Address Line2 Per"),
            formatField(officerInfo.district_per, "District Per"),
            formatField(officerInfo.state_per, "State Per"),
            officerInfo.pin_code_per,
          ].filter(Boolean).join(", ") || "N/A",
          source: officerSource(['address_line1_per', 'address_line2_per', 'district_id_per', 'state_id_per', 'pin_code_per']),
        },
      ],
      dependent_details: data.family?.length
        ? data.family.map(dep => {
          // Use dynamic field getter for all fields
          const firstName = getFieldValue(dep, ['first_name']);
          const lastName = getFieldValue(dep, ['last_name']);
          const relation = getFieldValue(dep, ['relation', 'relation_type']);
          const dob = getFieldValue(dep, ['dob', 'date_of_birth']);
          const deathDate = getFieldValue(dep, ['death_date']);
          const divorceDate = getFieldValue(dep, ['divorce_date']);
          const email = getFieldValue(dep, ['email_id', 'email']);
          const mobile = getFieldValue(dep, ['mobile_number', 'mobile_no']);
          const institution = getFieldValue(dep, ['institution_name', 'institution']);
          const occupation = getFieldValue(dep, ['occupation_category', 'occupation']);

          // Get gender from any source
          let genderValue = "N/A";
          const genderName = getFieldValue(dep, ['gender_name', 'gender']);
          const genderId = getFieldValue(dep, ['gender_id']);

          if (genderName && genderName !== "Other" && genderName !== "other") {
            genderValue = formatField(genderName, "Gender");
          } else if (genderId) {
            // Convert numeric gender_id to text
            const genderIdNum = parseInt(genderId);
            if (genderIdNum === 1) genderValue = "Male";
            else if (genderIdNum === 2) genderValue = "Female";
            else if (genderIdNum === 3) genderValue = "Transgender";
          }

          // Get parent name from family map
          let parentName = "N/A";
          const fatherId = getFieldValue(dep, ['father_id']);
          const motherId = getFieldValue(dep, ['mother_id']);
          const spouseId = getFieldValue(dep, ['spouse_id']);

          if (fatherId && familyMap[fatherId]) {
            parentName = familyMap[fatherId].name;
          } else if (motherId && familyMap[motherId]) {
            parentName = familyMap[motherId].name;
          } else if (spouseId && familyMap[spouseId]) {
            parentName = familyMap[spouseId].name;
          }

          // Get document IDs from any source
          const deathCert = getFieldValue(dep, ['death_certificate']);
          const marriageCert = getFieldValue(dep, ['marriage_certificate_proof']);
          const supDoc = getFieldValue(dep, ['sup_doc_for_remv']);

          // Determine if alive (check multiple sources)
          let isAlive = true;
          const aliveValue = getFieldValue(dep, ['is_alive', 'alive_status']);
          if (aliveValue === false || aliveValue === "false" || aliveValue === "False") {
            isAlive = false;
          } else if (aliveValue === true || aliveValue === "true" || aliveValue === "True") {
            isAlive = true;
          }

          // Determine if AIS officer
          const isAisOfficer = getFieldValue(dep, ['is_ais_officer']);
          const isGovtServant = getFieldValue(dep, ['is_govt_servant', 'government_servant']);
          const isFromHistory = getFieldValue(dep, ['is_from_history']) === true ||
            getFieldValue(dep, ['is_from_history']) === "true" ||
            getFieldValue(dep, ['is_from_history']) === "True";
          const sourceFor = (fieldNames) => getFieldSourceFromRecord(dep, fieldNames);

          return {
            relation: (formatField(relation, "Relation") === "Current Spouse" ? "Spouse" : formatField(relation, "Relation")) || "Dependent",
            name: [formatField(firstName), formatField(lastName)].filter(Boolean).join(' ') || "N/A",
            date_of_birth: formatDate(dob),
            gender: genderValue,
            email: email || "N/A",
            mobile_number: mobile || "N/A",
            ais_officer: isAisOfficer === true || isAisOfficer === "true" || isAisOfficer === "True" ? "Yes" : "No",
            government_servant: isGovtServant === true || isGovtServant === "true" || isGovtServant === "True" ? "Yes" : "No",
            institution: formatField(institution, "Institution Name") || "N/A",
            occupation: formatField(occupation, "Occupation Category") || "N/A",
            // Document fields
            death_certificate: deathCert,
            marriage_certificate_proof: marriageCert,
            sup_doc_for_remv: supDoc,
            // Status fields
            is_alive: isAlive,
            death_date: deathDate,
            divorce_date: divorceDate,
            is_from_history: isFromHistory,
            // Parent info
            father_id: fatherId,
            mother_id: motherId,
            spouse_id: spouseId,
            parent_name: parentName,
            _fieldSources: {
              name: sourceFor(['first_name', 'last_name']),
              date_of_birth: sourceFor(['dob', 'date_of_birth']),
              gender: sourceFor(['gender_id', 'gender_name', 'gender']),
              email: sourceFor(['email_id', 'email']),
              mobile_number: sourceFor(['mobile_number', 'mobile_no']),
              ais_officer: sourceFor(['is_ais_officer']),
              government_servant: sourceFor(['is_govt_servant', 'government_servant']),
              institution: sourceFor(['institution_name', 'institution']),
              occupation: sourceFor(['occupation_category', 'occupation']),
              status: sourceFor(['is_alive', 'death_date', 'divorce_date', 'relation', 'relation_type']),
              death_date: sourceFor(['death_date']),
              divorce_date: sourceFor(['divorce_date']),
              parent_name: sourceFor(['father_id', 'mother_id', 'spouse_id']),
              type: sourceFor(['is_from_history']),
            },
          };
        })
        : [],
      educational_qualifications: data.ais_edu_qualification?.length
        ? data.ais_edu_qualification.map(edu => ({
          qualification: formatField(edu.qualification, "Qualification") || "N/A",
          institute: formatField(edu.institute_name, "Institute Name") || "N/A",
          subject: formatField(edu.subject_name, "Subject Name") || "N/A",
          _fieldSources: {
            qualification: getFieldSourceFromRecord(edu, ['qualification_id', 'qualification']),
            institute: getFieldSourceFromRecord(edu, ['institute_name']),
            subject: getFieldSourceFromRecord(edu, ['subject_name']),
          },
        }))
        : [],

      central_deputation: data.ais_central_deputation?.length
        ? data.ais_central_deputation
          .map(dep => ({
            raw_start: dep.start_date,
            raw_end: dep.end_date,
            designation: dep.cen_designation,
            phone: dep.phone_no,
            state: dep.state,
            tenure: dep.tenures,
            ministry: dep.ministry,
            office: dep.agency,
            department: dep.administrative_department,
            deputation_type: dep.deputation_type,
            _fieldSources: {
              designation: getFieldSourceFromRecord(dep, ['cen_designation', 'designation', 'cen_designation_id']),
              phone: getFieldSourceFromRecord(dep, ['phone_no']),
              state: getFieldSourceFromRecord(dep, ['state', 'state_id']),
              start_date: getFieldSourceFromRecord(dep, ['start_date']),
              end_date: getFieldSourceFromRecord(dep, ['end_date']),
              tenure: getFieldSourceFromRecord(dep, ['tenure_id', 'tenures']),
              ministry: getFieldSourceFromRecord(dep, ['cen_min_id', 'ministry']),
              office: getFieldSourceFromRecord(dep, ['cen_org_id', 'agency_id', 'agency']),
              department: getFieldSourceFromRecord(dep, ['cen_dept_id', 'administrative_department']),
              deputation_type: getFieldSourceFromRecord(dep, ['deputation_type']),
            },
          }))
          .sort((a, b) => {
            const now = new Date();
            const aStart = new Date(a.raw_start);
            const bStart = new Date(b.raw_start);
            const aEnd = a.raw_end ? new Date(a.raw_end) : null;
            const bEnd = b.raw_end ? new Date(b.raw_end) : null;

            // Active if no end date or end date is in the future
            const aActive = !aEnd || aEnd > now;
            const bActive = !bEnd || bEnd > now;

            // Active first
            if (aActive && !bActive) return -1;
            if (!aActive && bActive) return 1;

            // Within same group, sort by start_date descending
            if (isNaN(aStart) && isNaN(bStart)) return 0;
            if (isNaN(aStart)) return 1;  // invalid dates last
            if (isNaN(bStart)) return -1;
            return bStart - aStart; // descending
          })
          .map(dep => ({
            designation: formatField(dep.designation, "cen_designation") || "N/A",
            phone: dep.phone || "N/A",
            state: formatField(dep.state, "State") || "N/A",
            start_date: formatDate(dep.raw_start),
            end_date: formatDate(dep.raw_end),
            tenure: formatField(dep.tenure, "Tenures") || "N/A",
            ministry: formatField(dep.ministry, "Ministry") || "N/A",
            office: formatField(dep.office, "Agency") || "N/A",
            department: formatField(dep.department, "Administrative Department") || "N/A",
            deputation_type: formatField(dep.deputation_type, "Deputation Type") || "N/A",
            _fieldSources: dep._fieldSources,
          }))
        : [],

      service_details: data.ais_service_history?.length
        ? data.ais_service_history
          .map(service => ({
            raw_start: service.start_date,
            raw_end: service.end_date,
            designation: service.designation,
            ministry: service.ministry,
            department: service.administrative_department,
            office: service.agency,
            state: service.state,
            district: service.district,
            grade: service.grade,
            level: service.level,
            posting_type: service.posting_types,
            additional_charge: service.is_additional_charge,
            address: service.address,
            phone_no: service.phone_no,
            order_no: service.order_no,
            order_date: service.order_date,
            basic_pay: service.basic_pay,
            other_details: service.other_details,
            _fieldSources: {
              designation: getFieldSourceFromRecord(service, ['designation', 'designation_id']),
              ministry: getFieldSourceFromRecord(service, ['ministry', 'ministry_id']),
              department: getFieldSourceFromRecord(service, ['administrative_department', 'administrative_department_id']),
              office: getFieldSourceFromRecord(service, ['agency', 'agency_id']),
              state: getFieldSourceFromRecord(service, ['state', 'state_id']),
              district: getFieldSourceFromRecord(service, ['district', 'district_id']),
              grade: getFieldSourceFromRecord(service, ['grade', 'grade_id']),
              level: getFieldSourceFromRecord(service, ['level', 'level_id']),
              posting_type: getFieldSourceFromRecord(service, ['posting_types', 'posting_type_id']),
              additional_charge: getFieldSourceFromRecord(service, ['is_additional_charge']),
              address: getFieldSourceFromRecord(service, ['address']),
              phone_no: getFieldSourceFromRecord(service, ['phone_no']),
              start_date: getFieldSourceFromRecord(service, ['start_date']),
              end_date: getFieldSourceFromRecord(service, ['end_date']),
              order_no: getFieldSourceFromRecord(service, ['order_no']),
              order_date: getFieldSourceFromRecord(service, ['order_date']),
              basic_pay: getFieldSourceFromRecord(service, ['basic_pay']),
              other_details: getFieldSourceFromRecord(service, ['other_details']),
            },
          }))
          .sort((a, b) => {
            const now = new Date();
            const aStart = new Date(a.raw_start);
            const bStart = new Date(b.raw_start);
            const aEnd = a.raw_end ? new Date(a.raw_end) : null;
            const bEnd = b.raw_end ? new Date(b.raw_end) : null;

            const aActive = !aEnd || aEnd > now;
            const bActive = !bEnd || bEnd > now;

            if (aActive && !bActive) return -1;
            if (!aActive && bActive) return 1;

            if (isNaN(aStart) && isNaN(bStart)) return 0;
            if (isNaN(aStart)) return 1;
            if (isNaN(bStart)) return -1;
            return bStart - aStart;
          })
          .map(service => ({
            designation: formatField(service.designation, "designation") || "N/A",
            ministry: formatField(service.ministry, "Ministry") || "N/A",
            department: formatField(service.department, "Administrative Department") || "N/A",
            office: formatField(service.office, "Agency") || "N/A",
            state: formatField(service.state, "State") || "N/A",
            district: formatField(service.district, "District") || "N/A",
            grade: formatField(service.grade, "Grade") || "N/A",
            level: formatField(service.level, "Level") || "N/A",
            posting_type: formatField(service.posting_type, "Posting Types") || "N/A",
            additional_charge: service.additional_charge ? "Yes" : "No",
            address: service.address || "N/A",
            phone_no: service.phone_no || "N/A",
            start_date: (() => {
              const formatted = formatDate(service.raw_start);
              return formatted;
            })(),
            end_date: (() => {
              const formatted = formatDate(service.raw_end);
              return formatted;
            })(),
            order_no: service.order_no || "N/A",
            order_date: (() => {
              const formatted = formatDate(service.order_date);
              return formatted;
            })(),
            basic_pay: service.basic_pay || "N/A",
            other_details: formatField(service.other_details, "Other Details") || "N/A",
            _fieldSources: service._fieldSources,
          }))
        : [],


      training_details: data.ais_training_info?.length
        ? data.ais_training_info.map(training => ({
          // training_name: formatField(training.training_name, "Training Name") || "N/A",
          training_type: formatField(training.training_type, "Training Type") || "N/A",
          country: formatField(training.country, "Country") || "N/A",
          institute_name: formatField(training.institute_name, "Institute Name") || "N/A",
          subject: formatField(training.subject, "Subject") || "N/A",
          place: formatField(training.place, "Place") || "N/A",
          start_date: formatDate(training.training_from),
          end_date: formatDate(training.training_to),
          documentIds: training.documents || [],
          _fieldSources: {
            training_type: getFieldSourceFromRecord(training, ['training_type_id', 'training_type']),
            country: getFieldSourceFromRecord(training, ['country_id', 'country']),
            institute_name: getFieldSourceFromRecord(training, ['institute_name']),
            subject: getFieldSourceFromRecord(training, ['subject']),
            place: getFieldSourceFromRecord(training, ['place']),
            start_date: getFieldSourceFromRecord(training, ['training_from']),
            end_date: getFieldSourceFromRecord(training, ['training_to']),
          },
        }))
        : [],
      awards_and_publications: data.ais_rewards?.length
        ? data.ais_rewards.map(reward => ({
          award_name: formatField(reward.rew_name, "Reward Name") || "N/A",
          awarded_by: formatField(reward.rew_from, "Reward From") || "N/A",
          received_date: formatDate(reward.received_on),
          description: formatField(reward.rew_description, "Reward Description") || "N/A",
          documentId: reward.reward_doc || null,
          award_category: formatField(reward.reward_type, "Award Category") || "N/A",
          _fieldSources: {
            award_name: getFieldSourceFromRecord(reward, ['rew_name']),
            awarded_by: getFieldSourceFromRecord(reward, ['rew_from']),
            received_date: getFieldSourceFromRecord(reward, ['received_on']),
            description: getFieldSourceFromRecord(reward, ['rew_description']),
            award_category: getFieldSourceFromRecord(reward, ['reward_type']),
          },
        }))
        : [],
      disability_details: data.ais_officer_disability?.length
        ? data.ais_officer_disability.map(disability => ({
          disability_type: formatField(disability.disability, "Disability") || "N/A",
          disability_percentage: formatDisabilityPercentage(disability.disability_perc),
          expiry_date: formatDate(disability.dis_valid_up_to),
          documentId: disability.disability_proof || null,
          udid_number: formatField(disability.udid_number, "UDID Document Number") || "N/A",
          _fieldSources: {
            disability_type: getFieldSourceFromRecord(disability, ['disability_type_id', 'disability']),
            disability_percentage: getFieldSourceFromRecord(disability, ['disability_perc']),
            expiry_date: getFieldSourceFromRecord(disability, ['dis_valid_up_to']),
            udid_number: getFieldSourceFromRecord(disability, ['udid_number']),
          },
        }))
        : [],
      disciplinary_details: data.ais_suspension_info?.length
        ? data.ais_suspension_info.map(susp => ({
          suspension_reason: formatField(susp.suspension_details, "Suspension Details") || "N/A",
          order_number: formatField(susp.sus_order_number, "Order Number") || "N/A",
          from_period: formatDate(susp.from_period),
          to_period: formatDate(susp.to_period),
          documentId: susp.suspension_document || null,
          _fieldSources: {
            suspension_reason: getFieldSourceFromRecord(susp, ['suspension_details']),
            order_number: getFieldSourceFromRecord(susp, ['sus_order_number']),
            from_period: getFieldSourceFromRecord(susp, ['from_period']),
            to_period: getFieldSourceFromRecord(susp, ['to_period']),
          },
        }))
        : [],
      experience_details: data.ais_experience?.length
        ? data.ais_experience.map(exp => ({
          organization: formatField(exp.organization, "Organization") || "N/A",
          designation: formatField(exp.designation, "Designation") || "N/A",
          start_date: formatDate(exp.start_date),
          end_date: formatDate(exp.end_date),
          description: formatField(exp.description, "Description") || "N/A",
        }))
        : [],
    };
  }, []);

  useEffect(() => {
    const fetchOfficerData = async () => {
      try {
        const response = await axiosInstance.get("/officer/officer-preview");

        if (response.data.success) {
          const officerData = response.data.data.officer_data;
          if (!officerData) throw new Error("No officer info found in response");
          setAisPerId(officerData.ais_per_id);
          const transformedData = transformOfficerData(officerData);
          setFullName(transformedData.full_name);
          setMobile(officerData.ais_officer_info.mobile_no);
          setUserDetails(transformedData);
        } else {
          setError(response.data.detail || "Failed to fetch officer data");
        }
      } catch (err) {
        setError(err.message || "Failed to fetch or process officer data");
      } finally {
        setLoading(false);
      }
    };
    fetchOfficerData();
  }, [transformOfficerData]);

  const fetchWorkflowContext = useCallback(async () => {
    if (!aisPerId) return;
    try {
      const response = await axiosInstance.get(`/officer/er-profile/workflow-context/${aisPerId}`);
      if (response.data.success) {
        const context = response.data.data || {};
        const statusData = context.status_timeline || [];
        setWorkflowContext(context);
        storeErProfileWorkflowContext(context);
        setStatusTimeline(statusData);
        setAllowedActions(context.allowed_actions || []);
        setChangePreview(context.change_preview || null);
        if (statusData.length > 0 || context.change_preview?.has_approved_baseline) {
          setIsConsentChecked(true);
          setIsConsentDisabled(true);
        }
      } else {
        setError(response.data.detail || "Failed to fetch workflow context");
      }
    } catch (err) {
      setError(err.message || "Failed to fetch workflow context");
    }
  }, [aisPerId]);

  useEffect(() => {
    fetchWorkflowContext();
  }, [fetchWorkflowContext]);

  const openDocumentModal = useCallback(async (documentArray) => {
    if (!documentArray || documentArray.length === 0) return;
    setLoadingDocument(true);
    setDocumentError(null);
    const docs = [];
    try {
      for (let i = 0; i < documentArray.length; i++) {
        const documentId = documentArray[i];
        const response = await axiosInstance.get(`/doc-uploader/get-document/${documentId}`, {
          responseType: "blob",
        });
        const url = URL.createObjectURL(response.data);
        const isPdf = response.data.type.includes("pdf");
        docs.push({ id: documentId, url, name: `Document ${i + 1}`, isPdf });
      }
      setDocumentData(docs);
      setCurrentDocIndex(0);
      setDocumentModalOpen(true);
    } catch (error) {
      setDocumentError("Failed to load documents");
      toast.error("Failed to load documents");
    } finally {
      setLoadingDocument(false);
    }
  }, []);

  const closeDocumentModal = useCallback(() => {
    if (documentData) {
      documentData.forEach(doc => {
        if (doc.url) URL.revokeObjectURL(doc.url);
      });
    }
    setDocumentModalOpen(false);
    setDocumentData(null);
    setDocumentError(null);
    setCurrentDocIndex(0);
  }, [documentData]);

  const getDisplayStatus = (actionKey) => {
    switch (actionKey?.toLowerCase()) {
      case 'submit': return 'Submitted';
      case 'resubmit': return 'Resubmitted';
      case 'submit_after_approval': return 'Submitted For Approval';
      case 'resubmit_after_approval': return 'Resubmitted For Approval';
      case 'approve': return 'Verified';
      case 'return_for_correction': return 'Returned for Correction';
      case 'return_after_approval': return 'Returned for Correction';
      default: return 'Pending';
    }
  };

  const currentDisplayStatus =
    latestStatus.action_key
      ? getDisplayStatus(latestStatus.action_key)
      : workflowContext?.workflow_mode === 'SRV002' && changePreview?.has_approved_baseline
        ? (changePreview?.current_cycle_status || 'Approved Baseline Available')
        : userDetails?.personal_details?.Status || 'Pending';

  const formatField = (value) => {
    if (value === null || value === undefined) return null;
    if (typeof value !== 'string') return value;
    const trimmedValue = value.trim();
    if (!trimmedValue) return null;
    const lowerValue = trimmedValue.toLowerCase();
    if (lowerValue === 'null' || lowerValue === 'undefined' || lowerValue === 'n/a') return null;
    return trimmedValue;
  };

  const getStatusColor = (status) => {
    const lowerStatus = status.toLowerCase();
    switch (lowerStatus) {
      case 'verified':
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800';
      case 'submitted' || 'Submitted':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800';
      case 'resubmitted' || 'Resubmitted':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800';
      case 'return_for_correction' || 'Returned for Correction':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700';
    }
  };

  const getRemarkForAction = (action) => {
    switch (action) {
      case 'submit': return 'Profile submitted for verification.';
      case 'resubmit': return 'Profile resubmitted for verification after corrections.';
      case 'submit_after_approval': return 'Profile changes submitted for verification against the latest approved profile.';
      case 'resubmit_after_approval': return 'Corrected profile changes resubmitted for verification against the latest approved profile.';
      default: return '';
    }
  };

  const getCompletionMessage = (actionKey) => {
    switch (actionKey?.toLowerCase()) {
      case 'approve':
        return 'Profile Approved';
      case 'submit':
      case 'resubmit':
      case 'submit_after_approval':
      case 'resubmit_after_approval':
        return 'Profile Submitted - Awaiting Verification';
      default:
        return workflowContext?.change_preview?.message || 'Profile Submitted - Awaiting Verification';
    }
  };

  const getActionButtonClasses = (buttonStyle, disabled) => {
    if (disabled) {
      return 'bg-slate-100 text-slate-400 cursor-not-allowed border-2 border-indigo-300 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600';
    }

    switch (buttonStyle) {
      case 'success':
        return 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 shadow-md hover:shadow-lg border-2 border-emerald-600';
      case 'danger':
        return 'bg-gradient-to-r from-rose-600 to-rose-700 text-white hover:from-rose-700 hover:to-rose-800 shadow-md hover:shadow-lg border-2 border-rose-600';
      case 'secondary':
        return 'bg-gradient-to-r from-sky-600 to-sky-700 text-white hover:from-sky-700 hover:to-sky-800 shadow-md hover:shadow-lg border-2 border-sky-600';
      case 'warning':
        return 'bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:from-amber-700 hover:to-amber-800 shadow-md hover:shadow-lg border-2 border-amber-600';
      default:
        return 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 shadow-md hover:shadow-lg border-2 border-indigo-600';
    }
  };

  const handleActionClick = (action) => {
    const selectedAction = allowedActions.find((item) => item.action_key === action);
    if (!selectedAction) {
      toast.error('No workflow action is available right now.');
      return;
    }
    if (!isConsentChecked) {
      setConsentError('You must provide consent to proceed with this action.');
      return;
    }
    if (selectedAction.enabled === false) {
      toast.error(selectedAction.disabled_reason || 'This action is currently disabled.');
      return;
    }
    setConsentError('');
    setConfirmationAction(action);
    setShowConfirmationModal(true);
  };

  const fetchOfficerProfileDocument = async () => {
    try {
      const ais_Per_Id = String(aisPerId);
      const response = await axiosInstance.post('/as-II/get-officer-profile-document', {
        ais_per_id: ais_Per_Id,
      });
      if (response.data.success) {
        const docNum = response.data.data?.document_number;
        if (!docNum) throw new Error('No document number found in response');
        return docNum;
      } else {
        throw new Error('Failed to fetch profile document');
      }
    } catch (err) {
      console.error('Fetch profile document error:', err);
      throw new Error('Error occured while fetching profile document');
    }
  }

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      // if (currentStatus === 'pending') {
      // If pdfGenerator is async (returns a promise) – await it
      await pdfGenerator({ requestType: 'preview', userDetails, setIsDownloading });
      // } else {
      //   // Signed PDF branch
      //   const resp = await axiosInstance.post('/file-uploader/fetch-signed-pdf', {
      //     pen_number: userDetails.personal_details.PEN,
      //   }, { responseType: 'blob' });

      //   if (resp.status === 200) {
      //     const pdfBlob = new Blob([resp.data], { type: 'application/pdf' });
      //     const fileName = `${userDetails.full_name.replace(/ /g, "_")}_profile.pdf`;
      //     downloadFile(pdfBlob, fileName);
      //   } else {
      //     toast.error(resp.data.detail || 'Failed to fetch signed PDF');
      //   }
      // }
    } catch (error) {
      console.error('PDF generation/download error:', error);
      toast.error('Failed to generate or download PDF');
    } finally {
      setIsDownloading(false); // ✅ Only now the loader is hidden
    }
  };

  const handleDownloadSignedPdf = async () => {
    setIsDownloading(true);
    try {
      const resp = await axiosInstance.post('/file-uploader/fetch-signed-pdf', {
        pen_number: getDisplayValue(userDetails.personal_details.PEN),
      }, { responseType: 'blob' });

      if (resp.status === 200) {
        const pdfBlob = new Blob([resp.data], { type: 'application/pdf' });
        const fileName = `${userDetails.full_name.replace(/ /g, "_")}_profile.pdf`;
        downloadFile(pdfBlob, fileName);
      } else {
        toast.error(resp.data.detail || 'Failed to fetch signed PDF');
      }
    } catch (error) {
      console.error('Signed PDF download error:', error);
      toast.error('Failed to download signed PDF');
    } finally {
      setIsDownloading(false);
    }
  }

  const handleConfirmAction = async () => {
    setShowConfirmationModal(false);
    setShowOtpModal(true);
    const response = await axiosInstance.post('evc/otp/request', {
      phone: mobile,
      actor: String(fullName),
      role: roleId,
    });
    if (response.data.success) {
      setOtpId(response.data.data?.otp_id)
    }
    // setSignerPortModalOpen(true);
  };

  const handleOtpVerfication = async (otp) => {
    setIsOtpClicked(true);

    try {
      const response = await axiosInstance.post('evc/otp/verify', {
        otp_id: otpId,
        otp,
        actor: String(fullName),
      });

      if (response.data.success) {
        setShowOtpModal(false);
        toast.success('OTP Verified');
        await handleSubmitAction(); // optional await
      } else {
        toast.error('OTP verification failed');
      }
    } catch (error) {
      // console.error(error);
      toast.error(error.response?.data?.detail || 'OTP verification failed');
    } finally {
      setIsOtpClicked(false);
    }
  };


  // const handleSubmitAction = async (portNumber) => {
  const handleSubmitAction = async () => {
    if (!allowedActions.some((item) => item.action_key === confirmationAction)) {
      toast.error('Invalid action. Please select a valid workflow action.');
      setShowConfirmationModal(false);
      setConfirmationAction('');
      return;
    }

    setIsSubmitting(true);
    let pdfFile = null;
    let docNum = null;

    try {
      const remark = getRemarkForAction(confirmationAction);

      if (['resubmit', 'resubmit_after_approval'].includes(confirmationAction)) {
        docNum = await fetchOfficerProfileDocument();
      }
      const pdfParams = {
        requestType: 'submit',
        userDetails,
        setIsDownloading,
        ...(['resubmit', 'resubmit_after_approval'].includes(confirmationAction) && docNum && { documentNumber: docNum }),
      };

      const pdfGen = await pdfGenerator(pdfParams);
      if (!pdfGen.success || !pdfGen.file) {
        throw new Error(pdfGen.message || 'PDF generation failed');
      }

      pdfFile = pdfGen.file;
      docNum = pdfGen.docNum ?? docNum;
      const formData = new FormData();
      formData.append("file", pdfFile);
      const responsefileUpload = await axiosInstanceFile.post('evc/documents/upload', formData);

      if (responsefileUpload.data.detail === "Document Uploaded") {
        // let doc_id=responsefileUpload.data.doc_id
        const signresponse = await axiosInstance.post('evc/esign/start', {
          otp_id: otpId,
          doc_id: responsefileUpload.data.data.doc_id,
          actor: String(fullName),
          reason: "ER Profile Submitted"
        });
        if (!signresponse.data.signed) {
          throw new Error('Document signing failed');
        }
        const signfile = await axiosInstance.get(`evc/documents/${responsefileUpload.data.data.doc_id}/signed`,
          {
            responseType: "blob"
          });
        const blob = new Blob([signfile.data], { type: "application/pdf" });
        const signedFile = new File(
          [blob],
          pdfFile.name.replace(/\.pdf$/i, "_signed.pdf"),
          { type: "application/pdf" }
        );

        await saveDocument(
          signedFile,
          confirmationAction,
          docNum,
          aisPerId
        );

        const url = window.URL.createObjectURL(blob);

        window.open(url, "_blank");
      }

      const response = await axiosInstance.post('/officer/profile-status', {
        ais_per_id: String(aisPerId),
        action: confirmationAction,
        remarks: remark,
      });

      await refreshOfficerProfile();
      await fetchWorkflowContext();

      toast.success(
        `${(allowedActions.find((item) => item.action_key === confirmationAction)?.label || confirmationAction).replace(/_/g, ' ')} completed successfully!`
      );

      setShowConfirmationModal(false);
      setIsConsentChecked(true);
      setIsConsentDisabled(true);
    } catch (err) {
      const msg = err.message || 'Unknown error';
      if (['Network request failed', 'Request timed out', 'NetworkError when attempting to fetch resource.'].includes(msg)) {
        toast.error('Please start the digital signature service');
      } else if (msg === 'Certificate not found!') {
        toast.error('Token device not detected. Please connect your token device and try again.');
      } else {
        toast.error(`Failed to perform ${confirmationAction} action: ${msg}`);
      }
    } finally {
      setIsSubmitting(false);
      setConfirmationAction('');
      setIsDownloading(false);
    }
  };

  const refreshOfficerProfile = async () => {
    const res = await axiosInstance.get('/officer/officer-preview');
    if (res.data.success) {
      const officerData = res.data.data.officer_data;
      const transformed = transformOfficerData(officerData);
      setUserDetails(transformed);
      setIsDownloading(true);
    }
  };

  useEffect(() => {
    if (!latestStatus?.action_key) return;
    setCurrentStatus(latestStatus.action_key.toLowerCase());
  }, [latestStatus?.action_key]);


  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <ExclamationCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  if (!userDetails) return <div className="text-center py-10">No officer data found</div>;

  // const latestStatus = statusTimeline.find(status => status.is_current) || statusTimeline[statusTimeline.length - 1] || {};
  // const currentDisplayStatus = latestStatus.action_key ? getDisplayStatus(latestStatus.action_key) : userDetails?.personal_details?.Status || 'Pending';
  // const isResubmitAllowed = latestStatus.action_key === 'return_for_correction';
  // const isSubmitAllowed = statusTimeline.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 dark:text-gray-100">

      <div className=" mx-auto p-4 sm:p-6 lg:p-8">

        {isDownloading && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            data-pdf-overlay
            data-html2canvas-ignore="true"
          >
            <div className="bg-white rounded-xl p-8 shadow-2xl max-w-sm w-full mx-4 dark:bg-gray-800 dark:border dark:border-gray-700">
              <div className="flex flex-col items-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <DocumentTextIcon className="w-8 h-8 text-indigo-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2 dark:text-gray-100">Generating PDF</h3>
                <p className="text-gray-600 text-center mb-6 dark:text-gray-300">Please wait while we prepare your document...</p>
              </div>
            </div>
          </div>
        )}

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 bg-white border border-indigo-300 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-700"
          >
            <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" strokeWidth={2.5} />
            Back
          </button>

          <div className="flex items-center gap-3">

            {/* Updated Download PDF button with profile_status check */}
            {(currentStatus === 'pending' || currentStatus === 'return_for_correction') && (
              <button
                onClick={() => handleDownloadPdf()}
                // onClick={() => pdfGenerator({ requestType: 'preview', userDetails, setIsDownloading })}
                disabled={isDownloading}
                className={`flex items-center gap-2 border text-sm font-medium px-4 py-2.5 rounded-lg transition-all shadow-sm ${isDownloading
                  ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500'
                  : 'bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400 dark:bg-gray-800 dark:border-gray-700 dark:text-indigo-300 dark:hover:bg-gray-700'
                  }`}
              // title={isDownloadDisabled ? "Profile must be submitted first" : "Download PDF"}
              >
                {isDownloading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Downloading...
                  </>
                ) : (
                  <>
                    <ArrowDownTrayIcon className="w-4 h-4" strokeWidth={2.5} />
                    Download PDF
                  </>
                )}
              </button>
            )}
            {currentStatus !== 'pending' && (
              <button
                onClick={() => handleDownloadSignedPdf()}
                // onClick={() => pdfGenerator({ requestType: 'preview', userDetails, setIsDownloading })}
                disabled={isDownloading}
                className={`flex items-center gap-2 border text-sm font-medium px-4 py-2.5 rounded-lg transition-all shadow-sm ${isDownloading
                  ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500'
                  : 'bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400 dark:bg-gray-800 dark:border-gray-700 dark:text-indigo-300 dark:hover:bg-gray-700'
                  }`}
              // title={isDownloadDisabled ? "Profile must be submitted first" : "Download PDF"}
              >
                {isDownloading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Downloading...
                  </>
                ) : (
                  <>
                    <ArrowDownTrayIcon className="w-4 h-4" strokeWidth={2.5} />
                    Signed PDF
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="mb-3 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-cyan-50 px-4 py-2.5 sm:px-5 sm:py-3 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-4">
            <div className="space-y-1">
              <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                About This Profile Preview
              </h2>
              <p className="text-xs sm:text-sm text-slate-800 leading-5 dark:text-gray-300">
                This page shows only saved Karmasri data. After saving all ER sections, updates appear here. For SPARK-sourced and mandatory fields, open SPARK Preview; for corrections, go to ER Profile.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[320px] sm:flex-row">
              <button
                onClick={() => router.push("/er-profile/spark-preview")}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-indigo-300 text-indigo-700 text-xs sm:text-sm font-medium hover:bg-indigo-50 transition-colors whitespace-nowrap dark:bg-gray-800 dark:border-gray-700 dark:text-indigo-300 dark:hover:bg-gray-700"
              >
                Open SPARK Preview
              </button>
              <button
                onClick={() => router.push("/er-profile")}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 text-white text-xs sm:text-sm font-medium hover:bg-indigo-700 transition-colors whitespace-nowrap"
              >
                <span>Go to ER Profile</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Profile Card */}
        <div ref={contentRef} className="bg-white shadow-xl rounded-2xl overflow-hidden border border-indigo-300 dark:bg-gray-800 dark:border-gray-700">
          {/* Compact Professional Header */}
          <div className="relative bg-gradient-to-r from-indigo-900 via-indigo-500 to-indigo-900 text-white overflow-hidden">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full -ml-16 -mb-16"></div>
            </div>

            <div className="relative z-10 px-6 py-6">
              <div className="flex flex-col lg:flex-row items-center lg:items-center gap-4">
                {/* Profile Image */}
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 rounded-xl bg-white/10 backdrop-blur-sm p-0.5 shadow-lg border border-white/20">
                    <div className="w-full h-full rounded-lg overflow-hidden bg-slate-100">
                      <img
                        src={userDetails.profile_image || DEFAULT_AVATAR}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = DEFAULT_AVATAR;
                        }}
                      />
                    </div>
                  </div>
                  {currentDisplayStatus === 'Verified' && (
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 shadow-lg border-2 border-white">
                      <CheckBadgeIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
                    </div>
                  )}
                </div>

                {/* Officer Details */}
                <div className="flex-1 text-center lg:text-left">
                  <h1 className="text-2xl font-bold mb-1 drop-shadow-lg">{userDetails.full_name}</h1>
                  <p className="text-indigo-100 text-sm mb-3 drop-shadow">
                    {userDetails.position === "IAS" ? "Indian Administrative Service (IAS)" :
                      userDetails.position === "IFS" ? "Indian Forest Service (IFS)" :
                        userDetails.position === "IPS" ? "Indian Police Service (IPS)" :
                          userDetails.position}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                    <span className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium border border-white/20">
                      {getDisplayValue(userDetails.personal_details["Karmasri ID"])}
                    </span>

                    {/* Enhanced Current Status Display */}
                    <div className="relative group">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm flex items-center gap-1.5 ${getStatusColor(currentDisplayStatus)}`}>
                        {/* Status Icon */}
                        {currentDisplayStatus === 'Verified' && (
                          <CheckCircleIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
                        )}
                        {currentDisplayStatus === 'Submitted' && (
                          <ArrowDownTrayIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
                        )}
                        {currentDisplayStatus === 'Resubmitted' && (
                          <ExclamationCircleIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
                        )}
                        {currentDisplayStatus === 'Returned for Correction' && (
                          <XMarkIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
                        )}
                        {currentDisplayStatus === 'Pending' && (
                          <div className="w-3.5 h-3.5 border-2 border-current rounded-full animate-pulse" />
                        )}

                        {/* Status Text */}
                        <span className="font-bold">
                          {currentDisplayStatus}
                        </span>

                        {/* Status Badge */}
                        {/* {currentDisplayStatus === 'Verified' && (
                          <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-bold">
                            COMPLETED
                          </span>
                        )} */}
                        {currentDisplayStatus === 'Returned for Correction' && (
                          <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-bold">
                            ACTION REQUIRED
                          </span>
                        )}
                      </span>

                      {/* Status Tooltip - Fixed z-index */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap shadow-xl border border-slate-700">
                        <div className="font-semibold mb-1">Application Status</div>
                        <div className="text-slate-300">Current: {currentDisplayStatus}</div>
                        <div className="w-2 h-2 bg-slate-900 absolute -bottom-1 left-1/2 transform -translate-x-1/2 rotate-45 border-b border-r border-slate-700"></div>
                      </div>
                    </div>

                    {/* Progress Indicator for Incomplete Status */}
                    {(currentDisplayStatus === 'Pending' || currentDisplayStatus === 'Returned for Correction') && progress < 100 && (
                      <span className="bg-amber-500/20 text-amber-200 px-3 py-1.5 rounded-full text-xs font-medium border border-amber-400/30 flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                        Profile {progress}% Complete
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Animated bottom border */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-indigo-400"></div>
          </div>

          {/* Content Sections */}
          <div className="p-4 sm:p-6 space-y-4 bg-gradient-to-b from-white to-slate-50 dark:from-gray-900 dark:to-gray-800">
            <SourceLegend />
            <ProfessionalSection title="PERSONAL DETAILS" data={userDetails.personal_details} isKeyValue changeLookup={changeLookup} sectionChanges={getSectionChanges(sectionChangeLookup, "PERSONAL DETAILS")} />
            <ProfessionalSection title="ADDRESS DETAILS" data={userDetails.address_details} isAddressList changeLookup={changeLookup} sectionChanges={getSectionChanges(sectionChangeLookup, "ADDRESS DETAILS")} />
            <ModernCardSection title="DEPENDENTS DETAILS" data={userDetails.dependent_details} icon="👥" onViewDocument={openDocumentModal} changeLookup={changeLookup} sectionChanges={getSectionChanges(sectionChangeLookup, "DEPENDENTS DETAILS")} />
            <ModernCardSection title="EDUCATIONAL QUALIFICATIONS" data={userDetails.educational_qualifications} icon="🎓" changeLookup={changeLookup} sectionChanges={getSectionChanges(sectionChangeLookup, "EDUCATIONAL QUALIFICATIONS")} />
            <ModernCardSection title="DEPUTATION DETAILS" data={userDetails.central_deputation} icon="🏛️" changeLookup={changeLookup} sectionChanges={getSectionChanges(sectionChangeLookup, "DEPUTATION DETAILS")} />
            <ModernCardSection title="SERVICE DETAILS" data={userDetails.service_details} icon="💼" changeLookup={changeLookup} sectionChanges={getSectionChanges(sectionChangeLookup, "SERVICE DETAILS")} />
            <ModernCardSection title="TRAINING DETAILS" data={userDetails.training_details} icon="📚" onViewDocument={openDocumentModal} changeLookup={changeLookup} sectionChanges={getSectionChanges(sectionChangeLookup, "TRAINING DETAILS")} />
            <ModernCardSection title="AWARDS AND PUBLICATIONS" data={userDetails.awards_and_publications} icon="🏆" onViewDocument={openDocumentModal} changeLookup={changeLookup} sectionChanges={getSectionChanges(sectionChangeLookup, "AWARDS AND PUBLICATIONS")} />
            <ModernCardSection title="DISABILITY DETAILS" data={userDetails.disability_details} icon="♿" onViewDocument={openDocumentModal} changeLookup={changeLookup} sectionChanges={getSectionChanges(sectionChangeLookup, "DISABILITY DETAILS")} />
            <ModernCardSection title="DISCIPLINARY DETAILS" data={userDetails.disciplinary_details} icon="⚖️" onViewDocument={openDocumentModal} changeLookup={changeLookup} sectionChanges={getSectionChanges(sectionChangeLookup, "DISCIPLINARY DETAILS")} />
            <ModernTimeline title="STATUS TIMELINE" data={statusTimeline} formatDateTime={formatDateTime} />
          </div>
        </div>

        {/* Consent & Action Section */}
        <div className="mt-6 bg-white shadow-lg rounded-xl p-5 sm:p-6 border border-indigo-300 dark:bg-gray-800 dark:border-gray-700">
          <div className="mb-5">
            <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2 dark:text-gray-100">
              <DocumentTextIcon className="w-5 h-5 text-indigo-600" />
              Officer Consent Declaration
            </h3>
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 dark:bg-gray-700 dark:border-gray-600">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={isConsentChecked}
                  onChange={(e) => {
                    if (!isConsentDisabled) {
                      setIsConsentChecked(e.target.checked);
                      if (e.target.checked) setConsentError('');
                    }
                  }}
                  disabled={isConsentDisabled}
                  className={`mt-1 h-5 w-5 text-indigo-600 focus:ring-2 focus:ring-indigo-500 rounded border-indigo-400 ${isConsentDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                />
                <span className="text-sm text-slate-700 leading-relaxed dark:text-gray-200">
                  I hereby confirm that all the information provided in this profile is accurate and complete to the best of my knowledge. I consent to the submission of this profile for verification and further processing by the authorized personnel.
                </span>
              </label>
            </div>
            {isConsentDisabled && (
              <p className="mt-3 text-sm text-emerald-600 flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4" />
                Consent recorded and locked after submission
              </p>
            )}
            {consentError && !isConsentDisabled && (
              <p className="mt-3 text-sm text-red-600 flex items-center gap-2">
                <ExclamationCircleIcon className="w-4 h-4" />
                {consentError}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          {hasDuplicateServicePeriods && (
            <div className="mb-5 rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/30">
              <div className="flex items-start gap-3">
                <ExclamationCircleIcon className="mt-0.5 h-5 w-5 text-amber-600 dark:text-amber-300" />
                <div>
                 <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
  Duplicate service period found ,Review Needed.
</p>
<p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
  Multiple saved service records exist for the same main service time period. Please review the duplicate cards and remove the extra entry if necessary before proceeding with the profile action.
</p>
                </div>
              </div>
            </div>
          )}
          <InlineChangeSummary changePreview={changePreview} workflowContext={workflowContext} />
          <div className="flex flex-col sm:flex-row gap-3">
            {visibleActions.map((action) => {
              const disabled = isSubmitting || isDownloading || progress < 100 || hasDuplicateServicePeriods || action.enabled === false;
              const isBusy = isSubmitting && confirmationAction === action.action_key;
              return (
                <button
                  key={action.action_key}
                  onClick={() => handleActionClick(action.action_key)}
                  disabled={disabled}
                  title={action.disabled_reason || action.label}
                  className={`relative flex-1 flex items-center justify-center gap-2 text-sm font-semibold px-5 py-3 rounded-lg transition-all overflow-hidden ${getActionButtonClasses(action.button_style, disabled)}`}
                >
                  {progress < 100 && (
                    <div
                      className="absolute left-0 top-0 h-full bg-white/20 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {isBusy ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="w-5 h-5" strokeWidth={2.5} />
                        {progress < 100 ? `${action.label} (${progress}%)` : action.label}
                      </>
                    )}
                  </span>
                </button>
              );
            })}

            {visibleActions.length === 0 && (
              <div className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold px-5 py-3 rounded-lg bg-slate-100 text-slate-500 border-2 border-slate-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
                <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                {getCompletionMessage(latestStatus?.action_key || changePreview?.current_cycle_status)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={showConfirmationModal}
        setIsOpen={setShowConfirmationModal}
        onConfirm={handleConfirmAction}
        title={`${(allowedActions.find((item) => item.action_key === confirmationAction)?.label || 'Submit')} Officer Profile`}
        message={
          <div>
            OTP has been sent to your registered email ID and mobile number. Please proceed to verify.
            <div className="mt-3" />
            <strong>Remark:</strong> {getRemarkForAction(confirmationAction)}
          </div>
        }
        // iconType={confirmationAction === 'submit' ? 'success' : 'warning'}
        iconType="successs"
        confirmText={isSubmitting ? 'Submitting...' : 'Send OTP'}
      />
      <OTPModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onVerify={handleOtpVerfication}
        onResend={handleConfirmAction}
        title="EVC OTP Verification"
        description='Enter OTP'
        isLoading={isOtpClicked}
      />

      <SignerPortModal
        isOpen={signerPortModalOpen}
        setIsOpen={setSignerPortModalOpen}
        onClose={() => setSignerPortModalOpen(false)}
        onSubmit={(portNumber) => { handleSubmitAction(portNumber) }}
      />

      {/* Enhanced Document Viewer Modal */}
      {documentModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col animate-slideUp dark:bg-gray-800 dark:border dark:border-gray-700">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-indigo-300 bg-slate-50 dark:bg-gray-700 dark:border-gray-600">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center dark:bg-gray-600">
                  <DocumentTextIcon className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-gray-100">Document Viewer</h3>
                  {documentData && documentData.length > 0 && (
                    <p className="text-sm text-slate-500 dark:text-gray-300">
                      {documentData[currentDocIndex].name} ({currentDocIndex + 1} of {documentData.length})
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={closeDocumentModal}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-200 transition-colors text-slate-500 hover:text-slate-700 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-600"
              >
                <XMarkIcon className="w-6 h-6" strokeWidth={2} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-hidden bg-slate-100 dark:bg-gray-900">
              {loadingDocument && (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
                  <p className="text-slate-600 dark:text-gray-300">Loading document...</p>
                </div>
              )}
              {documentError && (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <ExclamationCircleIcon className="w-16 h-16 text-red-500" />
                  <p className="text-red-600 font-medium">{documentError}</p>
                </div>
              )}
              {documentData && documentData.length > 0 && !loadingDocument && (
                <div className="h-full p-4 overflow-auto">
                  {(() => {
                    const currentDoc = documentData[currentDocIndex];
                    if (currentDoc.isPdf) {
                      return (
                        <embed
                          src={currentDoc.url}
                          type="application/pdf"
                          className="w-full h-full rounded-lg shadow-lg"
                        />
                      );
                    } else {
                      return (
                        <div className="flex items-center justify-center h-full">
                          <img
                            src={currentDoc.url}
                            alt={currentDoc.name}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                          />
                        </div>
                      );
                    }
                  })()}
                </div>
              )}
            </div>

            {/* Modal Footer with Navigation */}
            {documentData && documentData.length > 1 && (
              <div className="p-4 border-t border-indigo-300 bg-slate-50 flex items-center justify-between dark:bg-gray-700 dark:border-gray-600">
                <button
                  onClick={() => setCurrentDocIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentDocIndex === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-indigo-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                  Previous
                </button>
                <div className="flex items-center gap-2">
                  {documentData.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentDocIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${index === currentDocIndex ? 'bg-indigo-600 w-6' : 'bg-slate-300 hover:bg-slate-400'
                        }`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setCurrentDocIndex(prev => Math.min(documentData.length - 1, prev + 1))}
                  disabled={currentDocIndex === documentData.length - 1}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-indigo-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
                >
                  Next
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Professional Section Component (for key-value data)
const ProfessionalSection = ({ title, data, isKeyValue = false, isAddressList = false, changeLookup = new Map(), sectionChanges = [] }) => {
  if (!data || (Array.isArray(data) && !data.length)) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-indigo-300 overflow-visible dark:bg-gray-800 dark:border-gray-700">
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-500 to-indigo-900 px-5 py-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold text-base text-white tracking-wide">{title}</h2>
          <SectionChangeBadge sectionChanges={sectionChanges} compact />
        </div>
      </div>

      <div className="p-4">
        {isKeyValue ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {Object.entries(data).map(([key, value]) => {
              const displayValue = getDisplayValue(value) || "N/A";
              const source = value && typeof value === 'object' ? value.source : null;
              const matchedChange = (changeLookup.get(normalizeChangeKey(key)) || [])[0] || null;
              return (
              <div key={key} className="flex min-w-0 flex-col rounded-lg border border-indigo-300 overflow-visible transition-shadow hover:shadow-sm sm:flex-row dark:border-gray-700">
                <div className="w-full break-words bg-indigo-50 p-2.5 text-sm font-semibold text-slate-700 border-b border-indigo-300 sm:w-2/5 sm:border-b-0 sm:border-r dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                  {key}
                </div>
                <div className="w-full min-w-0 bg-white p-2.5 text-sm text-slate-600 sm:w-3/5 dark:bg-gray-800 dark:text-gray-100">
                  <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
                    <span className="min-w-0 flex-1 break-words">{displayValue}</span>
                    <div className="flex items-center gap-2">
                      <ChangedFieldBadge change={matchedChange} />
                      <SourceIndicator source={source} />
                    </div>
                  </div>
                </div>
              </div>
            )})}
          </div>
        ) : isAddressList ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.map((item, index) => (
              <div key={index} className="border border-indigo-300 rounded-lg p-3 bg-indigo-50 hover:shadow-sm transition-shadow dark:bg-gray-700 dark:border-gray-600">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm font-semibold text-slate-700 dark:text-gray-200">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="w-1 h-4 bg-indigo-600 rounded-full"></div>
                    <span className="break-words">{item.title}</span>
                  </div>
                  <SourceIndicator source={item.source} />
                </div>
                <div className="pl-3 text-sm leading-relaxed text-slate-600 break-words dark:text-gray-300">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

// Modern Card Section Component
const ModernCardSection = ({ title, data, icon, onViewDocument, changeLookup = new Map(), sectionChanges = [] }) => {
  const formatFieldName = (key) => {
    const fieldLabelMap = {
      udid_number: "UDID Document Number",
    };

    if (fieldLabelMap[key]) {
      return fieldLabelMap[key];
    }

    return key
      .replace(/_/g, " ")
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  if (!data || data.length === 0) return null;
  const serviceDuplicateMetaMap = title === "SERVICE DETAILS" ? getServiceDuplicateMetaMap(data) : new Map();
  const hasServiceDuplicates = serviceDuplicateMetaMap.size > 0;
  const getServiceDuplicateMeta = (item) => {
    if (title !== "SERVICE DETAILS") return null;
    const key = getServiceDuplicateKey(item);
    if (!key) return null;
    return serviceDuplicateMetaMap.get(key) || null;
  };

  const getCardTitle = (item, index) => {
    if (item.relation) {
      const isDeceased = item.is_alive === false || item.death_date;
      const isDivorced = item.divorce_date || item.relation.includes('Divorced');
      const isCurrentSpouse = item.relation.includes('Current') || (item.relation === 'Spouse' && !isDeceased && !isDivorced);

      let status = '';
      if (isDeceased) status = ' (Deceased)';
      else if (isDivorced) status = ' (Divorced)';
      else if (isCurrentSpouse) status = ' (Current)';
      else if (item.is_from_history) status = ' (Previous)';

      let title = `${item.relation}${status} - ${item.name}`;
      if (isDeceased && item.death_date) {
        title += ` (Died: ${formatDate(item.death_date)})`;
      }

      return title;
    }
    if (item.qualification) return item.qualification;
    if (item.designation) return item.designation;
    if (item.training_name) return item.training_name;
    if (item.award_name) return item.award_name;
    if (item.disability_type) return item.disability_type;
    if (item.suspension_reason) return `Disciplinary Case ${index + 1}`;
    return `Entry ${index + 1}`;
  };

  const getCardTitleSource = (item) => {
    if (!item?._fieldSources) return null;
    if (item.qualification) return item._fieldSources.qualification;
    if (item.designation) return item._fieldSources.designation;
    if (item.training_name) return item._fieldSources.training_name;
    if (item.award_name) return item._fieldSources.award_name;
    if (item.disability_type) return item._fieldSources.disability_type;
    return null;
  };

  const getCardChanges = (cardTitle, displayFields) => {
    if (!sectionChanges.length) return [];

    const titleKey = normalizeChangeKey(cardTitle);
    const fieldKeys = Object.keys(displayFields).map((key) => normalizeChangeKey(key));
    const fieldValues = Object.values(displayFields)
      .map((value) => normalizeChangeKey(getDisplayValue(value)))
      .filter(Boolean);

    return sectionChanges.filter((change) => {
      const changeFieldKey = normalizeChangeKey(change?.field_label || change?.field);
      const normalizedNewValue = normalizeChangeKey(change?.new_value);
      const normalizedOldValue = normalizeChangeKey(change?.old_value);
      const normalizedPath = normalizeChangeKey(change?.path);

      if (fieldKeys.includes(changeFieldKey)) {
        return true;
      }

      if (titleKey && (normalizedNewValue.includes(titleKey) || normalizedOldValue.includes(titleKey) || normalizedPath.includes(titleKey))) {
        return true;
      }

      return fieldValues.some((value) =>
        value &&
        (
          normalizedNewValue.includes(value) ||
          normalizedOldValue.includes(value)
        )
      );
    });
  };

  const getDocumentIds = (item) => {
    const docs = [];

    // For dependents, check all document fields
    if (item.relation) {
      if (item.death_certificate) docs.push(item.death_certificate);
      if (item.marriage_certificate_proof) docs.push(item.marriage_certificate_proof);
      if (item.sup_doc_for_remv) docs.push(item.sup_doc_for_remv);
    }
    // For other sections
    else if (item.documentIds) {
      docs.push(...item.documentIds);
    } else if (item.documentId) {
      docs.push(item.documentId);
    }

    return docs.filter(Boolean); // Remove null/undefined
  };

  const getDisplayFields = (item) => {
    const fields = {};
    const setField = (label, value, source = null) => {
      fields[label] = createPreviewField(value, source);
    };

    // For dependents, create custom display fields
    if (item.relation) {
      setField("Name", item.name, item._fieldSources?.name);
      setField("Date of Birth", formatDate(item.date_of_birth), item._fieldSources?.date_of_birth);
      setField("Gender", item.gender, item._fieldSources?.gender);

      // Only show email and mobile if they have values
      if (item.email && item.email !== "N/A") setField("Email", item.email, item._fieldSources?.email);
      if (item.mobile_number && item.mobile_number !== "N/A") setField("Mobile", item.mobile_number, item._fieldSources?.mobile_number);

      if (item.ais_officer === 'Yes' || item.ais_officer === true) {
        setField("AIS Officer", "Yes", item._fieldSources?.ais_officer);
      }
      if (item.government_servant === 'Yes' || item.government_servant === true) {
        setField("Government Servant", "Yes", item._fieldSources?.government_servant);
      }
      if (item.institution && item.institution !== "N/A") {
        setField("Institution", item.institution, item._fieldSources?.institution);
      }
      if (item.occupation && item.occupation !== "N/A") {
        setField("Occupation", item.occupation, item._fieldSources?.occupation);
      }

      // Add status fields for spouses
      const isSpouse = item.relation.toLowerCase().includes('spouse');
      if (isSpouse) {
        if (item.is_alive === false || item.death_date) {
          setField("Status", "Deceased", item._fieldSources?.status);
          if (item.death_date) {
            setField("Date of Death", formatDate(item.death_date), item._fieldSources?.death_date);
          }
        } else if (item.divorce_date || item.relation.includes('Divorced')) {
          setField("Status", "Divorced", item._fieldSources?.status);
          if (item.divorce_date) {
            setField("Date of Divorce", formatDate(item.divorce_date), item._fieldSources?.divorce_date);
          }
        } else if (item.relation.includes('Current') || item.relation === 'Spouse') {
          setField("Status", "Current", item._fieldSources?.status);
        }
      }

      // Add parent info for children
      const isChild = item.relation?.toLowerCase().includes('son') ||
        item.relation?.toLowerCase().includes('daughter') ||
        item.relation?.toLowerCase().includes('child');
      if (isChild && item.parent_name && item.parent_name !== "N/A") {
        setField("Parent", item.parent_name, item._fieldSources?.parent_name);
      }

      // Add Date Of Death for deceased dependents (non-spouse)
      if (!isSpouse && (item.is_alive === false || item.death_date)) {
        setField("Status", "Deceased", item._fieldSources?.status);
        if (item.death_date) {
          setField("Date of Death", formatDate(item.death_date), item._fieldSources?.death_date);
        }
      }

      // Add previous spouse indicator
      if (item.is_from_history) {
        setField("Type", "Previous Relationship", item._fieldSources?.type);
      }
    } else {
      // For other sections, use existing logic
      Object.entries(item)
        .filter(([key]) => !['_fieldSources', 'documentId', 'documentIds', 'death_certificate', 'marriage_certificate_proof', 'sup_doc_for_remv', 'is_alive', 'death_date', 'divorce_date', 'father_id', 'mother_id', 'spouse_id', 'parent_name', 'is_from_history'].includes(key))
        .forEach(([key, value]) => {
          // Format date fields in other sections too
          if (typeof value === 'string' && (value.includes('-') || value.includes('/'))) {
            try {
              const formattedValue = formatDate(value);
              if (formattedValue !== 'N/A') {
                setField(formatFieldName(key), formattedValue, item._fieldSources?.[key]);
                return;
              }
            } catch (e) {
              // If date parsing fails, use original value
            }
          }
          setField(formatFieldName(key), value, item._fieldSources?.[key]);
        });
    }

    return fields;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const rawValue = String(dateString).trim();
      if (!rawValue) return "N/A";

      const datePart = rawValue.split(" ")[0];

      if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
        return formatDateToDDMMYYYY(datePart);
      }

      if (/^\d{2}\/\d{2}\/\d{4}$/.test(datePart)) {
        return datePart;
      }

      if (/^\d{2}-\d{2}-\d{4}$/.test(datePart)) {
        const [day, month, year] = datePart.split("-");
        return `${day}/${month}/${year}`;
      }

      const date = new Date(rawValue);
      if (isNaN(date.getTime())) return "N/A";

      const isoDate = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
      ].join('-');

      return formatDateToDDMMYYYY(isoDate);
    } catch (error) {
      console.error("Date formatting error:", error);
      return "N/A";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-indigo-300 overflow-visible dark:bg-gray-800 dark:border-gray-700">
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-500 to-indigo-900 px-5 py-3 flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <h2 className="font-bold text-base text-white tracking-wide">{title}</h2>
        <SectionChangeBadge sectionChanges={sectionChanges} compact />
        <span className="ml-auto bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium text-white border border-white/30">
          {data.length}
        </span>
      </div>

      <div className="p-4">
        {hasServiceDuplicates && (
          <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
            Some duplicated time period service records are detected. Please remove any one saved duplicate card.
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {data.map((item, index) => {
            const docsArray = getDocumentIds(item);
            const cardTitle = getCardTitle(item, index);
            const cardTitleSource = getCardTitleSource(item);
            const duplicateMeta = getServiceDuplicateMeta(item);
            const isDuplicateService = Boolean(duplicateMeta);
            const displayFields = getDisplayFields(item);
            const cardChanges = getCardChanges(cardTitle, displayFields);
            const cardHasNewContent = sectionHasAddedContent(cardChanges);

            return (
              <div key={index} className={`border rounded-lg p-3 bg-gradient-to-br hover:shadow-md transition-all dark:from-gray-800 dark:to-gray-700 ${
                isDuplicateService
                  ? 'border-amber-300 bg-amber-50/70 hover:border-amber-400 dark:border-amber-600 dark:bg-amber-900/10'
                  : 'border-indigo-300 from-white to-indigo-50/30 hover:border-indigo-300 dark:border-gray-700'
              }`}>
                <div className="mb-2.5 flex flex-col gap-2 border-b border-indigo-300 pb-2.5 sm:flex-row sm:items-start sm:justify-between dark:border-gray-600">
                  <div className="flex min-w-0 flex-1 items-start gap-2">
                    <h3 className="min-w-0 flex-1 break-words text-sm font-bold text-slate-800 dark:text-gray-100">
                      {cardTitle}
                    </h3>
                    {cardChanges.length > 0 && (
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                        cardHasNewContent
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
                          : 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200'
                      }`}>
                        <CheckBadgeIcon className="h-3.5 w-3.5" />
                        {cardHasNewContent ? 'Added' : 'Changed'}
                      </span>
                    )}
                    <SourceIndicator source={cardTitleSource} />
                  </div>
                  {docsArray.length > 0 && (
                    <button
                      onClick={() => onViewDocument && onViewDocument(docsArray)}
                      className="inline-flex w-full items-center justify-center gap-1 self-start rounded-md bg-gradient-to-r from-indigo-600 to-indigo-700 px-2.5 py-1 text-xs font-medium text-white shadow-sm transition-all hover:from-indigo-700 hover:to-indigo-800 sm:ml-2 sm:w-auto"
                    >
                      <DocumentTextIcon className="w-3.5 h-3.5" />
                      {docsArray.length > 1 ? `${docsArray.length} docs` : 'View Doc'}
                    </button>
                  )}
                </div>
                {isDuplicateService && (
                  <div className="mb-2 rounded-md border border-amber-300 bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800 dark:border-amber-600 dark:bg-amber-900/30 dark:text-amber-200">
                    Duplicate period detected. Delete any one saved duplicate card.
                  </div>
                )}

                  <div className="space-y-1.5">
                    {Object.entries(displayFields)
                    .filter(([key, value]) => getDisplayValue(value) && getDisplayValue(value) !== "N/A" && getDisplayValue(value) !== "")
                    .map(([key, value]) => {
                      const matchedChange = (changeLookup.get(normalizeChangeKey(key)) || [])[0] || null;
                      return (
                      <div key={key} className="flex min-w-0 flex-col gap-1 text-xs sm:flex-row sm:gap-2">
                        <span className="w-full flex-shrink-0 break-words font-medium text-slate-600 sm:w-2/5 dark:text-gray-300">
                          {key}:
                        </span>
                        <div className="flex min-w-0 flex-1 flex-wrap items-start justify-between gap-2">
                          <span className="min-w-0 flex-1 break-words text-slate-800 dark:text-gray-100">
                            {Array.isArray(getDisplayValue(value)) ? getDisplayValue(value).join(', ') : (getDisplayValue(value) || "N/A")}
                          </span>
                          <div className="flex items-center gap-2">
                            <ChangedFieldBadge change={matchedChange} />
                            <SourceIndicator source={value?.source} />
                          </div>
                        </div>
                      </div>
                    )})}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Modern Timeline Component
const ModernTimeline = ({ title, data, formatDateTime }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-indigo-300 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-500 to-indigo-900 px-5 py-3 flex items-center gap-2">
        <span className="text-lg">📋</span>
        <h2 className="font-bold text-base text-white tracking-wide">{title}</h2>
      </div>

      <div className="p-4">
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-400 via-purple-400 to-cyan-400"></div>
          {data.map((status, index) => (
            <div key={index} className="relative flex items-start mb-4 last:mb-0">
              <div className={`absolute left-2.5 w-4 h-4 rounded-full mt-1 z-10 border-2 border-white shadow-md ${status.is_current ? 'bg-emerald-500 animate-pulse' : 'bg-indigo-600'
                }`}></div>
              <div className="ml-10 bg-gradient-to-br from-indigo-50/50 to-white border border-indigo-300 rounded-lg p-4 w-full hover:shadow-md transition-all dark:from-gray-800 dark:to-gray-700 dark:border-gray-600">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2.5 gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800 text-sm capitalize dark:text-gray-100">
                      {status.action_key?.replace(/_/g, ' ') || 'Status'}
                    </h3>
                    {status.is_current && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full border border-emerald-300">
                        CURRENT
                      </span>
                    )}
                  </div>
                  <span className="text-slate-500 text-xs font-medium bg-white px-2.5 py-1 rounded-md border border-indigo-300 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300">
                    {status.event_time ? formatDateTime(status.event_time) : 'N/A'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-slate-600 text-xs dark:text-gray-300">
                  <div className="space-y-1.5">
                    <p className="flex items-start gap-2">
                      <span className="font-semibold text-slate-700 min-w-fit dark:text-gray-200">Remarks:</span>
                      <span className="break-words">{status.remarks || 'N/A'}</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="font-semibold text-slate-700 min-w-fit dark:text-gray-200">Submitted to:</span>
                      <span className="break-words">{status.assigned_to_role_name || 'N/A'}</span>
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="flex items-start gap-2">
                      <span className="font-semibold text-slate-700 min-w-fit dark:text-gray-200">Flow:</span>
                      <span className="break-words">{getStatusFlowLabel(status)}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePreviewPage;
