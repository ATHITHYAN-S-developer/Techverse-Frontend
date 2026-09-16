import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Filter,
  Layers,
  GraduationCap,
  X,
  BookOpen,
  Laptop,
  Globe2,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Download,
  Award,
} from "lucide-react";
import { departmentService } from "../services/departmentService";
import { resourceService } from "../services/resourceService";
import TextReveal from "../components/TextReveal";

export default function DepartmentResourcesPage() {
  // Main Category Mode: "notes" | "softwares" | "all"
  const [mainCategory, setMainCategory] = useState("notes");
  const [selectedDeptId, setSelectedDeptId] = useState("all");
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSubjectId, setExpandedSubjectId] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [dbResources, setDbResources] = useState([]);

  React.useEffect(() => {
    async function loadData() {
      try {
        const [depts, resList] = await Promise.all([
          departmentService.getDepartments(),
          resourceService.getAllResources(),
        ]);
        setDepartments(depts || []);
        setDbResources(resList || []);
      } catch (err) {
        console.error("Failed to load department resources from backend MongoDB:", err);
      }
    }
    loadData();
  }, []);

  // Flatten all subjects across all departments
  const allSubjects = useMemo(() => {
    const list = [];
    departments.forEach((dept) => {
      const deptSubjects = dept.subjects || dept.curriculum?.flatMap(c => c.subjects) || [];
      deptSubjects.forEach((subj) => {
        list.push({
          ...subj,
          id: subj.id || subj._id || subj.code,
          deptId: dept.id || dept._id || dept.code,
          deptCode: dept.code,
          deptName: dept.name,
          units: subj.units || ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
          tags: subj.tags || [subj.code, dept.code],
        });
      });
    });
    return list;
  }, [departments]);

  // Flatten all resources across all departments
  const allResources = useMemo(() => {
    return dbResources.map((res) => ({
      ...res,
      id: res._id || res.id,
      deptId: res.departmentId?._id || res.departmentId || res.department || "all",
      deptCode: res.departmentCode || res.department || "CSE",
      deptName: res.departmentName || "Department Resource",
      tags: res.tags || [],
    }));
  }, [dbResources]);

  // Filter subjects for the Notes category
  const filteredSubjects = useMemo(() => {
    return allSubjects.filter((subj) => {
      const matchDept =
        selectedDeptId === "all" || subj.deptId === selectedDeptId;

      const matchSem =
        selectedSemester === "all" ||
        subj.semester.toLowerCase() === selectedSemester.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        q === "" ||
        subj.name.toLowerCase().includes(q) ||
        subj.code.toLowerCase().includes(q) ||
        subj.deptCode.toLowerCase().includes(q) ||
        subj.deptName.toLowerCase().includes(q) ||
        subj.units.some((u) => u.toLowerCase().includes(q)) ||
        subj.tags.some((t) => t.toLowerCase().includes(q));

      return matchDept && matchSem && matchSearch;
    });
  }, [allSubjects, selectedDeptId, selectedSemester, searchQuery]);

  // Filter software & general resources
  const filteredResources = useMemo(() => {
    return allResources.filter((res) => {
      const isSoftware =
        res.category === "Free Software" ||
        res.type.toLowerCase().includes("software") ||
        res.type.toLowerCase().includes("simulator") ||
        res.type.toLowerCase().includes("license") ||
        res.tags.includes("Free Software");

      if (mainCategory === "softwares" && !isSoftware) {
        return false;
      }

      const matchDept =
        selectedDeptId === "all" || res.deptId === selectedDeptId;

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        q === "" ||
        res.name.toLowerCase().includes(q) ||
        res.desc.toLowerCase().includes(q) ||
        res.deptCode.toLowerCase().includes(q) ||
        res.deptName.toLowerCase().includes(q) ||
        res.type.toLowerCase().includes(q) ||
        res.tags.some((t) => t.toLowerCase().includes(q));

      return matchDept && matchSearch;
    });
  }, [allResources, mainCategory, selectedDeptId, searchQuery]);

  const hasActiveFilters =
    selectedDeptId !== "all" ||
    selectedSemester !== "all" ||
    searchQuery.trim() !== "";

  const handleResetFilters = () => {
    setSelectedDeptId("all");
    setSelectedSemester("all");
    setSearchQuery("");
  };

  const toggleSubjectExpand = (id) => {
    setExpandedSubjectId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 selection:bg-[#0B4A8F] selection:text-white scroll-smooth">
      {/* =========================================================================
          1. HERO SECTION
          ========================================================================= */}
      <section className="relative bg-gradient-to-br from-[#0B4A8F] via-[#084282] to-[#063A75] text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden shadow-xs">
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-25">
          <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full border border-white/20" />
          <div className="absolute right-[-40px] top-1/4 h-80 w-80 rounded-full border border-white/20" />
          <div className="absolute -bottom-16 left-1/3 h-64 w-64 rounded-full bg-blue-400/10 blur-2xl" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-widest text-blue-100 mb-3 backdrop-blur-sm"
              >
                <Sparkles size={13} className="text-blue-200" />
                <span>VCET ACADEMIC REPOSITORIES</span>
              </motion.div>

              <TextReveal
                text="Department E-Resources & Subject Notes"
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white"
                delay={0.12}
              />

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
                className="mt-3 text-sm sm:text-base text-blue-100/90 leading-relaxed font-normal max-w-xl"
              >
                Access verified university subject notes, syllabus, unit modules, and free engineering software licenses categorized by department.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3, ease: "easeOut" }}
              className="flex items-center gap-3 shrink-0"
            >
              <Link
                to="/announcements"
                className="group relative inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-white text-[#0B4A8F] font-bold text-xs sm:text-sm uppercase tracking-wider shadow-sm hover:bg-slate-50 transition-colors duration-150"
              >
                <span>LATEST NOTICES</span>
                <ArrowRight
                  size={15}
                  className="transition-transform duration-150 group-hover:translate-x-1 text-[#0B4A8F]"
                />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. MAIN CATEGORY SELECTOR (Notes vs Free Softwares vs All)
          ========================================================================= */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-7 space-y-6">
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => {
              setMainCategory("notes");
              setSelectedSemester("all");
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-150 cursor-pointer select-none ${
              mainCategory === "notes"
                ? "bg-[#0B4A8F] text-white shadow-sm"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            <BookOpen size={16} />
            <span>Academic Notes & Subjects</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                mainCategory === "notes"
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {allSubjects.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMainCategory("softwares");
              setSelectedSemester("all");
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-150 cursor-pointer select-none ${
              mainCategory === "softwares"
                ? "bg-[#0B4A8F] text-white shadow-sm"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            <Laptop size={16} />
            <span>Free Softwares & Tools</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                mainCategory === "softwares"
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {
                allResources.filter(
                  (r) =>
                    r.category === "Free Software" ||
                    r.tags.includes("Free Software")
                ).length
              }
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMainCategory("all");
              setSelectedSemester("all");
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-150 cursor-pointer select-none ${
              mainCategory === "all"
                ? "bg-[#0B4A8F] text-white shadow-sm"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            <Globe2 size={16} />
            <span>All E-Resources</span>
          </button>
        </div>

        {/* =========================================================================
            3. FILTER CONTROLS BAR (Department + Semester + Search)
            ========================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  mainCategory === "notes"
                    ? "Search subjects by name, code (e.g. 22CST31), or unit..."
                    : "Search tools, simulation softwares, or topics..."
                }
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B4A8F]/15 focus:border-[#0B4A8F] bg-slate-50/70 hover:bg-white transition-colors duration-150"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Department Dropdown Filter */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
              <div className="relative min-w-[200px] w-full sm:w-auto">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <GraduationCap size={15} />
                </div>
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 bg-slate-50/70 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B4A8F]/15 focus:border-[#0B4A8F] appearance-none cursor-pointer transition-colors duration-150"
                >
                  <option value="all">All Departments (7 Branches)</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.code} — {dept.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Filter size={13} />
                </div>
              </div>

              {/* Semester Filter (Active on Notes Mode) */}
              {mainCategory === "notes" && (
                <div className="relative min-w-[150px] w-full sm:w-auto">
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="w-full pl-4 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 bg-slate-50/70 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B4A8F]/15 focus:border-[#0B4A8F] appearance-none cursor-pointer transition-colors duration-150"
                  >
                    <option value="all">All Semesters</option>
                    <option value="Semester 3">Semester 3</option>
                    <option value="Semester 4">Semester 4</option>
                    <option value="Semester 5">Semester 5</option>
                    <option value="Semester 6">Semester 6</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Filter size={13} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Filter Status & Active Badges */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-500 flex items-center gap-1.5">
                <Layers size={14} className="text-[#0B4A8F]" />
                {mainCategory === "notes" ? (
                  <span>
                    Showing <strong className="text-slate-800">{filteredSubjects.length}</strong> academic subjects
                  </span>
                ) : (
                  <span>
                    Showing <strong className="text-slate-800">{filteredResources.length}</strong> engineering resources
                  </span>
                )}
              </span>

              {selectedDeptId !== "all" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-[#0B4A8F] font-bold border border-blue-200">
                  Dept: {DEPARTMENTS.find((d) => d.id === selectedDeptId)?.code}
                  <button
                    onClick={() => setSelectedDeptId("all")}
                    className="ml-1 hover:text-red-500 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              )}

              {selectedSemester !== "all" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-[#0B4A8F] font-bold border border-blue-200">
                  {selectedSemester}
                  <button
                    onClick={() => setSelectedSemester("all")}
                    className="ml-1 hover:text-red-500 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-[#0B4A8F] hover:text-[#083E7A] hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* =========================================================================
            4. CONTENT DISPLAY: SUBJECT NOTES VIEW
            ========================================================================= */}
        {mainCategory === "notes" && (
          <div>
            {filteredSubjects.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-xs">
                <h3 className="text-sm font-bold text-slate-800">
                  No subjects found matching your filters
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Try clearing your search query or selecting "All Departments".
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#0B4A8F] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#083E7A] transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {filteredSubjects.map((subj, index) => {
                  const isExpanded = expandedSubjectId === subj.id;
                  return (
                    <motion.article
                      key={subj.id}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.25,
                        delay: (index % 4) * 0.05,
                        ease: "easeOut",
                      }}
                      className="bg-white rounded-2xl border border-slate-200/90 hover:border-[#0B4A8F]/40 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-150 flex flex-col justify-between"
                    >
                      <div>
                        {/* Subject Header Badges */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#0B4A8F] text-white">
                              {subj.deptCode}
                            </span>
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-[#0B4A8F] border border-blue-100">
                              {subj.code}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              {subj.semester}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              {subj.credits}
                            </span>
                          </div>
                        </div>

                        {/* Subject Title */}
                        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug mb-3">
                          {subj.name}
                        </h3>

                        {/* Unit Syllabus Accordion */}
                        <div className="mb-4 bg-slate-50 rounded-xl border border-slate-200/70 p-3">
                          <button
                            type="button"
                            onClick={() => toggleSubjectExpand(subj.id)}
                            className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-[#0B4A8F] cursor-pointer select-none"
                          >
                            <span className="flex items-center gap-1.5">
                              <FileText size={13} className="text-[#0B4A8F]" />
                              <span>5 Course Units & Syllabus Outline</span>
                            </span>
                            {isExpanded ? (
                              <ChevronUp size={14} />
                            ) : (
                              <ChevronDown size={14} />
                            )}
                          </button>

                          {isExpanded && (
                            <div className="mt-3 pt-2.5 border-t border-slate-200/80 space-y-1.5 text-xs text-slate-600">
                              {subj.units.map((unit, uIdx) => (
                                <div
                                  key={uIdx}
                                  className="flex items-start gap-2 py-0.5"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#0B4A8F] mt-1.5 shrink-0" />
                                  <span className="leading-tight font-medium">
                                    {unit}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Tag Chips */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {subj.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons: Notes & Question Bank */}
                      <div className="pt-3.5 border-t border-slate-100 grid grid-cols-2 gap-2">
                        <a
                          href={subj.notesUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#0B4A8F] hover:bg-[#083E7A] text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-colors duration-150"
                        >
                          <Download size={13} />
                          <span>LECTURE NOTES</span>
                        </a>

                        <a
                          href={subj.questionBankUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0B4A8F] border border-blue-200 text-xs font-bold uppercase tracking-wider transition-colors duration-150"
                        >
                          <HelpCircle size={13} />
                          <span>QUESTION BANK</span>
                        </a>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            5. CONTENT DISPLAY: FREE SOFTWARES & ALL RESOURCES VIEW
            ========================================================================= */}
        {mainCategory !== "notes" && (
          <div>
            {filteredResources.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-xs">
                <h3 className="text-sm font-bold text-slate-800">
                  No resources matched your search
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Try adjusting your query or resetting filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#0B4A8F] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#083E7A] transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {filteredResources.map((resource, index) => (
                  <motion.article
                    key={`${resource.deptId}-${resource.name}`}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.25,
                      delay: (index % 6) * 0.05,
                      ease: "easeOut",
                    }}
                    className="bg-white rounded-2xl border border-slate-200/90 hover:border-[#0B4A8F]/30 p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 group"
                  >
                    <div>
                      {/* Department Tag & Status Badge */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0B4A8F] border border-blue-100">
                          {resource.deptCode} • {resource.type}
                        </span>

                        {resource.badge && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {resource.badge}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0B4A8F] transition-colors duration-150 leading-snug mb-1.5">
                        {resource.name}
                      </h3>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mb-4 line-clamp-3">
                        {resource.desc}
                      </p>
                    </div>

                    {/* Hashtags & Launch Button */}
                    <div className="pt-3.5 border-t border-slate-100 space-y-3.5">
                      <div className="flex flex-wrap gap-1.5">
                        {resource.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/btn w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0B4A8F] hover:bg-[#083E7A] text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-colors duration-150"
                      >
                        <span>LAUNCH E-RESOURCE</span>
                        <ExternalLink
                          size={13}
                          className="transition-transform duration-150 group-hover/btn:translate-x-0.5"
                        />
                      </a>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
