import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Trash2,
  Edit,
  Download,
  X,
  Upload,
  FileText,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { resourceService, RESOURCE_TYPES, resolveResourceUrl } from "../../services/resourceService";
import { subjectService } from "../../services/subjectService";
import ConfirmDialog from "../../components/ConfirmDialog";

const EMPTY_FORM = {
  title: "",
  subjectId: "",
  type: "notes",
  unit: "",
  description: "",
  tags: "",
  file: null,
  externalUrl: "",
};

export default function FacultyResourcesPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const ownDeptId = user?.departmentId || "";
  const ownDeptCode = user?.department?.toUpperCase?.() || "";

  const [resources, setResources] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadResources();
    loadSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.departmentId]);

  const loadResources = async () => {
    try {
      const data = await resourceService.getAllResources();
      const list = Array.isArray(data) ? data : [];
      const filtered = ownDeptId
        ? list.filter((r) => r.departmentId?._id === ownDeptId || r.departmentId === ownDeptId)
        : list;
      setResources(filtered);
    } catch {
      showError("Failed to load department resources");
    } finally {
      setLoading(false);
    }
  };

  const loadSubjects = async () => {
    if (!ownDeptId) return;
    try {
      const data = await subjectService.getSubjectsByDepartment(ownDeptId);
      setSubjects(Array.isArray(data) ? data : []);
    } catch {
      setSubjects([]);
    }
  };

  const openAdd = () => {
    setEditingResource(null);
    setFormData(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (res) => {
    setEditingResource(res);
    setFormData({
      title: res.title || "",
      subjectId: res.subjectId?._id || res.subjectId || "",
      type: res.type || "notes",
      unit: res.unit ? String(res.unit) : "",
      description: res.description || "",
      tags: Array.isArray(res.tags) ? res.tags.join(", ") : "",
      file: null,
      externalUrl: res.fileUrl?.startsWith("/uploads") ? "" : res.fileUrl || res.externalUrl || "",
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showError("Please enter a resource title");
      return;
    }
    if (!formData.subjectId) {
      showError("Please select a subject");
      return;
    }
    if (!editingResource && !formData.file && !formData.externalUrl.trim()) {
      showError("Please attach a file or enter an external link");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        departmentId: ownDeptId,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };
      if (editingResource) {
        const targetId = editingResource._id || editingResource.id;
        await resourceService.updateResource(targetId, payload);
        showSuccess("Resource updated successfully ✓");
      } else {
        await resourceService.addResource(payload);
        showSuccess("Resource uploaded to department portal ✓");
      }
      setModalOpen(false);
      loadResources();
    } catch (err) {
      showError(err?.message || "Failed to save resource");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      await resourceService.deleteResource(deleteDialog.id);
      showSuccess("Resource removed successfully ✓");
      setDeleteDialog({ open: false, id: null });
      loadResources();
    } catch (err) {
      showError(err?.message || "Failed to delete resource");
    }
  };

  const handleOpenFile = async (res) => {
    try {
      resourceService.trackDownload(res._id || res.id);
    } catch {
      /* counter is best-effort */
    }
    const url = resolveResourceUrl(res.fileUrl || res.externalUrl || res.downloadUrl);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const subjectLabel = (res) => {
    const s = res.subjectId;
    if (typeof s === "object" && s) return `${s.code} - ${s.name}`;
    const match = subjects.find((x) => x._id === (typeof s === "string" ? s : null));
    return match ? `${match.code} - ${match.name}` : "Subject";
  };

  const q = (searchTerm || "").toLowerCase().trim();
  const filtered = useMemo(() => {
    return resources.filter((r) => {
      const title = (r.title || "").toLowerCase();
      const desc = (r.description || "").toLowerCase();
      const tags = (Array.isArray(r.tags) ? r.tags.join(" ") : "").toLowerCase();
      return !q || title.includes(q) || desc.includes(q) || tags.includes(q);
    });
  }, [resources, q]);

  const filePreview = formData.file
    ? URL.createObjectURL(formData.file)
    : formData.externalUrl && !formData.externalUrl.startsWith("/uploads")
      ? formData.externalUrl
      : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Department E-Resources Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {ownDeptCode
              ? `Upload and manage academic notes, lab manuals, and question banks for the ${ownDeptCode} department.`
              : "Upload and manage academic resources for your department."}
          </p>
          {ownDeptCode && (
            <span className="inline-flex items-center mt-2 px-2.5 py-1 rounded-full bg-blue-50 text-[#0062A8] font-bold text-[11px] border border-blue-200">
              Your Department: {ownDeptCode}
            </span>
          )}
        </div>

        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0062A8] hover:bg-[#0B4A8F] text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Resource</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search notes, labs, question banks..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-xs sm:text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0062A8]/20 focus:border-[#0062A8]"
          />
        </div>
        <span className="text-xs font-semibold text-slate-500 px-1 whitespace-nowrap">
          {filtered.length} resource{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Resource</th>
                <th className="px-4 py-3.5">Subject</th>
                <th className="px-4 py-3.5">Type</th>
                <th className="px-4 py-3.5">Downloads</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    Loading resources...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    No departmental resources yet. Click "Add New Resource" to upload the first one.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const itemId = item._id || item.id;
                  return (
                    <tr key={itemId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900 text-sm line-clamp-1">
                          {item.title || "Academic Resource"}
                        </div>
                        <div className="text-slate-400 text-[11px] mt-0.5">
                          {item.fileSize || "—"} •{" "}
                          {(item.mimeType || item.fileType || "PDF")
                            .split("/")
                            .pop()
                            .toUpperCase()}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-semibold text-slate-800">{subjectLabel(item)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#0062A8] border border-blue-200">
                          {(item.type || "notes").replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-4">{item.downloadsCount || 0}</td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenFile(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#0062A8] hover:bg-slate-100"
                            title={item.fileUrl ? "Open / Download file" : "Open link"}
                          >
                            {item.fileUrl ? <Download className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => openEdit(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#0062A8] hover:bg-slate-100"
                            title="Edit Resource"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteDialog({ open: true, id: itemId })}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete Resource"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingResource ? "Edit Resource" : "Upload Department Resource"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Resource Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Unit 3 DBMS Relational Algebra & SQL Notes"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#0062A8]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subject *</label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                >
                  <option value="">Select a subject...</option>
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.code} - {s.name} (Sem {s.semester})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Resource Category</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  >
                    {RESOURCE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unit (optional)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="e.g. 3"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Upload File (PDF / Document / Image / ZIP, max 50MB)
                </label>
                <label className="flex items-center justify-center gap-2 w-full p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#0062A8] bg-slate-50 cursor-pointer">
                  <Upload className="w-4 h-4 text-[#0062A8]" />
                  <span className="text-slate-600 font-semibold">
                    {formData.file ? formData.file.name : "Choose file..."}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.gif,.txt,.zip"
                    onChange={(e) =>
                      setFormData({ ...formData, file: e.target.files?.[0] || null })
                    }
                  />
                </label>
                {formData.file && formData.file.type.startsWith("image/") && filePreview && (
                  <img
                    src={filePreview}
                    alt="preview"
                    className="mt-2 rounded-xl max-h-40 object-cover border border-slate-200"
                  />
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Or External Link (for videos / websites)</label>
                <input
                  type="text"
                  value={formData.externalUrl}
                  onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Short description of this study material"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="TOC, Automata, Unit 1"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#0062A8] hover:bg-[#0B4A8F] text-white font-bold shadow-md disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingResource ? "Save Changes" : "Upload to Portal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteDialog.open}
        title="Delete Resource?"
        message="This permanently removes the resource and its stored file from the server."
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ open: false, id: null })}
      />
    </div>
  );
}