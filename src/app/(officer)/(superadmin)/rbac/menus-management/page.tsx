'use client';

import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';
import { useRBACStore, MenuNode } from '@/lib/rbac/rbacStore';

export default function MenusManagementPage() {
  const [mounted, setMounted] = useState(false);
  const menus = useRBACStore((state) => state.menus);
  const setMenus = useRBACStore((state) => state.setMenus);

  const [selectedMenu, setSelectedMenu] = useState<MenuNode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // State for form data when editing or adding
  const [formData, setFormData] = useState<Partial<MenuNode>>({
    name: '',
    path: '',
    type: 'MENU',
    parentId: null,
    sortOrder: 1,
    icon: ''
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Build a tree from the flat array
  const buildTree = (menuList: MenuNode[], parentId: number | null = null): (MenuNode & { children: any[] })[] => {
    return menuList
      .filter((menu) => menu.parentId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((menu) => ({
        ...menu,
        children: buildTree(menuList, menu.id),
      }));
  };

  const menuTree = buildTree(menus);

  const handleSelectMenu = (menu: MenuNode) => {
    setSelectedMenu(menu);
    setFormData(menu);
    setIsEditing(false);
  };

  const handleAddNew = (parentId: number | null = null) => {
    setFormData({
      name: '',
      path: '',
      type: parentId === null ? 'MODULE' : 'MENU',
      parentId,
      sortOrder: menus.filter(m => m.parentId === parentId).length + 1,
      icon: ''
    });
    setSelectedMenu(null);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!formData.name) {
      alert("Name is required");
      return;
    }

    if (formData.id) {
      // Edit
      setMenus(menus.map(m => m.id === formData.id ? { ...m, ...formData } as MenuNode : m));
    } else {
      // Add
      const newId = menus.length > 0 ? Math.max(...menus.map(m => m.id)) + 1 : 1;
      const newNode = { ...formData, id: newId } as MenuNode;
      setMenus([...menus, newNode]);
      setSelectedMenu(newNode);
    }
    setIsEditing(false);
  };

  const handleDelete = (id: number) => {
    // Check if it has children
    const hasChildren = menus.some(m => m.parentId === id);
    if (hasChildren) {
      alert("Cannot delete a menu with children. Please delete children first.");
      return;
    }

    if (confirm("Are you sure you want to delete this menu?")) {
      setMenus(menus.filter(m => m.id !== id));
      if (selectedMenu?.id === id) {
        setSelectedMenu(null);
        setFormData({});
        setIsEditing(false);
      }
    }
  };

  const renderTree = (nodes: any[], depth = 0) => {
    return nodes.map((node) => {
      const isSelected = selectedMenu?.id === node.id;
      return (
        <div key={node.id}>
          <div
            className={`flex items-center group justify-between py-2 px-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer rounded-lg transition-colors ${
              isSelected ? 'bg-blue-50 dark:bg-blue-900/30' : ''
            }`}
            style={{ paddingLeft: `${depth * 1.5 + 0.75}rem` }}
            onClick={() => handleSelectMenu(node)}
          >
            <div className="flex items-center">
              {node.children && node.children.length > 0 ? (
                <ChevronDownIcon className="w-4 h-4 mr-2 text-neutral-400" />
              ) : (
                <div className="w-6" /> // spacer
              )}
              <span className={`text-sm ${isSelected ? 'text-blue-700 font-medium dark:text-blue-400' : 'text-neutral-700 dark:text-neutral-300'}`}>
                {node.name}
              </span>
              <span className="ml-3 text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                {node.type}
              </span>
            </div>

            <div className={`flex gap-2 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
              <button
                onClick={(e) => { e.stopPropagation(); handleAddNew(node.id); }}
                className="p-1 text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400"
                title="Add Child"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(node.id); }}
                className="p-1 text-neutral-400 hover:text-red-600 dark:hover:text-red-400"
                title="Delete"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
          {node.children && node.children.length > 0 && (
            <div className="border-l border-neutral-200 dark:border-neutral-800 ml-5">
              {renderTree(node.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Menus Management</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Build and organize the application navigation structure.
          </p>
        </div>
        <button
          onClick={() => handleAddNew(null)}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Root Module
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Tree View */}
        <div className="lg:col-span-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search menus..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow dark:text-white"
              />
            </div>
          </div>
          <div className="flex-1 p-2 overflow-y-auto">
            {renderTree(menuTree)}
          </div>
        </div>

        {/* Right: Details / Edit Form */}
        <div className="lg:col-span-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900/50">
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white flex items-center">
              {isEditing ? 'Add/Edit Menu Item' : 'Menu Details'}
              {selectedMenu && !isEditing && (
                <span className="ml-3 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  ID: {selectedMenu.id}
                </span>
              )}
            </h2>
            {selectedMenu && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors dark:text-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-900/50"
              >
                <PencilIcon className="w-4 h-4 mr-1.5" />
                Edit
              </button>
            )}
          </div>

          <div className="p-6">
            {!selectedMenu && !isEditing ? (
              <div className="flex flex-col items-center justify-center h-64 text-neutral-500 dark:text-neutral-400">
                <ArrowsUpDownIcon className="w-12 h-12 mb-4 text-neutral-300 dark:text-neutral-600" />
                <p>Select a menu item from the tree to view details</p>
                <p className="text-sm mt-1">Or click "Add Root Module" to create a new one</p>
              </div>
            ) : (
              <div className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={formData.name || ''}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-neutral-100 dark:disabled:bg-neutral-800 disabled:text-neutral-500 dark:text-white"
                      placeholder="e.g., Dashboard"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Type
                    </label>
                    <select
                      disabled={!isEditing}
                      value={formData.type || 'MENU'}
                      onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-neutral-100 dark:disabled:bg-neutral-800 disabled:text-neutral-500 dark:text-white"
                    >
                      <option value="MODULE">MODULE (Root)</option>
                      <option value="MENU">MENU</option>
                      <option value="SUBMENU">SUBMENU</option>
                      <option value="LINK">LINK</option>
                      <option value="BUTTON">BUTTON</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Path / URL
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={formData.path || ''}
                      onChange={(e) => setFormData({...formData, path: e.target.value})}
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-neutral-100 dark:disabled:bg-neutral-800 disabled:text-neutral-500 dark:text-white"
                      placeholder="e.g., /dashboard"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      disabled={!isEditing}
                      value={formData.sortOrder || 1}
                      onChange={(e) => setFormData({...formData, sortOrder: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-neutral-100 dark:disabled:bg-neutral-800 disabled:text-neutral-500 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Icon (Optional)
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={formData.icon || ''}
                      onChange={(e) => setFormData({...formData, icon: e.target.value})}
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-neutral-100 dark:disabled:bg-neutral-800 disabled:text-neutral-500 dark:text-white"
                      placeholder="e.g., HomeIcon"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Parent Menu
                    </label>
                    <select
                      disabled={!isEditing}
                      value={formData.parentId === null ? '' : formData.parentId}
                      onChange={(e) => setFormData({...formData, parentId: e.target.value ? parseInt(e.target.value) : null})}
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-neutral-100 dark:disabled:bg-neutral-800 disabled:text-neutral-500 dark:text-white"
                    >
                      <option value="">None (Root Module)</option>
                      {menus.filter(m => m.id !== formData.id).map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800 mt-6">
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => {
                        if (selectedMenu) {
                          setFormData(selectedMenu);
                          setIsEditing(false);
                        } else {
                          setFormData({});
                          setIsEditing(false);
                        }
                      }}
                      className="px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-sm font-medium rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
