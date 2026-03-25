'use client';

import React, { useState, useEffect } from 'react';
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
import { useRBACStore, PageMaster } from '@/lib/rbac/rbacStore';

export default function PagesManagementPage() {
  const [mounted, setMounted] = useState(false);
  const pages = useRBACStore((state) => state.pages);
  const setPages = useRBACStore((state) => state.setPages);

  const [searchTerm, setSearchTerm] = useState('');

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<PageMaster | null>(null);
  const [formData, setFormData] = useState({ name: '', url: '' });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const filteredPages = pages.filter(page =>
    page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (item?: PageMaster) => {
    if (item) {
      setEditItem(item);
      setFormData({ name: item.name, url: item.url });
    } else {
      setEditItem(null);
      setFormData({ name: '', url: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.url.trim()) return;

    if (editItem) {
      setPages(pages.map(p => p.id === editItem.id ? { ...p, ...formData } : p));
    } else {
      const newId = pages.length > 0 ? Math.max(...pages.map(p => p.id)) + 1 : 1;
      setPages([...pages, { id: newId, ...formData }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this page?")) {
      setPages(pages.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Pages Management</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Define system pages for permission assignments.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Page
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between">
          <div className="relative max-w-md w-full">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search pages by name or URL..."
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
                <th className="px-6 py-4 font-medium">ID</th>
                <th className="px-6 py-4 font-medium">Page Name</th>
                <th className="px-6 py-4 font-medium">URL / Route</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {filteredPages.map((page) => (
                <tr key={page.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="px-6 py-4">{page.id}</td>
                  <td className="px-6 py-4 font-medium text-neutral-900 dark:text-white">
                    {page.name}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md w-fit">
                      <LinkIcon className="h-4 w-4 mr-1.5" />
                      {page.url}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenModal(page)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-md transition-colors">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(page.id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-md transition-colors">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPages.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-neutral-500 dark:text-neutral-400">
                    No pages found matching your search.
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
                {editItem ? 'Edit Page' : 'Add Page'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Page Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  placeholder="e.g., User Management"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  URL / Route
                </label>
                <input
                  type="text"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  placeholder="e.g., /admin/users"
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
                  Save Page
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
