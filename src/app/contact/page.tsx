'use client';

import React from 'react';
import { DashboardLayout } from '../components/layouts/dashboardlayout';

export default function ContactPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-8 sm:p-12">
          <h1 className="text-3xl font-bold text-primary-500 mb-8 border-b border-gray-100 dark:border-gray-700 pb-4">
            Contact Us
          </h1>

          <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
            <p>
              For any queries, support, or feedback regarding the KARMASRI Portal, please reach out to us using the contact information below:
            </p>
            <div className="mt-6 bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg border border-gray-100 dark:border-gray-600">
               <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">General Administration (AIS) Department</h3>
               <p>Government Secretariat</p>
               <p>Thiruvananthapuram, Kerala - 695001</p>
               <div className="mt-4">
                 <p><strong>Email:</strong> support@karmasri.kerala.gov.in</p>
                 <p><strong>Phone:</strong> 0471-XXXXXXX</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}