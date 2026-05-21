'use client';

import React from 'react';
import { DashboardLayout } from '../components/layouts/dashboardlayout';

export default function UserAgreementPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-8 sm:p-12">
          <h1 className="text-3xl font-bold text-primary-500 mb-8 border-b border-gray-100 dark:border-gray-700 pb-4">
            User Agreement – KARMASRI Portal
          </h1>

          <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
            <p>
              Welcome to the KARMASRI Portal, an initiative of the General Administration(AIS) Department (GAD), Government of Kerala. By accessing or using this portal, you acknowledge and agree to abide by the following Terms and Conditions.
            </p>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">1. Eligibility</h2>
              <p>
                The KARMASRI Portal is intended for use by All India Services (AIS) Kerala Cadre officers, including officers belonging to the Indian Administrative Service (IAS), Indian Police Service (IPS), and Indian Forest Service (IFS).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">2. Registration and Account Security</h2>
              <p>To access specific services and functionalities of the KARMASRI Portal, users may be required to register and create an account. Users are responsible for:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
                <li>Safeguarding the confidentiality of their login credentials and account information;</li>
                <li>All actions and activities performed through their account;</li>
                <li>Ensuring that all information provided during registration and subsequent usage is accurate, complete, and up to date.</li>
              </ul>
              <p className="mt-3">
                The KARMASRI Portal reserves the right to suspend, restrict, or terminate any account found to contain false, inaccurate, misleading, or unauthorized information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">3. Authentication and Login Access</h2>
              <p>
                The KARMASRI Portal provides secure login and authentication mechanisms for authorized users. Users are responsible for maintaining the confidentiality of their login credentials and for all activities carried out through their accounts.
                <br /><br />
                By accessing the portal, users consent to the collection and use of basic authentication-related information required for identity verification, access management, and service delivery, in accordance with applicable policies and security standards.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">4. User Content and Acceptable Use</h2>
              <p>Users are solely responsible for any information, documents, records, or data uploaded, submitted, or shared through the KARMASRI Portal.</p>
              <p className="mt-2">By using the portal, users agree that:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
                <li>All information and documents submitted are genuine, accurate, and legally valid;</li>
                <li>They possess the necessary authorization, rights, and permissions for the submitted content;</li>
                <li>They shall not engage in any unlawful, fraudulent, abusive, defamatory, or malicious activities through the portal;</li>
                <li>They shall not attempt to interfere with, compromise, disrupt, or misuse the portal, its services, or associated systems.</li>
              </ul>
              <p className="mt-3">
                The Government of Kerala reserves the right to restrict access, suspend accounts, or remove any content found to violate these Terms and Conditions or applicable laws and regulations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">5. Data Privacy and Security</h2>
              <p>
                The KARMASRI Portal implements appropriate technical and administrative measures to safeguard user information from unauthorized access, misuse, disclosure, modification, or loss.
              </p>
              <p className="mt-2">However, users acknowledge and understand that:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
                <li>No electronic platform, network, or method of data transmission can be guaranteed to be completely secure;</li>
                <li>The portal may occasionally experience interruptions, delays, or technical issues beyond administrative control.</li>
              </ul>
              <p className="mt-3">
                The portal may also include links, integrations, or references to third-party websites or external services. The Government of Kerala shall not be held responsible for the privacy practices, security policies, or content of such external platforms or services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">6. Intellectual Property Rights</h2>
              <p>
                All content, software, logos, design components, documents, trademarks, and other intellectual property associated with the KARMASRI Portal are the property of, or are duly licensed to, the Government of Kerala.
                <br /><br />
                Users are granted a limited, non-exclusive, non-transferable, and revocable permission to access and use the portal solely for lawful and officially authorized purposes.
                <br /><br />
                Any unauthorized copying, reproduction, alteration, distribution, publication, or commercial use of the portal content or materials is strictly prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">7. Termination or Suspension of Access</h2>
              <p>The KARMASRI Portal administration reserves the right to suspend, restrict, or terminate user access, either temporarily or permanently, without prior notice, under circumstances including but not limited to:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
                <li>Violation of the Terms and Conditions of the portal;</li>
                <li>Submission of false, inaccurate, or fraudulent information;</li>
                <li>Misuse of portal services or activities posing security risks;</li>
                <li>Compliance with applicable legal, administrative, or regulatory requirements.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">8. Disclaimer of Warranties</h2>
              <p>The KARMASRI Portal and all related services are provided on an “as is” and “as available” basis, without any express or implied warranties of any kind.</p>
              <p className="mt-2">The Government of Kerala does not warrant or guarantee that:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
                <li>The portal will operate continuously, securely, or without interruptions or errors;</li>
                <li>Any defects, issues, or technical problems will be resolved immediately;</li>
                <li>The portal or its servers will remain completely free from viruses, malware, or other harmful components.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">9. Limitation of Liability</h2>
              <p>To the fullest extent permitted under applicable laws, the Government of Kerala, its departments, officials, employees, representatives, and associated entities shall not be held liable for any indirect, incidental, consequential, special, or punitive damages arising out of or in connection with:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
                <li>The use of, or inability to access or use, the KARMASRI Portal;</li>
                <li>Unauthorized access to, or alteration of, user information or data;</li>
                <li>Service disruptions, system downtime, or technical malfunctions;</li>
                <li>Dependence on or use of the information, content, or services provided through the portal.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">10. Modifications to the Agreement</h2>
              <p>
                The KARMASRI Portal administration reserves the right to revise, amend, or update this User Agreement at any time without prior notice.
                <br /><br />
                Any changes made to this Agreement shall take effect immediately upon being published on the KARMASRI Portal. Continued access to or use of the portal after such modifications shall be considered as acceptance of the updated Terms and Conditions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">11. Governing Law and Jurisdiction</h2>
              <p>
                This Agreement shall be governed by and interpreted in accordance with the laws applicable in the State of Kerala and the Republic of India.
                <br /><br />
                Any disputes arising in connection with this Agreement shall fall under the jurisdiction of the competent courts in Kerala.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">12. Contact Information</h2>
              <p>For any queries, support requests, or concerns regarding this User Agreement or the KARMASRI Portal, please contact:</p>
              <address className="not-italic mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <strong>General Administration Department:</strong><br />
                2nd Floor, North Block<br />
                Secretariat, Statue<br />
                Thiruvananthapuram<br /><br />

                <strong>Working Hours:</strong><br />
                Monday - Saturday* - 10am to 5pm<br />
                2nd Saturday - Closed<br />
                Sunday - Closed<br /><br />

                <strong>Mail Address:</strong><br />
                📧 secy.gad@kerala.gov.in
              </address>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}