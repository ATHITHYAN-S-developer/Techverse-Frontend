import React, { useState, useEffect, useRef } from "react";
import { Search, X, BookOpen, GraduationCap, Bell, FileText, ArrowRight, CornerDownLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { COURSES } from "../data/courses";
import { RESOURCES } from "../data/resources";
import { ANNOUNCEMENTS } from "../data/announcements";
import { DEPARTMENTS_DATA } from "../data/departments";
import { api } from "../services/api";

export default function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [liveCourses, setLiveCourses] = useState(COURSES);
  const [liveResources, setLiveResources] = useState(RESOURCES);
  const [liveAnnouncements, setLiveAnnouncements] = useState(ANNOUNCEMENTS);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      // Fetch live data
      const fetchLiveData = async () => {
        try {
          const [coursesRes, resourcesRes, annRes] = await Promise.allSettled([
            api.get("/courses"),
            api.get("/resources"),
            api.get("/announcements"),
          ]);
          if (coursesRes.status === "fulfilled" && coursesRes.value?.courses?.length > 0) {
            setLiveCourses(coursesRes.value.courses);
          }
          if (resourcesRes.status === "fulfilled" && Array.isArray(resourcesRes.value) && resourcesRes.value.length > 0) {
            setLiveResources(resourcesRes.value);
          }
          if (annRes.status === "fulfilled" && annRes.value?.announcements?.length > 0) {
            setLiveAnnouncements(annRes.value.announcements);
          }
        } catch (e) {}
      };
      fetchLiveData();
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Global hotkey Escape / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const filteredCourses = q
    ? (liveCourses.length > 0 ? liveCourses : COURSES).filter(
        (c) =>
          (c.title || "").toLowerCase().includes(q) ||
          (c.category || "").toLowerCase().includes(q) ||
          (c.description || "").toLowerCase().includes(q)
      ).slice(0, 4)
    : [];

  const filteredResources = q
    ? (liveResources.length > 0 ? liveResources : RESOURCES).filter(
        (r) =>
          (r.title || r.name || "").toLowerCase().includes(q) ||
          (r.subjectName || "").toLowerCase().includes(q) ||
          (r.department || "").toLowerCase().includes(q) ||
          (r.type || "").toLowerCase().includes(q)
      ).slice(0, 5)
    : [];

  const filteredAnnouncements = q
    ? (liveAnnouncements.length > 0 ? liveAnnouncements : ANNOUNCEMENTS).filter(
        (a) =>
          (a.title || "").toLowerCase().includes(q) ||
          (a.category || "").toLowerCase().includes(q) ||
          (a.content || a.description || "").toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const filteredDepartments = q
    ? Object.values(DEPARTMENTS_DATA)
        .filter(
          (d) =>
            (d.name || "").toLowerCase().includes(q) ||
            (d.code || "").toLowerCase().includes(q) ||
            (d.tagline || "").toLowerCase().includes(q)
        )
        .slice(0, 3)
    : [];

  const totalResults =
    filteredCourses.length +
    filteredResources.length +
    filteredAnnouncements.length +
    filteredDepartments.length;

  const handleSelect = (url) => {
    onClose();
    navigate(url);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input Bar */}
          <div className="flex items-center px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
            <Search className="w-5 h-5 text-[#0062A8] shrink-0 mr-3" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses, subjects, question banks, circulars... (e.g. Python, DSA, DBMS)"
              className="w-full bg-transparent text-slate-800 text-sm sm:text-base outline-none placeholder:text-slate-400 font-medium"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md mr-2"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="px-2 py-1 text-xs font-semibold text-slate-500 bg-slate-200 hover:bg-slate-300 rounded transition-colors"
            >
              ESC
            </button>
          </div>

          {/* Search Results Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-left">
            {!q && (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <Search className="w-8 h-8 mx-auto text-slate-300 stroke-[1.5]" />
                <p className="text-sm">Search across the entire VCET TechVerse repository.</p>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  {["Python", "DSA Notes", "PrepZone", "Zoho", "AI & ML", "Question Bank"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 hover:bg-[#0062A8]/10 hover:text-[#0062A8] rounded-full transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {q && totalResults === 0 && (
              <div className="py-12 text-center text-slate-500">
                <p className="text-base font-semibold text-slate-700">No matching results found for "{query}"</p>
                <p className="text-xs text-slate-400 mt-1">Try searching for course names, department codes (CSE, ECE), or resources.</p>
              </div>
            )}

            {/* Courses Section */}
            {filteredCourses.length > 0 && (
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-[#0062A8]" /> Courses ({filteredCourses.length})
                </div>
                <div className="space-y-1.5">
                  {filteredCourses.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => handleSelect(`/courses/${c.id}`)}
                      className="p-2.5 rounded-xl hover:bg-slate-100/80 cursor-pointer flex items-center justify-between group transition-colors"
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-800 group-hover:text-[#0062A8]">{c.title}</div>
                        <div className="text-xs text-slate-500">{c.category} • {c.level} • {c.duration}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#0062A8] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resources Section */}
            {filteredResources.length > 0 && (
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" /> Academic Resources ({filteredResources.length})
                </div>
                <div className="space-y-1.5">
                  {filteredResources.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => handleSelect("/departments")}
                      className="p-2.5 rounded-xl hover:bg-slate-100/80 cursor-pointer flex items-center justify-between group transition-colors"
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700">{r.title}</div>
                        <div className="text-xs text-slate-500">{r.department} • {r.type || "Notes"} • {r.subjectName || "Core Subject"}</div>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {r.format || "PDF"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Announcements Section */}
            {filteredAnnouncements.length > 0 && (
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-amber-600" /> Announcements ({filteredAnnouncements.length})
                </div>
                <div className="space-y-1.5">
                  {filteredAnnouncements.map((a) => (
                    <div
                      key={a.id}
                      onClick={() => handleSelect("/announcements")}
                      className="p-2.5 rounded-xl hover:bg-slate-100/80 cursor-pointer flex items-center justify-between group transition-colors"
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-800 group-hover:text-amber-700">{a.title}</div>
                        <div className="text-xs text-slate-500">{a.category} • {a.date}</div>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        a.priority === "Urgent" ? "bg-rose-100 text-rose-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {a.priority || "Notice"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Departments Section */}
            {filteredDepartments.length > 0 && (
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#0B4A8F]" /> Departments ({filteredDepartments.length})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredDepartments.map((d) => (
                    <div
                      key={d.code}
                      onClick={() => handleSelect("/departments")}
                      className="p-2.5 rounded-xl border border-slate-100 hover:border-[#0062A8]/30 hover:bg-slate-50 cursor-pointer group transition-colors"
                    >
                      <div className="text-xs font-bold text-[#0062A8]">{d.code}</div>
                      <div className="text-xs font-medium text-slate-700 line-clamp-1">{d.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Tip */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <CornerDownLeft className="w-3 h-3 text-slate-400" /> Click any item or hit Esc to exit
            </span>
            <span>TechVerse Global Index</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
