import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Sparkles,
  BookOpen,
  FileText,
  ClipboardList,
  Monitor,
  Download,
  Building2,
  GraduationCap,
  Layers,
  Search,
  SlidersHorizontal
} from "lucide-react";
import { departmentService } from "../services/departmentService";
import { resourceService, resolveResourceUrl } from "../services/resourceService";
import { apiRequest } from "../services/api";
import { DEPARTMENTS_DATA } from "../data/departments";
import { useAuth } from "../context/AuthContext";
import UnifiedFilterBar, { CATEGORIES } from "../components/library/UnifiedFilterBar";
import FeaturedResource from "../components/library/FeaturedResource";
import DepartmentExplorer from "../components/library/DepartmentExplorer";
import SubjectExplorer from "../components/library/SubjectExplorer";
import ResourceLibrary from "../components/library/ResourceLibrary";
import ResourceSkeleton from "../components/library/ResourceSkeleton";
import ErrorState from "../components/departments/ErrorState";
import { TextReveal, FadeInUp } from "../components/common/TextReveal";

export default function DepartmentResourcesPage() {
  const { departmentId: routeDeptId } = useParams();
  const { user } = useAuth();

  const [category, setCategory] = useState("all");
  const [selectedDeptId, setSelectedDeptId] = useState(routeDeptId || "all");
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [selectedSubjectId, setSelectedSubjectId] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [viewMode, setViewMode] = useState("list");

  const [departments, setDepartments] = useState([]);
  const [resources, setResources] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError(false);
      setDepartments(
        Object.values(DEPARTMENTS_DATA).map((d) => ({
          id: d.code.toLowerCase(),
          code: d.code,
          name: d.name,
          color: d.color || "#0284c7"
        }))
      );

      try {
        const [deptList, resList, subjList] = await Promise.allSettled([
          departmentService.getDepartments(),
          resourceService.getAllResources(),
          apiRequest("/subjects")
        ]);

        if (cancelled) return;

        if (deptList.status === "fulfilled" && Array.isArray(deptList.value) && deptList.value.length > 0) {
          setDepartments(
            deptList.value.map((d) => ({
              id: d._id || d.id,
              code: d.code,
              name: d.name,
              color: d.color || "#0284c7",
              icon: d.icon,
              stats: d.stats
            }))
          );
        }

        if (resList.status === "fulfilled") {
          const list = Array.isArray(resList.value) ? resList.value : [];
          setResources(list);
        } else {
          setLoadError(true);
        }

        if (subjList.status === "fulfilled") {
          const list =
            subjList.value?.subjects || subjList.value?.data || (Array.isArray(subjList.value) ? subjList.value : []);
          setSubjects(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [retryKey]);

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
    if (typeof r.departmentId === "object" && r.departmentId) return r.departmentId._id || r.departmentId.id;
    return r.departmentId || r.departmentCode || r.department || "";
  };

  const resourceDeptCode = (r) => {
    if (typeof r.departmentId === "object" && r.departmentId) return r.departmentId.code || r.departmentId.name;
    return deptCodeById[resourceDeptId(r)] || r.departmentCode || r.department || "";
  };

  const isSoftware = (r) => {
    const t = (r.type || "").toLowerCase();
    return (
      t.includes("software") ||
      t.includes("simulator") ||
      t.includes("license") ||
      t.includes("video") ||
      t.includes("website") ||
      t.includes("technology")
    );
  };

  const myDept = useMemo(() => {
    if (!user) return null;
    const uid =
      typeof user.departmentId === "object" && user.departmentId
        ? user.departmentId._id || user.departmentId.id
        : user.departmentId;
    const udc = user.departmentCode || "";
    if (!uid && !udc) return null;
    const dept = departments.find(
      (d) =>
        (uid && String(uid) === String(d.id)) ||
        (uid && String(uid).toLowerCase() === String(d.code).toLowerCase()) ||
        (udc && String(udc).toLowerCase() === String(d.code).toLowerCase())
    );
    return { id: uid || dept?.id || "all", code: udc || dept?.code || "", name: dept?.name };
  }, [user, departments]);

  const categoryMatches = (r) => {
    if (category === "all") return true;
    if (category === "downloads") return Boolean(r.fileUrl || r.downloadUrl || r.externalUrl);
    if (category === "subjects") return !isSoftware(r);
    if (category === "notes") return (r.type || "").toLowerCase() === "notes" || (r.type || "").toLowerCase() === "syllabus";
    if (category === "question_bank") return ["question_bank", "previous_paper"].includes((r.type || "").toLowerCase());
    if (category === "software") return isSoftware(r);
    return true;
  };

  const q = (searchQuery || "").toLowerCase().trim();

  const filteredResources = useMemo(() => {
    let list = resources.filter((r) => {
      if (!categoryMatches(r)) return false;
      const matchDept =
        effectiveDeptId === "all" ||
        String(resourceDeptId(r)) === String(effectiveDeptId) ||
        resourceDeptCode(r).toLowerCase() === effectiveDeptId.toLowerCase();
      if (!matchDept) return false;

      const semMatch =
        selectedSemester === "all" ||
        String(r.semester || "") === String(selectedSemester).replace("Semester ", "");
      if (!semMatch) return false;

      const typeMatch = selectedType === "all" || (r.type || "") === selectedType;
      if (!typeMatch) return false;

      const subjMatch =
        selectedSubjectId === "all" || (r.subjectId?._id || r.subjectId) === selectedSubjectId;
      if (!subjMatch) return false;

      const txt = `${r.title || ""} ${r.description || ""} ${r.departmentCode || ""} ${
        Array.isArray(r.tags) ? r.tags.join(" ") : ""
      }`.toLowerCase();
      return q === "" || txt.includes(q);
    });

    if (sortBy === "az") {
      list = [...list].sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else if (sortBy === "downloads") {
      list = [...list].sort((a, b) => (b.downloadsCount || 0) - (a.downloadsCount || 0));
    } else {
      list = [...list].sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    }
    return list;
  }, [resources, category, effectiveDeptId, selectedSemester, selectedType, selectedSubjectId, sortBy, q]);

  const featuredResource = useMemo(() => {
    if (!resources.length) return null;
    const candidates = resources
      .filter((r) => !isSoftware(r) && (r.fileUrl || r.externalUrl || r.downloadUrl))
      .sort((a, b) => (b.downloadsCount || 0) - (a.downloadsCount || 0));
    return candidates[0] || resources[0];
  }, [resources]);

  const deptStats = useMemo(() => {
    const map = new Map();
    departments.forEach((d) => map.set(d.id, { total: 0, notes: 0, question_bank: 0, software: 0 }));
    resources.forEach((r) => {
      const rid = resourceDeptId(r);
      const code = resourceDeptCode(r).toLowerCase();
      const key = departments.find(
        (d) =>
          String(d.id) === String(rid) ||
          String(d.code).toLowerCase() === code ||
          String(d.code).toLowerCase() === String(rid).toLowerCase()
      );
      if (!key) return;
      const s = map.get(key.id);
      if (!s) return;
      s.total += 1;
      if (isSoftware(r)) s.software += 1;
      else if (r.type === "question_bank" || r.type === "previous_paper") s.question_bank += 1;
      else s.notes += 1;
    });
    return map;
  }, [resources, departments]);

  const explorerDepartments = useMemo(
    () =>
      departments
        .map((d) => ({
          ...d,
          count: deptStats.get(d.id)?.total || (d.stats?.resources || 0),
          counts: deptStats.get(d.id)
        }))
        .sort((a, b) => b.count - a.count),
    [departments, deptStats]
  );

  const subjectRows = useMemo(() => {
    const rows = subjects
      .map((s) => {
        const count = resources.filter(
          (r) => (r.subjectId?._id || r.subjectId) === s._id || (r.subjectId?.code || r.subjectCode) === s.code
        ).length;
        const dept = departments.find(
          (d) =>
            String(d.id) === String(s.departmentId?._id || s.departmentId) ||
            String(d.code).toLowerCase() === String(s.departmentId?.code || s.departmentId || "").toLowerCase()
        );
        return {
          id: s._id,
          name: s.name,
          code: s.code,
          departmentName: dept?.name || s.departmentName || "",
          subjectCount: count,
          semester: s.semester
        };
      })
      .filter((row) => (effectiveDeptId === "all" ? true : row.departmentName.toLowerCase().includes(effectiveDeptId.toLowerCase()) || row.subjectCount > 0))
      .sort((a, b) => b.subjectCount - a.subjectCount);
    return rows.length ? rows : [];
  }, [subjects, resources, departments, effectiveDeptId]);

  const handleResetFilters = () => {
    setCategory("all");
    setSelectedDeptId(routeDeptId || "all");
    setSelectedSemester("all");
    setSelectedSubjectId("all");
    setSelectedType("all");
    setSearchQuery("");
    setSortBy("latest");
  };

  const openResource = (r) => {
    const url = resolveResourceUrl(r.fileUrl || r.externalUrl || r.downloadUrl);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleRetry = () => {
    setRetryKey((k) => k + 1);
  };

  const activeCategoryMeta = CATEGORIES.find((c) => c.key === category) || CATEGORIES[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. HERO HEADER SECTION WITH TEXT REVEALING ANIMATION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#021838] via-[#082952] to-[#0A3A6B] text-white pt-10 pb-12 px-5 sm:px-8 lg:px-12 border-b border-blue-950/40">
        {/* Subtle grid background */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <div className="pointer-events-none absolute -top-32 right-[-20px] h-96 w-96 rounded-2xl bg-blue-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/4 h-80 w-80 rounded-2xl bg-emerald-500/10 blur-3xl" />

        <div className="relative max-w-7xl mx-auto">
          {/* Breadcrumb Navigation */}
          <nav
            className="flex items-center gap-2 text-xs font-semibold text-blue-200/70 mb-6"
            aria-label="Breadcrumb"
          >
            <span className="hover:text-white cursor-pointer transition-colors">Home</span>
            <ChevronRight size={13} className="text-blue-400/50" />
            <span className="hover:text-white cursor-pointer transition-colors">Academic Hub</span>
            <ChevronRight size={13} className="text-blue-400/50" />
            <span className="text-blue-300 font-bold">E-Resources</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-2xl">
              {/* Badge */}
              <FadeInUp delay={0.05}>
                <div className="inline-flex items-center gap-2 rounded-lg bg-blue-500/20 border border-blue-400/30 px-3.5 py-1.5 mb-4 backdrop-blur-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-100">
                    Institutional Knowledge Repository
                  </span>
                </div>
              </FadeInUp>

              {/* Text Revealing Headline */}
              <div className="mt-1">
                <TextReveal
                  text="Velalar College Academic Resources"
                  className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight"
                  delay={0.1}
                />
              </div>

              {/* Subtitle with fade-in */}
              <FadeInUp delay={0.25}>
                <p className="mt-3 text-sm sm:text-base text-blue-100/80 leading-relaxed max-w-xl">
                  Curated unit lecture notes, Anna University syllabus outlines, question banks, and licensed software across all engineering branches.
                </p>
              </FadeInUp>
            </div>

            {/* Quick Metrics Statistics */}
            <FadeInUp delay={0.3} className="flex items-center gap-3 flex-wrap">
              <div className="flex flex-col px-4.5 py-3 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md">
                <span className="text-2xl font-black text-white">{resources.length}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
                  Total Items
                </span>
              </div>
              <div className="flex flex-col px-4.5 py-3 rounded-xl bg-emerald-500/15 border border-emerald-400/30 backdrop-blur-md">
                <span className="text-2xl font-black text-emerald-300">{departments.length}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                  Branches
                </span>
              </div>
              <div className="flex flex-col px-4.5 py-3 rounded-xl bg-purple-500/15 border border-purple-400/30 backdrop-blur-md">
                <span className="text-2xl font-black text-purple-200">{subjects.length}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-200">
                  Courses
                </span>
              </div>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Department Quick Filter Grid */}
        <DepartmentExplorer
          departments={explorerDepartments}
          selectedDeptId={effectiveDeptId}
          onSelect={(id) => {
            setSelectedDeptId(id);
          }}
        />

        {/* Unified Single Filter Dropdown Toolbar */}
        <UnifiedFilterBar
          category={category}
          onCategoryChange={(cat) => setCategory(cat)}
          selectedDeptId={selectedDeptId}
          onDeptChange={(d) => setSelectedDeptId(d)}
          departments={departments}
          selectedSemester={selectedSemester}
          onSemesterChange={(sem) => setSelectedSemester(sem)}
          searchQuery={searchQuery}
          onSearchChange={(q) => setSearchQuery(q)}
          sortBy={sortBy}
          onSortChange={(s) => setSortBy(s)}
          viewMode={viewMode}
          onViewModeChange={(m) => setViewMode(m)}
          myDept={myDept}
          onResetFilters={handleResetFilters}
          totalCount={filteredResources.length}
        />

        {/* Dynamic Content Display */}
        {loading ? (
          <ResourceSkeleton rows={5} />
        ) : loadError ? (
          <ErrorState onRetry={handleRetry} />
        ) : (
          <div>
            {/* When category is 'all' and no active search query: Show Featured Resource & Popular Subjects */}
            {category === "all" && !q && effectiveDeptId === "all" && selectedSemester === "all" && (
              <>
                <FeaturedResource
                  resource={featuredResource}
                  deptCode={featuredResource ? resourceDeptCode(featuredResource) : ""}
                  onOpen={openResource}
                />

                {subjectRows.length > 0 && (
                  <SubjectExplorer
                    title="Popular Subjects"
                    subtitle="Most-accessed semester courses across departments"
                    subjects={subjectRows.slice(0, 6)}
                    onSelect={(subject) => {
                      setSelectedSubjectId(subject.id);
                      setCategory("notes");
                    }}
                  />
                )}
              </>
            )}

            {/* When category is 'subjects': Render Subject Explorer */}
            {category === "subjects" && (
              <SubjectExplorer
                title="Curriculum Subjects & Syllabi"
                subtitle="Organized courses with lecture notes and semester units"
                subjects={subjectRows}
                onSelect={(subject) => {
                  setSelectedSubjectId(subject.id);
                  setCategory("notes");
                }}
              />
            )}

            {/* Render Filtered Resource Feed for All, Notes, Question Bank, Software, Downloads, or whenever searched/filtered */}
            {(category !== "subjects" || q !== "" || effectiveDeptId !== "all" || selectedSemester !== "all") && (
              <ResourceLibrary
                title={
                  category === "all"
                    ? "All Academic Resources"
                    : activeCategoryMeta.label
                }
                subtitle={
                  effectiveDeptId !== "all"
                    ? `Showing resources for ${deptCodeById[effectiveDeptId] || effectiveDeptId}`
                    : activeCategoryMeta.description
                }
                count={filteredResources.length}
                viewMode={viewMode}
                items={filteredResources}
                onOpen={openResource}
                onReset={handleResetFilters}
                emptyMessage={`No ${activeCategoryMeta.label.toLowerCase()} found matching the current filters.`}
                loading={loading}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}