"use client";

import { useState, useEffect, useMemo } from "react";
import axiosInstance from "@/utils/apiClient";
import { extractErrorMessage, getErrorMessage } from "@/utils/serviceTypeUtils";
import { useRouter } from "next/navigation";
import { PencilSquareIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { ModalOfficialDetails } from "../../modal/official-details";
import {
  SearchBar,
  ExportButtons,
  PaginationControls,
  exportToCSV,
  exportToPDF,
  exportToExcel,
  ReminderNotificationControls,
} from "@/app/components/dataTableControls";
import { formatDateTime } from "../../../../../utils/dateFormat";

// Service type mapping
const serviceTypeMap = {
  1: "IAS",
  2: "IPS",
  3: "IFS",
};

export default function LoginPendingOfficersPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [openModal, setOpenModal] = useState(false)
  const [selectedOfficer, setSelectedOfficer] = useState(null)
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [officerList, setOfficerList] = useState([]);
  const [selectedOfficerList, setSelectedOfficerList] = useState([]);

  const itemsPerPage = 50;
  const router = useRouter();
  const handleEdit = (officer) => {
  // debug
    setSelectedOfficer(officer)
    setOpenModal(true)
  }

  // Fetch officers
  const fetchData = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await axiosInstance.get("/as-II/first-login-pending");
      const payload = response?.data?.data;
      const records = Array.isArray(payload) ? payload : payload?.officers || [];
      setData(records);
      setSelectedUsers(records.map((item) => item.user_id));
      setSelectedOfficerList(records);
      setOfficerList(records);
    } catch (error) {
      console.error("Error fetching officers:", error);

      const status = error.response?.status;
      const backendMessage = extractErrorMessage(error);
      const message = getErrorMessage(status, backendMessage);

      setErrorMessage(message);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Search filtering
  const filteredData = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return data.filter((item) => {
      const searchable = [
        item?.pen_number,
        item?.email,
        item?.mobile_no,
        item?.created_at ? formatDateTime(item.created_at) : '',
        item?.pending_days ? item.pending_days.toString() : '',
        item?.reminder_count ? item.reminder_count.toString() : '',
        item?.last_reminder_sent_date ? formatDateTime(item.last_reminder_sent_date) : '',
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return searchable.includes(q);
    });
  }, [data, searchTerm]);

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;

  const currentItems = filteredData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "Sl. No",
      "PEN",
      "Email",
      "Mobile",
      "Service Type",
      'Onboarding Date',
      'Days Pending',
      'Reminder Count',
      'Last Reminder Date',
    ];

    const rows = filteredData.map((item, idx) => [
      idx + 1,
      item.pen_number ?? "",
      item.email ?? "",
      item.mobile_no ?? "",
      serviceTypeMap[item.service_type_id] ?? "Unknown",
      item?.created_at ? formatDateTime(item.created_at) : '',
      item?.pending_days ? item.pending_days.toString() : '',
      item?.reminder_count ? item.reminder_count.toString() : '',
      item?.last_reminder_sent_date ? formatDateTime(item.last_reminder_sent_date) : '',
    ]);

    exportToCSV("login-pending-officers.csv", headers, rows);
  };

  // Export PDF
  const handleExportPDF = () => {
    const headers = [
      "Sl. No",
      "PEN",
      "Email",
      "Mobile",
      "Service Type",
      'Onboarding Date',
      'Days Pending',
      'Reminder Count',
      'Last Reminder Date',
    ];

    const rows = filteredData.map((item, idx) => [
      idx + 1,
      item.pen_number ?? "",
      item.email ?? "",
      item.mobile_no ?? "",
      serviceTypeMap[item.service_type_id] ?? "Unknown",
      item?.created_at ? formatDateTime(item.created_at) : '',
      item?.pending_days ? item.pending_days.toString() : '',
      item?.reminder_count ? item.reminder_count.toString() : '',
      item?.last_reminder_sent_date ? formatDateTime(item.last_reminder_sent_date) : '',
    ]);

    exportToPDF(
      "Login Pending Officers",
      headers,
      rows,
      "login-pending-officers.pdf",
    );
  };

  // Export Excel
  const handleExportExcel = () => {
    const excelData = filteredData.map((item, idx) => ({
      "Sl. No": idx + 1,
      PEN: item.pen_number ?? "",
      Email: item.email ?? "",
      Mobile: item.mobile_no ?? "",
      "Service Type": serviceTypeMap[item.service_type_id] ?? "Unknown",
      'Onboarding Date': item?.created_at ? formatDateTime(item.created_at) : '',
      'Days Pending': item?.pending_days ?? '',
      'Reminder Count': item?.reminder_count ?? '',
      'Last Reminder Date': item?.last_reminder_sent_date ? formatDateTime(item.last_reminder_sent_date) : '',
    }));

    exportToExcel(
      "Login Pending Officers",
      excelData,
      "login-pending-officers.xlsx",
    );
  };
    
  const handleSelectAll = () => {
    if (selectedUsers.length === data.length) {
      setSelectedUsers([]);
      setSelectedOfficerList([]);
    } else {
      setSelectedUsers(data.map((item) => item?.user_id));
      setSelectedOfficerList(data);
    }
  }
   
  const handleToggleReminder = (item) => {
    const itemId = item?.user_id;
    if (!itemId) return;

    setSelectedUsers((prev) => {
      const updatedUsers = prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId];

      setSelectedOfficerList(
        officerList.filter((officer) =>
          updatedUsers.includes(officer.user_id)
        )
      );

      return updatedUsers;
    });
  };
  
  useEffect(() => {
    fetchData();
  }, []);

  // Reset pagination on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="mb-3 rounded-xl border bg-white p-3 dark:border-gray-900 dark:bg-gray-800">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 px-3 py-4 dark:border-gray-700">
        <div className="min-w-0 flex-1">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 bg-white border border-indigo-300 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" strokeWidth={2.5} />
            Back
          </button>

          <h3 className="text-base font-semibold text-indigo-700 dark:text-white pt-5 uppercase">
            Login Pending Officers
          </h3>

          {/* Search */}
          <div className="mt-5 w-full max-w-xl">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by PEN / Email / Mobile / Service Type / Date"
            />
          </div>
        </div>

        <div className="mt-6 pt-6 flex shrink-0 flex-col items-end gap-2">
          <ReminderNotificationControls 
            selectedUsers={selectedUsers}
            selectedOfficerList={selectedOfficerList}
            reminderHistoryPath={'/official/dashboard/login-pendings/reminder-history'}
          />
          <ExportButtons
            onCSV={handleExportCSV}
            onPDF={handleExportPDF}
            onExcel={handleExportExcel}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-6 text-gray-600 dark:text-gray-200">
          Loading officers...
        </div>
      ) : (
        <div className="mx-auto w-full overflow-x-auto">
          {errorMessage && (
            <div className="text-red-600 text-center py-3 font-medium">
              {errorMessage}
            </div>
          )}

          <table className="table-auto w-full text-left border-collapse">
            <thead className="text-gray-600 text-sm">
              <tr>
                <th className="px-1 py-3 text-xs font-medium uppercase text-start">
                  {/* Send Reminder */}
                  {currentItems.length > 0 && (
                    <input
                      type="checkbox"
                      className="ml-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      checked={selectedUsers.length === data.length}
                      onChange={handleSelectAll}
                      title="Select All"
                    />
                  )}
                </th>
                <th className="px-3 py-3 text-xs font-medium uppercase">
                  Sl. No
                </th>
                <th className="px-3 py-3 text-xs font-medium uppercase">PEN</th>
                <th className="px-3 py-3 text-xs font-medium uppercase">
                  Email
                </th>
                <th className="px-3 py-3 text-xs font-medium uppercase">
                  Mobile
                </th>
                <th className="px-3 py-3 text-xs font-medium uppercase">
                  Service Type
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium uppercase">Onboarding Date</th>
                <th className="px-3 py-3 text-center text-xs font-medium uppercase">Days Pending</th>
                <th className="px-3 py-3 text-center text-xs font-medium uppercase">Reminder Count</th>
                <th className="px-3 py-3 text-center text-xs font-medium uppercase">Last Reminder Date</th>
                <th className="px-3 py-3 text-xs font-medium uppercase">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {currentItems.map((item, index) => (
                <tr
                  key={item.pen_number}
                  className="odd:bg-white odd:dark:bg-gray-800 even:bg-gray-50 even:dark:bg-gray-700"
                >
                  <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">
                    <input
                      type="checkbox"
                      className="mr-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      checked={selectedUsers.includes(item?.user_id)}
                        onChange={() => handleToggleReminder(item)}
                      />
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">
                    {indexOfFirst + index + 1}
                  </td>

                  <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">
                    {item.pen_number}
                  </td>

                  <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">
                    {item.email}
                  </td>

                  <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">
                    {item.mobile_no}
                  </td>

                  <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">
                    {serviceTypeMap[item.service_type_id] ?? "Unknown"}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-900 dark:text-white text-center">{item?.created_at ? formatDateTime(item?.created_at) : 'N/A'}</td>
                  <td className="px-3 py-3 text-sm text-gray-900 dark:text-white text-center">{item?.pending_days ?? 'N/A'}</td>
                  <td className="px-3 py-3 text-sm text-gray-900 dark:text-white text-center">{item?.reminder_count ?? 0}</td>
                  <td className="px-3 py-3 text-sm text-gray-900 dark:text-white text-center">{item?.last_reminder_sent_date ? formatDateTime(item?.last_reminder_sent_date) : 'N/A'}</td>
                  <td className="px-3 py-3 text-sm text-center">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 text-indigo-600 hover:bg-indigo-100 dark:hover:bg-gray-700 rounded"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
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
        onPrevious={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        onNext={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
      />
      <ModalOfficialDetails
        open={openModal}
        setOpen={setOpenModal}
        officer={selectedOfficer}
        onSave={fetchData} // VERY IMPORTANT
      />
    </div>
    
  );
}
