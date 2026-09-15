import React, { useState } from "react";
import {
  Globe,
  Users,
  Smartphone,
  Monitor,
  Tablet,
  Calendar,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  Clock
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

const HOURLY_VISITOR_DATA = [
  { time: "00:00", visitors: 42, pageViews: 120 },
  { time: "03:00", visitors: 18, pageViews: 45 },
  { time: "06:00", visitors: 65, pageViews: 180 },
  { time: "09:00", visitors: 420, pageViews: 1350 },
  { time: "12:00", visitors: 780, pageViews: 2450 },
  { time: "15:00", visitors: 890, pageViews: 3100 },
  { time: "18:00", visitors: 620, pageViews: 2150 },
  { time: "21:00", visitors: 380, pageViews: 1280 }
];

const DEVICE_BREAKDOWN = [
  { device: "Desktop / Laptops", percentage: 68, count: "3,326", icon: Monitor, color: "text-[#0062A8]" },
  { device: "Mobile Phones", percentage: 28, count: "1,370", icon: Smartphone, color: "text-emerald-600" },
  { device: "Tablets / iPads", percentage: 4, count: "196", icon: Tablet, color: "text-amber-600" }
];

const TOP_PAGES = [
  { path: "/dashboard", name: "Student Learning Dashboard", views: "14,280", unique: "2,410" },
  { path: "/courses/python-masterclass", name: "Python Programming Course", views: "9,850", unique: "1,890" },
  { path: "/tests/daily", name: "Daily Proctored Technical MCQ", views: "8,420", unique: "1,650" },
  { path: "/departments/cse", name: "Department of CSE Repository", views: "6,910", unique: "1,240" },
  { path: "/coding", name: "Placement Coding Arena", views: "5,340", unique: "980" }
];

export default function AdminVisitorsPage() {
  const [timeRange, setTimeRange] = useState("today");

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Globe className="w-6 h-6 text-[#0062A8]" />
            Institutional Visitor Traffic & Privacy Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time aggregate platform footfall, page hits, device telemetry, and peak access hours.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTimeRange("today")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              timeRange === "today"
                ? "bg-[#0062A8] text-white shadow-xs"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeRange("week")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              timeRange === "week"
                ? "bg-[#0062A8] text-white shadow-xs"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeRange("month")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              timeRange === "month"
                ? "bg-[#0062A8] text-white shadow-xs"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Today's Visitors</span>
          <p className="text-2xl font-black text-slate-900 mt-1">4,892</p>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
            <TrendingUp className="w-3 h-3" /> +14.2% from yesterday
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">This Week's Visitors</span>
          <p className="text-2xl font-black text-[#0062A8] mt-1">28,450</p>
          <span className="text-[10px] text-slate-500 mt-1 block">Institutional Footfall</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">This Month</span>
          <p className="text-2xl font-black text-amber-600 mt-1">112,890</p>
          <span className="text-[10px] text-slate-500 mt-1 block">Active Academic Month</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">All-Time Visitors</span>
          <p className="text-2xl font-black text-purple-600 mt-1">645,210</p>
          <span className="text-[10px] text-slate-500 mt-1 block">Since VCET Platform Launch</span>
        </div>
      </div>

      {/* Traffic Graph */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Daily Traffic Hourly Velocity</h3>
            <p className="text-xs text-slate-500">Peak student activity occurs during lab sessions (11 AM - 4 PM).</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-[#0062A8] font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0062A8] inline-block" />
              Visitors
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Page Views
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={HOURLY_VISITOR_DATA}>
              <defs>
                <linearGradient id="visitorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0062A8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0062A8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="pageViewsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="time" stroke="#94a3b8" textAnchor="end" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "0.75rem",
                  fontSize: "12px",
                  color: "#0f172a",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                }}
              />
              <Area type="monotone" dataKey="visitors" stroke="#0062A8" strokeWidth={2} fillOpacity={1} fill="url(#visitorGradient)" />
              <Area type="monotone" dataKey="pageViews" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#pageViewsGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Device Breakdown & Top Pages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Device breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Device Breakdown</h3>
          <div className="space-y-3">
            {DEVICE_BREAKDOWN.map((d) => {
              const Icon = d.icon;
              return (
                <div key={d.device} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-slate-700">
                      <Icon className={`w-4 h-4 ${d.color}`} />
                      {d.device}
                    </span>
                    <span className="font-bold text-slate-900">{d.percentage}% ({d.count})</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#0062A8] h-2 rounded-full"
                      style={{ width: `${d.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Landing Pages */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Top Visited Institutional Modules</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2.5">Module Route</th>
                  <th className="px-3 py-2.5">Page Title</th>
                  <th className="px-3 py-2.5 text-right">Total Hits</th>
                  <th className="px-3 py-2.5 text-right">Active Sessions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {TOP_PAGES.map((p) => (
                  <tr key={p.path} className="hover:bg-slate-50/80">
                    <td className="px-3 py-2.5 font-mono font-bold text-[#0062A8]">{p.path}</td>
                    <td className="px-3 py-2.5 font-medium text-slate-900">{p.name}</td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-800">{p.views}</td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-600">{p.unique}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
