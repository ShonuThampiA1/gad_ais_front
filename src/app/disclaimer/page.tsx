'use client';

import React from 'react';
import { DashboardLayout } from '../components/layouts/dashboardlayout';

export default function DisclaimerPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-8 sm:p-12">
          <h1 className="text-3xl font-bold text-primary-500 mb-8 border-b border-gray-100 dark:border-gray-700 pb-4">
            Disclaimer
          </h1>

          <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
            <p>
              The KARMASRI Portal is a service-oriented digital initiative of the General Administration(AIS) Department (GAD), Government of Kerala, designed and developed by Centre for Digital Innovation and Product Development (CDIPD), Digital University Kerala.
            </p>
            <p>
              This portal has been developed as a centralized digital platform for Kerala Cadre All India Services (AIS) Officers, including officers of the Indian Administrative Service (IAS), Indian Police Service (IPS), and Indian Forest Service (IFS), with the objective of enabling efficient Resource Management and Service-Related Administration.
            </p>
            <p>
              The KARMASRI Portal facilitates streamlined access to officer-related information, administrative services, resource management functions, and other official workflows under the General Administration(AIS) Department (GAD), Government of Kerala.
            </p>
            <p>
              The General Administration (AIS) Department (GAD), Government of Kerala, manages and maintains the content and services of the KARMASRI Portal. We welcome suggestions for improving the portal and request users to kindly report any discrepancies or errors noticed during usage.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}