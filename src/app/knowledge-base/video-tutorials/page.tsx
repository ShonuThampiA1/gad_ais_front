'use client';

import React from 'react';
import { DashboardLayout } from '../../components/layouts/dashboardlayout';
import { Breadcrumb } from '@/app/components/breadcrumb';
import Link from 'next/link';

import {
  PlayCircleIcon,
  LinkIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';

export default function VideoManualPage() {
  return (
    <DashboardLayout>
      <Breadcrumb />

      <div className="bg-white rounded-md px-4 py-6 sm:px-6 lg:px-8 dark:bg-gray-800/50 mt-4">

        {/* Header */}
        <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
          <h1 className="text-3xl font-bold text-primary-500 mb-2">
            Video User Manual
          </h1>

          <p className="text-gray-600 dark:text-gray-300">
            Learn the portal workflow through guided video tutorials.
          </p>
        </div>

        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* LEFT SIDE - VIDEO CARD */}
          {/* Same width as your profile card section (2/3 width) */}
          <div className="lg:w-2/3">

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">

              {/* Card Header */}
              <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                <div className="p-3 rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
                  <PlayCircleIcon className="w-6 h-6 text-primary-500" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Profile Completion Guide
                  </h2>

                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Step-by-step walkthrough for completing the ER Profile.
                  </p>
                </div>
              </div>

              {/* Video Section */}
              <div className="p-6">

                <div className="relative w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 aspect-video bg-black">

                  {/* Replace this iframe/video URL with your actual video */}
                  <video
                    className="w-full h-full object-contain"
                    controls
                    preload="metadata"
                  >
                    <source
                      src="/images/knowledge_base/video_turorials/KARMASRI-ER-Training11MAY2026.mp4"
                      type="video/mp4"
                    />
                    Your browser does not support the video tag.
                  </video>

                </div>

                {/* Optional Description */}
                <div className="mt-5">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    About this Tutorial
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    This tutorial explains how to complete your profile,
                    navigate sections, upload documents, and submit the
                    profile for verification.
                  </p>
                </div>

                <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 p-4">
                  <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">
                    Disclaimer
                  </h3>

                  <p className="text-sm text-amber-700 dark:text-amber-200 leading-relaxed">
                    This video is a recorded training session conducted for AIS Officers as part of the
                    KARMASRI ER Profile training and onboarding process. The content is intended solely
                    for learning, guidance, and reference purposes within the official portal workflow.
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* RIGHT SIDE - RELATED RESOURCES */}
          <div className="lg:w-1/3">

            <div className="sticky top-6 space-y-6">

              {/* Related Resources Card */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6">

                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
                  Related Resources
                </h3>

                <ul className="space-y-4">

                  <li>
                    <Link
                      href="/knowledge-base"
                      className="flex items-center gap-2 text-sm text-primary-500 hover:underline"
                    >
                      <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                      Back to Knowledge Base
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="#"
                      className="flex items-center gap-2 text-sm text-primary-500 hover:underline"
                    >
                      <LinkIcon className="w-4 h-4" />
                      View FAQs
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="#"
                      className="flex items-center gap-2 text-sm text-primary-500 hover:underline"
                    >
                      <LinkIcon className="w-4 h-4" />
                      Download User Guide PDF
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="#"
                      className="flex items-center gap-2 text-sm text-primary-500 hover:underline"
                    >
                      <LinkIcon className="w-4 h-4" />
                      Contact Support
                    </Link>
                  </li>

                </ul>
              </div>

            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}