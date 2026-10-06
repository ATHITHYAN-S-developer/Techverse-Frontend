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

/** Compact display for large counts: 723 -> "723", 48210 -> "48,210". */
const formatNumber = (value) =>
  typeof value === "number" && Number.isFinite(value) ? value.toLocaleString("en-IN") : "0";

/** "3 mins ago" from an ISO timestamp, or "just now" for anything sub-minute. */
function timeAgo(input) {
  if (!input) return "";
  const then = new Date(input).getTime();
  if (!Number.isFinite(then)) return "";

  const seconds = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (seconds < 60) return "just now";

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

const SKELETON = "text-slate-300";

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [activityMetric, setActivityMetric] = useState("all");
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const s = await analyticsService.getDashboardSummary();
        if (!cancelled) {
          setSummary(s);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const kpis = summary?.kpis || {};
  const students = kpis.students || {};
  const teachers = kpis.teachers || {};
  const courses = kpis.courses || {};
  const resources = kpis.resources || {};
  const coding = kpis.coding || {};
  const certificates = kpis.certificates || {};
  const visitors = kpis.visitors || {};
  const activeUsers = kpis.activeUsers || {};

  const branches = summary?.departmentDistribution || [];
  const largestBranch = branches.reduce((max, b) => Math.max(max, b.students || 0), 0);

  // Activity chart is driven by summary.activityTelemetry (logins / course
  // activity / test attempts / downloads). summary.visitors.series carries a
  // different shape (totalVisits, resourceViews, ...), so it must not be
  // mapped onto these keys.
  const activityTrend = (summary?.activityTelemetry || []).map((point) => ({
    date: point.date,
    logins: Number(point.logins) || 0,
    courseActive: Number(point.courseActive) || 0,
    assessmentAttempts: Number(point.assessmentAttempts) || 0,
    downloads: Number(point.downloads) || 0,
  }));

  const courseCompletion = summary?.courseVelocity || [];
  const recentActivities = summary?.recentActivity || [];

  return (

    <div className="space-y-6 max-w-7xl mx-auto text-slate-800">
      {/* 1. Header Hero Banner - Crisp Institutional Blue */}
      <div className="bg-gradient-to-r from-vcet-blue-deep via-vcet-blue to-sky-600 border border-blue-800 rounded-3xl p-6 sm:p-8 shadow-md text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-200" />
            <span>VCET Institutional Executive Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Administrative Overview
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Real-time analysis of student engagement, faculty resources, course assessments, and security audit logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/students"
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-vcet-blue font-bold text-xs shadow-sm transition-all text-center"
          >
            Manage Students
          </Link>
          <Link
            to="/admin/courses"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold text-xs transition-all text-center"
          >
            Manage Courses
          </Link>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Could not load live dashboard data: {error}
        </div>
      )}

      {/* 2. Primary 8 Key Performance Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Students
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-vcet-blue">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-black text-slate-900 mt-2 ${summary ? "" : SKELETON}`}>
            {formatNumber(students.total)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px]">
            <span className="text-emerald-600 font-bold">
              {formatNumber(students.active)} Active
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400">{formatNumber(students.blocked)} Blocked</span>
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
          <div className={`text-2xl sm:text-3xl font-black text-slate-900 mt-2 ${summary ? "" : SKELETON}`}>
            {formatNumber(teachers.total)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px]">
            <span className="text-purple-600 font-bold">
              {formatNumber(teachers.departments)} Departments
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400">{formatNumber(teachers.active)} Active</span>
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
          <div className={`text-2xl sm:text-3xl font-black text-slate-900 mt-2 ${summary ? "" : SKELETON}`}>
            {formatNumber(courses.total)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px]">
            <span className="text-amber-600 font-bold">
              {formatNumber(courses.published)} Published
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400">{formatNumber(courses.drafts)} Drafts</span>
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
          <div className={`text-2xl sm:text-3xl font-black text-slate-900 mt-2 ${summary ? "" : SKELETON}`}>
            {formatNumber(resources.total)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px]">
            <span className="text-emerald-600 font-bold">
              {Object.keys(resources.byType || {}).length} Types
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400">
              {formatNumber(courses.completedEnrollments)} Completions
            </span>
          </div>
        </div>

        {/* Coding problems */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Coding Problems
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-black text-slate-900 mt-2 ${summary ? "" : SKELETON}`}>
            {formatNumber(coding.problems)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px]">
            <span className="text-rose-600 font-bold">
              {formatNumber(coding.tests)} Coding Tests
            </span>
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
          <div className={`text-2xl sm:text-3xl font-black text-slate-900 mt-2 ${summary ? "" : SKELETON}`}>
            {formatNumber(certificates.issued)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px]">
            <span className="text-sky-600 font-bold">Issued</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400">
              {formatNumber(certificates.revoked)} Revoked
            </span>
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
          <div className={`text-2xl sm:text-3xl font-black text-slate-900 mt-2 ${summary ? "" : SKELETON}`}>
            {formatNumber(visitors.today)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px]">
            {Number(visitors.growthPercent) >= 0 ? (
              <span className="text-indigo-600 font-bold">
                +{formatNumber(visitors.growthPercent)}%
              </span>
            ) : (
              <span className="text-rose-600 font-bold">
                {formatNumber(visitors.growthPercent)}%
              </span>
            )}
            <span className="text-slate-400">vs {formatNumber(visitors.yesterday)} yesterday</span>
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
          <div className={`text-2xl sm:text-3xl font-black text-slate-900 mt-2 ${summary ? "" : SKELETON}`}>
            {formatNumber(activeUsers.count)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px]">
            {activeUsers.count > 0 ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
            )}
            <span className="text-emerald-600 font-bold">Live on Portal</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400">
              {formatNumber(activeUsers.students)} students
            </span>
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
                <TrendingUp className="w-4 h-4 text-vcet-blue" />
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
                      ? "bg-white text-vcet-blue shadow-xs"
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
              <AreaChart data={activityTrend}>
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
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} allowDecimals={false} />
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
                {activityMetric !== "tests" && (
                  <Area
                    type="monotone"
                    dataKey="logins"
                    stroke="#0062A8"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#loginGrad)"
                    name="Student Logins"
                  />
                )}
                {activityMetric === "all" && (
                  <Area
                    type="monotone"
                    dataKey="courseActive"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#courseGrad)"
                    name="Course Progression"
                  />
                )}
                {activityMetric !== "logins" && (
                  <Area
                    type="monotone"
                    dataKey="assessmentAttempts"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fillOpacity={0}
                    name="Course Assessment Attempts"
                  />
                )}
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
              <span className="text-[10px] font-mono text-slate-500 uppercase">
                {summary?.branchCount ?? branches.length} Branches
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Active student cohort distribution across engineering disciplines.
            </p>
          </div>

          {branches.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No student cohorts yet.
            </p>
          ) : (
            <div className="space-y-2.5">
              {branches.map((dept) => {
                // Bars are scaled against the largest branch rather than a fixed
                // ceiling, so a new intake never overflows the row.
                const pct = largestBranch > 0 ? Math.round((dept.students / largestBranch) * 100) : 0;
                return (
                  <div key={dept.code} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700">{dept.code}</span>
                      <span className="text-slate-900 font-mono font-bold">
                        {formatNumber(dept.students)} students
                      </span>
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
          )}

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-semibold">Total students</span>
            <span className="text-slate-900 font-mono font-bold">
              {formatNumber(summary?.departmentTotal)}
            </span>
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
              className="text-xs font-bold text-vcet-blue hover:underline flex items-center gap-1"
            >
              <span>View Courses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4 pt-2">
            {courseCompletion.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No courses published yet.
              </p>
            ) : (
              courseCompletion.map((c) => (
                <div key={c.courseId || c.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs gap-3">
                    <span className="font-bold text-slate-800 truncate">{c.name}</span>
                    <span className="font-mono font-bold text-vcet-blue whitespace-nowrap">
                      {c.rate}% · {formatNumber(c.enrollments)} enrolled
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`${c.color} h-2.5 rounded-full transition-all duration-700`}
                      style={{ width: `${c.rate}%` }}
                    />
                  </div>
                </div>
              ))
            )}
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
              className="text-xs font-bold text-vcet-blue hover:underline flex items-center gap-1"
            >
              <span>Audit Logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 space-y-0.5">
            {recentActivities.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No recent activity recorded.
              </p>
            ) : (
              recentActivities.map((act, idx) => (
                <div
                  key={act.id || idx}
                  className="py-3 flex items-start justify-between gap-3"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {act.title}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold border ${act.badgeColor}`}
                      >
                        {act.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{act.user}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap font-mono">
                    {timeAgo(act.timestamp || act.time)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
