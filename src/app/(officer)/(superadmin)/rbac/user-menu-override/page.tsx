
'use client';

import React, { useState } from 'react';
import {
  MagnifyingGlassIcon,
  UserCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface UserMenu {
  id: number;
  name: string;
  inherited: boolean;
  override: 'none' | 'allow' | 'deny';
  children?: UserMenu[];
  expanded?: boolean;
}

const mockUserMenus: UserMenu[] = [
  { id: 1, name: 'Dashboard', inherited: true, override: 'none' },
  {
    id: 2,
    name: 'Administration',
    inherited: true,
    override: 'none',
    expanded: true,
    children: [
      { id: 3, name: 'User Management', inherited: true, override: 'none' },
      { id: 4, name: 'RBAC', inherited: true, override: 'deny' },
    ],
  },
  { id: 5, name: 'Reports', inherited: false, override: 'allow' },
];

export default function UserMenuOverridePage() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userMenus] = useState<UserMenu[]>(mockUserMenus);

  const renderBadge = (menu: UserMenu) => {
    if (menu.override === 'allow') return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">OVERRIDE: ALLOW</span>;
    if (menu.override === 'deny') return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">OVERRIDE: DENY</span>;
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 italic">INHERITED</span>;
  };

  const renderTree = (nodes: UserMenu[]) => {
    return (
      <ul className="space-y-2">
        {nodes.map((node) => (
          <li key={node.id}>
            <div className="flex items-center group py-2 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="w-6 flex items-center justify-center">
                {node.children && (
                  <button className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded">
                    {node.expanded ? <ChevronDownIcon className="h-3 w-3" /> : <ChevronRightIcon className="h-3 w-3" />}
                  </button>
                )}
              </div>
              <div className="flex items-center flex-1">
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mr-4">{node.name}</span>
                {renderBadge(node)}
              </div>
              <div className="flex items-center gap-3">
                <button className={`p-1.5 rounded-lg border transition-all ${node.override === 'allow' ? 'bg-blue-600 text-white border-blue-600' : 'text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-blue-500'}`}>
                  <CheckCircleIcon className="h-5 w-5" />
                </button>
                <button className={`p-1.5 rounded-lg border transition-all ${node.override === 'deny' ? 'bg-red-600 text-white border-red-600' : 'text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-red-500'}`}>
                  <XCircleIcon className="h-5 w-5" />
                </button>
                <button className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all">
                  <ArrowPathIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            {node.expanded && node.children && (
              <div className="ml-8 mt-2 space-y-2 border-l-2 border-neutral-100 dark:border-neutral-800 pl-4">
                {renderTree(node.children)}
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">User Menu Override</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Grant or deny menu access to specific users, overriding their role-based permissions.
          </p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
          Save Overrides
        </button>
      </div>

      {/* User Selection Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
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

      {/* Override List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white">Menu Override Matrix</h3>
          <div className="flex items-center gap-4 text-[11px] text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center gap-1.5"><CheckCircleIcon className="h-4 w-4 text-blue-600" /> Grant Access</div>
            <div className="flex items-center gap-1.5"><XCircleIcon className="h-4 w-4 text-red-600" /> Block Access</div>
            <div className="flex items-center gap-1.5"><ArrowPathIcon className="h-4 w-4 text-neutral-400" /> Reset Override</div>
          </div>
        </div>
        
        {!selectedUser ? (
          <div className="bg-neutral-50 dark:bg-neutral-800/50 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-2xl p-20 flex flex-col items-center justify-center text-center">
            <InformationCircleIcon className="h-12 w-12 text-neutral-300 dark:text-neutral-600 mb-4" />
            <h4 className="text-lg font-medium text-neutral-900 dark:text-white">No User Selected</h4>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xs mt-2">
              Please search and select a user above to manage their specific menu overrides.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {renderTree(userMenus)}
          </div>
        )}
      </div>
    </div>
  );
}
