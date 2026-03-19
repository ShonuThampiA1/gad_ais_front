
'use client';

import React, { useState } from 'react';
import {
  MagnifyingGlassIcon,
  UserCircleIcon,
  FunnelIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface UserPermissionOverride {
  id: number;
  pageName: string;
  url: string;
  view: 'inherited-allow' | 'inherited-deny' | 'override-allow' | 'override-deny';
  add: 'inherited-allow' | 'inherited-deny' | 'override-allow' | 'override-deny';
  edit: 'inherited-allow' | 'inherited-deny' | 'override-allow' | 'override-deny';
  delete: 'inherited-allow' | 'inherited-deny' | 'override-allow' | 'override-deny';
  approve: 'inherited-allow' | 'inherited-deny' | 'override-allow' | 'override-deny';
}

const mockUserPermissions: UserPermissionOverride[] = [
  { id: 1, pageName: 'User List', url: '/admin/users', view: 'inherited-allow', add: 'override-allow', edit: 'inherited-allow', delete: 'override-deny', approve: 'inherited-deny' },
  { id: 2, pageName: 'Role List', url: '/admin/roles', view: 'inherited-allow', add: 'inherited-deny', edit: 'inherited-deny', delete: 'inherited-deny', approve: 'inherited-deny' },
  { id: 3, pageName: 'Beneficiary List', url: '/beneficiaries', view: 'override-allow', add: 'inherited-allow', edit: 'inherited-deny', delete: 'inherited-deny', approve: 'inherited-deny' },
];

export default function UserPagePermissionOverridePage() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [permissions] = useState<UserPermissionOverride[]>(mockUserPermissions);
  const [searchTerm, setSearchTerm] = useState('');

  const renderStateIcon = (state: UserPermissionOverride['view']) => {
    if (state === 'inherited-allow') return <CheckIcon className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />;
    if (state === 'inherited-deny') return <XMarkIcon className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />;
    if (state === 'override-allow') return <CheckIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 font-bold" />;
    if (state === 'override-deny') return <XMarkIcon className="h-5 w-5 text-red-600 dark:text-red-400 font-bold" />;
    return null;
  };

  const getStateStyles = (state: UserPermissionOverride['view']) => {
    if (state === 'override-allow') return 'bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500/20';
    if (state === 'override-deny') return 'bg-red-50 dark:bg-red-900/30 ring-2 ring-red-500/20';
    return 'bg-neutral-50 dark:bg-neutral-800/50';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">User Page Permission Override</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Grant or deny action-level permissions for specific users, overriding their role-based permissions.
          </p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
          Save Overrides
        </button>
      </div>

      {/* User Selection Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Search User</label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Name, email or username..."
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                onChange={(e) => setSelectedUser(e.target.value)}
              />
            </div>
          </div>
          {selectedUser && (
            <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <UserCircleIcon className="h-8 w-8" />
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Selected User: John Doe</h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Primary Role: <span className="font-semibold">Officer</span></p>
              </div>
              <div className="ml-auto flex flex-col items-end gap-1">
                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">ID: #USER-9421</span>
                <button className="text-xs text-blue-600 hover:underline">Change User</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Permission Matrix */}
      {!selectedUser ? (
        <div className="bg-neutral-50 dark:bg-neutral-800/50 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-2xl p-20 flex flex-col items-center justify-center text-center">
          <InformationCircleIcon className="h-12 w-12 text-neutral-300 dark:text-neutral-600 mb-4" />
          <h4 className="text-lg font-medium text-neutral-900 dark:text-white">No User Selected</h4>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xs mt-2">
            Please search and select a user above to manage their specific page permission overrides.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative max-w-sm w-full">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Find page..."
                className="w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
               <button className="flex items-center px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 transition-colors">
                <FunnelIcon className="h-4 w-4 mr-2" />
                Show Overridden Only
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800">
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider min-w-[200px]">Page Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">View</th>
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Add</th>
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Edit</th>
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Delete</th>
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Approve</th>
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
                    {['view', 'add', 'edit', 'delete', 'approve'].map((action) => (
                      <td key={action} className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <button 
                            className={`h-10 w-10 flex items-center justify-center rounded-xl transition-all ${getStateStyles((perm as any)[action])}`}
                          >
                            {renderStateIcon((perm as any)[action])}
                          </button>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center rounded text-[10px] text-neutral-400"><CheckIcon className="h-2.5 w-2.5" /></div>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">Inherited Allow</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center rounded text-[10px] text-neutral-400"><XMarkIcon className="h-2.5 w-2.5" /></div>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">Inherited Deny</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center rounded text-[10px] text-blue-600"><CheckIcon className="h-2.5 w-2.5" /></div>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">Override Allow</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-red-100 dark:bg-red-900/40 flex items-center justify-center rounded text-[10px] text-red-600"><XMarkIcon className="h-2.5 w-2.5" /></div>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">Override Deny</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Reset All Overrides
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
