'use client';

import React from 'react';
import { DashboardLayout } from "@/app/components/layouts/dashboardlayout";
import RBACSidenav from "../../../components/rbac/RBACSidenav";
import { Breadcrumb } from "@/app/components/breadcrumb";

export default function RBACLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col">
        {/* Breadcrumb Section */}
          
        {/* Layout Structure */}
        <div className="flex flex-1 overflow-hidden">
          {/* Static Sidebar for RBAC */}
          <div className="w-64 border-r border-neutral-200 bg-white dark:bg-neutral-800 hidden lg:block overflow-y-auto">
            <RBACSidenav />
          </div>

          {/* Dynamic Page Content */}
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
