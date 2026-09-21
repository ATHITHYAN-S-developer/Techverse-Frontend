import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, BookMarked, ChevronDown, Download } from "lucide-react";

export default function SyllabusAccordion({ subject, isExpanded, onToggle, onOpenResource }) {
  const hasUnits = subject.units && subject.units.length > 0;

  return (
    <div className="mb-4 bg-slate-50 rounded-xl border border-slate-200/70 p-3.5">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={`syllabus-${subject.id}`}
        className="w-full flex items-center justify-between gap-2 text-xs font-bold text-slate-700 hover:text-[#0B4A8F] cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B4A8F]/50 rounded-lg"
      >
        <span className="flex items-center gap-1.5">
          {hasUnits ? (
            <FileText size={13} className="text-[#0B4A8F]" />
          ) : (
            <BookMarked size={13} className="text-[#0B4A8F]" />
          )}
          <span>
            {hasUnits
              ? `${subject.units.length} Course Units & Syllabus Outline`
              : `${subject.filteredResources.length} Uploaded Study Material(s)`}
          </span>
        </span>
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-slate-400"
        >
          <ChevronDown size={14} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id={`syllabus-${subject.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-2.5 border-t border-slate-200/80">
              {hasUnits ? (
                <ol className="space-y-2">
                  {subject.units.map((unit, uIdx) => (
                    <li key={uIdx} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#EFF6FF] text-[#0B4A8F] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 ring-1 ring-blue-100">
                        {String(uIdx + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#0B4A8F]">
                          Unit {unit.unitNumber}
                        </p>
                        <p className="text-xs text-slate-600 font-medium leading-tight">{unit.title}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <ul className="space-y-0.5">
                  {subject.filteredResources.map((r) => (
                    <li key={r._id || r.id}>
                      <button
                        onClick={() => onOpenResource(r)}
                        className="w-full flex items-center justify-between gap-2 py-1.5 px-2 rounded-lg hover:bg-white text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B4A8F]/50"
                      >
                        <span className="text-xs font-medium text-slate-700 leading-tight line-clamp-1">
                          {r.title}
                        </span>
                        <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-[#0B4A8F]">
                          <Download size={11} /> {r.downloadsCount || 0}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}