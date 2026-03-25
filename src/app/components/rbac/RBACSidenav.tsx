'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ChartBarIcon,
  ListBulletIcon,
  DocumentIcon,
  WrenchScrewdriverIcon,
  CubeIcon,
  UserIcon,
  KeyIcon,
  ShieldCheckIcon 
} from '@heroicons/react/24/outline';
import { useRBACStore } from '@/lib/rbac/rbacStore';
import { useEffect, useState } from 'react';

// Default nav items specifically for the RBAC module
const rbacNavItems = [
  { name: 'Dashboard', href: '/rbac', icon: ChartBarIcon, menuId: 23 },
  { name: 'Menus Management', href: '/rbac/menus-management', icon: ListBulletIcon, menuId: 24 },
  { name: 'Pages Management', href: '/rbac/pages-management', icon: DocumentIcon, menuId: 25 },
  { name: 'Actions Management', href: '/rbac/actions-management', icon: WrenchScrewdriverIcon, menuId: 26 },
  { name: 'Resources Management', href: '/rbac/resources-management', icon: CubeIcon, menuId: 27 },
  { name: 'Role Menu Mapping', href: '/rbac/role-menu-mapping', icon: UserIcon, menuId: 28 },
  { name: 'Role Page Permissions', href: '/rbac/role-page-permissions', icon: KeyIcon, menuId: 29 },
  { name: 'User Menu Override', href: '/rbac/user-menu-override', icon: ShieldCheckIcon, menuId: 30 },
  { name: 'User Page Permission Override', href: '/rbac/user-page-permission-override', icon: KeyIcon, menuId: 31 },
];

export default function RBACSidenav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  const roleMenuMappings = useRBACStore((state) => state.roleMenuMappings);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Prevent hydration errors

  // In a real integration, we'd check sessionStorage.getItem('role_id') here.
  // For the super admin configuring this module, we show everything or we filter based on role 7 (Super Admin).
  // Because this is specifically the RBAC module's side nav, and role 7 has access to all these menus in our initial data:

  const currentRoleId = typeof window !== 'undefined' ? Number(sessionStorage.getItem('role_id')) || 7 : 7;
  const currentRoleMapping = roleMenuMappings.find(m => m.roleId === currentRoleId);
  const allowedMenuIds = new Set(currentRoleMapping?.menuIds || []);

  const visibleNavItems = rbacNavItems.filter(item => allowedMenuIds.has(item.menuId));

  return (
    <nav className="flex flex-col p-4 space-y-2 h-full">
      <div className="flex-1">
        {visibleNavItems.length > 0 ? (
          visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/rbac' && pathname.startsWith(item.href + '/'));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-100 text-indigo-700 border-r-2 border-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-400 shadow-sm'
                    : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5 mr-3 flex-shrink-0" aria-hidden="true" />
                <span>{item.name}</span>
              </Link>
            );
          })
        ) : (
          <div className="text-sm text-neutral-500 text-center py-4">No menus assigned to your role.</div>
        )}
      </div>
    </nav>
  );
}
