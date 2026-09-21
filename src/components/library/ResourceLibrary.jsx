import React from "react";
import { List, LayoutGrid, SlidersHorizontal, ArrowRight, Download } from "lucide-react";
import ResourceListItem from "./ResourceListItem";
import ResourceSkeleton from "./ResourceSkeleton";
import EmptyState from "../departments/EmptyState";
import { fileBadge } from "./fileTypeInfo";

const SORTS = [
  { key: "latest", label: "Latest" },
  { key: "az", label: "A – Z" },
  { key: "downloads", label: "Most Downloaded" },
];

function GridCard({ resource, onOpen }) {
  const badge = fileBadge(resource);
  return (
    <button
      onClick={() => onOpen(resource)}
      className="text-left rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-[#0B4A8F] hover:shadow-md hover:shadow-blue-900/5 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className="h-10 w-10 rounded-xl flex items-center justify-center text-[10px] font-extrabold tracking-wide shrink-0"
          style={{ backgroundColor: badge.bg, color: badge.color }}
        >
          {badge.label}
        </span>
        <ArrowRight
          size={15}
          className="text-slate-300 group-hover:text-[#0B4A8F] group-hover:translate-x-0.5 transition-all duration-150"
        />
      </div>
      <p className="mt-3 text-[13px] font-bold text-[#0F172A] leading-snug line-clamp-2 group-hover:text-[#0B4A8F] transition-colors">
        {resource.title}
      </p>
      {resource.description && (
        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{resource.description}</p>
      )}
      <div className="flex items-center gap-2 mt-3">
        {typeof resource.downloadsCount === "number" && resource.downloadsCount > 0 ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400">
            <Download size={11} />
            {resource.downloadsCount}
          </span>
        ) : null}
        {resource.semester ? (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
            Semester {resource.semester}
          </span>
        ) : null}
      </div>
    </button>
  );
}

export default function ResourceLibrary({
  title = "Resource Library",
  subtitle = "Everything in one place",
  count,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  items,
  onOpen,
  onReset,
  emptyMessage,
  loading,
  onOpenFilters,
}) {
  return (
    <section className="mt-8 px-5 sm:px-0 pb-4" aria-label={title}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-[#0F172A] tracking-tight">
            {title}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {subtitle}
            {typeof count === "number" && (
              <span className="ml-1 text-slate-400">• {count} item{count === 1 ? "" : "s"}</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenFilters}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-slate-600 hover:border-[#0B4A8F] hover:text-[#0B4A8F] transition-colors"
          >
            <SlidersHorizontal size={14} />
            Filters
          </button>

          <div className="relative inline-flex items-center">
            <label htmlFor="resource-sort" className="sr-only">
              Sort resources
            </label>
            <select
              id="resource-sort"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-9 py-2 text-[12px] font-semibold text-slate-600 hover:border-[#0B4A8F] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0B4A8F] cursor-pointer"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
            <svg
              className="absolute right-3 w-3.5 h-3.5 text-slate-400 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <div className="hidden sm:inline-flex rounded-xl border border-slate-200 bg-white p-1">
            <button
              onClick={() => onViewModeChange("list")}
              aria-label="List view"
              aria-pressed={viewMode === "list"}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "list" ? "bg-[#EFF6FF] text-[#0B4A8F]" : "text-slate-400 hover:text-[#0B4A8F]"
              }`}
            >
              <List size={15} />
            </button>
            <button
              onClick={() => onViewModeChange("grid")}
              aria-label="Grid view"
              aria-pressed={viewMode === "grid"}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "grid" ? "bg-[#EFF6FF] text-[#0B4A8F]" : "text-slate-400 hover:text-[#0B4A8F]"
              }`}
            >
              <LayoutGrid size={15} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <ResourceSkeleton rows={4} />
      ) : items.length === 0 ? (
        <EmptyState message={emptyMessage} onReset={onReset} />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {items.map((r) => (
            <GridCard key={r.id || r._id} resource={r} onOpen={onOpen} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {items.map((r, i) => (
            <ResourceListItem
              key={r.id || r._id}
              resource={r}
              deptCode={r.departmentCode}
              isFeatured={i === 0 && sortBy === "downloads"}
              onOpen={onOpen}
            />
          ))}
        </div>
      )}
    </section>
  );
}