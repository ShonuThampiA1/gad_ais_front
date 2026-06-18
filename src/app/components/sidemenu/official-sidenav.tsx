'use client';
import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { UserPlusIcon } from '@heroicons/react/24/outline';

type NavigationItem = {
  name: string;
  href: string;
  icon: React.ElementType;
};

const OnboardingSideNav = () => {
  const pathname = usePathname();
  const normalizedPathname = pathname?.replace(/\/$/, '') || '/';

  const navItems = useMemo((): NavigationItem[] => [
    { name: 'Dashboard', href: '/official/dashboard', icon: UserPlusIcon },
    { name: 'AIS Officer Onboarding', href: '/official', icon: UserPlusIcon },
  ], []);

  const isActive = (href: string) => {
    if (href === '/official/dashboard') {
      return normalizedPathname === '/official/dashboard' || normalizedPathname.startsWith('/official/dashboard/');
    }

    if (href === '/official') {
      return (
        normalizedPathname === '/official' ||
        (
          normalizedPathname.startsWith('/official/') &&
          !normalizedPathname.startsWith('/official/dashboard')
        )
      );
    }

    return normalizedPathname === href || normalizedPathname.startsWith(`${href}/`);
  };

  const handleNavigationClick = (name: string) => {
    sessionStorage.setItem('onboarding_active_nav', name);
  };

  const classNames = (...classes: (string | undefined | null | false)[]): string => {
    return classes.filter(Boolean).join(' ');
  };

  return (
    <nav className="w-full mt-3">
      <ul role="list" className="flex flex-col items-center space-y-1">
        {navItems.map((item) => {
          const current = isActive(item.href);

          return (
            <li key={item.name} className="w-full">
              <Link
                href={item.href}
                className={classNames(
                  current
                    ? 'bg-primary-500 text-white'
                    : 'text-neutral-500 border hover:bg-primary-700 hover:text-white dark:bg-neutral-800 bg-white',
                  'group flex flex-col items-center gap-y-1 rounded-md p-3 text-sm font-regular text-center dark:border-neutral-800'
                )}
                onClick={() => handleNavigationClick(item.name)}
              >
                <item.icon
                  aria-hidden="true"
                  className={classNames(
                    current ? 'text-white' : 'text-neutral-400 group-hover:text-white',
                    'size-10 shrink-0'
                  )}
                />
                <span className="text-xs">{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default OnboardingSideNav;
