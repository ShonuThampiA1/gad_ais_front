import React from 'react';
import { DocumentTextIcon, CheckCircleIcon, XCircleIcon, ArrowPathIcon, ClockIcon } from '@heroicons/react/24/outline';

const stats = [
  { name: 'Total Applications', value: '1,240', icon: DocumentTextIcon, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { name: 'Approved', value: '850', icon: CheckCircleIcon, color: 'text-green-600', bgColor: 'bg-green-50' },
  { name: 'Rejected', value: '120', icon: XCircleIcon, color: 'text-red-600', bgColor: 'bg-red-50' },
  { name: 'Reverted', value: '85', icon: ArrowPathIcon, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  { name: 'Pending', value: '185', icon: ClockIcon, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
];

const MedicalReimbursementStats = () => {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((item) => (
        <div key={item.name} className="relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6 border border-gray-100 dark:border-gray-700">
          <dt>
            <div className={`absolute rounded-md p-3 ${item.bgColor} dark:bg-opacity-10`}>
              <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{item.name}</p>
          </dt>
          <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{item.value}</p>
          </dd>
        </div>
      ))}
    </div>
  );
};

export default MedicalReimbursementStats;
