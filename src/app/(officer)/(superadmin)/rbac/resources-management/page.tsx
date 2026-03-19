
'use client';

import React, { useState } from 'react';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CubeIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

interface Resource {
  id: number;
  key: string;
  category: string;
  action: string;
}

const mockResources: Resource[] = [
  { id: 1, key: 'user.create', category: 'USER', action: 'CREATE' },
  { id: 2, key: 'user.view', category: 'USER', action: 'VIEW' },
  { id: 3, key: 'user.edit', category: 'USER', action: 'EDIT' },
  { id: 4, key: 'application.view', category: 'APPLICATION', action: 'VIEW' },
  { id: 5, key: 'report.export', category: 'REPORT', action: 'EXPORT' },
  { id: 6, key: 'system.configure', category: 'SYSTEM', action: 'CONFIGURE' },
];

export default function ResourcesManagementPage() {
  const [resources] = useState<Resource[]>(mockResources);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Resources Management</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Manage fine-grained resource keys for API authorization and feature flags.
          </p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Resource
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {/* Header / Search */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by key, category or action..."
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <select className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all">
              <option value="">All Categories</option>
              <option value="USER">USER</option>
              <option value="APPLICATION">APPLICATION</option>
              <option value="REPORT">REPORT</option>
              <option value="SYSTEM">SYSTEM</option>
            </select>
            <button className="flex items-center px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 transition-colors">
              <FunnelIcon className="h-4 w-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800/50">
                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Resource Key</th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {resources.map((res) => (
                <tr key={res.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors group">
                  <td className="px-6 py-4 text-sm font-mono text-neutral-500 dark:text-neutral-400">
                    #{res.id}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-neutral-900 dark:text-white">
                    <div className="flex items-center">
                      <CubeIcon className="h-4 w-4 mr-2 text-neutral-400" />
                      {res.key}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                      {res.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
                      {res.action}
                    </span>
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
            Showing 1 to {resources.length} of {resources.length} resources
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
