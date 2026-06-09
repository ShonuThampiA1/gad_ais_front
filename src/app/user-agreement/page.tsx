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

export default function UserAgreementPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Get data as unknown, then cast it so TypeScript doesn't complain about exact shape
  const data = policyData as unknown as Record<string, Policy>;
  const policy = data['user-agreement'];

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
        <div className="max-w-7xl mx-auto bg-white rounded-md px-4 py-8 sm:px-6 lg:px-8 dark:bg-gray-800/50 mt-4 shadow-sm border border-gray-100 dark:border-gray-800 min-h-[calc(100vh-12rem)]">

          {/* Header */}
          <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-6 flex items-center gap-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-primary-500">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{policy.title}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Home / Policies / {policy.title}
              </p>
            </div>
          </div>

          {/* 2/3 - 1/3 Layout */}
          <div className="flex flex-col lg:flex-row gap-8 relative z-0">

            {/* Left Section: Content (2/3 width) */}
            <div className="lg:w-2/3 relative z-0">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
                 <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: policy.content }} />
              </div>
            </div>

            {/* Right Section: Sticky Sidebar Panel (1/3 width) */}
            <div className="lg:w-1/3 relative z-0">
               <div className="sticky top-28 space-y-6">

                  {/* Document Info Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                     <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Document Details</h3>
                     <div className="space-y-3">
                       <div className="flex justify-between items-center text-sm">
                         <span className="text-gray-500 dark:text-gray-400">Version:</span>
                         <span className="font-medium text-gray-900 dark:text-white">{policy.version || '1.0.0'}</span>
                       </div>
                       <div className="flex justify-between items-center text-sm">
                         <span className="text-gray-500 dark:text-gray-400">Last Updated:</span>
                         <span className="font-medium text-gray-900 dark:text-white">{policy.lastUpdated || 'June 2024'}</span>
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
                       {/* USER_AGREEMENT */}
                       <li>
                         <Link
                           href="/user-agreement"
                           className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                             policy.id === 'user-agreement'
                               ? 'bg-indigo-50 text-primary-500 dark:bg-indigo-900/30 font-medium'
                               : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                           }`}
                         >
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={`w-4 h-4 ${policy.id === 'user-agreement' ? 'text-primary-500' : 'text-gray-400'}`}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
                           User Agreement
                         </Link>
                       </li>
                       {/* PRIVACY_POLICY */}
                       <li>
                         <Link
                           href="/privacy-policy"
                           className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                             policy.id === 'privacy-policy'
                               ? 'bg-indigo-50 text-primary-500 dark:bg-indigo-900/30 font-medium'
                               : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                           }`}
                         >
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={`w-4 h-4 ${policy.id === 'privacy-policy' ? 'text-primary-500' : 'text-gray-400'}`}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                           Privacy Policy
                         </Link>
                       </li>
                       {/* COOKIE_POLICY */}
                       <li>
                         <Link
                           href="/cookie-policy"
                           className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                             policy.id === 'cookie-policy'
                               ? 'bg-indigo-50 text-primary-500 dark:bg-indigo-900/30 font-medium'
                               : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                           }`}
                         >
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={`w-4 h-4 ${policy.id === 'cookie-policy' ? 'text-primary-500' : 'text-gray-400'}`}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
                           Cookie Policy
                         </Link>
                       </li>
                       {/* DISCLAIMER */}
                       <li>
                         <Link
                           href="/disclaimer"
                           className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                             policy.id === 'disclaimer'
                               ? 'bg-indigo-50 text-primary-500 dark:bg-indigo-900/30 font-medium'
                               : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                           }`}
                         >
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={`w-4 h-4 ${policy.id === 'disclaimer' ? 'text-primary-500' : 'text-gray-400'}`}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z" /></svg>
                           Disclaimer
                         </Link>
                       </li>
                     </ul>
                  </div>

               </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
