'use client';

import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { useRBACStore, Role } from '@/lib/rbac/rbacStore';
import Link from 'next/link';

export default function RoleManagementPage() {
  const [mounted, setMounted] = useState(false);
  const roles = useRBACStore((state) => state.roles);
  const setRoles = useRBACStore((state) => state.setRoles);
  const users = useRBACStore((state) => state.users);

  // Also get the mappings so we don't accidentally delete roles that are heavily used
  const roleMenuMappings = useRBACStore((state) => state.roleMenuMappings);
  const rolePagePermissions = useRBACStore((state) => state.rolePagePermissions);
  const setRoleMenuMappings = useRBACStore((state) => state.setRoleMenuMappings);
  const setRolePagePermissions = useRBACStore((state) => state.setRolePagePermissions);

  const [searchTerm, setSearchTerm] = useState('');

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Role | null>(null);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (item?: Role) => {
    if (item) {
      setEditItem(item);
      setFormData({ name: item.name });
    } else {
      setEditItem(null);
      setFormData({ name: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) return;

    if (editItem) {
      setRoles(roles.map(r => r.id === editItem.id ? { ...r, ...formData } : r));
    } else {
      const newId = roles.length > 0 ? Math.max(...roles.map(r => r.id)) + 1 : 1;
      setRoles([...roles, { id: newId, ...formData }]);
      // Initialize empty mappings for the new role to prevent runtime mapping errors
      setRoleMenuMappings([...roleMenuMappings, { roleId: newId, menuIds: [] }]);
      setRolePagePermissions([...rolePagePermissions, { roleId: newId, permissions: [] }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    // Check if the role is currently assigned to users
    const usersWithRole = users.filter(u => u.roleId === id);
    if (usersWithRole.length > 0) {
      alert(`Cannot delete this role. It is currently assigned to ${usersWithRole.length} users.`);
      return;
    }

    if (confirm("Are you sure you want to delete this role and its associated permissions mapping?")) {
      setRoles(roles.filter(r => r.id !== id));
      // Cleanup mappings
      setRoleMenuMappings(roleMenuMappings.filter(m => m.roleId !== id));
      setRolePagePermissions(rolePagePermissions.filter(p => p.roleId !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Role Management</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Define system roles to manage user accessibility across project features.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create New Role
        </button>
      </div>

      {/* Guide Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-xl p-4 flex items-start">
        <ShieldCheckIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">Role Capabilities Workflow</h3>
          <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
            To enable or disable accessibility controls for different features and pages across the entire project, first create the base Role here. Then, navigate to <strong className="font-semibold">Role Menu Mapping</strong> to define which navigation structures they can see, and <strong className="font-semibold">Role Page Permissions</strong> to assign granular CRUD access (Add, Edit, Delete, View) for every single page in the project.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between">
          <div className="relative max-w-md w-full">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow dark:text-white"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-600 dark:text-neutral-400">
            <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400">
              <tr>
                <th className="px-6 py-4 font-medium">Role ID</th>
                <th className="px-6 py-4 font-medium">Role Name</th>
                <th className="px-6 py-4 font-medium">Assigned Users</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {filteredRoles.map((role) => {
                const userCount = users.filter(u => u.roleId === role.id).length;
                return (
                  <tr key={role.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-neutral-500">
                      #{role.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-neutral-900 dark:text-white flex items-center">
                        <ShieldCheckIcon className="h-4 w-4 mr-2 text-neutral-400" />
                        {role.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        userCount > 0
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700'
                      }`}>
                        {userCount} Users
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href="/rbac/role-page-permissions"
                          className="px-3 py-1.5 text-xs font-medium text-neutral-600 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-700 dark:hover:bg-neutral-800 transition-colors flex items-center opacity-0 group-hover:opacity-100"
                        >
                          Configure Controls
                          <ArrowRightIcon className="w-3 h-3 ml-1" />
                        </Link>
                        <button onClick={() => handleOpenModal(role)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-md transition-colors" title="Edit role name">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(role.id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-md transition-colors" title="Delete role">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredRoles.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-neutral-500 dark:text-neutral-400">
                    No roles found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {editItem ? 'Edit Role' : 'Create New Role'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Role Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  placeholder="e.g., Financial Reviewer"
                />
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                After creating this role, navigate to the <strong className="font-semibold text-neutral-700 dark:text-neutral-300">Role Page Permissions</strong> and <strong className="font-semibold text-neutral-700 dark:text-neutral-300">Role Menu Mapping</strong> tabs to define its feature accessibility.
              </p>
              <div className="flex gap-2 justify-end mt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-600 dark:hover:bg-neutral-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Save Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
