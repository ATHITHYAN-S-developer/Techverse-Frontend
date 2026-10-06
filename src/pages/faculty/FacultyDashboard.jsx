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
  GraduationCap,
  ArrowRight,
  UserCheck,
  Layers,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../services/api";
import { courseService } from "../../services/courseService";

// ── Helpers ────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  if (!dateStr) return "—";
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
    indigo: { bg: "bg-indigo-50", text: "text-indigo-700", ring: "ring-indigo-200" },
  };
  const c = colors[color] || colors.blue;
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3 transition-all hover:shadow-md hover:border-slate-300">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={`p-2.5 rounded-xl ${c.bg} ring-1 ${c.ring}`}>
          <Icon className={`w-4 h-4 ${c.text}`} />
        </div>
      </div>
      {loading ? (
        <div className="h-8 w-20 bg-slate-100 animate-pulse rounded-lg" />
      ) : (
        <div className="text-2xl font-black text-slate-900">{value ?? "—"}</div>
      )}
      <div className="text-xs text-slate-500 truncate">{subtitle}</div>
      {trend && (
        <div className={`text-[11px] font-semibold ${trendPositive ? "text-emerald-600" : "text-rose-500"}`}>
          {trendPositive ? "▲" : "▼"} {trend}
        </div>
      )}
    </div>
  );
}

export default function FacultyDashboard() {
  const { user } = useAuth();

  const [studentCount, setStudentCount] = useState(null);
  const [facultyCount, setFacultyCount] = useState(null);
  const [facultyList, setFacultyList] = useState([]);
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [coursesCount, setCoursesCount] = useState(null);
  const [resources, setResources] = useState([]);
  const [resourcesCount, setResourcesCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const staffId = String(user?.staffId || user?.facultyId || "").toUpperCase();

  // Role detection: HOD check
  const isHod =
    staffId.includes("104") ||
    staffId.includes("HOD") ||
    user?.role === "hod" ||
    user?.title?.toLowerCase().includes("hod") ||
    user?.title?.toLowerCase().includes("head of the department") ||
    user?.designation?.toLowerCase().includes("hod") ||
    user?.designation?.toLowerCase().includes("head of the department") ||
    user?.isHod === true;

  const designationText = isHod
    ? "Head of the Department (HOD)"
    : (user?.designation || "Assistant Professor");

  const deptCode =
    user?.departmentId?.code ||
    (typeof user?.departmentId === "string" && user.departmentId.length <= 6 ? user.departmentId.toUpperCase() : null) ||
    user?.department ||
    user?.departmentCode ||
    (staffId.includes("CSE") ? "CSE" : staffId.includes("AIDS") ? "AI&DS" : staffId.includes("IT") ? "IT" : null);

  const deptName =
    user?.departmentId?.name ||
    (deptCode === "CSE" ? "Computer Science & Engineering" : null) ||
    (deptCode === "AI&DS" ? "Artificial Intelligence & Data Science" : null) ||
    (deptCode === "IT" ? "Information Technology" : null) ||
    deptCode ||
    "Department";

  const deptLabel = deptCode || deptName;

  const loadDashboard = () => {
    let alive = true;
    async function fetchAll() {
      setLoading(true);
      setError(null);
      try {
        if (isHod) {
          // HOD: Fetch department-wide statistics
          let deptData = null;
          try {
            deptData = await apiRequest(`/users/department-stats`);
          } catch {
            // fallback handled below
          }

          if (deptData && deptData.success) {
            if (alive) {
              setStudentCount(deptData.stats?.totalStudents ?? deptData.studentCount);
              setFacultyCount(deptData.stats?.totalFaculty ?? deptData.facultyCount);
              setFacultyList(deptData.facultyList || []);
              setResourcesCount(deptData.stats?.totalResources ?? deptData.resourceCount);
              setCoursesCount(deptData.stats?.totalCourses ?? deptData.courseCount);
              setResources(deptData.recentResources || []);
              setAssignedCourses(deptData.courses || []);
            }
          } else {
            // Direct query fallback for HOD
            const deptId = user?.departmentId?._id || user?.departmentId || "";
            const [stuRes, facRes, crsRes, resRes] = await Promise.all([
              apiRequest(`/users?role=student${deptId ? `&departmentId=${deptId}` : ""}&limit=1`),
              apiRequest(`/users?role=faculty${deptId ? `&departmentId=${deptId}` : ""}&limit=50`),
              courseService.getMyCourses().catch(() => []),
              apiRequest(`/resources?all=true&limit=20`).catch(() => []),
            ]);

            if (alive) {
              setStudentCount(stuRes?.pagination?.total ?? stuRes?.users?.length ?? 0);
              const facs = facRes?.users || [];
              setFacultyCount(facRes?.pagination?.total ?? facs.length);
              setFacultyList(facs);
              const courseList = Array.isArray(crsRes) ? crsRes : crsRes?.courses || [];
              setAssignedCourses(courseList);
              setCoursesCount(courseList.length);
              const rList = Array.isArray(resRes) ? resRes : resRes?.resources || [];
              setResources(rList);
              setResourcesCount(rList.length);
            }
          }
        } else {
          // Faculty Member: Only sees their own uploaded resources and assigned courses, plus department students count
          let facData = null;
          try {
            facData = await apiRequest(`/users/faculty-stats`);
          } catch {
            // fallback handled below
          }

          if (facData && facData.success) {
            if (alive) {
              setStudentCount(facData.stats?.totalDepartmentStudents ?? facData.studentCount);
              setFacultyCount(null); // Faculty does NOT see faculty count
              setResourcesCount(facData.stats?.myTotalResources ?? facData.resourceCount);
              setCoursesCount(facData.stats?.myTotalCourses ?? facData.courseCount);
              setResources(facData.myRecentResources || []);
              setAssignedCourses(facData.myCourses || []);
            }
          } else {
            // Direct query fallback for faculty
            const deptId = user?.departmentId?._id || user?.departmentId || "";
            const myId = user?._id || user?.id || "";

            const [stuRes, crsRes, resRes] = await Promise.all([
              apiRequest(`/users?role=student${deptId ? `&departmentId=${deptId}` : ""}&limit=1`),
              courseService.getMyCourses().catch(() => []),
              apiRequest(`/resources?all=true&limit=100`).catch(() => []),
            ]);

            if (alive) {
              setStudentCount(stuRes?.pagination?.total ?? stuRes?.users?.length ?? 0);
              setFacultyCount(null); // Never show faculty count to regular faculty
              const courseList = Array.isArray(crsRes) ? crsRes : crsRes?.courses || [];
              setAssignedCourses(courseList);
              setCoursesCount(courseList.length);

              const allResources = Array.isArray(resRes) ? resRes : resRes?.resources || [];
              const myResources = myId
                ? allResources.filter((r) => {
                    const uid = r.uploadedBy?._id || r.uploadedBy?.id || r.uploadedBy;
                    return String(uid) === String(myId);
                  })
                : allResources;

              setResources(myResources);
              setResourcesCount(myResources.length);
            }
          }
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* 1. Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0B4A8F] via-[#0062A8] to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-sky-100 border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-200" />
              <span>{isHod ? "Head of the Department" : deptName}</span>
            </div>
            {isHod && deptCode && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-sky-100 border border-white/15">
                <span>{deptCode}</span>
              </div>
            )}
            {/* HOD only: sees Department Faculty count */}
            {isHod && facultyCount !== null && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-sky-100 border border-white/15">
                <GraduationCap className="w-3.5 h-3.5 text-sky-300" />
                <span>{facultyCount} Department Faculty</span>
              </div>
            )}
            {/* Both see Department Students count */}
            {studentCount !== null && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-sky-100 border border-white/15">
                <Users className="w-3.5 h-3.5 text-amber-300" />
                <span>{studentCount} Department Students</span>
              </div>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome, {user?.name || (isHod ? "Head of the Department" : "Faculty Member")}
          </h1>
          <p className="text-sky-100 text-sm mt-1 max-w-xl">
            {designationText}
            {staffId ? ` • Staff ID: ${staffId}` : user?.email ? ` • ${user.email}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {isHod ? (
            <Link
              to="/faculty/courses"
              className="px-4 py-2.5 rounded-2xl bg-white text-[#0B4A8F] font-bold text-xs hover:bg-sky-50 shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Course</span>
            </Link>
          ) : (
            <Link
              to="/faculty/resources"
              className="px-4 py-2.5 rounded-2xl bg-white text-[#0B4A8F] font-bold text-xs hover:bg-sky-50 shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Resource</span>
            </Link>
          )}
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

      {/* 2. Stat Cards - Tailored for HOD vs Faculty */}
      {isHod ? (
        /* HOD View: 4 Comprehensive Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Department Students"
            value={studentCount ?? "—"}
            subtitle={`${deptLabel} enrolled students`}
            icon={Users}
            color="amber"
            loading={loading}
          />
          <StatCard
            title="Department Faculty"
            value={facultyCount ?? "—"}
            subtitle={`${deptLabel} faculty members`}
            icon={GraduationCap}
            color="indigo"
            loading={loading}
          />
          <StatCard
            title="Department Courses"
            value={coursesCount ?? assignedCourses.length}
            subtitle="Courses created / assigned"
            icon={BookOpen}
            color="blue"
            loading={loading}
          />
          <StatCard
            title="Department Resources"
            value={resourcesCount ?? resources.length}
            subtitle="Uploaded academic materials"
            icon={FileText}
            color="emerald"
            loading={loading}
          />
        </div>
      ) : (
        /* Faculty View: 3 Focused Cards (No faculty count) */
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Department Students"
            value={studentCount ?? "—"}
            subtitle={`${deptLabel} total students`}
            icon={Users}
            color="amber"
            loading={loading}
          />
          <StatCard
            title="My Assigned Courses"
            value={coursesCount ?? assignedCourses.length}
            subtitle="Courses managed by you"
            icon={BookOpen}
            color="indigo"
            loading={loading}
          />
          <StatCard
            title="My Uploaded Resources"
            value={resourcesCount ?? resources.length}
            subtitle="Your uploaded materials"
            icon={FileText}
            color="blue"
            loading={loading}
          />
        </div>
      )}

      {/* 3. Main Dashboard Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 Cols: Courses Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#0062A8]" />
              {isHod ? "Department Courses & Assignments" : "Your Assigned Courses"}
            </h2>
            {isHod ? (
              <Link to="/faculty/courses" className="text-xs font-semibold text-[#0062A8] hover:underline flex items-center gap-1">
                Manage & Assign Courses <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link to="/faculty/modules" className="text-xs font-semibold text-[#0062A8] hover:underline flex items-center gap-1">
                Manage Modules & Syllabus <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse h-36" />
              ))}
            </div>
          ) : assignedCourses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 space-y-3">
              <BookOpen className="w-10 h-10 mx-auto opacity-30 text-[#0062A8]" />
              <p className="text-sm font-semibold text-slate-700">
                {isHod ? "No courses created in this department yet" : "No courses assigned to you yet"}
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {isHod
                  ? "As the Head of Department, click Create Course to define courses and assign faculty members to manage modules."
                  : "Once the Head of Department (HOD) assigns a course to you, it will appear here so you can add modules, video lectures, and coding challenges."}
              </p>
              {isHod && (
                <Link
                  to="/faculty/courses"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0062A8] hover:bg-[#0B4A8F] text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Create New Course
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignedCourses.map((c) => {
                const courseId = c._id || c.id;
                const assignedName =
                  c.assignedFacultyName ||
                  c.assignedFacultyId?.name ||
                  (isHod ? "Unassigned" : user?.name);

                return (
                  <div
                    key={courseId}
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3 hover:border-blue-200 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#0062A8] border border-blue-200">
                          {c.category || "Course"}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                          {c.level || "All Levels"}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{c.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {c.description || "Course modules management."}
                      </p>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                      {isHod && (
                        <div className="flex items-center justify-between text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg text-[11px]">
                          <span className="font-semibold text-slate-500">Assigned Faculty:</span>
                          <span className="font-bold text-[#0062A8] truncate max-w-[150px]">
                            {assignedName}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">
                          {c.totalModules || c.modulesCount || 0} Modules
                        </span>
                        <Link
                          to={`/faculty/modules?courseId=${courseId}`}
                          className="text-[#0062A8] font-bold hover:underline"
                        >
                          Manage Modules →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* HOD Specific: Department Faculty Directory Card */}
          {isHod && facultyList.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Department Faculty Roster ({facultyList.length})
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Faculty members eligible for course assignment in {deptLabel}
                    </p>
                  </div>
                </div>
                <Link
                  to="/faculty/courses"
                  className="text-xs font-semibold text-[#0062A8] hover:underline"
                >
                  Assign Courses →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {facultyList.slice(0, 6).map((fac) => (
                  <div
                    key={fac._id || fac.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#0062A8]/10 text-[#0062A8] font-bold flex items-center justify-center text-xs shrink-0">
                      {fac.name?.charAt(0) || "F"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-slate-800 truncate">{fac.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {fac.staffId || fac.designation || "Faculty"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Broadcast Circular Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-blue-50 text-[#0062A8] rounded-xl">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Broadcast Department Circular</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Publish lab test schedules, project review deadlines, or workshop notices to students.
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

        {/* Right Col: Recent Resources & Quick Links */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#0062A8]" />
                {isHod ? "Recent Department Uploads" : "Your Recent Uploads"}
              </h3>
              <Link to="/faculty/resources" className="text-xs font-semibold text-[#0062A8] hover:underline">
                View All →
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : resources.length === 0 ? (
              <div className="text-center text-slate-400 py-6">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-semibold">No resources uploaded yet.</p>
                <Link
                  to="/faculty/resources"
                  className="inline-block mt-3 text-[11px] font-bold text-[#0062A8] hover:underline"
                >
                  Upload your first resource →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {resources.slice(0, 5).map((r) => {
                  const uploaderName = r.uploadedBy?.name || "Faculty";
                  return (
                    <div key={r._id || r.id} className="py-3 first:pt-0">
                      <div className="font-semibold text-slate-800 truncate" title={r.title || r.name}>
                        {r.title || r.name || "Untitled"}
                      </div>
                      <div className="flex items-center justify-between text-slate-400 mt-1">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Clock className="w-3 h-3" />
                          {timeAgo(r.createdAt)}
                          {isHod && r.uploadedBy && (
                            <span className="text-slate-500 font-medium ml-1">
                              • by {uploaderName}
                            </span>
                          )}
                        </span>
                        <span className="flex items-center gap-1 text-emerald-600 font-medium text-[11px]">
                          <Download className="w-3 h-3" />
                          {(r.downloadsCount || 0)} DL
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-1 flex-wrap">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-[#0062A8] font-bold">
                          {RESOURCE_TYPE_LABELS[r.type] || r.type || "Resource"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <Link
              to="/faculty/students"
              className="block text-center w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
            >
              View Student Directory →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
