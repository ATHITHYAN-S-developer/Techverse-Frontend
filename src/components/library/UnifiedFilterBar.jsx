import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Layers,
  BookOpen,
  FileText,
  ClipboardList,
  Monitor,
  Download,
  Building2,
  Calendar,
  SlidersHorizontal,
  Search,
  X,
  Sparkles,
  UserCircle2,
  Check,
  Grid,
  List
} from "lucide-react";

export const CATEGORIES = [
  {
    key: "all",
    label: "All Resources",
    shortLabel: "All",
    icon: Layers,
    color: "#0062A8",
    bgColor: "#EBF5FF",
    borderColor: "#BFDBFE",
    description: "Lecture notes, question banks, software & materials"
  },
  {
    key: "subjects",
    label: "Subjects & Syllabus",
    shortLabel: "Subjects",
    icon: BookOpen,
    color: "#7C3AED",
    bgColor: "#F3E8FF",
    borderColor: "#DDD6FE",
    description: "Curriculum courses, syllabus units & credit info"
  },
  {
    key: "notes",
    label: "Lecture Notes",
    shortLabel: "Notes",
    icon: FileText,
    color: "#0284C7",
    bgColor: "#E0F2FE",
    borderColor: "#BAE6FD",
    description: "Handouts, unit-wise notes & faculty PPTs"
  },
  {
    key: "question_bank",
    label: "Question Bank",
    shortLabel: "Question Bank",
    icon: ClipboardList,
    color: "#D97706",
    bgColor: "#FEF3C7",
    borderColor: "#FDE68A",
    description: "Past year university exam papers & 2-mark banks"
  },
  {
    key: "software",
    label: "Free Software & Tools",
    shortLabel: "Software",
    icon: Monitor,
    color: "#059669",
    bgColor: "#D1FAE5",
    borderColor: "#A7F3D0",
    description: "Simulators, developer SDKs, compilers & utilities"
  },
  {
    key: "downloads",
    label: "Downloads & Repos",
    shortLabel: "Downloads",
    icon: Download,
    color: "#E11D48",
    bgColor: "#FFE4E6",
    borderColor: "#FECDD3",
    description: "Direct offline PDFs, lab manuals & code repositories"
  }
];

export default function UnifiedFilterBar({
  category,
  onCategoryChange,
  selectedDeptId,
  onDeptChange,
  departments = [],
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  myDept,
  onResetFilters,
  totalCount = 0
}) {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [deptOpen, setDeptOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const categoryRef = useRef(null);
  const deptRef = useRef(null);
  const sortRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (categoryRef.current && !categoryRef.current.contains(e.target)) setCategoryOpen(false);
      if (deptRef.current && !deptRef.current.contains(e.target)) setDeptOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeCategoryObj = CATEGORIES.find((c) => c.key === category) || CATEGORIES[0];
  const CategoryIcon = activeCategoryObj.icon;

  const activeDeptObj = departments.find(
    (d) => String(d.id) === String(selectedDeptId) || String(d.code).toLowerCase() === String(selectedDeptId).toLowerCase()
  );

  const hasActiveFilters =
    category !== "all" ||
    selectedDeptId !== "all" ||
    searchQuery.trim() !== "";

  return (
    <div className="w-full relative z-30 mb-6">
      {/* Main Filter Toolbar Container */}
      <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl p-3 shadow-lg shadow-slate-900/5 transition-all">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5">
          
          {/* 1. SINGLE CATEGORY DROPDOWN */}
          <div className="relative flex-1" ref={categoryRef}>
            <button
              type="button"
              onClick={() => {
                setCategoryOpen(!categoryOpen);
                setDeptOpen(false);
                setSortOpen(false);
              }}
              className="w-full h-12 flex items-center justify-between gap-3 px-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 hover:border-slate-300 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-xs"
                  style={{ backgroundColor: activeCategoryObj.bgColor, color: activeCategoryObj.color }}
                >
                  <CategoryIcon size={16} strokeWidth={2.2} />
                </span>
                <div className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-0.5">
                    Category Filter
                  </span>
                  <span className="block text-[13px] font-bold text-slate-800 truncate">
                    {activeCategoryObj.label}
                  </span>
                </div>
              </div>
              <ChevronDown
                size={16}
                className={`text-slate-400 shrink-0 transition-transform duration-200 ${
                  categoryOpen ? "rotate-180 text-blue-600" : ""
                }`}
              />
            </button>

            {/* Category Dropdown Menu */}
            <AnimatePresence>
              {categoryOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute left-0 top-full mt-2 w-full sm:w-[320px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl shadow-slate-900/15 z-50 overflow-hidden"
                >
                  <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Select Resource Type
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                      {CATEGORIES.length} Options
                    </span>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto space-y-0.5 pr-0.5">
                    {CATEGORIES.map((item) => {
                      const Icon = item.icon;
                      const isSelected = category === item.key;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => {
                            onCategoryChange(item.key);
                            setCategoryOpen(false);
                          }}
                          className={`w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-all ${
                            isSelected
                              ? "bg-slate-100/90 text-slate-900 font-bold"
                              : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <span
                            className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                            style={{ backgroundColor: item.bgColor, color: item.color }}
                          >
                            <Icon size={15} strokeWidth={2.2} />
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-[13px] font-bold leading-snug">{item.label}</span>
                              {isSelected && <Check size={14} className="text-blue-600 shrink-0 ml-1" />}
                            </div>
                            <p className="text-[11px] text-slate-500 font-normal line-clamp-1 mt-0.5">
                              {item.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {myDept && (
                    <div className="pt-1 mt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          onDeptChange(myDept.id);
                          setCategoryOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg bg-indigo-50/60 hover:bg-indigo-50 text-indigo-900 text-left transition-colors"
                      >
                        <UserCircle2 size={16} className="text-indigo-600 shrink-0" />
                        <span className="text-[12px] font-bold flex-1 truncate">
                          My Branch ({myDept.code || myDept.name})
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-200/60 text-indigo-800">
                          Auto
                        </span>
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 2. SINGLE DEPARTMENT DROPDOWN */}
          <div className="relative flex-1" ref={deptRef}>
            <button
              type="button"
              onClick={() => {
                setDeptOpen(!deptOpen);
                setCategoryOpen(false);
                setSortOpen(false);
              }}
              className="w-full h-12 flex items-center justify-between gap-3 px-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 hover:border-slate-300 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-blue-50 text-blue-700 shadow-xs"
                  style={activeDeptObj?.color ? { backgroundColor: `${activeDeptObj.color}18`, color: activeDeptObj.color } : {}}
                >
                  <Building2 size={16} strokeWidth={2.2} />
                </span>
                <div className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-0.5">
                    Department
                  </span>
                  <span className="block text-[13px] font-bold text-slate-800 truncate">
                    {activeDeptObj ? `${activeDeptObj.code} - ${activeDeptObj.name}` : "All Departments"}
                  </span>
                </div>
              </div>
              <ChevronDown
                size={16}
                className={`text-slate-400 shrink-0 transition-transform duration-200 ${
                  deptOpen ? "rotate-180 text-blue-600" : ""
                }`}
              />
            </button>

            {/* Department Dropdown Menu */}
            <AnimatePresence>
              {deptOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute left-0 top-full mt-2 w-full sm:w-[320px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl shadow-slate-900/15 z-50 overflow-hidden"
                >
                  <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Engineering Branches
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {departments.length} Available
                    </span>
                  </div>

                  <div className="max-h-[280px] overflow-y-auto space-y-0.5 pr-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        onDeptChange("all");
                        setDeptOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all ${
                        selectedDeptId === "all"
                          ? "bg-slate-100/90 text-slate-900 font-bold"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                        <span className="text-[13px]">All Departments (VCET)</span>
                      </div>
                      {selectedDeptId === "all" && <Check size={14} className="text-blue-600" />}
                    </button>

                    {departments.map((dept) => {
                      const isSelected =
                        String(selectedDeptId) === String(dept.id) ||
                        String(selectedDeptId).toLowerCase() === String(dept.code).toLowerCase();
                      return (
                        <button
                          key={dept.id || dept._id}
                          type="button"
                          onClick={() => {
                            onDeptChange(dept.id || dept._id);
                            setDeptOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all ${
                            isSelected
                              ? "bg-slate-100/90 text-slate-900 font-bold"
                              : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: dept.color || "#0284c7" }}
                            />
                            <div className="min-w-0">
                              <span className="text-[13px] block truncate">
                                <span className="font-extrabold text-slate-900">{dept.code}</span> — {dept.name}
                              </span>
                            </div>
                          </div>
                          {isSelected && <Check size={14} className="text-blue-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>


          {/* 4. SEARCH INPUT */}
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search title, tags, course code..."
              className="w-full h-12 rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-[13px] font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* 5. VIEW & SORT CONTROLS */}
          <div className="flex items-center gap-1.5 shrink-0 self-end lg:self-center">
            {/* Sort Dropdown */}
            <div className="relative" ref={sortRef}>
              <button
                type="button"
                onClick={() => {
                  setSortOpen(!sortOpen);
                  setCategoryOpen(false);
                  setDeptOpen(false);
                  setSemesterOpen(false);
                }}
                className="h-12 px-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 text-[12px] font-bold text-slate-700 flex items-center gap-1.5 transition-all"
              >
                <SlidersHorizontal size={14} className="text-slate-500" />
                <span className="hidden sm:inline">Sort:</span>
                <span className="text-blue-600 capitalize">
                  {sortBy === "downloads" ? "Downloads" : sortBy === "az" ? "A-Z" : "Latest"}
                </span>
                <ChevronDown size={13} className="text-slate-400" />
              </button>

              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 top-full mt-2 w-[160px] rounded-xl border border-slate-200 bg-white p-1 shadow-xl shadow-slate-900/15 z-50"
                  >
                    {[
                      { key: "latest", label: "Latest First" },
                      { key: "downloads", label: "Most Downloaded" },
                      { key: "az", label: "Title (A – Z)" }
                    ].map((s) => (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => {
                          onSortChange(s.key);
                          setSortOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-[12px] font-bold text-left transition-colors ${
                          sortBy === s.key ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        {s.label}
                        {sortBy === s.key && <Check size={13} className="text-blue-600" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* List / Grid View Toggles */}
            <div className="h-12 p-1 rounded-xl border border-slate-200 bg-slate-100/70 flex items-center gap-1">
              <button
                type="button"
                onClick={() => onViewModeChange("list")}
                aria-label="List view"
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  viewMode === "list"
                    ? "bg-white text-blue-600 shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <List size={16} />
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange("grid")}
                aria-label="Grid view"
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  viewMode === "grid"
                    ? "bg-white text-blue-600 shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Grid size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ACTIVE FILTER TAGS ROW */}
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 flex-wrap pt-3 mt-3 border-t border-slate-100 text-[11px]"
          >
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
              Active:
            </span>

            {category !== "all" && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold border transition-colors"
                style={{
                  backgroundColor: activeCategoryObj.bgColor,
                  color: activeCategoryObj.color,
                  borderColor: activeCategoryObj.borderColor
                }}
              >
                <CategoryIcon size={12} />
                {activeCategoryObj.label}
                <button
                  type="button"
                  onClick={() => onCategoryChange("all")}
                  className="hover:opacity-75 ml-0.5"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {selectedDeptId !== "all" && activeDeptObj && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold bg-blue-50 text-blue-700 border border-blue-200">
                <Building2 size={12} />
                {activeDeptObj.code}
                <button
                  type="button"
                  onClick={() => onDeptChange("all")}
                  className="hover:opacity-75 ml-0.5"
                >
                  <X size={12} />
                </button>
              </span>
            )}


            {searchQuery.trim() !== "" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold bg-slate-100 text-slate-700 border border-slate-300">
                "{searchQuery}"
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="hover:opacity-75 ml-0.5"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={onResetFilters}
              className="text-rose-600 hover:text-rose-700 font-bold ml-auto transition-colors"
            >
              Clear All Filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
