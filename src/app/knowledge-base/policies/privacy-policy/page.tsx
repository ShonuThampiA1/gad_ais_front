'use client';

import React from 'react';
import { DashboardLayout } from '@/app/components/layouts/dashboardlayout';
import { Breadcrumb } from '@/app/components/breadcrumb';
import Link from 'next/link';
import {
  DocumentTextIcon,
  ShieldCheckIcon,
  ScaleIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import policyData from '../data.json';

const allPolicies = [
  { id: 'user-agreement', title: 'User Agreement', icon: DocumentTextIcon },
  { id: 'privacy-policy', title: 'Privacy Policy', icon: ShieldCheckIcon },
  { id: 'cookie-policy', title: 'Cookie Policy', icon: DocumentTextIcon },
  { id: 'disclaimer', title: 'Disclaimer', icon: ScaleIcon }
];

export default function PolicyPage() {
  const policyId = 'privacy-policy';
  const activePolicy = (policyData as any)[policyId];
  const currentPolicy = allPolicies.find(p => p.id === policyId) || allPolicies[0];
  const ActiveIcon = currentPolicy.icon as any;

  if (!activePolicy) return null;

  return (
    <DashboardLayout>
      <Breadcrumb />

      <div className="bg-white rounded-md px-4 py-8 sm:px-6 lg:px-8 dark:bg-gray-800/50 mt-4 min-h-[calc(100vh-12rem)]">

        {/* Header */}
        <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-6 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-primary-500">
             <ActiveIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{activePolicy.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Knowledge Base / Policies / {activePolicy.title}
            </p>
          </div>
        </div>

        {/* 2/3 - 1/3 Layout */}
        <div className="flex flex-col lg:flex-row gap-8 relative z-0">

          {/* Left Section: Content (2/3 width) */}
          <div className="lg:w-2/3 relative z-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
               <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: activePolicy.content }} />
            </div>
          </div>

          {/* Right Section: Sticky Sidebar Panel (1/3 width) */}
          <div className="lg:w-1/3 relative z-0">
             <div className="sticky top-6 space-y-6">

                {/* Document Info Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                   <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Document Details</h3>
                   <div className="space-y-3">
                     <div className="flex justify-between items-center text-sm">
                       <span className="text-gray-500 dark:text-gray-400">Version:</span>
                       <span className="font-medium text-gray-900 dark:text-white">1.0.0</span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                       <span className="text-gray-500 dark:text-gray-400">Last Updated:</span>
                       <span className="font-medium text-gray-900 dark:text-white">June 2024</span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                       <span className="text-gray-500 dark:text-gray-400">Status:</span>
                       <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-900/30 dark:text-green-400">Active</span>
                     </div>
                   </div>
                </div>

                {/* Quick Navigation / Other Policies */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                   <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Related Documents</h3>
                   <ul className="space-y-2">
                     {allPolicies.map(policy => {
                       const isCurrent = policy.id === policyId;
                       const Icon = policy.icon as any;
                       return (
                         <li key={policy.id}>
                           <Link
                             href={`/knowledge-base/policies/${policy.id}`}
                             className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                               isCurrent
                                 ? 'bg-indigo-50 text-primary-500 dark:bg-indigo-900/30 font-medium'
                                 : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                             }`}
                           >
                             <Icon className={`w-4 h-4 ${isCurrent ? 'text-primary-500' : 'text-gray-400'}`} />
                             {policy.title}
                           </Link>
                         </li>
                       );
                     })}
                   </ul>

                   <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <Link href="/knowledge-base" className="flex items-center gap-2 text-sm text-primary-500 hover:underline">
                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                        Back to Knowledge Base
                      </Link>
                   </div>
                </div>

             </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
