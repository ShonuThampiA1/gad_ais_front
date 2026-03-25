'use client';

import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  FunnelIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  XMarkIcon,
  CheckCircleIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useRBACStore, Role, PageMaster, PagePermission, RolePagePermissionMapping } from '@/lib/rbac/rbacStore';

export default function RolePagePermissionsPage() {
  const [mounted, setMounted] = useState(false);

  const roles = useRBACStore((state) => state.roles);
  const pages = useRBACStore((state) => state.pages);
  const mappings = useRBACStore((state) => state.rolePagePermissions);
  const setRolePagePermissions = useRBACStore((state) => state.setRolePagePermissions);

  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Local state for edits
  const [localPermissions, setLocalPermissions] = useState<PagePermission[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (roles.length > 0) {
      setSelectedRole(roles[0].id);
    }
  }, [roles]);

  useEffect(() => {
    if (selectedRole) {
      const mapping = mappings.find(m => m.roleId === selectedRole);

      // Initialize local permissions for all pages
      const initialPerms = pages.map(page => {
        const existing = mapping?.permissions.find(p => p.pageId === page.id);
        return existing || {
          pageId: page.id,
          view: false,
          add: false,
          edit: false,
          delete: false,
          approve: false,
          export: false
        };
      });

      setLocalPermissions(initialPerms);
      setHasChanges(false);
    }
  }, [selectedRole, mappings, pages]);

  if (!mounted) return null;

  const handleToggle = (pageId: number, field: keyof Omit<PagePermission, 'pageId'>) => {
    setLocalPermissions(prev => prev.map(p =>
      p.pageId === pageId ? { ...p, [field]: !p[field] } : p
    ));
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!selectedRole) return;

    const existing = mappings.find(m => m.roleId === selectedRole);
    let newMappings;
    if (existing) {
      newMappings = mappings.map(m => m.roleId === selectedRole ? { ...m, permissions: localPermissions } : m);
    } else {
      newMappings = [...mappings, { roleId: selectedRole, permissions: localPermissions }];
    }

    setRolePagePermissions(newMappings);
    setHasChanges(false);
    alert("Role page permissions saved successfully.");
  };

  const filteredPages = pages.filter(page =>
    page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Role-Page Permissions</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Define detailed page-level access (View, Add, Edit, Delete, etc.) per role.
          </p>
        </div>
        <div className="flex gap-3">
           <button
            disabled={!hasChanges}
            onClick={() => setSelectedRole(selectedRole)} // Reset
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
        {/* Left: Role Selection */}
        <div className="lg:col-span-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
            <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center">
              <ShieldCheckIcon className="h-5 w-5 mr-2 text-neutral-400" />
              Select Role
            </h2>
          </div>
          <div className="flex-1 p-2 overflow-y-auto">
            <div className="space-y-1">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                    selectedRole === role.id
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                  }`}
                >
                  {role.name}
                  {selectedRole === role.id && <ChevronRightIcon className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Permissions Grid */}
        <div className="lg:col-span-9 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                  const perm = localPermissions.find(p => p.pageId === page.id);
                  if (!perm) return null;

                  return (
                    <tr key={page.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group">
                      <td className="px-6 py-4 font-medium text-neutral-900 dark:text-white">
                        {page.name}
                        <div className="text-xs text-neutral-500 font-normal mt-0.5">{page.url}</div>
                      </td>
                      {(['view', 'add', 'edit', 'delete', 'approve', 'export'] as const).map(action => (
                         <td key={action} className="px-4 py-4 text-center">
                            <button
                              onClick={() => handleToggle(page.id, action)}
                              className={`p-1.5 rounded-md transition-colors ${
                                perm[action]
                                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                  : 'text-neutral-300 hover:bg-neutral-100 dark:text-neutral-600 dark:hover:bg-neutral-800'
                              }`}
                            >
                              {perm[action] ? <CheckIcon className="w-5 h-5 font-bold" /> : <XMarkIcon className="w-5 h-5" />}
                            </button>
                         </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredPages.length === 0 && (
              <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
                No pages available. Create pages first.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
