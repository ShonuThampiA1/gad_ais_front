'use client';

import { useEffect, useMemo, useState } from 'react';
import { EyeIcon } from '@heroicons/react/16/solid';
import axiosInstance from '@/utils/apiClient';
import { useRouter } from 'next/navigation';
import {
  SearchBar,
  ExportButtons,
  PaginationControls,
  exportToCSV,
  exportToPDF,
  exportToExcel,
} from '@/app/components/dataTableControls';

const BASE_PATH = '/rbac/superadmin-dashboard/officer-verification-list';

export default function SuperAdminOfficerVerificationListPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('total');
  const itemsPerPage = 50;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlFilter = params.get('filter');
    const validFilters = ['total', 'pending', 'approved', 'returned'];
    const nextFilter = validFilters.includes(urlFilter) ? urlFilter : 'total';
    setFilter(nextFilter);
    setCurrentPage(1);

    const expected = `${BASE_PATH}?filter=${nextFilter}`;
    if (window.location.pathname + window.location.search !== expected) {
      router.replace(expected, { scroll: false });
    }
  }, [router]);

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get('/admin/all-submitted-profiles');
        const profileData = JSON.parse(response?.data?.data?.pending_profiles || '[]');
        if (Array.isArray(profileData)) {
          setProfiles(profileData);
        } else {
          throw new Error('Invalid data');
        }
      } catch (err) {
        console.error(err);
        setError(err.message || 'Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const stageMap = {
    ACT02: 'Pending for Approval',
    ACT03: 'Returned for Correction',
    ACT04: 'Approved',
  };

  const titleMap = {
    total: 'All Profiles',
    pending: 'Pending Profile List',
    approved: 'Approved Profiles',
    returned: 'Returned for Correction Profiles',
  };

  const updateFilter = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
    router.replace(`${BASE_PATH}?filter=${newFilter}`, { scroll: false });
  };

  const filteredProfiles = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    let filtered = profiles.filter((p) =>
      `${p.fullname ?? ''} ${p.pen_number ?? ''}`.toLowerCase().includes(q)
    );

    if (filter !== 'total') {
      const stage = { pending: 'ACT02', approved: 'ACT04', returned: 'ACT03' }[filter];
      if (stage) filtered = filtered.filter((p) => p.stage_code === stage);
    }

    return filtered;
  }, [profiles, searchTerm, filter]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentProfiles = filteredProfiles.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage);

  const exportData = filteredProfiles.map((p, i) => ({
    'Sl. No': i + 1,
    Name: p.fullname || 'N/A',
    PEN: p.pen_number || 'N/A',
    Status: stageMap[p.stage_code] || 'N/A',
  }));

  const handleViewProfile = (id) => {
    sessionStorage.setItem('selected_profile_id', id);
    router.push(`/rbac/superadmin-dashboard/preview-profile?id=${id}`);
  };

  const title = titleMap[filter] || 'Profile List';
  const hasData = filteredProfiles.length > 0;
  const showTable = !loading && !error && hasData;

  return (
    <div className="p-4 max-w-full">
      <div className="overflow-hidden rounded-2xl border border-gray-200/50 bg-white/95 shadow-lg backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/95">
        <div className="border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-5 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
          <div className="flex flex-col items-start justify-between gap-5 lg:flex-row lg:items-center">
            <div className="flex-1">
              <h3 className="text-xl font-bold uppercase tracking-wide text-indigo-700 dark:text-indigo-400">
                {title} <span className="text-sm font-medium text-gray-600 dark:text-gray-400">({filteredProfiles.length})</span>
              </h3>

              <div className="mt-4 flex flex-wrap gap-1">
                {Object.entries(titleMap).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => updateFilter(key)}
                    className={`relative rounded-t-lg px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                      filter === key
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md'
                        : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-indigo-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-indigo-400'
                    }`}
                  >
                    {label}
                    {filter === key ? <span className="absolute inset-x-0 bottom-0 h-1 rounded-t-full bg-indigo-400" /> : null}
                  </button>
                ))}
              </div>

              <div className="mt-5">
                <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search by Name / PEN"
                  className="max-w-md"
                />
              </div>
            </div>

            {hasData ? (
              <ExportButtons
                onCSV={() => exportToCSV(`${filter}-profiles.csv`, exportData)}
                onPDF={() => exportToPDF(title, exportData, `${filter}-profiles.pdf`)}
                onExcel={() => exportToExcel(filter, exportData, `${filter}-profiles.xlsx`)}
              />
            ) : null}
          </div>
        </div>

        {loading ? <div className="p-12 text-center text-gray-600 dark:text-gray-400">Loading profiles...</div> : null}
        {error && !loading ? <div className="p-12 text-center font-medium text-red-600 dark:text-red-400">Error: {error}</div> : null}
        {!loading && !error && !hasData ? <div className="p-12 text-center text-gray-500 dark:text-gray-400">No {filter} profiles found.</div> : null}

        {showTable ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-50 to-indigo-100 text-left text-xs font-bold uppercase tracking-wider text-indigo-800 dark:from-indigo-900/30 dark:to-indigo-800/30 dark:text-indigo-300">
                    <th className="px-6 py-4">Sl. No</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">PEN</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                  {currentProfiles.map((profile, index) => (
                    <tr key={profile.item_id} className="transition-colors duration-200 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20">
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{indexOfFirst + index + 1}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{profile.fullname ?? 'N/A'}</td>
                      <td className="px-6 py-4 font-mono text-sm text-indigo-600 dark:text-indigo-400">{profile.pen_number ?? 'N/A'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            profile.stage_code === 'ACT02'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                              : profile.stage_code === 'ACT03'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                : profile.stage_code === 'ACT04'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {stageMap[profile.stage_code] ?? 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleViewProfile(profile.item_id)}
                          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 p-2 text-white transition-all duration-200 hover:bg-indigo-700 hover:shadow-md"
                          title="View Profile"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/50">
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPrevious={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                onNext={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
