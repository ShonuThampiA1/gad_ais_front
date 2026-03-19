
'use client';

import React, { useState } from 'react';
import {
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  FunnelIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface PagePermission {
  id: number;
  pageName: string;
  url: string;
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
  approve: boolean;
  export: boolean;
}

const mockPermissions: PagePermission[] = [
  { id: 1, pageName: 'User List', url: '/admin/users', view: true, add: true, edit: true, delete: false, approve: false, export: true },
  { id: 2, pageName: 'Role List', url: '/admin/roles', view: true, add: false, edit: false, delete: false, approve: false, export: false },
  { id: 3, pageName: 'Menus', url: '/admin/rbac/menus', view: true, add: true, edit: true, delete: true, approve: false, export: false },
  { id: 4, pageName: 'Pages', url: '/admin/rbac/pages', view: true, add: true, edit: true, delete: true, approve: false, export: false },
  { id: 5, pageName: 'Beneficiary List', url: '/beneficiaries', view: true, add: true, edit: false, delete: false, approve: false, export: true },
  { id: 6, pageName: 'Applications', url: '/applications', view: true, add: true, edit: true, delete: false, approve: true, export: true },
];

export default function RolePagePermissionsPage() {
  const [selectedRole, setSelectedRole] = useState('Admin');
  const [permissions] = useState<PagePermission[]>(mockPermissions);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Role Page Permissions</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Configure action-level permissions for each page per role.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg transition-colors">
            <DocumentDuplicateIcon className="h-5 w-5 mr-2" />
            Clone from Role
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
            Save Permissions
          </button>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Role</label>
            <select 
              className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              {['Super Admin', 'Admin', 'Officer', 'Editor', 'Viewer'].map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Module/Menu</label>
            <select className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">All Modules</option>
              <option value="admin">Administration</option>
              <option value="rbac">RBAC</option>
              <option value="reports">Reports</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Search Page</label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Find page..."
                className="w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
           <button className="flex items-center px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 transition-colors">
            <FunnelIcon className="h-4 w-4 mr-2" />
            Advanced Matrix Filter
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800">
                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider min-w-[200px]">Page Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider text-center">View</th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider text-center">Add</th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider text-center">Edit</th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider text-center">Delete</th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider text-center">Approve</th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider text-center">Export</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {permissions.map((perm) => (
                <tr key={perm.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-neutral-900 dark:text-white">{perm.pageName}</span>
                      <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mt-0.5">{perm.url}</span>
                    </div>
                  </td>
                  {['view', 'add', 'edit', 'delete', 'approve', 'export'].map((action) => (
                    <td key={action} className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <label className="relative inline-flex items-center cursor-pointer group">
                          <input type="checkbox" className="sr-only peer" checked={(perm as any)[action]} readOnly />
                          <div className="w-11 h-6 bg-neutral-200 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500 group-hover:ring-4 group-hover:ring-blue-500/10"></div>
                        </label>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend / Footer Actions */}
        <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <XMarkIcon className="h-4 w-4 text-neutral-300" />
              <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">Disabled</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Reset All
            </button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
              Save Permissions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
