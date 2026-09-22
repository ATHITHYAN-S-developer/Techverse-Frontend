import React, { useState } from "react";
import {
  Megaphone,
  Search,
  Plus,
  Trash2,
  Edit,
  Eye,
  Calendar,
  Tag,
  AlertTriangle,
  Flame,
  Info,
  Users,
  CheckCircle2,
  X,
  Upload,
  Clock,
  Sparkles
} from "lucide-react";
import { useToast } from "../../context/ToastContext";

const INITIAL_ANNOUNCEMENTS = [
  {
    id: "ann-1",
    title: "Smart India Hackathon (SIH 2026) Internal College Hackathon Round",
    description: "All students with shortlisted team proposals must report to the VCET Seminar Hall 2 at 9:00 AM with PPT slides and working prototype demo.",
    category: "Hackathon",
    priority: "Urgent", // Urgent | Important | Normal
    targetAudience: "Everyone",
    department: "All",
    year: "All Years",
    publishDate: "2026-09-12",
    expiryDate: "2026-09-20",
    imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
    isActive: true,
    createdBy: "Institutional Admin"
  },
  {
    id: "ann-2",
    title: "ZOHO Corporation Campus Drive — Round 2 Advanced Coding Schedule",
    description: "Shortlisted candidates from the Aptitude round are requested to assemble in Lab 4 with ID cards for the 3-hour data structures and algorithmic challenge.",
    category: "Placement",
    priority: "Urgent",
    targetAudience: "Students",
    department: "CSE, IT, AI&DS",
    year: "IV Year",
    publishDate: "2026-09-13",
    expiryDate: "2026-09-16",
    imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
    isActive: true,
    createdBy: "Placement Cell"
  },
  {
    id: "ann-3",
    title: "Anna University End Semester Theory Examination Timetable Released",
    description: "November/December 2026 autonomous examination schedule published. Download the official PDF circular from department repository.",
    category: "Exam Circular",
    priority: "Important",
    targetAudience: "Students",
    department: "All",
    year: "II, III, IV Year",
    publishDate: "2026-09-10",
    expiryDate: "2026-10-15",
    imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80",
    isActive: true,
    createdBy: "Controller of Examinations"
  },
  {
    id: "ann-4",
    title: "AI & Generative Computing 2-Day Hands-on Workshop with NVIDIA DLI",
    description: "Hands-on certification workshop on transformer architectures and CUDA GPU programming for faculty and pre-final year students.",
    category: "Workshop",
    priority: "Normal",
    targetAudience: "Everyone",
    department: "CSE, AI&DS",
    year: "III Year",
    publishDate: "2026-09-08",
    expiryDate: "2026-09-25",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    isActive: true,
    createdBy: "Dept of AI&DS"
  }
];

const AUDIENCES = ["Everyone", "Students", "Teachers", "CSE", "AI&DS", "ECE", "IT", "EEE", "MECH", "CIVIL"];
const CATEGORIES = ["Hackathon", "Placement", "Exam Circular", "Workshop", "College Events", "Academic Notice", "Symposium"];

export default function AdminAnnouncementsPage() {
  const { showSuccess, showError } = useToast();
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [audienceFilter, setAudienceFilter] = useState("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Academic Notice",
    priority: "Normal",
    targetAudience: "Everyone",
    department: "All",
    year: "All Years",
    publishDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
    imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
    createdBy: "Institutional Admin"
  });

  const handleOpenAdd = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: "",
      description: "",
      category: "Academic Notice",
      priority: "Normal",
      targetAudience: "Everyone",
      department: "All",
      year: "All Years",
      publishDate: new Date().toISOString().split("T")[0],
      expiryDate: "",
      imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
      createdBy: "Institutional Admin"
    });
    setImageFile(null);
    setImagePreview(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (ann) => {
    setEditingAnnouncement(ann);
    setFormData({ ...ann });
    setImageFile(null);
    setImagePreview(ann.imageUrl || null);
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showError("Please enter announcement title");
      return;
    }

    const payload = { ...formData };
    if (imagePreview) payload.imageUrl = imagePreview;
    if (editingAnnouncement) {
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === editingAnnouncement.id ? { ...a, ...payload } : a))
      );
      showSuccess("Announcement broadcast updated ✓");
    } else {
      const newAnn = {
        ...payload,
        id: `ann-${Date.now()}`,
        isActive: true
      };
      setAnnouncements((prev) => [newAnn, ...prev]);
      showSuccess("Announcement broadcasted across institutional feed ✓");
    }
    setImageFile(null);
    setImagePreview(null);
    setModalOpen(false);
  };

  const handleToggleActive = (ann) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === ann.id ? { ...a, isActive: !a.isActive } : a))
    );
    showSuccess(
      ann.isActive
        ? `Announcement suspended from live feeds.`
        : `Announcement re-activated on live feeds ✓`
    );
  };

  const handleDelete = (id) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    showSuccess("Announcement removed from broadcast stream ✓");
  };

  const filtered = announcements.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === "ALL" || a.priority === priorityFilter;
    const matchesAudience = audienceFilter === "ALL" || a.targetAudience === audienceFilter;
    return matchesSearch && matchesPriority && matchesAudience;
  });

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "Urgent":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            🔴 Urgent
          </span>
        );
      case "Important":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            🟠 Important
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            🔵 Normal
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-[#0062A8]" />
            Institutional Broadcast & Poster Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Broadcast SIH hackathon posters, exam circulars, placement schedules, and workshops with targeting rules.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0062A8] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Announcement</span>
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
            placeholder="Search announcements by title, hackathon, circular, or keywords..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-xs sm:text-sm border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0062A8] focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200 focus:outline-none focus:bg-white"
          >
            <option value="ALL">All Priorities</option>
            <option value="Urgent">🔴 Urgent</option>
            <option value="Important">🟠 Important</option>
            <option value="Normal">🔵 Normal</option>
          </select>

          <select
            value={audienceFilter}
            onChange={(e) => setAudienceFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200 focus:outline-none focus:bg-white"
          >
            <option value="ALL">All Audiences</option>
            {AUDIENCES.map((aud) => (
              <option key={aud} value={aud}>
                Target: {aud}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Announcements Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((ann) => (
          <div
            key={ann.id}
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all"
          >
            <div className="relative aspect-[21/9] w-full overflow-hidden bg-slate-100">
              <img
                src={ann.imageUrl}
                alt={ann.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
              <div className="absolute top-3 left-3 flex gap-2">
                {getPriorityBadge(ann.priority)}
                <span className="px-2.5 py-1 text-[10px] font-bold bg-white/90 backdrop-blur-md text-slate-800 rounded-full border border-slate-200">
                  {ann.category}
                </span>
              </div>
              <span
                className={`absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  ann.isActive
                    ? "bg-emerald-500 text-white shadow-xs"
                    : "bg-rose-500 text-white shadow-xs"
                }`}
              >
                {ann.isActive ? "Live" : "Suspended"}
              </span>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {ann.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {ann.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Users className="w-3.5 h-3.5 text-[#0062A8]" />
                  <span>Target: <strong className="text-slate-900">{ann.targetAudience}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Calendar className="w-3.5 h-3.5 text-[#0062A8]" />
                  <span>Published: <strong className="text-slate-900">{ann.publishDate}</strong></span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPreviewItem(ann)}
                  className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200"
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleOpenEdit(ann)}
                  className="p-1.5 rounded-lg bg-white hover:bg-blue-50 text-[#0062A8] border border-slate-200"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(ann.id)}
                  className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-rose-600 border border-slate-200"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => handleToggleActive(ann)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  ann.isActive
                    ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                    : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                }`}
              >
                {ann.isActive ? "Suspend Broadcast" : "Make Live"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Create / Edit Announcement - White Mode */}
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
              <Megaphone className="w-5 h-5 text-[#0062A8]" />
              {editingAnnouncement ? "Edit Institutional Broadcast" : "Create Institutional Announcement"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Broadcast Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Smart India Hackathon (SIH 2026) Internal Round"
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-[#0062A8] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Detailed Description *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Full circular text, guidelines, instructions, or venue details..."
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-[#0062A8] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Priority Level</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:bg-white"
                  >
                    <option value="Urgent">🔴 Urgent</option>
                    <option value="Important">🟠 Important</option>
                    <option value="Normal">🔵 Normal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Target Audience</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:bg-white"
                  >
                    {AUDIENCES.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Target Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g. CSE, IT or All"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-[#0062A8] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Upload Image <span className="text-slate-400 font-normal">(optional)</span></label>
                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                    <img src={imagePreview} alt="Preview" className="w-full h-36 object-cover" />
                    <div className="flex items-center justify-between px-3 py-1.5 bg-white border-t border-slate-100">
                      <span className="text-[11px] text-slate-500 truncate max-w-[80%]">{imageFile?.name || "Current image"}</span>
                      <button
                        type="button"
                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                        className="text-rose-500 hover:text-rose-700 text-xs font-bold ml-2 flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-1.5 w-full h-24 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                    <Upload className="w-6 h-6 text-slate-400" />
                    <span className="text-xs text-slate-500 font-medium">Click to upload an image</span>
                    <span className="text-[10px] text-slate-400">PNG, JPG, JPEG, WEBP • Max 5 MB</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 5 * 1024 * 1024) {
                          showError("Image must be under 5 MB");
                          return;
                        }
                        setImageFile(file);
                        const reader = new FileReader();
                        reader.onload = (ev) => setImagePreview(ev.target.result);
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Publish Date</label>
                  <input
                    type="date"
                    value={formData.publishDate}
                    onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>
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
                  {editingAnnouncement ? "Save Changes" : "Broadcast Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Poster Modal - White Mode */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative text-slate-800">
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4 text-xs">
              <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-100">
                <img src={previewItem.imageUrl} alt={previewItem.title} className="w-full h-full object-cover" />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  {getPriorityBadge(previewItem.priority)}
                  <span className="px-2.5 py-1 text-[10px] font-bold bg-[#0062A8] text-white rounded-full">
                    {previewItem.category}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {previewItem.title}
                </h3>
                <p className="text-slate-600 text-xs mt-2 leading-relaxed whitespace-pre-line">
                  {previewItem.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase">Target Audience</span>
                  <p className="font-bold text-slate-800">{previewItem.targetAudience}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase">Broadcast Date</span>
                  <p className="font-bold text-slate-800">{previewItem.publishDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
