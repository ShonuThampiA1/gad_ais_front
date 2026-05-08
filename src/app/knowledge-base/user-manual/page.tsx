'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { DashboardLayout } from '../../components/layouts/dashboardlayout';
import { Breadcrumb } from '@/app/components/breadcrumb';
import Link from 'next/link';
import Image from 'next/image';
import {
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
  DocumentTextIcon,
  ChevronDownIcon,
  PlayCircleIcon,
  LinkIcon,
  ArrowTopRightOnSquareIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

// Types
type Flow = {
  id: string;
  title: string;
  description: string;
  steps: string[];
  images?: string[];
  icon?: React.ElementType;
};

type ModuleSegment = {
  id: string;
  title: string;
  overview: string;
  icon: React.ElementType;
  flows: Flow[];
};

// Mock Data representing different segments by role
const roleManualData: Record<string, ModuleSegment[]> = {
  'AIS Officer': [
    {
      id: 'my-profile',
      title: 'My Profile',
      overview: 'Complete details of your ER Profile including personal, educational, service, and other details. This section acts as a central repository for your employee record.',
      icon: UserIcon,
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
        images: ['/images/knowledge_base/user_manual/Officer_details_new_one.png']
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
        images: [
          '/images/knowledge_base/user_manual/Personal_details.png',
          '/images/knowledge_base/user_manual/personal_edit.png'
        ]
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
        ]
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
        images: [
          '/images/knowledge_base/user_manual/dependent_details.png',
          '/images/knowledge_base/user_manual/dependent_save.png'
        ]
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
        images: [
          '/images/knowledge_base/user_manual/education_Qualification_list.png',
          '/images/knowledge_base/user_manual/education_save.png'
        ]
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
        images: [
          '/images/knowledge_base/user_manual/service_listing.png',
          '/images/knowledge_base/user_manual/service_add.png'
        ]
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
        images: [
          '/images/knowledge_base/user_manual/deputation_details.png',
          '/images/knowledge_base/user_manual/deputation_save.png'
        ]
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
        images: [
          '/images/knowledge_base/user_manual/Training_details.png',
          '/images/knowledge_base/user_manual/training_save.png'
        ]
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
        images: [
          '/images/knowledge_base/user_manual/awards_listing.png',
          '/images/knowledge_base/user_manual/awards_save.png'
        ]
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
        images: [
          '/images/knowledge_base/user_manual/disability_listing.png',
          '/images/knowledge_base/user_manual/disability_save.png'
        ]
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
        images: [
          '/images/knowledge_base/user_manual/disciplinary_listing.png'
        ]
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
        ]
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
        ]
      }
    ]
  },
  {
    id: 'dashboard',
    title: 'Dashboard & Navigation',
    overview: 'Learn how to navigate the portal and understand your primary dashboard views and widgets.',
    icon: HomeIcon,
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
        ]
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
    overview: 'Manage requests, claims, and applications through the centralized e-Services module.',
    icon: DocumentTextIcon,
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
        ]
      }
    ]
  }
  ],
  'Additional Secretary': [
    {
      id: 'profile-approvals',
      title: 'Profile Approvals',
      overview: 'Review and approve ER Profiles submitted by AIS Officers.',
      icon: DocumentTextIcon,
      flows: [
        {
          id: 'flow-as-1',
          title: 'Reviewing a Profile',
          icon: DocumentTextIcon,
          description: 'How to access and review a submitted profile.',
          steps: [
            'Navigate to the "Profiles Awaiting Verification" section.',
            'Select an officer\'s profile from the list.',
            'Review all sections and uploaded documents for accuracy.'
          ]
        },
        {
          id: 'flow-as-2',
          title: 'Approving or Rejecting',
          icon: SparklesIcon,
          description: 'Steps to finalize the profile verification process.',
          steps: [
            'After reviewing the profile, click the "Approve" button if all details are correct.',
            'If discrepancies are found, provide comments and click "Reject" to send it back to the officer.',
            'Confirm the action to update the profile status.'
          ]
        }
      ]
    },
    {
      id: 'officer-onboarding',
      title: 'AIS Officer Onboarding',
      overview: 'Manage the onboarding process for new AIS Officers.',
      icon: UserIcon,
      flows: [
        {
          id: 'flow-as-3',
          title: 'Initiating Onboarding',
          icon: UserIcon,
          description: 'How to start the onboarding workflow for a new officer.',
          steps: [
            'Navigate to the "AIS Officer Onboarding" module.',
            'Enter the basic details and AIS number of the new officer.',
            'Trigger the initial profile creation and invite the officer to complete their profile.'
          ]
        }
      ]
    }
  ],
  'Admin': [
    {
      id: 'system-management',
      title: 'System Management',
      overview: 'Manage core system settings and configurations.',
      icon: GlobeAmericasIcon,
      flows: [
        {
          id: 'flow-admin-1',
          title: 'Managing Master Data',
          icon: BriefcaseIcon,
          description: 'How to update master data tables.',
          steps: [
            'Navigate to the Master Controls section.',
            'Select the specific table to update (e.g., Designations, Departments).',
            'Add, edit, or remove entries as required.'
          ]
        }
      ]
    }
  ],
  'Super Admin': [
    {
      id: 'rbac-management',
      title: 'RBAC Management',
      overview: 'Control roles, permissions, and access across the portal.',
      icon: HandRaisedIcon,
      flows: [
        {
          id: 'flow-superadmin-1',
          title: 'Assigning Roles',
          icon: UserIcon,
          description: 'How to map users to their respective roles.',
          steps: [
            'Navigate to the RBAC module.',
            'Select "User Role Mapping".',
            'Assign the appropriate role to the selected user and save.'
          ]
        }
      ]
    }
  ]
};

export default function UserManualPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeRole, setActiveRole] = useState<string>('AIS Officer');
  const [activeSegmentId, setActiveSegmentId] = useState<string>(roleManualData['AIS Officer'][0].id);
  const [expandedFlows, setExpandedFlows] = useState<Set<string>>(new Set());

  const currentRoleSegments = roleManualData[activeRole] || [];

  // Reset active segment when role changes
  useEffect(() => {
    if (currentRoleSegments.length > 0) {
      setActiveSegmentId(currentRoleSegments[0].id);
    }
  }, [activeRole]);

  // Filter segments and flows based on search
  const filteredSegments = useMemo(() => {
    if (!searchTerm.trim()) return currentRoleSegments;

    const lowerSearch = searchTerm.toLowerCase();

    return currentRoleSegments.map(segment => {
      const segmentMatches = segment.title.toLowerCase().includes(lowerSearch) ||
                             segment.overview.toLowerCase().includes(lowerSearch);

      const matchingFlows = segment.flows.filter(flow =>
        flow.title.toLowerCase().includes(lowerSearch) ||
        flow.description.toLowerCase().includes(lowerSearch) ||
        flow.steps.some(step => step.toLowerCase().includes(lowerSearch))
      );

      if (segmentMatches) {
          return { ...segment };
      }
      return { ...segment, flows: matchingFlows };

    }).filter(segment => segment.flows.length > 0 ||
                         segment.title.toLowerCase().includes(lowerSearch) ||
                         segment.overview.toLowerCase().includes(lowerSearch));
  }, [searchTerm, currentRoleSegments]);

  // Effect to automatically select the first matching segment when search changes
  useEffect(() => {
    if (filteredSegments.length > 0) {
        if (!filteredSegments.find(s => s.id === activeSegmentId)) {
            setActiveSegmentId(filteredSegments[0].id);
        }
    }
  }, [filteredSegments, activeSegmentId]);

  // Automatically expand the first flow of the active segment when segment changes
  useEffect(() => {
    const activeSegment = filteredSegments.find(s => s.id === activeSegmentId);
    if (activeSegment && activeSegment.flows.length > 0) {
      setExpandedFlows(new Set([activeSegment.flows[0].id]));
    } else {
      setExpandedFlows(new Set());
    }
  }, [activeSegmentId, filteredSegments]);

  const toggleFlow = (flowId: string) => {
    setExpandedFlows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(flowId)) {
        newSet.delete(flowId);
      } else {
        newSet.add(flowId);
      }
      return newSet;
    });
  };

  const activeSegment = currentRoleSegments.find(s => s.id === activeSegmentId) || currentRoleSegments[0];

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
        // Expand it if not already expanded before scrolling
        setExpandedFlows(prev => new Set(prev).add(id));

        // Small delay to allow expansion rendering
        setTimeout(() => {
             element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
    }
  };

  return (
    <DashboardLayout>
      <Breadcrumb />

      <div className="bg-white rounded-md px-4 py-6 sm:px-6 lg:px-8 dark:bg-gray-800/50 mt-4 relative z-0">

        <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-primary-500 mb-2">User Manual</h1>
              <p className="text-gray-600 dark:text-gray-300">Detailed flow documentation for all portal modules.</p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-white shadow-sm"
                placeholder="Search manual..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Role Selection Tabs */}
          <div className="flex flex-wrap gap-2">
            {Object.keys(roleManualData).map(role => (
              <button
                key={role}
                onClick={() => setActiveRole(role)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeRole === role
                    ? 'bg-indigo-100 text-primary-500 dark:bg-indigo-900/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* 2/3 - 1/3 Layout */}
        <div className="flex flex-col lg:flex-row gap-8 relative z-0">

          {/* Left Section: Segments List (2/3 width) */}
          <div className="lg:w-2/3 space-y-6 relative z-0">
            {filteredSegments.length === 0 ? (
               <div className="py-12 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                 No sections found matching "{searchTerm}".
               </div>
            ) : filteredSegments.map((segment) => {
              const isActive = segment.id === activeSegmentId;

              return (
                <div
                  key={segment.id}
                  id={segment.id}
                  className={`rounded-xl border ${isActive ? 'border-indigo-300 shadow-md ring-1 ring-indigo-100 dark:ring-indigo-900' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 overflow-hidden transition-all duration-300 relative z-0`}
                >
                  {/* Segment Header (Clickable) */}
                  <div
                    onClick={() => setActiveSegmentId(segment.id)}
                    className={`cursor-pointer px-6 py-5 flex items-start gap-4 ${isActive ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'} transition-colors`}
                  >
                    <div className={`p-3 rounded-lg ${isActive ? 'bg-indigo-100 dark:bg-indigo-900/50 text-primary-500' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                       <segment.icon className="w-6 h-6" strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <h2 className={`text-xl font-bold ${isActive ? 'text-primary-500' : 'text-gray-900 dark:text-white'}`}>
                        {segment.title}
                      </h2>
                      <div className="mt-1 flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span>{segment.flows.length} Articles</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                        <span>Module Guide</span>
                      </div>
                    </div>
                  </div>

                  {/* Segment Body (Expanded Flows) */}
                  {isActive && (
                    <div className="border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                       <div className="p-6">
                           <div className="space-y-4">
                             {segment.flows.map((flow, idx) => {
                               const isFlowOpen = expandedFlows.has(flow.id);
                               return (
                                 <div key={flow.id} id={flow.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden scroll-mt-20">
                                    <button
                                      onClick={() => toggleFlow(flow.id)}
                                      className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700 text-left transition-colors"
                                    >
                                       <div className="flex items-center gap-3">
                                          {flow.icon ? (
                                              <flow.icon className="w-5 h-5 text-primary-500" />
                                          ) : (
                                              <span className="flex items-center justify-center w-6 h-6 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 font-bold text-xs shrink-0">{idx + 1}</span>
                                          )}
                                          <span className="font-semibold text-gray-900 dark:text-white">{flow.title}</span>
                                       </div>
                                       <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isFlowOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isFlowOpen && (
                                      <div className="p-5 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-5">{flow.description}</p>

                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Steps</h4>
                                        <ol className="list-decimal list-outside ml-4 space-y-2 text-sm text-gray-800 dark:text-gray-200 mb-6">
                                          {flow.steps.map((step, sIdx) => (
                                            <li key={sIdx} className="pl-1">{step}</li>
                                          ))}
                                        </ol>

                                        {/* Image Section */}
                                        {flow.images && flow.images.map((imgSrc, imgIdx) => (
                                          <div key={imgIdx} className="mt-4 relative w-full mb-4" style={{ aspectRatio: '16/9' }}>
                                            <Image
                                              src={imgSrc}
                                              alt={`${flow.title} - Step ${imgIdx + 1}`}
                                              fill
                                              className="object-contain"
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                 </div>
                               );
                             })}
                           </div>
                       </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* Right Section: Sticky Sidebar Panel (1/3 width) */}
          <div className="lg:w-1/3 relative z-0">
             <div className="sticky top-6 space-y-6">

                {/* Module Summary Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                   <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Module Overview</h3>
                   <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-md bg-indigo-50 dark:bg-indigo-900/30">
                         <activeSegment.icon className="w-6 h-6 text-primary-500" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">{activeSegment.title}</h4>
                   </div>
                   <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                     {activeSegment.overview}
                   </p>

                   {/* Quick Navigation Links */}
                   <div>
                     <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Articles in this Module</h4>
                     <ul className="space-y-2">
                       {activeSegment.flows.map(flow => (
                         <li key={`nav-${flow.id}`}>
                           <a
                             href={`#${flow.id}`}
                             onClick={(e) => handleSmoothScroll(e, flow.id)}
                             className="group flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors"
                           >
                             <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 mr-2 group-hover:bg-primary-500 transition-colors"></div>
                             <span className="truncate">{flow.title}</span>
                           </a>
                         </li>
                       ))}
                     </ul>
                   </div>
                </div>

                {/* Helpful Links Card */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                   <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Related Resources</h3>
                   <ul className="space-y-3">
                      <li>
                        <Link href="/knowledge-base" className="flex items-center gap-2 text-sm text-primary-500 hover:underline">
                          <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                          Back to Knowledge Base Home
                        </Link>
                      </li>
                      <li>
                        <Link href="#" className="flex items-center gap-2 text-sm text-primary-500 hover:underline">
                          <LinkIcon className="w-4 h-4" />
                          View Full FAQs
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