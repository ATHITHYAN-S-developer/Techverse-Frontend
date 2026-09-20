import React from "react";
import { motion } from "framer-motion";
import { BookMarked, ChevronRight } from "lucide-react";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function ResourceHeader({ departments, resources }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="pt-6 px-5 sm:px-0"
    >
      <div className="flex items-center gap-2 text-[11px] sm:text-xs font-medium text-slate-400 mb-3">
        <span className="text-slate-300">Home</span>
        <ChevronRight size={13} className="text-slate-300" />
        <span className="text-slate-500">Departments</span>
        <ChevronRight size={13} className="text-slate-300" />
        <span className="text-[#0B4A8F] font-semibold">E-Resources</span>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="flex items-center gap-1.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 px-2.5 py-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#10B981]" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#059669]">
                Live Resource Library
              </span>
            </div>
          </div>
          <h1 className="text-[22px] sm:text-[26px] lg:text-[30px] font-extrabold text-[#0F172A] leading-tight tracking-tight">
            {getGreeting()}! Your Academic Hub
          </h1>
          <p className="text-[13px] sm:text-sm text-slate-500 mt-1.5 max-w-xl leading-relaxed">
            Browse lecture notes, question banks, lab manuals & free software for every
            department, every semester.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 rounded-xl bg-[#EFF6FF] border border-blue-100 px-4 py-3 shrink-0">
          <BookMarked size={16} className="text-[#0B4A8F]" />
          <div className="leading-tight">
            <p className="text-sm font-extrabold text-[#0B4A8F]">{resources}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {departments} departments
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}