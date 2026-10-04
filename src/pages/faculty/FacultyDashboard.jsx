import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Megaphone,
  Users,
  BookOpen,
  Plus,
  ShieldCheck,
  TrendingUp,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Building2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../services/api";

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function timeAgo(dateStr) {
  if (!dateStr) return "â€”";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const RESOURCE_TYPE_LABELS = {
  notes: "Lecture Notes",
  question_bank: "Question Bank",
  previous_paper: "Previous Paper",
  lab_manual: "Lab Manual",
  software: "Software",
  syllabus: "Syllabus",
  reference: "Reference",
  video: "Video",
  website: "Link",
  project: "Project",
};

function StatCard({ title, value, subtitle, icon: Icon, trend, trendPositive, color = "blue", loading }) {
  const colors = {
    blue: { bg: "bg-blue-50", text: "text-[#0062A8]", ring: "ring-blue-200" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200" },
    amber: { bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200" },
    purple: { bg: "bg-purple-50", text: "text-purple-700", ring: "ring-purple-200" },
  };
  const c = colors[color] || colors.blue;
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={`p-2 rounded-xl ${c.bg} ring-1 ${c.ring}`}>
          <Icon className={`w-4 h-4 ${c.text}`} />
        </div>
      </div>
      {loading ? (
        <div className="h-8 w-20 bg-slate-100 animate-pulse rounded-lg" />
      ) : (
        <div className="text-2xl font-black text-slate-900">{value ?? "â€”"}</div>
      )}
      <div className="text-xs text-slate-500 truncate">{subtitle}</div>
      {trend && (
        <div className={`text-[11px] font-semibold ${trendPositive ? "text-emerald-600" : "text-rose-500"}`}>
          {trendPositive ? "â–²" : "â–¼"} {trend}
        </div>
      )}
    </div>
  );
}

export default function FacultyDashboard() {
  const { user } = useAuth();

  const [subjects, setSubjects] = useState([]);
  const [studentCount, setStudentCount] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = () => {
    let alive = true;
    async function fetchAll() {
      setLoading(true);
      setError(null);
      try {
        const deptId =
          user?.departmentId?._id || user?.departmentId || "";
        const myId = user?._id || user?.id || "";

        // 1. Subjects in teacher's department
        const subjectsRes = await apiRequest(
          `/subjects${deptId ? `?departmentId=${deptId}` : ""}`
        );
        const allSubjects = Array.isArray(subjectsRes)
          ? subjectsRes
          : subjectsRes?.subjects || subjectsRes?.data || [];

        // Keep only subjects where this teacher is assigned
        const mySubjects = myId
          ? allSubjects.filter((s) =>
              Array.isArray(s.assignedTeachers) &&
              s.assignedTeachers.some(
                (t) => String(t._id || t.id || t) === String(myId)
              )
            )
          : allSubjects;

        // 2. Student count for this department
        const studentsRes = await apiRequest(
          `/users?role=student${deptId ? `&departmentId=${deptId}` : ""}&limit=1`
        );
        const total =
          studentsRes?.pagination?.total ??
          (Array.isArray(studentsRes?.users) ? studentsRes.users.length : null);

        // 3. All resources (we filter by uploader client-side)
        const resRes = await apiRequest(`/resources?all=true&limit=100`);
        const allResources = Array.isArray(resRes)
          ? resRes
          : resRes?.resources || resRes?.data || [];

        const myResources = myId
          ? allResources.filter((r) => {
              const uid = r.uploadedBy?._id || r.uploadedBy?.id || r.uploadedBy;
              return String(uid) === String(myId);
            })
          : allResources;

        if (alive) {
          setSubjects(mySubjects);
          setStudentCount(total);
          setResources(myResources);
        }
      } catch (err) {
        if (alive) setError(err.message || "Failed to load dashboard data.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    fetchAll();
    return () => { alive = false; };
  };

  useEffect(loadDashboard, [user]);

  // Derived stats
  const totalDownloads = resources.reduce((acc, r) => acc + (r.downloadsCount || 0), 0);
  const recentResources = [...resources]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const deptLabel =
    user?.departmentId?.name ||
    user?.departmentId?.code ||
    user?.department ||
    "Department";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* 1. Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0B4A8F] via-[#0062A8] to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-sky-100 mb-3 border border-white/20">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-200" />
            <span>{deptLabel}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome, {user?.name || "Faculty"}
          </h1>
          <p className="text-sky-100 text-sm mt-1 max-w-xl">
            {user?.designation || "Assistant Professor"}
            {user?.staffId ? ` â€¢ Staff ID: ${user.staffId}` : user?.email ? ` â€¢ ${user.email}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/faculty/resources"
            className="px-4 py-2.5 rounded-2xl bg-white text-[#0B4A8F] font-bold text-xs hover:bg-sky-50 shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Resource</span>
          </Link>
          <Link
            to="/faculty/announcements"
            className="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-semibold text-xs backdrop-blur-md border border-white/20 transition-colors"
          >
            Create Notice
          </Link>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-5 py-3 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button
            onClick={loadDashboard}
            className="ml-auto text-xs font-semibold flex items-center gap-1 hover:underline"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* 2. Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Resources Uploaded"
          value={resources.length}
          subtitle={`${deptLabel} Notes, QBs & More`}
          icon={FileText}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="Assigned Subjects"
          value={subjects.length}
          subtitle={
            subjects.length > 0
              ? subjects.map((s) => s.code).join(", ")
              : "No subjects assigned yet"
          }
          icon={BookOpen}
          color="emerald"
          loading={loading}
        />
        <StatCard
          title="Department Students"
          value={studentCount ?? "â€”"}
          subtitle={`${deptLabel} roster`}
          icon={Users}
          color="amber"
          loading={loading}
        />
        <StatCard
          title="Total Downloads"
          value={totalDownloads.toLocaleString("en-IN")}
          subtitle="Across all your resources"
          icon={Download}
          color="purple"
          loading={loading}
        />
      </div>

      {/* 3. Subjects + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 cols: Assigned Subjects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#0062A8]" /> Your Assigned Subjects
            </h2>
            <Link to="/faculty/subjects" className="text-xs font-semibold text-[#0062A8] hover:underline">
              Manage Subjects â†’
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse h-32" />
              ))}
            </div>
          ) : subjects.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-semibold">No subjects assigned yet.</p>
              <p className="text-xs mt-1">Ask your admin to assign subjects to your profile.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjects.map((subj) => {
                const subjectResources = resources.filter(
                  (r) => String(r.subjectId?._id || r.subjectId) === String(subj._id)
                );
                const uploadedCount = subjectResources.length;
                const complete = uploadedCount > 0;

                return (
                  <div
                    key={subj._id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-[#0062A8] border border-blue-200">
                        {subj.code}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        Sem {subj.semester}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{subj.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {subj.departmentId?.name || subj.departmentId?.code || deptLabel}
                        {subj.credits ? ` â€¢ ${subj.credits} Credits` : ""}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <span>{uploadedCount} Resources</span>
                      {complete ? (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Resources Added
                        </span>
                      ) : (
                        <span className="text-amber-600 font-semibold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> None yet
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Broadcast Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-blue-50 text-[#0062A8] rounded-xl">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Broadcast Department Circular</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Publish lab test schedules or project review deadlines to students.
                </p>
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

        {/* Right col: Recent Uploads */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#0062A8]" /> Recent Uploads
          </h3>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentResources.length === 0 ? (
            <div className="text-center text-slate-400 py-6">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs font-semibold">No resources uploaded yet.</p>
              <Link
                to="/faculty/resources"
                className="inline-block mt-3 text-[11px] font-bold text-[#0062A8] hover:underline"
              >
                Upload your first resource â†’
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {recentResources.map((r) => (
                <div key={r._id || r.id} className="py-3 first:pt-0">
                  <div className="font-semibold text-slate-800 truncate" title={r.title || r.name}>
                    {r.title || r.name || "Untitled"}
                  </div>
                  <div className="flex items-center justify-between text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timeAgo(r.createdAt)}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      <Download className="w-3 h-3" />
                      {(r.downloadsCount || 0)} DL
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-1 flex-wrap">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-[#0062A8] font-bold">
                      {RESOURCE_TYPE_LABELS[r.type] || r.type || "Resource"}
                    </span>
                    {r.subjectId?.code && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-semibold">
                        {r.subjectId.code}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <Link
            to="/faculty/students"
            className="block text-center w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
          >
            View Student Roster â†’
          </Link>
        </div>
      </div>
    </div>
  );
}
