import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Users,
  Search,
  Flame,
  AlertCircle,
  GraduationCap,
  Code2,
  Download,
  CheckCircle2,
  Clock,
  BookOpen,
  Filter,
  RefreshCw,
  Award,
  ChevronDown,
  FileSpreadsheet,
  Check,
  Zap,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import api from "../../services/api";
import { courseService } from "../../services/courseService";
import { codingService } from "../../services/codingService";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

/**
 * Resolves the faculty's department info from the user object.
 */
function resolveDept(user) {
  if (!user) return { deptId: null, deptCode: "", deptName: "" };

  if (user.departmentId && typeof user.departmentId === "object" && user.departmentId._id) {
    return {
      deptId: String(user.departmentId._id),
      deptCode: user.departmentId.code || user.departmentCode || user.department || "",
      deptName: user.departmentId.name || user.departmentName || "",
    };
  }

  if (user.departmentCode || user.department) {
    return {
      deptId: user.departmentId ? String(user.departmentId) : null,
      deptCode: user.departmentCode || user.department || "",
      deptName: user.departmentName || "",
    };
  }

  if (user.departmentId) {
    return {
      deptId: String(user.departmentId),
      deptCode: "",
      deptName: "",
    };
  }

  return { deptId: null, deptCode: "", deptName: "" };
}

function statusBadgeClass(status) {
  switch (status) {
    case "Completed":
    case "Test Passed":
    case "Certificate Generated":
      return "bg-emerald-50 text-emerald-700 border-emerald-200/70";
    case "Video Completed":
    case "Test Unlocked":
      return "bg-blue-50 text-blue-700 border-blue-200/70";
    case "Video In Progress":
    case "Test In Progress":
    case "In Progress":
      return "bg-amber-50 text-amber-700 border-amber-200/70";
    case "Test Failed":
      return "bg-rose-50 text-rose-700 border-rose-200/70";
    case "Locked":
    case "Not Started":
      return "bg-slate-100 text-slate-500 border-slate-200";
    default:
      return "bg-slate-50 text-slate-400 border-slate-200";
  }
}

export default function FacultyStudentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  // Active view tab: "course" | "coding" | "directory"
  const initialTab = searchParams.get("tab") || "course";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Department State
  const [deptInfo, setDeptInfo] = useState({ deptId: null, deptCode: "", deptName: "" });
  const [deptError, setDeptError] = useState(false);

  // Search & Batch filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // ==========================================
  // TAB 1: COURSE ATTENDANCE STATE
  // ==========================================
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(searchParams.get("courseId") || "");
  const [courseReport, setCourseReport] = useState(null);
  const [loadingCourseStudents, setLoadingCourseStudents] = useState(false);
  const [courseError, setCourseError] = useState("");
  const [exportingCourse, setExportingCourse] = useState(false);

  // ==========================================
  // TAB 2: CODING ARENA ATTENDANCE STATE
  // ==========================================
  const [codingTests, setCodingTests] = useState([]);
  const [selectedCodingId, setSelectedCodingId] = useState(searchParams.get("codingId") || "");
  const [codingReport, setCodingReport] = useState(null);
  const [loadingCodingStudents, setLoadingCodingStudents] = useState(false);
  const [codingError, setCodingError] = useState("");
  const [exportingCoding, setExportingCoding] = useState(false);

  // ==========================================
  // TAB 3: DEPARTMENT DIRECTORY STATE
  // ==========================================
  const [dirStudents, setDirStudents] = useState([]);
  const [loadingDirStudents, setLoadingDirStudents] = useState(false);

  // Sync Tab to URL
  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearchTerm("");
    setSelectedClass("ALL");
    setStatusFilter("ALL");
    const params = new URLSearchParams(searchParams);
    params.set("tab", tab);
    setSearchParams(params, { replace: true });
  };

  // 1. Resolve Department
  useEffect(() => {
    let isMounted = true;
    const resolveActualDept = async () => {
      const localDept = resolveDept(user);
      if (localDept.deptId && localDept.deptCode) {
        if (isMounted) setDeptInfo(localDept);
        return;
      }
      try {
        const me = await api.get("/auth/me");
        const freshUser = me?.user || me?.data?.user || me;
        const freshDept = resolveDept(freshUser);
        if (isMounted) {
          if (freshDept.deptId || freshDept.deptCode) {
            setDeptInfo(freshDept);
          } else {
            setDeptInfo(localDept);
            setDeptError(true);
          }
        }
      } catch {
        if (isMounted) {
          setDeptInfo(localDept);
          if (!localDept.deptId && !localDept.deptCode) setDeptError(true);
        }
      }
    };
    resolveActualDept();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // 2. Fetch Course List
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const list = await courseService.getMyCourses();
        if (!isMounted) return;
        const arr = Array.isArray(list) ? list : [];
        setCourses(arr);
        if (!selectedCourseId && arr.length > 0) {
          setSelectedCourseId(String(arr[0]._id || arr[0].id || ""));
        }
      } catch (err) {
        if (isMounted) {
          console.warn("Could not load faculty courses:", err);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // 3. Fetch Coding Tests List
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const tests = await codingService.getAdminCodingTests();
        if (!isMounted) return;
        const arr = Array.isArray(tests) ? tests : [];
        setCodingTests(arr);
        if (!selectedCodingId && arr.length > 0) {
          setSelectedCodingId(String(arr[0]._id || arr[0].slug || ""));
        }
      } catch (err) {
        if (isMounted) {
          console.warn("Could not load coding tests:", err);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // 4. Fetch Course Enrolled Students when selectedCourseId changes
  const loadCourseStudents = useCallback(async (courseId) => {
    if (!courseId) return;
    setLoadingCourseStudents(true);
    setCourseError("");
    setCourseReport(null);
    try {
      const data = await courseService.getCourseStudents(courseId);
      setCourseReport(data);
    } catch (err) {
      setCourseError(err.message || "Failed to load enrolled students for this course.");
    } finally {
      setLoadingCourseStudents(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      loadCourseStudents(selectedCourseId);
      const params = new URLSearchParams(searchParams);
      params.set("courseId", selectedCourseId);
      setSearchParams(params, { replace: true });
    }
  }, [selectedCourseId, loadCourseStudents]);

  // 5. Fetch Coding Assessment Progress when selectedCodingId changes
  const loadCodingStudents = useCallback(async (testId) => {
    if (!testId) return;
    setLoadingCodingStudents(true);
    setCodingError("");
    setCodingReport(null);
    try {
      const data = await codingService.getCodingProgress(testId);
      setCodingReport(data);
    } catch (err) {
      setCodingError(err.message || "Failed to load participant progress for this assessment.");
    } finally {
      setLoadingCodingStudents(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCodingId) {
      loadCodingStudents(selectedCodingId);
      const params = new URLSearchParams(searchParams);
      params.set("codingId", selectedCodingId);
      setSearchParams(params, { replace: true });
    }
  }, [selectedCodingId, loadCodingStudents]);

  // 6. Fetch Department Directory Students
  useEffect(() => {
    if (activeTab !== "directory") return;
    if (!deptInfo.deptId && !deptInfo.deptCode) return;

    let isMounted = true;
    const fetchDirStudents = async () => {
      setLoadingDirStudents(true);
      try {
        const queryParam = deptInfo.deptId
          ? `&departmentId=${deptInfo.deptId}`
          : `&departmentId=${deptInfo.deptCode}`;
        const res = await api.get(`/users?role=student${queryParam}&limit=2000`);
        if (isMounted) {
          const list = Array.isArray(res) ? res : res?.users || res?.data || [];
          const deptFiltered = list.filter((s) => {
            const sDeptId = String(s.departmentId?._id || s.departmentId || "");
            const sDeptCode = s.department || s.departmentCode || s.courseCode || "";
            if (deptInfo.deptId && sDeptId === deptInfo.deptId) return true;
            if (deptInfo.deptCode && sDeptCode === deptInfo.deptCode) return true;
            return false;
          });
          setDirStudents(
            deptFiltered.map((s, idx) => ({
              id: s._id || s.id || `stu-${idx}`,
              name: s.name || "Student",
              regNo: s.registerNumber || s.regNo || "--",
              department: s.department || s.departmentCode || s.courseCode || deptInfo.deptCode || "Dept",
              year: s.year || "IV Year",
              section: s.section || "A",
              streak: s.streak?.currentStreak ?? (typeof s.streak === "number" ? s.streak : 0),
              email: s.email || "",
            }))
          );
        }
      } catch {
        if (isMounted) setDirStudents([]);
      } finally {
        if (isMounted) setLoadingDirStudents(false);
      }
    };
    fetchDirStudents();
    return () => {
      isMounted = false;
    };
  }, [activeTab, deptInfo.deptId, deptInfo.deptCode]);

  // -------------------------------------------------------------
  // EXPORT HANDLERS
  // -------------------------------------------------------------
  const handleExportCourseExcel = async () => {
    if (!selectedCourseId || exportingCourse) return;
    setExportingCourse(true);
    try {
      const filename = await courseService.exportCourseStudents(selectedCourseId);
      showSuccess(`Exported ${filename} successfully`);
    } catch (err) {
      showError(err.message || "Course report export failed");
    } finally {
      setExportingCourse(false);
    }
  };

  const handleExportCodingCSV = () => {
    if (!codingReport?.students || codingReport.students.length === 0) {
      showError("No student submission data to export");
      return;
    }
    try {
      const currentTest = codingTests.find(
        (t) => String(t._id || t.slug) === String(selectedCodingId)
      );
      const testTitle = currentTest?.title || "Coding_Assessment";
      const problems = codingReport.problems || [];
      const headers = [
        "Register Number",
        "Student Name",
        "Email",
        "Department",
        "Class",
        "Problems Solved",
        "Total Problems",
        "Completion Rate",
        "Best Score %",
        "Status",
        "Language",
      ];
      const rows = codingReport.students.map((s) => {
        const solvedCount = Object.values(s.problems || {}).filter((p) => p.done).length;
        const totalProblems = problems.length;
        const pct = totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;
        const maxScore = Math.max(0, ...Object.values(s.problems || {}).map((p) => p.bestScore || 0));
        const langs = [
          ...new Set(Object.values(s.problems || {}).map((p) => p.language).filter(Boolean)),
        ].join("; ");
        const status =
          solvedCount === totalProblems && totalProblems > 0
            ? "Solved All"
            : solvedCount > 0
            ? "Partially Solved"
            : "Attempted";

        return [
          `"${s.registerNumber || ""}"`,
          `"${(s.name || "").replace(/"/g, '""')}"`,
          `"${s.email || ""}"`,
          `"${s.department || ""}"`,
          `"${(s.year || "") + (s.section ? " - " + s.section : "")}"`,
          solvedCount,
          totalProblems,
          `"${pct}%"`,
          `"${maxScore}%"`,
          `"${status}"`,
          `"${langs}"`,
        ];
      });

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${testTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_attendance.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      showSuccess("Coding attendance exported as CSV");
    } catch (err) {
      showError("Export failed: " + err.message);
    }
  };

  // -------------------------------------------------------------
  // TAB 1 FILTERED STUDENTS (Course)
  // -------------------------------------------------------------
  const enrolledStudents = courseReport?.students || [];
  const courseModules = courseReport?.modules || [];
  const selectedCourse = courses.find((c) => String(c._id || c.id) === String(selectedCourseId));

  const filteredCourseStudents = useMemo(() => {
    return enrolledStudents.filter((s) => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (s.name || "").toLowerCase().includes(q) ||
        (s.registerNumber || "").toLowerCase().includes(q) ||
        (s.email || "").toLowerCase().includes(q);

      const matchesClass = selectedClass === "ALL" || s.year === selectedClass;

      let matchesStatus = true;
      if (statusFilter === "Completed") matchesStatus = s.progressPercentage === 100;
      else if (statusFilter === "In Progress")
        matchesStatus = s.progressPercentage > 0 && s.progressPercentage < 100;
      else if (statusFilter === "Not Started") matchesStatus = s.progressPercentage === 0;

      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [enrolledStudents, searchTerm, selectedClass, statusFilter]);

  // Course Stat metrics
  const courseMetrics = useMemo(() => {
    const total = enrolledStudents.length;
    if (total === 0) return { total: 0, completed: 0, inProgress: 0, avgProgress: 0 };
    const completed = enrolledStudents.filter((s) => s.progressPercentage === 100).length;
    const inProgress = enrolledStudents.filter(
      (s) => s.progressPercentage > 0 && s.progressPercentage < 100
    ).length;
    const sumProgress = enrolledStudents.reduce((acc, s) => acc + (s.progressPercentage || 0), 0);
    const avgProgress = Math.round(sumProgress / total);
    return { total, completed, inProgress, avgProgress };
  }, [enrolledStudents]);

  // -------------------------------------------------------------
  // TAB 2 FILTERED STUDENTS (Coding Arena)
  // -------------------------------------------------------------
  const codingStudents = codingReport?.students || [];
  const codingProblems = codingReport?.problems || [];
  const selectedCodingTest = codingTests.find(
    (t) => String(t._id || t.slug) === String(selectedCodingId)
  );

  const enrichedCodingStudents = useMemo(() => {
    const totalProblems = codingProblems.length;
    return codingStudents.map((s) => {
      const pEntries = Object.values(s.problems || {});
      const solvedCount = pEntries.filter((p) => p.done).length;
      const attemptedCount = pEntries.length;
      const bestScore = Math.max(0, ...pEntries.map((p) => p.bestScore || 0));
      const languages = [...new Set(pEntries.map((p) => p.language).filter(Boolean))];
      const lastStatus = pEntries[pEntries.length - 1]?.lastStatus || "Attempted";

      let statusLabel = "Attempted";
      if (solvedCount === totalProblems && totalProblems > 0) {
        statusLabel = "Solved All";
      } else if (solvedCount > 0) {
        statusLabel = "Partially Solved";
      }

      return {
        ...s,
        solvedCount,
        totalProblems,
        attemptedCount,
        bestScore,
        languages,
        lastStatus,
        statusLabel,
      };
    });
  }, [codingStudents, codingProblems]);

  const filteredCodingStudents = useMemo(() => {
    return enrichedCodingStudents.filter((s) => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (s.name || "").toLowerCase().includes(q) ||
        (s.registerNumber || "").toLowerCase().includes(q) ||
        (s.email || "").toLowerCase().includes(q);

      const matchesClass = selectedClass === "ALL" || s.year === selectedClass;

      let matchesStatus = true;
      if (statusFilter === "Solved All") matchesStatus = s.statusLabel === "Solved All";
      else if (statusFilter === "Partially Solved")
        matchesStatus = s.statusLabel === "Partially Solved";
      else if (statusFilter === "Attempted") matchesStatus = s.statusLabel === "Attempted";

      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [enrichedCodingStudents, searchTerm, selectedClass, statusFilter]);

  // Coding Stat Metrics
  const codingMetrics = useMemo(() => {
    const total = enrichedCodingStudents.length;
    if (total === 0) return { total: 0, fullSolvers: 0, partial: 0, avgScore: 0 };
    const fullSolvers = enrichedCodingStudents.filter((s) => s.statusLabel === "Solved All").length;
    const partial = enrichedCodingStudents.filter((s) => s.statusLabel === "Partially Solved").length;
    const sumScore = enrichedCodingStudents.reduce((acc, s) => acc + (s.bestScore || 0), 0);
    const avgScore = Math.round(sumScore / total);
    return { total, fullSolvers, partial, avgScore };
  }, [enrichedCodingStudents]);

  // -------------------------------------------------------------
  // TAB 3 FILTERED STUDENTS (Department Directory)
  // -------------------------------------------------------------
  const filteredDirStudents = useMemo(() => {
    return dirStudents.filter((s) => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.regNo.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q);
      const matchesClass = selectedClass === "ALL" || s.year === selectedClass;
      return matchesSearch && matchesClass;
    });
  }, [dirStudents, searchTerm, selectedClass]);

  const { deptCode, deptName } = deptInfo;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* =========================================================
          PAGE HEADER
      ========================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {deptCode || "VCET"} Academic Portal
            </span>
            <span className="text-xs text-slate-400">• Student Attendance &amp; Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Student Attendance &amp; Evaluation Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Select any course or Coding Arena track to inspect verified student enrollments, test
            submissions, algorithmic performance scores, and learning progress.
          </p>
        </div>

        {/* Global Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/80 shadow-inner self-start md:self-auto">
          <button
            onClick={() => switchTab("course")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "course"
                ? "bg-white text-blue-700 shadow-sm border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span>Course Attendance</span>
            {courses.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-md bg-blue-100/70 text-blue-700 text-[10px]">
                {courses.length}
              </span>
            )}
          </button>

          <button
            onClick={() => switchTab("coding")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "coding"
                ? "bg-white text-indigo-700 shadow-sm border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            <Code2 className="w-4 h-4 text-indigo-600" />
            <span>Coding Arena</span>
            {codingTests.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-md bg-indigo-100/70 text-indigo-700 text-[10px]">
                {codingTests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => switchTab("directory")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "directory"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            <Users className="w-4 h-4 text-slate-500" />
            <span>All Students</span>
          </button>
        </div>
      </div>

      {deptError && (
        <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>
            Could not verify your department. Showing limited results — please re-login if the issue
            persists.
          </span>
        </div>
      )}

      {/* =========================================================
          TAB 1: COURSE ATTENDANCE & PROGRESS
      ========================================================= */}
      {activeTab === "course" && (
        <div className="space-y-6">
          {/* COURSE SELECTOR PANEL */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1 max-w-2xl">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  Select Course to View Attended Students
                </label>
                <div className="relative">
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors appearance-none cursor-pointer"
                  >
                    {courses.length === 0 ? (
                      <option value="">No courses created or assigned yet</option>
                    ) : (
                      courses.map((c) => (
                        <option key={c._id || c.id} value={c._id || c.id}>
                          {c.title} • {c.category || "Course"} ({c.duration || "Self-Paced"})
                        </option>
                      ))
                    )}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {selectedCourse && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/60">
                    Category: <strong className="text-slate-900">{selectedCourse.category || "General"}</strong>
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/60">
                    Modules: <strong className="text-slate-900">{courseModules.length || selectedCourse.totalModules || 0}</strong>
                  </span>
                  <button
                    onClick={handleExportCourseExcel}
                    disabled={exportingCourse || enrolledStudents.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                  >
                    {exportingCourse ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                    )}
                    <span>Export Excel Report</span>
                  </button>
                </div>
              )}
            </div>

            {/* COURSE SUMMARY METRICS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  Enrolled Students
                </div>
                <div className="text-xl font-black text-slate-900 mt-0.5">
                  {courseMetrics.total}
                </div>
              </div>
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">
                  Completed (100%)
                </div>
                <div className="text-xl font-black text-emerald-800 mt-0.5">
                  {courseMetrics.completed}
                </div>
              </div>
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">
                  In Progress
                </div>
                <div className="text-xl font-black text-amber-800 mt-0.5">
                  {courseMetrics.inProgress}
                </div>
              </div>
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wide">
                  Avg Progress
                </div>
                <div className="text-xl font-black text-blue-800 mt-0.5">
                  {courseMetrics.avgProgress}%
                </div>
              </div>
            </div>
          </div>

          {/* SEARCH & FILTERS BAR */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search enrolled students by name, reg no, or email..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-xs sm:text-sm border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200 w-full sm:w-auto"
            >
              <option value="ALL">All Statuses ({enrolledStudents.length})</option>
              <option value="Completed">Completed Only</option>
              <option value="In Progress">In Progress</option>
              <option value="Not Started">Not Started</option>
            </select>

            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200 w-full sm:w-auto"
            >
              <option value="ALL">All Batches</option>
              <option value="II Year">II Year</option>
              <option value="III Year">III Year</option>
              <option value="IV Year">IV Year</option>
            </select>
          </div>

          {/* COURSE ATTENDANCE TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">Student</th>
                    <th className="px-4 py-3.5">Class / Section</th>
                    <th className="px-4 py-3.5">Progress Rate</th>
                    <th className="px-4 py-3.5">Modules Status</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Enrolled On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingCourseStudents ? (
                    <tr>
                      <td colSpan="6" className="px-5 py-14 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <span>Fetching enrolled course attendees...</span>
                        </div>
                      </td>
                    </tr>
                  ) : courseError ? (
                    <tr>
                      <td colSpan="6" className="px-5 py-12 text-center text-rose-500">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="font-semibold">{courseError}</p>
                      </td>
                    </tr>
                  ) : filteredCourseStudents.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-5 py-14 text-center text-slate-400">
                        <GraduationCap className="w-9 h-9 mx-auto mb-2 opacity-30 text-blue-500" />
                        <p className="font-bold text-slate-700">No students found</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {enrolledStudents.length === 0
                            ? "No students have enrolled in this course yet."
                            : "No students match your filter or search query."}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredCourseStudents.map((s, idx) => {
                      const completedCount = (s.moduleStatuses || []).filter(
                        (st) => st === "Completed"
                      ).length;
                      const totalMods = courseModules.length || s.moduleStatuses?.length || 1;
                      const pct = s.progressPercentage || 0;

                      return (
                        <tr key={s.studentId || idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                                {(s.name?.[0] || "S").toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 text-sm">{s.name}</div>
                                <div className="text-slate-400 font-mono text-[11px]">
                                  {s.registerNumber || "--"}
                                </div>
                                <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                                  {s.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-semibold text-slate-800">
                              {s.year || "IV Year"} {s.section ? `- ${s.section}` : ""}
                            </span>
                            <div className="text-[11px] text-slate-400">
                              {s.department || deptCode || "Dept"}
                            </div>
                          </td>
                          <td className="px-4 py-4 min-w-[140px]">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-bold text-slate-800 text-xs">{pct}%</span>
                              <span className="text-[10px] text-slate-400">
                                {completedCount}/{totalMods} Done
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  pct === 100
                                    ? "bg-emerald-500"
                                    : pct > 50
                                    ? "bg-blue-600"
                                    : "bg-amber-500"
                                }`}
                                style={{ width: `${Math.min(100, Math.max(4, pct))}%` }}
                              />
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1 max-w-[200px] flex-wrap">
                              {(s.moduleStatuses || []).map((mStatus, mIdx) => (
                                <span
                                  key={mIdx}
                                  title={`Module ${mIdx + 1}: ${mStatus}`}
                                  className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold border ${
                                    mStatus === "Completed"
                                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                      : mStatus.includes("Progress")
                                      ? "bg-amber-100 text-amber-800 border-amber-300"
                                      : "bg-slate-100 text-slate-400 border-slate-200"
                                  }`}
                                >
                                  {mIdx + 1}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusBadgeClass(
                                s.enrollmentStatus || (pct === 100 ? "Completed" : "In Progress")
                              )}`}
                            >
                              {pct === 100 ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                              )}
                              {pct === 100 ? "Completed" : pct > 0 ? "In Progress" : "Not Started"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-slate-400 text-[11px] whitespace-nowrap">
                            {s.enrolledAt
                              ? new Date(s.enrolledAt).toLocaleDateString(undefined, {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "--"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: CODING ARENA ATTENDANCE & SUBMISSIONS
      ========================================================= */}
      {activeTab === "coding" && (
        <div className="space-y-6">
          {/* CODING TRACK SELECTOR PANEL */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1 max-w-2xl">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-indigo-600" />
                  Select Coding Track to View Student Submissions
                </label>
                <div className="relative">
                  <select
                    value={selectedCodingId}
                    onChange={(e) => setSelectedCodingId(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors appearance-none cursor-pointer"
                  >
                    {codingTests.length === 0 ? (
                      <option value="">No coding tracks created yet</option>
                    ) : (
                      codingTests.map((t) => (
                        <option key={t._id || t.slug} value={t._id || t.slug}>
                          {t.title} • {t.difficulty || "All Levels"} ({t.problems?.length || 0} Problems)
                        </option>
                      ))
                    )}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {selectedCodingTest && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/60">
                    Difficulty: <strong className="text-slate-900">{selectedCodingTest.difficulty || "Medium"}</strong>
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/60">
                    Time Limit: <strong className="text-slate-900">{selectedCodingTest.timeLimit || 45} mins</strong>
                  </span>
                  <button
                    onClick={handleExportCodingCSV}
                    disabled={exportingCoding || enrichedCodingStudents.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV Report</span>
                  </button>
                </div>
              )}
            </div>

            {/* CODING SUMMARY METRICS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  Total Participants
                </div>
                <div className="text-xl font-black text-slate-900 mt-0.5">
                  {codingMetrics.total}
                </div>
              </div>
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">
                  Full Solvers (100%)
                </div>
                <div className="text-xl font-black text-emerald-800 mt-0.5">
                  {codingMetrics.fullSolvers}
                </div>
              </div>
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">
                  Partial Solvers
                </div>
                <div className="text-xl font-black text-amber-800 mt-0.5">
                  {codingMetrics.partial}
                </div>
              </div>
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                <div className="text-[11px] font-bold text-indigo-700 uppercase tracking-wide">
                  Average Score
                </div>
                <div className="text-xl font-black text-indigo-800 mt-0.5">
                  {codingMetrics.avgScore}%
                </div>
              </div>
            </div>
          </div>

          {/* SEARCH & FILTERS BAR */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search coding attendees by name, reg no, or email..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-xs sm:text-sm border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200 w-full sm:w-auto"
            >
              <option value="ALL">All Submission States ({enrichedCodingStudents.length})</option>
              <option value="Solved All">Solved All</option>
              <option value="Partially Solved">Partially Solved</option>
              <option value="Attempted">Attempted Only</option>
            </select>

            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200 w-full sm:w-auto"
            >
              <option value="ALL">All Batches</option>
              <option value="II Year">II Year</option>
              <option value="III Year">III Year</option>
              <option value="IV Year">IV Year</option>
            </select>
          </div>

          {/* CODING ATTENDANCE TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">Student</th>
                    <th className="px-4 py-3.5">Class / Section</th>
                    <th className="px-4 py-3.5">Problems Solved</th>
                    <th className="px-4 py-3.5">Best Score</th>
                    <th className="px-4 py-3.5">Evaluation Status</th>
                    <th className="px-4 py-3.5">Languages Used</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingCodingStudents ? (
                    <tr>
                      <td colSpan="6" className="px-5 py-14 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                          <span>Fetching coding arena participant records...</span>
                        </div>
                      </td>
                    </tr>
                  ) : codingError ? (
                    <tr>
                      <td colSpan="6" className="px-5 py-12 text-center text-rose-500">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="font-semibold">{codingError}</p>
                      </td>
                    </tr>
                  ) : filteredCodingStudents.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-5 py-14 text-center text-slate-400">
                        <Code2 className="w-9 h-9 mx-auto mb-2 opacity-30 text-indigo-500" />
                        <p className="font-bold text-slate-700">No coding submissions found</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {enrichedCodingStudents.length === 0
                            ? "No students have attempted this coding assessment yet."
                            : "No students match your filter or search query."}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredCodingStudents.map((s, idx) => {
                      const totalProbs = codingProblems.length || s.totalProblems || 1;
                      const isComplete = s.solvedCount === totalProbs && totalProbs > 0;

                      return (
                        <tr key={s.studentId || idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                                {(s.name?.[0] || "S").toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 text-sm">{s.name}</div>
                                <div className="text-slate-400 font-mono text-[11px]">
                                  {s.registerNumber || "--"}
                                </div>
                                <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                                  {s.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-semibold text-slate-800">
                              {s.year || "IV Year"} {s.section ? `- ${s.section}` : ""}
                            </span>
                            <div className="text-[11px] text-slate-400">
                              {s.department || deptCode || "Dept"}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                                  isComplete
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : s.solvedCount > 0
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-slate-100 text-slate-600 border-slate-200"
                                }`}
                              >
                                {s.solvedCount} / {totalProbs} Solved
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`font-mono font-bold text-xs px-2 py-0.5 rounded-md ${
                                  s.bestScore === 100
                                    ? "text-emerald-700 bg-emerald-50"
                                    : s.bestScore > 0
                                    ? "text-blue-700 bg-blue-50"
                                    : "text-slate-600 bg-slate-100"
                                }`}
                              >
                                {s.bestScore}%
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                                isComplete
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : s.solvedCount > 0
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-slate-100 text-slate-600 border-slate-200"
                              }`}
                            >
                              {isComplete ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Zap className="w-3.5 h-3.5 text-amber-600" />
                              )}
                              {s.statusLabel}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1 flex-wrap">
                              {s.languages?.length > 0 ? (
                                s.languages.map((lang, lIdx) => (
                                  <span
                                    key={lIdx}
                                    className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] uppercase font-bold border border-slate-200"
                                  >
                                    {lang}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-400 text-[11px]">--</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 3: DEPARTMENT DIRECTORY (ALL STUDENTS)
      ========================================================= */}
      {activeTab === "directory" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  loadingDirStudents
                    ? "Loading students..."
                    : `Search across ${dirStudents.length} ${deptCode || ""} students by name or register number...`
                }
                className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-xs sm:text-sm border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              />
            </div>

            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200 w-full sm:w-auto"
            >
              <option value="ALL">All Year Batches ({dirStudents.length})</option>
              <option value="II Year">II Year {deptCode}</option>
              <option value="III Year">III Year {deptCode}</option>
              <option value="IV Year">IV Year {deptCode}</option>
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">Student</th>
                    <th className="px-4 py-3.5">Class / Section</th>
                    <th className="px-4 py-3.5">Learning Streak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingDirStudents ? (
                    <tr>
                      <td colSpan="3" className="px-5 py-14 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <span>Loading {deptCode || ""} students...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredDirStudents.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-5 py-14 text-center text-slate-400">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="font-semibold text-slate-700">No students found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredDirStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                              {(s.name?.[0] || "S").toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-sm">{s.name}</div>
                              <div className="text-slate-400 font-mono text-[11px]">{s.regNo}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-semibold text-slate-800">
                            {s.year} - {s.section}
                          </span>
                          <div className="text-[11px] text-slate-400">{s.department}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-bold text-xs border border-amber-200/60">
                              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" /> {s.streak} Days
                            </span>
                          </div>
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
  );
}
