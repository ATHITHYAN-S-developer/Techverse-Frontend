import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
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
  UserX,
  Code2,
  FileSpreadsheet,
  Search,
  Filter,
  Check,
  X,
  Sparkles,
  BookCheck,
  BookX,
  PieChart,
  BarChart3,
  Layers,
  ChevronRight,
  ExternalLink,
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

function StatCard({ title, value, subtitle, icon: Icon, trend, trendPositive, color = "blue", loading }) {
  const colors = {
    blue: { bg: "bg-blue-50", text: "text-vcet-blue", ring: "ring-blue-200" },
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

  // Department Analytics state
  const [studentAnalytics, setStudentAnalytics] = useState(null);
  const [facultyAnalytics, setFacultyAnalytics] = useState(null);

  // Tab & Filters state
  const [activeTab, setActiveTab] = useState("students"); // "students" | "faculty"
  const [studentSearch, setStudentSearch] = useState("");
  const [studentFilter, setStudentFilter] = useState("all"); // "all" | "loggedin" | "pending"
  const [facultySearch, setFacultySearch] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("all"); // "all" | "created" | "pending"

  // Pagination for students
  const [studentPage, setStudentPage] = useState(1);
  const pageSize = 12;

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
          // HOD: Fetch department-wide statistics & analytics
          let deptData = null;
          try {
            deptData = await apiRequest(`/users/department-stats`);
          } catch (e) {
            console.warn("HOD department-stats request fallback:", e);
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
              setStudentAnalytics(deptData.studentAnalytics || null);
              setFacultyAnalytics(deptData.facultyAnalytics || null);
            }
          } else {
            // Direct query fallback for HOD
            const deptId = user?.departmentId?._id || user?.departmentId || "";
            const [stuRes, facRes, crsRes, resRes] = await Promise.all([
              apiRequest(`/users?role=student${deptId ? `&departmentId=${deptId}` : ""}&limit=1000`),
              apiRequest(`/users?role=faculty${deptId ? `&departmentId=${deptId}` : ""}&limit=100`),
              courseService.getMyCourses().catch(() => []),
              apiRequest(`/resources?all=true&limit=20`).catch(() => []),
            ]);

            if (alive) {
              const students = stuRes?.users || [];
              const sTotal = stuRes?.pagination?.total ?? students.length;
              setStudentCount(sTotal);
              const facs = facRes?.users || [];
              setFacultyCount(facRes?.pagination?.total ?? facs.length);
              setFacultyList(facs);
              const courseList = Array.isArray(crsRes) ? crsRes : crsRes?.courses || [];
              setAssignedCourses(courseList);
              setCoursesCount(courseList.length);
              const rList = Array.isArray(resRes) ? resRes : resRes?.resources || [];
              setResources(rList);
              setResourcesCount(rList.length);

              // Compute fallback analytics
              const loggedIn = students.filter((s) => s.lastLoginAt);
              setStudentAnalytics({
                totalStudents: sTotal,
                loggedInCount: loggedIn.length,
                remainingCount: Math.max(0, sTotal - loggedIn.length),
                loginPercentage: sTotal > 0 ? Math.round((loggedIn.length / sTotal) * 100) : 0,
                students: students.map((s) => ({
                  id: s._id,
                  name: s.name,
                  registerNumber: s.registerNumber || "—",
                  email: s.email,
                  year: s.year || "—",
                  semester: s.semester || "—",
                  section: s.section || "—",
                  hasLoggedIn: Boolean(s.lastLoginAt),
                  lastLoginAt: s.lastLoginAt || null,
                })),
              });

              setFacultyAnalytics({
                totalFaculty: facs.length,
                createdCount: courseList.length > 0 ? 1 : 0,
                notCreatedCount: Math.max(0, facs.length - (courseList.length > 0 ? 1 : 0)),
                creationPercentage: facs.length > 0 ? Math.round(((courseList.length > 0 ? 1 : 0) / facs.length) * 100) : 0,
                faculty: facs.map((f) => ({
                  ...f,
                  coursesCreatedCount: courseList.filter((c) => String(c.createdBy) === String(f._id)).length,
                  hasCreatedCourse: courseList.some((c) => String(c.createdBy) === String(f._id)),
                })),
              });
            }
          }
        } else {
          // Faculty Member: Sees stats and department analytics
          let facData = null;
          try {
            facData = await apiRequest(`/users/faculty-stats`);
          } catch (e) {
            console.warn("Faculty stats request fallback:", e);
          }

          if (facData && facData.success) {
            if (alive) {
              setStudentCount(facData.stats?.totalDepartmentStudents ?? facData.studentCount);
              setFacultyCount(facData.facultyAnalytics?.totalFaculty ?? null);
              setResourcesCount(facData.stats?.myTotalResources ?? facData.resourceCount);
              setCoursesCount(facData.stats?.myTotalCourses ?? facData.courseCount);
              setResources(facData.myRecentResources || []);
              setAssignedCourses(facData.myCourses || []);
              setStudentAnalytics(facData.studentAnalytics || null);
              setFacultyAnalytics(facData.facultyAnalytics || null);
            }
          } else {
            // Direct query fallback for faculty
            const deptId = user?.departmentId?._id || user?.departmentId || "";
            const myId = user?._id || user?.id || "";

            const [stuRes, crsRes, resRes] = await Promise.all([
              apiRequest(`/users?role=student${deptId ? `&departmentId=${deptId}` : ""}&limit=1000`),
              courseService.getMyCourses().catch(() => []),
              apiRequest(`/resources?all=true&limit=100`).catch(() => []),
            ]);

            if (alive) {
              const students = stuRes?.users || [];
              const sTotal = stuRes?.pagination?.total ?? students.length;
              setStudentCount(sTotal);
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

              const loggedIn = students.filter((s) => s.lastLoginAt);
              setStudentAnalytics({
                totalStudents: sTotal,
                loggedInCount: loggedIn.length,
                remainingCount: Math.max(0, sTotal - loggedIn.length),
                loginPercentage: sTotal > 0 ? Math.round((loggedIn.length / sTotal) * 100) : 0,
                students: students.map((s) => ({
                  id: s._id,
                  name: s.name,
                  registerNumber: s.registerNumber || "—",
                  email: s.email,
                  year: s.year || "—",
                  semester: s.semester || "—",
                  section: s.section || "—",
                  hasLoggedIn: Boolean(s.lastLoginAt),
                  lastLoginAt: s.lastLoginAt || null,
                })),
              });
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

  // ── Filtered Student List ───────────────────────────────────────────
  const filteredStudents = useMemo(() => {
    if (!studentAnalytics?.students) return [];
    return studentAnalytics.students.filter((s) => {
      // Filter by status
      if (studentFilter === "loggedin" && !s.hasLoggedIn) return false;
      if (studentFilter === "pending" && s.hasLoggedIn) return false;

      // Filter by search query
      if (studentSearch.trim()) {
        const q = studentSearch.toLowerCase();
        const name = (s.name || "").toLowerCase();
        const reg = (s.registerNumber || "").toLowerCase();
        const email = (s.email || "").toLowerCase();
        const sec = (s.section || "").toLowerCase();
        return name.includes(q) || reg.includes(q) || email.includes(q) || sec.includes(q);
      }
      return true;
    });
  }, [studentAnalytics, studentFilter, studentSearch]);

  const paginatedStudents = useMemo(() => {
    const start = (studentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, studentPage]);

  const totalStudentPages = Math.ceil(filteredStudents.length / pageSize) || 1;

  // ── Filtered Faculty List ───────────────────────────────────────────
  const filteredFaculty = useMemo(() => {
    if (!facultyAnalytics?.faculty) return [];
    return facultyAnalytics.faculty.filter((f) => {
      // Filter by status
      if (facultyFilter === "created" && !f.hasCreatedCourse) return false;
      if (facultyFilter === "pending" && f.hasCreatedCourse) return false;

      // Filter by search query
      if (facultySearch.trim()) {
        const q = facultySearch.toLowerCase();
        const name = (f.name || "").toLowerCase();
        const staff = (f.staffId || "").toLowerCase();
        const desig = (f.designation || "").toLowerCase();
        return name.includes(q) || staff.includes(q) || desig.includes(q);
      }
      return true;
    });
  }, [facultyAnalytics, facultyFilter, facultySearch]);

  // ── Download Department Report (CSV) ────────────────────────────────
  const downloadAnalyticsReport = (type = "full") => {
    const dateStr = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const timeStr = new Date().toLocaleTimeString("en-IN");
    const filename = `VCET_${deptCode || "Department"}_Analytics_Report_${new Date().toISOString().slice(0, 10)}.csv`;

    let csvContent = "\uFEFF"; // UTF-8 BOM for MS Excel compatibility

    csvContent += `"VELALAR COLLEGE OF ENGINEERING AND TECHNOLOGY (AUTONOMOUS)"\n`;
    csvContent += `"DEPARTMENT ANALYTICS & ONBOARDING PERFORMANCE REPORT"\n`;
    csvContent += `"Department:","${deptName} (${deptCode || ""})"\n`;
    csvContent += `"Generated By:","${user?.name || "HOD / Faculty"} (${staffId || ""})"\n`;
    csvContent += `"Generated On:","${dateStr} ${timeStr}"\n\n`;

    // 1. Executive Summary
    csvContent += `"--- EXECUTIVE SUMMARY ---"\n`;
    csvContent += `"Metric","Count","Percentage / Adoption"\n`;
    csvContent += `"Total Enrolled Department Students","${studentAnalytics?.totalStudents ?? studentCount ?? 0}","100%"\n`;
    csvContent += `"First-Time Logged In Students (Active)","${studentAnalytics?.loggedInCount ?? 0}","${studentAnalytics?.loginPercentage ?? 0}%"\n`;
    csvContent += `"Remaining Students (Pending First Login)","${studentAnalytics?.remainingCount ?? 0}","${100 - (studentAnalytics?.loginPercentage ?? 0)}%"\n`;
    csvContent += `"Total Department Faculty Members","${facultyAnalytics?.totalFaculty ?? facultyCount ?? 0}","100%"\n`;
    csvContent += `"Faculty Who Created Courses","${facultyAnalytics?.createdCount ?? 0}","${facultyAnalytics?.creationPercentage ?? 0}%"\n`;
    csvContent += `"Faculty Pending Course Creation","${facultyAnalytics?.notCreatedCount ?? 0}","${100 - (facultyAnalytics?.creationPercentage ?? 0)}%"\n\n`;

    // 2. Student Login Status List
    if (type === "full" || type === "students") {
      csvContent += `"--- SECTION 1: STUDENT FIRST-LOGIN & ACTIVATION ROSTER ---"\n`;
      csvContent += `"S.No","Register Number","Student Name","Email","Year","Semester","Section","Login Status","Last Login Date & Time"\n`;
      (studentAnalytics?.students || []).forEach((s, idx) => {
        const loginStatus = s.hasLoggedIn ? "Logged In (Active)" : "Pending First Login";
        const loginTime = s.lastLoginAt ? new Date(s.lastLoginAt).toLocaleString("en-IN") : "Never Logged In";
        csvContent += `"${idx + 1}","${s.registerNumber}","${(s.name || "").replace(/"/g, '""')}","${s.email}","${s.year}","${s.semester}","${s.section}","${loginStatus}","${loginTime}"\n`;
      });
      csvContent += `\n`;
    }

    // 3. Faculty Course Creation List
    if (type === "full" || type === "faculty") {
      csvContent += `"--- SECTION 2: FACULTY COURSE CREATION REPORT ---"\n`;
      csvContent += `"S.No","Staff ID","Faculty Name","Designation","Email","Courses Created Count","Assigned Courses Count","Created Course Titles","Status"\n`;
      (facultyAnalytics?.faculty || []).forEach((f, idx) => {
        const titles = (f.createdCourseTitles || []).join(" | ");
        const status = f.hasCreatedCourse ? "Course Created" : "Pending Course Creation";
        csvContent += `"${idx + 1}","${f.staffId || "—"}","${(f.name || "").replace(/"/g, '""')}","${f.designation || "—"}","${f.email}","${f.coursesCreatedCount || 0}","${f.assignedCoursesCount || 0}","${titles.replace(/"/g, '""')}","${status}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">

      {/* 1. Welcome Banner */}
      <div className="bg-gradient-to-r from-vcet-blue-deep via-vcet-blue to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {isHod ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/70 backdrop-blur-md text-xs font-bold text-white border border-white/20 shadow-sm">
                <div className="w-4 h-4 rounded-full bg-white/20 text-white flex items-center justify-center font-bold">
                  <ShieldCheck className="w-3 h-3 stroke-[2.5]" />
                </div>
                <span>Head of the Department</span>
                <span className="w-1 h-1 rounded-full bg-slate-400" />
                <span className="px-1.5 py-0.2 rounded bg-white/15 text-white font-black text-[10px] uppercase border border-white/10">
                  {deptCode || "CSE"}
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-white border border-white/20">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
                <span>{deptName}</span>
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
              className="px-4 py-2.5 rounded-2xl bg-white text-vcet-blue-deep font-bold text-xs hover:bg-sky-50 shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Course</span>
            </Link>
          ) : (
            <Link
              to="/faculty/resources"
              className="px-4 py-2.5 rounded-2xl bg-white text-vcet-blue-deep font-bold text-xs hover:bg-sky-50 shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Resource</span>
            </Link>
          )}
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
        /* Faculty View: 3 Focused Cards */
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

      {/* 3. Department Analysis & Onboarding Report (Replaces Workspace Hub) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden space-y-6 p-6 sm:p-8">
        {/* Analytics Header & Download Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-vcet-blue text-xs font-bold mb-2">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Department Intelligence & Analytics</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {deptLabel} Performance & Onboarding Analytics
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Track student first-login activation status and faculty course creation progress across the department.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => downloadAnalyticsReport("full")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all hover:shadow"
              title="Download complete report containing student login status and faculty course creation records"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download Full Report (CSV)</span>
            </button>
          </div>
        </div>

        {/* Tab Selection Switcher */}
        <div className="flex items-center gap-3 border-b border-slate-200/80 pb-px">
          <button
            onClick={() => setActiveTab("students")}
            className={`pb-3 text-xs sm:text-sm font-bold transition-all relative flex items-center gap-2 ${
              activeTab === "students"
                ? "text-vcet-blue"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Student First-Login Status</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === "students"
                  ? "bg-blue-100 text-vcet-blue"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {studentAnalytics?.loggedInCount ?? 0} / {studentAnalytics?.totalStudents ?? studentCount ?? 0}
            </span>
            {activeTab === "students" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-vcet-blue rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("faculty")}
            className={`pb-3 text-xs sm:text-sm font-bold transition-all relative flex items-center gap-2 ${
              activeTab === "faculty"
                ? "text-vcet-blue"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Faculty Course Creation</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === "faculty"
                  ? "bg-blue-100 text-vcet-blue"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {facultyAnalytics?.createdCount ?? 0} / {facultyAnalytics?.totalFaculty ?? facultyCount ?? 0}
            </span>
            {activeTab === "faculty" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-vcet-blue rounded-full" />
            )}
          </button>
        </div>

        {/* ── TAB 1: STUDENT LOGIN STATUS ─────────────────────────── */}
        {activeTab === "students" && (
          <div className="space-y-6">
            {/* KPI Cards for Student Login */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Card 1: Total Enrolled */}
              <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-5 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Total Department Students
                </span>
                <div className="text-2xl font-black text-slate-900">
                  {studentAnalytics?.totalStudents ?? studentCount ?? 0}
                </div>
                <div className="text-xs text-slate-500">
                  Enrolled under {deptLabel}
                </div>
              </div>

              {/* Card 2: First-Time Logged In */}
              <div className="bg-emerald-50/60 rounded-2xl border border-emerald-200/80 p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    First-Time Logged In (Active)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-black text-xs">
                    {studentAnalytics?.loginPercentage ?? 0}%
                  </span>
                </div>
                <div className="text-2xl font-black text-emerald-900">
                  {studentAnalytics?.loggedInCount ?? 0}
                </div>
                <div className="text-xs text-emerald-700">
                  Students who have activated their account
                </div>
              </div>

              {/* Card 3: Remaining / Pending First Login */}
              <div className="bg-amber-50/60 rounded-2xl border border-amber-200/80 p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                    Remaining (Pending First Login)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-black text-xs">
                    {100 - (studentAnalytics?.loginPercentage ?? 0)}%
                  </span>
                </div>
                <div className="text-2xl font-black text-amber-900">
                  {studentAnalytics?.remainingCount ?? 0}
                </div>
                <div className="text-xs text-amber-700">
                  Students yet to log in to the portal
                </div>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="bg-slate-50 border border-slate-200/70 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-vcet-blue" />
                  Student Onboarding Rate
                </span>
                <span>
                  {studentAnalytics?.loggedInCount ?? 0} of {studentAnalytics?.totalStudents ?? studentCount ?? 0} logged in ({studentAnalytics?.loginPercentage ?? 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${studentAnalytics?.loginPercentage ?? 0}%` }}
                />
              </div>
            </div>

            {/* Student Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => {
                    setStudentSearch(e.target.value);
                    setStudentPage(1);
                  }}
                  placeholder="Search by student name, register number..."
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-vcet-blue/30 focus:border-vcet-blue"
                />
                {studentSearch && (
                  <button
                    onClick={() => setStudentSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <button
                  onClick={() => {
                    setStudentFilter("all");
                    setStudentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    studentFilter === "all"
                      ? "bg-vcet-blue text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All ({studentAnalytics?.totalStudents ?? studentCount ?? 0})
                </button>
                <button
                  onClick={() => {
                    setStudentFilter("loggedin");
                    setStudentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    studentFilter === "loggedin"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Logged In ({studentAnalytics?.loggedInCount ?? 0})
                </button>
                <button
                  onClick={() => {
                    setStudentFilter("pending");
                    setStudentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    studentFilter === "pending"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Pending First Login ({studentAnalytics?.remainingCount ?? 0})
                </button>

                <button
                  onClick={() => downloadAnalyticsReport("students")}
                  className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors shrink-0"
                  title="Export student login status list"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Students Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="py-3 px-4">Register Number</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Year / Section</th>
                      <th className="py-3 px-4">First-Login Status</th>
                      <th className="py-3 px-4">Last Activity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedStudents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500">
                          No student records matching your search or filter.
                        </td>
                      </tr>
                    ) : (
                      paginatedStudents.map((s) => (
                        <tr key={s.id || s.registerNumber} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {s.registerNumber}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{s.name}</div>
                            <div className="text-[11px] text-slate-400">{s.email}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            Year {s.year} • Sec {s.section || "—"}
                          </td>
                          <td className="py-3 px-4">
                            {s.hasLoggedIn ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Logged In</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Pending First Login</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-[11px]">
                            {s.lastLoginAt ? new Date(s.lastLoginAt).toLocaleString("en-IN") : "Never logged in"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalStudentPages > 1 && (
                <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                  <div>
                    Showing {(studentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(studentPage * pageSize, filteredStudents.length)} of{" "}
                    {filteredStudents.length} students
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setStudentPage((p) => Math.max(1, p - 1))}
                      disabled={studentPage === 1}
                      className="px-2.5 py-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-white"
                    >
                      Prev
                    </button>
                    <span className="px-2 font-bold text-slate-900">
                      {studentPage} / {totalStudentPages}
                    </span>
                    <button
                      onClick={() => setStudentPage((p) => Math.min(totalStudentPages, p + 1))}
                      disabled={studentPage === totalStudentPages}
                      className="px-2.5 py-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-white"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 2: FACULTY COURSE CREATION ──────────────────────── */}
        {activeTab === "faculty" && (
          <div className="space-y-6">
            {/* KPI Cards for Faculty Course Creation */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Card 1: Total Faculty */}
              <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-5 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Total Department Faculty
                </span>
                <div className="text-2xl font-black text-slate-900">
                  {facultyAnalytics?.totalFaculty ?? facultyCount ?? 0}
                </div>
                <div className="text-xs text-slate-500">
                  Faculty members in {deptLabel}
                </div>
              </div>

              {/* Card 2: Faculty Created Course */}
              <div className="bg-indigo-50/60 rounded-2xl border border-indigo-200/80 p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800">
                    Faculty Created Courses
                  </span>
                  <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-black text-xs">
                    {facultyAnalytics?.creationPercentage ?? 0}%
                  </span>
                </div>
                <div className="text-2xl font-black text-indigo-900">
                  {facultyAnalytics?.createdCount ?? 0}
                </div>
                <div className="text-xs text-indigo-700">
                  Faculty who authored department courses
                </div>
              </div>

              {/* Card 3: Pending Course Creation */}
              <div className="bg-rose-50/60 rounded-2xl border border-rose-200/80 p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">
                    Pending Course Creation
                  </span>
                  <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-black text-xs">
                    {100 - (facultyAnalytics?.creationPercentage ?? 0)}%
                  </span>
                </div>
                <div className="text-2xl font-black text-rose-900">
                  {facultyAnalytics?.notCreatedCount ?? 0}
                </div>
                <div className="text-xs text-rose-700">
                  Faculty who have not created any course yet
                </div>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="bg-slate-50 border border-slate-200/70 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  Department Course Authoring Rate
                </span>
                <span>
                  {facultyAnalytics?.createdCount ?? 0} of {facultyAnalytics?.totalFaculty ?? facultyCount ?? 0} faculty created courses ({facultyAnalytics?.creationPercentage ?? 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden flex">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${facultyAnalytics?.creationPercentage ?? 0}%` }}
                />
              </div>
            </div>

            {/* Faculty Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={facultySearch}
                  onChange={(e) => setFacultySearch(e.target.value)}
                  placeholder="Search faculty by name, staff ID..."
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-vcet-blue/30 focus:border-vcet-blue"
                />
                {facultySearch && (
                  <button
                    onClick={() => setFacultySearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <button
                  onClick={() => setFacultyFilter("all")}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    facultyFilter === "all"
                      ? "bg-vcet-blue text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All Faculty ({facultyAnalytics?.totalFaculty ?? facultyCount ?? 0})
                </button>
                <button
                  onClick={() => setFacultyFilter("created")}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    facultyFilter === "created"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Created Courses ({facultyAnalytics?.createdCount ?? 0})
                </button>
                <button
                  onClick={() => setFacultyFilter("pending")}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    facultyFilter === "pending"
                      ? "bg-rose-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Pending Creation ({facultyAnalytics?.notCreatedCount ?? 0})
                </button>

                <button
                  onClick={() => downloadAnalyticsReport("faculty")}
                  className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors shrink-0"
                  title="Export faculty course creation list"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Faculty Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="py-3 px-4">Staff ID</th>
                      <th className="py-3 px-4">Faculty Member</th>
                      <th className="py-3 px-4">Designation</th>
                      <th className="py-3 px-4">Courses Created</th>
                      <th className="py-3 px-4">Course Creation Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredFaculty.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500">
                          No faculty records matching your search or filter.
                        </td>
                      </tr>
                    ) : (
                      filteredFaculty.map((f) => (
                        <tr key={f._id || f.staffId} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {f.staffId || "—"}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{f.name}</div>
                            <div className="text-[11px] text-slate-400">{f.email}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {f.designation || "Assistant Professor"}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">
                              {f.coursesCreatedCount || 0} Course{f.coursesCreatedCount === 1 ? "" : "s"}
                            </div>
                            {f.createdCourseTitles?.length > 0 && (
                              <div className="text-[11px] text-slate-500 line-clamp-1">
                                {f.createdCourseTitles.join(", ")}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {f.hasCreatedCourse ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800">
                                <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                                <span>Course Created</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                                <Clock className="w-3 h-3 text-rose-600" />
                                <span>Pending Creation</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
