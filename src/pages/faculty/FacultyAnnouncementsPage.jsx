import React, { useState, useEffect, useMemo } from "react";
import {
  Megaphone,
  Search,
  Eye,
  X,
  Pin,
  Calendar,
  Building,
  ShieldCheck,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  Filter,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { announcementService } from "../../services/announcementService";

export default function FacultyAnnouncementsPage() {
  const { user } = useAuth();
  const { showError } = useToast();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [activeItem, setActiveItem] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await announcementService.getAll();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch {
      showError("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: "all", label: "All Categories" },
    { id: "Academic", label: "Academic" },
    { id: "Exam", label: "Exam Schedule" },
    { id: "Placement", label: "Placement & Drives" },
    { id: "Hackathon", label: "Hackathons" },
    { id: "Event", label: "Events" },
  ];

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((item) => {
      // Category filter
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }

      // Priority filter
      if (selectedPriority !== "all") {
        const itemPri = (item.priority || "normal").toLowerCase();
        if (itemPri !== selectedPriority.toLowerCase()) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const title = (item.title || "").toLowerCase();
        const content = (item.content || item.description || "").toLowerCase();
        const author = (item.createdBy?.name || item.authorName || item.author || "").toLowerCase();
        const dept = (item.department || item.authorDepartment || "").toLowerCase();
        return title.includes(q) || content.includes(q) || author.includes(q) || dept.includes(q);
      }

      return true;
    });
  }, [announcements, selectedCategory, selectedPriority, searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-sky-200 border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Admin Broadcasts • Read Only</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Megaphone className="w-7 h-7 text-sky-400" />
            <span>Institutional & Department Circulars</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Official announcements, examination schedules, college notifications, and academic circulars published exclusively by the Institutional Administration.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl flex items-center gap-3 backdrop-blur-sm self-start md:self-auto shrink-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-lg">
            {announcements.length}
          </div>
          <div className="text-xs">
            <div className="font-bold text-white">Active Circulars</div>
            <div className="text-slate-400 text-[11px]">Synced with Admin portal</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search circulars by title, topic, or admin officer..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-vcet-blue/30 focus:border-vcet-blue transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-vcet-blue/30"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent Priority</option>
              <option value="important">Important</option>
              <option value="normal">Normal</option>
            </select>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                selectedCategory === c.id
                  ? "bg-vcet-blue text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 animate-pulse">
              <div className="h-4 bg-slate-100 rounded w-1/3" />
              <div className="h-5 bg-slate-100 rounded w-3/4" />
              <div className="h-16 bg-slate-100 rounded" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Megaphone className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No circulars match your filters</h3>
          <p className="text-xs text-slate-500">
            {searchQuery
              ? "Try adjusting your search terms or clearing selected category filters."
              : "No official circulars have been published by the administration yet."}
          </p>
          {(searchQuery || selectedCategory !== "all" || selectedPriority !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedPriority("all");
              }}
              className="text-xs font-bold text-vcet-blue hover:underline pt-2 inline-block"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAnnouncements.map((item) => {
            const isUrgent = item.priority === "Urgent" || item.priority === "urgent";
            const isImportant = item.priority === "Important" || item.priority === "important";
            const author =
              item.createdBy?.name ||
              item.authorName ||
              item.author ||
              "College Administration";

            const dept =
              item.department ||
              item.authorDepartment ||
              item.createdBy?.departmentName ||
              item.createdBy?.departmentId?.name ||
              "Institution Wide";

            return (
              <div
                key={item._id || item.id}
                onClick={() => setActiveItem(item)}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
              >
                {item.isPinned && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-white p-1 rounded-bl-xl shadow-xs">
                    <Pin className="w-3.5 h-3.5" />
                  </div>
                )}

                <div>
                  {item.imageUrl && (
                    <div className="relative rounded-xl overflow-hidden mb-3.5 bg-slate-100 h-36">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        isUrgent
                          ? "bg-rose-100 text-rose-700"
                          : isImportant
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-50 text-vcet-blue"
                      }`}
                    >
                      {item.priority || "Notice"}
                    </span>

                    {item.category && (
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {item.category}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-vcet-blue transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {item.content || item.description || "No description provided."}
                  </p>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex flex-col truncate pr-2">
                    <span className="font-bold text-slate-800 text-[11px] truncate flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                      {author}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate">
                      {dept}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-vcet-blue font-bold text-xs shrink-0 group-hover:translate-x-0.5 transition-transform">
                    <span>Read</span>
                    <Eye className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Read Notice Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      activeItem.priority === "Urgent" || activeItem.priority === "urgent"
                        ? "bg-rose-100 text-rose-700"
                        : activeItem.priority === "Important" || activeItem.priority === "important"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-blue-50 text-vcet-blue"
                    }`}
                  >
                    {activeItem.priority || "Notice"}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                    {activeItem.category || "General"}
                  </span>
                </div>
                <h2 className="text-base sm:text-xl font-black text-slate-900 leading-snug">
                  {activeItem.title}
                </h2>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-all shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeItem.imageUrl && (
              <div className="rounded-2xl overflow-hidden border border-slate-200 max-h-72 bg-slate-50 flex items-center justify-center">
                <img
                  src={activeItem.imageUrl}
                  alt={activeItem.title}
                  className="w-full h-full object-contain max-h-72"
                />
              </div>
            )}

            <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed py-2">
              {activeItem.content || activeItem.description || "No circular text available."}
            </div>

            {/* Metadata Footer */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50/80 p-4 rounded-2xl">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Published By (Admin Authority)
                </span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  {activeItem.createdBy?.name || activeItem.authorName || activeItem.author || "Institutional Administration"}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  {activeItem.department || activeItem.authorDepartment || activeItem.createdBy?.departmentName || "Institution Wide"}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Timeline & Expiry
                </span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-vcet-blue shrink-0" />
                  {activeItem.expiryDate
                    ? `Valid until ${new Date(activeItem.expiryDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}`
                    : "Open Notice / No deadline"}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Published: {activeItem.date || (activeItem.createdAt ? new Date(activeItem.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Active")}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all"
              >
                Close Circular
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
