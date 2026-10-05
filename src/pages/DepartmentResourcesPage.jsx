import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { departmentService } from "../services/departmentService";
import { resourceService, resolveResourceUrl } from "../services/resourceService";
import { DEPARTMENTS_DATA } from "../data/departments";
import { useAuth } from "../context/AuthContext";
import UnifiedFilterBar, { CATEGORIES } from "../components/library/UnifiedFilterBar";
import ResourceLibrary from "../components/library/ResourceLibrary";
import ResourceSkeleton from "../components/library/ResourceSkeleton";
import ErrorState from "../components/departments/ErrorState";
import { TextReveal, FadeInUp } from "../components/common/TextReveal";

export default function DepartmentResourcesPage() {
  const { departmentId: routeDeptId } = useParams();
  const { user } = useAuth();

  const [category, setCategory] = useState("all");
  const [selectedDeptId, setSelectedDeptId] = useState(routeDeptId || "all");
  const [selectedSubjectId, setSelectedSubjectId] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [viewMode, setViewMode] = useState("grid");

  const [departments, setDepartments] = useState([]);
  const [resources, setResources] = useState([]);
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
        const [deptList, resList] = await Promise.allSettled([
          departmentService.getDepartments(),
          resourceService.getAllResources(),
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
  }, [resources, category, effectiveDeptId, selectedType, selectedSubjectId, sortBy, q]);

  const handleResetFilters = () => {
    setCategory("all");
    setSelectedDeptId(routeDeptId || "all");
    setSelectedSubjectId("all");
    setSelectedType("all");
    setSearchQuery("");
    setSortBy("latest");
  };

  const openResource = (r) => {
    const rawUrl = r.fileUrl || r.downloadUrl || r.externalUrl;
    if (!rawUrl) return;
    const url = resolveResourceUrl(rawUrl);

    if (r._id || r.id) {
      resourceService.trackDownload(r._id || r.id).catch(() => {});
    }

    const type = (r.type || "").toLowerCase();
    const urlLower = url.toLowerCase();
    const titleLower = (r.title || "").toLowerCase();

    const isSw =
      type === "software" ||
      /\.(exe|msi|dmg|pkg|deb|rpm|zip|rar|7z|tar|gz|apk|whl)$/i.test(urlLower) ||
      titleLower.includes("software") ||
      titleLower.includes("blender") ||
      titleLower.includes("python");

    if (isSw) {
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", r.originalName || r.title || "download");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
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

            {/* Quick Metrics Statistics (Only Total Items & Branches) */}
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
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Unified Single Filter Dropdown Toolbar */}
        <UnifiedFilterBar
          category={category}
          onCategoryChange={(cat) => setCategory(cat)}
          selectedDeptId={selectedDeptId}
          onDeptChange={(d) => setSelectedDeptId(d)}
          departments={departments}
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
          <ResourceLibrary
            title={
              category === "all"
                ? "Academic Resources"
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
      </main>
    </div>
  );
}