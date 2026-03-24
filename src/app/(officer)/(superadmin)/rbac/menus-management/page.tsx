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
    name: 'Home',
    path: '/home',
    type: 'MENU',
    parentId: null,
    sortOrder: 1,
    expanded: true,
  },
  {
    id: 2,
    name: 'Master',
    path: '/master',
    type: 'MODULE',
    parentId: null,
    sortOrder: 2,
    expanded: true,
    children: [
      { id: 3, name: 'Administrative Information', path: '/master/administrative-information', type: 'MENU', parentId: 2, sortOrder: 1 },
      { id: 4, name: 'Employment and Career', path: '/master/employment-and-career', type: 'MENU', parentId: 2, sortOrder: 2 },
      { id: 5, name: 'Personal Profile', path: '/master/personal-profile', type: 'MENU', parentId: 2, sortOrder: 3 },
      { id: 6, name: 'Staffing and Roles', path: '/master/staffing-and-roles', type: 'MENU', parentId: 2, sortOrder: 4 },
    ],
  },
  {
    id: 7,
    name: 'Services',
    path: '/services',
    type: 'MODULE',
    parentId: null,
    sortOrder: 3,
    expanded: true,
    children: [
      { id: 8, name: 'Entitlement Claims', path: '/services/entitlement-claims', type: 'MENU', parentId: 7, sortOrder: 1 },
      { id: 9, name: 'Permissions', path: '/services/permissions', type: 'MENU', parentId: 7, sortOrder: 2 },
      { id: 10, name: 'Requests', path: '/services/requests', type: 'MENU', parentId: 7, sortOrder: 3 },
      { id: 11, name: 'Submissions', path: '/services/submissions', type: 'MENU', parentId: 7, sortOrder: 4 },
    ],
  },
  {
    id: 12,
    name: 'RBAC',
    path: '/rbac',
    type: 'MODULE',
    parentId: null,
    sortOrder: 4,
    expanded: true,
    children: [
      { id: 13, name: 'Dashboard', path: '/rbac/dashboard', type: 'MENU', parentId: 12, sortOrder: 1 },
      { id: 14, name: 'Menus Management', path: '/rbac/menus-management', type: 'MENU', parentId: 12, sortOrder: 2 },
      { id: 15, name: 'Pages Management', path: '/rbac/pages-management', type: 'MENU', parentId: 12, sortOrder: 3 },
      { id: 16, name: 'Actions Management', path: '/rbac/actions-management', type: 'MENU', parentId: 12, sortOrder: 4 },
      { id: 17, name: 'Resources Management', path: '/rbac/resources-management', type: 'MENU', parentId: 12, sortOrder: 5 },
      { id: 18, name: 'Role Page Permissions', path: '/rbac/role-page-permissions', type: 'MENU', parentId: 12, sortOrder: 6 },
      { id: 19, name: 'Role Menu Mapping', path: '/rbac/role-menu-mapping', type: 'MENU', parentId: 12, sortOrder: 7 },
      { id: 20, name: 'User Menu Override', path: '/rbac/user-menu-override', type: 'MENU', parentId: 12, sortOrder: 8 },
      { id: 21, name: 'User Page Permission Override', path: '/rbac/user-page-permission-override', type: 'MENU', parentId: 12, sortOrder: 9 },
    ],
  },
  {
    id: 22,
    name: 'Official Verified',
    path: '/official/verified',
    type: 'MENU',
    parentId: null,
    sortOrder: 5,
  },
];

export default function MenusManagementPage() {
  const [menus, setMenus] = useState<MenuNode[]>(mockMenus);
  const [selectedMenu, setSelectedMenu] = useState<MenuNode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // State for form data when editing or adding
  const [formData, setFormData] = useState<Partial<MenuNode>>({
    name: '',
    path: '',
    type: 'MENU',
    parentId: null,
    sortOrder: 1,
  });

  const [isAdding, setIsAdding] = useState(false);

  // Helper to generate a unique ID
  const generateId = (nodes: MenuNode[]): number => {
    let maxId = 0;
    const findMaxId = (nodesArray: MenuNode[]) => {
      for (const node of nodesArray) {
        if (node.id > maxId) maxId = node.id;
        if (node.children) findMaxId(node.children);
      }
    };
    findMaxId(nodes);
    return maxId + 1;
  };

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

  const handleSelectMenu = (node: MenuNode) => {
    setSelectedMenu(node);
    setIsAdding(false);
    setFormData({
      name: node.name,
      path: node.path,
      type: node.type,
      parentId: node.parentId,
      sortOrder: node.sortOrder,
    });
  };

  const handleAddMenuClick = () => {
    setSelectedMenu(null);
    setIsAdding(true);
    setFormData({
      name: '',
      path: '',
      type: 'MENU',
      parentId: null,
      sortOrder: 1,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'parentId' ? (value === '' ? null : parseInt(value)) : name === 'sortOrder' ? parseInt(value) : value,
    }));
  };

  // Helper to rebuild tree from flat list or update tree
  const flattenTree = (nodes: MenuNode[]): MenuNode[] => {
    let flat: MenuNode[] = [];
    nodes.forEach(node => {
      flat.push({ ...node, children: undefined });
      if (node.children) {
        flat = flat.concat(flattenTree(node.children));
      }
    });
    return flat;
  };

  const buildTree = (flatNodes: MenuNode[]): MenuNode[] => {
    const rootNodes: MenuNode[] = [];
    const lookup: { [key: number]: MenuNode } = {};

    // Create copies and lookup
    flatNodes.forEach(node => {
      lookup[node.id] = { ...node, children: [] };
    });

    flatNodes.forEach(node => {
      if (node.parentId === null) {
        rootNodes.push(lookup[node.id]);
      } else {
        if (lookup[node.parentId]) {
          lookup[node.parentId].children = lookup[node.parentId].children || [];
          lookup[node.parentId].children!.push(lookup[node.id]);
        } else {
          // If parent is not found, treat as root to avoid losing it
          rootNodes.push(lookup[node.id]);
        }
      }
    });

    // Sort children
    const sortNodes = (nodes: MenuNode[]) => {
      nodes.sort((a, b) => a.sortOrder - b.sortOrder);
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          sortNodes(node.children);
        } else {
           delete node.children; // clean up empty children arrays
        }
      });
    };
    sortNodes(rootNodes);
    return rootNodes;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const flatMenus = flattenTree(menus);

    if (isAdding) {
      const newNode: MenuNode = {
        id: generateId(menus),
        name: formData.name || 'New Menu',
        path: formData.path || '',
        type: formData.type as any,
        parentId: formData.parentId || null,
        sortOrder: formData.sortOrder || 1,
        expanded: true
      };
      flatMenus.push(newNode);
      setMenus(buildTree(flatMenus));
      setIsAdding(false);
      setSelectedMenu(newNode); // Auto-select newly added
    } else if (selectedMenu) {
      const updatedFlatMenus = flatMenus.map(node => {
        if (node.id === selectedMenu.id) {
          return {
            ...node,
            name: formData.name || node.name,
            path: formData.path || node.path,
            type: formData.type as any || node.type,
            parentId: formData.parentId !== undefined ? formData.parentId : node.parentId,
            sortOrder: formData.sortOrder !== undefined ? formData.sortOrder : node.sortOrder
          };
        }
        return node;
      });
      setMenus(buildTree(updatedFlatMenus));

      // Update selected menu reference to show updated values
      setSelectedMenu({
        ...selectedMenu,
        name: formData.name || selectedMenu.name,
        path: formData.path || selectedMenu.path,
        type: formData.type as any || selectedMenu.type,
        parentId: formData.parentId !== undefined ? formData.parentId : selectedMenu.parentId,
        sortOrder: formData.sortOrder !== undefined ? formData.sortOrder : selectedMenu.sortOrder
      });
    }
  };

  const handleDelete = () => {
    if (!selectedMenu) return;

    // Confirm delete
    if (!window.confirm(`Are you sure you want to delete "${selectedMenu.name}"? This will also delete any children.`)) {
      return;
    }

    const deleteNodeAndChildrenIds = (nodeId: number, nodes: MenuNode[]): number[] => {
      let idsToDelete = [nodeId];
      const findChildren = (currentNodes: MenuNode[], targetId: number) => {
        for (const n of currentNodes) {
          if (n.parentId === targetId) {
            idsToDelete.push(n.id);
            if (n.children) {
              findChildren(n.children, n.id);
            }
          } else if (n.children) {
             findChildren(n.children, targetId); // continue searching
          }
        }
      };
      findChildren(nodes, nodeId);
      return idsToDelete;
    };

    const idsToRemove = deleteNodeAndChildrenIds(selectedMenu.id, menus);
    const flatMenus = flattenTree(menus).filter(n => !idsToRemove.includes(n.id));

    setMenus(buildTree(flatMenus));
    setSelectedMenu(null);
    setFormData({
      name: '',
      path: '',
      type: 'MENU',
      parentId: null,
      sortOrder: 1,
    });
    setIsAdding(false);
  };

  // Filter menus for searching
  const filteredMenus = React.useMemo(() => {
    if (!searchTerm) return menus;

    const flat = flattenTree(menus);
    const matchedIds = new Set<number>();

    // Find all matches
    flat.forEach(node => {
      if (node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          node.path.toLowerCase().includes(searchTerm.toLowerCase())) {
        matchedIds.add(node.id);

        // Add all parents of the matched node to ensure the tree structure holds
        let currentParentId = node.parentId;
        while (currentParentId !== null) {
          matchedIds.add(currentParentId);
          const parent = flat.find(n => n.id === currentParentId);
          currentParentId = parent ? parent.parentId : null;
        }
      }
    });

    const filteredFlat = flat.filter(node => matchedIds.has(node.id)).map(n => ({...n, expanded: true})); // expand all matched
    return buildTree(filteredFlat);
  }, [menus, searchTerm]);

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
              onClick={() => handleSelectMenu(node)}
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

  // Get flat list for parent dropdown
  const flatMenusForDropdown = flattenTree(menus);

  // Helper to build path preview
  const buildBreadcrumbs = () => {
    if (isAdding) {
      if (!formData.parentId) return [{ name: formData.name || 'New Menu' }];
      const parent = flattenTree(menus).find(m => m.id === formData.parentId);
      if (parent) {
         return [{ name: parent.name }, { name: formData.name || 'New Menu' }]; // Simplified breadcrumb
      }
      return [{ name: formData.name || 'New Menu' }];
    }

    if (!selectedMenu) return [{ name: 'Select a menu to see preview' }];

    const crumbs = [];
    let current: MenuNode | undefined = selectedMenu;
    const flat = flattenTree(menus);

    while (current) {
      crumbs.unshift({ name: current.name });
      const parentIdOfCurrentNode: number | null = current.parentId;
      current = flat.find(m => m.id === parentIdOfCurrentNode);
    }

    return crumbs;
  };

  const breadcrumbs = buildBreadcrumbs();

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
          <button
            onClick={handleAddMenuClick}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
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
            {filteredMenus.length > 0 ? renderMenuTree(filteredMenus) : (
              <div className="text-sm text-neutral-500 p-4 text-center">No menus found.</div>
            )}
          </div>
          <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-800">
            <button className="flex items-center justify-center w-full px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
              <ArrowsUpDownIcon className="h-4 w-4 mr-2" />
              Reorder Menus (Not Implemented)
            </button>
          </div>
        </div>

        {/* Right Panel: Menu Details */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
                {isAdding ? 'Add New Menu' : selectedMenu ? `Editing: ${selectedMenu.name}` : 'Menu Details'}
              </h3>
              {selectedMenu && !isAdding && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {}} // Could trigger a special edit mode if needed, right now we edit inline
                    className="p-2 text-neutral-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 text-neutral-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
            <div className="p-6">
              {(selectedMenu || isAdding) ? (
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSave}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Menu Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Enter menu name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Menu Path</label>
                    <input
                      type="text"
                      name="path"
                      value={formData.path || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="/path/to/page"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Menu Type</label>
                    <select
                      name="type"
                      value={formData.type || 'MENU'}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
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
                      name="parentId"
                      value={formData.parentId === null ? '' : formData.parentId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">None (Top Level)</option>
                      {flatMenusForDropdown
                        .filter(m => !selectedMenu || m.id !== selectedMenu.id) // Prevent setting parent to self
                        .map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Sort Order</label>
                    <input
                      type="number"
                      name="sortOrder"
                      value={formData.sortOrder || 0}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (isAdding) setIsAdding(false);
                        else if (selectedMenu) handleSelectMenu(selectedMenu); // Reset form
                      }}
                      className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
                      {isAdding ? 'Add Menu' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
                  Select a menu from the tree or click "Add Menu" to view details.
                </div>
              )}
            </div>
          </div>

          {/* Preview Card */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-6">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">Hierarchical Preview</h4>
            <div className="flex items-center text-sm text-blue-700 dark:text-blue-400 font-mono flex-wrap">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  <span className={index === breadcrumbs.length - 1 ? "font-bold" : ""}>
                    {crumb.name}
                  </span>
                  {index < breadcrumbs.length - 1 && (
                    <ChevronRightIcon className="h-3 w-3 mx-2 flex-shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
