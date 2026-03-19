
'use client';

import React, { useState } from 'react';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  LinkIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

interface PageMaster {
  id: number;
  name: string;
  url: string;
}

const mockPages: PageMaster[] = [
  { id: 1, name: 'Dashboard', url: '/dashboard' },
  { id: 2, name: 'User Management', url: '/admin/users' },
  { id: 3, name: 'Role Management', url: '/admin/roles' },
  { id: 4, name: 'Menus Management', url: '/admin/rbac/menus' },
  { id: 5, name: 'Pages Management', url: '/admin/rbac/pages' },
  { id: 6, name: 'Actions Management', url: '/admin/rbac/actions' },
  { id: 7, name: 'Beneficiary List', url: '/beneficiaries' },
];

export default function PagesManagementPage() {
  const [pages] = useState<PageMaster[]>(mockPages);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Pages Management</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Define and manage all application pages and their unique URLs.
          </p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Page
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {/* Table Header / Filters */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by page name or URL..."
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 transition-colors">
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800/50">
                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Page ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Page Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Page URL</th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors group">
                  <td className="px-6 py-4 text-sm font-mono text-neutral-500 dark:text-neutral-400">
                    #{page.id.toString().padStart(3, '0')}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-neutral-900 dark:text-white">
                    {page.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                    <div className="flex items-center">
                      <LinkIcon className="h-3.5 w-3.5 mr-2 text-neutral-400" />
                      {page.url}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button className="p-2 text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            Showing 1 to {pages.length} of {pages.length} entries
          </span>
          <div className="flex items-center gap-2">
            <button className="p-2 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg disabled:opacity-50" disabled>
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <button className="px-3 py-1 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg font-medium">1</button>
            <button className="p-2 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
