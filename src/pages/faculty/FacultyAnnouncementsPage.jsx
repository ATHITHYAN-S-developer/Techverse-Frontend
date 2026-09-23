import React, { useState, useEffect } from "react";
import {
  Megaphone,
  Plus,
  Search,
  Trash2,
  Edit,
  Eye,
  X,
  AlertTriangle,
  Pin,
  ImageIcon
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { announcementService } from "../../services/announcementService";
import ConfirmDialog from "../../components/ConfirmDialog";

export default function FacultyAnnouncementsPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [announcements, setAnnouncements] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

  const [formData, setFormData] = useState({
    title: "",
    category: "Academic",
    priority: "Normal",
    content: "",
    expiryDate: "",
    isPinned: false
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await announcementService.getAll();
      setAnnouncements(data);
    } catch {
      showError("Failed to load announcements");
    }
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      title: "",
      category: "Academic",
      priority: "Normal",
      content: "",
      expiryDate: "",
      isPinned: false
    });
    setImageFile(null);
    setImagePreview(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      priority: item.priority || "Normal",
      content: item.content,
      expiryDate: item.expiryDate ? String(item.expiryDate).slice(0, 10) : "",
      isPinned: Boolean(item.isPinned)
    });
    setImageFile(null);
    setImagePreview(item.imageUrl || null);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showError("Please enter circular title");
      return;
    }

    try {
      const payload = { ...formData, department: "CSE Department" };
      if (imageFile) payload.imageUrl = imagePreview; // base64 or URL
      if (editingItem) {
        await announcementService.update(editingItem.id, payload);
        showSuccess("Circular updated successfully ✓");
      } else {
        await announcementService.create(payload, user);
        showSuccess("Department circular published ✓");
      }
      setModalOpen(false);
      setImageFile(null);
      setImagePreview(null);
      loadData();
    } catch {
      showError("Failed to save circular");
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      await announcementService.delete(deleteDialog.id);
      showSuccess("Circular removed ✓");
      setDeleteDialog({ open: false, id: null });
      loadData();
    } catch {
      showError("Failed to delete circular");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Department Circulars & Notices
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Broadcast test schedules, assignment submissions, and review deadlines to students.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0062A8] hover:bg-[#0B4A8F] text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Broadcast Notice</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {announcements.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-32 object-cover rounded-xl mb-3"
                />
              )}
              <div className="flex items-center justify-between gap-2 mb-2">

                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  item.priority === "Urgent"
                    ? "bg-rose-100 text-rose-700"
                    : item.priority === "Important"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-blue-50 text-[#0062A8]"
                }`}>
                  {item.priority || "Notice"}
                </span>
                <span className="text-[11px] text-slate-400">{item.date}</span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h3>
              <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                {item.content}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>{item.createdBy?.name || item.authorName || item.author || "CSE Department"}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-1.5 hover:text-[#0062A8] rounded hover:bg-slate-50"
                  title="Edit"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteDialog({ open: true, id: item.id })}
                  className="p-1.5 hover:text-rose-600 rounded hover:bg-rose-50"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingItem ? "Edit Circular" : "Publish New Circular"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Model Practical Exam Schedule - II CSE A & B"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Exam">Exam Schedule</option>
                    <option value="Placement">Placement & Drives</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Event">Department Event</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Priority Level</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Normal">Normal Notice</option>
                    <option value="Important">Important</option>
                    <option value="Urgent">Urgent Action Required</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notice Description / Instructions</label>
                <textarea
                  rows={4}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Provide circular details, deadlines, and requirements..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              {/* Event / Valid Until Date */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Event / Valid Until Date <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Circulars whose date has passed appear under "Past Events". Leave empty to keep them in the Current &amp; Upcoming slideshow.
                </p>
              </div>

              {/* Image Upload */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Upload Image <span className="text-slate-400 font-normal">(optional)</span></label>
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
                    <ImageIcon className="w-6 h-6 text-slate-400" />
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

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0062A8] text-white font-bold rounded-xl shadow"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteDialog.open}
        title="Delete Circular?"
        message="Are you sure you want to remove this announcement?"
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ open: false, id: null })}
      />
    </div>
  );
}
