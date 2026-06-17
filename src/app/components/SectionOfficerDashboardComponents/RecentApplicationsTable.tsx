'use client';

import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const mockApplications = [
  { id: 'MR-2024-001', applicant: 'John Doe', department: 'Health', amount: '₹12,500', date: '2024-03-15', status: 'Pending', description: 'Reimbursement for diagnostic tests.' },
  { id: 'MR-2024-002', applicant: 'Jane Smith', department: 'Education', amount: '₹8,200', date: '2024-03-14', status: 'Approved', description: 'Routine medical checkup.' },
  { id: 'MR-2024-003', applicant: 'Robert Johnson', department: 'Police', amount: '₹45,000', date: '2024-03-12', status: 'Rejected', description: 'Inpatient hospital stay.' },
  { id: 'MR-2024-004', applicant: 'Emily Davis', department: 'Revenue', amount: '₹3,500', date: '2024-03-10', status: 'Reverted', description: 'Dental procedure.' },
  { id: 'MR-2024-005', applicant: 'Michael Wilson', department: 'Transport', amount: '₹21,000', date: '2024-03-09', status: 'Pending', description: 'Surgery costs.' },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Approved':
      return <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Approved</span>;
    case 'Pending':
      return <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">Pending</span>;
    case 'Rejected':
      return <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">Rejected</span>;
    case 'Reverted':
      return <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-600/10">Reverted</span>;
    default:
      return <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">{status}</span>;
  }
};

const RecentApplicationsTable = () => {
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [remark, setRemark] = useState('');
  const [applications, setApplications] = useState(mockApplications);

  const handleView = (app: any) => {
    setSelectedApp(app);
    setRemark(''); // Reset remark when opening a new application
  };

  const handleCloseModal = () => {
    setSelectedApp(null);
  };

  const handleAction = (action: string) => {
    if (!selectedApp) return;

    // Simulate updating the status
    const updatedApps = applications.map(app =>
      app.id === selectedApp.id ? { ...app, status: action } : app
    );
    setApplications(updatedApps);

    // In a real app, we'd send the `remark` and `action` to an API here
    console.log(`Application ${selectedApp.id} ${action} with remark: ${remark}`);

    handleCloseModal();
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-100 dark:border-gray-700 p-6 h-full">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Medical Applications</h2>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button type="button" className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
              View All
            </button>
          </div>
        </div>
        <div className="mt-6 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-300 sm:pl-0">Application ID</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-300">Applicant</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-300">Amount</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-300">Date</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-300">Status</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0 text-left text-sm font-semibold text-gray-900 dark:text-gray-300">
                      <span className="">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-0">{app.id}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        <div>{app.applicant}</div>
                        <div className="text-xs text-gray-400">{app.department}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{app.amount}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{app.date}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{getStatusBadge(app.status)}</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-left text-sm font-medium sm:pr-0 flex gap-2">
                        <button
                          onClick={() => handleView(app)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-md"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* View Application Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Application Details - {selectedApp.id}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Applicant</p>
                  <p className="text-base text-gray-900 dark:text-white">{selectedApp.applicant}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</p>
                  <p className="text-base text-gray-900 dark:text-white">{selectedApp.department}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount Claimed</p>
                  <p className="text-base text-gray-900 dark:text-white">{selectedApp.amount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date Submitted</p>
                  <p className="text-base text-gray-900 dark:text-white">{selectedApp.date}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Status</p>
                  <div className="mt-1">{getStatusBadge(selectedApp.status)}</div>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</p>
                  <p className="text-base text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md mt-1">
                    {selectedApp.description}
                  </p>
                </div>
              </div>

              {selectedApp.status === 'Pending' && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <label htmlFor="remark" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Action Remark (Required)
                  </label>
                  <textarea
                    id="remark"
                    rows={3}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                    placeholder="Enter remark for approval/rejection..."
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Footer / Actions */}
            {selectedApp.status === 'Pending' ? (
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => handleAction('Reverted')}
                  disabled={!remark.trim()}
                  className="px-4 py-2 text-sm font-semibold text-orange-700 bg-orange-100 hover:bg-orange-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Revert
                </button>
                <button
                  onClick={() => handleAction('Rejected')}
                  disabled={!remark.trim()}
                  className="px-4 py-2 text-sm font-semibold text-red-700 bg-red-100 hover:bg-red-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleAction('Approved')}
                  disabled={!remark.trim()}
                  className="px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Approve
                </button>
              </div>
            ) : (
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md shadow-sm dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default RecentApplicationsTable;
