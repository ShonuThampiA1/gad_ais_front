import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ----------------------------------------------------
// Types
// ----------------------------------------------------

export interface ActionMaster {
  id: number;
  name: string;
  color?: string;
}

export interface Resource {
  id: number;
  key: string;
  category: string;
  action: string;
}

export interface PageMaster {
  id: number;
  name: string;
  url: string;
}

export interface MenuNode {
  id: number;
  name: string;
  path: string;
  type: 'MODULE' | 'MENU' | 'SUBMENU' | 'LINK' | 'BUTTON';
  parentId: number | null;
  sortOrder: number;
  icon?: string;
}

// Simple role interface for mapping
export interface Role {
  id: number;
  name: string;
}

// Role -> Menu IDs
export interface RoleMenuMapping {
  roleId: number;
  menuIds: number[];
}

// Role -> Page Permissions
export interface PagePermission {
  pageId: number;
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
  approve: boolean;
  export: boolean;
}

export interface RolePagePermissionMapping {
  roleId: number;
  permissions: PagePermission[];
}

// User Overrides
export interface UserOverride {
  userId: number;
  menuOverrides: { menuId: number; override: 'allow' | 'deny' }[];
  pageOverrides: {
    pageId: number;
    view?: 'allow' | 'deny';
    add?: 'allow' | 'deny';
    edit?: 'allow' | 'deny';
    delete?: 'allow' | 'deny';
    approve?: 'allow' | 'deny';
    export?: 'allow' | 'deny';
  }[];
}

// ----------------------------------------------------
// Store State & Actions
// ----------------------------------------------------

interface RBACState {
  // Data lists
  actions: ActionMaster[];
  resources: Resource[];
  pages: PageMaster[];
  menus: MenuNode[];
  roles: Role[];
  roleMenuMappings: RoleMenuMapping[];
  rolePagePermissions: RolePagePermissionMapping[];
  userOverrides: UserOverride[];

  // Setters
  setActions: (actions: ActionMaster[]) => void;
  setResources: (resources: Resource[]) => void;
  setPages: (pages: PageMaster[]) => void;
  setMenus: (menus: MenuNode[]) => void;
  setRoleMenuMappings: (mappings: RoleMenuMapping[]) => void;
  setRolePagePermissions: (mappings: RolePagePermissionMapping[]) => void;
  setUserOverrides: (overrides: UserOverride[]) => void;
}

// Initial Mock Data
const initialMenus: MenuNode[] = [
  { id: 1, name: 'Dashboard', path: '/dashboard', type: 'MODULE', parentId: null, sortOrder: 1, icon: 'HomeIcon' },
  { id: 2, name: 'Master Controls', path: '/master-controls', type: 'MODULE', parentId: null, sortOrder: 2, icon: 'CogIcon' },
  { id: 3, name: 'Services', path: '/services', type: 'MODULE', parentId: null, sortOrder: 3, icon: 'DocumentTextIcon' },
  { id: 4, name: 'RBAC', path: '/rbac', type: 'MODULE', parentId: null, sortOrder: 4, icon: 'ShieldCheckIcon' },
  { id: 5, name: 'Menus Management', path: '/rbac/menus-management', type: 'MENU', parentId: 4, sortOrder: 1 },
  { id: 6, name: 'Pages Management', path: '/rbac/pages-management', type: 'MENU', parentId: 4, sortOrder: 2 },
  { id: 7, name: 'Actions Management', path: '/rbac/actions-management', type: 'MENU', parentId: 4, sortOrder: 3 },
  { id: 8, name: 'Resources Management', path: '/rbac/resources-management', type: 'MENU', parentId: 4, sortOrder: 4 },
  { id: 9, name: 'Role Menu Mapping', path: '/rbac/role-menu-mapping', type: 'MENU', parentId: 4, sortOrder: 5 },
  { id: 10, name: 'Role Page Permissions', path: '/rbac/role-page-permissions', type: 'MENU', parentId: 4, sortOrder: 6 },
  { id: 11, name: 'User Menu Override', path: '/rbac/user-menu-override', type: 'MENU', parentId: 4, sortOrder: 7 },
  { id: 12, name: 'User Page Permission Override', path: '/rbac/user-page-permission-override', type: 'MENU', parentId: 4, sortOrder: 8 },
];

const initialActions: ActionMaster[] = [
  { id: 1, name: 'View', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 2, name: 'Add', color: 'bg-green-100 text-green-700 border-green-200' },
  { id: 3, name: 'Edit', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { id: 4, name: 'Delete', color: 'bg-red-100 text-red-700 border-red-200' },
];

const initialPages: PageMaster[] = [
  { id: 1, name: 'User List', url: '/admin/users' },
  { id: 2, name: 'Role List', url: '/admin/roles' },
  { id: 3, name: 'Menus Management', url: '/rbac/menus-management' },
  { id: 4, name: 'Pages Management', url: '/rbac/pages-management' },
];

const initialResources: Resource[] = [
  { id: 1, key: 'user.view', category: 'USER', action: 'VIEW' },
  { id: 2, key: 'user.create', category: 'USER', action: 'CREATE' },
];

const initialRoles: Role[] = [
  { id: 1, name: 'Super Admin' },
  { id: 2, name: 'Admin Officer' },
  { id: 3, name: 'Section Officer' },
];

export const useRBACStore = create<RBACState>()(
  persist(
    (set) => ({
      actions: initialActions,
      resources: initialResources,
      pages: initialPages,
      menus: initialMenus,
      roles: initialRoles,
      roleMenuMappings: [],
      rolePagePermissions: [],
      userOverrides: [],

      setActions: (actions) => set({ actions }),
      setResources: (resources) => set({ resources }),
      setPages: (pages) => set({ pages }),
      setMenus: (menus) => set({ menus }),
      setRoleMenuMappings: (mappings) => set({ roleMenuMappings: mappings }),
      setRolePagePermissions: (mappings) => set({ rolePagePermissions: mappings }),
      setUserOverrides: (overrides) => set({ userOverrides: overrides }),
    }),
    {
      name: 'rbac-storage', // name of item in storage (must be unique)
    }
  )
);
