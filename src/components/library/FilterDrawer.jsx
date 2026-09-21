import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw } from "lucide-react";
import { RESOURCE_TYPES } from "../../services/resourceService";

const SEMESTERS = ["1", "2", "3", "4", "5", "6", "7", "8"];

export default function FilterDrawer({
  open,
  onClose,
  departments,
  subjects,
  filters,
  onApply,
}) {
  const [dept, setDept] = useState(filters.dept || "all");
  const [semester, setSemester] = useState(filters.semester || "all");
  const [type, setType] = useState(filters.type || "all");
  const [subjectId, setSubjectId] = useState(filters.subjectId || "all");

  useEffect(() => {
    if (open) {
      setDept(filters.dept || "all");
      setSemester(filters.semester || "all");
      setType(filters.type || "all");
      setSubjectId(filters.subjectId || "all");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const reset = () => {
    setDept("all");
    setSemester("all");
    setType("all");
    setSubjectId("all");
  };

  const optionClass = "cursor-pointer";

  return (
    <AnimatePresence>
      <motion.div
        key="drawer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[60] bg-[#0F172A]/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.div
        key="panel"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 320 }}
        className="fixed inset-y-0 right-0 z-[61] w-full max-w-[430px] bg-white shadow-2xl overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Filter resources"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-white/95 backdrop-blur border-b border-slate-100">
          <h3 className="text-sm font-extrabold text-[#0F172A]">Filter Resources</h3>
          <button
            onClick={onClose}
            aria-label="Close filters"
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#0B4A8F] hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-5 space-y-6">
          <FilterGroup label="Department">
            <div className="flex flex-wrap gap-2">
              <Pill active={dept === "all"} onClick={() => setDept("all")}>
                All
              </Pill>
              {departments.map((d) => (
                <Pill key={d.id} active={dept === d.id} onClick={() => setDept(d.id)}>
                  {d.name}
                </Pill>
              ))}
            </div>
          </FilterGroup>

          <FilterGroup label="Semester">
            <div className="flex flex-wrap gap-2">
              <Pill active={semester === "all"} onClick={() => setSemester("all")}>
                All
              </Pill>
              {SEMESTERS.map((s) => (
                <Pill key={s} active={semester === s} onClick={() => setSemester(s)}>
                  Semester {s}
                </Pill>
              ))}
            </div>
          </FilterGroup>

          <FilterGroup label="Resource Type">
            <div className="flex flex-wrap gap-2">
              <Pill active={type === "all"} onClick={() => setType("all")}>
                All Types
              </Pill>
              {RESOURCE_TYPES.map((t) => (
                <Pill key={t.value} active={type === t.value} onClick={() => setType(t.value)}>
                  {t.label}
                </Pill>
              ))}
            </div>
          </FilterGroup>

          <FilterGroup label="Subject">
            <div className="flex flex-wrap gap-2">
              <Pill active={subjectId === "all"} onClick={() => setSubjectId("all")}>
                All Subjects
              </Pill>
              {subjects.slice(0, 24).map((s) => (
                <Pill
                  key={s.id || s._id}
                  active={subjectId === (s.id || s._id)}
                  onClick={() => setSubjectId(s.id || s._id)}
                >
                  {s.name}
                </Pill>
              ))}
            </div>
          </FilterGroup>
        </div>

        <div className="sticky bottom-0 flex items-center gap-3 px-5 py-4 bg-white/95 backdrop-blur border-t border-slate-100">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-[13px] font-bold text-slate-600 hover:border-[#EF4444] hover:text-[#EF4444] transition-colors"
          >
            <RotateCcw size={14} />
            Reset
          </button>
          <button
            onClick={() => onApply({ dept, semester, type, subjectId })}
            className={optionClass + " flex-1 rounded-xl bg-[#0B4A8F] hover:bg-[#084282] px-4 py-3 text-[13px] font-bold text-white shadow-md shadow-blue-900/10 transition-colors"}
          >
            Apply Filters
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function FilterGroup({ label, children }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-2.5">
        {label}
      </p>
      {children}
    </div>
  );
}

function Pill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3.5 py-2 text-[12px] font-semibold transition-colors duration-150 border ${
        active
          ? "bg-[#0B4A8F] text-white border-[#0B4A8F]"
          : "bg-white text-slate-600 border-slate-200 hover:border-[#0B4A8F] hover:text-[#0B4A8F]"
      }`}
    >
      {children}
    </button>
  );
}