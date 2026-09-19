import React, { useState, useEffect } from "react";
import { BookOpen, Search, Plus, Edit, X, Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { subjectService, SUBJECT_SEMESTERS } from "../../services/subjectService";
import { departmentService } from "../../services/departmentService";

const EMPTY_FORM = { code: "", name: "", departmentId: "", semester: 4, credits: 3 };

export default function FacultySubjectsPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const ownDeptId = user?.departmentId || "";
  const ownDeptCode = user?.department?.toUpperCase?.() || "";

  const [department, setDepartment] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(null);

  const loadAll = async () => {
    if (!ownDeptId) return;
    try {
      const [deptList, subjectList] = await Promise.all([
        departmentService.getDepartments({ all: true }),
        subjectService.getSubjectsByDepartment(ownDeptId, { all: true }),
      ]);
      const dept = (deptList || []).find((d) => d._id === ownDeptId || d.id === ownDeptId) || null;
      setDepartment(dept);
      setSubjects(Array.isArray(subjectList) ? subjectList : []);
      if (dept) setFormData((f) => ({ ...f, departmentId: dept._id || dept.id }));
    } catch {
      showError("Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownDeptId]);

  const deptName = department?.name || user?.department || "Your Department";

  const openAdd = () => {
    setEditing(null);
    setFormData({
      code: "",
      name: "",
      departmentId: department?._id || ownDeptId,
      semester: 4,
      credits: 3,
    });
    setModalOpen(true);
  };

  const openEdit = (subject) => {
    setEditing(subject);
    setFormData({
      code: subject.code || "",
      name: subject.name || "",
      departmentId: department?._id || ownDeptId,
      semester: subject.semester || 4,
      credits: subject.credits || 3,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        departmentId: department?._id || ownDeptId,
        code: formData.code,
        name: formData.name,
        semester: Number(formData.semester),
        credits: Number(formData.credits) || 3,
      };
      if (editing) {
        await subjectService.updateSubject(editing._id, payload);
        showSuccess("Subject updated ✓");
      } else {
        await subjectService.createSubject(payload);
        showSuccess("Subject added to department curriculum ✓");
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

  const filtered = subjects.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Manage Subjects</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Add and maintain subjects for your department, then upload notes for each subject.
          </p>
          <span className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0062A8] text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            {deptName} ({department?.code || ownDeptCode})
          </span>
        </div>

        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0062A8] hover:bg-[#00528c] text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search ${deptName} subjects by code or name...`}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-xs sm:text-sm border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Subject Code & Name</th>
                <th className="px-4 py-3.5">Semester</th>
                <th className="px-4 py-3.5">Credits</th>
                <th className="px-4 py-3.5">Resources</th>
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
                    <BookOpen className="w-6 h-6 mx-auto mb-2" /> No subjects yet. Click "Add Subject" to add one.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s._id || s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 text-sm">{s.name}</div>
                      <div className="text-[#0062A8] font-mono font-bold text-[11px] mt-0.5">{s.code}</div>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-700">Sem {s.semester}</td>
                    <td className="px-4 py-4 text-slate-600 font-medium">{s.credits ?? 3}</td>
                    <td className="px-4 py-4 text-slate-600 font-medium">{s.resourceCount ?? 0}</td>
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
                {editing ? "Edit Subject" : "Add Subject to " + (department?.name || "Your Department")}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-4 text-xs">
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
                  className="px-5 py-2 bg-[#0062A8] text-white font-bold rounded-xl shadow hover:bg-[#00528c] disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editing ? "Save Changes" : "Add Subject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}