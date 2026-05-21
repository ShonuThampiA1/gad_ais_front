'use client';

import React from 'react';
import { DashboardLayout } from '../components/layouts/dashboardlayout';

export default function CookiePolicyPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-8 sm:p-12">
          <h1 className="text-3xl font-bold text-primary-500 mb-8 border-b border-gray-100 dark:border-gray-700 pb-4">
            Cookie Policy
          </h1>

          <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
            <p>
              The KARMASRI Portal uses cookies to enhance your browsing experience, maintain session security, and analyze portal traffic. By using our portal, you consent to the use of these cookies in accordance with this policy.
            </p>
            <p>
              <strong>What are Cookies?</strong><br />
              Cookies are small text files placed on your device by websites you visit. They are widely used to make websites work more efficiently and to provide information to the owners of the site.
            </p>
            <p>
              <strong>How We Use Cookies:</strong><br />
              We primarily use strictly necessary cookies to ensure the core functionalities of the portal, such as user authentication and secure session management. We may also use analytical cookies to understand how users interact with the portal, which helps us improve its design and functionality.
            </p>
            <p>
              <strong>Managing Cookies:</strong><br />
              Most web browsers allow you to control cookies through their settings. You can choose to block or delete cookies; however, please note that disabling cookies may affect the functionality and your ability to use certain features of the KARMASRI Portal.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}