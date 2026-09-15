import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Search,
  Plus,
  Filter,
  Ban,
  CheckCircle,
  Trash2,
  Edit,
  X,
  ShieldAlert,
  Download,
  Eye,
  KeyRound,
  Flame,
  Award,
  BookOpen,
  Activity,
  CheckCircle2,
  Lock,
  Phone,
  Mail,
  Building2,
  Clock
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { api } from "../../services/api";

const INITIAL_STUDENTS = [];

const DEPARTMENTS = ["ALL", "CSE", "AI&DS", "IT", "ECE", "EEE", "MECH", "CIVIL"];

export default function AdminStudentsPage() {
  const { showSuccess, showError } = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users?role=student");
      const list = res?.data?.users || res?.users || [];
      setStudents(list);
    } catch (err) {
      console.debug("Load students note:", err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [profileStudent, setProfileStudent] = useState(null);
  const [passwordResetStudent, setPasswordResetStudent] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    regNo: "",
    department: "CSE",
    year: "II Year",
    semester: 4,
    class: "II CSE - A",
    section: "A",
    phone: "",
    email: "",
    password: "student123",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    isActive: true
  });

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      name: "",
      regNo: "",
      department: "CSE",
      year: "II Year",
      semester: 4,
      class: "II CSE - A",
      section: "A",
      phone: "",
      email: "",
      password: "student123",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      isActive: true
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (stu) => {
    setEditingStudent(stu);
    setFormData({ ...stu });
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.regNo.trim()) {
      showError("Please enter student name and register number");
      return;
    }

    if (editingStudent) {
      setStudents((prev) =>
        prev.map((s) => (s.id === editingStudent.id ? { ...s, ...formData } : s))
      );
      showSuccess("Student record updated successfully ✓");
    } else {
      const newStu = {
        ...formData,
        id: `stu-${Date.now()}`,
        stats: {
          coursesEnrolled: 0,
          coursesCompleted: 0,
          testsAttempted: 0,
          averageScore: "N/A",
          points: 100,
          streak: 1,
          certificates: 0
        },
        activity: [{ action: "Student account enrolled in registry", time: "Just now" }]
      };
      setStudents((prev) => [newStu, ...prev]);
      showSuccess("New student registered successfully ✓");
    }
    setModalOpen(false);
  };

  const handleToggleBlock = (stu) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === stu.id ? { ...s, isActive: !s.isActive } : s))
    );
    showSuccess(
      stu.isActive
        ? `Student ${stu.regNo} blocked from portal access.`
        : `Student ${stu.regNo} unblocked successfully ✓`
    );
  };

  const handleDelete = (id) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    showSuccess("Student removed from institutional directory ✓");
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      showError("Please enter a new password");
      return;
    }
    setStudents((prev) =>
      prev.map((s) => (s.id === passwordResetStudent.id ? { ...s, password: newPassword } : s))
    );
    showSuccess(`Password reset for ${passwordResetStudent.regNo} ✓`);
    setPasswordResetStudent(null);
    setNewPassword("");
  };

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === "ALL" || s.department === deptFilter;
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "active" && s.isActive) ||
      (statusFilter === "blocked" && !s.isActive);
    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-[#0062A8]" />
            Student Directory & Profile Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Full student lifecycle: registration, class assignment, learning analytics, security audits, and credentials.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0062A8] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Student</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name, register number (732924CSE...), email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-xs sm:text-sm border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0062A8] focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200 focus:outline-none focus:bg-white"
          >
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d === "ALL" ? "All Departments" : d}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200 focus:outline-none focus:bg-white"
          >
            <option value="ALL">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Register No</th>
                <th className="px-4 py-3.5">Name</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Year</th>
                <th className="px-4 py-3.5">Class</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-[#0062A8] text-xs">
                    {s.regNo}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={s.avatar}
                        alt={s.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{s.name}</div>
                        <div className="text-[10px] text-slate-500">{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-slate-800">{s.department}</td>
                  <td className="px-4 py-3.5 text-slate-600">{s.year}</td>
                  <td className="px-4 py-3.5 font-medium text-slate-600">{s.class}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                        s.isActive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {s.isActive ? "Active" : "Blocked"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setProfileStudent(s)}
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200"
                        title="View Profile & Activity"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(s)}
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 text-[#0062A8] border border-slate-200"
                        title="Edit Student"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setPasswordResetStudent(s);
                          setNewPassword("");
                        }}
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-amber-50 text-amber-600 border border-slate-200"
                        title="Reset Password"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleBlock(s)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          s.isActive
                            ? "bg-slate-50 hover:bg-rose-50 text-rose-600 border-slate-200"
                            : "bg-slate-50 hover:bg-emerald-50 text-emerald-600 border-slate-200"
                        }`}
                        title={s.isActive ? "Block Student" : "Unblock Student"}
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-rose-600 border border-slate-200"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Profile Drawer / Modal - White Mode */}
      {profileStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5 text-slate-800">
            <button
              onClick={() => setProfileStudent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Header */}
            <div className="flex items-center gap-4">
              <img
                src={profileStudent.avatar}
                alt={profileStudent.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[#0062A8]/30 shadow-xs"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">{profileStudent.name}</h2>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      profileStudent.isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {profileStudent.isActive ? "Active" : "Blocked"}
                  </span>
                </div>
                <p className="text-xs font-mono text-[#0062A8] font-bold mt-0.5">{profileStudent.regNo}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                  <span>{profileStudent.department}</span>
                  <span>•</span>
                  <span>{profileStudent.class} (Sem {profileStudent.semester})</span>
                  <span>•</span>
                  <span>{profileStudent.email}</span>
                </div>
              </div>
            </div>

            {/* Learning Statistics Grid */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Learning Statistics & Achievements
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500">Courses Enrolled</span>
                  <p className="text-base font-bold text-slate-900 mt-0.5">{profileStudent.stats.coursesEnrolled}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500">Completed</span>
                  <p className="text-base font-bold text-emerald-600 mt-0.5">{profileStudent.stats.coursesCompleted}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500">Tests Attempted</span>
                  <p className="text-base font-bold text-[#0062A8] mt-0.5">{profileStudent.stats.testsAttempted}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500">Average Score</span>
                  <p className="text-base font-bold text-amber-600 mt-0.5">{profileStudent.stats.averageScore}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500">Points (XP)</span>
                  <p className="text-base font-bold text-amber-600 mt-0.5">{profileStudent.stats.points}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500">Active Streak</span>
                  <p className="text-base font-bold text-rose-600 mt-0.5 flex items-center justify-center gap-1">
                    <Flame className="w-3.5 h-3.5" /> {profileStudent.stats.streak}d
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center col-span-2">
                  <span className="text-[10px] text-slate-500">Verified Certificates</span>
                  <p className="text-base font-bold text-purple-600 mt-0.5 flex items-center justify-center gap-1">
                    <Award className="w-4 h-4" /> {profileStudent.stats.certificates} Issued
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Activity Timeline */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Recent Activity Logs
              </h3>
              <div className="bg-slate-50 rounded-xl border border-slate-200 divide-y divide-slate-200">
                {profileStudent.activity.map((act, i) => (
                  <div key={i} className="p-3 flex items-center justify-between text-xs">
                    <span className="text-slate-800 font-medium">{act.action}</span>
                    <span className="text-slate-500 text-[11px] shrink-0">{act.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Student Modal - White Mode */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-slate-800">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#0062A8]" />
              {editingStudent ? "Edit Student Information" : "Add Student to Institutional Registry"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Athithya V"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-[#0062A8] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Register Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.regNo}
                    onChange={(e) => setFormData({ ...formData, regNo: e.target.value.toUpperCase() })}
                    placeholder="e.g. 732924CSE001"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-[#0062A8] focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Institutional Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. 732924cse001@vcet.ac.in"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-[#0062A8] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Login Password *</label>
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-[#0062A8] focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:bg-white"
                  >
                    {DEPARTMENTS.filter((d) => d !== "ALL").map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Year</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:bg-white"
                  >
                    <option value="I Year">I Year</option>
                    <option value="II Year">II Year</option>
                    <option value="III Year">III Year</option>
                    <option value="IV Year">IV Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Semester</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>
                        Sem {sem}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Class Code</label>
                  <input
                    type="text"
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    placeholder="e.g. II CSE - A"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Phone Number (Optional)</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 ..."
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Profile Photo URL</label>
                <input
                  type="url"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0062A8] hover:bg-blue-700 text-white font-bold shadow-xs"
                >
                  {editingStudent ? "Save Changes" : "Register Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal - White Mode */}
      {passwordResetStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative space-y-4 text-xs text-slate-800">
            <button
              onClick={() => setPasswordResetStudent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-600" />
              Reset Student Password
            </h3>

            <p className="text-slate-500">
              Reset login password for <strong className="text-slate-900">{passwordResetStudent.name}</strong> ({passwordResetStudent.regNo}).
            </p>

            <form onSubmit={handleResetPassword} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">New Password</label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password..."
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-amber-500 font-mono focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordResetStudent(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-xs"
                >
                  Confirm Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
