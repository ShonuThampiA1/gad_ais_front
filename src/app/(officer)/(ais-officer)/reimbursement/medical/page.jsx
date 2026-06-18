'use client';

import Link from 'next/link';
import { ArrowLeftIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function MedicalReimbursementComingSoon() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/services/entitlement-claims"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Entitlement Claims
        </Link>

        <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 px-6 py-8 text-white sm:px-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
              <ClockIcon className="h-4 w-4" />
              Coming Soon
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight">Medical Reimbursement</h1>
            <p className="mt-2 max-w-2xl text-sm text-indigo-50 sm:text-base">
              This service is not open yet. It will be enabled in a later release.
            </p>
          </div>

          <div className="px-6 py-10 sm:px-10">
            <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-5 py-6 text-amber-900 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200">
              Medical Reimbursement is currently unavailable. Please use the other available services for now.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
