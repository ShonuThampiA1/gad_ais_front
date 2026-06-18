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
  ShieldCheckIcon,
  Cog6ToothIcon,
  ClipboardDocumentCheckIcon,
  ChevronDownIcon,
  ServerIcon,
  GlobeAltIcon,
  ShieldExclamationIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useRBACStore } from '@/lib/rbac/rbacStore';
import { useEffect, useState, useMemo } from 'react';

// Default nav items specifically for the RBAC module
const rbacNavItems = [
  { name: 'Dashboard', href: '/rbac/dashboard', icon: ChartBarIcon, menuId: 23 },
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

const dummySystemSettings = [
  { name: 'General Settings', href: '/rbac/system/general', icon: Cog6ToothIcon, menuId: 991 },
  { name: 'Server Configuration', href: '/rbac/system/server', icon: ServerIcon, menuId: 992 },
  { name: 'Localization', href: '/rbac/system/localization', icon: GlobeAltIcon, menuId: 993 },
  { name: 'Onboarding Requests', href: '/rbac/system/onboarding-requests', icon: ClipboardDocumentCheckIcon, menuId: 997 },
  { name: 'Credential Change Audit', href: '/rbac/system/contact-recovery-audit', icon: ShieldExclamationIcon, menuId: 998 },
];

const dummyAuditLogs = [
  { name: 'Login History', href: '/rbac/audit/login', icon: ClockIcon, menuId: 994 },
  { name: 'System Events', href: '/rbac/audit/events', icon: ClipboardDocumentCheckIcon, menuId: 995 },
  { name: 'Security Alerts', href: '/rbac/audit/security', icon: ShieldExclamationIcon, menuId: 996 },
];

export default function RBACSidenav({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [openModule, setOpenModule] = useState<string | null>(null);

  const roleMenuMappings = useRBACStore((state) => state.roleMenuMappings);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentRoleId = typeof window !== 'undefined' ? Number(sessionStorage.getItem('role_id')) || 7 : 7;

  // Memoize visible nav items to prevent unnecessary recalculations
  const groupedModules = useMemo(() => {
    const currentRoleMapping = roleMenuMappings.find(m => m.roleId === currentRoleId);
    const allowedMenuIds = new Set(currentRoleMapping?.menuIds || []);

    const visibleRbacItems = rbacNavItems.filter(item => allowedMenuIds.has(item.menuId));

    // For demo purposes, we'll always show the dummy items if the user has access to any RBAC items.
    // In a real scenario, you'd check their specific menuIds.
    const showDummy = visibleRbacItems.length > 0;

    return [
      {
        id: 'rbac',
        title: 'RBAC',
        icon: ShieldCheckIcon,
        items: visibleRbacItems,
      },
      {
        id: 'system',
        title: 'System Settings',
        icon: Cog6ToothIcon,
        items: showDummy ? dummySystemSettings : [],
      },
      {
        id: 'audit',
        title: 'Audit Logs',
        icon: ClipboardDocumentCheckIcon,
        items: showDummy ? dummyAuditLogs : [],
      }
    ].filter(module => module.items.length > 0);
  }, [roleMenuMappings, currentRoleId]);

  // Set initial open module based on pathname
  useEffect(() => {
    if (!mounted) return;

    if (pathname.startsWith('/rbac/superadmin-dashboard')) {
      setOpenModule(null);
      return;
    }

    let foundOpen = false;
    for (const module of groupedModules) {
      if (module.id === 'rbac') {
         // Special logic for dashboard
         const anyOtherActive = module.items.slice(1).some(item =>
           pathname === item.href || pathname === `${item.href}/` || pathname.startsWith(`${item.href}/`)
         );

         const isSuperAdminLanding = pathname.startsWith('/rbac/superadmin-dashboard');
         const isDashboardActive = pathname === '/rbac' ||
                         pathname === '/rbac/' ||
                         pathname.startsWith('/rbac/dashboard') ||
                         (!isSuperAdminLanding && pathname.startsWith('/rbac') && !anyOtherActive);

         if (isDashboardActive || anyOtherActive) {
             setOpenModule('rbac');
             foundOpen = true;
             break;
         }
      } else {
         const hasActiveItem = module.items.some(item =>
           pathname === item.href || pathname === `${item.href}/` || pathname.startsWith(`${item.href}/`)
         );
         if (hasActiveItem) {
           setOpenModule(module.id);
           foundOpen = true;
           break;
         }
      }
    }

    if (!foundOpen && groupedModules.length > 0 && openModule === null) {
        setOpenModule(groupedModules[0].id);
    }
  }, [pathname, groupedModules, mounted]);


  if (!mounted) return null; // Prevent hydration errors

  const toggleModule = (moduleId: string) => {
    setOpenModule(prev => prev === moduleId ? null : moduleId);
  };

  return (
    <nav className="p-4 space-y-2 h-full">
      {groupedModules.length > 0 ? (
        groupedModules.map(module => {
          const isModuleOpen = openModule === module.id;

          // Determine if any item in this module is active to highlight the module header slightly
          const hasActiveItem = module.items.some((item, index) => {
             if (module.id === 'rbac' && index === 0) {
                 const anyOtherActive = module.items.slice(1).some(i =>
                   pathname === i.href || pathname === `${i.href}/` || pathname.startsWith(`${i.href}/`)
                 );
                 const isSuperAdminLanding = pathname.startsWith('/rbac/superadmin-dashboard');
                 return pathname === '/rbac' ||
                        pathname === '/rbac/' ||
                        pathname.startsWith('/rbac/dashboard') ||
                        (!isSuperAdminLanding && pathname.startsWith('/rbac') && !anyOtherActive);
             }
             return pathname === item.href ||
                    pathname === `${item.href}/` ||
                    pathname.startsWith(`${item.href}/`);
          });

          return (
            <div key={module.id} className="space-y-1">
              <button
                onClick={() => toggleModule(module.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200 ${
                  hasActiveItem && !isModuleOpen
                    ? 'bg-blue-50 text-blue-700 dark:bg-primary-900/20 dark:text-blue-300'
                    : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                }`}
              >
                <div className="flex items-center">
                  <module.icon className={`h-5 w-5 mr-3 ${hasActiveItem && !isModuleOpen ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-500 dark:text-neutral-400'}`} />
                  {module.title}
                </div>
                <ChevronDownIcon
                  className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${isModuleOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isModuleOpen && (
                <div className="pl-4 pr-2 space-y-1 mt-1">
                  {module.items.map((item, index) => {
                    const Icon = item.icon;

                    let isActive = false;
                    if (module.id === 'rbac' && index === 0) {
                      const anyOtherActive = module.items.slice(1).some(i =>
                        pathname === i.href || pathname === `${i.href}/` || pathname.startsWith(`${i.href}/`)
                      );
                      const isSuperAdminLanding = pathname.startsWith('/rbac/superadmin-dashboard');
                      isActive = pathname === '/rbac' ||
                                 pathname === '/rbac/' ||
                                 pathname.startsWith('/rbac/dashboard') ||
                                 (!isSuperAdminLanding && pathname.startsWith('/rbac') && !anyOtherActive);
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
                  })}
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="text-sm text-neutral-500 text-center py-4">No menus assigned to your role.</div>
      )}
    </nav>
  );
}
