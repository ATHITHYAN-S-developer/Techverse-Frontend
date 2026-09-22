import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Search,
  Filter,
  Sparkles,
  Star,
  Award,
  Clock,
  Layers,
  Code2,
  Laptop,
  Cpu,
  Cloud,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  GraduationCap,
  ShieldAlert,
  Settings,
  PlusCircle,
} from "lucide-react";
import { courseService } from "../services/courseService";
import { useAuth } from "../context/AuthContext";
import CourseCard from "../components/CourseCard";
import TextReveal from "../components/TextReveal";
import AnnouncementMarquee from "../components/AnnouncementMarquee";


const CATEGORY_ICONS = {
  ALL: Layers,
  Programming: Code2,
  "Web Development": Laptop,
  "Artificial Intelligence": Cpu,
  "Cloud & DevOps": Cloud,
  "Cybersecurity & Networks": Award,
  "Data Science": GraduationCap,
};

export default function CoursesPage() {
  const { user } = useAuth();
  const isFacultyOrAdmin = user && (user.role === "faculty" || user.role === "teacher" || user.role === "admin");
  const courseManagerLink = user?.role === "admin" ? "/admin/courses" : "/faculty/courses";
  const moduleManagerLink = user?.role === "admin" ? "/admin/modules" : "/faculty/modules";

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [progressTab, setProgressTab] = useState("all"); // "all" | "in-progress" | "completed"

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getAllCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading courses:", err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const base = [
      "ALL",
      "Programming",
      "Web Development",
      "Artificial Intelligence",
      "Cloud & DevOps",
      "Cybersecurity & Networks",
      "Data Science",
    ];
    const fromCourses = courses.map((c) => c.category).filter(Boolean);
    const combined = Array.from(new Set([...base, ...fromCourses]));
    return combined;
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const title = c.title || "";
      const desc = c.description || "";
      const instructor = c.instructor || c.instructorName || "";
      const cat = c.category || "";
      const level = c.level || "";
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch =
        q === "" ||
        title.toLowerCase().includes(q) ||
        desc.toLowerCase().includes(q) ||
        instructor.toLowerCase().includes(q);

      const matchesCategory =
        categoryFilter === "ALL" ||
        cat.toLowerCase() === categoryFilter.toLowerCase();

      const matchesLevel =
        levelFilter === "ALL" ||
        level.toLowerCase().includes(levelFilter.toLowerCase());

      const matchesProgress =
        progressTab === "all"
          ? true
          : progressTab === "in-progress"
          ? c.progress > 0 && c.progress < 100
          : c.progress >= 100;

      return matchesSearch && matchesCategory && matchesLevel && matchesProgress;
    });
  }, [courses, searchQuery, categoryFilter, levelFilter, progressTab]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("ALL");
    setLevelFilter("ALL");
    setProgressTab("all");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 selection:bg-[#0B4A8F] selection:text-white scroll-smooth select-none">
      {/* =========================================================================
          1. HERO SECTION (Bright Ice-Blue Theme)
          ========================================================================= */}
      <section className="relative bg-gradient-to-r from-sky-100 via-blue-50 to-indigo-100/70 text-slate-900 py-10 sm:py-14 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-sky-200/60 shadow-2xs">
        <div className="w-full max-w-[1500px] mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-sky-300 text-xs font-bold uppercase tracking-widest text-[#0062A8] mb-3 shadow-2xs"
              >
                <Sparkles size={13} className="text-[#0062A8]" />
                <span>VCET SELF-PACED TECHNICAL ACADEMY</span>
              </motion.div>

              <TextReveal
                text="Self-Paced Courses & Certifications"
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-slate-900"
                delay={0.12}
              />

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
                className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-medium max-w-xl"
              >
                Gain industry-ready competencies in Full-Stack Development, AI & ML, Cloud Architecture, and DevOps with verified VCET credentials.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3, ease: "easeOut" }}
              className="flex items-center gap-3 shrink-0 flex-wrap"
            >
              {isFacultyOrAdmin && (
                <Link
                  to={courseManagerLink}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-sky-300 text-[#0062A8] hover:bg-sky-50 font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-sm transition-all"
                >
                  <PlusCircle size={16} />
                  <span>Author / Edit Courses</span>
                </Link>
              )}

              <Link
                to="/prepzone"
                className="group relative inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[#0062A8] hover:bg-[#0B4A8F] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-md transition-all duration-150 cursor-pointer"
              >
                <span>PREPZONE TRAINING</span>
                <ArrowRight
                  size={15}
                  className="transition-transform duration-150 group-hover:translate-x-1 text-white"
                />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* VCET Watermark Marquee below the Hero */}
      <AnnouncementMarquee />


      {/* =========================================================================
          2. MAIN CONTENT AREA
          ========================================================================= */}
      <main className="w-full max-w-[1500px] mx-auto px-3 sm:px-5 lg:px-8 mt-6 space-y-6">
        {/* Faculty / Admin Quick Control Bar */}
        {isFacultyOrAdmin && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-[#0062A8] text-white font-bold text-xs">
                <Settings className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Faculty & Admin Curriculum Control Suite
                </h4>
                <p className="text-[11px] text-slate-500">
                  Create custom courses, attach video playlists, configure coding challenges, and author MCQ knowledge tests.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={courseManagerLink}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:border-[#0062A8] text-slate-800 hover:text-[#0062A8] text-xs font-bold transition-all shadow-2xs"
              >
                Manage Courses
              </Link>
              <Link
                to={moduleManagerLink}
                className="px-3.5 py-1.5 rounded-xl bg-[#0062A8] hover:bg-[#0B4A8F] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Modules & Syllabus</span>
              </Link>
            </div>
          </div>
        )}

        {/* Domain Category Selector Pills */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => {
            const IconComponent = CATEGORY_ICONS[cat] || Layers;
            const isSelected = categoryFilter === cat;
            const count =
              cat === "ALL"
                ? courses.length
                : courses.filter((c) => c.category?.toLowerCase() === cat.toLowerCase()).length;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all duration-150 cursor-pointer select-none shrink-0 ${
                  isSelected
                    ? "bg-sky-100 text-[#0062A8] border-2 border-[#0062A8] font-black shadow-2xs"
                    : "bg-white text-slate-700 hover:bg-sky-50/70 border border-slate-200/90 font-semibold"
                }`}
              >
                <IconComponent size={16} />
                <span>{cat === "ALL" ? "All Domains" : cat}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                    isSelected
                      ? "bg-[#0062A8] text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search, Status Tabs & Filters Bar */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses by title, topic, or instructor..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0062A8]/20 focus:border-[#0062A8] bg-slate-50/50 hover:bg-white transition-all"
              />
            </div>

            {/* Level Selector */}
            <div className="flex items-center gap-2">
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#0062A8]"
              >
                <option value="ALL">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            {/* Progress Tabs & Status Selector */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200/70">
                {[
                  { id: "all", label: "All Status" },
                  { id: "in-progress", label: "In Progress" },
                  { id: "completed", label: "Completed" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setProgressTab(t.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      progressTab === t.id
                        ? "bg-sky-100 text-[#0062A8] border border-sky-300 font-extrabold shadow-2xs"
                        : "text-slate-600 hover:text-slate-900 font-semibold"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {(searchQuery || categoryFilter !== "ALL" || levelFilter !== "ALL" || progressTab !== "all") && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. COURSES GRID OR EMPTY STATE
            ========================================================================= */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 animate-pulse shadow-xs"
              >
                <div className="w-full aspect-video bg-slate-200 rounded-xl" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-2/3" />
                <div className="h-9 bg-slate-100 rounded-xl mt-4" />
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 sm:p-16 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 flex items-center justify-center text-[#0B4A8F]">
              <BookOpen size={28} />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-800">
                No Courses Available in Catalog
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Technical courses published by faculty and administrators will automatically appear here for enrollment and learning.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/training"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B4A8F] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#084282] transition-colors shadow-xs"
              >
                <span>Explore Placement Tracks</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <Search size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-800">
                No matching courses found
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                No courses matched your current search criteria or domain filters.
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>Reset Filters</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course._id || course.id || course.slug}
                course={course}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
