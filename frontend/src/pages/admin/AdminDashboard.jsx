import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  Layers,
  Award,
  TrendingUp,
  Activity,
  ArrowRight,
  ShieldCheck,
  Download,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Megaphone,
  Code2,
  Flame,
  Globe,
  Clock,
  UserX,
  FileCheck,
  Zap,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import { analyticsService } from "../../services/analyticsService";

const DEPT_BAR_DATA = [
  { name: "CSE", students: 420, courses: 18, resources: 243, color: "#0284c7" },
  { name: "AI&DS", students: 380, courses: 14, resources: 195, color: "#7c3aed" },
  { name: "ECE", students: 340, courses: 12, resources: 210, color: "#db2777" },
  { name: "IT", students: 310, courses: 10, resources: 180, color: "#0891b2" },
  { name: "EEE", students: 260, courses: 8, resources: 145, color: "#d97706" },
  { name: "MECH", students: 230, courses: 6, resources: 130, color: "#dc2626" },
  { name: "CIVIL", students: 190, courses: 5, resources: 95, color: "#059669" },
];

const STUDENT_ACTIVITY_TRENDS = [
  { date: "Mon", logins: 1840, courseActive: 620, testAttempts: 340, downloads: 480 },
  { date: "Tue", logins: 2120, courseActive: 780, testAttempts: 410, downloads: 590 },
  { date: "Wed", logins: 2450, courseActive: 890, testAttempts: 490, downloads: 720 },
  { date: "Thu", logins: 2310, courseActive: 840, testAttempts: 460, downloads: 680 },
  { date: "Fri", logins: 2580, courseActive: 950, testAttempts: 520, downloads: 810 },
  { date: "Sat", logins: 1420, courseActive: 510, testAttempts: 290, downloads: 390 },
  { date: "Sun", logins: 1190, courseActive: 430, testAttempts: 210, downloads: 280 },
];

const COURSE_COMPLETION_RATES = [
  { name: "Python Programming Masterclass", rate: 78, color: "bg-blue-600" },
  { name: "Full Stack Web Development (MERN)", rate: 82, color: "bg-emerald-600" },
  { name: "Java Core & Algorithmic Thinking", rate: 64, color: "bg-amber-600" },
  { name: "Applied AI & Machine Learning", rate: 51, color: "bg-purple-600" },
  { name: "AWS Cloud Architecture Essentials", rate: 43, color: "bg-sky-600" },
];

const RECENT_ACTIVITIES = [
  {
    type: "course",
    title: "Student completed Python course",
    user: "Athithya V (732924CSE001)",
    time: "4 mins ago",
    badge: "Completed",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    type: "resource",
    title: "Teacher uploaded CSE resource",
    user: "Prof. S. R. Murugesan (DBMS Unit 3)",
    time: "18 mins ago",
    badge: "Upload",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    type: "announcement",
    title: "Admin published announcement",
    user: "Smart India Hackathon 2026 Internal Round",
    time: "1 hour ago",
    badge: "Broadcast",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    type: "test",
    title: "Student completed Daily Test #14",
    user: "Dharshini K (732922CSE042) • Score: 95%",
    time: "2 hours ago",
    badge: "Assessment",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    type: "cert",
    title: "Institutional Certificate Issued",
    user: "TV-2026-000182 to Karthik R (AI&DS)",
    time: "3 hours ago",
    badge: "Certificate",
    badgeColor: "bg-sky-50 text-sky-700 border-sky-200",
  },
];

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [activityMetric, setActivityMetric] = useState("all");

  useEffect(() => {
    async function load() {
      const s = await analyticsService.getDashboardSummary();
      setSummary(s);
    }
    load();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-800">
      {/* 1. Header Hero Banner - Crisp Institutional Blue */}
      <div className="bg-gradient-to-r from-[#0B4A8F] via-[#0062A8] to-sky-600 border border-blue-800 rounded-3xl p-6 sm:p-8 shadow-md text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-200" />
            <span>VCET Institutional Executive Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Administrative Overview
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Real-time analysis of student engagement, faculty resources, self-paced courses, proctored daily tests, and security audit logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/students"
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-[#0062A8] font-bold text-xs shadow-sm transition-all text-center"
          >
            Manage Students
          </Link>
          <Link
            to="/admin/tests"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold text-xs transition-all text-center"
          >
            Create Assessment
          </Link>
        </div>
      </div>

      {/* 2. Primary 8 Key Performance Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Students
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-[#0062A8]">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            2,450
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px]">
            <span className="text-emerald-600 font-bold">2,132 Active</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400">18 Blocked</span>
          </div>
        </div>

        {/* Total Teachers */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Teachers
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            124
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px]">
            <span className="text-purple-600 font-bold">7 Departments</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400">100% Verified</span>
          </div>
        </div>

        {/* Total Courses */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Courses
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            86
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px]">
            <span className="text-amber-600 font-bold">72 Published</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400">14 Drafts</span>
          </div>
        </div>

        {/* Resources */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Resources
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            1,284
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px]">
            <span className="text-emerald-600 font-bold">Syllabus / Notes</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400">PDF & Video</span>
          </div>
        </div>

        {/* Tests */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Tests
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            342
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px]">
            <span className="text-rose-600 font-bold">Daily & Placement</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400">Proctored</span>
          </div>
        </div>

        {/* Certificates */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Certificates
            </span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            1,827
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px]">
            <span className="text-sky-600 font-bold">Issued</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400">QR Verified</span>
          </div>
        </div>

        {/* Visitors */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Today's Visitors
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            4,892
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px]">
            <span className="text-indigo-600 font-bold">+14.2%</span>
            <span className="text-slate-400">from yesterday</span>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Active Users
            </span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            318
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            <span className="text-emerald-600 font-bold">Live on Portal</span>
          </div>
        </div>
      </div>

      {/* 3. Recharts Graphs: Student Activity & Department Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Student Activity Waveform */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#0062A8]" />
                Student Activity & Learning Telemetry
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Daily login volume, course module progression, test attempts, and notes downloads.
              </p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              {["all", "logins", "tests"].map((m) => (
                <button
                  key={m}
                  onClick={() => setActivityMetric(m)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                    activityMetric === m
                      ? "bg-white text-[#0062A8] shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={STUDENT_ACTIVITY_TRENDS}>
                <defs>
                  <linearGradient id="loginGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0062A8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0062A8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="courseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.75rem",
                    color: "#0f172a",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="logins"
                  stroke="#0062A8"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#loginGrad)"
                  name="Student Logins"
                />
                <Area
                  type="monotone"
                  dataKey="courseActive"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#courseGrad)"
                  name="Course Progression"
                />
                <Area
                  type="monotone"
                  dataKey="testAttempts"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fillOpacity={0}
                  name="Daily Test Attempts"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Col: Department Distribution */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-600" />
                Department Distribution
              </h2>
              <span className="text-[10px] font-mono text-slate-500 uppercase">7 Branches</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Active student cohort distribution across engineering disciplines.
            </p>
          </div>

          <div className="space-y-2.5">
            {DEPT_BAR_DATA.map((dept) => {
              const maxVal = 420;
              const pct = Math.round((dept.students / maxVal) * 100);
              return (
                <div key={dept.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">{dept.name}</span>
                    <span className="text-slate-900 font-mono font-bold">{dept.students} students</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: dept.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Course Completion Velocity & Live Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Course Completion */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-600" />
                Course Completion Velocity
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pass rates and module completion percentages across top technical courses.
              </p>
            </div>
            <Link
              to="/admin/courses"
              className="text-xs font-bold text-[#0062A8] hover:underline flex items-center gap-1"
            >
              <span>View Courses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4 pt-2">
            {COURSE_COMPLETION_RATES.map((c) => (
              <div key={c.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{c.name}</span>
                  <span className="font-mono font-bold text-[#0062A8]">{c.rate}% Completed</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`${c.color} h-2.5 rounded-full transition-all duration-700`}
                    style={{ width: `${c.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Live Institutional Activity Stream */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-600" />
                Recent Institutional Activity
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Live stream of courses, uploads, test submissions, and verified certificates.
              </p>
            </div>
            <Link
              to="/admin/audit-logs"
              className="text-xs font-bold text-[#0062A8] hover:underline flex items-center gap-1"
            >
              <span>Audit Logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 space-y-0.5">
            {RECENT_ACTIVITIES.map((act, idx) => (
              <div key={idx} className="py-3 flex items-start justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 truncate">
                      {act.title}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold border ${act.badgeColor}`}
                    >
                      {act.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{act.user}</p>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap font-mono">
                  {act.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
