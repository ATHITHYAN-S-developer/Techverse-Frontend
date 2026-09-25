import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Menu, Filter } from "lucide-react";
import { departmentService } from "../services/departmentService";
import { resourceService, resolveResourceUrl } from "../services/resourceService";
import { apiRequest } from "../services/api";
import { DEPARTMENTS_DATA } from "../data/departments";
import { useAuth } from "../context/AuthContext";
import ResourceSidebar from "../components/library/ResourceSidebar";
import ResourceHeader from "../components/library/ResourceHeader";
import ResourceSearch from "../components/library/ResourceSearch";
import QuickFilters from "../components/library/QuickFilters";
import FeaturedResource from "../components/library/FeaturedResource";
import DepartmentExplorer from "../components/library/DepartmentExplorer";
import SubjectExplorer from "../components/library/SubjectExplorer";
import ResourceLibrary from "../components/library/ResourceLibrary";
import RecentResources from "../components/library/RecentResources";
import FilterDrawer from "../components/library/FilterDrawer";
import ResourceSkeleton from "../components/library/ResourceSkeleton";
import ErrorState from "../components/departments/ErrorState";


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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [departments, setDepartments] = useState([]);
  const [resources, setResources] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const searchRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError(false);
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
          setDepartments(deptList.value.map((d) => ({ id: d._id || d.id, code: d.code, name: d.name })));
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
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryKey]);

  useEffect(() => {
    function onKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
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

  const myDept = useMemo(() => {
    if (!user) return null;
    const uid = typeof user.departmentId === "object" && user.departmentId ? user.departmentId._id || user.departmentId.id : user.departmentId;
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
    if (category === "all" || category === "downloads") return true;
    if (category === "subjects") return !isSoftware(r);
    if (category === "notes") return (r.type || "") === "notes";
    if (category === "question_bank") return ["question_bank", "previous_paper"].includes(r.type || "");
    if (category === "software") return isSoftware(r);
    return true;
  };

  const q = (searchQuery || "").toLowerCase().trim();

  const libraryResources = useMemo(() => {
    let list = resources.filter((r) => {
      if (!categoryMatches(r)) return false;
      const matchDept =
        effectiveDeptId === "all" ||
        resourceDeptId(r) === effectiveDeptId ||
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
      const txt = `${r.title || ""} ${r.description || ""} ${Array.isArray(r.tags) ? r.tags.join(" ") : ""}`.toLowerCase();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resources, category, effectiveDeptId, selectedSemester, selectedType, selectedSubjectId, sortBy, q]);

  const featuredResource = useMemo(() => {
    if (!resources.length) return null;
    const candidates = resources
      .filter((r) => !isSoftware(r) && (r.fileUrl || r.externalUrl || r.url))
      .sort((a, b) => (b.downloadsCount || 0) - (a.downloadsCount || 0));
    return candidates[0] || resources[0];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resources]);

  const deptStats = useMemo(() => {
    const map = new Map();
    departments.forEach((d) => map.set(d.id, { total: 0, notes: 0, question_bank: 0, software: 0 }));
    resources.forEach((r) => {
      const rid = resourceDeptId(r);
      const code = resourceDeptCode(r).toLowerCase();
      const key = departments.find(
        (d) => String(d.id) === String(rid) || String(d.code).toLowerCase() === code || String(d.code).toLowerCase() === String(rid).toLowerCase()
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resources, departments]);

  const explorerDepartments = useMemo(
    () =>
      departments
        .map((d) => ({ ...d, count: deptStats.get(d.id)?.total || 0, counts: deptStats.get(d.id) }))
        .sort((a, b) => b.count - a.count)
        .filter((d) => d.count > 0),
    [departments, deptStats]
  );

  const subjectRows = useMemo(() => {
    const rows = subjects
      .map((s) => {
        const count = resources.filter((r) => (r.subjectId?._id || r.subjectId) === s._id).length;
        const dept = departments.find(
          (d) =>
            String(d.id) === String(s.departmentId) ||
            String(d.code).toLowerCase() === String(s.departmentId || "").toLowerCase()
        );
        return {
          id: s._id,
          name: s.name,
          code: s.code,
          departmentName: dept?.name || s.departmentName || "",
          subjectCount: count,
          semester: s.semester,
        };
      })
      .filter((row) => row.subjectCount > 0)
      .sort((a, b) => b.subjectCount - a.subjectCount);
    return rows.length ? rows : [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjects, resources, departments]);

  const handleResetFilters = () => {
    setSelectedDeptId(routeDeptId || "all");
    setSelectedSemester("all");
    setSelectedSubjectId("all");
    setSelectedType("all");
    setSearchQuery("");
    setSortBy("latest");
  };

  const handleNav = (key) => {
    setCategory(key);
    setSidebarOpen(false);
  };

  const handleDeptChange = (id) => {
    setSelectedDeptId(id);
    setSidebarOpen(false);
  };

  const openResource = (r) => {
    const url = resolveResourceUrl(r.fileUrl || r.externalUrl || r.downloadUrl);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleRetry = () => {
    setRetryKey((k) => k + 1);
  };

  const activeChips = [];
  if (effectiveDeptId !== "all") {
    const dept = departments.find((d) => d.id === effectiveDeptId);
    activeChips.push({ type: "dept", label: dept?.code || dept?.name || deptCodeById[effectiveDeptId] });
  }
  if (selectedSemester !== "all") activeChips.push({ type: "semester", label: `Semester ${selectedSemester}` });
  if (selectedSubjectId !== "all") {
    const sub = subjects.find((s) => s._id === selectedSubjectId);
    if (sub) activeChips.push({ type: "subject", label: sub.name });
  }
  if (selectedType !== "all") activeChips.push({ type: "type", label: selectedType.replace(/_/g, " ") });
  if (q) activeChips.push({ type: "search", label: `"${q}"` });

  const removeChip = (type) => {
    if (type === "dept") setSelectedDeptId(routeDeptId || "all");
    if (type === "semester") setSelectedSemester("all");
    if (type === "subject") setSelectedSubjectId("all");
    if (type === "type") setSelectedType("all");
    if (type === "search") setSearchQuery("");
  };

  const isOverview = category === "all";
  const isSubjectsView = category === "subjects";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] px-5 py-10 sm:px-8 max-w-[1440px] mx-auto">
        <div className="mb-6 space-y-2">
          <div className="h-3 w-40 rounded-md bg-slate-200 animate-pulse" />
          <div className="h-7 w-72 max-w-full rounded-lg bg-slate-200 animate-pulse" />
          <div className="h-4 w-96 max-w-full rounded-md bg-slate-200 animate-pulse" />
        </div>
        <ResourceSkeleton rows={5} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] scroll-smooth selection:bg-[#0B4A8F] selection:text-white">
      <div className="lg:flex lg:items-start lg:max-w-[1440px] lg:mx-auto lg:px-6 lg:gap-8">
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              key="sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-[#0F172A]/40 backdrop-blur-[2px] lg:hidden"
              aria-hidden="true"
            />
          )}
        </AnimatePresence>

        <ResourceSidebar
          activeKey={category}
          onNav={handleNav}
          departments={departments}
          selectedDeptId={selectedDeptId}
          onDeptChange={handleDeptChange}
          resourceCount={resources.length}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 min-w-0 w-full lg:pb-12">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden mt-4 ml-5 sm:ml-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[12px] font-bold text-[#0B4A8F] shadow-sm hover:border-[#0B4A8F] transition-colors"
          >
            <Menu size={15} />
            E-Resources
          </button>

          <ResourceHeader departments={departments.length} resources={resources.length} />
          <ResourceSearch query={searchQuery} onChange={setSearchQuery} inputRef={searchRef} />
          <QuickFilters
            activeKey={category}
            onSelect={handleNav}
            userDeptName={myDept?.name || myDept?.code}
            myDeptActive={Boolean(myDept) && effectiveDeptId === myDept?.id}
            onMyDeptToggle={() => {
              if (!myDept) return;
              setSelectedDeptId(effectiveDeptId === myDept.id ? "all" : myDept.id);
              if (effectiveDeptId !== myDept.id) setCategory("all");
            }}
          />

          {activeChips.length > 0 && (
            <div className="mt-4 px-5 sm:px-0 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                <Filter size={12} />
                Active filters:
              </span>
              {activeChips.map((chip) => (
                <button
                  key={chip.type}
                  onClick={() => removeChip(chip.type)}
                  aria-label={`Remove ${chip.label} filter`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#EFF6FF] border border-blue-100 px-3 py-1.5 text-[11px] font-bold text-[#0B4A8F] hover:bg-blue-100 transition-colors"
                >
                  {chip.label}
                  <X size={11} />
                </button>
              ))}
              <button
                onClick={handleResetFilters}
                className="text-[11px] font-semibold text-slate-500 underline underline-offset-2 hover:text-[#EF4444] transition-colors"
              >
                Clear all
              </button>
            </div>
          )}

          {loadError ? (
            <div className="mt-6 px-5 sm:px-0">
              <ErrorState onRetry={handleRetry} />
            </div>
          ) : (
            <>
              {isOverview && (
                <>
                  <FeaturedResource
                    resource={featuredResource}
                    deptCode={featuredResource ? resourceDeptCode(featuredResource) : ""}
                    onOpen={openResource}
                  />
                  <DepartmentExplorer
                    departments={explorerDepartments}
                    onSelect={(id) => {
                      setSelectedDeptId(id);
                      setCategory("all");
                      setSidebarOpen(false);
                    }}
                  />
                  {subjectRows.length > 0 && (
                    <SubjectExplorer
                      title="Popular Subjects"
                      subtitle="Most-studied courses across departments"
                      subjects={subjectRows}
                      onSelect={(subject) => {
                        setSelectedSubjectId(subject.id);
                        setCategory("notes");
                      }}
                    />
                  )}
                </>
              )}

              {isSubjectsView && subjectRows.length > 0 && (
                <SubjectExplorer
                  title="Subjects"
                  subtitle="Lecture notes and question banks organised by course"
                  subjects={subjectRows}
                  onSelect={(subject) => {
                    setSelectedSubjectId(subject.id);
                    setCategory("notes");
                  }}
                />
              )}

              <ResourceLibrary
                title={
                  category === "notes"
                    ? "Lecture Notes"
                    : category === "question_bank"
                    ? "Question Banks"
                    : category === "software"
                    ? "Free Software"
                    : category === "downloads"
                    ? "Downloads"
                    : "Resource Library"
                }
                subtitle={
                  category === "subjects"
                    ? "All academic materials"
                    : category === "downloads"
                    ? "Most downloaded resources first"
                    : "Everything in one place"
                }
                count={libraryResources.length}
                sortBy={sortBy}
                onSortChange={setSortBy}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                items={libraryResources}
                onOpen={openResource}
                onReset={handleResetFilters}
                emptyMessage="We couldn't find any resources matching your current filters."
                loading={false}
                onOpenFilters={() => setDrawerOpen(true)}
              />

              {isOverview && (
                <RecentResources items={resources} onOpen={openResource} />
              )}
            </>
          )}
        </main>
      </div>

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        departments={departments}
        subjects={subjects}
        filters={{
          dept: selectedDeptId === "all" ? "all" : effectiveDeptId,
          semester: selectedSemester,
          type: selectedType,
          subjectId: selectedSubjectId,
        }}
        onApply={(f) => {
          setSelectedDeptId(f.dept);
          setSelectedSemester(f.semester);
          setSelectedType(f.type);
          setSelectedSubjectId(f.subjectId);
          setDrawerOpen(false);
        }}
      />
    </div>
  );
}