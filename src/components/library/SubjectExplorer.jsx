import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, BookOpen, Layers, ArrowUpRight } from "lucide-react";

export default function SubjectExplorer({ title, subtitle, subjects = [], onSelect }) {
  if (!subjects.length) return null;

  return (
    <section className="mt-8 mb-8" aria-label={title}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-purple-600" />
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {subjects.map((subject, idx) => (
          <motion.button
            key={subject.id || subject._id || idx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04, duration: 0.35, ease: "easeOut" }}
            whileHover={{ y: -2 }}
            onClick={() => onSelect(subject)}
            className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200/80 bg-white hover:border-purple-300 hover:shadow-md hover:shadow-purple-500/5 text-left transition-all duration-200 group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <span className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 font-extrabold text-[13px] flex items-center justify-center shrink-0 border border-purple-100 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-200">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-purple-700 transition-colors">
                  {subject.name}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                  <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                    {subject.code || "CORE"}
                  </span>
                  {subject.departmentName && (
                    <span className="truncate">• {subject.departmentName}</span>
                  )}
                  {subject.semester && (
                    <span>• Sem {subject.semester}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-3">
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg bg-slate-50 text-slate-600 border border-slate-100 group-hover:bg-purple-50 group-hover:text-purple-700 transition-colors">
                <BookOpen size={12} />
                {subject.subjectCount || subject.resourceCount || 0}
              </span>
              <span className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-purple-700 group-hover:translate-x-0.5 transition-all">
                <ChevronRight size={18} />
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  );
}