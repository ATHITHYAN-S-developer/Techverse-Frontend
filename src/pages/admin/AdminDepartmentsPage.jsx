import React, { useState, useEffect } from "react";
import { Building2, Plus, Edit, CheckCircle, Ban, Users, BookOpen, Layers, X, Loader2 } from "lucide-react";
import { departmentService } from "../../services/departmentService";
import { useToast } from "../../context/ToastContext";
import ConfirmDialog from "../../components/ConfirmDialog";

const EMPTY_FORM = { code: "", name: "", description: "", hodName: "", icon: "Layers" };

export default function AdminDepartmentsPage() {
  const { showSuccess, showError } = useToast();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, dept: null });
  const [togglingDept, setTogglingDept] = useState(null);

  const loadDepartments = async () => {
    try {
      const list = await departmentService.getDepartments({ all: true });
      setDepartments(Array.isArray(list) ? list : []);
    } catch {
      showError("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAdd = () => {
    setEditing(null);
    setFormData(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (dept) => {
    setEditing(dept);
    setFormData({
      code: dept.code || "",
      name: dept.name || "",
      description: dept.description || "",
      hodName: dept.hodName || dept.hod || "",
      icon: dept.icon || "Layers",
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await departmentService.updateDepartment(editing._id, {
          name: formData.name,
          description: formData.description,
          hodName: formData.hodName,
          icon: formData.icon,
        });
        showSuccess("Department updated ✓");
      } else {
        await departmentService.createDepartment(formData);
        showSuccess("Department created ✓");
      }
      setModalOpen(false);
      await loadDepartments();
    } catch (err) {
      showError(err.message || "Failed to save department");
    } finally {
      setSaving(false);
    }
  };

  const toggleDept = async (dept) => {
    setTogglingDept(dept._id);
    try {
      await departmentService.updateDepartment(dept._id, { isActive: !dept.isActive });
      showSuccess(dept.isActive ? "Department deactivated ✓" : "Department activated ✓");
      await loadDepartments();
    } catch (err) {
      showError(err.message || "Failed to update department status");
    } finally {
      setTogglingDept(null);
    }
  };

  const confirmDelete = async () => {
    const dept = deleteDialog.dept;
    if (!dept) return;
    try {
      await departmentService.deleteDepartment(dept._id);
      showSuccess("Department permanently deleted ✓");
      setDeleteDialog({ open: false, dept: null });
      await loadDepartments();
    } catch (err) {
      showError(err.message || "Failed to delete department");
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-xs font-bold text-slate-500">
        Loading Departments from MongoDB...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Department Management ({departments.length} Engineering Branches)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Create, edit, activate, deactivate, or permanently delete departments.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0062A8] hover:bg-[#00528c] text-white font-bold text-xs shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mr-3" /> Loading departments...
        </div>
      ) : departments.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400">
          <Building2 className="w-10 h-10 mx-auto mb-3" />
          <p className="text-sm font-semibold">No departments yet. Click "Add Department" to create the first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((d) => (
            <div
              key={d._id || d.code}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-blue-50 text-[#0062A8] border border-blue-200 font-mono">
                    {d.code}
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                    d.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}>
                    {d.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">{d.name}</h3>
                {d.description && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{d.description}</p>
                )}
                {d.hodName && (
                  <p className="text-xs text-slate-600 mt-1 font-medium">HOD: {d.hodName}</p>
                )}

                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#0062A8]" />
                    <span>{d.stats?.students ?? 0} Students</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{d.stats?.resources ?? 0} Resources</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-violet-600" />
                    <span>{d.stats?.teachers ?? 0} Teachers</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-600" />
                    <span>{d.stats?.subjects ?? 0} Subjects</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => openEdit(d)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit Department"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  onClick={() => toggleDept(d)}
                  disabled={togglingDept === d._id}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors disabled:opacity-50 ${
                    d.isActive
                      ? "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
                      : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  {d.isActive ? "Deactivate" : "Activate"}
                </button>

                <button
                  onClick={() => setDeleteDialog({ open: true, dept: d })}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete Department"
                >
                  <Ban className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm text-slate-900">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editing ? "Edit Department" : "Add Department"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editing}
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="CSE"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Icon</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="Layers"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Computer Science & Engineering"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">HOD Name</label>
                <input
                  type="text"
                  value={formData.hodName}
                  onChange={(e) => setFormData({ ...formData, hodName: e.target.value })}
                  placeholder="Dr. ..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the department"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 resize-none"
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
                  {editing ? "Save Changes" : "Create Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteDialog.open}
        title="Delete this department permanently?"
        message={`This will permanently remove ${deleteDialog.dept?.name || "this department"}, all of its subjects, and every uploaded note/resource file. Users assigned to it will be unassigned. This cannot be undone.`}
        confirmLabel="Delete Department"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog({ open: false, dept: null })}
      />
    </div>
  );
}