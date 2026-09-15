import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Megaphone,
  Calendar,
  Clock,
  Download,
  ExternalLink,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Pin,
  Building,
  Tag,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { announcementService } from "../services/announcementService";
import TextReveal from "../components/TextReveal";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDept, setSelectedDept] = useState("All");

  const categories = ["All", "Placement", "Hackathon", "Academic", "Exam", "Event", "General"];
  const departments = ["All", "All Departments", "CSE", "AI&DS", "IT", "ECE", "EEE", "MECH", "CIVIL"];

  useEffect(() => {
    async function loadData() {
      const data = await announcementService.getAll();
      setAnnouncements(data);
    }
    loadData();
  }, []);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((item) => {
      const title = item.title || "";
      const desc = item.description || item.content || "";
      const author = item.authorName || item.author || "";
      const cat = item.category || "General";
      const deptName = item.departmentId?.code || item.department || "All Departments";

      const matchSearch =
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        author.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        selectedCategory === "All" ||
        cat.toLowerCase() === selectedCategory.toLowerCase();

      const matchDept =
        selectedDept === "All" ||
        deptName.toLowerCase().includes(selectedDept.toLowerCase()) ||
        deptName === "All Departments";

      return matchSearch && matchCategory && matchDept;
    });
  }, [announcements, searchQuery, selectedCategory, selectedDept]);

  const pinnedItems = filteredAnnouncements.filter((item) => item.isPinned || item.pinned);
  const regularItems = filteredAnnouncements.filter((item) => !item.isPinned && !item.pinned);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 select-none">
      {/* 1. Header Banner */}
      <section className="bg-gradient-to-r from-[#0062A8] via-[#004f87] to-[#003860] text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full border-4 border-white" />
          <div className="absolute right-10 bottom-0 w-96 h-96 rounded-full border-2 border-white" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs font-bold uppercase tracking-widest text-blue-100 mb-4 backdrop-blur-xs">
                <Megaphone size={14} className="text-blue-200" />
                <span>VCET Live Notice Board</span>
              </div>
              <TextReveal
                text="Institutional Announcements"
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white"
                delay={0.12}
              />
              <p className="mt-3 text-sm sm:text-base text-blue-100/90 leading-relaxed font-normal">
                Stay updated with the latest placement drives, autonomous exam circulars, technical hackathons (SIH), and department notifications.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-[#0062A8] font-bold text-sm shadow-lg hover:bg-blue-50 transition-colors"
              >
                <span>Student Portal</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Controls & Filter Bar */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/5 border border-slate-200/80 p-4 sm:p-5">
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Search Input */}
            <div className="relative flex-grow w-full">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search circulars, hackathons, placement drives..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0062A8]/20 focus:border-[#0062A8] bg-slate-50/50 hover:bg-white transition-all"
              />
            </div>

            {/* Department Dropdown Filter */}
            <div className="w-full md:w-auto shrink-0 flex items-center gap-2">
              <Building size={16} className="text-slate-400 hidden sm:inline" />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full md:w-auto px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0062A8]/20 cursor-pointer"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept === "All" ? "Filter by Dept (All)" : dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Pill Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pt-4 mt-3 border-t border-slate-100 no-scrollbar">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1">
              <Filter size={13} /> Categories:
            </span>
            {categories.map((cat) => {
              const active = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? "bg-[#0062A8] text-white shadow-sm shadow-[#0062A8]/30"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Main Announcement Stream */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Pinned Announcements */}
        {pinnedItems.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Pin size={16} className="text-red-500 fill-red-500" />
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">
                Pinned & High-Priority Circulars
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {pinnedItems.map((ann) => (
                <AnnouncementCard key={ann._id || ann.id} item={ann} isPinned={true} />
              ))}
            </div>
          </div>
        )}

        {/* Regular Announcements */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
              <Clock size={16} className="text-[#0062A8]" />
              <span>Recent Announcements ({regularItems.length})</span>
            </h2>
          </div>

          {regularItems.length === 0 && pinnedItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <AlertTriangle size={36} className="text-amber-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800">No announcements match your filter</h3>
              <p className="text-sm text-slate-500 mt-1">
                Try searching with different keywords or resetting category filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedDept("All");
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-[#0062A8] text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {regularItems.map((ann) => (
                <AnnouncementCard key={ann._id || ann.id} item={ann} isPinned={false} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function AnnouncementCard({ item, isPinned }) {
  const imageUrl = item.imageUrl || item.image;
  const priority = String(item.priority || "normal").toLowerCase();
  const dateStr = item.publishDate
    ? new Date(item.publishDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : item.date || "Active";

  return (
    <article
      className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md ${
        isPinned
          ? "border-red-200/90 ring-1 ring-red-100/60 bg-gradient-to-br from-white to-red-50/10"
          : "border-slate-200/80 hover:border-[#0062A8]/40"
      }`}
    >
      <div>
        {/* Banner Poster Image (If Present) */}
        {imageUrl && (
          <div className="relative w-full h-48 sm:h-52 overflow-hidden bg-slate-100">
            <img
              src={imageUrl}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <div className="absolute top-3 right-3 flex items-center gap-1.5">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-md ${
                  priority === "urgent"
                    ? "bg-red-600"
                    : priority === "high" || priority === "important"
                    ? "bg-[#0062A8]"
                    : "bg-slate-800/80 backdrop-blur-sm"
                }`}
              >
                {priority}
              </span>
            </div>
          </div>
        )}

        <div className="p-5 sm:p-6">
          {/* Top Meta: Badges, Date, Department (when no image banner) */}
          {!imageUrl && (
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider text-white ${
                    priority === "urgent"
                      ? "bg-red-500"
                      : priority === "high" || priority === "important"
                      ? "bg-[#0062A8]"
                      : "bg-slate-700"
                  }`}
                >
                  {priority}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#0062A8] border border-blue-100">
                  {item.category || "General"}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <Calendar size={13} />
                <span>{dateStr}</span>
              </div>
            </div>
          )}

          {imageUrl && (
            <div className="flex items-center justify-between gap-2 mb-2.5 text-xs text-slate-400">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0062A8] border border-blue-100 uppercase">
                {item.category || "General"}
              </span>
              <div className="flex items-center gap-1.5">
                <Calendar size={13} />
                <span>{dateStr}</span>
              </div>
            </div>
          )}

          {/* Title */}
          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug tracking-tight mb-2 hover:text-[#0062A8] transition-colors">
            {item.title}
          </h3>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mb-2">
            {item.description || item.content}
          </p>
        </div>
      </div>

      {/* Footer Info & Action */}
      <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-3 border-t border-slate-100 space-y-3">
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-1 font-semibold text-slate-700">
            <Building size={13} className="text-slate-400" />
            <span>{item.departmentId?.name || item.departmentId?.code || item.department || "All Departments"}</span>
          </div>
          {item.deadline && (
            <div className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-100 text-[11px]">
              Deadline: {item.deadline}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="text-[11px] font-medium text-slate-400">
            Issued by: <span className="font-semibold text-slate-600">{item.authorName || item.author || "Academic Office"}</span>
          </div>

          {(item.linkUrl || item.link) && (
            <a
              href={item.linkUrl || item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0062A8] hover:text-[#004f87] transition-colors bg-blue-50/80 hover:bg-blue-100/70 px-3 py-1.5 rounded-lg"
            >
              <span>{item.linkText || "View Details"}</span>
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
