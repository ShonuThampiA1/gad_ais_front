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

type NavigationItem = {
  name: string;
  href: string;
  icon: React.ElementType;
};

const navItems: NavigationItem[] = [
  { name: 'Dashboard', href: '/rbac', icon: ChartBarIcon },
  { name: 'Menus Management', href: '/rbac/menus-management', icon: ListBulletIcon },
  { name: 'Pages Management', href: '/rbac/pages-management', icon: DocumentIcon },
  { name: 'Actions Management', href: '/rbac/actions-management', icon: WrenchScrewdriverIcon },
  { name: 'Resources Management', href: '/rbac/resources-management', icon: CubeIcon },
  { name: 'Role Menu Mapping', href: '/rbac/role-menu-mapping', icon: UserIcon },
  { name: 'Role Page Permissions', href: '/rbac/role-page-permissions', icon: KeyIcon },
  { name: 'User Menu Override', href: '/rbac/user-menu-override', icon: ShieldCheckIcon },
  { name: 'User Page Permission Override', href: '/rbac/user-page-permission-override', icon: KeyIcon },
];

export default function RBACSidenav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col p-4 space-y-2 h-full">
      <div className="flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-400 shadow-sm'
                  : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5 mr-3 flex-shrink-0" aria-hidden="true" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
