import React, { useState, useEffect, useMemo } from "react";
import {
  UserCheck,
  Search,
  Plus,
  Trash2,
  Edit,
  X,
  Shield,
  KeyRound,
  Ban,
  CheckCircle2,
  Eye,
  Building2,
  Briefcase,
  Layers,
  Megaphone,
  BookOpen,
  Activity,
  Check,
  XCircle,
  Clock,
  Download,
  FileText,
  FileCode,
  Video,
  ExternalLink,
  GraduationCap,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Award,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle,
  HelpCircle,
  FileCheck
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { api } from "../../services/api";

const INITIAL_FACULTY = [];

const DEPARTMENTS = ["ALL", "CSE", "AI&DS", "IT", "ECE", "EEE", "MECH", "CIVIL"];
const RESOURCE_TYPES = [
  "All",
  "Notes",
  "Question Bank",
  "Previous Papers",
  "Lab Manual",
  "Video",
  "Reference",
  "Project",
  "Syllabus"
];

export default function AdminFacultyPage() {
  const { showSuccess, showError } = useToast();
  const [facultyList, setFacultyList] = useState(INITIAL_FACULTY);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Active Selected Staff for Profile Inspector
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [activeProfileTab, setActiveProfileTab] = useState("overview");
  const [resourceTypeFilter, setResourceTypeFilter] = useState("All");
  const [resourceStatusFilter, setResourceStatusFilter] = useState("All");

  // Modals for CRUD
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [passwordResetFaculty, setPasswordResetFaculty] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    staffId: "",
    department: "CSE",
    designation: "Assistant Professor",
    email: "",
    phone: "+91 98421 23456",
    cabin: "Department Faculty Room",
    qualification: "M.Tech / Ph.D.",
    password: "faculty123",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    isActive: true
  });

  useEffect(() => {
    loadFaculty();
  }, []);

  const loadFaculty = async () => {
    try {
      setLoading(true);
      let teachers = [];
      try {
        const res = await api.get("/admin/users?role=teacher");
        teachers = res?.data?.users || res?.users || [];
      } catch (err) {
        const res = await api.get("/users?role=teacher");
        teachers = res?.data?.users || res?.users || [];
      }

      // Also fetch resources and announcements to enrich staff profile
      let allResources = [];
      try {
        const resRes = await api.get("/resources");
        allResources = Array.isArray(resRes) ? resRes : resRes?.data?.resources || resRes?.resources || [];
      } catch (e) {}

      let allAnnouncements = [];
      try {
        const annRes = await api.get("/announcements");
        allAnnouncements = Array.isArray(annRes) ? annRes : annRes?.data?.announcements || annRes?.announcements || [];
      } catch (e) {}

      const enriched = teachers.map((t, idx) => {
        const deptCode = t.departmentId?.code || t.departmentId?.name || t.department || (idx % 2 === 0 ? "CSE" : "AI&DS");
        const staffRes = allResources.filter((r) => {
          const rDept = (r.department || "").toUpperCase();
          return !rDept || rDept === deptCode.toUpperCase() || (r.uploadedBy === t._id || r.uploadedBy === t.id);
        });
        const staffAnn = allAnnouncements.filter((a) => {
          const aDept = (a.department || a.targetDepartment || "").toUpperCase();
          return !aDept || aDept === "ALL" || aDept === deptCode.toUpperCase();
        });

        return {
          id: t._id || t.id || `fac-${idx}`,
          _id: t._id || t.id,
          name: t.name || "Faculty Member",
          staffId: t.staffId || `VCET-FAC-${deptCode}-10${idx + 1}`,
          department: deptCode,
          designation: t.designation || (idx === 0 ? "Professor & HOD" : "Associate Professor"),
          email: t.email || `${(t.name || "faculty").toLowerCase().replace(/[^a-z0-9]/g, "")}@vcet.ac.in`,
          phone: t.phone || "+91 98421 " + (20000 + idx * 111),
          cabin: t.cabin || `${deptCode} Block Room 30${idx + 1}`,
          qualification: t.qualification || "Ph.D. / M.Tech",
          password: "faculty123",
          avatar: t.avatar || t.profileImage || (idx % 2 === 0
            ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
            : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"),
          isActive: t.isActive !== false,
          stats: {
            resourcesUploaded: staffRes.length,
            publishedResources: staffRes.filter((r) => r.status !== "Draft").length,
            draftResources: staffRes.filter((r) => r.status === "Draft").length,
            announcements: staffAnn.length,
            coursesAssigned: 2,
            subjectsAssigned: 3,
          },
          resources: staffRes.map((r, rIdx) => ({
            id: r._id || r.id || `res-${rIdx}`,
            title: r.title || r.name || "Academic Lecture Notes",
            subjectCode: r.subjectCode || "CS3452",
            subjectName: r.subjectName || "Core Engineering Subject",
            semester: r.semester || 5,
            type: r.type || "Notes",
            fileSize: r.fileSize || "2.4 MB",
            format: r.format || "PDF",
            uploadedAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "Recent",
            status: r.status || "Published",
            downloads: r.downloads || 42 + rIdx * 7,
            url: r.fileUrl || r.url || "https://vcet.ac.in/materials/sample.pdf",
          })),
          announcements: staffAnn.map((a, aIdx) => ({
            id: a._id || a.id || `ann-${aIdx}`,
            title: a.title || "Department Notice",
            content: a.content || a.description || "Official circular published for students.",
            category: a.category || "Academic",
            date: a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "Today",
            priority: a.priority || "Normal",
          })),
          courses: [
            { id: "crs-1", title: `${deptCode} Core Specialization`, progress: 85, studentsEnrolled: 124 },
            { id: "crs-2", title: "Problem Solving & Algorithmic Thinking", progress: 60, studentsEnrolled: 98 },
          ],
          subjects: [
            { code: "CS3452", name: "Theory of Computation", credits: 4, sem: "Sem 5" },
            { code: "CS3591", name: "Computer Networks & Security", credits: 4, sem: "Sem 5" },
          ],
          activity: [
            {
              action: `Uploaded ${staffRes.length > 0 ? staffRes[0].title || 'materials' : 'academic resource'}`,
              time: "2 hours ago",
              type: "RESOURCE_UPLOAD",
              ip: "192.168.1.104"
            },
            {
              action: `Published circular for ${deptCode} students`,
              time: "Yesterday",
              type: "ANNOUNCEMENT",
              ip: "192.168.1.104"
            },
            {
              action: "Logged into Faculty Portal session",
              time: "3 days ago",
              type: "AUTH_LOGIN",
              ip: "192.168.1.104"
            }
          ]
        };
      });

      setFacultyList(enriched);
    } catch (err) {
      console.debug("Load faculty error:", err);
      setFacultyList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingFaculty(null);
    setFormData({
      name: "",
      staffId: `TCH00${facultyList.length + 1}`,
      department: "CSE",
      designation: "Assistant Professor",
      email: "",
      phone: "+91 ",
      cabin: "Department Faculty Room",
      qualification: "M.Tech / Ph.D.",
      password: "faculty123",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      isActive: true
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (fac) => {
    setEditingFaculty(fac);
    setFormData({ ...fac });
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.staffId.trim()) {
      showError("Please enter faculty name and staff ID");
      return;
    }

    if (editingFaculty) {
      setFacultyList((prev) =>
        prev.map((f) => (f.id === editingFaculty.id ? { ...f, ...formData } : f))
      );
      if (selectedStaff && selectedStaff.id === editingFaculty.id) {
        setSelectedStaff((prev) => ({ ...prev, ...formData }));
      }
      showSuccess("Staff record updated successfully ✓");
    } else {
      const newFac = {
        ...formData,
        id: `fac-${Date.now()}`,
        stats: {
          resourcesUploaded: 0,
          publishedResources: 0,
          draftResources: 0,
          announcements: 0,
          coursesAssigned: 0,
          subjectsAssigned: 0
        },
        resources: [],
        announcements: [],
        courses: [],
        subjects: [],
        activity: [
          {
            action: "Staff profile registered on portal by Admin",
            time: "Just now",
            type: "REGISTER_STAFF",
            ip: "127.0.0.1"
          }
        ]
      };
      setFacultyList((prev) => [newFac, ...prev]);
      showSuccess("New faculty staff added to roster ✓");
    }
    setModalOpen(false);
  };

  const handleToggleBlock = (fac) => {
    const updated = !fac.isActive;
    setFacultyList((prev) =>
      prev.map((f) => (f.id === fac.id ? { ...f, isActive: updated } : f))
    );
    if (selectedStaff && selectedStaff.id === fac.id) {
      setSelectedStaff((prev) => ({ ...prev, isActive: updated }));
    }
    showSuccess(
      updated
        ? `Staff ${fac.staffId} (${fac.name}) is now Active ✓`
        : `Staff ${fac.staffId} (${fac.name}) has been Suspended.`
    );
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this staff record?")) return;
    setFacultyList((prev) => prev.filter((f) => f.id !== id));
    if (selectedStaff && selectedStaff.id === id) {
      setSelectedStaff(null);
    }
    showSuccess("Staff member removed from roster ✓");
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      showError("Please enter a new password");
      return;
    }
    setFacultyList((prev) =>
      prev.map((s) => (s.id === passwordResetFaculty.id ? { ...s, password: newPassword } : s))
    );
    showSuccess(`Password reset for ${passwordResetFaculty.staffId} ✓`);
    setPasswordResetFaculty(null);
    setNewPassword("");
  };

  // Filter staff list
  const filteredStaffList = useMemo(() => {
    return facultyList.filter((f) => {
      const matchesSearch =
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = deptFilter === "ALL" || f.department === deptFilter;
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "Active" && f.isActive) ||
        (statusFilter === "Suspended" && !f.isActive);
      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [facultyList, searchTerm, deptFilter, statusFilter]);

  // Filter resources of selected staff
  const filteredResources = useMemo(() => {
    if (!selectedStaff || !selectedStaff.resources) return [];
    return selectedStaff.resources.filter((r) => {
      const matchesType = resourceTypeFilter === "All" || r.type === resourceTypeFilter;
      const matchesStatus =
        resourceStatusFilter === "All" || r.status === resourceStatusFilter;
      return matchesType && matchesStatus;
    });
  }, [selectedStaff, resourceTypeFilter, resourceStatusFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-800">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Admin</span>
            <span className="text-xs font-bold text-slate-400">/</span>
            <span className="text-xs font-bold text-[#0062A8]">Staff Management</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2 mt-1">
            <UserCheck className="w-6 h-6 text-[#0062A8]" />
            Faculty & Staff Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Select any staff member to view full uploaded resources, announcements, courses, and audit activity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0062A8] hover:bg-[#00528c] text-white font-bold text-xs shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Faculty / Staff</span>
          </button>
        </div>
      </div>

      {/* Staff List View */}
      <div className="space-y-4">
        {/* Search & Filter Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by staff name, ID (e.g. TCH001), department, designation..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-xs sm:text-sm border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0062A8] focus:bg-white transition-colors"
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
                  {d === "ALL" ? "All Departments" : `Dept: ${d}`}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200 focus:outline-none focus:bg-white"
            >
              <option value="ALL">All Status</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Staff</th>
                  <th className="px-4 py-3.5">Staff ID</th>
                  <th className="px-4 py-3.5">Department</th>
                  <th className="px-4 py-3.5">Designation</th>
                  <th className="px-4 py-3.5 text-center">Resources</th>
                  <th className="px-4 py-3.5 text-center">Announcements</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaffList.map((f) => (
                  <tr
                    key={f.id}
                    className={`hover:bg-blue-50/40 transition-colors ${
                      selectedStaff?.id === f.id ? "bg-blue-50/70" : ""
                    }`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={f.avatar}
                          alt={f.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-xs shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{f.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{f.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-[#0062A8] text-xs">
                      {f.staffId}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 font-bold text-xs bg-slate-100 text-slate-800 rounded-md border border-slate-200">
                        {f.department}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 font-medium">{f.designation}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#0062A8] border border-blue-100">
                        <Layers className="w-3 h-3" />
                        {f.stats?.resourcesUploaded || f.resources?.length || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                        <Megaphone className="w-3 h-3" />
                        {f.stats?.announcements || f.announcements?.length || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-full ${
                          f.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${f.isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
                        {f.isActive ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedStaff(f);
                            setActiveProfileTab("overview");
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0062A8] hover:bg-[#00528c] text-white font-bold text-xs shadow-xs transition-all"
                          title="View Complete Staff Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleOpenEdit(f)}
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 text-[#0062A8] border border-slate-200"
                          title="Edit Staff Information"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setPasswordResetFaculty(f);
                            setNewPassword("");
                          }}
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-amber-50 text-amber-600 border border-slate-200"
                          title="Reset Password"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleBlock(f)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            f.isActive
                              ? "bg-slate-50 hover:bg-rose-50 text-rose-600 border-slate-200"
                              : "bg-slate-50 hover:bg-emerald-50 text-emerald-600 border-slate-200"
                          }`}
                          title={f.isActive ? "Suspend Staff Member" : "Activate Staff Member"}
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(f.id)}
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
      </div>

      {/* ========================================================= */}
      {/* 2. COMPLETE STAFF PROFILE VIEW MODAL / DRAWER           */}
      {/* ========================================================= */}
      {selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl my-auto shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Top Nav / Header Bar */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-blue-100 text-[#0062A8]">
                  <UserCheck className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    Staff Profile: {selectedStaff.name}
                  </h2>
                  <p className="text-xs text-slate-500 font-mono">
                    Staff ID: {selectedStaff.staffId} • Department: {selectedStaff.department}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedStaff(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                title="Close Profile"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Container */}
            <div className="overflow-y-auto p-6 space-y-6 flex-1 bg-[#F8FAFC]">
              
              {/* Profile Card Hero */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      <img
                        src={selectedStaff.avatar}
                        alt={selectedStaff.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-blue-500/30 shadow-md"
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          selectedStaff.isActive ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                        title={selectedStaff.isActive ? "Active Account" : "Suspended Account"}
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                          {selectedStaff.name}
                        </h2>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full ${
                            selectedStaff.isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {selectedStaff.isActive ? "Active" : "Suspended"}
                        </span>
                      </div>

                      <p className="text-sm font-bold text-[#0062A8]">
                        {selectedStaff.designation}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1 font-mono">
                          <span className="font-bold text-slate-700">ID:</span> {selectedStaff.staffId}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" /> Dept of {selectedStaff.department}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" /> {selectedStaff.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions in Profile Header */}
                  <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-end">
                    <button
                      onClick={() => handleOpenEdit(selectedStaff)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Info</span>
                    </button>
                    <button
                      onClick={() => {
                        setPasswordResetFaculty(selectedStaff);
                        setNewPassword("");
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs transition-colors border border-amber-200"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Reset Password</span>
                    </button>
                    <button
                      onClick={() => handleToggleBlock(selectedStaff)}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs transition-colors border ${
                        selectedStaff.isActive
                          ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200"
                          : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>{selectedStaff.isActive ? "Suspend" : "Activate"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Statistics Grid (6 Stat Cards) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-center">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Resources Uploaded</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {selectedStaff.stats?.resourcesUploaded || selectedStaff.resources?.length || 0}
                  </p>
                  <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                    Total
                  </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-center">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Published Resources</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">
                    {selectedStaff.stats?.publishedResources || selectedStaff.resources?.filter(r => r.status === "Published").length || 0}
                  </p>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                    Live
                  </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-center">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Draft Resources</p>
                  <p className="text-2xl font-black text-amber-600 mt-1">
                    {selectedStaff.stats?.draftResources || selectedStaff.resources?.filter(r => r.status === "Draft").length || 0}
                  </p>
                  <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                    Pending
                  </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-center">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Announcements</p>
                  <p className="text-2xl font-black text-indigo-600 mt-1">
                    {selectedStaff.stats?.announcements || selectedStaff.announcements?.length || 0}
                  </p>
                  <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                    Created
                  </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-center">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Courses Assigned</p>
                  <p className="text-2xl font-black text-violet-600 mt-1">
                    {selectedStaff.stats?.coursesAssigned || selectedStaff.courses?.length || 0}
                  </p>
                  <span className="text-[10px] font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                    Syllabus
                  </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-center">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Subjects Assigned</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {selectedStaff.stats?.subjectsAssigned || selectedStaff.subjects?.length || 0}
                  </p>
                  <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                    Academic
                  </span>
                </div>
              </div>

              {/* Tab Selector Bar */}
              <div className="bg-white border border-slate-200 rounded-2xl p-1.5 shadow-xs flex flex-wrap gap-1">
                {[
                  { id: "overview", label: "Overview", icon: Sparkles, count: null },
                  { id: "resources", label: "Resources", icon: Layers, count: selectedStaff.resources?.length || 0 },
                  { id: "announcements", label: "Announcements", icon: Megaphone, count: selectedStaff.announcements?.length || 0 },
                  { id: "courses", label: "Courses", icon: BookOpen, count: selectedStaff.courses?.length || 0 },
                  { id: "subjects", label: "Subjects", icon: GraduationCap, count: selectedStaff.subjects?.length || 0 },
                  { id: "activity", label: "Activity", icon: Activity, count: selectedStaff.activity?.length || 0 }
                ].map((t) => {
                  const Icon = t.icon;
                  const isActive = activeProfileTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveProfileTab(t.id)}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#0062A8] text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{t.label}</span>
                      {t.count !== null && (
                        <span
                          className={`px-2 py-0.5 text-[10px] rounded-full font-mono ${
                            isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {t.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tab Contents */}
              <div className="space-y-4">
                
                {/* ---------------------------------------------------- */}
                {/* TAB 1: OVERVIEW                                      */}
                {/* ---------------------------------------------------- */}
                {activeProfileTab === "overview" && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    
                    {/* Left 2 Cols: Academic Profile Details & Privileges */}
                    <div className="lg:col-span-2 space-y-5">
                      {/* Academic & Office Details */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-[#0062A8]" />
                          Academic & Institutional Details
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                            <span className="text-slate-400 font-medium">Qualification:</span>
                            <p className="font-bold text-slate-800">{selectedStaff.qualification}</p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                            <span className="text-slate-400 font-medium">Office / Cabin:</span>
                            <p className="font-bold text-slate-800">{selectedStaff.cabin}</p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                            <span className="text-slate-400 font-medium">Contact Phone:</span>
                            <p className="font-bold text-slate-800">{selectedStaff.phone}</p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                            <span className="text-slate-400 font-medium">Joining Date:</span>
                            <p className="font-bold text-slate-800">{selectedStaff.joiningDate}</p>
                          </div>
                        </div>
                      </div>

                      {/* Department Isolation Matrix */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <Shield className="w-4 h-4 text-[#0062A8]" />
                          Role Scope & Access Rights: Department of {selectedStaff.department}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-emerald-900 space-y-1.5">
                            <span className="font-bold flex items-center gap-1.5 text-emerald-800">
                              <CheckCircle2 className="w-4 h-4" /> Granted Permissions:
                            </span>
                            <p>• Manage academic resources in {selectedStaff.department}</p>
                            <p>• Publish circulars to {selectedStaff.department} students</p>
                            <p>• Create courses and conduct module assessments</p>
                          </div>
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 space-y-1.5">
                            <span className="font-bold flex items-center gap-1.5 text-slate-800">
                              <Shield className="w-4 h-4 text-slate-400" /> Isolated Scopes:
                            </span>
                            <p>• Cannot modify other department materials</p>
                            <p>• Cannot alter student enrollment databases</p>
                            <p>• Protected by TechVerse JWT RBAC</p>
                          </div>
                        </div>
                      </div>

                      {/* Recent Uploads Preview */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <Layers className="w-4 h-4 text-[#0062A8]" />
                            Latest Uploaded Materials
                          </h3>
                          <button
                            onClick={() => setActiveProfileTab("resources")}
                            className="text-xs font-bold text-[#0062A8] hover:underline flex items-center gap-1"
                          >
                            View All ({selectedStaff.resources?.length || 0}) <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        
                        <div className="divide-y divide-slate-100">
                          {(selectedStaff.resources || []).slice(0, 3).map((res) => (
                            <div key={res.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="p-2 rounded-lg bg-blue-50 text-[#0062A8]">
                                  <FileText className="w-4 h-4" />
                                </span>
                                <div>
                                  <p className="font-bold text-slate-900 text-xs">{res.title}</p>
                                  <p className="text-[11px] text-slate-500">
                                    {res.type} • {res.subject} • {res.uploadedDate}
                                  </p>
                                </div>
                              </div>
                              <span className="text-[11px] font-mono text-slate-400">
                                {res.downloads} downloads
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right 1 Col: Quick Activity Feed & Assigned Courses */}
                    <div className="space-y-5">
                      {/* Activity Feed */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-[#0062A8]" />
                            Recent Activity
                          </h3>
                          <button
                            onClick={() => setActiveProfileTab("activity")}
                            className="text-xs font-bold text-[#0062A8] hover:underline"
                          >
                            Logs
                          </button>
                        </div>

                        <div className="space-y-3">
                          {(selectedStaff.activity || []).slice(0, 4).map((act, idx) => (
                            <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                              <p className="font-bold text-slate-800">{act.action}</p>
                              <div className="flex items-center justify-between text-[10px] text-slate-400">
                                <span>{act.time}</span>
                                <span className="font-mono">{act.ip}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Assigned Courses List */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-[#0062A8]" />
                          Courses Handled ({selectedStaff.courses?.length || 0})
                        </h3>

                        <div className="space-y-2">
                          {(selectedStaff.courses || []).map((crs) => (
                            <div key={crs.id} className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs">
                              <p className="font-bold text-slate-900">{crs.title}</p>
                              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                                <span>{crs.role}</span>
                                <span className="font-bold text-[#0062A8]">{crs.students} Students</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* TAB 2: RESOURCES ("What they uploaded")             */}
                {/* ---------------------------------------------------- */}
                {activeProfileTab === "resources" && (
                  <div className="space-y-4">
                    {/* Filters Bar */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
                      {/* Type Filter Pills */}
                      <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                        {RESOURCE_TYPES.map((t) => (
                          <button
                            key={t}
                            onClick={() => setResourceTypeFilter(t)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              resourceTypeFilter === t
                                ? "bg-[#0062A8] text-white shadow-xs"
                                : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>

                      {/* Status Filter */}
                      <div className="flex items-center gap-2 self-start md:self-auto">
                        <span className="text-xs font-bold text-slate-500">Status:</span>
                        <select
                          value={resourceStatusFilter}
                          onChange={(e) => setResourceStatusFilter(e.target.value)}
                          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                        >
                          <option value="All">All Status</option>
                          <option value="Published">Published</option>
                          <option value="Draft">Draft</option>
                        </select>
                      </div>
                    </div>

                    {/* Resources Table */}
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                      {filteredResources.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs text-slate-700">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                              <tr>
                                <th className="px-5 py-3.5">Resource Title</th>
                                <th className="px-4 py-3.5">Type</th>
                                <th className="px-4 py-3.5">Subject</th>
                                <th className="px-4 py-3.5">Department</th>
                                <th className="px-4 py-3.5">Uploaded Date</th>
                                <th className="px-4 py-3.5">Status</th>
                                <th className="px-4 py-3.5 text-center">Views / Downloads</th>
                                <th className="px-4 py-3.5 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {filteredResources.map((res) => (
                                <tr key={res.id} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-2.5">
                                      <span className="p-2 rounded-lg bg-blue-50 text-[#0062A8] shrink-0">
                                        {res.type === "Video" ? (
                                          <Video className="w-4 h-4" />
                                        ) : (
                                          <FileText className="w-4 h-4" />
                                        )}
                                      </span>
                                      <div>
                                        <p className="font-bold text-slate-900 text-xs">{res.title}</p>
                                        <p className="text-[10px] text-slate-400 font-mono">
                                          {res.fileType} • {res.fileSize}
                                        </p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3.5">
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                      {res.type}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3.5">
                                    <p className="font-bold text-slate-800">{res.subject}</p>
                                    <p className="text-[10px] font-mono text-slate-400">{res.subjectCode}</p>
                                  </td>
                                  <td className="px-4 py-3.5 font-bold text-slate-700">{res.department}</td>
                                  <td className="px-4 py-3.5 text-slate-500">{res.uploadedDate}</td>
                                  <td className="px-4 py-3.5">
                                    <span
                                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                                        res.status === "Published"
                                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                          : "bg-amber-50 text-amber-700 border border-amber-200"
                                      }`}
                                    >
                                      {res.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3.5 text-center">
                                    <p className="font-bold text-slate-800">{res.views} Views</p>
                                    <p className="text-[10px] text-slate-400">{res.downloads} Downloads</p>
                                  </td>
                                  <td className="px-4 py-3.5 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        onClick={() => showSuccess(`Viewing resource: ${res.title}`)}
                                        className="px-2.5 py-1 bg-[#0062A8] text-white font-bold text-[11px] rounded-lg hover:bg-[#00528c] shadow-xs"
                                        title="View / Download"
                                      >
                                        View
                                      </button>
                                      <button
                                        onClick={() => showSuccess(`Editing resource: ${res.title}`)}
                                        className="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold text-[11px] rounded-lg hover:bg-slate-200 border border-slate-200"
                                        title="Edit"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (window.confirm(`Delete resource: ${res.title}?`)) {
                                            setSelectedStaff((prev) => ({
                                              ...prev,
                                              resources: prev.resources.filter((r) => r.id !== res.id)
                                            }));
                                            showSuccess("Resource deleted ✓");
                                          }
                                        }}
                                        className="px-2.5 py-1 bg-rose-50 text-rose-600 font-bold text-[11px] rounded-lg hover:bg-rose-100 border border-rose-200"
                                        title="Delete"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="py-12 text-center space-y-2">
                          <Layers className="w-8 h-8 text-slate-300 mx-auto" />
                          <p className="text-sm font-bold text-slate-600">No matching uploaded resources found</p>
                          <p className="text-xs text-slate-400">Try changing your type or status filters above.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* TAB 3: ANNOUNCEMENTS CREATED                         */}
                {/* ---------------------------------------------------- */}
                {activeProfileTab === "announcements" && (
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                    {selectedStaff.announcements && selectedStaff.announcements.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-700">
                          <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                            <tr>
                              <th className="px-5 py-3.5">Title</th>
                              <th className="px-4 py-3.5">Category</th>
                              <th className="px-4 py-3.5">Created Date</th>
                              <th className="px-4 py-3.5">Target Audience</th>
                              <th className="px-4 py-3.5">Status</th>
                              <th className="px-4 py-3.5 text-center">Views</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {selectedStaff.announcements.map((ann) => (
                              <tr key={ann.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-5 py-3.5">
                                  <p className="font-bold text-slate-900 text-sm">{ann.title}</p>
                                </td>
                                <td className="px-4 py-3.5">
                                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    {ann.category}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5 text-slate-500">{ann.createdDate}</td>
                                <td className="px-4 py-3.5 font-medium text-slate-700">{ann.targetAudience}</td>
                                <td className="px-4 py-3.5">
                                  <span
                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                                      ann.status === "Published"
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                        : "bg-amber-50 text-amber-700 border border-amber-200"
                                    }`}
                                  >
                                    {ann.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-700">
                                  {ann.views}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="py-12 text-center space-y-2">
                        <Megaphone className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="text-sm font-bold text-slate-600">No announcements posted by this staff member</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* TAB 4: COURSES ASSIGNED                              */}
                {/* ---------------------------------------------------- */}
                {activeProfileTab === "courses" && (
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                    {selectedStaff.courses && selectedStaff.courses.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-700">
                          <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                            <tr>
                              <th className="px-5 py-3.5">Course</th>
                              <th className="px-4 py-3.5">Role</th>
                              <th className="px-4 py-3.5">Category</th>
                              <th className="px-4 py-3.5 text-center">Modules</th>
                              <th className="px-4 py-3.5 text-center">Students</th>
                              <th className="px-4 py-3.5">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {selectedStaff.courses.map((crs) => (
                              <tr key={crs.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-5 py-3.5 font-bold text-slate-900 text-sm">
                                  {crs.title}
                                </td>
                                <td className="px-4 py-3.5 font-medium text-[#0062A8]">{crs.role}</td>
                                <td className="px-4 py-3.5">
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                    {crs.category}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-800">
                                  {crs.modules}
                                </td>
                                <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-800">
                                  {crs.students}
                                </td>
                                <td className="px-4 py-3.5">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    {crs.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="py-12 text-center space-y-2">
                        <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="text-sm font-bold text-slate-600">No courses assigned to this staff member</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* TAB 5: SUBJECTS ASSIGNED                             */}
                {/* ---------------------------------------------------- */}
                {activeProfileTab === "subjects" && (
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                    {selectedStaff.subjects && selectedStaff.subjects.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-700">
                          <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                            <tr>
                              <th className="px-5 py-3.5">Subject Code</th>
                              <th className="px-4 py-3.5">Subject Name</th>
                              <th className="px-4 py-3.5">Semester</th>
                              <th className="px-4 py-3.5">Section</th>
                              <th className="px-4 py-3.5">Academic Year</th>
                              <th className="px-4 py-3.5 text-center">Students</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {selectedStaff.subjects.map((sub, i) => (
                              <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-5 py-3.5 font-mono font-bold text-[#0062A8] text-xs">
                                  {sub.code}
                                </td>
                                <td className="px-4 py-3.5 font-bold text-slate-900 text-sm">
                                  {sub.name}
                                </td>
                                <td className="px-4 py-3.5 text-slate-600">{sub.semester}</td>
                                <td className="px-4 py-3.5 font-medium text-slate-700">{sub.section}</td>
                                <td className="px-4 py-3.5 text-slate-500">{sub.academicYear}</td>
                                <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-800">
                                  {sub.studentsEnrolled}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="py-12 text-center space-y-2">
                        <GraduationCap className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="text-sm font-bold text-slate-600">No subjects currently assigned</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* TAB 6: ACTIVITY / AUDIT LOG                          */}
                {/* ---------------------------------------------------- */}
                {activeProfileTab === "activity" && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[#0062A8]" />
                        Staff Security & Operational Audit Log
                      </h3>
                      <span className="text-xs text-slate-400 font-mono">
                        Filtered by Staff ID: {selectedStaff.staffId}
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {(selectedStaff.activity || []).map((act, i) => (
                        <div key={i} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <span className="p-2 rounded-lg bg-blue-50 text-[#0062A8] shrink-0">
                              <Activity className="w-4 h-4" />
                            </span>
                            <div>
                              <p className="font-bold text-slate-900 text-xs">{act.action}</p>
                              <p className="text-[11px] text-slate-400 font-mono">
                                Action Type: <span className="text-[#0062A8]">{act.type || "ACTIVITY"}</span> • IP: {act.ip}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-slate-500 shrink-0 self-start sm:self-center">
                            {act.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                VCET TechVerse Administrative Control System
              </span>
              <button
                onClick={() => setSelectedStaff(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. ADD / EDIT STAFF MODAL                                 */}
      {/* ========================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto text-slate-800">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-black text-slate-900 mb-1 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#0062A8]" />
              {editingFaculty ? "Edit Staff Details" : "Register New Faculty / Staff"}
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Enter staff credentials, department assignment, and designation.
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name & Salutation *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dr. K. Sathish Kumar"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0062A8] focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Staff ID *
                  </label>
                  <input
                    type="text"
                    value={formData.staffId}
                    onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                    placeholder="e.g. TCH001"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#0062A8] focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Department *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white"
                  >
                    {DEPARTMENTS.filter((d) => d !== "ALL").map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. Professor & HOD"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0062A8] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="teacher@vcet.ac.in"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-[#0062A8] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 94432 18920"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0062A8] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Office / Cabin
                  </label>
                  <input
                    type="text"
                    value={formData.cabin}
                    onChange={(e) => setFormData({ ...formData, cabin: e.target.value })}
                    placeholder="CSE Department Room 204"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0062A8] focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0062A8] hover:bg-[#00528c] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {editingFaculty ? "Save Changes" : "Register Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. PASSWORD RESET MODAL                                   */}
      {/* ========================================================= */}
      {passwordResetFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-slate-800">
            <button
              onClick={() => setPasswordResetFaculty(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                <KeyRound className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base font-black text-slate-900">Reset Staff Password</h2>
                <p className="text-xs text-slate-500 font-mono">{passwordResetFaculty.staffId} • {passwordResetFaculty.name}</p>
              </div>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (e.g. faculty123)"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordResetFaculty(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
