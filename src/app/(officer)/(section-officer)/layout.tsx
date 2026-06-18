'use client';

import React from 'react';
import { Breadcrumb } from '@/app/components/breadcrumb';
import MasterSidenav from '@/app/components/sidemenu/master-sidenav';

export default function SectionOfficerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col -mx-4 sm:-mx-6 lg:-mx-8">
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 border-r border-neutral-200 bg-white dark:bg-neutral-800 hidden lg:block overflow-y-auto min-h-[calc(100vh-64px)]">
          <MasterSidenav />
        </div>
        <main className="flex-1 overflow-y-auto p-6 pt-0">
          <div className="mx-auto">
            <Breadcrumb />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
