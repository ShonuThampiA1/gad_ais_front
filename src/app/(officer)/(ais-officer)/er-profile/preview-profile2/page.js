"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownTrayIcon,
  CheckBadgeIcon,
  ArrowLeftIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import axiosInstance from "@/utils/apiClient";
import ConfirmModal from "../../../../components/confirmModal";
import SignerPortModal from "../../../../components/SignerPortModal";
import pdfGenerator from "../../../../../utils/pdfGenerator";
import { toast } from "react-toastify";

// Utility to safely get nested value
const get = (obj, path, defaultValue = "N/A") => {
  try {
    return path.split(".").reduce((o, k) => (o || {})[k], obj) ?? defaultValue;
  } catch {
    return defaultValue;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return "N/A";
  }
};

// Helper to normalize strings for reliable deduplication
const normalize = (str) => (str || "").trim().toLowerCase().replace(/\s+/g, " ");

// Create a strong unique key for deduplication
const createUniqueKey = (item, sectionType) => {
  const norm = (v) => normalize(v);

  switch (sectionType) {
    case "education":
      // qualification + institute + subject + year
      return `${norm(item.qualification || item.course_title || "")}_${norm(item.institute || item.university || item.institute_name || "")}_${norm(item.subject || "")}_${item.year || ""}`;

    case "service":
    case "experience":
      return `${norm(item.designation || "")}_${norm(item.department || item.organization || "")}_${norm(item.office || "")}_${item.start_date || item.date_from || ""}`;

    case "central_deputation":
      return `${norm(item.designation || "")}_${norm(item.ministry || item.department || "")}_${item.start_date || ""}`;

    case "training":
      return `${norm(item.training_name || "")}_${norm(item.institute || "")}_${item.start_date || ""}`;

    case "awards":
      return `${norm(item.award_name || "")}_${item.year || ""}_${norm(item.organization || "")}`;

    case "disability":
      return `${norm(item.disability_type || "")}_${item.percentage || ""}`;

    case "disciplinary":
      return `${norm(item.suspension_reason || item.case_type || "")}_${item.start_date || ""}`;

    case "dependent":
      return `${norm(item.relation || "")}_${norm(item.name || "")}_${item.date_of_birth || ""}`;

    default:
      return JSON.stringify(item);
  }
};

// Deduplication function
const deduplicateArray = (array, sectionType) => {
  if (!array || !Array.isArray(array)) return [];

  const seen = new Set();
  return array.filter((item) => {
    const key = createUniqueKey(item, sectionType);
    if (seen.has(key)) {
      // console.log(`Duplicate filtered in ${sectionType}: ${key}`);
      return false;
    }
    seen.add(key);
    return true;
  });
};

const ProfilePreviewPage = () => {
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [signerPortModalOpen, setSignerPortModalOpen] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState("");
  const [isConsentChecked, setIsConsentChecked] = useState(false);
  const [isConsentDisabled, setIsConsentDisabled] = useState(false);
  const [consentError, setConsentError] = useState("");
  const [aisPerId, setAisPerId] = useState(null);
  const [statusTimeline, setStatusTimeline] = useState([]);
  const [sparkData, setSparkData] = useState(null);

  const router = useRouter();
  const contentRef = useRef(null);

  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [documentData, setDocumentData] = useState(null);
  const [currentDocIndex, setCurrentDocIndex] = useState(0);
  const [loadingDocument, setLoadingDocument] = useState(false);
  const [documentError, setDocumentError] = useState(null);

  // Merge AIS and SPARK data with strong deduplication
  const transformOfficerData = useCallback((aisData, sparkData) => {
    const officer = aisData?.officer_info?.[0] || {};
    const sparkPersonal = sparkData?.personal_details || {};
    const sparkAddress = sparkData?.address_details || {};
    const sparkEdu = sparkData?.education_details || [];
    const sparkService = sparkData?.service_details || [];
    const sparkFamily = sparkData?.family_details || [];

    // Full name - prefer AIS
    const fullName = officer.first_name && officer.last_name
      ? `${officer.honorifics ? officer.honorifics + " " : ""}${officer.first_name} ${officer.last_name}`.trim()
      : sparkPersonal.name || "N/A";

    // Merged personal details (AIS precedence)
    const mergedPersonal = {
      "Full Name": fullName,
      "Date of Birth": officer.dob ? formatDate(officer.dob) : formatDate(sparkPersonal.date_of_birth),
      "Gender": officer.gender_id === "2" ? "Female" :
                officer.gender_id === "1" ? "Male" :
                sparkPersonal.sex === "F" ? "Female" :
                sparkPersonal.sex === "M" ? "Male" : "N/A",
      "Blood Group": officer.blood_group || sparkPersonal.blood_group || "N/A",
      "Email": officer.email || "N/A",
      "Mobile No": officer.mobile_no || "N/A",
      "Karmasri ID": officer.identity_number || "N/A",
      "PEN": officer.pen_number || sparkPersonal.permanent_emp_no || "N/A",
      "PAN": officer.pan_no || sparkPersonal.pan_number || "N/A",
      "Category": officer.category || sparkPersonal.category || "N/A",
      "Retirement Date": officer.retirement_date ? formatDate(officer.retirement_date) : formatDate(sparkPersonal.retirement_date),
      "Father Name": sparkPersonal.father_name || "N/A",
      "Mother Name": sparkPersonal.mother_name || "N/A",
      "Spouse Name": sparkPersonal.spouse_name || "N/A",
      "Marital Status": sparkPersonal.marital_status === "M" ? "Married" : "N/A",
      "Nationality": sparkPersonal.nationality || "N/A",
    };

    // Address details
    const addressDetails = [
      {
        title: "Official Address",
        value: officer.address_line1_com
          ? [officer.address_line1_com, officer.address_line2_com, officer.district_com, officer.state_com, officer.pin_code_com]
              .filter(Boolean)
              .join(", ")
          : [
              sparkAddress.current_address?.house_name,
              sparkAddress.current_address?.street_name,
              sparkAddress.current_address?.place,
              sparkAddress.current_address?.district,
              sparkAddress.current_address?.state,
              sparkAddress.current_address?.pin,
            ].filter(Boolean).join(", ") || "N/A",
      },
      {
        title: "Permanent Address",
        value: officer.address_line1_per
          ? [officer.address_line1_per, officer.address_line2_per, officer.district_per, officer.state_per, officer.pin_code_per]
              .filter(Boolean)
              .join(", ")
          : [
              sparkAddress.permanent_address?.house_name,
              sparkAddress.permanent_address?.street_name,
              sparkAddress.permanent_address?.place,
              sparkAddress.permanent_address?.district,
              sparkAddress.permanent_address?.state,
              sparkAddress.permanent_address?.pin,
            ].filter(Boolean).join(", ") || "N/A",
      },
    ];

    // Dependent details
    const sparkDependents = sparkFamily.map((dep) => ({
      relation: dep.relation || "Dependent",
      name: dep.name || "N/A",
      date_of_birth: formatDate(dep.dob),
      gender: dep.gender || "N/A",
    }));
    const dependentDetails = deduplicateArray(sparkDependents, "dependent");

    // Educational qualifications - merged with strong deduplication
    const eduFromAIS = (aisData?.ais_edu_qualification || []).map(edu => ({
      qualification: edu.qualification || "N/A",
      institute: edu.institute || "N/A",
      subject: edu.subject || "N/A",
      year: edu.year || "",
    }));

    const eduFromSpark = sparkEdu.map((e) => ({
      qualification: e.course_title || "N/A",
      institute: e.university || e.institute_name || "N/A",
      subject: e.subject || "N/A",
      year: e.year || "",
    }));

    // Sort by year (newest first) before deduplication
    const allEducation = [...eduFromAIS, ...eduFromSpark].sort((a, b) => {
      const yearA = parseInt(a.year || "0");
      const yearB = parseInt(b.year || "0");
      return yearB - yearA;
    });

    const educationalQualifications = deduplicateArray(allEducation, "education");

    // Service details
    const serviceFromAIS = (aisData?.ais_service_history || []).map(s => ({
      designation: s.designation || "N/A",
      department: s.department || "N/A",
      office: s.office || "N/A",
      district: s.district || "N/A",
      start_date: formatDate(s.start_date),
      end_date: formatDate(s.end_date),
      basic_pay: s.basic_pay || "N/A",
      order_no: s.order_no || "N/A",
      order_date: formatDate(s.order_date),
    }));

    const serviceFromSpark = sparkService.map((s) => ({
      designation: s.designation || "N/A",
      department: s.department || "N/A",
      office: s.office || "N/A",
      district: s.district || "N/A",
      start_date: formatDate(s.date_from),
      end_date: formatDate(s.date_to),
      basic_pay: s.basic_pay || "N/A",
      order_no: s.order_no || "N/A",
      order_date: formatDate(s.order_date),
    }));

    const allService = [...serviceFromAIS, ...serviceFromSpark];
    const serviceDetails = deduplicateArray(allService, "service");

    // Other sections
    const centralDeputation = deduplicateArray(aisData?.ais_central_deputation || [], "central_deputation");
    const trainingDetails = deduplicateArray(aisData?.ais_training_info || [], "training");
    const awardsAndPublications = deduplicateArray(aisData?.ais_rewards || [], "awards");
    const disabilityDetails = deduplicateArray(aisData?.ais_officer_disability || [], "disability");
    const disciplinaryDetails = deduplicateArray(aisData?.ais_suspension_info || [], "disciplinary");
    const experienceDetails = deduplicateArray(aisData?.ais_experience || [], "experience");

    return {
      full_name: fullName,
      position: officer.service_type_name || "IAS Officer",
      profile_image: officer.profile_image
        ? `${process.env.NEXT_PUBLIC_API_URL}/officer/get-image/${officer.profile_image}?t=${new Date().getTime()}`
        : null,
      personal_details: mergedPersonal,
      address_details: addressDetails,
      dependent_details: dependentDetails,
      educational_qualifications: educationalQualifications,
      central_deputation: centralDeputation,
      service_details: serviceDetails,
      training_details: trainingDetails,
      awards_and_publications: awardsAndPublications,
      disability_details: disabilityDetails,
      disciplinary_details: disciplinaryDetails,
      experience_details: experienceDetails,
    };
  }, []);

  useEffect(() => {
    const storedProgress = sessionStorage.getItem("profileProgress");
    if (storedProgress) {
      setProgress(parseInt(storedProgress, 10));
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "profileProgress") {
        setProgress(parseInt(e.newValue, 10) || 0);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // Fetch AIS officer preview
        const aisRes = await axiosInstance.get("/officer/officer-preview");
        let aisOfficerData = null;
        if (aisRes.data.success && aisRes.data.data?.officer_data) {
          aisOfficerData = aisRes.data.data.officer_data;
          setAisPerId(aisOfficerData.ais_per_id);
        }

        // Fetch SPARK data
        const sparkRes = await axiosInstance.get("/officer/officer");
        let sparkDetails = null;
        if (sparkRes.data.success && sparkRes.data.data?.spark_data?.data) {
          sparkDetails = sparkRes.data.data.spark_data.data;
          setSparkData(sparkDetails);
        }

        // Merge and transform
        const merged = transformOfficerData(aisOfficerData || {}, sparkDetails || {});
        setUserDetails(merged);
      } catch (err) {
        console.error("Data fetch error:", err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [transformOfficerData]);

  useEffect(() => {
    const fetchStatusTimeline = async () => {
      if (!aisPerId) return;
      try {
        const response = await axiosInstance.post("/officer/profile-submit-status", {
          ais_per_id: String(aisPerId),
        });
        if (response.data.success) {
          const statusData = response.data.data.profile_status || [];
          setStatusTimeline(statusData);
          if (statusData.length > 0) {
            setIsConsentChecked(true);
            setIsConsentDisabled(true);
          }
        } else {
          setError(response.data.detail || "Failed to fetch status timeline");
        }
      } catch (err) {
        setError(err.message || "Failed to fetch status timeline");
      }
    };
    fetchStatusTimeline();
  }, [aisPerId]);

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
      console.error("Document fetch error:", error);
      setDocumentError("Failed to load documents");
      toast.error("Failed to load documents");
    } finally {
      setLoadingDocument(false);
    }
  }, []);

  const closeDocumentModal = useCallback(() => {
    if (documentData) {
      documentData.forEach((doc) => {
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
      case "submit":
        return "Submitted";
      case "resubmit":
        return "Resubmitted";
      case "approve":
        return "Verified";
      case "return_for_correction":
        return "Returned for Correction";
      default:
        return "Pending";
    }
  };

  const getStatusColor = (status) => {
    const lowerStatus = status.toLowerCase();
    switch (lowerStatus) {
      case "verified":
      case "approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "submitted":
      case "resubmitted":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "return_for_correction":
      case "returned for correction":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getRemarkForAction = (action) => {
    switch (action) {
      case "submit":
        return "Profile submitted for verification.";
      case "resubmit":
        return "Profile resubmitted for verification after corrections.";
      default:
        return "";
    }
  };

  const handleActionClick = (action) => {
    if (!isConsentChecked) {
      setConsentError("You must provide consent to proceed with this action.");
      return;
    }
    if (!["submit", "resubmit"].includes(action)) {
      toast.error("Invalid action selected. Please try again.");
      return;
    }
    setConsentError("");
    setConfirmationAction(action);
    setShowConfirmationModal(true);
  };

  const handleConfirmAction = async () => {
    setShowConfirmationModal(false);
    setSignerPortModalOpen(true);
  };

  const handleSubmitAction = async (portNumber) => {
    // Implement your submit/resubmit logic here
    console.log("Submitting with port:", portNumber);
    setSignerPortModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

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

  const latestStatus = statusTimeline.find((status) => status.is_current) ||
    statusTimeline[statusTimeline.length - 1] || {};
  const currentDisplayStatus = latestStatus.action_key
    ? getDisplayStatus(latestStatus.action_key)
    : "Pending";
  const isResubmitAllowed = latestStatus.action_key === "return_for_correction";
  const isSubmitAllowed = statusTimeline.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 bg-white border border-indigo-300 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            <ArrowLeftIcon
              className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
              strokeWidth={2.5}
            />
            Back
          </button>

          <button
            onClick={() => pdfGenerator({ requestType: "preview", userDetails, setIsDownloading })}
            disabled={isDownloading || statusTimeline.length === 0}
            className={`flex items-center gap-2 border text-sm font-medium px-4 py-2.5 rounded-lg transition-all shadow-sm ${
              isDownloading || statusTimeline.length === 0
                ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                : "bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400"
            }`}
            title={statusTimeline.length === 0 ? "Profile must be submitted first" : "Download PDF"}
          >
            {isDownloading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <ArrowDownTrayIcon className="w-4 h-4" strokeWidth={2.5} />
                Download PDF
              </>
            )}
          </button>
        </div>

        {/* Main Profile Card */}
        <div ref={contentRef} className="bg-white shadow-xl rounded-2xl overflow-hidden border border-indigo-300">
          {/* Compact Professional Header */}
          <div className="relative bg-gradient-to-r from-indigo-900 via-indigo-500 to-indigo-900 text-white overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full -ml-16 -mb-16"></div>
            </div>

            <div className="relative z-10 px-6 py-6">
              <div className="flex flex-col lg:flex-row items-center lg:items-center gap-4">
                {/* Profile Image */}
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 rounded-xl bg-white/10 backdrop-blur-sm p-0.5 shadow-lg border border-white/20">
                    {userDetails.profile_image ? (
                      <div className="w-full h-full rounded-lg overflow-hidden bg-slate-100">
                        <img
                          src={userDetails.profile_image}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full rounded-lg bg-slate-100 flex items-center justify-center">
                        <span className="text-slate-400 text-xs">No Image</span>
                      </div>
                    )}
                  </div>
                  {currentDisplayStatus === "Verified" && (
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 shadow-lg border-2 border-white">
                      <CheckBadgeIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
                    </div>
                  )}
                </div>

                {/* Officer Details */}
                <div className="flex-1 text-center lg:text-left">
                  <h1 className="text-2xl font-bold mb-1 drop-shadow-lg">{userDetails.full_name}</h1>
                  <p className="text-indigo-100 text-sm mb-3 drop-shadow">
                    {userDetails.position}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                    <span className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium border border-white/20">
                      {userDetails.personal_details["Karmasri ID"]}
                    </span>

                    {/* Enhanced Current Status Display */}
                    <div className="relative group">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm flex items-center gap-1.5 ${getStatusColor(
                          currentDisplayStatus
                        )}`}
                      >
                        {currentDisplayStatus === "Verified" && (
                          <CheckCircleIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
                        )}
                        {currentDisplayStatus === "Submitted" && (
                          <ArrowDownTrayIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
                        )}
                        {currentDisplayStatus === "Resubmitted" && (
                          <ExclamationCircleIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
                        )}
                        {currentDisplayStatus === "Returned for Correction" && (
                          <XMarkIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
                        )}
                        {currentDisplayStatus === "Pending" && (
                          <div className="w-3.5 h-3.5 border-2 border-current rounded-full animate-pulse" />
                        )}

                        <span className="font-bold">{currentDisplayStatus}</span>

                        {currentDisplayStatus === "Verified" && (
                          <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-bold">
                            COMPLETED
                          </span>
                        )}
                        {currentDisplayStatus === "Returned for Correction" && (
                          <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-bold">
                            ACTION REQUIRED
                          </span>
                        )}
                      </span>

                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap shadow-xl border border-slate-700">
                        <div className="font-semibold mb-1">Application Status</div>
                        <div className="text-slate-300">Current: {currentDisplayStatus}</div>
                        <div className="w-2 h-2 bg-slate-900 absolute -bottom-1 left-1/2 transform -translate-x-1/2 rotate-45 border-b border-r border-slate-700"></div>
                      </div>
                    </div>

                    {(currentDisplayStatus === "Pending" ||
                      currentDisplayStatus === "Returned for Correction") &&
                      progress < 100 && (
                        <span className="bg-amber-500/20 text-amber-200 px-3 py-1.5 rounded-full text-xs font-medium border border-amber-400/30 flex items-center gap-1.5">
                          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                          Profile {progress}% Complete
                        </span>
                      )}
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-indigo-400"></div>
          </div>

          {/* Content Sections */}
          <div className="p-4 sm:p-6 space-y-4 bg-gradient-to-b from-white to-slate-50">
            <ProfessionalSection title="PERSONAL DETAILS" data={userDetails.personal_details} isKeyValue />
            <ProfessionalSection title="ADDRESS DETAILS" data={userDetails.address_details} isAddressList />
            <ModernCardSection title="DEPENDENT DETAILS" data={userDetails.dependent_details} />
            <ModernCardSection title="EDUCATIONAL QUALIFICATIONS" data={userDetails.educational_qualifications} />
            <ModernCardSection title="CENTRAL DEPUTATION" data={userDetails.central_deputation} />
            <ModernCardSection title="SERVICE DETAILS" data={userDetails.service_details} />
            <ModernCardSection title="TRAINING DETAILS" data={userDetails.training_details} onViewDocument={openDocumentModal} />
            <ModernCardSection title="AWARDS AND PUBLICATIONS" data={userDetails.awards_and_publications} onViewDocument={openDocumentModal} />
            <ModernCardSection title="DISABILITY DETAILS" data={userDetails.disability_details} onViewDocument={openDocumentModal} />
            <ModernCardSection title="DISCIPLINARY DETAILS" data={userDetails.disciplinary_details} />
            <ModernCardSection title="EXPERIENCE DETAILS" data={userDetails.experience_details} />
            <ModernTimeline title="STATUS TIMELINE" data={statusTimeline} formatDate={formatDate} />
          </div>
        </div>

        {/* Consent & Action Section */}
        <div className="mt-6 bg-white shadow-lg rounded-xl p-5 sm:p-6 border border-indigo-300">
          <div className="mb-5">
            <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
              <DocumentTextIcon className="w-5 h-5 text-indigo-600" />
              Officer Consent Declaration
            </h3>
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={isConsentChecked}
                  onChange={(e) => {
                    if (!isConsentDisabled) {
                      setIsConsentChecked(e.target.checked);
                      if (e.target.checked) setConsentError("");
                    }
                  }}
                  disabled={isConsentDisabled}
                  className={`mt-1 h-5 w-5 text-indigo-600 focus:ring-2 focus:ring-indigo-500 rounded border-indigo-400 ${
                    isConsentDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}
                />
                <span className="text-sm text-slate-700 leading-relaxed">
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
          <div className="flex flex-col sm:flex-row gap-3">
            {isSubmitAllowed && (
              <button
                onClick={() => handleActionClick("submit")}
                disabled={isSubmitting || isDownloading || progress < 100}
                className={`relative flex-1 flex items-center justify-center gap-2 text-sm font-semibold px-5 py-3 rounded-lg transition-all overflow-hidden ${
                  isSubmitting || isDownloading || progress < 100
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed border-2 border-indigo-300"
                    : "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 shadow-md hover:shadow-lg border-2 border-emerald-600"
                }`}
              >
                {progress < 100 && (
                  <div
                    className="absolute left-0 top-0 h-full bg-emerald-200/40 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {isSubmitting && confirmationAction === "submit" ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-5 h-5" strokeWidth={2.5} />
                      {progress < 100 ? `Submit (${progress}%)` : "Submit Profile"}
                    </>
                  )}
                </span>
              </button>
            )}

            {isResubmitAllowed && (
              <button
                onClick={() => handleActionClick("resubmit")}
                disabled={isSubmitting || isDownloading || progress < 100}
                className={`relative flex-1 flex items-center justify-center gap-2 text-sm font-semibold px-5 py-3 rounded-lg transition-all overflow-hidden ${
                  isSubmitting || isDownloading || progress < 100
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed border-2 border-indigo-300"
                    : "bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:from-amber-700 hover:to-amber-800 shadow-md hover:shadow-lg border-2 border-amber-600"
                }`}
              >
                {progress < 100 && (
                  <div
                    className="absolute left-0 top-0 h-full bg-amber-200/40 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {isSubmitting && confirmationAction === "resubmit" ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Resubmitting...
                    </>
                  ) : (
                    <>
                      <ExclamationCircleIcon className="w-5 h-5" strokeWidth={2.5} />
                      {progress < 100 ? `Resubmit (${progress}%)` : "Resubmit Profile"}
                    </>
                  )}
                </span>
              </button>
            )}

            {!isSubmitAllowed && !isResubmitAllowed && (
              <div className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold px-5 py-3 rounded-lg bg-slate-100 text-slate-500 border-2 border-slate-300">
                <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                Profile Submitted - Awaiting Verification
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
        title={confirmationAction === "submit" ? "Submit Officer Profile" : "Resubmit Officer Profile"}
        message={
          <div>
            Are you sure you want to {confirmationAction} this profile?
            <div className="mt-3" />
            <strong>Remark:</strong> {getRemarkForAction(confirmationAction)}
          </div>
        }
        iconType={confirmationAction === "submit" ? "success" : "warning"}
        confirmText={isSubmitting ? "Submitting..." : "Confirm"}
      />

      <SignerPortModal
        isOpen={signerPortModalOpen}
        setIsOpen={setSignerPortModalOpen}
        onClose={() => setSignerPortModalOpen(false)}
        onSubmit={(portNumber) => handleSubmitAction(portNumber)}
      />

      {/* Document Viewer Modal */}
      {documentModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col animate-slideUp">
            <div className="flex items-center justify-between p-5 border-b border-indigo-300 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <DocumentTextIcon className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Document Viewer</h3>
                  {documentData && documentData.length > 0 && (
                    <p className="text-sm text-slate-500">
                      {documentData[currentDocIndex].name} ({currentDocIndex + 1} of {documentData.length})
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={closeDocumentModal}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-200 transition-colors text-slate-500 hover:text-slate-700"
              >
                <XMarkIcon className="w-6 h-6" strokeWidth={2} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden bg-slate-100">
              {loadingDocument && (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
                  <p className="text-slate-600">Loading document...</p>
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

            {documentData && documentData.length > 1 && (
              <div className="p-4 border-t border-indigo-300 bg-slate-50 flex items-center justify-between">
                <button
                  onClick={() => setCurrentDocIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentDocIndex === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-indigo-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                  Previous
                </button>
                <div className="flex items-center gap-2">
                  {documentData.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentDocIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentDocIndex ? "bg-indigo-600 w-6" : "bg-slate-300 hover:bg-slate-400"
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setCurrentDocIndex((prev) => Math.min(documentData.length - 1, prev + 1))}
                  disabled={currentDocIndex === documentData.length - 1}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-indigo-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
};

// Helper Components
const ProfessionalSection = ({ title, data, isKeyValue = false, isAddressList = false }) => {
  if (!data || (Array.isArray(data) && data.length === 0) || (isKeyValue && Object.keys(data).length === 0)) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-indigo-300 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-500 to-indigo-900 px-5 py-3">
          <h2 className="font-bold text-base text-white tracking-wide">{title}</h2>
        </div>
        <div className="p-4 text-center py-6">
          <p className="text-slate-500 italic">No data available for this section</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-indigo-300 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-500 to-indigo-900 px-5 py-3">
        <h2 className="font-bold text-base text-white tracking-wide">{title}</h2>
      </div>

      <div className="p-4">
        {isKeyValue ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {Object.entries(data).map(([key, value]) => (
              <div
                key={key}
                className="flex border border-indigo-300 rounded-lg overflow-hidden hover:shadow-sm transition-shadow"
              >
                <div className="w-2/5 bg-indigo-50 p-2.5 font-semibold text-slate-700 text-sm border-r border-indigo-300">
                  {key}
                </div>
                <div className="w-3/5 p-2.5 text-slate-600 text-sm break-words bg-white">
                  {value || "N/A"}
                </div>
              </div>
            ))}
          </div>
        ) : isAddressList ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.map((item, index) => (
              <div
                key={index}
                className="border border-indigo-300 rounded-lg p-3 bg-indigo-50 hover:shadow-sm transition-shadow"
              >
                <div className="font-semibold text-slate-700 mb-2 text-sm flex items-center gap-2">
                  <div className="w-1 h-4 bg-indigo-600 rounded-full"></div>
                  {item.title}
                </div>
                <div className="text-slate-600 text-sm leading-relaxed pl-3">{item.value}</div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

const ModernCardSection = ({ title, data, onViewDocument }) => {
  const formatFieldName = (key) => {
    return key
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-indigo-300 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-500 to-indigo-900 px-5 py-3 flex items-center gap-2">
          <h2 className="font-bold text-base text-white tracking-wide">{title}</h2>
          <span className="ml-auto bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium text-white border border-white/30">
            0
          </span>
        </div>
        <div className="p-4 text-center py-6">
          <p className="text-slate-500 italic">No data available for this section</p>
        </div>
      </div>
    );
  }

  const getCardTitle = (item, index) => {
    if (item.relation) return `${item.relation} - ${item.name}`;
    if (item.qualification) return item.qualification;
    if (item.designation) return item.designation;
    if (item.training_name) return item.training_name;
    if (item.award_name) return item.award_name;
    if (item.disability_type) return item.disability_type;
    if (item.suspension_reason) return `Disciplinary Case ${index + 1}`;
    if (item.organization) return `${item.organization} - ${item.designation || ""}`;
    return `Entry ${index + 1}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-indigo-300 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-500 to-indigo-900 px-5 py-3 flex items-center gap-2">
        <h2 className="font-bold text-base text-white tracking-wide">{title}</h2>
        <span className="ml-auto bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium text-white border border-white/30">
          {data.length}
        </span>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {data.map((item, index) => {
            const docsArray = item.documentIds || (item.documentId ? [item.documentId] : []);
            const cardTitle = getCardTitle(item, index);

            return (
              <div
                key={index}
                className="border border-indigo-300 rounded-lg p-3 bg-gradient-to-br from-white to-indigo-50/30 hover:shadow-md hover:border-indigo-400 transition-all"
              >
                <div className="flex justify-between items-start mb-2.5 pb-2.5 border-b border-indigo-300">
                  <h3 className="font-bold text-slate-800 text-sm flex-1">{cardTitle}</h3>
                  {docsArray.length > 0 && (
                    <button
                      onClick={() => onViewDocument?.(docsArray)}
                      className="ml-2 px-2.5 py-1 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-xs font-medium rounded-md hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-sm flex items-center gap-1"
                    >
                      <DocumentTextIcon className="w-3.5 h-3.5" />
                      {docsArray.length > 1 ? `${docsArray.length}` : "View"}
                    </button>
                  )}
                </div>

                <div className="space-y-1.5">
                  {Object.entries(item)
                    .filter(
                      ([key]) =>
                        !["documentId", "documentIds", "relation", "name", "qualification", "designation", "training_name", "award_name", "disability_type", "organization"].includes(key)
                    )
                    .map(([key, value]) => (
                      <div key={key} className="flex text-xs">
                        <span className="font-medium text-slate-600 w-2/5 flex-shrink-0">
                          {formatFieldName(key)}:
                        </span>
                        <span className="text-slate-800 flex-1 break-words">
                          {Array.isArray(value) ? value.join(", ") : (value || "N/A")}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ModernTimeline = ({ title, data, formatDate }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-indigo-300 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-500 to-indigo-900 px-5 py-3 flex items-center gap-2">
          <span className="text-lg">📋</span>
          <h2 className="font-bold text-base text-white tracking-wide">{title}</h2>
        </div>
        <div className="p-4 text-center py-6">
          <p className="text-slate-500 italic">No status timeline available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-indigo-300 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-500 to-indigo-900 px-5 py-3 flex items-center gap-2">
        <span className="text-lg">📋</span>
        <h2 className="font-bold text-base text-white tracking-wide">{title}</h2>
      </div>

      <div className="p-4">
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-400 via-purple-400 to-cyan-400"></div>
          {data.map((status, index) => (
            <div key={index} className="relative flex items-start mb-4 last:mb-0">
              <div
                className={`absolute left-2.5 w-4 h-4 rounded-full mt-1 z-10 border-2 border-white shadow-md ${
                  status.is_current ? "bg-emerald-500 animate-pulse" : "bg-indigo-600"
                }`}
              ></div>
              <div className="ml-10 bg-gradient-to-br from-indigo-50/50 to-white border border-indigo-300 rounded-lg p-4 w-full hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2.5 gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800 text-sm capitalize">
                      {status.action_key?.replace(/_/g, " ") || "Status"}
                    </h3>
                    {status.is_current && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full border border-emerald-300">
                        CURRENT
                      </span>
                    )}
                  </div>
                  <span className="text-slate-500 text-xs font-medium bg-white px-2.5 py-1 rounded-md border border-indigo-300">
                    {status.event_time ? formatDate(status.event_time) : "N/A"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-slate-600 text-xs">
                  <div className="space-y-1.5">
                    <p className="flex items-start gap-2">
                      <span className="font-semibold text-slate-700 min-w-fit">Remarks:</span>
                      <span className="break-words">{status.remarks || "N/A"}</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="font-semibold text-slate-700 min-w-fit">Role:</span>
                      <span className="break-words">{status.assigned_to_role_name || "N/A"}</span>
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="flex items-start gap-2">
                      <span className="font-semibold text-slate-700 min-w-fit">From:</span>
                      <span className="break-words">{status.from_activity_name || "N/A"}</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="font-semibold text-slate-700 min-w-fit">To:</span>
                      <span className="break-words">{status.to_activity_name || "N/A"}</span>
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