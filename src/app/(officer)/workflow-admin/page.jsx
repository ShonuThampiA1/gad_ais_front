"use client";

import {
  ExclamationCircleIcon,
  ClockIcon,
  CubeTransparentIcon,
  RectangleStackIcon,
  ShieldCheckIcon,
  UsersIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import WorkflowAdminSidebar from "./components/WorkflowAdminSidebar";

const summaryCards = [
  {
    title: "Total active services",
    value: 24,
    icon: CubeTransparentIcon,
    iconWrap: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
    borderTone: "border-indigo-300 dark:border-indigo-900/70",
  },
  {
    title: "Total routing rules",
    value: 186,
    icon: RectangleStackIcon,
    iconWrap: "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
    borderTone: "border-sky-300 dark:border-sky-900/70",
  },
  {
    title: "Total pending assignments",
    value: 74,
    icon: ClockIcon,
    iconWrap: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    borderTone: "border-amber-300 dark:border-amber-900/70",
  },
  {
    title: "Total completed assignments",
    value: 1298,
    icon: ShieldCheckIcon,
    iconWrap: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    borderTone: "border-emerald-300 dark:border-emerald-900/70",
  },
  {
    title: "SLA breached items",
    value: 13,
    icon: ExclamationCircleIcon,
    iconWrap: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
    borderTone: "border-rose-300 dark:border-rose-900/70",
  },
  {
    title: "Active provider groups",
    value: 9,
    icon: UsersIcon,
    iconWrap: "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
    borderTone: "border-violet-300 dark:border-violet-900/70",
  },
  {
    title: "Exception-enabled rules count",
    value: 27,
    icon: Squares2X2Icon,
    iconWrap: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
    borderTone: "border-indigo-300 dark:border-indigo-900/70",
  },
];

const topSlaDelayServices = [
  { service: "Provider Registration", breached: 6, avgDelay: "18h" },
  { service: "Service Amendment", breached: 4, avgDelay: "12h" },
  { service: "Escalation Handling", breached: 2, avgDelay: "9h" },
  { service: "Renewal Workflow", breached: 1, avgDelay: "6h" },
];

const recentRoutingRules = [
  {
    name: "Escalation after 24h pending",
    status: "Updated",
    owner: "Workflow Admin",
    when: "2 hours ago",
  },
  {
    name: "Priority route for critical cases",
    status: "Created",
    owner: "Operations",
    when: "Today, 09:45",
  },
  {
    name: "Provider-group fallback routing",
    status: "Updated",
    owner: "Workflow Admin",
    when: "Yesterday",
  },
];

function SurfaceCard({ title, children, titleClassName = "" }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className={`font-semibold text-slate-800 dark:text-slate-100 ${titleClassName || "text-sm"}`}>{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default function WorkflowAdminDashboardPage() {

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-8xl px-2 py-3 md:px-3 md:py-4">
        {/* Improved header with no right stats */}
        <header className="relative mb-3 overflow-hidden rounded-2xl border border-indigo-400/40 bg-gradient-to-r from-indigo-700 via-blue-700 to-indigo-700 px-6 py-8 text-white shadow-lg">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_12%_18%,rgba(255,255,255,0.22)_1px,transparent_1px)] [background-size:22px_22px]" />
          <div className="relative flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-100">
                Workflow Admin
              </p>
              <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium text-indigo-100 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                Live
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
              Workflow Control Dashboard
            </h1>
            <p className="mt-1 max-w-3xl text-sm text-indigo-100 md:text-base">
              Central command view for service routing, workflow queue movement, and SLA risk monitoring.
            </p>
          </div>
        </header>

        <div className="grid gap-3 lg:grid-cols-[250px_1fr]">
          <WorkflowAdminSidebar />
          <main className="space-y-6">
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {summaryCards.map((card, idx) => {
                const Icon = card.icon;
                return (
                  <motion.article
                    key={card.title}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, delay: idx * 0.04 }}
                    whileHover={{ y: -4, scale: 1.01 }}
                    whileTap={{ scale: 0.995 }}
                    className={`rounded-2xl border ${card.borderTone} bg-white p-6 shadow-sm transition-colors hover:bg-indigo-50 dark:bg-slate-900 dark:hover:bg-slate-800`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{card.title}</p>
                        <p className="mt-2 text-3xl font-bold text-slate-800 dark:text-slate-100">{card.value}</p>
                      </div>
                      <motion.div
                        whileHover={{ rotate: -4, scale: 1.06 }}
                        transition={{ type: "spring", stiffness: 260, damping: 16 }}
                        className={`rounded-xl p-2.5 shadow-sm ${card.iconWrap}`}
                      >
                        <Icon className="h-6 w-6" />
                      </motion.div>
                    </div>
                  </motion.article>
                );
              })}
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <SurfaceCard title="Top SLA delay services">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:text-slate-400">
                        <th className="px-3 py-2">Service</th>
                        <th className="px-3 py-2">Breached</th>
                        <th className="px-3 py-2">Avg delay</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topSlaDelayServices.map((row, idx) => (
                        <tr key={row.service} className={`border-b border-slate-100 last:border-0 dark:border-slate-800 ${idx % 2 === 0 ? "bg-slate-50/70 dark:bg-slate-800/40" : ""}`}>
                          <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-200">{row.service}</td>
                          <td className="px-3 py-2"><span className="rounded-md bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{row.breached}</span></td>
                          <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{row.avgDelay}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SurfaceCard>

              <SurfaceCard title="Recent routing rules created/updated">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:text-slate-400">
                        <th className="px-3 py-2">Rule</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Owner</th>
                        <th className="px-3 py-2">Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentRoutingRules.map((rule, idx) => (
                        <tr key={rule.name} className={`border-b border-slate-100 last:border-0 dark:border-slate-800 ${idx % 2 === 0 ? "bg-slate-50/70 dark:bg-slate-800/40" : ""}`}>
                          <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-200">{rule.name}</td>
                          <td className="px-3 py-2">
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${rule.status === "Created" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"}`}>
                              {rule.status}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{rule.owner}</td>
                          <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{rule.when}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SurfaceCard>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

