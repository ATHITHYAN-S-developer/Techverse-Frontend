import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Building2, FileText, Monitor, ClipboardList } from "lucide-react";

const TYPE_ICONS = {
  notes: FileText,
  question_bank: ClipboardList,
  software: Monitor,
};

function typeIconFor(dept, count) {
  const best = Object.entries(dept.counts || {})
    .map(([k, v]) => [k, v])
    .sort((a, b) => b[1] - a[1])[0];
  const T = TYPE_ICONS[best?.[0]] || Building2;
  return { Icon: T, count: best?.[1] || count };
}

export default function DepartmentExplorer({ departments, onSelect }) {
  if (!departments.length) return null;

  return (
    <section className="mt-8 px-5 sm:px-0" aria-label="Browse by department">
      <div className="flex items-end justify-between mb-3">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-[#0F172A] tracking-tight">
            Explore Departments
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            A curated library for every branch
          </p>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 sm:mx-0 sm:px-0 no-scrollbar">
        {departments.map((dept, idx) => {
          const { Icon, count } = typeIconFor(dept, dept.count || 0);
          return (
            <motion.button
              key={dept.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.35, ease: "easeOut" }}
              onClick={() => onSelect(dept.id)}
              className="shrink-0 w-[168px] sm:w-[180px] text-left rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-[#0B4A8F] hover:shadow-md hover:shadow-blue-900/5 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center group-hover:bg-[#0B4A8F] transition-colors duration-200">
                  <Icon size={18} className="text-[#0B4A8F] group-hover:text-white transition-colors duration-200" />
                </div>
                <ArrowRight size={15} className="text-slate-300 group-hover:text-[#0B4A8F] group-hover:translate-x-0.5 transition-all duration-200" />
              </div>
              <p className="mt-3 text-[13px] font-bold text-[#0F172A] leading-tight line-clamp-2">
                {dept.name}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-slate-400">
                {count > 0 ? `${count} resources` : "Browse library"}
              </p>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}