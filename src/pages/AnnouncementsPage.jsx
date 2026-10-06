import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone,
  Search,
  Calendar,
  Clock,
  Pin,
  Flame,
  Building2,
  ExternalLink,
  X,
  Share2,
  Bookmark,
  Heart,
  ArrowRight,
  Grid,
  Check,
} from "lucide-react";
import { announcementService } from "../services/announcementService";
import { API_BASE_URL } from "../services/api";
import vcetLogoImg from "../assets/vcet-logo.png";

const DEPARTMENTS = [
  "All",
  "CSE",
  "AI&DS",
  "ECE",
  "IT",
  "EEE",
  "MECH",
  "CIVIL",
];

function resolvePoster(item) {
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

function formatDateDisplay(raw) {
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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

function formatRelativeTime(raw) {
  if (!raw) return "Recently";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "Recently";
  const now = new Date();
  const diffHours = Math.round((now - d) / (1000 * 60 * 60));
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDateDisplay(raw);
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  // Feed controls
  const [activeTab, setActiveTab] = useState("posts"); // "posts" | "urgent" | "departments" | "saved"
  const [selectedDept, setSelectedDept] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedIds, setSavedIds] = useState(() => {
    try {
      const stored = localStorage.getItem("techverse_saved_circulars");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [likedIds, setLikedIds] = useState(() => {
    try {
      const stored = localStorage.getItem("techverse_liked_circulars");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        setLoading(true);
        const data = await announcementService.getAll({ all: "true" });
        setAnnouncements(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load announcements:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnnouncements();
  }, []);

  const toggleSave = (id) => {
    setSavedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem("techverse_saved_circulars", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const toggleLike = (id) => {
    setLikedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem("techverse_liked_circulars", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleShare = async (item) => {
    const url = `${window.location.origin}/announcements?id=${item._id || item.id}`;
    const text = `📢 ${item.title}\n${url}`;

    // Try Web Share API first (works great on mobile)
    if (navigator.share) {
      try {
        await navigator.share({ title: item.title, text: item.description || item.title, url });
        setCopiedId(item._id || item.id);
        setTimeout(() => setCopiedId(null), 2000);
        return;
      } catch (err) {
        // User cancelled share or error — fall through to clipboard
        if (err.name === 'AbortError') return;
      }
    }

    // Try clipboard API (requires HTTPS, works on desktop)
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(url);
        setCopiedId(item._id || item.id);
        setTimeout(() => setCopiedId(null), 2000);
        return;
      } catch {}
    }

    // Fallback: textarea trick — works on HTTP and all browsers
    try {
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedId(item._id || item.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Last resort: show the URL in a prompt
      window.prompt('Copy this link:', url);
    }
  };

  // Filtered dataset
  const filteredList = useMemo(() => {
    const now = new Date();
    return announcements.filter((item) => {
      if (item.isActive === false) return false;

      // Automated scheduling: hide circulars whose publishDate is in the future
      if (item.publishDate && new Date(item.publishDate) > now) return false;
      // Automated expiry: hide circulars whose expiryDate has passed
      if (item.expiryDate && new Date(item.expiryDate) <= now) return false;

      const id = item._id || item.id;
      const q = searchQuery.toLowerCase().trim();
      const title = (item.title || "").toLowerCase();
      const desc = (item.description || item.content || "").toLowerCase();
      const cat = (item.category || "").toLowerCase();
      const prio = (item.priority || "").toLowerCase();

      // Search match
      const matchesQuery = !q || title.includes(q) || desc.includes(q) || cat.includes(q);

      // Department match
      const deptArray =
        Array.isArray(item.departments) && item.departments.length > 0
          ? item.departments
          : (item.department || item.departmentId?.code || item.departmentId?.name || "All")
              .split(",")
              .map((s) => s.trim());

      const matchesDept =
        selectedDept === "All" ||
        deptArray.some(
          (d) =>
            d.toLowerCase() === selectedDept.toLowerCase() ||
            d.toLowerCase() === "all" ||
            d.toLowerCase() === "all departments"
        );

      // Tab match
      let matchesTab = true;
      if (activeTab === "urgent") {
        matchesTab =
          prio === "urgent" || prio === "important" || prio === "high" || item.isPinned;
      } else if (activeTab === "saved") {
        matchesTab = savedIds.includes(id);
      }

      return matchesQuery && matchesDept && matchesTab;
    });
  }, [announcements, searchQuery, selectedDept, activeTab, savedIds]);

  const now = new Date();
  const liveAnnouncements = announcements.filter(
    (a) =>
      a.isActive !== false &&
      (!a.publishDate || new Date(a.publishDate) <= now) &&
      (!a.expiryDate || new Date(a.expiryDate) > now)
  );
  const activeCount = liveAnnouncements.length;
  const urgentCount = liveAnnouncements.filter(
    (a) => (a.priority || "").toLowerCase() === "urgent"
  ).length;

  return (
    <div className="min-h-screen bg-vcet-surface text-slate-800 font-sans antialiased selection:bg-vcet-blue selection:text-white pb-32">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* ── 1. CLEAN INSTITUTIONAL PAGE HEADER ── */}
        <div className="bg-white border border-vcet-line rounded-3xl p-6 sm:p-8 mb-6 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-vcet-blue text-xs font-bold">
                <Megaphone className="w-3.5 h-3.5" />
                <span>VCET Official Notice Board</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Campus Announcements &amp; Circulars
              </h1>
              <p className="text-sm text-slate-500 max-w-2xl font-normal">
                Stay updated with real-time institutional circulars, semester exam alerts, placement drives, hackathons, workshops, and departmental notifications.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start md:self-center">
              <div className="flex items-center gap-4 bg-vcet-surface border border-vcet-line rounded-2xl px-4 py-2.5 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Active</span>
                  <span className="text-slate-900 font-black text-base">{activeCount}</span>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Urgent</span>
                  <span className="text-rose-600 font-black text-base">{urgentCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. SEARCH & CONTROLS BAR ── */}
        <div className="bg-white border border-vcet-line rounded-2xl p-4 sm:p-5 mb-6 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search circulars by title, topic, or keyword..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-vcet-line rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-vcet-blue transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Department Dropdown */}
            <div className="w-full md:w-52">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#F8FAFC] border border-vcet-line rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:bg-white cursor-pointer"
              >
                <option value="All">All Departments</option>
                {DEPARTMENTS.filter((d) => d !== "All").map((d) => (
                  <option key={d} value={d}>
                    {d} Department
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center justify-start sm:justify-center gap-6 sm:gap-10 border-t border-slate-100 pt-3 text-xs font-black uppercase tracking-wider overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex items-center gap-2 py-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "posts"
                  ? "border-vcet-blue text-vcet-blue"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>All Circulars</span>
            </button>

            <button
              onClick={() => setActiveTab("urgent")}
              className={`flex items-center gap-2 py-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "urgent"
                  ? "border-rose-600 text-rose-600"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>Urgent Alerts</span>
              {urgentCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-100 text-rose-700">
                  {urgentCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("saved")}
              className={`flex items-center gap-2 py-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "saved"
                  ? "border-amber-500 text-amber-600"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Saved</span>
              {savedIds.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                  {savedIds.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── 3. CLEAN LIGHT SQUARE CARDS GRID ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-square bg-white rounded-2xl border border-vcet-line animate-pulse p-4"
              />
            ))}
          </div>
        ) : filteredList.length === 0 ? (
          <div className="text-center py-20 bg-white border border-vcet-line rounded-3xl p-8 shadow-xs">
            <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900">No Circulars Found</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              No matching circulars for the current filter. Try adjusting your search query or reset filters.
            </p>
            <button
              onClick={() => {
                setSelectedDept("All");
                setActiveTab("posts");
                setSearchQuery("");
              }}
              className="mt-4 px-4 py-2 bg-vcet-blue hover:bg-[#0077C8] text-white font-bold text-xs rounded-xl transition cursor-pointer"
            >
              View All Circulars
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredList.map((item) => {
              const id = item._id || item.id;
              const poster = resolvePoster(item);
              const isSaved = savedIds.includes(id);
              const isLiked = likedIds.includes(id);
              const isUrgent = (item.priority || "").toLowerCase() === "urgent";

              return (
                <motion.div
                  key={id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => setSelectedAnnouncement(item)}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-vcet-line overflow-hidden shadow-xs hover:shadow-lg hover:border-vcet-blue/50 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                >
                  {/* Card Thumbnail Box */}
                  <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden">
                    {poster ? (
                      <img
                        src={poster}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-vcet-blue/10 via-blue-50 to-[#0077C8]/15 text-vcet-blue p-4 text-center">
                        <Megaphone className="w-10 h-10 opacity-50 mb-1" />
                        <span className="text-[10px] font-black uppercase tracking-wider opacity-70">
                          {item.category || "Notice"}
                        </span>
                      </div>
                    )}

                    {/* Top Floating Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                      {isUrgent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-600 text-white shadow-xs flex items-center gap-1">
                          <Flame className="w-3 h-3" /> Urgent
                        </span>
                      )}
                      {item.isPinned && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-amber-950 shadow-xs flex items-center gap-1">
                          <Pin className="w-3 h-3" /> Pinned
                        </span>
                      )}
                    </div>

                    <span className="absolute top-3 right-3 px-2.5 py-0.5 text-[10px] font-bold bg-white/95 backdrop-blur-md text-slate-800 rounded-full border border-slate-200 shadow-xs">
                      {item.category || "General"}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-vcet-blue mb-1">
                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">
                          {Array.isArray(item.departments) && item.departments.length > 0
                            ? (item.departments.includes("All") ? "All Departments" : item.departments.join(", "))
                            : (item.department || item.departmentId?.code || "All Departments")}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-vcet-blue transition-colors line-clamp-2 leading-snug">
                        {item.title}
                      </h3>

                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                        {item.description || item.content}
                      </p>
                    </div>

                    {/* Metadata pill */}
                    <div className="text-[11px] bg-vcet-surface p-2.5 rounded-xl border border-vcet-line space-y-1">
                      <div className="flex flex-col gap-1 text-slate-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-vcet-blue shrink-0" />
                          <span>Published: <strong className="text-slate-900">{formatDateTimeDisplay(item.publishDate || item.createdAt)}</strong></span>
                        </span>
                        {item.expiryDate && (
                          <span className="text-amber-800 font-bold flex items-center gap-1 pt-1 border-t border-vcet-line/70">
                            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Expires: <strong className="text-amber-900">{formatDateTimeDisplay(item.expiryDate)}</strong></span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="px-5 py-3 bg-white border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-slate-500">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(id);
                        }}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-rose-600 transition cursor-pointer"
                        title="Like"
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSave(id);
                        }}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-amber-600 transition cursor-pointer"
                        title="Bookmark"
                      >
                        <Bookmark
                          className={`w-4 h-4 ${isSaved ? "fill-amber-500 text-amber-500" : ""}`}
                        />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(item);
                        }}
                        className={`p-1.5 hover:bg-slate-100 rounded-lg transition cursor-pointer ${
                          copiedId === id ? 'text-green-600' : 'text-slate-600 hover:text-vcet-blue'
                        }`}
                        title={copiedId === id ? 'Link Copied!' : 'Share Link'}
                      >
                        {copiedId === id ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                      </button>
                    </div>

                    <span className="text-xs font-bold text-vcet-blue flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Read More <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── 4. LIGHT 2-COLUMN DETAIL MODAL ─── */}
      <AnimatePresence>
        {selectedAnnouncement && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setSelectedAnnouncement(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl sm:rounded-3xl border border-vcet-line w-full max-w-3xl max-h-[92vh] overflow-y-auto md:overflow-hidden shadow-2xl flex flex-col md:flex-row relative text-slate-800"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="absolute top-3 right-3 z-30 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition cursor-pointer shadow-md"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Left Column: Poster Image */}
              <div className="w-full md:w-1/2 bg-slate-950 flex items-center justify-center relative min-h-[220px] max-h-[42vh] md:max-h-[85vh] md:min-h-full shrink-0 border-b md:border-b-0 md:border-r border-slate-200">
                {resolvePoster(selectedAnnouncement) ? (
                  <img
                    src={resolvePoster(selectedAnnouncement)}
                    alt={selectedAnnouncement.title}
                    className="w-full h-full object-contain max-h-[42vh] md:max-h-[85vh]"
                  />
                ) : (
                  <div className="p-8 text-center space-y-2 text-white">
                    <Megaphone className="w-12 h-12 text-blue-300 mx-auto opacity-70" />
                    <span className="text-xs font-bold opacity-80 block">
                      VCET Institutional Circular
                    </span>
                  </div>
                )}
                {resolvePoster(selectedAnnouncement) && (
                  <a
                    href={resolvePoster(selectedAnnouncement)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black/90 text-white text-xs font-bold backdrop-blur-md flex items-center gap-1.5 shadow-sm transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Full Image
                  </a>
                )}
              </div>

              {/* Right Column: Circular Details */}
              <div className="w-full md:w-1/2 flex flex-col justify-between flex-1 bg-white md:max-h-[85vh]">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 p-1 flex items-center justify-center">
                      <img src={vcetLogoImg} alt="VCET" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-900 flex items-center gap-1">
                        VCET Official
                        <Check className="w-3 h-3 text-vcet-blue stroke-[3]" />
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium block">
                        {Array.isArray(selectedAnnouncement.departments) &&
                        selectedAnnouncement.departments.length > 0
                          ? selectedAnnouncement.departments.includes("All")
                            ? "All Departments"
                            : selectedAnnouncement.departments.join(", ")
                          : selectedAnnouncement.department ||
                            selectedAnnouncement.departmentId?.name ||
                            "All Departments"}
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-vcet-blue border border-blue-200">
                    {selectedAnnouncement.category || "Circular"}
                  </span>
                </div>

                {/* Body Content */}
                <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
                  <h2 className="text-base font-black text-slate-900 leading-snug">
                    {selectedAnnouncement.title}
                  </h2>

                  <div className="bg-vcet-surface rounded-xl p-3.5 border border-vcet-line space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Target Audience:</span>
                      <strong className="text-slate-900">{selectedAnnouncement.targetAudience === "all" ? "Everyone" : selectedAnnouncement.targetAudience || "Everyone"}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-vcet-line/70">
                      <span>Published:</span>
                      <strong className="text-slate-900">{formatDateTimeDisplay(selectedAnnouncement.publishDate || selectedAnnouncement.createdAt)}</strong>
                    </div>
                    {selectedAnnouncement.expiryDate && (
                      <div className="flex items-center justify-between text-amber-900 font-bold pt-1 border-t border-vcet-line/70">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600" /> Deadline / Expiry:
                        </span>
                        <span>{formatDateTimeDisplay(selectedAnnouncement.expiryDate)}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-slate-700 leading-relaxed whitespace-pre-line font-normal text-xs sm:text-sm bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                    {selectedAnnouncement.description ||
                      selectedAnnouncement.content ||
                      "No additional instructions specified."}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-100 bg-vcet-surface flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleLike(selectedAnnouncement._id || selectedAnnouncement.id)}
                      className="p-1.5 text-slate-600 hover:text-rose-600 transition cursor-pointer"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          likedIds.includes(selectedAnnouncement._id || selectedAnnouncement.id)
                            ? "fill-rose-500 text-rose-500"
                            : ""
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => toggleSave(selectedAnnouncement._id || selectedAnnouncement.id)}
                      className="p-1.5 text-slate-600 hover:text-amber-600 transition cursor-pointer"
                    >
                      <Bookmark
                        className={`w-5 h-5 ${
                          savedIds.includes(selectedAnnouncement._id || selectedAnnouncement.id)
                            ? "fill-amber-500 text-amber-500"
                            : ""
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => handleShare(selectedAnnouncement)}
                      className={`p-1.5 transition cursor-pointer ${
                        copiedId === (selectedAnnouncement._id || selectedAnnouncement.id)
                          ? 'text-green-600'
                          : 'text-slate-600 hover:text-vcet-blue'
                      }`}
                      title={copiedId === (selectedAnnouncement._id || selectedAnnouncement.id) ? 'Link Copied!' : 'Share Link'}
                    >
                      {copiedId === (selectedAnnouncement._id || selectedAnnouncement.id)
                        ? <Check className="w-5 h-5" />
                        : <Share2 className="w-5 h-5" />}
                    </button>
                  </div>

                  <button
                    onClick={() => setSelectedAnnouncement(null)}
                    className="px-5 py-1.5 rounded-xl bg-vcet-blue hover:bg-[#0077C8] text-white font-bold text-xs shadow-xs transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}