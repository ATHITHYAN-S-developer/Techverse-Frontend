import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, BookOpen } from "lucide-react";

export default function SubjectExplorer({ title, subtitle, subjects, onSelect }) {
  if (!subjects.length) return null;

  return (
    <section className="mt-8 px-5 sm:px-0" aria-label={title}>
      <div className="flex items-end justify-between mb-3">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-[#0F172A] tracking-tight">
            {title}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {subjects.slice(0, 6).map((subject, idx) => (
          <motion.button
            key={subject.id || subject._id || idx}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.03, duration: 0.3, ease: "easeOut" }}
            onClick={() => onSelect(subject)}
            className="w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 sm:py-4 text-left border-b border-slate-100 last:border-b-0 hover:bg-[#EFF6FF]/60 transition-colors duration-150 group"
          >
            <span className="text-[12px] font-extrabold tabular-nums text-[#0B4A8F]/60 w-6 shrink-0">
              {String(idx + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] sm:text-sm font-bold text-[#0F172A] truncate group-hover:text-[#0B4A8F] transition-colors">
                {subject.name}
              </p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
                {subject.code
                  ? `${subject.code}${subject.departmentName ? ` • ${subject.departmentName}` : ""}`
                  : subject.departmentName || "Academic material"}
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
              <BookOpen size={12} />
              {subject.subjectCount || subject.resourceCount || 0} resources
            </span>
            <ChevronRight
              size={16}
              className="text-slate-300 group-hover:text-[#0B4A8F] group-hover:translate-x-0.5 transition-all duration-150 shrink-0"
            />
          </motion.button>
        ))}
      </div>
    </section>
  );
}