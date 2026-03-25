'use client';

import React, { useState, useEffect } from 'react';
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
import { useRBACStore, MenuNode, RoleMenuMapping, UserOverride } from '@/lib/rbac/rbacStore';

// Mock Users since they aren't in RBAC store yet
const mockUsers = [
  { id: 101, name: 'John Doe', roleId: 1, email: 'john@example.com' },
  { id: 102, name: 'Jane Smith', roleId: 2, email: 'jane@example.com' },
  { id: 103, name: 'Robert Johnson', roleId: 2, email: 'robert@example.com' },
  { id: 104, name: 'Emily Davis', roleId: 3, email: 'emily@example.com' },
];

export default function UserMenuOverridePage() {
  const [mounted, setMounted] = useState(false);

  const menus = useRBACStore((state) => state.menus);
  const roles = useRBACStore((state) => state.roles);
  const roleMenuMappings = useRBACStore((state) => state.roleMenuMappings);

  const userOverridesStore = useRBACStore((state) => state.userOverrides);
  const setUserOverrides = useRBACStore((state) => state.setUserOverrides);

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  // Local state for user overrides map { menuId -> 'allow' | 'deny' }
  const [localOverrides, setLocalOverrides] = useState<Map<number, 'allow' | 'deny'>>(new Map());
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
      const newMap = new Map<number, 'allow' | 'deny'>();
      if (existing) {
        existing.menuOverrides.forEach(o => newMap.set(o.menuId, o.override));
      }
      setLocalOverrides(newMap);
      setHasChanges(false);
    }
  }, [selectedUserId, userOverridesStore]);

  if (!mounted) return null;

  const selectedUser = mockUsers.find(u => u.id === selectedUserId);
  const selectedUserRoleMapping = roleMenuMappings.find(m => m.roleId === selectedUser?.roleId);
  const inheritedMenuIds = new Set(selectedUserRoleMapping?.menuIds || []);

  const handleOverrideChange = (menuId: number, overrideType: 'none' | 'allow' | 'deny') => {
    const newOverrides = new Map(localOverrides);
    if (overrideType === 'none') {
      newOverrides.delete(menuId);
    } else {
      newOverrides.set(menuId, overrideType);
    }
    setLocalOverrides(newOverrides);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!selectedUserId) return;

    const overridesArray = Array.from(localOverrides.entries()).map(([menuId, override]) => ({ menuId, override }));

    let newUserOverrides = [...userOverridesStore];
    const userIndex = newUserOverrides.findIndex(u => u.userId === selectedUserId);

    if (userIndex >= 0) {
      newUserOverrides[userIndex] = { ...newUserOverrides[userIndex], menuOverrides: overridesArray };
    } else {
      newUserOverrides.push({ userId: selectedUserId, menuOverrides: overridesArray, pageOverrides: [] });
    }

    setUserOverrides(newUserOverrides);
    setHasChanges(false);
    alert('User menu overrides saved successfully.');
  };

  // Tree building
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

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const filteredUsers = mockUsers.filter(u =>
    u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const renderTree = (nodes: any[], depth = 0) => {
    return nodes.map((node) => {
      const isExpanded = expandedNodes.has(node.id) || searchTerm.length > 0;
      const isInherited = inheritedMenuIds.has(node.id);
      const currentOverride = localOverrides.get(node.id);

      const effectiveAccess = currentOverride === 'allow' ? true : currentOverride === 'deny' ? false : isInherited;

      if (searchTerm && !node.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        // Simple search filtering
        return null;
      }

      return (
        <div key={node.id}>
          <div
            className={`flex items-center justify-between group py-2 px-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors border-b border-neutral-100 dark:border-neutral-800/50`}
            style={{ paddingLeft: `${depth * 1.5 + 0.75}rem` }}
          >
            <div className="flex items-center flex-1">
              {node.children && node.children.length > 0 ? (
                <button
                  onClick={() => toggleExpand(node.id)}
                  className="p-1 -ml-1 mr-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDownIcon className="w-4 h-4" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4" />
                  )}
                </button>
              ) : (
                <div className="w-6" /> // spacer
              )}

              <div className="flex flex-col">
                <span className={`text-sm ${effectiveAccess ? 'text-neutral-900 dark:text-white font-medium' : 'text-neutral-400 dark:text-neutral-600 line-through decoration-neutral-300 dark:decoration-neutral-700'}`}>
                  {node.name}
                </span>
                <span className="text-[10px] text-neutral-500 flex items-center mt-0.5">
                  Inherited:
                  {isInherited ? (
                    <CheckCircleIcon className="w-3 h-3 ml-1 text-green-500" />
                  ) : (
                    <XCircleIcon className="w-3 h-3 ml-1 text-neutral-300 dark:text-neutral-600" />
                  )}
                </span>
              </div>
            </div>

            {/* Override Controls */}
            <div className="flex items-center bg-neutral-100 dark:bg-neutral-900 rounded-lg p-0.5 border border-neutral-200 dark:border-neutral-700 ml-4">
              <button
                onClick={() => handleOverrideChange(node.id, 'none')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  !currentOverride
                    ? 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-white shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-700'
                    : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
                }`}
              >
                Default
              </button>
              <button
                onClick={() => handleOverrideChange(node.id, 'allow')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center ${
                  currentOverride === 'allow'
                    ? 'bg-green-500 text-white shadow-sm'
                    : 'text-neutral-500 hover:text-green-600 dark:text-neutral-400 dark:hover:text-green-500'
                }`}
              >
                <CheckCircleIcon className="w-3.5 h-3.5 mr-1" />
                Allow
              </button>
              <button
                onClick={() => handleOverrideChange(node.id, 'deny')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center ${
                  currentOverride === 'deny'
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'text-neutral-500 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-500'
                }`}
              >
                <XCircleIcon className="w-3.5 h-3.5 mr-1" />
                Deny
              </button>
            </div>
          </div>
          {node.children && node.children.length > 0 && isExpanded && (
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
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">User Menu Override</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Grant or deny menu access for specific users, overriding their role permissions.
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
                  <div className="mt-2 text-xs">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-neutral-600 bg-neutral-100 dark:text-neutral-300 dark:bg-neutral-800">
                      {roles.find(r => r.id === user.roleId)?.name || 'Unknown Role'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Menu Selection Tree */}
        <div className="lg:col-span-8 xl:col-span-9 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[600px]">
          {selectedUser ? (
            <>
              <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-medium text-neutral-900 dark:text-white flex items-center">
                    Menu Overrides for {selectedUser.name}
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5 flex items-center">
                    <InformationCircleIcon className="w-3.5 h-3.5 mr-1" />
                    Base permissions inherited from role: <span className="font-semibold ml-1">{roles.find(r => r.id === selectedUser.roleId)?.name}</span>
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Filter menus..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow dark:text-white"
                  />
                </div>
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="mb-4 pb-4 border-b border-neutral-100 dark:border-neutral-800 flex gap-4">
                  <button
                    onClick={() => {
                      const newExpanded = new Set<number>();
                      menus.forEach(m => newExpanded.add(m.id));
                      setExpandedNodes(newExpanded);
                    }}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center"
                  >
                    Expand All
                  </button>
                  <button
                    onClick={() => setExpandedNodes(new Set())}
                    className="text-xs font-medium text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 flex items-center"
                  >
                    Collapse All
                  </button>
                </div>
                {renderTree(menuTree)}

                {menus.length === 0 && (
                  <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
                    No menus available. Create menus first.
                  </div>
                )}
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
