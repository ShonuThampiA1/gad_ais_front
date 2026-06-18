'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, EyeIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import axiosInstance from '@/utils/apiClient';
import { ModalOfficialDetails } from '@/app/(officer)/official/modal/official-details';  // changed import

import {
  SearchBar,
  ExportButtons,
  PaginationControls,
  exportToCSV,
  exportToPDF,
  exportToExcel,
  ReminderNotificationControls,
} from '@/app/components/dataTableControls';
import { toast } from "react-toastify";
import { formatDateTime } from '../../utils/dateFormat';

const serviceTypeMap = {
  1: 'IAS',
  2: 'IPS',
  3: 'IFS',
};

function getOfficerName(item) {
  return (
    item?.name ||
    item?.fullname ||
    [item?.first_name, item?.last_name].filter(Boolean).join(' ') ||
    'N/A'
  );
}

function getOfficerService(item) {
  return serviceTypeMap[item?.service_type_id] ?? item?.service_type ?? 'Unknown';
}

export default function SuperadminOfficerList({
  title,
  endpoint,
  exportFilePrefix,
  enablePreview = false,
  editRoute
}) {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState(null);  // renamed from selectedAdmin
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [officerList, setOfficerList] = useState([]);
  const [selectedOfficerList, setSelectedOfficerList] = useState([]);

  const itemsPerPage = 50;

  // Extract fetch function so it can be reused
  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await axiosInstance.get(endpoint);
      const payload = response?.data?.data;
      const records = Array.isArray(payload) ? payload : payload?.officers || [];
      setData(records);
      setSelectedUsers(records.map((item) => item.user_id));
      setSelectedOfficerList(records);
      setOfficerList(records);
    } catch (error) {
      console.error(`Error fetching ${title}:`, error);
      setErrorMessage(error?.response?.data?.detail || error?.message || 'Failed to fetch records');
      setData([]);
    } finally {
      setLoading(false);
    }
    
  }, [endpoint, title]);

  const handleEdit = (officer) => {
    setSelectedOfficer(officer);
    setOpenModal(true);
  };

  const filteredData = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return data.filter((item) => {
      const searchable = [
        getOfficerName(item),
        item?.pen_number,
        item?.email,
        item?.mobile_no,
        item?.created_at ? formatDateTime(item.created_at) : '',
        item?.pending_days ? item.pending_days.toString() : '',
        item?.reminder_count ? item.reminder_count.toString() : '',
        item?.last_reminder_sent_date ? formatDateTime(item.last_reminder_sent_date) : '',
        getOfficerService(item),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return searchable.includes(q);
    });
  }, [data, searchTerm]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const exportRows = filteredData.map((item, idx) => ({
    'Sl. No': idx + 1,
    Name: getOfficerName(item),
    PEN: item?.pen_number ?? '',
    Email: item?.email ?? '',
    Mobile: item?.mobile_no ?? '',
    'Service Type': getOfficerService(item),
  }));

  const exportHeaders = ['Sl. No','PEN', 'Email', 'Mobile', 'Service Type'];
  if (endpoint === '/admin/first-login-pending') {
    exportRows.forEach((row, idx) => {
      const item = filteredData[idx];
      row['Onboarding Date'] = item?.created_at ? formatDateTime(item.created_at) : '';
      row['Days Pending'] = item?.pending_days ?? '';
      row['Reminder Count'] = item?.reminder_count ?? '';
      row['Last Reminder Date'] = item?.last_reminder_sent_date ? formatDateTime(item.last_reminder_sent_date) : '';
    });
    exportHeaders.push('Onboarding Date', 'Days Pending', 'Reminder Count', 'Last Reminder Date');
  }
  const exportMatrix = exportRows.map((row) => exportHeaders.map((header) => row[header] ?? ''));

  const handleViewProfile = (itemId) => {
    if (!itemId) return;
    sessionStorage.setItem('selected_profile_id', itemId);
    router.push(`/rbac/superadmin-dashboard/preview-profile?id=${itemId}`);
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
  }, [fetchData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="mb-3 rounded-xl border bg-white p-3 dark:border-gray-900 dark:bg-gray-800">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 px-3 py-4 dark:border-gray-700">
        <div className="min-w-0 flex-1">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 rounded-lg border border-indigo-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300"
          >
            <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" strokeWidth={2.5} />
            Back
          </button>
          <h3 className="pt-5 text-base font-semibold uppercase text-indigo-700 dark:text-white">{title}</h3>
          <div className="mt-5 w-full max-w-xl">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder={`Search by PEN / Email / Mobile / Service Type ${endpoint === '/admin/first-login-pending' ? ' / Date' : ''}`}
            />
          </div>
        </div>

        <div className="mt-6 pt-6 flex shrink-0 flex-col items-end gap-2">
          {endpoint === '/admin/first-login-pending' && (
            <ReminderNotificationControls 
              selectedUsers={selectedUsers}
              selectedOfficerList={selectedOfficerList}
              reminderHistoryPath={'/rbac/superadmin-dashboard/login-pendings/reminder-history'}
            />
          )}
          <ExportButtons
            onCSV={() => exportToCSV(`${exportFilePrefix}.csv`, exportHeaders, exportMatrix)}
            onPDF={() => exportToPDF(title, exportHeaders, exportMatrix, `${exportFilePrefix}.pdf`)}
            onExcel={() => exportToExcel(title, exportRows, `${exportFilePrefix}.xlsx`)}
          />
        </div>
      </div>

      {loading ? (
        <div className="py-6 text-center text-gray-600 dark:text-gray-200">Loading officers...</div>
      ) : (
        <div className="mx-auto w-full overflow-x-auto">
          {errorMessage ? <div className="py-3 text-center font-medium text-red-600">{errorMessage}</div> : null}

          <table className="w-full table-auto border-collapse text-left">
            <thead className="text-sm text-gray-600">
              <tr>
                {endpoint === '/admin/first-login-pending' && (
                  <th className="py-3 text-xs font-medium uppercase text-start">
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
                )}
                <th className="px-3 py-3 text-xs font-medium uppercase">Sl. No</th>
                <th className="px-3 py-3 text-xs font-medium uppercase">PEN</th>
                <th className="px-3 py-3 text-xs font-medium uppercase">Email</th>
                <th className="px-3 py-3 text-xs font-medium uppercase">Mobile</th>
                <th className="px-3 py-3 text-xs font-medium uppercase">Service Type</th>
                {endpoint === '/admin/first-login-pending' && (
                  <>
                    <th className="px-3 py-3 text-center text-xs font-medium uppercase">Onboarding Date</th>
                    <th className="px-3 py-3 text-center text-xs font-medium uppercase">Days Pending</th>
                    <th className="px-3 py-3 text-center text-xs font-medium uppercase">Reminder Count</th>
                    <th className="px-3 py-3 text-center text-xs font-medium uppercase">Last Reminder Date</th>
                    <th className="px-3 py-3 text-center text-xs font-medium uppercase">Action</th>
                  </>
                )}
                {enablePreview ? <th className="px-3 py-3 text-center text-xs font-medium uppercase">View</th> : null}
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, index) => (
                <tr
                  key={`${item?.item_id || item?.pen_number || index}`}
                  className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700"
                >
                  {endpoint === '/admin/first-login-pending' && (
                    <td className="px-3 py-3 text-sm text-gray-900 dark:text-white text-end">
                      <input
                        type="checkbox"
                        className="mr-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={selectedUsers.includes(item?.user_id)}
                          onChange={() => handleToggleReminder(item)}
                        />
                    </td>
                  )}
                  <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">{indexOfFirst + index + 1}</td>
                  <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">{item?.pen_number ?? 'N/A'}</td>
                  <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">{item?.email ?? 'N/A'}</td>
                  <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">{item?.mobile_no ?? 'N/A'}</td>
                  <td className="px-3 py-3 text-sm text-gray-900 dark:text-white text-center">{getOfficerService(item)}</td>
                  {endpoint === '/admin/first-login-pending' && (
                    <>
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
                    </>
                  )}
                  {enablePreview ? (
                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={() => handleViewProfile(item?.item_id)}
                        className="inline-flex items-center justify-center rounded-lg bg-indigo-600 p-2 text-white transition-all duration-200 hover:bg-indigo-700 hover:shadow-md"
                        title="View Profile"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </td>
                  ) : null}
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

      {/* Modal Integration */}
      <ModalOfficialDetails
        open={openModal}
        setOpen={setOpenModal}
        officer={selectedOfficer}
        onSave={fetchData}   // Refreshes the list after save
      />
    </div>
  );
}