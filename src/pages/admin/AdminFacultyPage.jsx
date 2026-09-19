import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  Trash2,
  Edit,
  KeyRound,
  X,
  Loader2,
  ShieldCheck,
  Ban,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { api } from "../../services/api";
import { departmentService } from "../../services/departmentService";
import ConfirmDialog from "../../components/ConfirmDialog";

const EMPTY_FORM = {
  name: "",
  staffId: "",
  username: "",
  email: "",
  password: "faculty123",
  designation: "Assistant Professor",
  departmentId: "",
};

export default function AdminFacultyPage() {
  const { showSuccess, showError } = useToast();
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [resetDialog, setResetDialog] = useState({ open: false, staff: null, password: "" });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, staff: null });
  const [togglingId, setTogglingId] = useState(null);

  const loadAll = async () => {
    try {
      const [deptList, staffRes] = await Promise.all([
        departmentService.getDepartments({ all: true }),
        api.get("/admin/users?role=teacher&limit=100"),
      ]);
      setDepartments(Array.isArray(deptList) ? deptList : []);
      const users = staffRes?.users || staffRes?.data?.users || [];
      setStaff(Array.isArray(users) ? users : []);
    } catch {
      showError("Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deptOf = (s) => {
    const dep = s.departmentId;
    if (typeof dep === "object" && dep) return dep;
    return departments.find((d) => d._id === dep || d.id === dep) || null;
  };

  const openAdd = () => {
    setEditing(null);
    const first = departments.find((d) => d.isActive) || departments[0];
    setFormData({ ...EMPTY_FORM, departmentId: first?._id || first?.id || "" });
    setModalOpen(true);
  };

  const openEdit = (member) => {
    setEditing(member);
    setFormData({
      name: member.name || "",
      staffId: member.staffId || "",
      username: member.username || "",
      email: member.email || "",
      designation: member.designation || "Assistant Professor",
      departmentId: member.departmentId?._id || member.departmentId || member.department || "",
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const { name, staffId, username, email, designation, departmentId } = formData;
        await api.put(`/admin/users/${editing._id}`, {
          name,
          staffId,
          username,
          email,
          designation,
          departmentId,
        });
        showSuccess("Staff record updated ✓");
      } else {
        await api.post("/admin/users", {
          role: "teacher",
          name: formData.name,
          staffId: formData.staffId,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          designation: formData.designation,
          departmentId: formData.departmentId,
        });
        showSuccess("Staff account created ✓ They can log in with their Staff ID.");
      }
      setModalOpen(false);
      await loadAll();
    } catch (err) {
      showError(err.message || "Failed to save staff");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (member) => {
    setTogglingId(member._id);
    try {
      await api.put(`/admin/users/${member._id}/status`);
      showSuccess(member.isActive ? "Staff deactivated ✓" : "Staff activated ✓");
      await loadAll();
    } catch (err) {
      showError(err.message || "Failed to update status");
    } finally {
      setTogglingId(null);
    }
  };

  const confirmResetPassword = async () => {
    try {
      await api.put(`/admin/users/${resetDialog.staff._id}/reset-password`, {
        newPassword: resetDialog.password,
      });
      showSuccess(`Password reset for ${resetDialog.staff.name} ✓`);
      setResetDialog({ open: false, staff: null, password: "" });
    } catch (err) {
      showError(err.message || "Failed to reset password");
    }
  };

  const confirmDelete = async () => {
    const member = deleteDialog.staff;
    if (!member) return;
    try {
      await api.delete(`/admin/users/${member._id}`);
      showSuccess(`Staff "${member.name}" permanently removed ✓`);
      setDeleteDialog({ open: false, staff: null });
      await loadAll();
    } catch (err) {
      showError(err.message || "Failed to remove staff");
    }
  };

  const filtered = staff.filter((s) => {
    const dept = deptOf(s);
    const deptCode = dept?.code || dept?.name || s.department || "—";
    const matchesSearch =
      (s.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.staffId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === "ALL" || deptCode === deptFilter || s.departmentId === deptFilter || s.departmentId?._id === deptFilter;
    const matchesStatus =
      statusFilter === "ALL" || (statusFilter === "active" && s.isActive) || (statusFilter === "inactive" && !s.isActive);
    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Staff Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Create staff accounts, assign them to a department, activate/deactivate, reset passwords, or remove them.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0062A8] hover:bg-[#00528c] text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, staff ID, or email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-xs sm:text-sm border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 border border-slate-300 focus:outline-none w-full md:w-auto"
        >
          <option value="ALL">All Departments</option>
          {departments.map((d) => (
            <option key={d._id || d.code} value={d.code}>
              {d.code}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 border border-slate-300 focus:outline-none w-full md:w-auto"
        >
          <option value="ALL">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Staff</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Designation</th>
                <th className="px-4 py-3.5">Contact</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" /> Loading staff...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-slate-400 text-sm">
                    <Users className="w-6 h-6 mx-auto mb-2" /> No staff match. Click "Add Staff" to create one.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const dept = deptOf(s);
                  return (
                    <tr key={s._id || s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900 text-sm">{s.name}</div>
                        <div className="text-[#0062A8] font-mono font-bold text-[11px] mt-0.5">{s.staffId || s.username || s.email}</div>
                      </td>
                      <td className="px-4 py-4">
                        {dept && dept.code ? (
                          <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 font-semibold text-[#0062A8] text-[11px]">
                            {dept.code}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 font-semibold text-amber-700 text-[11px]">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-slate-600 font-medium">{s.designation || "—"}</td>
                      <td className="px-4 py-4 text-slate-600 font-medium">{s.email || "—"}</td>
                      <td className="px-4 py-4">
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          s.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}>
                          {s.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => openEdit(s)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Staff"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setResetDialog({ open: true, staff: s, password: "" })}
                          className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Reset Password"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleStatus(s)}
                          disabled={togglingId === s._id}
                          className={`ml-1 px-2.5 py-1.5 text-[11px] font-bold rounded-lg border transition-colors disabled:opacity-50 ${
                            s.isActive
                              ? "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
                              : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {s.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => setDeleteDialog({ open: true, staff: s })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove Staff"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm text-slate-900">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editing ? "Edit Staff" : "New Staff Account"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Dr. S. Example"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Staff ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.staffId}
                    onChange={(e) => setFormData({ ...formData, staffId: e.target.value.toUpperCase() })}
                    placeholder="VCET-FAC-CSE-001"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                    placeholder="prof.example"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="prof@vcet.ac.in"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              {!editing && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Temporary Password *</label>
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="faculty123"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Department Assignment *</label>
                <select
                  required
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                >
                  {departments.map((d) => (
                    <option key={d._id || d.code} value={d._id || d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Designation</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="Assistant Professor"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#0062A8] text-white font-bold rounded-xl shadow hover:bg-[#00528c] disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editing ? "Save Changes" : "Create Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {resetDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm text-slate-900">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Reset Password</h3>
              <button onClick={() => setResetDialog({ open: false, staff: null, password: "" })} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                confirmResetPassword();
              }}
              className="space-y-4 mt-4 text-xs"
            >
              <p className="text-slate-500">Set a new password for <span className="font-bold text-slate-700">{resetDialog.staff?.name}</span> ({resetDialog.staff?.staffId}).</p>
              <div>
                <label className="font-bold text-slate-700 block mb-1">New Password *</label>
                <input
                  type="text"
                  required
                  value={resetDialog.password}
                  onChange={(e) => setResetDialog({ ...resetDialog, password: e.target.value })}
                  placeholder="faculty123"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono"
                />
              </div>
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button type="button" onClick={() => setResetDialog({ open: false, staff: null, password: "" })} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-[#0062A8] text-white font-bold rounded-xl shadow hover:bg-[#00528c]">
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteDialog.open}
        title="Remove this staff permanently?"
        message={`This will permanently delete ${deleteDialog.staff?.name || "this staff"} (${deleteDialog.staff?.staffId || ""}) and their account. They will no longer be able to log in. This cannot be undone.`}
        confirmLabel="Remove Staff"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog({ open: false, staff: null })}
      />
    </div>
  );
}