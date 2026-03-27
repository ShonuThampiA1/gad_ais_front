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

export interface User {
  id: number;
  name: string;
  email: string;
  roleId: number; // Base assigned role
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
  users: User[];
  roleMenuMappings: RoleMenuMapping[];
  rolePagePermissions: RolePagePermissionMapping[];
  userOverrides: UserOverride[];

  // Setters
  setActions: (actions: ActionMaster[]) => void;
  setResources: (resources: Resource[]) => void;
  setPages: (pages: PageMaster[]) => void;
  setMenus: (menus: MenuNode[]) => void;
  setRoles: (roles: Role[]) => void;
  setUsers: (users: User[]) => void;
  setRoleMenuMappings: (mappings: RoleMenuMapping[]) => void;
  setRolePagePermissions: (mappings: RolePagePermissionMapping[]) => void;
  setUserOverrides: (overrides: UserOverride[]) => void;
}

// Initial Real Data Extracted from Project
const initialRoles: Role[] = [
  { id: 1, name: 'ADMIN' },
  { id: 2, name: 'OFFICER' },
  { id: 3, name: 'Section Clerk' },
  { id: 4, name: 'Under Secretary' },
  { id: 5, name: 'AS_II' },
  { id: 6, name: 'Deputy Secretary' },
  { id: 7, name: 'Super Admin' },
];

const initialUsers: User[] = [
  { id: 101, name: 'John Admin', roleId: 1, email: 'admin@example.com' },
  { id: 102, name: 'Jane Officer', roleId: 2, email: 'officer@example.com' },
  { id: 103, name: 'Robert Clerk', roleId: 3, email: 'clerk@example.com' },
  { id: 104, name: 'Emily Super', roleId: 7, email: 'super@example.com' },
];

const initialMenus: MenuNode[] = [
  // Dashboard & Main Modules
  { id: 1, name: 'Dashboard', path: '/dashboard', type: 'MODULE', parentId: null, sortOrder: 1, icon: 'HomeIcon' },
  { id: 2, name: 'e-Services', path: '/services/requests', type: 'MODULE', parentId: null, sortOrder: 2, icon: 'UsersIcon' },
  { id: 3, name: 'My Applications', path: '/applications', type: 'MODULE', parentId: null, sortOrder: 3, icon: 'FolderIcon' },
  { id: 4, name: 'My Documents', path: '/documents', type: 'MODULE', parentId: null, sortOrder: 4, icon: 'CalendarIcon' },
  { id: 5, name: 'My Profile', path: '/er-profile', type: 'MODULE', parentId: null, sortOrder: 5, icon: 'UserIcon' },

  // Official Navigation
  { id: 6, name: 'Official Dashboard', path: '/official/dashboard', type: 'MENU', parentId: null, sortOrder: 6, icon: 'UserPlusIcon' },
  { id: 7, name: 'AIS Officer Onboarding', path: '/official', type: 'MENU', parentId: null, sortOrder: 7, icon: 'UserPlusIcon' },

  // Services Navigation
  { id: 8, name: 'Entitlement Claims', path: '/services/entitlement-claims', type: 'MENU', parentId: 2, sortOrder: 1, icon: 'HomeIcon' },
  { id: 9, name: 'Requests', path: '/services/requests', type: 'MENU', parentId: 2, sortOrder: 2, icon: 'UsersIcon' },
  { id: 10, name: 'Permissions', path: '/services/permissions', type: 'MENU', parentId: 2, sortOrder: 3, icon: 'FolderIcon' },
  { id: 11, name: 'Submissions', path: '/services/submissions', type: 'MENU', parentId: 2, sortOrder: 4, icon: 'CalendarIcon' },

  // Master Controls Navigation
  { id: 12, name: 'Master Controls', path: '/master-controls', type: 'MODULE', parentId: null, sortOrder: 8, icon: 'CogIcon' },
  { id: 13, name: 'Officer Management', path: '/master-controls/user-management', type: 'MENU', parentId: 12, sortOrder: 1, icon: 'UserPlusIcon' },
  { id: 14, name: 'Personal Profile', path: '/master/personal-profile', type: 'MENU', parentId: 12, sortOrder: 2, icon: 'HomeIcon' },
  { id: 15, name: 'Staffing and Roles', path: '/master/staffing-and-roles', type: 'MENU', parentId: 12, sortOrder: 3, icon: 'UsersIcon' },
  { id: 16, name: 'Administrative Information', path: '/master/administrative-information', type: 'MENU', parentId: 12, sortOrder: 4, icon: 'FolderIcon' },
  { id: 17, name: 'Employment and Career Details', path: '/master/employment-and-career', type: 'MENU', parentId: 12, sortOrder: 5, icon: 'CalendarIcon' },

  // Admin Controls
  { id: 18, name: 'Admin Controls', path: '/admin-controls', type: 'MODULE', parentId: null, sortOrder: 9, icon: 'ShieldCheckIcon' },
  { id: 19, name: 'Add Section Officer', path: '/add-section-officer', type: 'MENU', parentId: 18, sortOrder: 1, icon: 'UserPlusIcon' },
  { id: 20, name: 'Add Office', path: '/add-office', type: 'MENU', parentId: 18, sortOrder: 2, icon: 'BuildingLibraryIcon' },
  { id: 21, name: 'Add Post', path: '/add-post', type: 'MENU', parentId: 18, sortOrder: 3, icon: 'ShieldCheckIcon' },
  { id: 22, name: 'Add Officer', path: '/add-officer', type: 'MENU', parentId: 18, sortOrder: 4, icon: 'UserPlusIcon' },

  // RBAC Controls
  { id: 23, name: 'RBAC', path: '/rbac', type: 'MODULE', parentId: null, sortOrder: 10, icon: 'ShieldCheckIcon' },
  { id: 24, name: 'Menus Management', path: '/rbac/menus-management', type: 'MENU', parentId: 23, sortOrder: 1 },
  { id: 25, name: 'Pages Management', path: '/rbac/pages-management', type: 'MENU', parentId: 23, sortOrder: 2 },
  { id: 26, name: 'Actions Management', path: '/rbac/actions-management', type: 'MENU', parentId: 23, sortOrder: 3 },
  { id: 27, name: 'Resources Management', path: '/rbac/resources-management', type: 'MENU', parentId: 23, sortOrder: 4 },
  { id: 28, name: 'Role Menu Mapping', path: '/rbac/role-menu-mapping', type: 'MENU', parentId: 23, sortOrder: 5 },
  { id: 29, name: 'Role Page Permissions', path: '/rbac/role-page-permissions', type: 'MENU', parentId: 23, sortOrder: 6 },
  { id: 30, name: 'User Menu Override', path: '/rbac/user-menu-override', type: 'MENU', parentId: 23, sortOrder: 7 },
  { id: 31, name: 'User Page Permission Override', path: '/rbac/user-page-permission-override', type: 'MENU', parentId: 23, sortOrder: 8 },
  { id: 62, name: 'Role Management', path: '/rbac/role-management', type: 'MENU', parentId: 23, sortOrder: 9 },
  { id: 63, name: 'User Role Mapping', path: '/rbac/user-management', type: 'MENU', parentId: 23, sortOrder: 10 },
];

const initialActions: ActionMaster[] = [
  { id: 1, name: 'View', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 2, name: 'Add', color: 'bg-green-100 text-green-700 border-green-200' },
  { id: 3, name: 'Edit', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { id: 4, name: 'Delete', color: 'bg-red-100 text-red-700 border-red-200' },
  { id: 5, name: 'Approve', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 6, name: 'Reject', color: 'bg-neutral-100 text-neutral-700 border-neutral-200' },
  { id: 7, name: 'Export', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  { id: 8, name: 'Print', color: 'bg-gray-100 text-gray-700 border-gray-200' },
];

const initialPages: PageMaster[] = [
  { id: 1, name: 'Dashboard', url: '/dashboard' },
  { id: 2, name: 'ER Profile', url: '/er-profile' },
  { id: 3, name: 'ER Profile Preview', url: '/er-profile/preview-profile' },
  { id: 4, name: 'ER Profile SPARK Preview', url: '/er-profile/spark-preview' },
  { id: 5, name: 'Documents', url: '/documents' },
  { id: 6, name: 'Applications', url: '/applications' },
  { id: 7, name: 'Reports', url: '/reports' },

  { id: 8, name: 'Add Section Officer', url: '/add-section-officer' },
  { id: 9, name: 'Add Office', url: '/add-office' },
  { id: 10, name: 'Add Post', url: '/add-post' },
  { id: 11, name: 'Add Officer', url: '/add-officer' },

  // Master Controls
  { id: 12, name: 'Officer Management', url: '/master-controls/user-management' },
  { id: 13, name: 'Administrative Department Master', url: '/master-controls/administrative-department' },
  { id: 14, name: 'Cadre Master', url: '/master-controls/cadre' },
  { id: 15, name: 'Category Master', url: '/master-controls/category' },
  { id: 16, name: 'Country Master', url: '/master-controls/country' },
  { id: 17, name: 'Designation Master', url: '/master-controls/designation' },
  { id: 18, name: 'Disability Master', url: '/master-controls/disability' },
  { id: 19, name: 'District Master', url: '/master-controls/district' },
  { id: 20, name: 'Division Master', url: '/master-controls/division' },
  { id: 21, name: 'Gender Master', url: '/master-controls/gender' },
  { id: 22, name: 'Grade Master', url: '/master-controls/grade' },
  { id: 23, name: 'Implementing Agency Master', url: '/master-controls/implementing-agency' },
  { id: 24, name: 'Language Master', url: '/master-controls/language' },
  { id: 25, name: 'Level Master', url: '/master-controls/level' },
  { id: 26, name: 'Ministry Master', url: '/master-controls/ministry' },
  { id: 27, name: 'Posting Type Master', url: '/master-controls/posting-type' },
  { id: 28, name: 'Qualification Master', url: '/master-controls/qualification' },
  { id: 29, name: 'Recruitment Master', url: '/master-controls/recruitment' },
  { id: 30, name: 'Retirement Master', url: '/master-controls/retirement' },
  { id: 31, name: 'Role Master', url: '/master-controls/role' },
  { id: 32, name: 'State Master', url: '/master-controls/state' },
  { id: 33, name: 'Tenure Master', url: '/master-controls/tenure' },
  { id: 34, name: 'Training Type Master', url: '/master-controls/training-type' },

  // Master Forms
  { id: 35, name: 'Personal Profile Master', url: '/master/personal-profile' },
  { id: 36, name: 'Staffing and Roles Master', url: '/master/staffing-and-roles' },
  { id: 37, name: 'Administrative Information Master', url: '/master/administrative-information' },
  { id: 38, name: 'Employment Details Master', url: '/master/employment-and-career' },

  // Official section
  { id: 39, name: 'AIS Officer Onboarding', url: '/official' },
  { id: 40, name: 'Official Dashboard', url: '/official/dashboard' },
  { id: 41, name: 'First Time Logins List', url: '/official/dashboard/first-time-logins' },
  { id: 42, name: 'Officer Verification List', url: '/official/dashboard/officer-verification-list' },
  { id: 43, name: 'Started ER Profiles', url: '/official/dashboard/started-er' },
  { id: 44, name: 'Verified Profiles', url: '/official/verified' },
  { id: 45, name: 'Profiles Awaiting Verification', url: '/official/pending' },
  { id: 46, name: 'Official Edit Profile', url: '/official/edit-profile' },
  { id: 47, name: 'Official Preview Profile', url: '/official/preview-profile' },

  // RBAC
  { id: 48, name: 'RBAC Dashoard', url: '/rbac' },
  { id: 49, name: 'Menus Management', url: '/rbac/menus-management' },
  { id: 50, name: 'Pages Management', url: '/rbac/pages-management' },
  { id: 51, name: 'Actions Management', url: '/rbac/actions-management' },
  { id: 52, name: 'Resources Management', url: '/rbac/resources-management' },
  { id: 53, name: 'Role Menu Mapping', url: '/rbac/role-menu-mapping' },
  { id: 54, name: 'Role Page Permissions', url: '/rbac/role-page-permissions' },
  { id: 55, name: 'User Menu Override', url: '/rbac/user-menu-override' },
  { id: 56, name: 'User Page Permission Override', url: '/rbac/user-page-permission-override' },
  { id: 62, name: 'Role Management', url: '/rbac/role-management' },
  { id: 63, name: 'User Management', url: '/rbac/user-management' },

  // Services
  { id: 57, name: 'Services Entitlement Claims', url: '/services/entitlement-claims' },
  { id: 58, name: 'Services Requests', url: '/services/requests' },
  { id: 59, name: 'Services Permissions', url: '/services/permissions' },
  { id: 60, name: 'Services Submissions', url: '/services/submissions' },
  { id: 61, name: 'Services Documents', url: '/services/documents' },
];

const initialResources: Resource[] = [
  { id: 1, key: 'dashboard.view', category: 'DASHBOARD', action: 'VIEW' },
  { id: 2, key: 'profile.edit', category: 'PROFILE', action: 'EDIT' },
  { id: 3, key: 'document.upload', category: 'DOCUMENT', action: 'ADD' },
  { id: 4, key: 'document.download', category: 'DOCUMENT', action: 'EXPORT' },
  { id: 5, key: 'application.approve', category: 'APPLICATION', action: 'APPROVE' },
  { id: 6, key: 'application.reject', category: 'APPLICATION', action: 'REJECT' },
  { id: 7, key: 'officer.create', category: 'OFFICER', action: 'ADD' },
  { id: 8, key: 'rbac.manage', category: 'SYSTEM', action: 'EDIT' },
];

// Provide sensible default mappings for the actual roles
const initialRoleMenuMappings: RoleMenuMapping[] = [
  { roleId: 1, menuIds: [18, 19, 20, 21, 22] }, // ADMIN gets Admin Controls
  { roleId: 2, menuIds: [1, 2, 3, 4, 5, 8, 9, 10, 11] }, // OFFICER gets their dashboard, services, applications
  { roleId: 3, menuIds: [12, 13, 14, 15, 16, 17] }, // Section Clerk gets Master Controls
  { roleId: 7, menuIds: [23, 24, 25, 26, 27, 28, 29, 30, 31, 62, 63, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22] }, // Super Admin gets everything
];

const initialRolePagePermissions: RolePagePermissionMapping[] = [
  {
    roleId: 1, // Admin
    permissions: [
      { pageId: 8, view: true, add: true, edit: true, delete: false, approve: false, export: true }, // Add Section Officer
      { pageId: 9, view: true, add: true, edit: true, delete: false, approve: false, export: true }, // Add Office
      { pageId: 10, view: true, add: true, edit: true, delete: false, approve: false, export: true }, // Add Post
      { pageId: 11, view: true, add: true, edit: true, delete: false, approve: false, export: true }, // Add Officer
    ]
  },
  {
    roleId: 2, // Officer
    permissions: [
      { pageId: 1, view: true, add: false, edit: false, delete: false, approve: false, export: false }, // Dashboard
      { pageId: 2, view: true, add: true, edit: true, delete: false, approve: false, export: true }, // ER Profile
      { pageId: 5, view: true, add: true, edit: false, delete: true, approve: false, export: true }, // Documents
      { pageId: 6, view: true, add: true, edit: false, delete: false, approve: false, export: true }, // Applications
      { pageId: 58, view: true, add: true, edit: true, delete: false, approve: false, export: false }, // e-Services Requests
    ]
  },
  {
    roleId: 3, // Section Clerk
    permissions: [
      { pageId: 12, view: true, add: true, edit: true, delete: false, approve: false, export: true }, // Officer Mgmt
      { pageId: 35, view: true, add: true, edit: true, delete: false, approve: false, export: true }, // Personal Profile Master
      { pageId: 36, view: true, add: true, edit: true, delete: false, approve: false, export: true }, // Staffing Master
      { pageId: 37, view: true, add: true, edit: true, delete: false, approve: false, export: true }, // Admin Info Master
      { pageId: 38, view: true, add: true, edit: true, delete: false, approve: false, export: true }, // Emp Details Master
    ]
  },
  {
    roleId: 7, // Super Admin
    permissions: initialPages.map(page => ({
      pageId: page.id, view: true, add: true, edit: true, delete: true, approve: true, export: true
    }))
  }
];

export const useRBACStore = create<RBACState>()(
  persist(
    (set) => ({
      actions: initialActions,
      resources: initialResources,
      pages: initialPages,
      menus: initialMenus,
      roles: initialRoles,
      users: initialUsers,
      roleMenuMappings: initialRoleMenuMappings,
      rolePagePermissions: initialRolePagePermissions,
      userOverrides: [],

      setActions: (actions) => set({ actions }),
      setResources: (resources) => set({ resources }),
      setPages: (pages) => set({ pages }),
      setMenus: (menus) => set({ menus }),
      setRoles: (roles) => set({ roles }),
      setUsers: (users) => set({ users }),
      setRoleMenuMappings: (mappings) => set({ roleMenuMappings: mappings }),
      setRolePagePermissions: (mappings) => set({ rolePagePermissions: mappings }),
      setUserOverrides: (overrides) => set({ userOverrides: overrides }),
    }),
    {
      name: 'rbac-storage', // name of item in storage (must be unique)
    }
  )
);
