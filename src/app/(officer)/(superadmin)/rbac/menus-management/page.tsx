'use client';

import React, { useState } from 'react';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';

interface MenuNode {
  id: number;
  name: string;
  path: string;
  type: 'MODULE' | 'MENU' | 'SUBMENU' | 'LINK' | 'BUTTON';
  parentId: number | null;
  sortOrder: number;
  children?: MenuNode[];
  expanded?: boolean;
}

const mockMenus: MenuNode[] = [
  {
    id: 1,
    name: 'Dashboard',
    path: '/dashboard',
    type: 'MENU',
    parentId: null,
    sortOrder: 1,
    expanded: true,
  },
  {
    id: 2,
    name: 'Administration',
    path: '/admin',
    type: 'MODULE',
    parentId: null,
    sortOrder: 2,
    expanded: true,
    children: [
      {
        id: 3,
        name: 'User Management',
        path: '/admin/users',
        type: 'MENU',
        parentId: 2,
        sortOrder: 1,
      },
      {
        id: 4,
        name: 'RBAC',
        path: '/admin/rbac',
        type: 'SUBMENU',
        parentId: 2,
        sortOrder: 2,
        expanded: true,
        children: [
          { id: 5, name: 'Menus', path: '/admin/rbac/menus', type: 'LINK', parentId: 4, sortOrder: 1 },
          { id: 6, name: 'Pages', path: '/admin/rbac/pages', type: 'LINK', parentId: 4, sortOrder: 2 },
          { id: 7, name: 'Permissions', path: '/admin/rbac/permissions', type: 'LINK', parentId: 4, sortOrder: 3 },
        ]
      },
    ],
  },
  {
    id: 8,
    name: 'Reports',
    path: '/reports',
    type: 'MENU',
    parentId: null,
    sortOrder: 3,
  },
];

export default function MenusManagementPage() {
  const [menus, setMenus] = useState<MenuNode[]>(mockMenus);
  const [selectedMenu, setSelectedMenu] = useState<MenuNode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleExpand = (nodeId: number) => {
    const updateNodes = (nodes: MenuNode[]): MenuNode[] => {
      return nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, expanded: !node.expanded };
        }
        if (node.children) {
          return { ...node, children: updateNodes(node.children) };
        }
        return node;
      });
    };
    setMenus(updateNodes(menus));
  };

  const renderMenuTree = (nodes: MenuNode[], depth = 0) => {
    return (
      <ul className={`${depth > 0 ? 'ml-6 border-l border-neutral-200 dark:border-neutral-700' : ''}`}>
        {nodes.map((node) => (
          <li key={node.id} className="py-1">
            <div 
              className={`flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                selectedMenu?.id === node.id 
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              }`}
              onClick={() => setSelectedMenu(node)}
            >
              {node.children && node.children.length > 0 ? (
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    toggleExpand(node.id); 
                  }}
                  className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded mr-1"
                >
                  {node.expanded ? (
                    <ChevronDownIcon className="h-4 w-4" />
                  ) : (
                    <ChevronRightIcon className="h-4 w-4" />
                  )}
                </button>
              ) : (
                <span className="w-6" />
              )}
              <span className="text-sm font-medium">{node.name}</span>
              <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-500">
                {node.type}
              </span>
            </div>
            {node.expanded && node.children && renderMenuTree(node.children, depth + 1)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Menus Management</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Manage hierarchical navigation menus and their structure.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Menu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel: Menu Tree */}
        <div className="lg:col-span-4 bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col h-[calc(100vh-250px)]">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search menus..."
                className="w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {renderMenuTree(menus)}
          </div>
          <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-800">
            <button className="flex items-center justify-center w-full px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
              <ArrowsUpDownIcon className="h-4 w-4 mr-2" />
              Reorder Menus
            </button>
          </div>
        </div>

        {/* Right Panel: Menu Details */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
                {selectedMenu ? `Editing: ${selectedMenu.name}` : 'Menu Details'}
              </h3>
              {selectedMenu && (
                <div className="flex items-center gap-2">
                  <button className="p-2 text-neutral-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-neutral-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
            <div className="p-6">
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Menu Name</label>
                  <input
                    type="text"
                    key={selectedMenu?.id || 'new'}
                    defaultValue={selectedMenu?.name || ''}
                    className="w-full px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter menu name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Menu Path</label>
                  <input
                    type="text"
                    key={`path-${selectedMenu?.id || 'new'}`}
                    defaultValue={selectedMenu?.path || ''}
                    className="w-full px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="/path/to/page"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Menu Type</label>
                  <select 
                    key={`type-${selectedMenu?.id || 'new'}`}
                    className="w-full px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    defaultValue={selectedMenu?.type || 'MENU'}
                  >
                    <option value="MODULE">MODULE</option>
                    <option value="MENU">MENU</option>
                    <option value="SUBMENU">SUBMENU</option>
                    <option value="LINK">LINK</option>
                    <option value="BUTTON">BUTTON</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Parent Menu</label>
                  <select 
                    key={`parent-${selectedMenu?.id || 'new'}`}
                    className="w-full px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    defaultValue={selectedMenu?.parentId || ''}
                  >
                    <option value="">None (Top Level)</option>
                    <option value="1">Dashboard</option>
                    <option value="2">Administration</option>
                    <option value="4">RBAC</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Sort Order</label>
                  <input
                    type="number"
                    key={`sort-${selectedMenu?.id || 'new'}`}
                    defaultValue={selectedMenu?.sortOrder || 0}
                    className="w-full px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                  <button type="button" className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                    Reset
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Preview Card */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-6">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">Hierarchical Preview</h4>
            <div className="flex items-center text-sm text-blue-700 dark:text-blue-400 font-mono">
              <span>Home</span>
              <ChevronRightIcon className="h-3 w-3 mx-2" />
              <span>Administration</span>
              <ChevronRightIcon className="h-3 w-3 mx-2" />
              <span className="font-bold">RBAC Management</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
