import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  Download,
  CheckCircle,
  X,
  Upload,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { resourceService } from "../../services/resourceService";
import ConfirmDialog from "../../components/ConfirmDialog";

export default function FacultyResourcesPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [resources, setResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    subjectName: "Database Management Systems",
    subjectCode: "CS8492",
    semester: 4,
    type: "Notes",
    description: "",
    url: ""
  });

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      const data = await resourceService.getAllResources();
      const list = Array.isArray(data) ? data : [];
      // Scoped to faculty's department
      const facultyDept = (user?.department || "CSE").toUpperCase();
      const deptFiltered = list.filter((r) => {
        if (!r) return false;
        const rDept = (r.department || "").toUpperCase();
        return !rDept || rDept === facultyDept || rDept.includes("CSE") || rDept.includes("COMPUTER");
      });
      setResources(deptFiltered);
    } catch (err) {
      showError("Failed to load department resources");
    }
  };

  const handleOpenAdd = () => {
    setEditingResource(null);
    setFormData({
      title: "",
      subjectName: "Database Management Systems",
      subjectCode: "CS8492",
      semester: 4,
      type: "Notes",
      description: "",
      url: "https://vcet.ac.in/resources/sample-note.pdf"
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (res) => {
    setEditingResource(res);
    setFormData({
      title: res.title || res.name || "",
      subjectName: res.subjectName || "Database Management Systems",
      subjectCode: res.subjectCode || "CS8492",
      semester: res.semester || 4,
      type: res.type || "Notes",
      description: res.description || "",
      url: res.url || ""
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showError("Please enter a resource title");
      return;
    }

    try {
      if (editingResource) {
        const targetId = editingResource._id || editingResource.id;
        await resourceService.updateResource(targetId, formData);
        showSuccess("Resource updated successfully ✓");
      } else {
        await resourceService.addResource(
          {
            ...formData,
            department: user?.department || "CSE"
          },
          user
        );
        showSuccess("Resource uploaded to department portal ✓");
      }
      setModalOpen(false);
      loadResources();
    } catch (err) {
      showError("Failed to save resource");
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
      showError("Failed to delete resource");
    }
  };

  const q = (searchTerm || "").toLowerCase().trim();
  const filtered = resources.filter((r) => {
    if (!r || typeof r !== "object") return false;
    const title = (r.title || r.name || "").toLowerCase();
    const subName = (r.subjectName || "").toLowerCase();
    const subCode = (r.subjectCode || "").toLowerCase();
    const matchesSearch = !q || title.includes(q) || subName.includes(q) || subCode.includes(q);
    const matchesSem = selectedSemester === "ALL" || String(r.semester || "") === selectedSemester;
    const matchesType =
      selectedType === "ALL" ||
      (r.type || "").toLowerCase() === (selectedType || "").toLowerCase();
    return matchesSearch && matchesSem && matchesType;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Department E-Resources Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Upload, update, and manage academic notes, lab manuals, and question banks for CSE students.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0062A8] hover:bg-[#0B4A8F] text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Resource</span>
        </button>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search CSE notes, DBMS, DSA, Lab Manuals..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-xs sm:text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0062A8]/20 focus:border-[#0062A8]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200 focus:outline-none"
          >
            <option value="ALL">All Semesters</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
            <option value="3">Semester 3</option>
            <option value="4">Semester 4</option>
            <option value="5">Semester 5</option>
            <option value="6">Semester 6</option>
            <option value="7">Semester 7</option>
            <option value="8">Semester 8</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200 focus:outline-none"
          >
            <option value="ALL">All Resource Types</option>
            <option value="Notes">Unit Lecture Notes</option>
            <option value="Question Bank">Question Bank</option>
            <option value="Lab Manual">Lab Manual</option>
            <option value="Previous Papers">Previous Papers</option>
            <option value="Software">Software & Tools</option>
          </select>
        </div>
      </div>

      {/* 3. Resources Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Resource Name</th>
                <th className="px-4 py-3.5">Subject</th>
                <th className="px-4 py-3.5">Semester</th>
                <th className="px-4 py-3.5">Type</th>
                <th className="px-4 py-3.5">Uploaded</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No departmental resources match your query.
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => {
                  const itemId = item._id || item.id || `res-${idx}`;
                  return (
                    <tr key={itemId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900 text-sm line-clamp-1">
                          {item.title || item.name || "Academic Resource"}
                        </div>
                        <div className="text-slate-400 text-[11px] mt-0.5">
                          {item.fileSize || "2.4 MB"} • {item.format || "PDF"}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-semibold text-slate-800">{item.subjectCode || "CS8492"}</span>
                        <div className="text-slate-400 text-[11px] line-clamp-1">{item.subjectName || "Core Subject"}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700 text-[11px]">
                          Sem {item.semester || 4}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#0062A8] border border-blue-200">
                          {item.type || "Notes"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-400">
                        {item.uploadedAt || item.createdAt ? new Date(item.createdAt || item.uploadedAt).toLocaleDateString() : "Active"}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
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

      {/* 4. Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingResource ? "Edit Resource" : "Upload CSE Department Resource"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subject Code</label>
                  <input
                    type="text"
                    value={formData.subjectCode}
                    onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Semester</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subject Name</label>
                <input
                  type="text"
                  value={formData.subjectName}
                  onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Resource Category</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                >
                  <option value="Notes">Unit Lecture Notes</option>
                  <option value="Question Bank">Question Bank</option>
                  <option value="Lab Manual">Lab Manual</option>
                  <option value="Previous Papers">Previous University Papers</option>
                  <option value="Software">Engineering Software</option>
                  <option value="Video">Lecture Video Link</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Resource Document / Download Link</label>
                <input
                  type="text"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://vcet.ac.in/materials/cs8492-notes.pdf"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono text-[11px]"
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
                  className="px-5 py-2 rounded-xl bg-[#0062A8] hover:bg-[#0B4A8F] text-white font-bold shadow-md"
                >
                  {editingResource ? "Save Changes" : "Upload to Portal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        title="Delete Resource?"
        message="Are you sure you want to remove this academic resource from the department portal?"
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ open: false, id: null })}
      />
    </div>
  );
}
