import React, { useState, useEffect } from "react";
import { Users, Search, Flame, AlertCircle } from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

/**
 * Resolves the faculty's department info from the user object.
 * Handles all storage shapes:
 *   - departmentId as populated object: { _id, code, name }
 *   - departmentId as raw ObjectId string
 *   - flat departmentCode / departmentName fields
 */
function resolveDept(user) {
  if (!user) return { deptId: null, deptCode: "", deptName: "" };

  // Case 1: departmentId is a populated object
  if (user.departmentId && typeof user.departmentId === "object" && user.departmentId._id) {
    return {
      deptId: String(user.departmentId._id),
      deptCode: user.departmentId.code || user.departmentCode || user.department || "",
      deptName: user.departmentId.name || user.departmentName || "",
    };
  }

  // Case 2: flat fields present
  if (user.departmentCode || user.department) {
    return {
      deptId: user.departmentId ? String(user.departmentId) : null,
      deptCode: user.departmentCode || user.department || "",
      deptName: user.departmentName || "",
    };
  }

  // Case 3: only raw ObjectId string in departmentId — we have the id but no code yet
  if (user.departmentId) {
    return {
      deptId: String(user.departmentId),
      deptCode: "",
      deptName: "",
    };
  }

  return { deptId: null, deptCode: "", deptName: "" };
}

export default function FacultyStudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [deptInfo, setDeptInfo] = useState({ deptId: null, deptCode: "", deptName: "" });
  const [deptError, setDeptError] = useState(false);

  // Step 1: Resolve department — always fetch /auth/me for accurate populated data
  useEffect(() => {
    let isMounted = true;
    const resolveActualDept = async () => {
      // First try from local user object
      const localDept = resolveDept(user);

      // If we already have both deptId and deptCode, use them immediately
      if (localDept.deptId && localDept.deptCode) {
        if (isMounted) setDeptInfo(localDept);
        return;
      }

      // Otherwise fetch fresh user data from server
      try {
        const me = await api.get("/auth/me");
        const freshUser = me?.user || me?.data?.user || me;
        const freshDept = resolveDept(freshUser);
        if (isMounted) {
          if (freshDept.deptId || freshDept.deptCode) {
            setDeptInfo(freshDept);
          } else {
            // Last resort: use whatever we had locally
            setDeptInfo(localDept);
            setDeptError(true);
          }
        }
      } catch {
        // Server not reachable — use local
        if (isMounted) {
          setDeptInfo(localDept);
          if (!localDept.deptId && !localDept.deptCode) setDeptError(true);
        }
      }
    };

    resolveActualDept();
    return () => { isMounted = false; };
  }, [user]);

  // Step 2: Fetch students once we know the department
  useEffect(() => {
    if (!deptInfo.deptId && !deptInfo.deptCode) return; // wait until dept is resolved

    let isMounted = true;
    const fetchStudents = async () => {
      setLoading(true);
      try {
        // Always prefer ObjectId filter; fall back to code filter
        const queryParam = deptInfo.deptId
          ? `&departmentId=${deptInfo.deptId}`
          : `&departmentId=${deptInfo.deptCode}`;

        const res = await api.get(`/users?role=student${queryParam}&limit=2000`);
        if (isMounted) {
          const list = Array.isArray(res) ? res : res?.users || res?.data || [];

          // Strict client-side guard: only include students from this department
          const deptFiltered = list.filter((s) => {
            const sDeptId = String(s.departmentId?._id || s.departmentId || "");
            const sDeptCode = s.department || s.departmentCode || s.courseCode || "";

            if (deptInfo.deptId && sDeptId === deptInfo.deptId) return true;
            if (deptInfo.deptCode && sDeptCode === deptInfo.deptCode) return true;
            return false;
          });

          setStudents(
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
        if (isMounted) setStudents([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStudents();
    return () => { isMounted = false; };
  }, [deptInfo.deptId, deptInfo.deptCode]);

  const { deptCode, deptName } = deptInfo;

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.regNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === "ALL" || s.year === selectedClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">
          Department Student Directory &amp; Learning Progress
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          {deptCode
            ? `Monitor student course completions and learning streaks across ${deptName || deptCode} classes.`
            : "Loading department information..."}
        </p>
      </div>

      {deptError && (
        <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Could not verify your department. Showing limited results — please re-login if the issue persists.</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              loading
                ? "Loading students..."
                : `Search across ${students.length} ${deptCode || ""} students by name or register number...`
            }
            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-xs sm:text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0062A8]/20"
          />
        </div>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200 focus:outline-none w-full sm:w-auto"
        >
          <option value="ALL">All Year Batches ({students.length})</option>
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
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-5 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span>Loading {deptCode || ""} students...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-5 py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold">No students found matching your search.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
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
  );
}
