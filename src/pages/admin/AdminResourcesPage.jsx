import React, { useState } from "react";
import {
  Layers,
  Search,
  Plus,
  Filter,
  Trash2,
  Edit,
  Eye,
  Download,
  FileText,
  FileCode,
  Video,
  BookOpen,
  CheckCircle2,
  X,
  Upload,
  ExternalLink,
  Tag,
  AlertCircle
} from "lucide-react";
import { useToast } from "../../context/ToastContext";

const INITIAL_RESOURCES = [
  {
    id: "res-1",
    title: "Database Management Systems Unit 3 SQL Notes",
    description: "Complete lecture notes covering DDL, DML, Subqueries, Joins, and Indexing with practice queries.",
    department: "CSE",
    subject: "CS3401 - DBMS",
    semester: 4,
    category: "Notes",
    fileType: "PDF",
    fileSize: "4.2 MB",
    uploadedBy: "Prof. S. R. Murugesan",
    uploadedDate: "2026-09-10",
    downloads: 342,
    isPublished: true,
    thumbnailUrl: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "res-2",
    title: "Machine Learning Lab Manual with Python Scripts",
    description: "Anna University Regulation 2021 ML laboratory exercises covering Regression, SVM, and Neural Nets.",
    department: "AI&DS",
    subject: "AD3411 - ML Lab",
    semester: 4,
    category: "Lab Manual",
    fileType: "PDF",
    fileSize: "8.5 MB",
    uploadedBy: "Dr. K. Sathish Kumar",
    uploadedDate: "2026-09-08",
    downloads: 218,
    isPublished: true,
    thumbnailUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "res-3",
    title: "Digital Electronics Previous 5-Year Question Bank",
    description: "Solved previous semester university question papers with step-by-step circuit simplifications.",
    department: "ECE",
    subject: "EC3352 - Digital Systems",
    semester: 3,
    category: "Question Bank",
    fileType: "PDF",
    fileSize: "6.1 MB",
    uploadedBy: "Prof. V. Manjula",
    uploadedDate: "2026-09-05",
    downloads: 489,
    isPublished: true,
    thumbnailUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "res-4",
    title: "Full Stack Web Development Video Masterclass",
    description: "Comprehensive React 19, Tailwind CSS, Node.js REST API architecture walkthrough series.",
    department: "IT",
    subject: "IT3501 - Web Tech",
    semester: 5,
    category: "Videos",
    fileType: "Video",
    fileSize: "Stream Link",
    uploadedBy: "Er. P. Dinesh",
    uploadedDate: "2026-09-02",
    downloads: 512,
    isPublished: true,
    thumbnailUrl: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "res-5",
    title: "Power Systems CAD Software Toolkit & Setup Guide",
    description: "Simulation software packages, open-source electrical grid analyzers, and setup scripts.",
    department: "EEE",
    subject: "EE3402 - Power Systems",
    semester: 4,
    category: "Software",
    fileType: "ZIP",
    fileSize: "45.0 MB",
    uploadedBy: "Dr. R. Selvaraj",
    uploadedDate: "2026-08-28",
    downloads: 145,
    isPublished: false,
    thumbnailUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "res-6",
    title: "Thermodynamics Standard Reference Handbook",
    description: "Standard steam tables, psychrometric charts, and heat transfer formula collections.",
    department: "MECH",
    subject: "ME3351 - Applied Thermo",
    semester: 3,
    category: "Reference Books",
    fileType: "PDF",
    fileSize: "14.2 MB",
    uploadedBy: "Prof. G. Soundararajan",
    uploadedDate: "2026-08-20",
    downloads: 198,
    isPublished: true,
    thumbnailUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"
  }
];

const CATEGORIES = [
  "All Categories",
  "Notes",
  "Question Bank",
  "Previous Papers",
  "Lab Manual",
  "Syllabus",
  "Software",
  "Reference Books",
  "PDFs",
  "Videos"
];

const DEPARTMENTS = ["All Departments", "CSE", "AI&DS", "ECE", "IT", "EEE", "MECH", "CIVIL"];

export default function AdminResourcesPage() {
  const { showSuccess, showError } = useToast();
  const [resources, setResources] = useState(INITIAL_RESOURCES);
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [previewResource, setPreviewResource] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    department: "CSE",
    subject: "CS3401 - Database Management Systems",
    semester: 4,
    category: "Notes",
    fileType: "PDF",
    fileSize: "3.5 MB",
    uploadedBy: "Admin Faculty",
    thumbnailUrl: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=600&q=80"
  });

  const handleOpenAdd = () => {
    setEditingResource(null);
    setFormData({
      title: "",
      description: "",
      department: "CSE",
      subject: "CS3401 - Database Management Systems",
      semester: 4,
      category: "Notes",
      fileType: "PDF",
      fileSize: "3.5 MB",
      uploadedBy: "Institutional Admin",
      thumbnailUrl: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=600&q=80"
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (res) => {
    setEditingResource(res);
    setFormData({ ...res });
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showError("Please enter resource title");
      return;
    }

    if (editingResource) {
      setResources((prev) =>
        prev.map((r) => (r.id === editingResource.id ? { ...r, ...formData } : r))
      );
      showSuccess("Academic resource updated successfully ✓");
    } else {
      const newRes = {
        ...formData,
        id: `res-${Date.now()}`,
        uploadedDate: new Date().toISOString().split("T")[0],
        downloads: 0,
        isPublished: true
      };
      setResources((prev) => [newRes, ...prev]);
      showSuccess("Resource uploaded & published to department repository ✓");
    }
    setModalOpen(false);
  };

  const handleTogglePublish = (res) => {
    setResources((prev) =>
      prev.map((r) => (r.id === res.id ? { ...r, isPublished: !r.isPublished } : r))
    );
    showSuccess(
      res.isPublished
        ? `Resource unpublished from student repository.`
        : `Resource published to student repository ✓`
    );
  };

  const handleDelete = (id) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
    showSuccess("Resource deleted from institutional storage ✓");
  };

  const filtered = resources.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === "All Departments" || r.department === deptFilter;
    const matchesCat = categoryFilter === "All Categories" || r.category === categoryFilter;
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "published" && r.isPublished) ||
      (statusFilter === "unpublished" && !r.isPublished);

    return matchesSearch && matchesDept && matchesCat && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-800">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#0062A8]" />
            Institutional Academic Resource Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Control syllabus notes, question banks, previous year papers, lab manuals, and software packages.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0062A8] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Resource</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search resources by title, subject code, or keyword..."
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
                {d}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200 focus:outline-none focus:bg-white"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200 focus:outline-none focus:bg-white"
          >
            <option value="ALL">All Status</option>
            <option value="published">Published</option>
            <option value="unpublished">Unpublished</option>
          </select>
        </div>
      </div>

      {/* Grid of Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((res) => (
          <div
            key={res.id}
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
              <img
                src={res.thumbnailUrl}
                alt={res.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="px-2.5 py-1 text-[10px] font-bold bg-[#0062A8] text-white rounded-full shadow-xs">
                  {res.department}
                </span>
                <span className="px-2.5 py-1 text-[10px] font-bold bg-white/90 backdrop-blur-md text-slate-800 rounded-full border border-slate-200">
                  Sem {res.semester}
                </span>
              </div>
              <span
                className={`absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  res.isPublished
                    ? "bg-emerald-500 text-white shadow-xs"
                    : "bg-amber-500 text-white shadow-xs"
                }`}
              >
                {res.isPublished ? "Published" : "Draft / Hidden"}
              </span>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-1.5 text-[#0062A8] text-[11px] font-bold mb-1">
                  <Tag className="w-3 h-3" />
                  <span>{res.category}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500">{res.subject}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                  {res.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {res.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>By: <strong className="text-slate-700">{res.uploadedBy}</strong></span>
                <span>{res.downloads} downloads</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPreviewResource(res)}
                  className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200"
                  title="Preview Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleOpenEdit(res)}
                  className="p-1.5 rounded-lg bg-white hover:bg-blue-50 text-[#0062A8] border border-slate-200"
                  title="Edit Resource"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(res.id)}
                  className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-rose-600 border border-slate-200"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => handleTogglePublish(res)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  res.isPublished
                    ? "bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200"
                    : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                }`}
              >
                {res.isPublished ? "Unpublish" : "Publish"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload / Edit Resource Modal - White Mode */}
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
              <Upload className="w-5 h-5 text-[#0062A8]" />
              {editingResource ? "Edit Academic Resource" : "Upload New Academic Resource"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Resource Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Database Management Systems Unit 3 SQL Notes"
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-[#0062A8] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Description / Topics Covered</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief summary of what this academic resource covers..."
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-[#0062A8] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:bg-white"
                  >
                    {DEPARTMENTS.filter((d) => d !== "All Departments").map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:bg-white"
                  >
                    {CATEGORIES.filter((c) => c !== "All Categories").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Subject Code & Name</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. CS3401 - DBMS"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-[#0062A8] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Semester</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Thumbnail / Cover Image URL</label>
                <input
                  type="url"
                  value={formData.thumbnailUrl}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-[#0062A8] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Uploader / Faculty Name</label>
                <input
                  type="text"
                  value={formData.uploadedBy}
                  onChange={(e) => setFormData({ ...formData, uploadedBy: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-[#0062A8] focus:bg-white"
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
                  {editingResource ? "Save Changes" : "Upload & Publish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal - White Mode */}
      {previewResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative text-slate-800">
            <button
              onClick={() => setPreviewResource(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4 text-xs">
              <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-100">
                <img
                  src={previewResource.thumbnailUrl}
                  alt={previewResource.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <span className="px-2.5 py-1 text-[10px] font-bold bg-[#0062A8] text-white rounded-full">
                  {previewResource.department} • Sem {previewResource.semester}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-2">
                  {previewResource.title}
                </h3>
                <p className="text-slate-500 text-xs mt-1">
                  {previewResource.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase">Subject</span>
                  <p className="font-bold text-slate-800">{previewResource.subject}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase">Category</span>
                  <p className="font-bold text-slate-800">{previewResource.category}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase">Uploaded By</span>
                  <p className="font-bold text-slate-800">{previewResource.uploadedBy}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase">Total Downloads</span>
                  <p className="font-bold text-slate-800">{previewResource.downloads}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    showSuccess(`Downloading ${previewResource.title}...`);
                    setPreviewResource(null);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#0062A8] hover:bg-blue-700 text-white font-bold rounded-xl"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Resource</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
