'use client';

import { useEffect, useMemo, useState } from "react";
import moment from "moment";
import axiosInstance from "@/utils/apiClient";
import { toast } from "react-toastify";
import {
  SearchBar,
  ExportButtons,
  PaginationControls,
  exportToCSV,
  exportToPDF,
  exportToExcel,
} from "@/app/components/dataTableControls";

const statusThemeMap = {
  completed: "bg-emerald-100 text-emerald-800",
  otp_sent: "bg-blue-100 text-blue-800",
  lookup_verified: "bg-slate-100 text-slate-800",
  invalid_otp: "bg-rose-100 text-rose-800",
  otp_expired: "bg-amber-100 text-amber-800",
  current_contact_mismatch: "bg-orange-100 text-orange-800",
};

const statusLabelMap = {
  completed: "Completed",
  otp_sent: "OTP verification pending",
  lookup_verified: "PEN and date of birth verified",
  invalid_otp: "Invalid OTP entered",
  otp_expired: "OTP expired",
  current_contact_mismatch: "Current contact did not match",
};

const groupStatus = (status) => {
  if (status === "completed") return "COMPLETED";
  if (status === "invalid_otp" || status === "otp_expired" || status === "current_contact_mismatch") {
    return "ISSUES";
  }
  return "IN_PROGRESS";
};

const changeTypeLabelMap = {
  email: "Email only",
  mobile: "Mobile only",
  both: "Email and mobile",
};

const formatDate = (value) => {
  if (!value) return "—";

  const isNumericTimestamp = typeof value === "number" || /^\d+$/.test(String(value));
  const normalizedValue = isNumericTimestamp
    ? String(value).length <= 10
      ? Number(value) * 1000
      : Number(value)
    : value;

  const date = moment(normalizedValue);
  return date.isValid() ? date.format("DD-MM-YYYY HH:mm") : "—";
};

const formatStatusLabel = (status) => {
  if (!status) return "Unknown";
  if (statusLabelMap[status]) return statusLabelMap[status];
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export default function ContactRecoveryAuditManagement() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeStatusTab, setActiveStatusTab] = useState("ALL");

  const itemsPerPage = 25;

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/admin/contact-recovery-audit");
      setRequests(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching credential change audit:", error);
      toast.error("Failed to load credential change audit.");
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
    const completedCount = requests.filter((item) => groupStatus(item.status) === "COMPLETED").length;
    const inProgressCount = requests.filter((item) => groupStatus(item.status) === "IN_PROGRESS").length;
    const issuesCount = requests.filter((item) => groupStatus(item.status) === "ISSUES").length;

    return [
      { key: "ALL", label: "All", count: requests.length },
      { key: "COMPLETED", label: "Completed", count: completedCount },
      { key: "IN_PROGRESS", label: "In Progress", count: inProgressCount },
      { key: "ISSUES", label: "Issues", count: issuesCount },
    ];
  }, [requests]);

  const filteredRequests = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesStatus = activeStatusTab === "ALL" || groupStatus(request.status) === activeStatusTab;
      const matchesSearch = [
        request.pen_number,
        request.requested_change_type,
        request.status,
        request.current_email,
        request.current_mobile,
        request.new_email,
        request.new_mobile,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [requests, searchTerm, activeStatusTab]);

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);

  const exportHeaders = [
    "PEN Number",
    "Change Type",
    "Current Email",
    "Current Mobile",
    "New Email",
    "New Mobile",
    "First Login",
    "Status",
    "Initiated At",
    "Completed At",
  ];

  const exportRows = filteredRequests.map((request) => [
    request.pen_number || "",
    changeTypeLabelMap[request.requested_change_type] || request.requested_change_type || "",
    request.current_email || "",
    request.current_mobile || "",
    request.new_email || "",
    request.new_mobile || "",
    request.is_first_login ? "Yes" : "No",
    formatStatusLabel(request.status),
    formatDate(request.initiated_at),
    formatDate(request.completed_at),
  ]);

  return (
    <div className="p-4">
      <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Credential Change Audit</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
              Review pre-login credential change attempts for email, mobile, and combined changes.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by PEN, status, email or mobile"
            />
            <ExportButtons
              onCSV={() => exportToCSV("credential-change-audit.csv", exportHeaders, exportRows)}
              onPDF={() => exportToPDF("Credential Change Audit", exportHeaders, exportRows, "credential-change-audit.pdf")}
              onExcel={() =>
                exportToExcel(
                  "Credential Change Audit",
                  filteredRequests.map((request) => ({
                    pen_number: request.pen_number,
                    change_type: changeTypeLabelMap[request.requested_change_type] || request.requested_change_type,
                    current_email: request.current_email,
                    current_mobile: request.current_mobile,
                    new_email: request.new_email,
                    new_mobile: request.new_mobile,
                    first_login: request.is_first_login ? "Yes" : "No",
                    status: formatStatusLabel(request.status),
                    initiated_at: formatDate(request.initiated_at),
                    completed_at: formatDate(request.completed_at),
                  })),
                  "credential-change-audit.xlsx"
                )
              }
            />
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveStatusTab(tab.key)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeStatusTab === tab.key
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-300">
            Loading credential change audit...
          </div>
        ) : currentRequests.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-300">
            No credential change audit records found for the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/40">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">PEN</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">Change Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">Current Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">New Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">First Login</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">Initiated</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                {currentRequests.map((request) => (
                  <tr key={request.recovery_request_id} className="align-top">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {request.pen_number || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                      {changeTypeLabelMap[request.requested_change_type] || request.requested_change_type || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                      <div>{request.current_email || "—"}</div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{request.current_mobile || "—"}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                      <div>{request.new_email || "—"}</div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{request.new_mobile || "—"}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                      {request.is_first_login ? "Yes" : "No"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusThemeMap[request.status] || "bg-slate-100 text-slate-800"}`}>
                        {formatStatusLabel(request.status)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                      {formatDate(request.initiated_at)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                      {formatDate(request.completed_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevious={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          onNext={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
        />
      </div>
    </div>
  );
}
