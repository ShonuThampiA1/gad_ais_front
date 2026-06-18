"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  CubeIcon,
  ChartBarIcon,
  UserGroupIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  QueueListIcon,
  ClockIcon,
  DocumentChartBarIcon,
} from "@heroicons/react/24/outline";

const leftMenuItems = [
  { label: "Dashboard", href: "/workflow-admin", icon: HomeIcon },
  { label: "Services Master", href: "/workflow-admin/service-master", icon: CubeIcon },
  { label: "Activity Levels", href: "/workflow-admin/activity-levels", icon: ChartBarIcon },
  { label: "Provider Groups", href: "/workflow-admin/provider-groups", icon: UserGroupIcon },
  { label: "Exception Rules", href: "/workflow-admin/exception-rules", icon: ExclamationCircleIcon },
  { label: "Routing Rules", href: "/workflow-admin/routing-rules", icon: ArrowPathIcon },
  {
    label: "Assignments / Work Queue",
    href: "/workflow-admin/assignments-work-queue",
    icon: QueueListIcon,
  },
  {
    label: "Workflow History / Tracking",
    href: "/workflow-admin/worflow-history-tracking",
    icon: ClockIcon,
  },
  { label: "Reports", href: "/workflow-admin/reports", icon: DocumentChartBarIcon },
];

function normalizePath(path = "") {
  return path.replace(/^\/official/, "").replace(/\/$/, "");
}

export default function WorkflowAdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-fit rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-4">
      <div className="mb-3 rounded-xl px-3 py-2.5 dark:border-slate-800 dark:bg-slate-800/60">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
          Workflow Menu
        </p>
      </div>
      <nav className="space-y-2">
        {leftMenuItems.map((item) => {
          const isActive = normalizePath(pathname) === normalizePath(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`group relative flex items-center gap-2 rounded-xl px-2 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-indigo-700 text-white shadow-sm ring-1 ring-indigo-500/60"
                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-indigo-200" />
              )}
              <span
                className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${
                  isActive
                    ? "bg-white/20"
                    : "bg-slate-100 group-hover:bg-indigo-50 dark:bg-slate-800 dark:group-hover:bg-indigo-950/40"
                }`}
              >
                <Icon
                  className={`h-4.5 w-4.5 ${
                    isActive
                      ? "text-white"
                      : "text-slate-500 group-hover:text-indigo-600 dark:text-slate-400 dark:group-hover:text-indigo-300"
                  }`}
                />
              </span>
              <span>{item.label}</span>
              <span
                className={`ml-auto text-sm ${
                  isActive
                    ? "text-indigo-100"
                    : "text-slate-300 group-hover:text-indigo-400 dark:text-slate-600 dark:group-hover:text-indigo-400"
                }`}
              >
                ›
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
