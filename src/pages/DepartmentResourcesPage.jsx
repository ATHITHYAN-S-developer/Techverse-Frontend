import React, { useState, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
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
  Download,
  BookMarked,
} from "lucide-react";
import { departmentService } from "../services/departmentService";
import { subjectService } from "../services/subjectService";
import { resourceService, RESOURCE_TYPES, resolveResourceUrl } from "../services/resourceService";
import { apiRequest } from "../services/api";
import { DEPARTMENTS_DATA } from "../data/departments";
import TextReveal from "../components/TextReveal";

const TYPE_LABEL = Object.fromEntries(RESOURCE_TYPES.map((t) => [t.value, t.label]));

export default function DepartmentResourcesPage() {
  const { departmentId: routeDeptId } = useParams();

  const [mainCategory, setMainCategory] = useState("notes");
  const [selectedDeptId, setSelectedDeptId] = useState(routeDeptId || "all");
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSubjectId, setExpandedSubjectId] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [resources, setResources] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [liveReady, setLiveReady] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Static dept list for the dropdown, immediately available
      setDepartments(
        Object.values(DEPARTMENTS_DATA).map((d) => ({ id: d.code.toLowerCase(), code: d.code, name: d.name }))
      );

      try {
        const [deptList, resList, subjList] = await Promise.allSettled([
          departmentService.getDepartments(),
          resourceService.getAllResources(),
          apiRequest("/subjects"),
        ]);

        if (cancelled) return;

        if (deptList.status === "fulfilled" && Array.isArray(deptList.value) && deptList.value.length > 0) {
          setDepartments(
            deptList.value.map((d) => ({ id: d._id || d.id, code: d.code, name: d.name }))
          );
        }

        if (resList.status === "fulfilled") {
          const list = Array.isArray(resList.value) ? resList.value : [];
          const deptIndex = {};
          setLiveReady(true);
          // Map departmentId to code when not populated
          list.forEach((r) => {
            if (!r.departmentId) {
              const match = Object.values(DEPARTMENTS_DATA).find(
                (d) => d.code.toLowerCase() === (r.departmentCode || r.department || "").toLowerCase()
              );
              if (match) deptIndex[r.departmentId] = match.code;
            }
          });
          setResources(list);
        }

        if (subjList.status === "fulfilled") {
          const list =
            subjList.value?.subjects || subjList.value?.data || (Array.isArray(subjList.value) ? subjList.value : []);
          setSubjects(Array.isArray(list) ? list : []);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deptCodeById = useMemo(() => {
    const map = {};
    Object.values(DEPARTMENTS_DATA).forEach((d) => {
      map[d.code.toLowerCase()] = d.code;
      map[d.id] = d.code;
    });
    departments.forEach((d) => {
      map[d.id] = d.code;
    });
    return map;
  }, [departments]);

  const effectiveDeptId = useMemo(() => {
    if (selectedDeptId !== "all") return selectedDeptId;
    if (routeDeptId) return routeDeptId.toLowerCase();
    return "all";
  }, [selectedDeptId, routeDeptId]);

  const resourceDeptId = (r) => {
    if (typeof r.departmentId === "object" && r.departmentId) return r.departmentId._id;
    return r.departmentId || r.departmentCode || r.department || "";
  };

  const resourceDeptCode = (r) => {
    if (typeof r.departmentId === "object" && r.departmentId) return r.departmentId.code || r.departmentId.name;
    return deptCodeById[resourceDeptId(r)] || r.departmentCode || r.department || "";
  };

  const isSoftware = (r) => {
    const t = (r.type || "").toLowerCase();
    return t.includes("software") || t.includes("simulator") || t.includes("license") || t.includes("video") || t.includes("website");
  };

  // ---- Soil filters ----
  const q = (searchQuery || "").toLowerCase().trim();

  // Resources view (softwares / all)
  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      if (mainCategory === "softwares" && !isSoftware(r)) return false;
      const matchDept =
        effectiveDeptId === "all" || resourceDeptId(r) === effectiveDeptId ||
        resourceDeptCode(r).toLowerCase() === effectiveDeptId.toLowerCase();
      if (!matchDept) return false;
      const txt = `${r.title || ""} ${r.description || ""} ${Array.isArray(r.tags) ? r.tags.join(" ") : ""}`.toLowerCase();
      return q === "" || txt.includes(q);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resources, mainCategory, effectiveDeptId, q]);

  // Notes view: subject cards derived from live resources (grouped by subject)
  const subjectGroups = useMemo(() => {
    const groups = new Map();
    resources.forEach((r) => {
      const sid = r.subjectId?._id || r.subjectId;
      if (!sid) return;
      if (!groups.has(sid)) {
        const subject = typeof r.subjectId === "object" && r.subjectId ? r.subjectId : null;
        groups.set(sid, {
          id: sid,
          name: subject?.name || r.subjectName || "Academic Subject",
          code: subject?.code || r.subjectCode || "SUBJ",
          resources: [],
        });
      }
      groups.get(sid).resources.push(r);
    });

    const enriched = [];
    subjects.forEach((s) => {
      const existing = groups.get(s._id);
      const group = existing || { id: s._id, name: s.name, code: s.code, resources: [] };
      group.departmentId = s.departmentId;
      group.semester = s.semester;
      group.credits = s.credits;
      group.units = s.units || [];
      enriched.push(group);
      groups.delete(s._id);
    });
    groups.forEach((g) => enriched.push(g));

    return enriched
      .map((g) => {
        const deptId = g.departmentId || g.resources[0]?.departmentId?._id || g.resources[0]?.departmentId;
        const deptCode = g.departmentId
          ? deptCodeById[g.departmentId] || g.resources[0]?.departmentId?.code || ""
          : resourceDeptCode(g.resources[0]) || "";
        return {
          ...g,
          deptId,
          deptCode,
          filteredResources: g.resources.filter((r) => {
            const matchDept =
              effectiveDeptId === "all" ||
              resourceDeptId(r) === effectiveDeptId ||
              deptCode.toLowerCase() === effectiveDeptId.toLowerCase();
            const semMatch =
              selectedSemester === "all" ||
              String(g.semester || "") === selectedSemester.replace("Semester ", "");
            const txt = `${r.title || ""} ${r.description || ""} ${Array.isArray(r.tags) ? r.tags.join(" ") : ""}`.toLowerCase();
            return matchDept && semMatch && (q === "" || txt.includes(q));
          }),
        };
      })
      .filter((g) => g.filteredResources.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resources, subjects, effectiveDeptId, selectedSemester, q]);

  const firstType = (group, type) => group.filteredResources.find((r) => (r.type || "") === type);

  const hasActiveFilters =
    effectiveDeptId !== "all" || selectedSemester !== "all" || searchQuery.trim() !== "";

  const handleResetFilters = () => {
    setSelectedDeptId(routeDeptId || "all");
    setSelectedSemester("all");
    setSearchQuery("");
  };

  const toggleSubjectExpand = (id) => {
    setExpandedSubjectId((prev) => (prev === id ? null : id));
  };

  const openResource = (r) => {
    const url = resolveResourceUrl(r.fileUrl || r.externalUrl || r.downloadUrl);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <p className="text-sm font-semibold text-slate-400">Loading department e-resources...</p>
      </div>
    );
  }

  const countOf = (fn) => filteredResources.filter(fn).length;

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
                Access verified university subject notes, lab manuals, question banks, and free
                engineering tools categorized by department. New material uploaded by your faculty
                appears here instantly.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3, ease: "easeOut" }}
              className="flex items-center gap-3 shrink-0"
            >
              {liveReady ? (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-400/15 border border-emerald-300/30 text-emerald-200 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE · {resources.length} resources online
                </span>
              ) : (
                <Link
                  to="/announcements"
                  className="group relative inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-white text-[#0B4A8F] font-bold text-xs sm:text-sm uppercase tracking-wider shadow-sm hover:bg-slate-50 transition-colors duration-150"
                >
                  <span>LATEST NOTICES</span>
                  <ArrowRight size={15} className="transition-transform duration-150 group-hover:translate-x-1 text-[#0B4A8F]" />
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. MAIN CATEGORY SELECTOR
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
                mainCategory === "notes" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {subjectGroups.length}
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
                mainCategory === "softwares" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {countOf((r) => isSoftware(r))}
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
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                mainCategory === "all" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {resources.length}
            </span>
          </button>
        </div>

        {/* =========================================================================
            3. FILTER CONTROLS BAR
            ========================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1 min-w-[240px]">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  mainCategory === "notes"
                    ? "Search subjects or study materials by name, code, or topic..."
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
                  <option value="all">All Departments ({departments.length} Branches)</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.code} — {dept.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Filter size={13} />
                </div>
              </div>

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

          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-500 flex items-center gap-1.5">
                <Layers size={14} className="text-[#0B4A8F]" />
                {mainCategory === "notes" ? (
                  <span>
                    Showing{" "}
                    <strong className="text-slate-800">
                      {subjectGroups.reduce((n, g) => n + g.filteredResources.length, 0)}
                    </strong>{" "}
                    study materials across{" "}
                    <strong className="text-slate-800">{subjectGroups.length}</strong> subjects
                  </span>
                ) : (
                  <span>
                    Showing <strong className="text-slate-800">{filteredResources.length}</strong> engineering resources
                  </span>
                )}
              </span>

              {effectiveDeptId !== "all" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-[#0B4A8F] font-bold border border-blue-200">
                  Dept: {departments.find((d) => d.id === effectiveDeptId)?.code || deptCodeById[effectiveDeptId]}
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
            {subjectGroups.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-xs">
                <h3 className="text-sm font-bold text-slate-800">
                  No study materials found matching your filters
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
                {subjectGroups.map((subj, index) => {
                  const isExpanded = expandedSubjectId === subj.id;
                  const notesRes = firstType(subj, "notes");
                  const qbRes = firstType(subj, "question_bank");
                  return (
                    <motion.article
                      key={subj.id}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.25, delay: (index % 4) * 0.05, ease: "easeOut" }}
                      className="bg-white rounded-2xl border border-slate-200/90 hover:border-[#0B4A8F]/40 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-150 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#0B4A8F] text-white">
                              {subj.deptCode || "Dept"}
                            </span>
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-[#0B4A8F] border border-blue-100">
                              {subj.code}
                            </span>
                          </div>

                          {(subj.semester || subj.credits) && (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                              {subj.semester && (
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                  Semester {subj.semester}
                                </span>
                              )}
                              {subj.credits && (
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                  {subj.credits} Credits
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug mb-3">
                          {subj.name}
                        </h3>

                        {subj.units.length > 0 ? (
                          <div className="mb-4 bg-slate-50 rounded-xl border border-slate-200/70 p-3">
                            <button
                              type="button"
                              onClick={() => toggleSubjectExpand(subj.id)}
                              className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-[#0B4A8F] cursor-pointer select-none"
                            >
                              <span className="flex items-center gap-1.5">
                                <FileText size={13} className="text-[#0B4A8F]" />
                                <span>{subj.units.length} Course Units & Syllabus Outline</span>
                              </span>
                              <span className="text-slate-400">{isExpanded ? "−" : "+"}</span>
                            </button>
                            {isExpanded && (
                              <div className="mt-3 pt-2.5 border-t border-slate-200/80 space-y-1.5 text-xs text-slate-600">
                                {subj.units.map((unit, uIdx) => (
                                  <div key={uIdx} className="flex items-start gap-2 py-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#0B4A8F] mt-1.5 shrink-0" />
                                    <span className="leading-tight font-medium">
                                      Unit {unit.unitNumber}: {unit.title}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="mb-4 bg-slate-50 rounded-xl border border-slate-200/70 p-3">
                            <button
                              type="button"
                              onClick={() => toggleSubjectExpand(subj.id)}
                              className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-[#0B4A8F] cursor-pointer select-none"
                            >
                              <span className="flex items-center gap-1.5">
                                <BookMarked size={13} className="text-[#0B4A8F]" />
                                <span>{subj.filteredResources.length} Uploaded Study Material(s)</span>
                              </span>
                              <span className="text-slate-400">{isExpanded ? "−" : "+"}</span>
                            </button>
                            {isExpanded && (
                              <div className="mt-3 pt-2.5 border-t border-slate-200/80 space-y-1.5 text-xs text-slate-600">
                                {subj.filteredResources.map((r) => (
                                  <button
                                    key={r._id || r.id}
                                    onClick={() => openResource(r)}
                                    className="w-full flex items-center justify-between gap-2 py-1.5 px-2 rounded-lg hover:bg-white transition-colors cursor-pointer text-left"
                                  >
                                    <span className="leading-tight font-medium text-slate-700 line-clamp-1">
                                      {r.title}
                                    </span>
                                    <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-[#0B4A8F]">
                                      <Download size={11} /> {r.downloadsCount || 0}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {subj.filteredResources.slice(0, 6).map((r) => (
                            <span
                              key={r._id || r.id}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                            >
                              {TYPE_LABEL[r.type] || r.type || "Notes"}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3.5 border-t border-slate-100 grid grid-cols-1 gap-2">
                        <button
                          onClick={() => openResource(notesRes || subj.filteredResources[0])}
                          disabled={!notesRes && subj.filteredResources.length === 0}
                          className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#0B4A8F] hover:bg-[#083E7A] text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-colors duration-150 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                        >
                          <Download size={13} />
                          <span>LECTURE NOTES</span>
                        </button>

                        {qbRes && (
                          <button
                            onClick={() => openResource(qbRes)}
                            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0B4A8F] border border-blue-200 text-xs font-bold uppercase tracking-wider transition-colors duration-150"
                          >
                            <HelpCircle size={13} />
                            <span>QUESTION BANK</span>
                          </button>
                        )}
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
                <h3 className="text-sm font-bold text-slate-800">No resources matched your search</h3>
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
                    key={resource._id || resource.id}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.25, delay: (index % 6) * 0.05, ease: "easeOut" }}
                    className="bg-white rounded-2xl border border-slate-200/90 hover:border-[#0B4A8F]/30 p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0B4A8F] border border-blue-100">
                          {resourceDeptCode(resource)} • {TYPE_LABEL[resource.type] || resource.type || "Notes"}
                        </span>
                        {resource.unit && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Unit {resource.unit}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0B4A8F] transition-colors duration-150 leading-snug mb-1.5 line-clamp-2">
                        {resource.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mb-4 line-clamp-3">
                        {resource.description || "Department study material."}
                      </p>
                    </div>

                    <div className="pt-3.5 border-t border-slate-100 space-y-3.5">
                      <div className="flex flex-wrap gap-1.5">
                        {Array.isArray(resource.tags) &&
                          resource.tags.slice(0, 5).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                            >
                              #{tag}
                            </span>
                          ))}
                      </div>

                      <button
                        onClick={() => openResource(resource)}
                        disabled={!resource.fileUrl && !resource.externalUrl}
                        className="group/btn w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0B4A8F] hover:bg-[#083E7A] text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-colors duration-150 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                      >
                        <span>
                          {resource.fileUrl || resource.externalUrl ? "OPEN / DOWNLOAD E-RESOURCE" : "NO FILE ATTACHED"}
                        </span>
                        <ExternalLink
                          size={13}
                          className="transition-transform duration-150 group-hover/btn:translate-x-0.5"
                        />
                      </button>
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                        <span>⬇ {resource.downloadsCount || 0} downloads</span>
                        {resource.fileSize && <span>{(resource.fileSize || "").toUpperCase()}</span>}
                      </div>
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