'use client';

import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '../components/layouts/dashboardlayout';
import {
  MagnifyingGlassIcon,
  PlayCircleIcon,
  UserIcon,
  GlobeAmericasIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  PresentationChartBarIcon,
  TrophyIcon,
  HandRaisedIcon,
  NoSymbolIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
  HomeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { Breadcrumb } from '@/app/components/breadcrumb';

// Types
type Flow = {
  id: string;
  title: string;
  description: string;
  steps: string[];
  videoPlaceholder?: string;
  icon?: React.ElementType;
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
    id: 'my-profile',
    title: 'My Profile',
    overview: 'Complete details of your ER Profile including personal, educational, service, and other details.',
    flows: [
      {
        id: 'flow-profile-1',
        title: 'Officer Details',
        icon: UserIcon,
        description: 'Details regarding your primary identification and contact information.',
        steps: [
          'Navigate to the "Officer Details" section in your ER Profile.',
          'Review the information synced from SPARK.',
          'Fill in any missing or required fields such as mobile number or emergency contact.',
          'Click the "Save" button to securely store your officer details.'
        ],
        videoPlaceholder: 'How to update Officer Details'
      },
      {
        id: 'flow-profile-2',
        title: 'Personal Information',
        icon: UserIcon,
        description: 'Update personal attributes and demographic data.',
        steps: [
          'Navigate to the "Personal Information" section.',
          'Enter details like Date of Birth, Gender, Religion, Category, etc.',
          'Upload any necessary supporting documents if prompted.',
          'Save the card to update your profile.'
        ],
        videoPlaceholder: 'Managing Personal Information'
      },
      {
        id: 'flow-profile-3',
        title: 'Address Information',
        icon: HomeIcon,
        description: 'Manage your permanent and present address details.',
        steps: [
          'Select the "Address Information" section.',
          'Provide your Permanent Address details including State, District, and Pincode.',
          'If your Present Address is the same, check the "Same as Permanent Address" box.',
          'Otherwise, provide the Present Address details separately and save.'
        ],
        videoPlaceholder: 'Updating Address Details'
      },
      {
        id: 'flow-profile-4',
        title: 'Dependent Details',
        icon: UserIcon,
        description: 'Add or modify information about your dependents.',
        steps: [
          'Go to "Dependent Details" in the accordion menu.',
          'Click "Add Dependent" to enter details for a family member.',
          'Select the relationship type and provide their name and date of birth.',
          'Save each dependent entry individually.'
        ],
        videoPlaceholder: 'How to add Dependent Details'
      },
      {
        id: 'flow-profile-5',
        title: 'Educational Qualifications',
        icon: AcademicCapIcon,
        description: 'Add your academic degrees and certifications.',
        steps: [
          'Expand the "Educational Qualifications" section.',
          'Click to add a new qualification.',
          'Enter details like Degree, Subject, University/Board, and Year of Passing.',
          'Ensure the details match your official records and save.'
        ],
        videoPlaceholder: 'Adding Educational Qualifications'
      },
      {
        id: 'flow-profile-6',
        title: 'Service Details',
        icon: BriefcaseIcon,
        description: 'Record your service history and current posting information.',
        steps: [
          'Open "Service Details".',
          'Review your date of joining, current designation, and office.',
          'Update your posting history chronologically.',
          'Save the service record updates.'
        ],
        videoPlaceholder: 'Managing Service Details'
      },
      {
        id: 'flow-profile-7',
        title: 'Deputation Details',
        icon: GlobeAmericasIcon,
        description: 'Record periods of deputation to other departments or governments.',
        steps: [
          'Navigate to "Deputation Details".',
          'Add a new deputation record if applicable.',
          'Fill in the organization name, start date, end date, and role.',
          'Save the deputation entry.'
        ],
        videoPlaceholder: 'Adding Deputation Records'
      },
      {
        id: 'flow-profile-8',
        title: 'Training Details',
        icon: PresentationChartBarIcon,
        description: 'Log any official training programs attended.',
        steps: [
          'Select "Training Details" from the menu.',
          'Add a new training entry.',
          'Provide the training topic, institution, and duration.',
          'Save to update your training history.'
        ],
        videoPlaceholder: 'Logging Training Details'
      },
      {
        id: 'flow-profile-9',
        title: 'Awards and Publications',
        icon: TrophyIcon,
        description: 'Document your professional achievements and publications.',
        steps: [
          'Expand the "Awards and Publications" section.',
          'Choose whether to add an Award or a Publication.',
          'Enter the title, year, and issuing authority or publisher.',
          'Save the entry.'
        ],
        videoPlaceholder: 'Recording Awards and Publications'
      },
      {
        id: 'flow-profile-10',
        title: 'Disability Details',
        icon: HandRaisedIcon,
        description: 'Record any relevant disability information.',
        steps: [
          'Open "Disability Details".',
          'Indicate if you have a disability.',
          'If yes, provide the type and percentage of disability as per the medical certificate.',
          'Upload the supporting certificate and save.'
        ],
        videoPlaceholder: 'Updating Disability Details'
      },
      {
        id: 'flow-profile-11',
        title: 'Disciplinary Details',
        icon: NoSymbolIcon,
        description: 'Record any disciplinary actions or proceedings.',
        steps: [
          'Navigate to "Disciplinary Details".',
          'Add details of any pending or completed disciplinary actions if applicable.',
          'Provide the date, authority, and nature of the action.',
          'Save the disciplinary record.'
        ],
        videoPlaceholder: 'Managing Disciplinary Details'
      },
      {
        id: 'flow-profile-12',
        title: 'How to complete Profile',
        icon: QuestionMarkCircleIcon,
        description: 'General guide on successfully completing the ER Profile.',
        steps: [
          'Use the Spark Profile preview to check synced data first.',
          'Go through each section sequentially, starting from Officer Details.',
          'Ensure every required field is filled and saved individually.',
          'Once all sections are complete, you can preview and submit the final profile for verification.'
        ],
        videoPlaceholder: 'General Guide: Completing the Profile'
      },
      {
        id: 'flow-profile-13',
        title: 'Guided Mode',
        icon: SparklesIcon,
        description: 'Learn how to use Guided Mode for step-by-step assistance.',
        steps: [
          'Click the "Start Guided Mode" button at the top of the ER Profile.',
          'A Guidance Coach panel will appear to assist you.',
          'Click "Open Next Pending" to automatically navigate to the next incomplete section.',
          'Follow the coach prompts to finish filling out the mandatory fields.'
        ],
        videoPlaceholder: 'Using Guided Mode'
      }
    ]
  },
  {
    id: 'dashboard',
    title: 'Dashboard & Navigation',
    overview: 'Learn how to navigate the portal and understand your dashboard.',
    flows: [
      {
        id: 'flow-dashboard-1',
        title: 'Navigating the Sidebar',
        icon: HomeIcon,
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
        id: 'flow-dashboard-2',
        title: 'Viewing Officer Details',
        icon: UserIcon,
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
        id: 'flow-services-1',
        title: 'Submitting a Request',
        icon: DocumentTextIcon,
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
  }
];

export default function KnowledgeBasePage() {
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
      <Breadcrumb />
      <div className="bg-white rounded-md px-1 py-3 dark:bg-gray-800/50 mt-4">

        {/* Header & Search */}
        <div className="mb-6 p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Knowledge Base</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Welcome to the AIS e-Service Portal documentation. Find guides and step-by-step instructions below.
          </p>

          <div className="relative max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
              placeholder="Search by module, topic, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 relative z-0">

          {/* Sidebar Navigation */}
          <div className="lg:col-span-3 relative z-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden sticky top-4">
               <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
                 <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Modules</h2>
               </div>
              <nav className="p-2 space-y-1">
                {filteredData.length === 0 ? (
                    <p className="text-xs text-gray-500 px-3 py-2">No modules found.</p>
                ) : (
                    filteredData.map((module) => (
                    <button
                        key={module.id}
                        onClick={() => setActiveModuleId(module.id)}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeModuleId === module.id
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                        {module.title}
                        {searchTerm && (
                             <span className="ml-auto bg-gray-100 dark:bg-gray-600 text-xs py-0.5 px-2 rounded-full">
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
          <div className="lg:col-span-9 relative z-0">
            {filteredData.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700 shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No results found for "{searchTerm}". Please try a different search term.</p>
                </div>
            ) : activeModule ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 sm:p-6">
                <div className="mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{activeModule.title}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{activeModule.overview}</p>
                </div>

                <div className="space-y-8">
                  {activeModule.flows.map((flow, index) => (
                    <div key={flow.id} className="scroll-mt-8 pb-8 border-b border-gray-50 dark:border-gray-800 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 font-bold text-xs shrink-0">
                          {index + 1}
                        </span>
                        {flow.icon && (
                            <flow.icon className="h-6 w-6 text-primary-500 shrink-0" aria-hidden="true" strokeWidth={2} />
                        )}
                        <h3 className="text-lg font-semibold text-primary-500">{flow.title}</h3>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 ml-10">{flow.description}</p>

                      <div className="ml-10 mb-5">
                        <h4 className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Step-by-step</h4>
                        <ol className="list-decimal pl-4 space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
                          {flow.steps.map((step, stepIdx) => (
                            <li key={stepIdx} className="pl-1">
                                {step}
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Video Section Placeholder */}
                      <div className="ml-10 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800/50">
                        <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between">
                            <span className="font-medium text-gray-900 dark:text-white text-xs flex items-center gap-1.5">
                                <PlayCircleIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                Video Tutorial
                            </span>
                            {flow.videoPlaceholder && (
                                <span className="text-[10px] text-gray-500">{flow.videoPlaceholder}</span>
                            )}
                        </div>
                        <div className="aspect-video flex items-center justify-center p-4">
                            <div className="text-center">
                                <PlayCircleIcon className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Video Player Placeholder</p>
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