'use client';

import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  UserCircleIcon,
  FunnelIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  InformationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useRBACStore, PagePermission, UserOverride } from '@/lib/rbac/rbacStore';

// Same mock users as Menu Override
const mockUsers = [
  { id: 101, name: 'John Admin', roleId: 1, email: 'admin@example.com' },
  { id: 102, name: 'Jane Officer', roleId: 2, email: 'officer@example.com' },
  { id: 103, name: 'Robert Clerk', roleId: 3, email: 'clerk@example.com' },
  { id: 104, name: 'Emily Super', roleId: 7, email: 'super@example.com' },
];

export default function UserPagePermissionOverridePage() {
  const [mounted, setMounted] = useState(false);

  const pages = useRBACStore((state) => state.pages);
  const roles = useRBACStore((state) => state.roles);
  const rolePagePermissions = useRBACStore((state) => state.rolePagePermissions);

  const userOverridesStore = useRBACStore((state) => state.userOverrides);
  const setUserOverrides = useRBACStore((state) => state.setUserOverrides);

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');

  // Local state for page overrides: { pageId -> { view: 'allow'|'deny'|undefined, add: ... } }
  const [localOverrides, setLocalOverrides] = useState<Map<number, any>>(new Map());
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (mockUsers.length > 0) {
      setSelectedUserId(mockUsers[0].id);
    }
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      const existing = userOverridesStore.find(u => u.userId === selectedUserId);
      const newMap = new Map();
      if (existing) {
        existing.pageOverrides.forEach(o => {
          newMap.set(o.pageId, { ...o });
        });
      }
      setLocalOverrides(newMap);
      setHasChanges(false);
    }
  }, [selectedUserId, userOverridesStore]);

  if (!mounted) return null;

  const selectedUser = mockUsers.find(u => u.id === selectedUserId);
  const selectedUserRoleMapping = rolePagePermissions.find(m => m.roleId === selectedUser?.roleId);

  const handleOverrideChange = (pageId: number, action: keyof Omit<PagePermission, 'pageId'>) => {
    const newOverrides = new Map(localOverrides);
    let pageOverride = newOverrides.get(pageId) || { pageId };

    // Cycle state: undefined (inherit) -> 'allow' -> 'deny' -> undefined
    const currentVal = pageOverride[action];
    let nextVal;
    if (currentVal === undefined) nextVal = 'allow';
    else if (currentVal === 'allow') nextVal = 'deny';
    else nextVal = undefined;

    pageOverride = { ...pageOverride, [action]: nextVal };

    // Cleanup if all undefined
    const hasAnyOverride = (['view', 'add', 'edit', 'delete', 'approve', 'export'] as const).some(a => pageOverride[a] !== undefined);

    if (hasAnyOverride) {
      newOverrides.set(pageId, pageOverride);
    } else {
      newOverrides.delete(pageId);
    }

    setLocalOverrides(newOverrides);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!selectedUserId) return;

    const overridesArray = Array.from(localOverrides.values());

    let newUserOverrides = [...userOverridesStore];
    const userIndex = newUserOverrides.findIndex(u => u.userId === selectedUserId);

    if (userIndex >= 0) {
      newUserOverrides[userIndex] = { ...newUserOverrides[userIndex], pageOverrides: overridesArray };
    } else {
      newUserOverrides.push({ userId: selectedUserId, menuOverrides: [], pageOverrides: overridesArray });
    }

    setUserOverrides(newUserOverrides);
    setHasChanges(false);
    alert('User page overrides saved successfully.');
  };

  const filteredUsers = mockUsers.filter(u =>
    u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const filteredPages = pages.filter(page =>
    page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStateIcon = (inheritedVal: boolean, overrideVal?: 'allow' | 'deny') => {
    if (overrideVal === 'allow') {
      return <CheckIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 font-bold drop-shadow-sm" />;
    }
    if (overrideVal === 'deny') {
      return <XMarkIcon className="h-5 w-5 text-red-600 dark:text-red-400 font-bold drop-shadow-sm" />;
    }
    // Inherited
    if (inheritedVal) {
      return <CheckIcon className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />;
    }
    return <XMarkIcon className="h-4 w-4 text-neutral-300 dark:text-neutral-600" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">User Page Permission Override</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Fine-tune page access (View, Add, Edit, etc.) for specific users.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            disabled={!hasChanges}
            onClick={() => setSelectedUserId(selectedUserId)} // Reset
            className="px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
          <button
            disabled={!hasChanges}
            onClick={handleSave}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: User Selection */}
        <div className="lg:col-span-4 xl:col-span-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[600px]">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow dark:text-white"
              />
            </div>
          </div>
          <div className="flex-1 p-2 overflow-y-auto">
            <div className="space-y-1">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedUserId === user.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-200 dark:ring-blue-800/50'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium mr-3 ${
                      selectedUserId === user.id ? 'bg-blue-200 text-blue-700 dark:bg-blue-800 dark:text-blue-200' : 'bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300'
                    }`}>
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${selectedUserId === user.id ? 'text-blue-700 dark:text-blue-400' : 'text-neutral-900 dark:text-white'}`}>
                        {user.name}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Permissions Grid */}
        <div className="lg:col-span-8 xl:col-span-9 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[600px]">
          {selectedUser ? (
            <>
              <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-medium text-neutral-900 dark:text-white flex items-center">
                    Page Permissions for {selectedUser.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    <div className="flex items-center text-xs text-neutral-500">
                      <span className="w-4 h-4 rounded bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mr-1.5"><CheckIcon className="w-3 h-3 text-neutral-400" /></span> Inherited Allow
                    </div>
                    <div className="flex items-center text-xs text-neutral-500">
                      <span className="w-4 h-4 rounded bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mr-1.5"><XMarkIcon className="w-3 h-3 text-neutral-400" /></span> Inherited Deny
                    </div>
                    <div className="flex items-center text-xs text-neutral-500">
                      <span className="w-4 h-4 rounded bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mr-1.5"><CheckIcon className="w-3.5 h-3.5 text-blue-600 font-bold" /></span> Overridden Allow
                    </div>
                    <div className="flex items-center text-xs text-neutral-500">
                      <span className="w-4 h-4 rounded bg-red-50 dark:bg-red-900/30 flex items-center justify-center mr-1.5"><XMarkIcon className="w-3.5 h-3.5 text-red-600 font-bold" /></span> Overridden Deny
                    </div>
                  </div>
                </div>
                <div className="relative max-w-sm w-full">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search pages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow dark:text-white"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-x-auto">
                 <table className="w-full text-left text-sm text-neutral-600 dark:text-neutral-400">
                  <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 font-medium">Page</th>
                      <th className="px-4 py-4 font-medium text-center">View</th>
                      <th className="px-4 py-4 font-medium text-center">Add</th>
                      <th className="px-4 py-4 font-medium text-center">Edit</th>
                      <th className="px-4 py-4 font-medium text-center">Delete</th>
                      <th className="px-4 py-4 font-medium text-center">Approve</th>
                      <th className="px-4 py-4 font-medium text-center">Export</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                    {filteredPages.map((page) => {
                      const rolePerms = selectedUserRoleMapping?.permissions.find(p => p.pageId === page.id) || {
                        view: false, add: false, edit: false, delete: false, approve: false, export: false
                      };
                      const userOverride = localOverrides.get(page.id) || {};

                      return (
                        <tr key={page.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group">
                          <td className="px-6 py-4 font-medium text-neutral-900 dark:text-white">
                            {page.name}
                            <div className="text-xs text-neutral-500 font-normal mt-0.5">{page.url}</div>
                          </td>
                          {(['view', 'add', 'edit', 'delete', 'approve', 'export'] as const).map(action => {
                            const overrideVal = userOverride[action];
                            const inheritedVal = rolePerms[action];
                            const isOverridden = overrideVal !== undefined;

                            return (
                             <td key={action} className="px-4 py-4 text-center">
                                <button
                                  onClick={() => handleOverrideChange(page.id, action)}
                                  className={`p-1.5 rounded-md transition-all ${
                                    isOverridden
                                      ? overrideVal === 'allow'
                                        ? 'bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-200 dark:ring-blue-800'
                                        : 'bg-red-50 dark:bg-red-900/30 ring-1 ring-red-200 dark:ring-red-800'
                                      : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                  }`}
                                  title={`Click to toggle: Inherit -> Allow -> Deny`}
                                >
                                  {renderStateIcon(inheritedVal as boolean, overrideVal)}
                                </button>
                             </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-500">
              <UserCircleIcon className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mb-4" />
              <p>Select a user to view and manage overrides.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
