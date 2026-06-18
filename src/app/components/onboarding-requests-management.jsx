"use client";

import { useEffect, useMemo, useState } from "react";
import moment from "moment";
import axiosInstance from "@/utils/apiClient";
import ConfirmModal from "@/app/components/confirmModal";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import {
  CheckCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  NoSymbolIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import {
  SearchBar,
  ExportButtons,
  PaginationControls,
  exportToCSV,
  exportToPDF,
  exportToExcel,
} from "@/app/components/dataTableControls";

const serviceTypeMap = {
  1: "IAS",
  2: "IPS",
  3: "IFS",
};

const statusThemeMap = {
  OTP_PENDING: "bg-amber-100 text-amber-800",
  PENDING_REVIEW: "bg-blue-100 text-blue-800",
  VERIFIED: "bg-indigo-100 text-indigo-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-rose-100 text-rose-800",
  ALREADY_EXIST: "bg-orange-100 text-orange-800",
};

const statusLabelMap = {
  OTP_PENDING: "Awaiting OTP",
  PENDING_REVIEW: "Ready for Review",
  VERIFIED: "Verified",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  ALREADY_EXIST: "Already Exist",
};

const matchesStatusTab = (requestStatus, tabKey) => {
  if (tabKey === "PENDING") {
    return (
      requestStatus === "OTP_PENDING" ||
      requestStatus === "PENDING_REVIEW" ||
      requestStatus === "VERIFIED"
    );
  }
  return requestStatus === tabKey;
};

export default function OnboardingRequestsManagement() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeStatusTab, setActiveStatusTab] = useState("PENDING");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [confirmMode, setConfirmMode] = useState(null);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [markingAlreadyExist, setMarkingAlreadyExist] = useState(false);
  const [checkingSparkId, setCheckingSparkId] = useState(null);
  const [sparkResult, setSparkResult] = useState(null);
  const [sparkRequestLabel, setSparkRequestLabel] = useState("");
  const [isSparkModalOpen, setIsSparkModalOpen] = useState(false);
  const [sparkMessage, setSparkMessage] = useState("");
  const [sparkCanMarkVerified, setSparkCanMarkVerified] = useState(false);
  const [sparkCheckSucceeded, setSparkCheckSucceeded] = useState(false);
  const [sparkRequest, setSparkRequest] = useState(null);
  const [markingVerified, setMarkingVerified] = useState(false);
  const [reviewDialogMode, setReviewDialogMode] = useState(null);
  const [reviewRemark, setReviewRemark] = useState("");

  const itemsPerPage = 25;

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/admin/onboarding-requests");
      setRequests(response.data?.data?.onboarding_requests || []);
    } catch (error) {
      console.error("Error fetching onboarding requests:", error);
      toast.error("Failed to load onboarding requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeStatusTab]);

  const statusTabs = useMemo(() => {
    const pendingCount = requests.filter((request) =>
      matchesStatusTab(request.request_status, "PENDING")
    ).length;
    const approvedCount = requests.filter((request) => request.request_status === "APPROVED").length;
    const rejectedCount = requests.filter((request) => request.request_status === "REJECTED").length;
    const alreadyExistCount = requests.filter(
      (request) => request.request_status === "ALREADY_EXIST"
    ).length;

    return [
      {
        key: "PENDING",
        label: "Pending",
        count: pendingCount,
      },
      {
        key: "APPROVED",
        label: "Approved",
        count: approvedCount,
      },
      {
        key: "REJECTED",
        label: "Rejected",
        count: rejectedCount,
      },
      {
        key: "ALREADY_EXIST",
        label: "Already Exist",
        count: alreadyExistCount,
      },
    ];
  }, [requests]);

  const filteredRequests = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return requests.filter((request) => {
      const matchesStatus = matchesStatusTab(request.request_status, activeStatusTab);
      const matchesSearch = `${request.pen_number ?? ""} ${request.email ?? ""} ${request.mobile_no ?? ""} ${request.request_status ?? ""} ${serviceTypeMap[request.service_type_id] ?? ""}`
        .toLowerCase()
        .includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [requests, searchTerm, activeStatusTab]);

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);

  const formatDate = (value) => {
    if (!value) return "";
    const date = moment.utc(value).local();
    return date.isValid() ? date.format("DD-MM-YYYY HH:mm") : "";
  };

  const handleApproveClick = (request) => {
    setSelectedRequest(request);
    setConfirmMode("approve");
  };

  const handleRejectClick = (request) => {
    setSelectedRequest(request);
    setReviewDialogMode("reject");
    setReviewRemark("");
  };

  const handleAlreadyExistClick = (request) => {
    setSelectedRequest(request);
    setConfirmMode("already_exist");
  };

  const approveRequest = async () => {
    if (!selectedRequest) return;
    try {
      setApproving(true);
      const response = await axiosInstance.post("/admin/onboarding-requests/approve", {
        request_id: selectedRequest.request_id,
      });
      await fetchRequests();
      toast.success(response.data?.detail || "Onboarding request approved successfully.");
    } catch (error) {
      console.error("Error approving onboarding request:", error);
      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to approve onboarding request."
      );
    } finally {
      setApproving(false);
      setSelectedRequest(null);
      setConfirmMode(null);
    }
  };

  const rejectRequest = async () => {
    if (!selectedRequest) return;
    const trimmedRemark = reviewRemark.trim();
    if (trimmedRemark.length < 3) {
      toast.error("Please enter a valid rejection reason.");
      return;
    }
    try {
      setRejecting(true);
      const response = await axiosInstance.post("/admin/onboarding-requests/reject", {
        request_id: selectedRequest.request_id,
        remarks: trimmedRemark,
      });
      await fetchRequests();
      toast.success(response.data?.detail || "Onboarding request rejected successfully.");
    } catch (error) {
      console.error("Error rejecting onboarding request:", error);
      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to reject onboarding request."
      );
    } finally {
      setRejecting(false);
      setSelectedRequest(null);
      setReviewDialogMode(null);
      setReviewRemark("");
    }
  };

  const markAsAlreadyExist = async () => {
    if (!selectedRequest) return;
    try {
      setMarkingAlreadyExist(true);
      const response = await axiosInstance.post("/admin/onboarding-requests/already-exist", {
        request_id: selectedRequest.request_id,
      });
      await fetchRequests();
      toast.success(
        response.data?.detail || "Onboarding request marked as already existing successfully."
      );
    } catch (error) {
      console.error("Error marking onboarding request as already existing:", error);
      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to mark onboarding request as already existing."
      );
    } finally {
      setMarkingAlreadyExist(false);
      setSelectedRequest(null);
      setConfirmMode(null);
    }
  };

  const checkWithSpark = async (request) => {
    setSparkRequest(request);
    setSparkRequestLabel(`${request.pen_number} / ${request.email}`);
    try {
      setCheckingSparkId(request.request_id);
      const response = await axiosInstance.get(
        `/admin/onboarding-requests/${request.request_id}/spark-check`
      );
      const payload = response.data?.data || {};
      setSparkResult(payload.spark_data ?? null);
      setSparkCanMarkVerified(Boolean(payload.can_mark_verified));
      setSparkCheckSucceeded(Boolean(payload.can_mark_verified));
      setSparkMessage(response.data?.detail || "SPARK details retrieved successfully.");
      setIsSparkModalOpen(true);
      toast.success(response.data?.detail || "SPARK details retrieved successfully.");
    } catch (error) {
      console.error("Error checking request with SPARK:", error);
      const failureMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to retrieve SPARK details.";
      const payload = error.response?.data?.data || {};
      setSparkResult(payload.spark_data ?? null);
      setSparkCanMarkVerified(Boolean(payload.can_mark_verified));
      setSparkCheckSucceeded(false);
      setSparkMessage(failureMessage);
      setIsSparkModalOpen(true);
      toast.error(failureMessage);
    } finally {
      setCheckingSparkId(null);
    }
  };

  const resetSparkModal = () => {
    setIsSparkModalOpen(false);
    setSparkResult(null);
    setSparkRequestLabel("");
    setSparkMessage("");
    setSparkCanMarkVerified(false);
    setSparkCheckSucceeded(false);
    setSparkRequest(null);
  };

  const markAsVerified = async () => {
    if (!sparkRequest) return;
    try {
      setMarkingVerified(true);
      const response = await axiosInstance.post(
        `/admin/onboarding-requests/${sparkRequest.request_id}/mark-verified`
      );
      await fetchRequests();
      toast.success(response.data?.detail || "Onboarding request marked as verified.");
      resetSparkModal();
    } catch (error) {
      console.error("Error marking onboarding request as verified:", error);
      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to mark onboarding request as verified."
      );
    } finally {
      setMarkingVerified(false);
    }
  };

  const exportHeaders = [
    "Sl. No",
    "PEN",
    "DOB",
    "Email",
    "Mobile Number",
    "Service Type",
    "Status",
    "Requested On",
    "Verified On",
    "Approved On",
  ];

  const exportRows = filteredRequests.map((request, index) => [
    index + 1,
    request.pen_number ?? "",
    moment(request.dob).isValid() ? moment(request.dob).format("DD-MM-YYYY") : "",
    request.email ?? "",
    request.mobile_no ?? "",
    serviceTypeMap[request.service_type_id] ?? "Unknown",
    request.request_status ?? "",
    formatDate(request.requested_on),
    formatDate(request.verified_on),
    formatDate(request.approved_on),
  ]);

  const renderValue = (value) => {
    if (value === null || value === undefined || value === "") return "-";
    if (Array.isArray(value)) {
      return value.length ? value.join(", ") : "-";
    }
    return String(value);
  };

  const renderObjectEntries = (obj) => {
    if (!obj || typeof obj !== "object") return null;
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {Object.entries(obj).map(([key, value]) => (
          <div
            key={key}
            className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/70"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {key.replace(/_/g, " ")}
            </p>
            <p className="mt-1 break-words text-sm text-slate-900 dark:text-slate-100">
              {renderValue(value)}
            </p>
          </div>
        ))}
      </div>
    );
  };

  const renderArraySection = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
      return <p className="text-sm text-slate-500 dark:text-slate-400">No records available.</p>;
    }

    return (
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/70"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
              Record {index + 1}
            </p>
            {renderObjectEntries(item)}
          </div>
        ))}
      </div>
    );
  };

  const hasSparkResult =
    sparkResult && typeof sparkResult === "object" && Object.keys(sparkResult).length > 0;
  const hasSparkData =
    sparkResult?.data && typeof sparkResult.data === "object" && Object.keys(sparkResult.data).length > 0;
  const reviewActionLoading = reviewDialogMode === "reject" ? rejecting : markingAlreadyExist;
  const reviewActionTitle =
    reviewDialogMode === "reject" ? "Reject onboarding request" : "Mark as already exist";
  const reviewActionMessage =
    reviewDialogMode === "reject"
      ? `Reject onboarding request for PEN ${selectedRequest?.pen_number ?? ""}?`
      : `Mark onboarding request for PEN ${selectedRequest?.pen_number ?? ""} as already existing?`;
  const reviewActionPlaceholder =
    reviewDialogMode === "reject"
      ? "Enter the rejection reason that should be emailed to the applicant."
      : "Enter why this request is being closed as already existing.";

  return (
    <div className="rounded-xl border bg-white px-0 pb-3 pt-0 dark:border-gray-900 dark:bg-gray-800">
      <div className="border-b border-gray-200 bg-white px-4 py-4 dark:border-gray-900 dark:bg-gray-800 sm:px-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold uppercase tracking-wide text-indigo-700 dark:text-white">
              Onboarding Requests
            </h3>
            <p className="mt-2 text-sm leading-8 text-gray-600 dark:text-gray-300">
              Review verified self-onboarding requests and approve them to create officer accounts
              in KARMASRI.
            </p>
          </div>

          <div className="flex flex-col gap-3 xl:min-w-[380px] xl:items-end">
            <div className="w-full xl:max-w-[620px]">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search by PEN / Email / Mobile / Status / Service Type"
              />
            </div>
            <div className="flex w-full justify-start xl:justify-end">
              <ExportButtons
                onCSV={() => exportToCSV("onboarding-requests.csv", exportHeaders, exportRows)}
                onPDF={() =>
                  exportToPDF("Onboarding Requests", exportHeaders, exportRows, "onboarding-requests.pdf")
                }
                onExcel={() =>
                  exportToExcel(
                    "Onboarding Requests",
                    filteredRequests.map((request, index) => ({
                      "Sl. No": index + 1,
                      PEN: request.pen_number ?? "",
                      DOB: moment(request.dob).isValid()
                        ? moment(request.dob).format("DD-MM-YYYY")
                        : "",
                      Email: request.email ?? "",
                      "Mobile Number": request.mobile_no ?? "",
                      "Service Type": serviceTypeMap[request.service_type_id] ?? "Unknown",
                      Status: request.request_status ?? "",
                      "Requested On": formatDate(request.requested_on),
                      "Verified On": formatDate(request.verified_on),
                      "Approved On": formatDate(request.approved_on),
                    })),
                    "onboarding-requests.xlsx"
                  )
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800 sm:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {statusTabs.map((tab) => {
              const isActive = activeStatusTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveStatusTab(tab.key)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`inline-flex min-w-6 justify-center rounded-full px-1.5 py-0.5 text-xs ${
                      isActive
                        ? "bg-white text-indigo-700 dark:bg-slate-900 dark:text-indigo-200"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 lg:text-right">
            {activeStatusTab === "PENDING"
              ? "Pending includes OTP waiting, superadmin review, and verified requests"
              : `Showing ${
                  statusTabs.find((tab) => tab.key === activeStatusTab)?.label?.toLowerCase() || ""
                } requests`}
          </p>
        </div>
      </div>

      <div>
        <div className="space-y-3">
          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-gray-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-gray-300">
              Loading onboarding requests...
            </div>
          ) : !currentRequests.length ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-gray-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-gray-300">
              No {statusTabs.find((tab) => tab.key === activeStatusTab)?.label.toLowerCase()} onboarding
              requests found.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/40">
              <table className="min-w-[920px] w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:bg-slate-800/70 dark:text-slate-300">
                    <th className="border-b border-slate-200 px-3 py-3 dark:border-slate-700">Sl. No</th>
                    <th className="border-b border-slate-200 px-3 py-3 dark:border-slate-700">PEN</th>
                    <th className="border-b border-slate-200 px-3 py-3 dark:border-slate-700">Service</th>
                    <th className="border-b border-slate-200 px-3 py-3 dark:border-slate-700">DOB</th>
                    <th className="border-b border-slate-200 px-3 py-3 dark:border-slate-700">Email</th>
                    <th className="border-b border-slate-200 px-3 py-3 dark:border-slate-700">Mobile</th>
                    <th className="border-b border-slate-200 px-3 py-3 dark:border-slate-700">Requested On</th>
                    <th className="border-b border-slate-200 px-3 py-3 dark:border-slate-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRequests.map((request, index) => (
                    <tr key={request.request_id} className="align-top hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                      <td className="border-b border-slate-200 px-3 py-3 text-sm font-semibold text-slate-900 dark:border-slate-700 dark:text-white">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td className="border-b border-slate-200 px-3 py-3 text-sm font-semibold tracking-tight text-slate-900 dark:border-slate-700 dark:text-white whitespace-nowrap">
                        {request.pen_number}
                      </td>
                      <td className="border-b border-slate-200 px-3 py-3 text-sm font-medium text-slate-900 dark:border-slate-700 dark:text-white whitespace-nowrap">
                        <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          {serviceTypeMap[request.service_type_id] ?? "Unknown"}
                        </span>
                      </td>
                      <td className="border-b border-slate-200 px-3 py-3 text-sm font-medium text-slate-900 dark:border-slate-700 dark:text-white whitespace-nowrap">
                        {moment(request.dob).isValid() ? moment(request.dob).format("DD-MM-YYYY") : "-"}
                      </td>
                      <td className="border-b border-slate-200 px-3 py-3 text-sm font-medium text-slate-900 dark:border-slate-700 dark:text-white">
                        <div className="max-w-[220px] break-words leading-6">
                          {request.email || "-"}
                        </div>
                      </td>
                      <td className="border-b border-slate-200 px-3 py-3 text-sm font-medium text-slate-900 dark:border-slate-700 dark:text-white whitespace-nowrap">
                        {request.mobile_no || "-"}
                      </td>
                      <td className="border-b border-slate-200 px-3 py-3 text-sm font-medium text-slate-900 dark:border-slate-700 dark:text-white whitespace-nowrap">
                        {formatDate(request.requested_on) || "-"}
                      </td>
                      <td className="border-b border-slate-200 px-3 py-3 dark:border-slate-700">
                        {request.request_status === "PENDING_REVIEW" ? (
                          <div className="max-w-[145px] space-y-1.5">
                            <div className="flex min-w-[130px] flex-row items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => checkWithSpark(request)}
                                disabled={checkingSparkId === request.request_id}
                                title={checkingSparkId === request.request_id ? "Checking with SPARK" : "Check with SPARK"}
                                aria-label={checkingSparkId === request.request_id ? "Checking with SPARK" : "Check with SPARK"}
                                className="inline-flex items-center justify-center rounded-md border border-blue-200 bg-blue-50 p-2 text-blue-700 hover:bg-blue-100 disabled:opacity-50 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200"
                              >
                                {checkingSparkId === request.request_id ? (
                                  <InformationCircleIcon className="h-4 w-4" />
                                ) : (
                                  <MagnifyingGlassIcon className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                            <div className="text-xs leading-5 text-slate-600 dark:text-slate-300">
                              Run SPARK review, then mark the request as verified.
                            </div>
                          </div>
                        ) : request.request_status === "VERIFIED" ? (
                          <div className="flex min-w-[130px] flex-row items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleApproveClick(request)}
                              disabled={approving}
                              title="Approve request"
                              aria-label="Approve request"
                              className="inline-flex items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 p-2 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectClick(request)}
                              disabled={rejecting}
                              title="Reject request"
                              aria-label="Reject request"
                              className="inline-flex items-center justify-center rounded-md border border-rose-200 bg-rose-50 p-2 text-rose-700 hover:bg-rose-100 disabled:opacity-50 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200"
                            >
                              <NoSymbolIcon className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAlreadyExistClick(request)}
                              disabled={markingAlreadyExist}
                              title="Mark as already exist"
                              aria-label="Mark as already exist"
                              className="inline-flex items-center justify-center rounded-md border border-orange-200 bg-orange-50 px-2 py-2 text-[11px] font-semibold uppercase tracking-wide text-orange-700 hover:bg-orange-100 disabled:opacity-50 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-200"
                            >
                              AE
                            </button>
                          </div>
                        ) : (
                          <div className="max-w-[145px] space-y-1.5">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusThemeMap[request.request_status] || "bg-gray-100 text-gray-800"}`}
                            >
                              {request.request_status === "APPROVED" ? (
                                <CheckCircleIcon className="h-3.5 w-3.5" />
                              ) : request.request_status === "REJECTED" ||
                                request.request_status === "ALREADY_EXIST" ? (
                                <NoSymbolIcon className="h-3.5 w-3.5" />
                              ) : (
                                <ClockIcon className="h-3.5 w-3.5" />
                              )}
                              {statusLabelMap[request.request_status] ||
                                request.request_status?.replace(/_/g, " ")}
                            </span>
                            <div className="text-xs leading-5 text-slate-600 dark:text-slate-300">
                            {request.request_status === "APPROVED"
                              ? "Officer account already created."
                              : request.request_status === "REJECTED"
                                ? "Request closed after review."
                                : request.request_status === "ALREADY_EXIST"
                                  ? "Closed because the officer already exists in the system."
                                : request.request_status === "VERIFIED"
                                  ? "Request is verified and ready for approval."
                                : "Waiting for OTP verification."}
                            </div>
                            {request.review_remark ? (
                              <div className="rounded-lg bg-slate-100 px-2 py-1.5 text-[11px] leading-5 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                Reason: {request.review_remark}
                              </div>
                            ) : null}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredRequests.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      <ConfirmModal
        isOpen={confirmMode === "approve" || confirmMode === "already_exist"}
        setIsOpen={(value) => {
          if (!value) {
            setConfirmMode(null);
            setSelectedRequest(null);
          }
        }}
        onConfirm={confirmMode === "already_exist" ? markAsAlreadyExist : approveRequest}
        title={
          confirmMode === "already_exist"
            ? "Mark onboarding request as already exist"
            : "Approve onboarding request"
        }
        message={
          confirmMode === "already_exist"
            ? `Mark onboarding request for PEN ${selectedRequest?.pen_number ?? ""} as already existing? This will close the request with the default remark "Already exist / onboarded".`
            : `Approve onboarding request for PEN ${selectedRequest?.pen_number ?? ""}? This will create the officer account and send onboarding credentials.`
        }
        iconType={confirmMode === "already_exist" ? "warning" : "success"}
        confirmText={
          confirmMode === "already_exist"
            ? markingAlreadyExist
              ? "Updating..."
              : "Mark as Already Exist"
            : approving
              ? "Approving..."
              : "Approve"
        }
      />

      <Dialog
        open={Boolean(reviewDialogMode)}
        onClose={() => {
          if (!reviewActionLoading) {
            setReviewDialogMode(null);
            setSelectedRequest(null);
            setReviewRemark("");
          }
        }}
        className="relative z-50"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="fixed inset-0 overflow-y-auto p-4">
          <div className="flex min-h-full items-center justify-center">
            <DialogPanel className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {reviewActionTitle}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {reviewActionMessage}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!reviewActionLoading) {
                      setReviewDialogMode(null);
                      setSelectedRequest(null);
                      setReviewRemark("");
                    }
                  }}
                  className="rounded-full p-1 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Reason / Remark
                </label>
                <textarea
                  value={reviewRemark}
                  onChange={(event) => setReviewRemark(event.target.value)}
                  rows={5}
                  placeholder={reviewActionPlaceholder}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-indigo-900"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setReviewDialogMode(null);
                    setSelectedRequest(null);
                    setReviewRemark("");
                  }}
                  disabled={reviewActionLoading}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={reviewDialogMode === "reject" ? rejectRequest : markAsAlreadyExist}
                  disabled={reviewActionLoading}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
                    reviewDialogMode === "reject"
                      ? "bg-rose-600 hover:bg-rose-700"
                      : "bg-orange-600 hover:bg-orange-700"
                  }`}
                >
                  {reviewDialogMode === "reject"
                    ? rejecting
                      ? "Rejecting..."
                      : "Reject"
                    : markingAlreadyExist
                      ? "Updating..."
                      : "Mark as Already Exist"}
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={isSparkModalOpen}
        onClose={resetSparkModal}
        className="relative z-50"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="fixed inset-0 overflow-y-auto p-4">
          <div className="flex min-h-full items-center justify-center">
            <DialogPanel className="relative w-full max-w-6xl rounded-3xl bg-white shadow-2xl dark:bg-slate-900">
              <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="pr-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">
                        SPARK Verification
                      </p>
                      <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                        SPARK Response Details
                      </h3>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{sparkRequestLabel}</p>
                    </div>
                    <button
                      type="button"
                      onClick={resetSparkModal}
                      className="shrink-0 rounded-full p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  {sparkRequest?.request_status === "PENDING_REVIEW" && sparkCanMarkVerified ? (
                    <div className="flex justify-start sm:justify-end">
                      <button
                        type="button"
                        onClick={markAsVerified}
                        disabled={markingVerified}
                        className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
                      >
                        {markingVerified ? "Marking..." : "Mark as Verified"}
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="max-h-[80vh] overflow-y-auto px-6 py-6">
                <div
                  className={`mb-6 rounded-2xl border px-4 py-3 text-sm leading-6 ${
                    sparkCheckSucceeded
                      ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100"
                      : "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-100"
                  }`}
                >
                  {sparkMessage || "No SPARK response available."}
                </div>
                {hasSparkResult ? (
                  <div className="space-y-6">
                    <div className="grid gap-4 lg:grid-cols-3">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Status
                        </p>
                        <p className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
                          {renderValue(sparkResult.status)}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70 lg:col-span-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Message
                        </p>
                        <p className="mt-1 text-base text-slate-900 dark:text-slate-100">
                          {renderValue(sparkResult.message)}
                        </p>
                      </div>
                    </div>

                    {sparkResult.error ? (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Error
                        </p>
                        <p className="mt-1 break-words text-base text-slate-900 dark:text-slate-100">
                          {renderValue(sparkResult.error)}
                        </p>
                      </div>
                    ) : null}

                    {sparkResult.data?.personal_details ? (
                      <section className="space-y-3">
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                          Personal Details
                        </h4>
                        {renderObjectEntries(sparkResult.data.personal_details)}
                      </section>
                    ) : null}

                    {sparkResult.data?.address_details ? (
                      <section className="space-y-4">
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                          Address Details
                        </h4>
                        <div className="grid gap-4 lg:grid-cols-2">
                          <div className="space-y-3">
                            <h5 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                              Permanent Address
                            </h5>
                            {renderObjectEntries(sparkResult.data.address_details.permanent_address)}
                          </div>
                          <div className="space-y-3">
                            <h5 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                              Current Address
                            </h5>
                            {renderObjectEntries(sparkResult.data.address_details.current_address)}
                          </div>
                        </div>
                      </section>
                    ) : null}

                    {hasSparkData ? (
                      <>
                        <section className="space-y-3">
                          <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Service Details
                          </h4>
                          {renderArraySection(sparkResult.data?.service_details)}
                        </section>

                        <section className="grid gap-6 xl:grid-cols-2">
                          <div className="space-y-3">
                            <h4 className="text-lg font-semibold text-slate-900 dark:text-white">Awards</h4>
                            {renderArraySection(sparkResult.data?.awards)}
                          </div>
                          <div className="space-y-3">
                            <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                              Education Details
                            </h4>
                            {renderArraySection(sparkResult.data?.education_details)}
                          </div>
                          <div className="space-y-3">
                            <h4 className="text-lg font-semibold text-slate-900 dark:text-white">Training</h4>
                            {renderArraySection(sparkResult.data?.trainingList)}
                          </div>
                          <div className="space-y-3">
                            <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                              Deputation Details
                            </h4>
                            {renderArraySection(sparkResult.data?.deputation_details)}
                          </div>
                          <div className="space-y-3">
                            <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                              Nomination Details
                            </h4>
                            {renderArraySection(sparkResult.data?.nomination_details)}
                          </div>
                          <div className="space-y-3">
                            <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                              Family Details
                            </h4>
                            {renderArraySection(sparkResult.data?.family_details)}
                          </div>
                        </section>
                      </>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
                        No detailed SPARK data is available for this response.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
                    No SPARK response details are available.
                  </div>
                )}
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
