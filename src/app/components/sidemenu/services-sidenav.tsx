'use client'
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  HomeIcon,
  UsersIcon,
  FolderIcon,
  CalendarIcon,
  DocumentDuplicateIcon,
  ChartPieIcon,
} from '@heroicons/react/24/outline';

type NavigationItem = {
  name: string;
  href: string;
  current: boolean;
  icon: React.ElementType;
};

const navItems: Omit<NavigationItem, 'current'>[] = [
    { name: 'Entitlement Claims', href: '/services/entitlement-claims', icon: HomeIcon },
    { name: 'Requests', href: '/services/requests', icon: UsersIcon },
    { name: 'Permissions', href: '/services/permissions', icon: FolderIcon },
    { name: 'Submissions', href: '/services/submissions', icon: CalendarIcon },
    // { name: 'Documents', href: '/documents', icon: DocumentDuplicateIcon },
    // { name: 'Reports', href: '#', icon: ChartPieIcon },
  ];

const ServicesSideNav = () => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Compute navigation dynamically based on the current pathname
  const navigation = navItems.map((item) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
    return {
      ...item,
      current: isActive,
    };
  });

  function classNames(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ');
  }

  // Prevent hydration mismatch
  if (!mounted) return null;

  return (
    <nav className="w-full mt-3">
      <ul role="list" className="flex flex-col items-center space-y-1">
        {navigation.map((item) => (
          <li key={item.name} className="w-full">
            <Link
              href={item.href}
              className={classNames(
                item.current
                  ? 'bg-primary-500 text-white'
                  : 'text-neutral-500 border hover:bg-primary-700 hover:text-white dark:bg-neutral-800 bg-white',
                'group flex flex-col items-center gap-y-1 rounded-md p-3 text-sm font-regular text-center dark:border-neutral-800'
              )}
            >
              <item.icon
                aria-hidden="true"
                className={classNames(
                  item.current ? 'text-white' : 'text-neutral-400 group-hover:text-white',
                  'size-10 shrink-0'
                )}
              />
              <span className="text-xs">{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default ServicesSideNav;
