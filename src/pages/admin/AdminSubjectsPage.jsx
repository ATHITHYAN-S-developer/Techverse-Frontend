import React, { useState, useEffect } from "react";
import { BookOpen, Search, Plus, Trash2, Edit, X, Loader2 } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { subjectService, SUBJECT_SEMESTERS } from "../../services/subjectService";
import { departmentService } from "../../services/departmentService";
import ConfirmDialog from "../../components/ConfirmDialog";

const EMPTY_FORM = { code: "", name: "", departmentId: "", semester: 4, credits: 3 };

export default function AdminSubjectsPage() {
  const { showSuccess, showError } = useToast();
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, subject: null });
  const [toggling, setToggling] = useState(null);

  const loadAll = async () => {
    try {
      const [deptList, subjectList] = await Promise.all([
        departmentService.getDepartments({ all: true }),
        subjectService.getSubjectsByDepartment("", { all: true }),
      ]);
      setDepartments(Array.isArray(deptList) ? deptList : []);
      setSubjects(Array.isArray(subjectList) ? subjectList : []);
      setFormData((f) => {
        if (f.departmentId) return f;
        const first = deptList[0];
        return { ...f, departmentId: first?._id || first?.id || "" };
      });
    } catch {
      showError("Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deptById = (id) => departments.find((d) => d._id === id || d.id === id);

  const deptCode = (s) => {
    const dep = s.departmentId;
    if (typeof dep === "object" && dep) return dep.code || dep.name || "";
    return deptById(dep)?.code || dep || "—";
  };

  const openAdd = () => {
    setEditing(null);
    const first = departments.find((d) => d.isActive) || departments[0];
    setFormData({ ...EMPTY_FORM, departmentId: first?._id || first?.id || "" });
    setModalOpen(true);
  };

  const openEdit = (subject) => {
    setEditing(subject);
    setFormData({
      code: subject.code || "",
      name: subject.name || "",
      departmentId: subject.departmentId?._id || subject.departmentId || subject.department || "",
      semester: subject.semester || 4,
      credits: subject.credits || 3,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const { code, name, semester, credits } = formData;
        await subjectService.updateSubject(editing._id, { code, name, semester, credits });
        showSuccess("Subject updated ✓");
      } else {
        await subjectService.createSubject(formData);
        showSuccess("Subject added to curriculum ✓");
      }
      setModalOpen(false);
      await loadAll();
    } catch (err) {
      showError(err.message || "Failed to save subject");
    } finally {
      setSaving(false);
    }
  };

  const toggleSubject = async (subject) => {
    setToggling(subject._id);
    try {
      await subjectService.updateSubject(subject._id, { isActive: !subject.isActive });
      showSuccess(subject.isActive ? "Subject deactivated ✓" : "Subject activated ✓");
      await loadAll();
    } catch (err) {
      showError(err.message || "Failed to update subject status");
    } finally {
      setToggling(null);
    }
  };

  const confirmDelete = async () => {
    const subject = deleteDialog.subject;
    if (!subject) return;
    try {
      await subjectService.deleteSubject(subject._id);
      showSuccess(`Subject "${subject.name}" permanently deleted ✓`);
      setDeleteDialog({ open: false, subject: null });
      await loadAll();
    } catch (err) {
      showError(err.message || "Failed to delete subject");
    }
  };

  const filtered = subjects.filter((s) => {
    const code = typeof s.departmentId === "object" && s.departmentId ? s.departmentId.code : deptById(s.departmentId)?.code;
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === "ALL" || code === deptFilter || s.departmentId === deptFilter || s.departmentId?._id === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Subjects & Curriculum Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Create, edit, activate, deactivate, or delete subjects per department. Deleted subjects also remove their uploaded notes.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-vcet-blue hover:bg-vcet-blue-hover text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search subjects by code (CS8492...) or name..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-xs sm:text-sm border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 border border-slate-300 w-full md:w-auto"
        >
          <option value="ALL">All Departments</option>
          {departments.map((d) => (
            <option key={d._id || d.code} value={d.code}>
              {d.code}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Subject Code & Name</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Semester</th>
                <th className="px-4 py-3.5">Credits</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" /> Loading subjects...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-slate-400 text-sm">
                    <BookOpen className="w-6 h-6 mx-auto mb-2" /> No subjects match. Click "Add Subject" to add one.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s._id || s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 text-sm">{s.name}</div>
                      <div className="text-vcet-blue font-mono font-bold text-[11px] mt-0.5">{s.code}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 font-semibold text-vcet-blue text-[11px]">
                        {deptCode(s)}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-700">Sem {s.semester}</td>
                    <td className="px-4 py-4 text-slate-600 font-medium">{s.credits ?? 3}</td>
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
                        title="Edit Subject"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleSubject(s)}
                        disabled={toggling === s._id}
                        className={`ml-1 px-2.5 py-1.5 text-[11px] font-bold rounded-lg border transition-colors disabled:opacity-50 ${
                          s.isActive
                            ? "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
                            : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        {s.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => setDeleteDialog({ open: true, subject: s })}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
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
                {editing ? "Edit Subject" : "Add Curriculum Subject"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-4 text-xs">
              {!editing && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Department *</label>
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
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subject Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="CS8492"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Semester</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  >
                    {SUBJECT_SEMESTERS.map((s) => (
                      <option key={s} value={s}>Sem {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Database Management Systems"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Credits</label>
                <input
                  type="number"
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
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
                  className="px-5 py-2 bg-vcet-blue text-white font-bold rounded-xl shadow hover:bg-vcet-blue-hover disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editing ? "Save Changes" : "Save Subject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteDialog.open}
        title="Delete this subject permanently?"
        message={`This will permanently remove ${deleteDialog.subject?.name || "this subject"} (${deleteDialog.subject?.code || ""}) and every uploaded note/resource file attached to it. This cannot be undone.`}
        confirmLabel="Delete Subject"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog({ open: false, subject: null })}
      />
    </div>
  );
}