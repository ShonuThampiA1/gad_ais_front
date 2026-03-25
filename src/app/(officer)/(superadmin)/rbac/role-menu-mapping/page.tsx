'use client';

import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import { useRBACStore, MenuNode, Role } from '@/lib/rbac/rbacStore';

export default function RoleMenuMappingPage() {
  const [mounted, setMounted] = useState(false);

  const roles = useRBACStore((state) => state.roles);
  const menus = useRBACStore((state) => state.menus);
  const mappings = useRBACStore((state) => state.roleMenuMappings);
  const setRoleMenuMappings = useRBACStore((state) => state.setRoleMenuMappings);

  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  // Store local state of selected menus before saving
  const [selectedMenusLocal, setSelectedMenusLocal] = useState<Set<number>>(new Set());
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
      setSelectedMenusLocal(new Set(mapping?.menuIds || []));
      setHasChanges(false);
    }
  }, [selectedRole, mappings]);

  if (!mounted) return null;

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

  const toggleMenuSelection = (id: number, isChecked: boolean, allChildrenIds: number[]) => {
    const newSelection = new Set(selectedMenusLocal);

    if (isChecked) {
      // Add current and all children
      newSelection.add(id);
      allChildrenIds.forEach(childId => newSelection.add(childId));

      // Also ensure parent is added if checking a child
      let current = menus.find(m => m.id === id);
      while (current && current.parentId !== null) {
        newSelection.add(current.parentId);
        current = menus.find(m => m.id === current!.parentId);
      }
    } else {
      // Remove current and all children
      newSelection.delete(id);
      allChildrenIds.forEach(childId => newSelection.delete(childId));
    }

    setSelectedMenusLocal(newSelection);
    setHasChanges(true);
  };

  const getAllChildrenIds = (nodeId: number): number[] => {
    const children = menus.filter(m => m.parentId === nodeId);
    let ids: number[] = [];
    children.forEach(child => {
      ids.push(child.id);
      ids = [...ids, ...getAllChildrenIds(child.id)];
    });
    return ids;
  };

  const isNodeChecked = (nodeId: number, childrenIds: number[]) => {
    if (childrenIds.length === 0) {
      return selectedMenusLocal.has(nodeId) ? 'checked' : 'unchecked';
    }

    // It has children, check if all, some, or none are selected
    const selectedChildrenCount = childrenIds.filter(id => selectedMenusLocal.has(id)).length;

    if (selectedChildrenCount === 0 && !selectedMenusLocal.has(nodeId)) {
      return 'unchecked';
    } else if (selectedChildrenCount === childrenIds.length && selectedMenusLocal.has(nodeId)) {
      return 'checked';
    } else {
      return 'indeterminate';
    }
  };

  const renderTree = (nodes: any[], depth = 0) => {
    return nodes.map((node) => {
      // Filter logic if searching
      if (searchTerm && !node.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !getAllChildrenIds(node.id).some(cid => menus.find(m => m.id === cid)?.name.toLowerCase().includes(searchTerm.toLowerCase()))) {
        return null;
      }

      const childrenIds = getAllChildrenIds(node.id);
      const checkedState = isNodeChecked(node.id, childrenIds);
      const isExpanded = expandedNodes.has(node.id) || searchTerm.length > 0;

      return (
        <div key={node.id}>
          <div
            className={`flex items-center group py-2 px-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors`}
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

              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 mr-3 text-blue-600 bg-white border-neutral-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-neutral-900 focus:ring-2 dark:bg-neutral-800 dark:border-neutral-600 cursor-pointer"
                  checked={checkedState === 'checked'}
                  ref={input => {
                    if (input) input.indeterminate = checkedState === 'indeterminate';
                  }}
                  onChange={(e) => toggleMenuSelection(node.id, e.target.checked, childrenIds)}
                />
                <span className="text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer select-none" onClick={() => toggleMenuSelection(node.id, checkedState !== 'checked', childrenIds)}>
                  {node.name}
                </span>
                <span className="ml-3 text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                  {node.type}
                </span>
              </div>
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

  const handleSave = () => {
    if (!selectedRole) return;

    const existing = mappings.find(m => m.roleId === selectedRole);
    let newMappings;
    if (existing) {
      newMappings = mappings.map(m => m.roleId === selectedRole ? { ...m, menuIds: Array.from(selectedMenusLocal) } : m);
    } else {
      newMappings = [...mappings, { roleId: selectedRole, menuIds: Array.from(selectedMenusLocal) }];
    }

    setRoleMenuMappings(newMappings);
    setHasChanges(false);
    alert("Role menu mapping saved successfully.");
  };

  const currentRoleName = roles.find(r => r.id === selectedRole)?.name || '';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Role-Menu Mapping</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Configure which navigation menus are visible for each role.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            disabled={!hasChanges}
            onClick={() => setSelectedRole(selectedRole)} // Reset local changes
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

        {/* Right: Menu Selection Tree */}
        <div className="lg:col-span-9 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center">
              Menu Configuration for <span className="ml-1 font-bold text-neutral-900 dark:text-white">'{currentRoleName}'</span>
            </h2>
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
        </div>
      </div>
    </div>
  );
}
