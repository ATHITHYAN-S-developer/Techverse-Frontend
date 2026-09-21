import React from "react";
import { motion } from "framer-motion";
import { Search, GraduationCap, Filter, X, Layers, ChevronDown } from "lucide-react";

const SEMESTERS = [3, 4, 5, 6];

export default function ResourceFilters({
  mainCategory,
  searchQuery,
  onSearchChange,
  selectedDeptId,
  onDeptChange,
  departments,
  selectedSemester,
  onSemesterChange,
  filteredResults,
  showingLabel,
  activeChips,
  onRemoveChip,
  onResetFilters,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-white rounded-[20px] border border-slate-200 p-5 sm:p-6 shadow-sm"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <label htmlFor="resource-search" className="sr-only">
            Search resources, subjects or topics
          </label>
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="resource-search"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={
              mainCategory === "notes"
                ? "Search resources, subjects, topics..."
                : "Search resources, subjects, topics..."
            }
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B4A8F]/15 focus:border-[#0B4A8F] bg-slate-50/70 hover:bg-white transition-colors duration-150"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B4A8F]/50"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
          {/* Department */}
          <div className="relative min-w-[200px] w-full sm:w-auto">
            <label htmlFor="dept-filter" className="sr-only">
              Filter by department
            </label>
            <GraduationCap size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              id="dept-filter"
              value={selectedDeptId}
              onChange={(e) => onDeptChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-50/70 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B4A8F]/15 focus:border-[#0B4A8F] appearance-none cursor-pointer transition-colors duration-150"
            >
              <option value="all">All Departments ({departments.length})</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.code} — {dept.name}
                </option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Semester (notes view only) */}
          {mainCategory === "notes" && (
            <div className="relative min-w-[150px] w-full sm:w-auto">
              <label htmlFor="sem-filter" className="sr-only">
                Filter by semester
              </label>
              <select
                id="sem-filter"
                value={selectedSemester}
                onChange={(e) => onSemesterChange(e.target.value)}
                className="w-full pl-4 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-50/70 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B4A8F]/15 focus:border-[#0B4A8F] appearance-none cursor-pointer transition-colors duration-150"
              >
                <option value="all">All Semesters</option>
                {SEMESTERS.map((s) => (
                  <option key={s} value={`Semester ${s}`}>
                    Semester {s}
                  </option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Result summary */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-slate-500 flex items-center gap-1.5">
            <Layers size={14} className="text-[#0B4A8F]" />
            {showingLabel}
          </span>

          {/* Active filter chips */}
          {activeChips.map((chip) => (
            <span
              key={chip.type}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EFF6FF] text-[#0B4A8F] font-semibold border border-blue-100"
            >
              {chip.label}
              <button
                onClick={() => onRemoveChip(chip.type)}
                aria-label={`Remove ${chip.label} filter`}
                className="ml-0.5 rounded p-0.5 text-[#0B4A8F] hover:text-[#084282] hover:bg-blue-100 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B4A8F]/50"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>

        {/* Clear all */}
        {activeChips.length > 0 && (
          <button
            onClick={onResetFilters}
            className="text-xs font-semibold text-[#0B4A8F] hover:text-[#084282] hover:underline underline-offset-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B4A8F]/50 rounded"
          >
            Clear all filters
          </button>
        )}
      </div>
    </motion.div>
  );
}