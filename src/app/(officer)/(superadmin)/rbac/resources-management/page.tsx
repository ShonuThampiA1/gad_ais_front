'use client';

import React, { useState, useEffect } from 'react';
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
import { useRBACStore, Resource } from '@/lib/rbac/rbacStore';

export default function ResourcesManagementPage() {
  const [mounted, setMounted] = useState(false);
  const resources = useRBACStore((state) => state.resources);
  const setResources = useRBACStore((state) => state.setResources);

  const [searchTerm, setSearchTerm] = useState('');

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Resource | null>(null);
  const [formData, setFormData] = useState({ key: '', category: '', action: '' });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const filteredResources = resources.filter(res =>
    res.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (item?: Resource) => {
    if (item) {
      setEditItem(item);
      setFormData({ key: item.key, category: item.category, action: item.action });
    } else {
      setEditItem(null);
      setFormData({ key: '', category: 'USER', action: 'VIEW' });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.key.trim() || !formData.category.trim() || !formData.action.trim()) return;

    if (editItem) {
      setResources(resources.map(r => r.id === editItem.id ? { ...r, ...formData } : r));
    } else {
      const newId = resources.length > 0 ? Math.max(...resources.map(r => r.id)) + 1 : 1;
      setResources([...resources, { id: newId, ...formData }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this resource?")) {
      setResources(resources.filter(r => r.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Resources Management</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Manage fine-grained resource keys for API authorization and feature flags.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Resource
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between">
          <div className="relative max-w-md w-full">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search resources..."
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
                <th className="px-6 py-4 font-medium">Resource Key</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Action</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {filteredResources.map((resource) => (
                <tr key={resource.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-neutral-900 dark:text-white flex items-center">
                    <CubeIcon className="h-4 w-4 mr-2 text-neutral-400" />
                    {resource.key}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700">
                      {resource.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/30">
                      {resource.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenModal(resource)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-md transition-colors">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(resource.id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-md transition-colors">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredResources.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-neutral-500 dark:text-neutral-400">
                    No resources found matching your search.
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
                {editItem ? 'Edit Resource' : 'Add Resource'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Resource Key
                </label>
                <input
                  type="text"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  placeholder="e.g., user.view"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  placeholder="e.g., USER, REPORT"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Action
                </label>
                <input
                  type="text"
                  value={formData.action}
                  onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  placeholder="e.g., VIEW, EXPORT"
                />
              </div>
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
                  Save Resource
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
