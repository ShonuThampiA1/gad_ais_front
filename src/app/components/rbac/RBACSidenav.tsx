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
  { name: 'Role Management', href: '/rbac/role-management', icon: ShieldCheckIcon, menuId: 62 },
  { name: 'User Role Mapping', href: '/rbac/user-management', icon: UserIcon, menuId: 63 },
];

export default function RBACSidenav({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  const roleMenuMappings = useRBACStore((state) => state.roleMenuMappings);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Prevent hydration errors

  const currentRoleId = typeof window !== 'undefined' ? Number(sessionStorage.getItem('role_id')) || 7 : 7;
  const currentRoleMapping = roleMenuMappings.find(m => m.roleId === currentRoleId);
  const allowedMenuIds = new Set(currentRoleMapping?.menuIds || []);

  const visibleNavItems = rbacNavItems.filter(item => allowedMenuIds.has(item.menuId));

  // Find if any other item is active
  const anyOtherActive = visibleNavItems.slice(1).some(item =>
    pathname === item.href || pathname === `${item.href}/` || pathname.startsWith(`${item.href}/`)
  );

  return (
    <nav className="p-4 space-y-1 h-full">
      <div className="space-y-1">
        {visibleNavItems.length > 0 ? (
          visibleNavItems.map((item, index) => {
            const Icon = item.icon;

            // Determine if the current item is active
            let isActive = false;
            if (index === 0) {
              // Dashboard is active if it's an exact match, OR if we are on /rbac/dashboard,
              // OR if we are anywhere in /rbac and no other menu item matches.
              isActive = pathname === '/rbac' ||
                         pathname === '/rbac/' ||
                         pathname.startsWith('/rbac/dashboard') ||
                         (pathname.startsWith('/rbac') && !anyOtherActive);
            } else {
              isActive = pathname === item.href ||
                         pathname === `${item.href}/` ||
                         pathname.startsWith(`${item.href}/`);
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onItemClick}
                className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group ${
                  isActive
                    ? 'bg-primary-500 text-white translate-x-1'
                    : 'text-neutral-600 hover:bg-blue-50 hover:text-blue-700 dark:text-neutral-400 dark:hover:bg-primary-900/30 dark:hover:text-blue-300'
                }`}
              >
                <Icon
                  className={`h-5 w-5 mr-3 flex-shrink-0 transition-transform duration-300 ${
                    isActive ? 'text-white scale-110' : 'text-neutral-400 group-hover:text-blue-600 group-hover:scale-110'
                  }`}
                  aria-hidden="true"
                />
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
