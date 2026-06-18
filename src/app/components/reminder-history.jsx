'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import axiosInstance from '@/utils/apiClient';

import {
  SearchBar,
  ExportButtons,
  PaginationControls,
  exportToCSV,
  exportToPDF,
  exportToExcel,
} from '@/app/components/dataTableControls';
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

export default function ReminderHistory({
  title,
  endpoint,
  exportFilePrefix
}) {
  const router = useRouter();
  const [reminderData, setReminderData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');

  const itemsPerPage = 50;

  // Extract fetch function so it can be reused
  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await axiosInstance.get(endpoint);
      const payload = response?.data?.data;
      const records = Array.isArray(payload) ? payload : payload?.officers || [];
      setReminderData(records);
    } catch (error) {
      console.error(`Error fetching ${title}:`, error);
      setErrorMessage(error?.response?.data?.detail || error?.message || 'Failed to fetch records');
      setReminderData([]);
    } finally {
      setLoading(false);
    }
  }, [endpoint, title]);

  const filteredData = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return reminderData.filter((item) => {
      const searchable = [
        item?.template_used,
        item?.sent_by,
        item?.email,
        item?.sent_date_time ? formatDateTime(item.sent_date_time) : null,
        item?.email_status === 'sent' ? 'Sent' : item?.email_status === 'pending' ? 'Pending' : 'Failed',
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return searchable.includes(q);
    });
  }, [reminderData, searchTerm]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const exportRows = filteredData.map((item, idx) => ({
      'Sl. No': idx + 1,
      'Email': item?.email_id ?? '',
      'Template Used': item?.template_used ?? '',
      'Sent By': item?.sent_by ?? '',
      'Sent Date': item?.sent_date_time ? formatDateTime(item.sent_date_time) : '',
      'Email Status': item?.email_status === 'sent' ? 'Sent' : item?.email_status === 'pending' ? 'Pending' : 'Failed',
    }));

  const exportHeaders = ['Sl. No','Email', 'Template Used', 'Sent By', 'Sent Date', 'Email Status'];
  const exportMatrix = exportRows.map((row) => exportHeaders.map((header) => row[header] ?? ''));
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="mb-3 rounded-xl border bg-white p-3 dark:border-gray-900 dark:bg-gray-800">
      <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-3 py-4 dark:border-gray-700">
        <div className="min-w-0">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 rounded-lg border border-indigo-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300"
          >
            <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" strokeWidth={2.5} />
            Back
          </button>
          <h3 className="pt-5 text-base font-semibold uppercase text-indigo-700 dark:text-white">{title}</h3>
          <div className="mt-5 w-full md:w-96">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by Email ID / Template Used / Sent By / Sent Date / Email Status"
            />
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <ExportButtons
            onCSV={() => exportToCSV(`${exportFilePrefix}.csv`, exportHeaders, exportMatrix)}
            onPDF={() => exportToPDF(title, exportHeaders, exportMatrix, `${exportFilePrefix}.pdf`)}
            onExcel={() => exportToExcel(title, exportRows, `${exportFilePrefix}.xlsx`)}
          />
        </div>
      </div>

      {loading ? (
        <div className="py-6 text-center text-gray-600 dark:text-gray-200">Loading data...</div>
      ) : (
        <div className="mx-auto w-full overflow-x-auto">
          <table className="w-full table-auto border-collapse text-left">
            <thead className="text-sm text-gray-600">
              <tr>
                <th className="px-3 py-3 text-xs font-medium uppercase">Sl. No</th>
                <th className="px-3 py-3 text-xs font-medium uppercase">Email</th>
                <th className="px-3 py-3 text-xs font-medium uppercase">Template Used</th>
                <th className="px-3 py-3 text-xs font-medium uppercase">Sent By</th>
                <th className="px-3 py-3 text-xs font-medium uppercase">Sent Date</th>
                <th className="px-3 py-3 text-xs font-medium uppercase">Email Status</th>
              </tr>
            </thead>

            <tbody>
              {currentItems.map((item, index) => (
                <tr
                  key={`${item?.item_id || item?.pen_number || index}`}
                  className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700"
                >
                  <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">{indexOfFirst + index + 1}</td>
                  <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">{item?.email_id ?? 'N/A'}</td>
                  <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">{item?.template_used ?? 'N/A'}</td>
                  <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">{item?.sent_by ?? 'N/A'}</td>
                  <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">{formatDateTime(item?.sent_date_time) ?? 'N/A'}</td>
                  <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">
                    {item?.email_status ==='sent' ? 
                        <span className="h-5 w-5 bg-green-200 text-green-500 p-2 rounded-md"> Sent </span> : 
                        item?.email_status ==='pending' ? 
                            <span className="h-5 w-5 bg-yellow-200 text-yellow-500 p-2 rounded-md"> Pending </span> : 
                            <span className="h-5 w-5 bg-gray-200 text-gray-500 p-2 rounded-md"> Failed </span>
                    }
                  </td>
                </tr>
              ))}
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-3 py-3 text-gray-500 text-center text-sm dark:text-white">No data found.</td>
                </tr>
              )}
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
    </div>
  );
}