'use client';

import React from 'react';
import Link from 'next/link';
import { DashboardLayout } from '../../components/layouts/dashboardlayout';
import { Breadcrumb } from '@/app/components/breadcrumb';
import {
  MagnifyingGlassIcon,
  DocumentTextIcon,
  ClockIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

type QuickGuide = {
  id: string;
  title: string;
  time: string;
  audience: string;
  summary: string;
  steps: string[];
  relatedLink: string;
  relatedLabel: string;
};

const GUIDES: QuickGuide[] = [
  {
    id: 'complete-er-profile',
    title: 'Complete ER Profile and submit it for approval',
    time: '5-10 min',
    audience: 'AIS Officer',
    summary: 'Use this when you need the shortest path from synced SPARK data to final OTP and e-sign submission.',
    steps: [
      'Open Spark Profile first and review synced data.',
      'Complete missing details in each ER Profile section and save every card.',
      'Resolve any duplicate or validation warnings before proceeding.',
      'Open Profile Preview and submit using OTP and e-sign.',
    ],
    relatedLink: '/knowledge-base/user-manual',
    relatedLabel: 'Open User Manual',
  },
  {
    id: 'fix-spark-issues',
    title: 'Handle SPARK data errors, mismatches, or duplicate records',
    time: '2-5 min',
    audience: 'AIS Officer',
    summary: 'Use this when KARMASRI is showing wrong SPARK values, validation issues, or duplicate synced records.',
    steps: [
      'Confirm whether the issue is coming from SPARK data and not from a KARMASRI edit.',
      'Get the data corrected in the SPARK portal first.',
      'Return to KARMASRI and use the Refresh option in the dashboard.',
      'Recheck the affected section after the sync is completed.',
    ],
    relatedLink: '/knowledge-base/faqs',
    relatedLabel: 'Open FAQs',
  },
  {
    id: 'save-disabled-guide',
    title: 'Fix a disabled Save button in a modal or section',
    time: '2-4 min',
    audience: 'AIS Officer',
    summary: 'Use this when the form looks filled but Save is still disabled or blocked by validation.',
    steps: [
      'Check for mandatory fields, relation-specific requirements, and document uploads.',
      'Review any red error messages or hidden stale validation from earlier selections.',
      'Correct invalid mobile, email, date, or document inputs.',
      'Save again after the errors are cleared.',
    ],
    relatedLink: '/knowledge-base/faqs',
    relatedLabel: 'View common issues',
  },
  {
    id: 'manage-dependent-records',
    title: 'Update spouse, child, and parent mapping correctly',
    time: '4-6 min',
    audience: 'AIS Officer',
    summary: 'Use this when you are editing dependents, changing spouse links, or updating child parent assignments.',
    steps: [
      'Save gender details for both parent records before adding or remapping a child.',
      'If a spouse is linked to a child, update the child parent details before removing that spouse.',
      'Review the selected spouse or parent carefully during child edit flows.',
      'Save the dependent card only after the parent mapping is correct.',
    ],
    relatedLink: '/knowledge-base/faqs',
    relatedLabel: 'Dependent help',
  },
  {
    id: 'check-service-duplicates',
    title: 'Resolve duplicate service period warnings',
    time: '3-5 min',
    audience: 'AIS Officer',
    summary: 'Use this when Service Details shows duplicate badges or warnings even when records appear saved.',
    steps: [
      'Open Service Details and identify the highlighted duplicate cards.',
      'Compare their period, designation, and department values.',
      'Remove or correct one of the saved duplicate entries.',
      'Verify that the warning disappears from both the section and sidebar indicator.',
    ],
    relatedLink: '/knowledge-base/faqs',
    relatedLabel: 'Service duplication FAQ',
  },
  {
    id: 'after-approval-guide',
    title: 'Understand what happens after profile approval',
    time: '2-3 min',
    audience: 'AIS Officer',
    summary: 'Use this when you want to know which portal actions depend on profile approval status.',
    steps: [
      'Submit ER Profile through OTP and e-sign.',
      'Wait for the profile to move through the approval workflow.',
      'Use approved profile data for downstream services that depend on approved status.',
      'Check service availability separately because some modules may still be Coming Soon.',
    ],
    relatedLink: '/knowledge-base/faqs',
    relatedLabel: 'Approval FAQ',
  },
];

export default function QuickGuidesPage() {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredGuides = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return GUIDES;
    return GUIDES.filter((guide) =>
      guide.title.toLowerCase().includes(term) ||
      guide.summary.toLowerCase().includes(term) ||
      guide.audience.toLowerCase().includes(term) ||
      guide.steps.some((step) => step.toLowerCase().includes(term))
    );
  }, [searchTerm]);

  return (
    <DashboardLayout>
      <Breadcrumb />

      <div className="mt-4 min-h-[calc(100vh-12rem)] rounded-md bg-white px-4 py-6 dark:bg-gray-800/50 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100 px-6 py-8 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-gray-900 dark:to-slate-950 lg:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  <DocumentTextIcon className="h-4 w-4" />
                  Quick Guides
                </div>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Short, task-based help for common KARMASRI actions
                </h1>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  These guides are designed for fast execution. Pick a task, follow the short steps, and use the related links when
                  you need deeper detail.
                </p>
              </div>

              <div className="w-full lg:max-w-sm">
                <div className="relative">
                  <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search quick guides..."
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {filteredGuides.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                No quick guides matched "{searchTerm}".
              </div>
            ) : (
              filteredGuides.map((guide) => (
                <article key={guide.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {guide.audience}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300">
                      <ClockIcon className="h-3.5 w-3.5" />
                      {guide.time}
                    </span>
                  </div>

                  <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">{guide.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{guide.summary}</p>

                  <ol className="mt-4 space-y-3">
                    {guide.steps.map((step, index) => (
                      <li key={index} className="flex items-start gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:bg-slate-800/70 dark:text-slate-300">
                        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-primary-500 shadow-sm dark:bg-slate-900">
                          {index + 1}
                        </span>
                        <span className="leading-6">{step}</span>
                      </li>
                    ))}
                  </ol>

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <div className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <CheckCircleIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                      Ready-to-follow steps
                    </div>
                    <Link href={guide.relatedLink} className="inline-flex items-center gap-2 text-sm font-medium text-primary-500 transition hover:text-primary-600">
                      {guide.relatedLabel}
                      <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
