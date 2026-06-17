'use client';

import React from 'react';
import MedicalReimbursementStats from '@/app/components/SectionOfficerDashboardComponents/MedicalReimbursementStats';
import MedicalReimbursementChart from '@/app/components/SectionOfficerDashboardComponents/MedicalReimbursementChart';
import RecentApplicationsTable from '@/app/components/SectionOfficerDashboardComponents/RecentApplicationsTable';

const SectionDashboard = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Section Officer Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Overview of Medical Reimbursement Applications</p>
      </div>

      <div className="mb-8">
        <MedicalReimbursementStats />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <MedicalReimbursementChart />
        </div>
        <div className="lg:col-span-2">
          <RecentApplicationsTable />
        </div>
      </div>
    </div>
  );
};

export default SectionDashboard;
