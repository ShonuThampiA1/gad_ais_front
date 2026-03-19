
'use client';

import React, { useState } from 'react';
import {
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

interface MenuNode {
  id: number;
  name: string;
  children?: MenuNode[];
  expanded?: boolean;
  checked?: 'checked' | 'unchecked' | 'indeterminate';
}

const mockMenuTree: MenuNode[] = [
  {
    id: 1,
    name: 'Dashboard',
    checked: 'checked',
  },
  {
    id: 2,
    name: 'Administration',
    expanded: true,
    checked: 'indeterminate',
    children: [
      { id: 3, name: 'User Management', checked: 'checked' },
      {
        id: 4,
        name: 'RBAC',
        expanded: true,
        checked: 'indeterminate',
        children: [
          { id: 5, name: 'Menus', checked: 'checked' },
          { id: 6, name: 'Pages', checked: 'unchecked' },
          { id: 7, name: 'Permissions', checked: 'unchecked' },
        ]
      },
    ],
  },
  {
    id: 8,
    name: 'Reports',
    checked: 'unchecked',
  },
];

export default function RoleMenuMappingPage() {
  const [selectedRole, setSelectedRole] = useState('Admin');
  const [menuTree, setMenuTree] = useState<MenuNode[]>(mockMenuTree);

  const toggleExpand = (id: number) => {
    const updateNodes = (nodes: MenuNode[]): MenuNode[] => {
      return nodes.map(node => {
        if (node.id === id) return { ...node, expanded: !node.expanded };
        if (node.children) return { ...node, children: updateNodes(node.children) };
        return node;
      });
    };
    setMenuTree(updateNodes(menuTree));
  };

  const renderCheckbox = (state: MenuNode['checked']) => {
    if (state === 'checked') return <CheckCircleIcon className="h-5 w-5 text-blue-600 fill-blue-50 dark:fill-blue-900/30" />;
    if (state === 'indeterminate') return <div className="h-5 w-5 flex items-center justify-center border-2 border-blue-600 rounded bg-blue-50 dark:bg-blue-900/30"><div className="w-2.5 h-0.5 bg-blue-600" /></div>;
    return <div className="h-5 w-5 border-2 border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800" />;
  };

  const renderTree = (nodes: MenuNode[]) => {
    return (
      <ul className="space-y-1">
        {nodes.map((node) => (
          <li key={node.id}>
            <div className="flex items-center group py-1">
              <div className="w-6 flex items-center justify-center">
                {node.children && (
                  <button onClick={() => toggleExpand(node.id)} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded">
                    {node.expanded ? <ChevronDownIcon className="h-3 w-3" /> : <ChevronRightIcon className="h-3 w-3" />}
                  </button>
                )}
              </div>
              <div className="flex items-center cursor-pointer p-1.5 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 flex-1 transition-colors">
                <div className="mr-3">{renderCheckbox(node.checked)}</div>
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{node.name}</span>
              </div>
            </div>
            {node.expanded && node.children && (
              <div className="ml-9 border-l border-neutral-200 dark:border-neutral-700">
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
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Role Menu Mapping</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Assign visible navigation menus to specific system roles.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg transition-colors">
            <DocumentDuplicateIcon className="h-5 w-5 mr-2" />
            Clone from Role
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
            Save Mapping
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Role Selector Card */}
        <div className="lg:col-span-4 bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden h-fit">
          <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white">Select Role</h3>
            <ShieldCheckIcon className="h-5 w-5 text-neutral-400" />
          </div>
          <div className="p-4 space-y-2">
            {['Super Admin', 'Admin', 'Officer', 'Editor', 'Viewer'].map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  selectedRole === role
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 ring-1 ring-blue-500/20 shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                <div className={`h-2 w-2 rounded-full mr-3 ${selectedRole === role ? 'bg-blue-600 dark:bg-blue-400' : 'bg-neutral-300 dark:bg-neutral-600'}`} />
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Tree Card */}
        <div className="lg:col-span-8 bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col min-h-[500px]">
          <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
              Menu Permissions for <span className="text-blue-600 dark:text-blue-400 font-bold">{selectedRole}</span>
            </h3>
            <div className="flex items-center gap-2">
              <button className="text-xs font-medium text-neutral-500 hover:text-blue-600 transition-colors">Expand All</button>
              <span className="text-neutral-300 dark:text-neutral-700">|</span>
              <button className="text-xs font-medium text-neutral-500 hover:text-blue-600 transition-colors">Collapse All</button>
            </div>
          </div>
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
            <div className="relative max-w-sm w-full">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search in menu tree..."
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <div className="flex-1 p-6 overflow-y-auto">
            {renderTree(menuTree)}
          </div>
          <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <span className="text-sm text-neutral-500 dark:text-neutral-400 italic">
              12 of 24 menus assigned to this role
            </span>
            <button className="flex items-center text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Reset Mapping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
