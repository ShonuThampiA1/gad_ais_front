'use client'
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  ChevronDownIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const navItems = [
  { name: 'Dashboard', href: '/ama/dashboard', icon: HomeIcon },
  { name: 'Sample Menu', href: '/ama/sample', icon: DocumentTextIcon },
];

export default function AMASidenav({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [openModule, setOpenModule] = useState<string | null>('ama');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <nav className="p-4 space-y-2 h-full">
      <div className="space-y-1">
        <button
          onClick={() => setOpenModule(prev => prev === 'ama' ? null : 'ama')}
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200 ${
            navItems.some(i => pathname === i.href || pathname.startsWith(i.href + "/")) && openModule !== 'ama'
              ? 'bg-blue-50 text-blue-700 dark:bg-primary-900/20 dark:text-blue-300'
              : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
          }`}
        >
          <div className="flex items-center">
            <HomeIcon className="h-5 w-5 mr-3 text-blue-600 dark:text-blue-400" />
            AMA
          </div>
          <ChevronDownIcon
            className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${openModule === 'ama' ? 'rotate-180' : ''}`}
          />
        </button>

        {openModule === 'ama' && (
          <div className="pl-4 pr-2 space-y-1 mt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

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
    </nav>
  );
}
