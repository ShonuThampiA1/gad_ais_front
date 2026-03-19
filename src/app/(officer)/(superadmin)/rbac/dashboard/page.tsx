
'use client';

import React from 'react';
import { 
  UsersIcon, 
  KeyIcon, 
  ShieldCheckIcon, 
  ChartBarIcon,
  ListBulletIcon,
  DocumentIcon,
  BellIcon,
  UserPlusIcon,
  LockOpenIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import Link from 'next/link';

const stats = [
  { name: 'Total Roles', value: '12', icon: ShieldCheckIcon, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { name: 'Total Menus', value: '45', icon: ListBulletIcon, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { name: 'Total Pages', value: '128', icon: DocumentIcon, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { name: 'Active Users', value: '1,240', icon: UsersIcon, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
];

const chartData = [
  { name: 'Mon', logins: 400, actions: 240 },
  { name: 'Tue', logins: 300, actions: 139 },
  { name: 'Wed', logins: 200, actions: 980 },
  { name: 'Thu', logins: 278, actions: 390 },
  { name: 'Fri', logins: 189, actions: 480 },
  { name: 'Sat', logins: 239, actions: 380 },
  { name: 'Sun', logins: 349, actions: 430 },
];

const recentActivities = [
  { id: 1, user: 'Admin Sarah', action: 'Modified Role: Editor', time: '12 mins ago', icon: ShieldCheckIcon, color: 'text-blue-500' },
  { id: 2, user: 'System', action: 'New Page Added: /reports/billing', time: '45 mins ago', icon: DocumentIcon, color: 'text-emerald-500' },
  { id: 3, user: 'Admin Mike', action: 'User Override: John Doe', time: '2 hours ago', icon: UserPlusIcon, color: 'text-orange-500' },
  { id: 4, user: 'Security Bot', action: 'Failed login attempt detected', time: '4 hours ago', icon: LockOpenIcon, color: 'text-red-500' },
];

export default function SuperAdminDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">Super Admin Overview</h1>
          <p className="mt-2 text-neutral-500 dark:text-neutral-400 font-medium">
            Welcome back, Administrator. Monitoring system health and access control.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2.5 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-all">
            <BellIcon className="h-6 w-6 text-neutral-500" />
            <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white dark:border-neutral-800" />
          </button>
          <div className="h-10 w-[1px] bg-neutral-200 dark:bg-neutral-700" />
          <div className="flex items-center gap-4 p-1 pr-4 bg-white dark:bg-neutral-800 rounded-full border border-neutral-200 dark:border-neutral-700">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              SA
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-bold text-neutral-900 dark:text-white leading-none">Super Admin</p>
              <p className="text-[10px] font-bold text-neutral-400 mt-1 uppercase tracking-wider">Root Access</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="group p-6 bg-white dark:bg-neutral-800 rounded-[2rem] border border-neutral-200 dark:border-neutral-700 hover:border-blue-500/50 transition-all duration-500 shadow-sm hover:shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className={`p-4 rounded-2xl ${stat.bg} transition-transform group-hover:rotate-12 duration-500`}>
                <stat.icon className={`h-7 w-7 ${stat.color}`} />
              </div>
              <EllipsisVerticalIcon className="h-5 w-5 text-neutral-300" />
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">{stat.name}</p>
              <div className="flex items-end gap-2 mt-1">
                <h3 className="text-3xl font-black text-neutral-900 dark:text-white">{stat.value}</h3>
                <span className="text-emerald-500 text-xs font-bold mb-1.5">+4.5%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Chart */}
        <div className="lg:col-span-2 p-8 bg-white dark:bg-neutral-800 rounded-[2.5rem] border border-neutral-200 dark:border-neutral-700 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-neutral-900 dark:text-white">System Traffic</h3>
              <div className="flex items-center gap-2 mt-1 text-neutral-500">
                <CalendarIcon className="h-4 w-4" />
                <span className="text-sm font-medium">March 2024</span>
              </div>
            </div>
            <div className="flex bg-neutral-100 dark:bg-neutral-900 p-1 rounded-xl">
              <button className="px-4 py-2 text-xs font-bold rounded-lg bg-white dark:bg-neutral-800 shadow-sm text-neutral-900 dark:text-white transition-all">Daily</button>
              <button className="px-4 py-2 text-xs font-bold rounded-lg text-neutral-500 transition-all">Weekly</button>
            </div>
          </div>
          <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorLogins" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#171717', borderRadius: '16px', border: 'none', color: '#fff', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                  itemStyle={{color: '#fff', fontWeight: 'bold'}}
                />
                <Area type="monotone" dataKey="logins" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorLogins)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Logs */}
        <div className="p-8 bg-white dark:bg-neutral-800 rounded-[2.5rem] border border-neutral-200 dark:border-neutral-700 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-neutral-900 dark:text-white">Live Logs</h3>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="space-y-8">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex gap-5 group cursor-pointer">
                <div className={`mt-1 h-12 w-12 shrink-0 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-700 flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-lg`}>
                  <activity.icon className={`h-6 w-6 ${activity.color}`} />
                </div>
                <div className="flex-1 border-b border-neutral-50 dark:border-neutral-800 pb-6 last:border-0">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-black text-neutral-900 dark:text-white">{activity.user}</p>
                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-tighter">{activity.time}</span>
                  </div>
                  <p className="text-sm text-neutral-500 mt-1 font-medium leading-relaxed">{activity.action}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-4 px-6 rounded-2xl bg-blue-600 text-sm font-black text-white hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/40">
            Audit Full System
          </button>
        </div>
      </div>

      {/* RBAC Quick Access */}
      <div className="bg-neutral-900 dark:bg-black rounded-[3rem] p-12 relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest mb-6">
              <LockOpenIcon className="h-4 w-4" />
              RBAC Engine Active
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-[1.1]">Complete Control over Access Matrix.</h2>
            <p className="text-neutral-400 text-lg font-medium leading-relaxed mb-10">
              Manage hierarchical structures, role-based permissions, and individual user overrides with precision and real-time synchronization.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/rbac/role-menu-mapping" className="px-8 py-4 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 hover:shadow-2xl transition-all">
                Role Matrix
              </Link>
              <Link href="/rbac/menus-management" className="px-8 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-white font-black hover:bg-white/20 transition-all">
                Menu Config
              </Link>
            </div>
          </div>
          <div className="hidden lg:block">
             <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full" />
                <div className="relative bg-neutral-800/50 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl">
                   <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 w-full rounded-xl bg-white/5 border border-white/5 animate-pulse" />
                      ))}
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}