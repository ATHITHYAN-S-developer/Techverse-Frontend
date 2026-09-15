import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  Download,
  Globe,
  Activity,
  ShieldAlert,
  AlertTriangle,
  EyeOff,
  Maximize2,
  CopyX,
  FileCheck,
} from "lucide-react";
import { analyticsService } from "../../services/analyticsService";

const PIE_COLORS = ["#EF4444", "#F59E0B", "#8B5CF6", "#EC4899", "#3B82F6"];

export default function AdminAnalyticsPage() {
  const [deptData, setDeptData] = useState([]);
  const [courseStats, setCourseStats] = useState([]);
  const [visitorTrends, setVisitorTrends] = useState([]);
  const [testAttempts, setTestAttempts] = useState([]);
  const [violationsData, setViolationsData] = useState(null);

  useEffect(() => {
    async function load() {
      const [d, c, v, t, viol] = await Promise.all([
        analyticsService.getDepartmentDistribution(),
        analyticsService.getCourseEnrollmentStats(),
        analyticsService.getVisitorTrends(),
        analyticsService.getMonthlyTestAttempts(),
        analyticsService.getViolationsAnalytics(),
      ]);
      setDeptData(d);
      setCourseStats(c);
      setVisitorTrends(v);
      setTestAttempts(t);
      setViolationsData(viol);
    }
    load();
  }, []);

  const summary = violationsData?.summary || {
    totalStarted: 142,
    totalCompleted: 128,
    totalAutoSubmitted: 7,
    totalViolations: 99,
    activeTests: 7,
  };

  const chartData = violationsData?.chartData || [
    { name: "Tab Switch", count: 31, color: "#EF4444" },
    { name: "Window Blur", count: 27, color: "#F59E0B" },
    { name: "Paste Attempt", count: 18, color: "#8B5CF6" },
    { name: "Fullscreen Exit", count: 14, color: "#EC4899" },
    { name: "Copy Attempt", count: 9, color: "#3B82F6" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-800">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0062A8] text-xs font-bold mb-2">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>VCET Institutional Telemetry & Anti-Cheat Control</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">
          Institutional Analytics & Exam Proctoring Telemetry
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Real-time analysis of student learning velocity, assessment integrity, and test violations.
        </p>
      </div>

      {/* 1. Exam Mode Telemetry KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-1 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase">Students Started</span>
            <Users className="w-4 h-4 text-[#0062A8]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{summary.totalStarted}</div>
          <span className="text-[11px] text-slate-500">Across MCQ & Coding Arenas</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-1 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase">Completed</span>
            <FileCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">{summary.totalCompleted}</div>
          <span className="text-[11px] text-emerald-600 font-medium">90.1% Completion rate</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-1 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase">Auto Submitted</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600">{summary.totalAutoSubmitted}</div>
          <span className="text-[11px] text-rose-600 font-medium">Due to 3-strike violations</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-1 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase">Total Violations</span>
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600">{summary.totalViolations}</div>
          <span className="text-[11px] text-amber-600 font-medium">Security flags recorded</span>
        </div>
      </div>

      {/* 2. Exam Security Breakdown & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Violation Event Breakdown Chart */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" /> Security Violations Distribution
            </h3>
            <span className="text-xs text-slate-500">Proctoring Telemetry</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#e2e8f0",
                    borderRadius: "12px",
                    color: "#0f172a",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                  }}
                />
                <Bar dataKey="count" fill="#EF4444" radius={[6, 6, 0, 0]} name="Incidents">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Individual Student Violation Log */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" /> Recent Student Incidents
            </h3>
            <span className="text-[11px] text-slate-500">Audit Log</span>
          </div>

          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {(violationsData?.recentViolations || []).map((v, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start justify-between gap-3"
              >
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{v.studentId?.name || "Student"}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">
                      {v.studentId?.registerNumber || "732924CSE001"}
                    </span>
                  </div>
                  <div className="text-[11px] text-rose-600 font-medium mt-0.5">
                    {v.type.replace(/_/g, " ")}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{v.details}</div>
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                  {new Date(v.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. General Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#0062A8]" /> Student Enrollment by Department
            </h3>
            <span className="text-xs text-slate-500">Total: 5,240</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "12px", color: "#0f172a" }} />
                <Bar dataKey="students" fill="#0062A8" radius={[6, 6, 0, 0]} name="Students" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Course Completion Velocity */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" /> Course Completion %
            </h3>
            <span className="text-xs text-slate-500">Benchmarks</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courseStats} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" domain={[0, 100]} unit="%" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={80} />
                <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "12px", color: "#0f172a" }} />
                <Bar dataKey="rate" fill="#10B981" radius={[0, 6, 6, 0]} name="Completion Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Test Attempts Trend */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-500" /> Daily Practice Tests Activity
            </h3>
            <span className="text-xs text-slate-500">Monthly Run Rate</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={testAttempts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "12px", color: "#0f172a" }} />
                <Area type="monotone" dataKey="attempts" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.2} name="Attempts" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Visitor Traffic Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#0062A8]" /> Platform Traffic Trends
            </h3>
            <span className="text-xs text-slate-500">Last 7 Days</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={visitorTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "12px", color: "#0f172a" }} />
                <Line type="monotone" dataKey="visitors" stroke="#0062A8" strokeWidth={3} name="Visitors" />
                <Line type="monotone" dataKey="pageViews" stroke="#10b981" strokeWidth={2} name="Page Views" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
