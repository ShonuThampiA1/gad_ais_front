'use client';

import { useState, useEffect } from 'react';
import {
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  UserIcon,
  UserPlusIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { ArrowTrendingUpIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/utils/apiClient';

const VERIFICATION_LIST_PATH = '/rbac/superadmin-dashboard/officer-verification-list';

type DashboardApiData = {
  total_all?: number;
  as2_review_pending?: number;
  approved_total?: number;
  return_for_correction_pending?: number;
};

type DashboardTrend = 'stable' | 'improving' | 'declining';

type OnboardingFilter = 'onboarded' | 'first-login' | 'started-er' | 'login-pendings';

export default function SuperAdminOperationalDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingApplication, setPendingApplication] = useState(0);
  const [analytics, setAnalytics] = useState({
    approvalRate: 0,
    returnRate: 0,
    pendingRate: 0,
    efficiencyScore: 0,
    avgProcessingTime: '2.5 days',
    trend: 'stable' as DashboardTrend,
  });

  const [stats, setStats] = useState([
    {
      name: 'Total Profiles Submitted',
      value: 0,
      icon: EyeIcon,
      filter: 'total',
      bgColor: 'bg-gradient-to-r from-indigo-500 to-indigo-700',
      textColor: 'text-white',
      progress: 100,
    },
    {
      name: 'Pending Verification',
      value: 0,
      icon: ClockIcon,
      filter: 'pending',
      bgColor: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
      textColor: 'text-white',
      progress: 0,
    },
    {
      name: 'Approved',
      value: 0,
      icon: CheckCircleIcon,
      filter: 'approved',
      bgColor: 'bg-gradient-to-r from-green-500 to-green-700',
      textColor: 'text-white',
      progress: 0,
    },
    {
      name: 'Returned for Correction',
      value: 0,
      icon: ArrowPathIcon,
      filter: 'returned',
      bgColor: 'bg-gradient-to-r from-red-500 to-red-700',
      textColor: 'text-white',
      progress: 0,
    },
  ]);

  const [onboardingStats, setOnboardingStats] = useState([
    {
      name: 'Onboarded Officers List',
      value: 0,
      icon: UserIcon,
      filter: 'onboarded',
      bgColor: 'bg-gradient-to-r from-teal-500 to-teal-700',
      textColor: 'text-white',
    },
    {
      name: 'Login Activated Officers',
      value: 0,
      icon: UserPlusIcon,
      filter: 'first-login',
      bgColor: 'bg-gradient-to-r from-purple-500 to-purple-700',
      textColor: 'text-white',
    },
    {
      name: 'Profile Updation In Progress',
      value: 0,
      icon: DocumentTextIcon,
      filter: 'started-er',
      bgColor: 'bg-gradient-to-r from-pink-500 to-pink-700',
      textColor: 'text-white',
    },
    {
      name: 'Login Pending Officers',
      value: 0,
      icon: ClockIcon,
      filter: 'login-pendings',
      bgColor: 'bg-gradient-to-r from-orange-400 to-orange-600',
      textColor: 'text-white',
    },
  ]);

  const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 100) : 0);

  const calculateAnalytics = (data: DashboardApiData) => {
    const total_all = Number(data?.total_all ?? 0);
    const as2_review_pending = Number(data?.as2_review_pending ?? 0);
    const approved_total = Number(data?.approved_total ?? 0);
    const return_for_correction_pending = Number(data?.return_for_correction_pending ?? 0);

    const derivedTotal =
      total_all > 0 ? total_all : as2_review_pending + approved_total + return_for_correction_pending;

    const approvalRate = derivedTotal > 0 ? pct(approved_total, derivedTotal) : 0;
    const returnRate = derivedTotal > 0 ? pct(return_for_correction_pending, derivedTotal) : 0;
    const pendingRate = derivedTotal > 0 ? pct(as2_review_pending, derivedTotal) : 0;

    const efficiencyScore = Math.max(
      0,
      Math.min(100, approvalRate * 1.2 - returnRate * 0.5 + (100 - pendingRate) * 0.3)
    );

    let trend: DashboardTrend = 'stable';
    if (approvalRate > 70 && returnRate < 15) trend = 'improving';
    else if (approvalRate < 50 || returnRate > 30) trend = 'declining';

    return {
      approvalRate,
      returnRate,
      pendingRate,
      efficiencyScore: Math.round(efficiencyScore),
      avgProcessingTime: approvalRate > 70 ? '1.8 days' : approvalRate > 50 ? '2.5 days' : '3.2 days',
      trend,
    };
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/admin/dashboard');
        const dashboardData = response?.data?.data || {};

        const total_all = Number(dashboardData?.total_all ?? 0);
        const pending = Number(dashboardData?.as2_review_pending ?? 0);
        const approved = Number(dashboardData?.approved_total ?? 0);
        const returned = Number(dashboardData?.return_for_correction_pending ?? 0);
        const derivedTotal = total_all > 0 ? total_all : pending + approved + returned;

        setPendingApplication(pending);
        setStats((prev) => [
          { ...prev[0], value: derivedTotal, progress: 100 },
          { ...prev[1], value: pending, progress: pct(pending, derivedTotal) },
          { ...prev[2], value: approved, progress: pct(approved, derivedTotal) },
          { ...prev[3], value: returned, progress: pct(returned, derivedTotal) },
        ]);
        setAnalytics(calculateAnalytics(dashboardData));

        const [firstLoginResponse, officersResponse, startedERResponse] = await Promise.all([
          axiosInstance.get('/admin/first-login-completed'),
          axiosInstance.get('/admin/officers'),
          axiosInstance.get('/admin/profile-saving-started'),
        ]);

        const firstLoginCount = firstLoginResponse?.data?.data?.officers?.length || 0;
        const onboardedCount = officersResponse?.data?.data?.length || 0;
        const startedERCount = startedERResponse?.data?.data?.officers?.length || 0;
        const pendingLoginCount = Math.max(onboardedCount - firstLoginCount, 0);

        setOnboardingStats((prev) => [
          { ...prev[0], value: onboardedCount },
          { ...prev[1], value: firstLoginCount },
          { ...prev[2], value: startedERCount },
          { ...prev[3], value: pendingLoginCount },
        ]);
      } catch (err) {
        console.error('Superadmin dashboard API Error:', err);
        setError('Failed to connect to server');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleVerificationCardClick = (filter: string) => {
    router.push(`${VERIFICATION_LIST_PATH}?filter=${filter}`);
  };

  const onboardingPaths: Record<OnboardingFilter, string> = {
    onboarded: '/rbac/superadmin-dashboard/onboarded-officers',
    'first-login': '/rbac/superadmin-dashboard/first-time-logins',
    'started-er': '/rbac/superadmin-dashboard/started-er',
    'login-pendings': '/rbac/superadmin-dashboard/login-pendings',
  };

  const handleOnboardingCardClick = (filter: OnboardingFilter) => {
    const path = onboardingPaths[filter];
    if (path) router.push(path);
  };

  const user = JSON.parse(sessionStorage.getItem('user_details') || '{}');

  const getEfficiencyColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getTrendColor = (trend: DashboardTrend) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600 dark:text-green-400';
      case 'declining':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-indigo-600 dark:text-indigo-400';
    }
  };

  const getTrendIcon = (trend: DashboardTrend) => {
    const baseClasses = 'h-4 w-4';
    switch (trend) {
      case 'improving':
        return <ArrowTrendingUpIcon className={`${baseClasses} text-green-500`} />;
      case 'declining':
        return <ArrowTrendingUpIcon className={`${baseClasses} rotate-180 text-red-500`} />;
      default:
        return <ChartBarIcon className={`${baseClasses} text-indigo-500`} />;
    }
  };

  return (
    <div className="mb-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-900 sm:p-4 lg:p-5">
      {loading ? (
        <div className="py-8 text-center text-gray-600">Loading dashboard...</div>
      ) : error ? (
        <div className="py-8 text-center text-red-600">Error: {error}</div>
      ) : (
        <>
          <header className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-300 shadow-xl dark:from-indigo-900 dark:to-indigo-700">
            <div className="px-4 py-6 sm:px-6 sm:py-8 md:px-10 md:py-12">
              <h1 className="break-words text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                Welcome, {user.first_name} {user.last_name || 'Super Admin'}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-indigo-100 sm:text-base">
                You have <span className="font-bold text-yellow-300">{pendingApplication} applications</span> currently awaiting review.
              </p>
            </div>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-yellow-500 to-transparent" />
          </header>

          <div className="mb-10">
            <h2 className="mb-5 flex items-center text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
              <UserIcon className="mr-2 h-5 w-5 text-indigo-500" />
              Officer Onboarding Activity
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {onboardingStats.map((stat) => (
                <button
                  key={stat.filter}
                  onClick={() => handleOnboardingCardClick(stat.filter as OnboardingFilter)}
                  className="group block rounded-2xl text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="relative overflow-hidden rounded-2xl border border-gray-200/50 bg-white/90 shadow-lg backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/90">
                    <div className={`absolute bottom-0 left-0 top-0 w-1.5 ${stat.bgColor}`} />
                    <div className="relative z-10 min-h-[136px] p-5 pl-6 sm:min-h-[148px]">
                      <div className="flex items-start gap-3">
                        <div className={`shrink-0 rounded-lg p-3 shadow-md ${stat.bgColor}`}>
                          <stat.icon className={`h-6 w-6 ${stat.textColor}`} aria-hidden="true" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <dt className="line-clamp-2 min-h-[2.75rem] text-sm font-semibold leading-5 text-gray-700 dark:text-gray-300">
                            {stat.name}
                          </dt>
                          <dd className="mt-2 flex items-baseline">
                            <div className="break-words text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                              {stat.value}
                            </div>
                          </dd>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-10">
            <h2 className="mb-5 flex items-center text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
              <CheckCircleIcon className="mr-2 h-5 w-5 text-indigo-500" />
              Application Verification Overview
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <button
                  key={stat.filter}
                  onClick={() => handleVerificationCardClick(stat.filter)}
                  className="group block rounded-2xl text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="relative overflow-hidden rounded-2xl border border-gray-200/50 bg-white/90 shadow-lg backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/90">
                    <div className={`absolute bottom-0 left-0 top-0 w-1.5 ${stat.bgColor}`} />
                    <div className="relative z-10 min-h-[152px] p-5 pl-6 sm:min-h-[164px]">
                      <div className="flex items-start gap-3">
                        <div className={`shrink-0 rounded-lg p-3 shadow-md ${stat.bgColor}`}>
                          <stat.icon className={`h-6 w-6 ${stat.textColor}`} aria-hidden="true" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <dt className="line-clamp-2 min-h-[2.75rem] text-sm font-semibold leading-5 text-gray-700 dark:text-gray-300">
                            {stat.name}
                          </dt>
                          <dd className="mt-2 flex items-baseline">
                            <div className="break-words text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                              {stat.value}
                            </div>
                          </dd>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                          <div
                            className={`${stat.bgColor} h-1.5 rounded-full transition-all duration-700 ease-out`}
                            style={{ width: `${stat.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-10 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-gray-200/50 bg-gradient-to-br from-white to-indigo-50/30 p-6 shadow-lg dark:border-gray-700/50 dark:from-gray-800 dark:to-indigo-900/20">
              <h2 className="mb-4 flex items-center text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                <ChartBarIcon className="mr-2 h-5 w-5 text-indigo-500" />
                Performance Analytics
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-white/70 p-4 text-center shadow-sm backdrop-blur-sm dark:bg-gray-700/70">
                  <div className="break-words text-2xl font-bold text-green-600 dark:text-green-400">{analytics.approvalRate}%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Approval Rate</div>
                  <div className="mt-1 text-xs text-green-500 dark:text-green-400">Good</div>
                </div>
                <div className="rounded-lg bg-white/70 p-4 text-center shadow-sm backdrop-blur-sm dark:bg-gray-700/70">
                  <div className="break-words text-2xl font-bold text-red-600 dark:text-red-400">{analytics.returnRate}%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Return Rate</div>
                  <div className="mt-1 text-xs text-red-500 dark:text-red-400">Monitor</div>
                </div>
                <div className="rounded-lg bg-white/70 p-4 text-center shadow-sm backdrop-blur-sm dark:bg-gray-700/70">
                  <div className="break-words text-2xl font-bold text-indigo-600 dark:text-indigo-400">{analytics.efficiencyScore}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Efficiency Score</div>
                  <div className={`mt-1 text-xs ${getEfficiencyColor(analytics.efficiencyScore)}`}>
                    {analytics.efficiencyScore >= 80 ? 'Excellent' : analytics.efficiencyScore >= 60 ? 'Good' : 'Needs Improvement'}
                  </div>
                </div>
                <div className="rounded-lg bg-white/70 p-4 text-center shadow-sm backdrop-blur-sm dark:bg-gray-700/70">
                  <div className="break-words text-lg font-bold text-purple-600 dark:text-purple-400 sm:text-xl">{analytics.avgProcessingTime}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Avg. Processing</div>
                  <div className="mt-1 text-xs text-purple-500 dark:text-purple-400">Timely</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200/50 bg-gradient-to-br from-white to-indigo-50/30 p-6 shadow-lg dark:border-gray-700/50 dark:from-gray-800 dark:to-indigo-900/20">
              <h2 className="mb-4 flex items-center text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                <ArrowTrendingUpIcon className="mr-2 h-5 w-5 text-indigo-500" />
                Workload Distribution
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="mb-1 flex items-center justify-between gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <span>Pending Review</span>
                    <span className="shrink-0">{analytics.pendingRate}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div className="h-2 rounded-full bg-yellow-500 transition-all duration-700" style={{ width: `${analytics.pendingRate}%` }} />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <span>Approved</span>
                    <span className="shrink-0">{analytics.approvalRate}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div className="h-2 rounded-full bg-green-500 transition-all duration-700" style={{ width: `${analytics.approvalRate}%` }} />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <span>Returned</span>
                    <span className="shrink-0">{analytics.returnRate}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div className="h-2 rounded-full bg-red-500 transition-all duration-700" style={{ width: `${analytics.returnRate}%` }} />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-2 border-t border-gray-200 pt-4 dark:border-gray-600 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Performance Trend</span>
                <div className="flex items-center">
                  {getTrendIcon(analytics.trend)}
                  <span className={`ml-1 text-sm font-medium ${getTrendColor(analytics.trend)}`}>
                    {analytics.trend.charAt(0).toUpperCase() + analytics.trend.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
