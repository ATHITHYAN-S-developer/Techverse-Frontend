import React, { useState, useEffect } from "react";
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
  Sparkles,
  Loader2,
  RefreshCw,
  Pin,
  Building2,
  Filter
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { announcementService } from "../../services/announcementService";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../services/api";

const AUDIENCES = ["Everyone", "Students", "Teachers", "CSE", "AI&DS", "ECE", "IT", "EEE", "MECH", "CIVIL"];
const CATEGORIES = ["Hackathon", "Placement", "Exam Circular", "Workshop", "College Events", "Academic Notice", "Symposium"];
const DEPARTMENT_LIST = ["CSE", "AI&DS", "ECE", "IT", "EEE", "MECH", "CIVIL"];

function resolvePosterUrl(item) {
  const raw = item?.imageUrl || item?.image || "";
  if (!raw) return "";
  if (raw.startsWith("data:")) return raw;

  const currentHost =
    typeof window !== "undefined" && window.location && window.location.hostname
      ? window.location.hostname
      : "localhost";

  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw);
      if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
        url.hostname = currentHost;
        return url.toString();
      }
      return raw;
    } catch {
      return raw;
    }
  }

  const cleanPath = raw.startsWith("/") ? raw : `/uploads/announcements/${raw}`;
  return `http://${currentHost}:5000${cleanPath}`;
}

function formatInputDate(raw) {
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatInputTime(raw, defaultTime = "09:00") {
  if (!raw) return defaultTime;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return defaultTime;
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function formatDateTimeDisplay(raw) {
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function combineToIso(dateStr, timeStr) {
  if (!dateStr || !dateStr.trim()) return null;
  const clean = dateStr.trim();
  let y, m, d;
  if (clean.includes("-")) {
    const parts = clean.split("-").map(Number);
    if (parts.length === 3 && !parts.some(isNaN)) {
      if (parts[0] > 1000) {
        [y, m, d] = parts;
      } else if (parts[2] > 1000) {
        [d, m, y] = parts;
      } else {
        [y, m, d] = parts;
      }
    }
  } else if (clean.includes("/")) {
    const parts = clean.split("/").map(Number);
    if (parts.length === 3 && !parts.some(isNaN)) {
      if (parts[2] > 1000) {
        [d, m, y] = parts;
      } else {
        [y, m, d] = parts;
      }
    }
  }
  if (!y || !m || !d) {
    const fallback = new Date(clean);
    if (!Number.isNaN(fallback.getTime())) {
      y = fallback.getFullYear();
      m = fallback.getMonth() + 1;
      d = fallback.getDate();
    } else {
      return null;
    }
  }
  const timeParts = (timeStr || "00:00").trim().split(":").map(Number);
  const hour = timeParts[0] || 0;
  const minute = timeParts[1] || 0;
  const dateObj = new Date(y, m - 1, d, hour, minute, 0);
  return Number.isNaN(dateObj.getTime()) ? null : dateObj.toISOString();
}

export default function AdminAnnouncementsPage() {
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [audienceFilter, setAudienceFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

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
    departments: ["All"],
    year: "All Years",
    publishDate: formatInputDate(new Date()),
    publishTime: "09:00",
    expiryDate: "",
    expiryTime: "23:59",
    isPinned: false,
    imageUrl: ""
  });

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await announcementService.getAll({ all: "true" });
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load announcements:", err);
      showError("Failed to fetch announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const toggleDepartment = (dept) => {
    setFormData((prev) => {
      let current = Array.isArray(prev.departments) ? [...prev.departments] : ["All"];
      if (dept === "All") {
        return { ...prev, departments: ["All"], department: "All" };
      }
      current = current.filter((d) => d !== "All");
      if (current.includes(dept)) {
        current = current.filter((d) => d !== dept);
      } else {
        current.push(dept);
      }
      if (current.length === 0 || current.length === DEPARTMENT_LIST.length) {
        current = ["All"];
      }
      return {
        ...prev,
        departments: current,
        department: current.includes("All") ? "All" : current.join(", "),
      };
    });
  };

  const handleOpenAdd = () => {
    setEditingAnnouncement(null);
    const now = new Date();
    setFormData({
      title: "",
      description: "",
      category: "Academic Notice",
      priority: "Normal",
      targetAudience: "Everyone",
      department: "All",
      departments: ["All"],
      year: "All Years",
      publishDate: formatInputDate(now),
      publishTime: formatInputTime(now, "09:00"),
      expiryDate: "",
      expiryTime: "23:59",
      isPinned: false,
      imageUrl: ""
    });
    setImageFile(null);
    setImagePreview(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (ann) => {
    setEditingAnnouncement(ann);
    let depts = ["All"];
    if (Array.isArray(ann.departments) && ann.departments.length) {
      depts = ann.departments;
    } else if (ann.department) {
      depts = ann.department.split(",").map((s) => s.trim()).filter(Boolean);
    }
    if (!depts.length) depts = ["All"];

    setFormData({
      title: ann.title || "",
      description: ann.description || ann.content || "",
      category: ann.category || "Academic Notice",
      priority: ann.priority
        ? ann.priority.charAt(0).toUpperCase() + ann.priority.slice(1).toLowerCase()
        : "Normal",
      targetAudience: ann.targetAudience === "all" ? "Everyone" : (ann.targetAudience || "Everyone"),
      department: depts.includes("All") ? "All" : depts.join(", "),
      departments: depts,
      year: ann.year || "All Years",
      publishDate: formatInputDate(ann.publishDate || ann.createdAt) || formatInputDate(new Date()),
      publishTime: formatInputTime(ann.publishDate || ann.createdAt, "09:00"),
      expiryDate: formatInputDate(ann.expiryDate),
      expiryTime: formatInputTime(ann.expiryDate, "23:59"),
      isPinned: Boolean(ann.isPinned),
      imageUrl: ann.imageUrl || ann.image || ""
    });
    setImageFile(null);
    setImagePreview(resolvePosterUrl(ann) || null);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showError("Please enter announcement title");
      return;
    }
    if (!formData.description.trim()) {
      showError("Please enter detailed description");
      return;
    }

    try {
      setSaving(true);
      
      const combinedPublish = combineToIso(formData.publishDate, formData.publishTime) || new Date().toISOString();
      const combinedExpiry = combineToIso(formData.expiryDate, formData.expiryTime);

      if (combinedExpiry && new Date(combinedExpiry) <= new Date(combinedPublish)) {
        showError("Expiry date & time must be strictly after the publish date & time.");
        setSaving(false);
        return;
      }

      const deptsArray = Array.isArray(formData.departments) && formData.departments.length ? formData.departments : ["All"];
      const deptsString = deptsArray.includes("All") ? "All" : deptsArray.join(", ");

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        content: formData.description.trim(),
        category: formData.category,
        priority: (formData.priority || "normal").toLowerCase(),
        targetAudience: formData.targetAudience === "Everyone" ? "all" : formData.targetAudience.toLowerCase(),
        department: deptsString,
        departments: JSON.stringify(deptsArray),
        isPinned: formData.isPinned,
        publishDate: combinedPublish,
        expiryDate: combinedExpiry,
      };

      if (imageFile) {
        // Upload with FormData - ONLY ONE FIELD 'image' to prevent duplicate file uploads
        const formPayload = new FormData();
        Object.keys(payload).forEach((k) => {
          if (payload[k] !== undefined) {
            formPayload.append(k, payload[k] === null ? "" : payload[k]);
          }
        });
        formPayload.append("image", imageFile);

        if (editingAnnouncement) {
          await announcementService.update(editingAnnouncement._id || editingAnnouncement.id, formPayload);
          showSuccess("Announcement broadcast updated ✓");
        } else {
          await announcementService.create(formPayload);
          showSuccess("Announcement broadcasted across institutional feed ✓");
        }
      } else {
        if (imagePreview && imagePreview.startsWith("http")) {
          payload.imageUrl = imagePreview;
        }

        if (editingAnnouncement) {
          await announcementService.update(editingAnnouncement._id || editingAnnouncement.id, payload);
          showSuccess("Announcement broadcast updated ✓");
        } else {
          await announcementService.create(payload);
          showSuccess("Announcement broadcasted across institutional feed ✓");
        }
      }

      setModalOpen(false);
      setImageFile(null);
      setImagePreview(null);
      await loadAnnouncements();
    } catch (err) {
      console.error("Save announcement error:", err);
      showError(err.message || "Failed to save announcement");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (ann) => {
    try {
      const id = ann._id || ann.id;
      const now = new Date();
      const isExpired = ann.expiryDate && new Date(ann.expiryDate) <= now;
      const nextActive = !ann.isActive;

      // When re-activating an expired announcement, clear the expiryDate so it goes live!
      const updateData = { isActive: nextActive };
      if (nextActive && isExpired) {
        updateData.expiryDate = null;
      }

      await announcementService.update(id, updateData);
      setAnnouncements((prev) =>
        prev.map((a) =>
          a._id === id || a.id === id
            ? { ...a, isActive: nextActive, ...(nextActive && isExpired ? { expiryDate: null } : {}) }
            : a
        )
      );
      showSuccess(
        nextActive
          ? isExpired
            ? "Announcement revived & expiry date cleared ✓"
            : "Announcement live on feed ✓"
          : "Announcement suspended from live feed"
      );
    } catch (err) {
      showError("Failed to update status");
    }
  };

  const handleExpireNow = async (ann) => {
    try {
      const id = ann._id || ann.id;
      const now = new Date();
      await announcementService.update(id, { expiryDate: now.toISOString() });
      setAnnouncements((prev) =>
        prev.map((a) => (a._id === id || a.id === id ? { ...a, expiryDate: now.toISOString() } : a))
      );
      showSuccess("Announcement expired immediately ✓");
    } catch (err) {
      showError("Failed to expire announcement");
    }
  };

  const handlePublishNow = async (ann) => {
    try {
      const id = ann._id || ann.id;
      const now = new Date();
      await announcementService.update(id, { publishDate: now.toISOString() });
      setAnnouncements((prev) =>
        prev.map((a) => (a._id === id || a.id === id ? { ...a, publishDate: now.toISOString() } : a))
      );
      showSuccess("Announcement published immediately to live feed ✓");
    } catch (err) {
      showError("Failed to publish announcement");
    }
  };

  const handleDelete = async (ann) => {
    const id = ann._id || ann.id;
    if (!window.confirm(`Are you sure you want to delete "${ann.title}"?`)) return;
    try {
      await announcementService.delete(id);
      setAnnouncements((prev) => prev.filter((a) => a._id !== id && a.id !== id));
      showSuccess("Announcement removed ✓");
    } catch (err) {
      showError("Failed to delete announcement");
    }
  };

  const filtered = announcements.filter((a) => {
    const title = (a.title || "").toLowerCase();
    const desc = (a.description || a.content || "").toLowerCase();
    const cat = (a.category || "").toLowerCase();
    const q = searchTerm.toLowerCase();
    const matchesSearch = !q || title.includes(q) || desc.includes(q) || cat.includes(q);

    const prio = (a.priority || "normal").toUpperCase();
    const matchesPriority = priorityFilter === "ALL" || prio === priorityFilter.toUpperCase();

    const aud = a.targetAudience === "all" ? "EVERYONE" : (a.targetAudience || "").toUpperCase();
    const matchesAudience = audienceFilter === "ALL" || aud === audienceFilter.toUpperCase();

    const now = new Date();
    const isSuspended = a.isActive === false;
    const isScheduled = !isSuspended && a.publishDate && new Date(a.publishDate) > now;
    const isExpired = !isSuspended && a.expiryDate && new Date(a.expiryDate) <= now;
    const isLive = !isSuspended && !isScheduled && !isExpired;

    let matchesStatus = true;
    if (statusFilter === "LIVE") matchesStatus = isLive;
    else if (statusFilter === "SCHEDULED") matchesStatus = isScheduled;
    else if (statusFilter === "EXPIRED") matchesStatus = isExpired;
    else if (statusFilter === "SUSPENDED") matchesStatus = isSuspended;

    return matchesSearch && matchesPriority && matchesAudience && matchesStatus;
  });

  const getPriorityBadge = (priority) => {
    const p = (priority || "").toLowerCase();
    switch (p) {
      case "urgent":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 rounded-full">
            <Flame className="w-3 h-3 text-rose-600" /> URGENT
          </span>
        );
      case "important":
      case "high":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> IMPORTANT
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold bg-blue-50 text-[#0062A8] border border-blue-200 rounded-full">
            <Info className="w-3 h-3 text-[#0062A8]" /> NORMAL
          </span>
        );
    }
  };

  const formatDateTimeDisplay = (rawDate) => {
    if (!rawDate) return "";
    const d = new Date(rawDate);
    if (Number.isNaN(d.getTime())) return String(rawDate);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F8FB] text-[#444445] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-black uppercase tracking-wider bg-blue-100 text-[#0062A8] rounded-md">
                Admin Control
              </span>
              <span className="text-xs text-slate-500 font-medium">Full-Stack Broadcast Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5">
              <Megaphone className="w-7 h-7 text-[#0062A8]" />
              Institutional Broadcasts & Circulars
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Publish and schedule campus announcements, hackathon notices, placement schedules, and autonomous circulars with custom expiry dates & times.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAnnouncements}
              disabled={loading}
              className="p-2.5 bg-white border border-[#D9E2EC] rounded-xl hover:bg-slate-50 text-slate-700 transition shadow-xs cursor-pointer"
              title="Refresh feeds"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#0062A8]" : ""}`} />
            </button>

            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0062A8] hover:bg-[#0077C8] text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Publish New Announcement
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-6 bg-white border border-[#D9E2EC] rounded-2xl p-4 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search circulars..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#F5F8FB] border border-[#D9E2EC] rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#0062A8]"
              />
            </div>

            {/* Priority Filter */}
            <div>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 bg-[#F5F8FB] border border-[#D9E2EC] rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white"
              >
                <option value="ALL">All Priorities</option>
                <option value="URGENT">🔴 Urgent</option>
                <option value="IMPORTANT">🟠 Important</option>
                <option value="NORMAL">🔵 Normal</option>
              </select>
            </div>

            {/* Audience Filter */}
            <div>
              <select
                value={audienceFilter}
                onChange={(e) => setAudienceFilter(e.target.value)}
                className="w-full px-3 py-2 bg-[#F5F8FB] border border-[#D9E2EC] rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white"
              >
                <option value="ALL">All Audiences</option>
                {AUDIENCES.map((aud) => (
                  <option key={aud} value={aud.toUpperCase()}>
                    {aud}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-[#F5F8FB] border border-[#D9E2EC] rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white"
              >
                <option value="ALL">All Status</option>
                <option value="LIVE">🟢 Live Feeds</option>
                <option value="SCHEDULED">🔵 Scheduled</option>
                <option value="EXPIRED">🟠 Expired</option>
                <option value="SUSPENDED">🔴 Suspended</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Announcements */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-[#D9E2EC]">
            <Loader2 className="w-8 h-8 text-[#0062A8] animate-spin mb-2" />
            <p className="text-xs font-bold text-slate-500">Loading live announcements...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#D9E2EC] p-6">
            <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Announcements Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No matching broadcasts for your selected search and filters. Try adjusting your query or publish a new announcement.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((ann) => {
              const poster = resolvePosterUrl(ann);
              const now = new Date();
              const isSuspended = ann.isActive === false;
              const isScheduled = !isSuspended && ann.publishDate && new Date(ann.publishDate) > now;
              const isExpired = !isSuspended && ann.expiryDate && new Date(ann.expiryDate) <= now;
              const isLive = !isSuspended && !isScheduled && !isExpired;

              return (
                <div
                  key={ann._id || ann.id}
                  className="bg-white border border-[#D9E2EC] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  {/* Poster Thumbnail */}
                  <div className="relative aspect-[16/9] w-full bg-slate-100 overflow-hidden">
                    {poster ? (
                      <img
                        src={poster}
                        alt={ann.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0062A8]/10 to-[#0077C8]/20 text-[#0062A8]">
                        <Megaphone className="w-8 h-8 opacity-40 mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">VCET Circular</span>
                      </div>
                    )}

                    <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                      {getPriorityBadge(ann.priority)}
                      <span className="px-2.5 py-0.5 text-[10px] font-bold bg-white/95 backdrop-blur-md text-slate-800 rounded-full border border-slate-200 shadow-xs">
                        {ann.category || "General"}
                      </span>
                    </div>

                    {isSuspended ? (
                      <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#DC2626] text-white shadow-xs">
                        Suspended
                      </span>
                    ) : isScheduled ? (
                      <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-600 text-white shadow-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Scheduled
                      </span>
                    ) : isExpired ? (
                      <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-600 text-white shadow-xs">
                        Expired
                      </span>
                    ) : (
                      <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#16A34A] text-white shadow-xs">
                        Live
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-2">
                        {ann.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {ann.description || ann.content}
                      </p>
                    </div>

                    {/* Metadata Pill Box */}
                    <div className="space-y-1.5 text-[11px] bg-[#F5F8FB] p-2.5 rounded-xl border border-[#D9E2EC]">
                      <div className="flex items-center justify-between gap-1 text-slate-600">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-[#0062A8]" />
                          Target: <strong className="text-slate-900">{ann.targetAudience === "all" ? "Everyone" : (ann.targetAudience || "Everyone")}</strong>
                        </span>
                        {ann.authorName && (
                          <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">
                            by {ann.authorName}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-slate-600">
                        <Building2 className="w-3.5 h-3.5 text-[#0062A8] shrink-0" />
                        <span>
                          Dept:{" "}
                          <strong className="text-slate-900">
                            {Array.isArray(ann.departments) && ann.departments.length
                              ? (ann.departments.includes("All") ? "All Departments" : ann.departments.join(", "))
                              : (ann.department || ann.departmentId?.code || "All Departments")}
                          </strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-[#0062A8] shrink-0" />
                        <span>Published: <strong className="text-slate-900">{formatDateTimeDisplay(ann.publishDate || ann.createdAt)}</strong></span>
                      </div>

                      {ann.expiryDate && (
                        <div className="flex items-center gap-1 text-amber-800 pt-1 border-t border-[#D9E2EC]/70">
                          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Expires: <strong className="text-amber-900 font-bold">{formatDateTimeDisplay(ann.expiryDate)}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="px-4 py-3 bg-white border-t border-[#D9E2EC] flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setPreviewItem(ann)}
                        className="p-1.5 rounded-lg bg-[#F5F8FB] hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-[#D9E2EC] transition cursor-pointer"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(ann)}
                        className="p-1.5 rounded-lg bg-[#F5F8FB] hover:bg-blue-50 text-[#0062A8] border border-[#D9E2EC] transition cursor-pointer"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(ann)}
                        className="p-1.5 rounded-lg bg-[#F5F8FB] hover:bg-rose-50 text-[#DC2626] border border-[#D9E2EC] transition cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {isExpired ? (
                        <button
                          onClick={() => handleToggleActive(ann)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300"
                          title="Clear expired deadline and make this circular live immediately"
                        >
                          Revive (Clear Expiry)
                        </button>
                      ) : isScheduled ? (
                        <>
                          <button
                            onClick={() => handlePublishNow(ann)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer bg-blue-50 hover:bg-blue-100 text-[#0062A8] border border-blue-200"
                            title="Publish immediately without waiting for schedule time"
                          >
                            Publish Now
                          </button>
                          <button
                            onClick={() => handleToggleActive(ann)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer bg-rose-50 hover:bg-rose-100 text-[#DC2626] border border-rose-200"
                          >
                            Suspend
                          </button>
                        </>
                      ) : isLive ? (
                        <>
                          <button
                            onClick={() => handleExpireNow(ann)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200"
                            title="End / Expire this announcement right now"
                          >
                            Expire Now
                          </button>
                          <button
                            onClick={() => handleToggleActive(ann)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer bg-rose-50 hover:bg-rose-100 text-[#DC2626] border border-rose-200"
                          >
                            Suspend
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleToggleActive(ann)}
                          className="px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer bg-emerald-50 hover:bg-emerald-100 text-[#16A34A] border border-emerald-200"
                        >
                          Make Live
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal for Create / Edit Announcement */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-[#D9E2EC] rounded-2xl w-full max-w-xl p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto text-slate-800">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
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
                  className="w-full px-3 py-2 bg-[#F5F8FB] rounded-xl border border-[#D9E2EC] text-slate-900 focus:outline-none focus:border-[#0062A8] focus:bg-white text-xs"
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
                  className="w-full px-3 py-2 bg-[#F5F8FB] rounded-xl border border-[#D9E2EC] text-slate-900 focus:outline-none focus:border-[#0062A8] focus:bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F5F8FB] rounded-xl border border-[#D9E2EC] text-slate-900 focus:outline-none focus:bg-white text-xs"
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
                    className="w-full px-3 py-2 bg-[#F5F8FB] rounded-xl border border-[#D9E2EC] text-slate-900 focus:outline-none focus:bg-white text-xs font-bold"
                  >
                    <option value="Urgent">🔴 Urgent</option>
                    <option value="Important">🟠 Important</option>
                    <option value="Normal">🔵 Normal</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Target Audience</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F5F8FB] rounded-xl border border-[#D9E2EC] text-slate-900 focus:outline-none focus:bg-white text-xs"
                  >
                    {AUDIENCES.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Target Departments Multi-Choice */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-slate-700 font-bold">
                      Target Departments <span className="text-slate-400 font-normal">(Select multiple)</span>
                    </label>
                    <span className="text-[10px] font-bold text-[#0062A8] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      {formData.departments?.includes("All")
                        ? "All Departments"
                        : `${formData.departments?.length || 0} selected`}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 p-2 bg-[#F5F8FB] rounded-xl border border-[#D9E2EC]">
                    <button
                      type="button"
                      onClick={() => toggleDepartment("All")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        formData.departments?.includes("All")
                          ? "bg-[#0062A8] text-white shadow-xs"
                          : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      All Departments
                    </button>
                    {DEPARTMENT_LIST.map((d) => {
                      const isSelected =
                        !formData.departments?.includes("All") && formData.departments?.includes(d);
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => toggleDepartment(d)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                            isSelected
                              ? "bg-[#0062A8] text-white shadow-xs"
                              : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                          }`}
                        >
                          {isSelected ? `✓ ${d}` : d}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Poster Upload */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Upload Poster / Circular Image <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-[#D9E2EC] bg-[#F5F8FB]">
                    <img src={imagePreview} alt="Preview" className="w-full h-36 object-cover" />
                    <div className="flex items-center justify-between px-3 py-1.5 bg-white border-t border-[#D9E2EC]">
                      <span className="text-[11px] text-slate-500 truncate max-w-[80%]">
                        {imageFile?.name || "Selected Image"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="text-[#DC2626] hover:text-red-700 text-xs font-bold ml-2 flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-1.5 w-full h-24 rounded-xl border-2 border-dashed border-[#D9E2EC] bg-[#F5F8FB] hover:bg-slate-100 cursor-pointer transition-colors">
                    <Upload className="w-6 h-6 text-[#0062A8]" />
                    <span className="text-xs text-slate-600 font-medium">Click to upload announcement banner</span>
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

              {/* Publish Date & Time and Expiry Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold mb-1">Publish Date & Time</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="col-span-2">
                      <input
                        type="date"
                        required
                        value={formData.publishDate}
                        onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                        className="w-full px-2.5 py-2 bg-[#F5F8FB] rounded-xl border border-[#D9E2EC] text-slate-900 text-xs focus:outline-none focus:bg-white"
                      />
                    </div>
                    <div>
                      <input
                        type="time"
                        value={formData.publishTime || "09:00"}
                        onChange={(e) => setFormData({ ...formData, publishTime: e.target.value })}
                        className="w-full px-2 py-2 bg-[#F5F8FB] rounded-xl border border-[#D9E2EC] text-slate-900 text-xs focus:outline-none focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-700 font-bold">Expiry Date & Time (Optional)</label>
                    {formData.expiryDate && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, expiryDate: "", expiryTime: "" })}
                        className="text-[10px] font-bold text-rose-600 hover:text-rose-700 underline cursor-pointer"
                      >
                        ✕ Clear Expiry
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="col-span-2">
                      <input
                        type="date"
                        value={formData.expiryDate}
                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                        className="w-full px-2.5 py-2 bg-[#F5F8FB] rounded-xl border border-[#D9E2EC] text-slate-900 text-xs focus:outline-none focus:bg-white"
                      />
                    </div>
                    <div>
                      <input
                        type="time"
                        value={formData.expiryTime || "23:59"}
                        onChange={(e) => setFormData({ ...formData, expiryTime: e.target.value })}
                        className="w-full px-2 py-2 bg-[#F5F8FB] rounded-xl border border-[#D9E2EC] text-slate-900 text-xs focus:outline-none focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pin toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pin-toggle"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                  className="rounded text-[#0062A8] focus:ring-[#0062A8]"
                />
                <label htmlFor="pin-toggle" className="text-xs text-slate-700 font-bold flex items-center gap-1 cursor-pointer">
                  <Pin className="w-3.5 h-3.5 text-[#0062A8]" /> Pin announcement to top of feed
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#D9E2EC]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0062A8] hover:bg-[#0077C8] text-white font-bold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingAnnouncement ? "Save Changes" : "Broadcast Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Poster Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-[#D9E2EC] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative text-slate-800 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4 text-xs">
              <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-100">
                {resolvePosterUrl(previewItem) ? (
                  <img
                    src={resolvePosterUrl(previewItem)}
                    alt={previewItem.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0062A8]/10 to-[#0077C8]/20 text-[#0062A8]">
                    <Megaphone className="w-10 h-10 opacity-40 mb-1" />
                    <span className="text-xs font-bold uppercase tracking-wider opacity-60">VCET Circular</span>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {getPriorityBadge(previewItem.priority)}
                  <span className="px-2.5 py-1 text-[10px] font-bold bg-[#0062A8] text-white rounded-full">
                    {previewItem.category || "General"}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {previewItem.title}
                </h3>
                <p className="text-slate-600 text-xs mt-2 leading-relaxed whitespace-pre-line">
                  {previewItem.description || previewItem.content}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-[#F5F8FB] p-3 rounded-xl border border-[#D9E2EC]">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Target Audience</span>
                  <p className="font-bold text-slate-800">{previewItem.targetAudience === "all" ? "Everyone" : (previewItem.targetAudience || "Everyone")}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Broadcast Date</span>
                  <p className="font-bold text-slate-800">{formatDateTimeDisplay(previewItem.publishDate || previewItem.createdAt)}</p>
                </div>
                {previewItem.expiryDate && (
                  <div className="col-span-2 pt-2 border-t border-[#D9E2EC]">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Expires On</span>
                    <p className="font-bold text-amber-900">{formatDateTimeDisplay(previewItem.expiryDate)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
