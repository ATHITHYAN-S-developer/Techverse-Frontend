import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Users,
  Search,
  Download,
  AlertCircle,
  RefreshCw,
  GraduationCap,
} from "lucide-react";
import { courseService } from "../../services/courseService";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

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
      return "bg-slate-100 text-slate-500 border-slate-200";
    default:
      return "bg-slate-50 text-slate-400 border-slate-200";
  }
}

export default function CourseStudentsPage() {
  const [searchParams] = useSearchParams();
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  const modulesBase = user?.role === "admin" ? "/admin/modules" : "/faculty/modules";

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(
    searchParams.get("courseId") || ""
  );
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const list = await courseService.getMyCourses();
        if (!isMounted) return;
        const arr = Array.isArray(list) ? list : [];
        setCourses(arr);
        const fromUrl = searchParams.get("courseId");
        if (!fromUrl && arr.length > 0) {
          setSelectedCourseId(String(arr[0]._id || arr[0].id || ""));
        }
      } catch (err) {
        if (isMounted) showError(err.message || "Failed to load your courses");
      }
    })();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStudents = useCallback(
    async (courseId) => {
      if (!courseId) return;
      setLoading(true);
      setLoadError("");
      setReport(null);
      try {
        const data = await courseService.getCourseStudents(courseId);
        setReport(data);
      } catch (err) {
        setLoadError(err.message || "Failed to load students for this course.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (selectedCourseId) loadStudents(selectedCourseId);
  }, [selectedCourseId, loadStudents]);

  const handleExport = async () => {
    if (!selectedCourseId || exporting) return;
    setExporting(true);
    try {
      const filename = await courseService.exportCourseStudents(selectedCourseId);
      showSuccess(`Exported ${filename} ✓`);
    } catch (err) {
      showError(err.message || "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const students = report?.students || [];
  const modules = report?.modules || [];
  const filtered = students.filter((s) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      (s.name || "").toLowerCase().includes(q) ||
      (s.registerNumber || "").toLowerCase().includes(q) ||
      (s.email || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">
          Course Students &amp; Module Status
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Students enrolled in your assigned courses, with their status at every
          module. Export the full list to Excel.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-vcet-blue/20 max-w-full sm:max-w-xs"
        >
          {courses.length === 0 && <option value="">No courses available</option>}
          {courses.map((c) => (
            <option key={c._id || c.id} value={c._id || c.id}>
              {c.title}
            </option>
          ))}
        </select>

        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              students.length
                ? `Search ${students.length} students by name, roll number or email...`
                : "Search students..."
            }
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl text-xs sm:text-sm border border-slate-200 focus:ring-2 focus:ring-vcet-blue/20"
          />
        </div>

        <button
          type="button"
          onClick={handleExport}
          disabled={!selectedCourseId || exporting || students.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
          title="Download the student list with per-module status as an Excel file"
        >
          {exporting ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>{exporting ? "Exporting..." : "Export Excel"}</span>
        </button>
      </div>

      {/* Error */}
      {loadError && (
        <div className="flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 min-w-[640px]">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5 sticky left-0 bg-slate-50 z-10">Student</th>
                <th className="px-4 py-3.5">Enrolled On</th>
                <th className="px-4 py-3.5">Overall Progress</th>
                {modules.map((m, i) => (
                  <th
                    key={m._id}
                    className="px-4 py-3.5 whitespace-nowrap"
                    title={m.title}
                  >
                    M{i + 1}: {m.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={3 + modules.length}
                    className="px-5 py-12 text-center text-slate-400"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span>Loading enrolled students...</span>
                    </div>
                  </td>
                </tr>
              ) : !selectedCourseId ? (
                <tr>
                  <td colSpan={3 + modules.length} className="px-5 py-12 text-center text-slate-400">
                    <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold">Select a course to view its students.</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={3 + modules.length} className="px-5 py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold">
                      {students.length === 0
                        ? "No students have enrolled in this course yet."
                        : "No students match your search."}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.studentId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 sticky left-0 bg-white z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                          {(s.name?.[0] || "S").toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{s.name}</div>
                          <div className="text-slate-400 font-mono text-[11px]">
                            {s.registerNumber || "—"}
                            {s.email ? ` · ${s.email}` : ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap font-semibold text-slate-700">
                      {s.enrolledAt ? new Date(s.enrolledAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              s.progressPercentage >= 100
                                ? "bg-emerald-500"
                                : s.progressPercentage > 0
                                ? "bg-blue-500"
                                : "bg-slate-300"
                            }`}
                            style={{ width: `${s.progressPercentage}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-700 text-[11px] w-9 text-right">
                          {s.progressPercentage}%
                        </span>
                      </div>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadgeClass(
                          s.enrollmentStatus
                        )}`}
                      >
                        {s.enrollmentStatus}
                      </span>
                    </td>
                    {s.moduleStatuses?.map((status, i) => (
                      <td key={i} className="px-4 py-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold border whitespace-nowrap ${statusBadgeClass(
                            status
                          )}`}
                        >
                          {status}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {report && (
        <div className="text-[11px] text-slate-400 text-right">
          Showing {filtered.length} of {students.length} enrolled students ·{" "}
          <Link
            to={modulesBase}
            className="text-vcet-blue font-semibold hover:underline"
          >
            Back to Modules
          </Link>
        </div>
      )}
    </div>
  );
}
