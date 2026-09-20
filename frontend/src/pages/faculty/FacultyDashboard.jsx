import React from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Megaphone,
  Users,
  BookOpen,
  Plus,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Download,
  Eye,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/StatCard";

export default function FacultyDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0B4A8F] via-[#0062A8] to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-sky-100 mb-3 border border-white/20">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-200" />
            <span>Department of Computer Science & Engineering</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome, {user?.name || "Prof. S. R. Murugesan"}
          </h1>
          <p className="text-sky-100 text-sm mt-1 max-w-xl">
            Manage your department syllabus, upload unit notes & question banks, broadcast student circulars, and monitor student progress.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/faculty/resources"
            className="px-4 py-2.5 rounded-2xl bg-white text-[#0B4A8F] font-bold text-xs hover:bg-sky-50 shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Resource</span>
          </Link>
          <Link
            to="/faculty/announcements"
            className="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-semibold text-xs backdrop-blur-md border border-white/20 transition-colors"
          >
            Create Notice
          </Link>
        </div>
      </div>

      {/* 2. Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Resources Uploaded"
          value="48"
          subtitle="CSE Department Notes & QBs"
          icon={FileText}
          trend="+4 this semester"
          trendPositive={true}
          color="blue"
        />
        <StatCard
          title="Assigned Subjects"
          value="3"
          subtitle="DSA, DBMS, Python Core"
          icon={BookOpen}
          color="emerald"
        />
        <StatCard
          title="Department Students"
          value="240"
          subtitle="II & III Year CSE Roster"
          icon={Users}
          color="amber"
        />
        <StatCard
          title="Resource Downloads"
          value="3,840"
          subtitle="Student access count"
          icon={Download}
          trend="+18% this month"
          trendPositive={true}
          color="purple"
        />
      </div>

      {/* 3. Assigned Subjects & Quick Management Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Assigned Subjects & Syllabus Overview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#0062A8]" /> Assigned Teaching Subjects (Odd Sem 2026)
            </h2>
            <Link to="/faculty/resources" className="text-xs font-semibold text-[#0062A8] hover:underline">
              View All Resources →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-[#0062A8] border border-blue-200">
                  CS8492
                </span>
                <span className="text-xs font-semibold text-slate-400">Semester 4</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Database Management Systems</h3>
                <p className="text-xs text-slate-500 mt-1">Class: II CSE - A & B • 120 Students</p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>5 / 5 Units Uploaded</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% Ready
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-[#0062A8] border border-blue-200">
                  CS8351
                </span>
                <span className="text-xs font-semibold text-slate-400">Semester 3</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Data Structures & Algorithms</h3>
                <p className="text-xs text-slate-500 mt-1">Class: II CSE - A • 62 Students</p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>4 / 5 Units Uploaded</span>
                <span className="text-amber-600 font-semibold">Unit 5 Pending</span>
              </div>
            </div>
          </div>

          {/* Quick Notice Draft Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-blue-50 text-[#0062A8] rounded-xl">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Broadcast Department Circular</h4>
                <p className="text-xs text-slate-500 mt-0.5">Publish lab test schedule or project review deadlines to students.</p>
              </div>
            </div>
            <Link
              to="/faculty/announcements"
              className="px-4 py-2 bg-[#0062A8] hover:bg-[#0B4A8F] text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
            >
              Post Notice
            </Link>
          </div>
        </div>

        {/* Right 1 Col: Department Recent Upload Activity */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#0062A8]" /> Recent Uploads & Activity
          </h3>

          <div className="divide-y divide-slate-100 text-xs space-y-3">
            <div className="pt-3 first:pt-0">
              <div className="font-semibold text-slate-800">DBMS Unit 4 Normalization Notes.pdf</div>
              <div className="flex items-center justify-between text-slate-400 mt-1">
                <span>Uploaded Today</span>
                <span className="text-emerald-600 font-medium">84 Views</span>
              </div>
            </div>

            <div className="pt-3">
              <div className="font-semibold text-slate-800">DSA 2025 Solved University Papers.pdf</div>
              <div className="flex items-center justify-between text-slate-400 mt-1">
                <span>Uploaded 2 days ago</span>
                <span className="text-emerald-600 font-medium">192 Views</span>
              </div>
            </div>

            <div className="pt-3">
              <div className="font-semibold text-slate-800">Python Lab Manual Cycle-1.pdf</div>
              <div className="flex items-center justify-between text-slate-400 mt-1">
                <span>Uploaded 5 days ago</span>
                <span className="text-emerald-600 font-medium">310 Views</span>
              </div>
            </div>
          </div>

          <Link
            to="/faculty/students"
            className="block text-center w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
          >
            View Student Performance Roster →
          </Link>
        </div>
      </div>
    </div>
  );
}
