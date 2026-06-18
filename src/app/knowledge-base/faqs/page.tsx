'use client';

import React from 'react';
import Link from 'next/link';
import { DashboardLayout } from '../../components/layouts/dashboardlayout';
import { Breadcrumb } from '@/app/components/breadcrumb';
import {
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ClipboardDocumentCheckIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

type FaqItem = {
  id: string;
  category: string;
  question: string;
  answer: string;
};

type CategoryTheme = {
  shell: string;
  badge: string;
  accent: string;
  questionShell: string;
  answerShell: string;
};

const FAQS: FaqItem[] = [
  {
    id: 'spark-correction',
    category: 'SPARK And Sync',
    question: 'What should I do if I see wrong SPARK data, validation issues, or duplicate SPARK records in KARMASRI?',
    answer:
      'If the issue is coming from SPARK data, first correct the respective details in the SPARK portal. After the SPARK correction is completed, use the Refresh option in the KARMASRI dashboard so the updated values are reflected here.',
  },
  {
    id: 'spark-profile-purpose',
    category: 'SPARK And Sync',
    question: 'What is the difference between Spark Profile and Profile in ER Profile?',
    answer:
      'Spark Profile shows the data currently synced from SPARK. Profile is the editable KARMASRI profile where you complete missing details, save cards section by section, and finally submit for approval.',
  },
  {
    id: 'refresh-sync',
    category: 'SPARK And Sync',
    question: 'When should I use Refresh in the dashboard?',
    answer:
      'Use Refresh after any relevant correction has been completed in SPARK or when you need to pull the latest synced information into KARMASRI. Refresh helps reflect updated SPARK values in the portal.',
  },
  {
    id: 'progress-not-updating',
    category: 'Profile Completion',
    question: 'Why is my profile completion percentage not increasing even after I entered data?',
    answer:
      'Entering data alone is not enough. Each form or card must be saved successfully before it is counted in profile completion. Open the section, review any validation errors, save the card, and then check the progress again.',
  },
  {
    id: 'submit-flow',
    category: 'Profile Completion',
    question: 'How do I complete ER Profile submission?',
    answer:
      'First review SPARK data, then complete each ER Profile section and save every card. After all required sections are complete, open Profile Preview and submit using OTP and e-sign. The submitted profile then moves to AS-II for approval.',
  },
  {
    id: 'duplicate-warning',
    category: 'Profile Completion',
    question: 'I see a duplication warning in Service Details. What does it mean?',
    answer:
      'It means more than one saved service card exists for the same time period or overlapping record set that the system treats as duplicate. Review the highlighted service cards and remove or correct the extra duplicate entry before final submission.',
  },
  {
    id: 'save-disabled',
    category: 'Common Issues',
    question: 'Why is the Save button disabled in a modal or section?',
    answer:
      'Save is usually disabled because of pending validation errors, missing mandatory fields, invalid file uploads, or incomplete relation-specific data. Review the highlighted fields, error messages, and required documents, then try saving again.',
  },
  {
    id: 'parent-gender',
    category: 'Dependents',
    question: 'Why am I getting an error that gender must be saved for both parents before adding a child?',
    answer:
      'The system requires saved gender information for both parent records before a child can be mapped correctly. Update and save both parent records first, then reopen the child form and submit it again.',
  },
  {
    id: 'spouse-child-link',
    category: 'Dependents',
    question: "Why can't I directly remove a spouse who is linked to a child?",
    answer:
      'A spouse linked to one or more child records is being used in parent mapping. Update the child parent information first, then remove or change the spouse record so the child entries do not keep invalid parent references.',
  },
  {
    id: 'approval-status',
    category: 'Approval And Workflow',
    question: 'What happens after I submit my profile?',
    answer:
      'After OTP and e-sign submission, the profile moves to the approval workflow. Until it is approved, some downstream services may remain restricted. Once the profile is approved, the latest approved state becomes available for further portal actions.',
  },
  {
    id: 'medical-coming-soon',
    category: 'Services',
    question: 'Why is a service showing as Coming Soon even after profile approval?',
    answer:
      'Profile approval only unlocks services that are already active in the portal. If a service is marked Coming Soon, it is not currently open for use and will remain unavailable until that module is enabled.',
  },
  {
    id: 'manual-vs-faq',
    category: 'Guidance',
    question: 'When should I use the User Manual and when should I use the FAQ page?',
    answer:
      'Use the User Manual when you need a step-by-step flow for a full module. Use the FAQ page when you need a quick answer about a specific issue, warning, validation problem, or process clarification.',
  },
];

const CATEGORY_ORDER = [
  'SPARK And Sync',
  'Profile Completion',
  'Dependents',
  'Approval And Workflow',
  'Services',
  'Common Issues',
  'Guidance',
];

const CATEGORY_STYLES: Record<string, CategoryTheme> = {
  'SPARK And Sync': {
    shell: 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900',
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    accent: 'text-emerald-700 dark:text-emerald-300',
    questionShell: 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800',
    answerShell: 'bg-slate-50/80 dark:bg-slate-900/70',
  },
  'Profile Completion': {
    shell: 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900',
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    accent: 'text-indigo-700 dark:text-indigo-300',
    questionShell: 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800',
    answerShell: 'bg-slate-50/80 dark:bg-slate-900/70',
  },
  Dependents: {
    shell: 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900',
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    accent: 'text-sky-700 dark:text-sky-300',
    questionShell: 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800',
    answerShell: 'bg-slate-50/80 dark:bg-slate-900/70',
  },
  'Approval And Workflow': {
    shell: 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900',
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    accent: 'text-violet-700 dark:text-violet-300',
    questionShell: 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800',
    answerShell: 'bg-slate-50/80 dark:bg-slate-900/70',
  },
  Services: {
    shell: 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900',
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    accent: 'text-amber-700 dark:text-amber-300',
    questionShell: 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800',
    answerShell: 'bg-slate-50/80 dark:bg-slate-900/70',
  },
  'Common Issues': {
    shell: 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900',
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    accent: 'text-rose-700 dark:text-rose-300',
    questionShell: 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800',
    answerShell: 'bg-slate-50/80 dark:bg-slate-900/70',
  },
  Guidance: {
    shell: 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900',
    badge: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    accent: 'text-slate-700 dark:text-slate-300',
    questionShell: 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800',
    answerShell: 'bg-slate-50/80 dark:bg-slate-900/70',
  },
};

export default function FaqPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [openItems, setOpenItems] = React.useState<Set<string>>(new Set(['spark-correction', 'progress-not-updating']));

  const filteredFaqs = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return FAQS;
    return FAQS.filter((item) =>
      item.question.toLowerCase().includes(term) ||
      item.answer.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  const groupedFaqs = React.useMemo(() => {
    return CATEGORY_ORDER
      .map((category) => ({
        category,
        items: filteredFaqs.filter((item) => item.category === category),
      }))
      .filter((group) => group.items.length > 0);
  }, [filteredFaqs]);

  const toggleFaq = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <DashboardLayout>
      <Breadcrumb />

      <div className="mt-4 min-h-[calc(100vh-12rem)] rounded-md bg-white px-4 py-6 dark:bg-gray-800/50 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-gray-900 dark:to-slate-950">
            <div className="grid gap-6 px-6 py-8 lg:grid-cols-[1.5fr_0.9fr] lg:px-8">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  <QuestionMarkCircleIcon className="h-4 w-4" />
                  Help Center
                </div>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Frequently Asked Questions
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                  Quick answers for common KARMASRI issues, including SPARK sync, profile completion, duplicate records,
                  approvals, dependents, and service access.
                </p>
              </div>

              <div className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Useful shortcuts</p>
                <div className="mt-4 space-y-3">
                  <Link href="/knowledge-base/user-manual" className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:text-slate-200 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30">
                    <ClipboardDocumentCheckIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
                    Open User Manual
                  </Link>
                  <Link href="/knowledge-base" className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 dark:border-slate-700 dark:text-slate-200 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30">
                    <SparklesIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                    Back to Knowledge Base
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/80 px-5 py-5 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/20">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm dark:bg-amber-900/40 dark:text-amber-300">
                <ExclamationTriangleIcon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
                  Important Notice
                </p>
                <h2 className="mt-1 text-lg font-semibold text-amber-900 dark:text-amber-100">
                  SPARK Data Correction Notice
                </h2>
                <p className="mt-2 text-sm leading-6 text-amber-900/90 dark:text-amber-100/90">
                  If you notice any errors, validation issues, or duplicate records in the SPARK data displayed in KARMASRI,
                  kindly update the respective details in the SPARK portal first. Once the correction is completed, use the
                  Refresh option in the KARMASRI dashboard to reflect the updated changes in the portal.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[0.82fr_2fr]">
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">Search FAQs</label>
                <div className="relative mt-3">
                  <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search issue, section, or keyword..."
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Topics covered</p>
                <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  {CATEGORY_ORDER.map((category) => (
                    <li key={category} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
                      <span className="flex items-center gap-2">
                        <ArrowPathIcon className={`h-4 w-4 ${CATEGORY_STYLES[category].accent}`} />
                        <span>{category}</span>
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${CATEGORY_STYLES[category].badge}`}>
                        {FAQS.filter((item) => item.category === category).length}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-5">
              {groupedFaqs.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                  No FAQ entries matched "{searchTerm}".
                </div>
              ) : (
                groupedFaqs.map((group) => {
                  const theme = CATEGORY_STYLES[group.category] ?? CATEGORY_STYLES.Guidance;
                  return (
                    <section key={group.category} className={`rounded-3xl border p-5 shadow-sm ${theme.shell}`}>
                      <div className="flex items-center justify-between gap-3 border-b border-white/70 pb-4 dark:border-slate-800">
                        <div>
                          <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${theme.accent}`}>Category</p>
                          <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{group.category}</h2>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${theme.badge}`}>
                          {group.items.length} item{group.items.length > 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="mt-4 space-y-3">
                        {group.items.map((item) => {
                          const isOpen = openItems.has(item.id);
                          return (
                            <div key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm dark:border-slate-700/80">
                              <button
                                type="button"
                                onClick={() => toggleFaq(item.id)}
                                className={`flex w-full items-start justify-between gap-4 px-4 py-4 text-left transition ${theme.questionShell}`}
                              >
                                <div className="flex min-w-0 items-start gap-3">
                                  <span className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${theme.badge}`}>
                                    Q
                                  </span>
                                  <p className="text-sm font-semibold leading-6 text-slate-900 dark:text-slate-100">
                                    {item.question}
                                  </p>
                                </div>
                                <ChevronDownIcon
                                  className={`mt-0.5 h-5 w-5 shrink-0 ${theme.accent} transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                />
                              </button>

                              {isOpen && (
                                <div className={`border-t border-white/80 px-4 py-4 dark:border-slate-700 ${theme.answerShell}`}>
                                  <div className="flex items-start gap-3">
                                    <span className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${theme.badge}`}>
                                      A
                                    </span>
                                    <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">
                                      {item.answer}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
