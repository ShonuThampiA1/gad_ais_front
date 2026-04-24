'use client';

import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '../components/layouts/dashboardlayout';
import { MagnifyingGlassIcon, PlayCircleIcon } from '@heroicons/react/24/outline';

// Types
type Flow = {
  id: string;
  title: string;
  description: string;
  steps: string[];
  videoPlaceholder?: string;
};

type Module = {
  id: string;
  title: string;
  overview: string;
  flows: Flow[];
};

// Mock Data
const manualData: Module[] = [
  {
    id: 'dashboard',
    title: 'Dashboard & Navigation',
    overview: 'Learn how to navigate the portal and understand your dashboard.',
    flows: [
      {
        id: 'flow-1',
        title: 'Navigating the Sidebar',
        description: 'How to use the main sidebar to access different sections of the portal.',
        steps: [
          'Log in to the portal.',
          'Look at the left-side navigation menu or top secondary navbar.',
          'Click on an icon to navigate to that section (e.g., e-Services, My Profile).',
          'The active section will be highlighted.'
        ],
        videoPlaceholder: 'Navigation Overview Video'
      },
      {
        id: 'flow-2',
        title: 'Viewing Officer Details',
        description: 'How to view your quick profile summary on the dashboard.',
        steps: [
          'Navigate to the main Dashboard.',
          'Locate the "Officer Details" section in the secondary navbar.',
          'Here you can view your Full Name, Email, AIS Number, and Profile Completion status.'
        ]
      }
    ]
  },
  {
    id: 'e-services',
    title: 'e-Services',
    overview: 'Manage requests, claims, and applications through the e-Services module.',
    flows: [
      {
        id: 'flow-3',
        title: 'Submitting a Request',
        description: 'How to submit a new service request.',
        steps: [
          'Click on "e-Services" in the navigation.',
          'Select the type of request you want to submit.',
          'Fill in the required details in the form.',
          'Click the "Submit" button to finalize your request.'
        ],
        videoPlaceholder: 'Service Request Submission Video'
      }
    ]
  },
  {
    id: 'profile',
    title: 'My Profile',
    overview: 'Keep your personal and professional information up to date.',
    flows: [
      {
        id: 'flow-4',
        title: 'Updating Contact Information',
        description: 'How to update your email or phone number.',
        steps: [
          'Go to "My Profile".',
          'Click on "Edit" next to the Contact Information section.',
          'Update your details and save the changes.'
        ]
      }
    ]
  }
];

export default function UserManualPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeModuleId, setActiveModuleId] = useState<string>(manualData[0].id);

  // Filter modules and flows based on search
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return manualData;

    const lowerSearch = searchTerm.toLowerCase();

    return manualData.map(module => {
      // Check if module title or overview matches
      const moduleMatches = module.title.toLowerCase().includes(lowerSearch) ||
                            module.overview.toLowerCase().includes(lowerSearch);

      // Filter flows
      const matchingFlows = module.flows.filter(flow =>
        flow.title.toLowerCase().includes(lowerSearch) ||
        flow.description.toLowerCase().includes(lowerSearch) ||
        flow.steps.some(step => step.toLowerCase().includes(lowerSearch))
      );

      // If module matches, return all flows, otherwise return only matching flows
      if (moduleMatches) {
          return { ...module };
      }
      return { ...module, flows: matchingFlows };

    }).filter(module => module.flows.length > 0 ||
                         module.title.toLowerCase().includes(lowerSearch) ||
                         module.overview.toLowerCase().includes(lowerSearch));
  }, [searchTerm]);


  // Effect to automatically select the first matching module when search changes
  React.useEffect(() => {
    if (filteredData.length > 0) {
        // Only change active module if the current one is not in the filtered list
        if (!filteredData.find(m => m.id === activeModuleId)) {
            setActiveModuleId(filteredData[0].id);
        }
    }
  }, [filteredData, activeModuleId]);


  const activeModule = filteredData.find(m => m.id === activeModuleId);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header & Search */}
        <div className="mb-8 bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">User Manual</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Welcome to the AIS e-Service Portal documentation. Find guides and step-by-step instructions below.
          </p>

          <div className="relative max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-neutral-600 rounded-md leading-5 bg-white dark:bg-neutral-700 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
              placeholder="Search by module, topic, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-4 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 px-2">Modules</h2>
              <nav className="space-y-1">
                {filteredData.length === 0 ? (
                    <p className="text-sm text-gray-500 px-2">No modules found.</p>
                ) : (
                    filteredData.map((module) => (
                    <button
                        key={module.id}
                        onClick={() => setActiveModuleId(module.id)}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeModuleId === module.id
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700'
                        }`}
                    >
                        {module.title}
                        {searchTerm && (
                             <span className="ml-auto bg-gray-100 dark:bg-neutral-600 text-xs py-0.5 px-2 rounded-full">
                                 {module.flows.length}
                             </span>
                        )}
                    </button>
                    ))
                )}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:w-3/4">
            {filteredData.length === 0 ? (
                <div className="bg-white dark:bg-neutral-800 rounded-lg p-8 text-center border border-neutral-200 dark:border-neutral-700 shadow-sm">
                    <p className="text-gray-500 dark:text-gray-400">No results found for "{searchTerm}". Please try a different search term.</p>
                </div>
            ) : activeModule ? (
              <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-6 sm:p-8">
                <div className="mb-8 pb-6 border-b border-gray-200 dark:border-neutral-700">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{activeModule.title}</h2>
                  <p className="text-gray-600 dark:text-gray-300">{activeModule.overview}</p>
                </div>

                <div className="space-y-12">
                  {activeModule.flows.map((flow, index) => (
                    <div key={flow.id} className="scroll-mt-8">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 font-bold text-sm shrink-0">
                          {index + 1}
                        </span>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{flow.title}</h3>
                      </div>

                      <p className="text-gray-600 dark:text-gray-300 mb-6 ml-11">{flow.description}</p>

                      <div className="ml-11 mb-6">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">Step-by-step</h4>
                        <ol className="list-decimal pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                          {flow.steps.map((step, stepIdx) => (
                            <li key={stepIdx} className="pl-1 leading-relaxed">
                                {/* Simple highlight for search term if needed, or just plain text */}
                                {step}
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Video Section Placeholder */}
                      <div className="ml-11 mt-6 border border-gray-200 dark:border-neutral-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-neutral-900">
                        <div className="p-4 border-b border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex items-center justify-between">
                            <span className="font-medium text-gray-900 dark:text-white text-sm flex items-center gap-2">
                                <PlayCircleIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                Video Tutorial
                            </span>
                            {flow.videoPlaceholder && (
                                <span className="text-xs text-gray-500">{flow.videoPlaceholder}</span>
                            )}
                        </div>
                        <div className="aspect-video flex items-center justify-center p-6">
                            <div className="text-center">
                                <PlayCircleIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-neutral-600 mb-3" />
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Video Player Placeholder</p>
                                <p className="text-xs text-gray-400 mt-1">Real video integration will replace this component.</p>
                            </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
