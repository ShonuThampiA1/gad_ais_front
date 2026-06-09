'use client';

import React from 'react';
import Link from 'next/link';
import policyData from '../knowledge-base/policies/data.json';
import { Footer } from '../components/footer';
import { ThemeToggle } from '@/app/components/theme-toggle';
import Image from 'next/image';

// Define the Policy type
type Policy = {
  id: string;
  title: string;
  lastUpdated?: string;
  version?: string;
  status?: string;
  content: string;
};

export default function PrivacyPolicyPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Get data as unknown, then cast it so TypeScript doesn't complain about exact shape
  const data = policyData as unknown as Record<string, Policy>;
  const policy = data['privacy-policy'];

  if (!policy) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Policy Not Found</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">The requested document could not be found.</p>
          <Link href="/" className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">


      {/* ==================== NAVBAR ==================== */}
      <nav className="fixed top-0 w-full z-50 border-b border-indigo-200/40 dark:border-indigo-800/40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 overflow-hidden">
                <Image src="/Government_of_Kerala_Logo.png" alt="Government of Kerala" width={56} height={56} className="h-full w-full object-contain dark:invert-0" priority />
              </div>
              <div className="flex flex-col justify-center leading-tight">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Government of Kerala</div>
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400">General Administration (AIS) Department</div>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <Link href="/home" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400">Home</Link>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <Link href="/login" className="bg-gradient-to-r from-indigo-600 to-indigo-600 hover:from-indigo-700 hover:to-indigo-700 text-white px-5 lg:px-6 py-2.5 rounded-lg font-semibold text-sm tracking-wide transition-all shadow-sm border border-indigo-500/50 dark:border-indigo-600">Officer Login</Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-3 md:hidden">
              <ThemeToggle />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="mobile-menu-button text-slate-700 dark:text-slate-300 p-2"
              >
                {isMobileMenuOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
            <div
              className="mobile-menu md:hidden border-t border-indigo-200/40 dark:border-indigo-800/40 bg-white dark:bg-gray-900"
            >
              <div className="px-4 py-3 space-y-3">
                <Link
                  href="/home"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 py-2"
                >
                  Home
                </Link>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-center w-full bg-gradient-to-r from-indigo-600 to-indigo-600 hover:from-indigo-700 hover:to-indigo-700 text-white px-4 py-3 rounded-lg font-semibold text-sm tracking-wide transition-all shadow-sm border border-indigo-500/50 dark:border-indigo-600"
                >
                  Officer Login
                </Link>
              </div>
            </div>
        )}
      </nav>

      {/* Spacer for navbar */}
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-6 py-8 sm:p-10 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {policy.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>Last Updated: {policy.lastUpdated || 'June 2024'}</span>
              <span>•</span>
              <span>Version: {policy.version || '1.0.0'}</span>
            </div>
          </div>

          <div className="px-6 py-8 sm:p-10">
            <div
              className="prose prose-blue dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: policy.content }}
            />
          </div>
        </div>
      </div>
            </div>
      <Footer />
    </div>
  );
}
