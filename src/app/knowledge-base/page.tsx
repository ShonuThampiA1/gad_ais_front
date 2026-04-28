'use client';

import React from 'react';
import Link from 'next/link';
import { DashboardLayout } from '../components/layouts/dashboardlayout';
import { Breadcrumb } from '@/app/components/breadcrumb';
import {
  BookOpenIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export default function KnowledgeBaseLandingPage() {
  const [searchTerm, setSearchTerm] = React.useState('');

  const categories = [
    {
      id: 'user-manual',
      title: 'User Manual',
      description: 'Comprehensive, step-by-step guides for all modules and features within the portal.',
      icon: BookOpenIcon,
      href: '/knowledge-base/user-manual',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/30',
      iconColor: 'text-indigo-600 dark:text-indigo-400'
    },
    {
      id: 'faqs',
      title: 'FAQs',
      description: 'Find quick answers to the most commonly asked questions.',
      icon: QuestionMarkCircleIcon,
      href: '#',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      id: 'guides',
      title: 'Quick Guides',
      description: 'Short, task-oriented guides to help you complete specific actions efficiently.',
      icon: DocumentTextIcon,
      href: '#',
      bgColor: 'bg-amber-50 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400'
    },
    {
      id: 'video-tutorials',
      title: 'Video Tutorials',
      description: 'Watch visual walkthroughs of key features and complex processes.',
      icon: VideoCameraIcon,
      href: '#',
      bgColor: 'bg-rose-50 dark:bg-rose-900/30',
      iconColor: 'text-rose-600 dark:text-rose-400'
    },
    {
      id: 'tips-tricks',
      title: 'Tips & Tricks',
      description: 'Learn best practices and advanced tips to get the most out of the system.',
      icon: LightBulbIcon,
      href: '#',
      bgColor: 'bg-sky-50 dark:bg-sky-900/30',
      iconColor: 'text-sky-600 dark:text-sky-400'
    },
    {
      id: 'release-notes',
      title: 'Release Notes',
      description: 'Stay updated with the latest features, enhancements, and bug fixes.',
      icon: RocketLaunchIcon,
      href: '#',
      bgColor: 'bg-purple-50 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400'
    }
  ];

  return (
    <DashboardLayout>
      <Breadcrumb />

      <div className="bg-white rounded-md px-4 py-8 sm:px-6 lg:px-8 dark:bg-gray-800/50 mt-4 min-h-[calc(100vh-12rem)]">

        {/* Header Section */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-primary-500 mb-4">How can we help you today?</h1>
          <p className="text-base text-gray-600 dark:text-gray-300 mb-6">
            Browse through our knowledge base categories below to find documentation, guides, and answers to your questions.
          </p>

          <div className="relative max-w-xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-white shadow-sm"
              placeholder="Search for answers, guides, or manuals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto relative z-0">
          {categories.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.description.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
             <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400">
               No categories found matching "{searchTerm}".
             </div>
          ) : categories.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.description.toLowerCase().includes(searchTerm.toLowerCase())).map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="group block relative rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm transition-all hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 hover:-translate-y-1 z-0"
            >
              <div className={`inline-flex items-center justify-center rounded-lg ${category.bgColor} p-3 mb-5`}>
                <category.icon className={`h-6 w-6 ${category.iconColor}`} aria-hidden="true" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-500 transition-colors">
                {category.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {category.description}
              </p>

              <div className="mt-4 flex items-center text-sm font-medium text-primary-500 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                Explore {category.title}
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}