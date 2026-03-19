'use client';

import React from 'react';
import { 
  UsersIcon, 
  ShieldCheckIcon, 
  ListBulletIcon,
  DocumentIcon,
  BellIcon,
  UserPlusIcon,
  LockOpenIcon,
  CalendarIcon,
  EllipsisVerticalIcon,
  ArrowRightIcon,
  SparklesIcon,
  ShieldExclamationIcon,
  ChartBarIcon
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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-[0.2em]">
            <SparklesIcon className="h-4 w-4" />
            System Control Plane
          </div>
          <h1 className="text-4xl font-black text-neutral-900 dark:text-white tracking-tight">Super Admin Overview</h1>
          <p className="text-neutral-500 dark:text-neutral-400 font-medium">
            Monitoring system health, access matrices, and real-time security events.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="relative p-3 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:shadow-xl transition-all hover:-translate-y-1">
            <BellIcon className="h-6 w-6 text-neutral-500" />
            <span className="absolute top-3 right-3 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white dark:border-neutral-800" />
          </button>
          <div className="h-12 w-[1px] bg-neutral-200 dark:bg-neutral-700" />
          <div className="flex items-center gap-4 p-1.5 pr-6 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-sm">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-500/20">
              SA
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-black text-neutral-900 dark:text-white leading-none">Super Admin</p>
              <p className="text-[10px] font-black text-neutral-400 mt-1.5 uppercase tracking-widest">Global Root</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="group p-8 bg-white dark:bg-neutral-800 rounded-[2.5rem] border border-neutral-200 dark:border-neutral-700 hover:border-blue-500/50 transition-all duration-500 shadow-sm hover:shadow-2xl hover:-translate-y-1">
            <div className="flex items-center justify-between mb-8">
              <div className={`p-4 rounded-2xl ${stat.bg} transition-all group-hover:rotate-12 group-hover:scale-110 duration-500`}>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">+4.5%</span>
                <EllipsisVerticalIcon className="h-5 w-5 text-neutral-300 mt-2" />
              </div>
            </div>
            <div>
              <p className="text-xs font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em]">{stat.name}</p>
              <h3 className="text-4xl font-black text-neutral-900 dark:text-white mt-2 tabular-nums tracking-tighter">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 p-10 bg-white dark:bg-neutral-800 rounded-[3rem] border border-neutral-200 dark:border-neutral-700 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none">
              <ChartBarIcon className="h-64 w-64 rotate-12" />
           </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-4">
            <div>
              <h3 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">System Throughput</h3>
              <div className="flex items-center gap-2 mt-2 text-neutral-500">
                <CalendarIcon className="h-4 w-4" />
                <span className="text-sm font-bold uppercase tracking-wider">Live Monitoring • Mar 2024</span>
              </div>
            </div>
            <div className="flex bg-neutral-100 dark:bg-neutral-900 p-1.5 rounded-2xl border border-neutral-200 dark:border-neutral-700">
              <button className="px-6 py-2.5 text-xs font-black rounded-xl bg-white dark:bg-neutral-800 shadow-lg text-neutral-900 dark:text-white transition-all">Daily</button>
              <button className="px-6 py-2.5 text-xs font-bold rounded-xl text-neutral-500 hover:text-neutral-900 transition-all">Weekly</button>
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorLogins" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 800}} dy={20} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 800}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#0a0a0a', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)'}}
                  itemStyle={{color: '#fff', fontWeight: '900', fontSize: '14px'}}
                  cursor={{stroke: '#3b82f6', strokeWidth: 2}}
                />
                <Area type="monotone" dataKey="logins" stroke="#3b82f6" strokeWidth={5} fillOpacity={1} fill="url(#colorLogins)" animationDuration={2000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Security Feed */}
        <div className="p-10 bg-white dark:bg-neutral-800 rounded-[3rem] border border-neutral-200 dark:border-neutral-700 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">Security Feed</h3>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </div>
          </div>
          <div className="space-y-10 flex-1">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex gap-6 group cursor-pointer">
                <div className={`mt-1 h-14 w-14 shrink-0 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-700 flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-2xl group-hover:bg-white dark:group-hover:bg-neutral-800`}>
                  <activity.icon className={`h-7 w-7 ${activity.color}`} />
                </div>
                <div className="flex-1 border-b border-neutral-50 dark:border-neutral-800 pb-8 last:border-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-black text-neutral-900 dark:text-white group-hover:text-blue-600 transition-colors">{activity.user}</p>
                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-tighter font-mono">{activity.time}</span>
                  </div>
                  <p className="text-sm text-neutral-500 mt-1 font-bold leading-relaxed">{activity.action}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-10 py-5 px-8 rounded-[1.5rem] bg-neutral-900 dark:bg-black text-sm font-black text-white hover:bg-neutral-800 dark:hover:bg-neutral-900 transition-all shadow-2xl flex items-center justify-center gap-3 group">
            Global Audit Trail
            <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Access Section */}
      <div className="bg-gradient-to-br from-blue-700 via-indigo-800 to-purple-900 rounded-[4rem] p-16 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.3em]">
              <LockOpenIcon className="h-4 w-4" />
              Hierarchical RBAC Engine v2.4
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-white mb-8 leading-[1] tracking-tighter">Absolute Access Matrix.</h2>
            <p className="text-blue-100/80 text-xl font-bold leading-relaxed max-w-lg">
              Precision control over the entire organizational structure with atomic overrides and real-time permission propagation.
            </p>
            <div className="flex flex-wrap gap-6 pt-4">
              <Link href="/rbac/role-menu-mapping" className="px-10 py-5 rounded-2xl bg-white text-blue-900 font-black hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all">
                Access Matrix
              </Link>
              <Link href="/rbac/menus-management" className="px-10 py-5 rounded-2xl bg-blue-500/30 backdrop-blur-xl border border-white/20 text-white font-black hover:bg-blue-500/50 hover:scale-105 transition-all">
                Menu Factory
              </Link>
            </div>
          </div>
          <div className="hidden lg:block relative">
             <div className="absolute inset-0 bg-white/10 blur-[120px] rounded-full" />
             <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-12 shadow-2xl space-y-8">
                <div className="flex items-center gap-6">
                   <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center">
                      <ShieldExclamationIcon className="h-8 w-8 text-blue-200" />
                   </div>
                   <div className="space-y-2">
                      <div className="h-3 w-48 bg-white/20 rounded-full" />
                      <div className="h-3 w-32 bg-white/10 rounded-full" />
                   </div>
                </div>
                <div className="space-y-4">
                   {[1, 2, 3].map((i) => (
                     <div key={i} className="h-16 w-full rounded-2xl bg-white/5 border border-white/5 flex items-center px-6 gap-4 animate-pulse" style={{animationDelay: `${i * 200}ms`}}>
                        <div className="h-6 w-6 rounded-lg bg-white/10" />
                        <div className="h-2 w-full bg-white/10 rounded-full" />
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 select-none pointer-events-none">
          <ShieldCheckIcon className="h-[40rem] w-[40rem] translate-x-20 translate-y-20" />
        </div>
      </div>
    </div>
  );
}
