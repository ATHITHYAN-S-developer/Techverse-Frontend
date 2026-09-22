import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ChevronRight } from "lucide-react";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function ResourceHeader({ departments, resources }) {
  return (
    <section className="relative bg-gradient-to-br from-[#0B4A8F] via-[#084282] to-[#063A75] text-white py-10 sm:py-14 px-4 sm:px-6 lg:px-8 overflow-hidden shadow-xs select-none">
      {/* Decorative ambient gradient rings */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-25">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full border border-white/20" />
        <div className="absolute right-[-40px] top-1/4 h-80 w-80 rounded-full border border-white/20" />
        <div className="absolute -bottom-16 left-1/3 h-64 w-64 rounded-full bg-blue-400/10 blur-2xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex items-center gap-2 text-[11px] sm:text-xs font-medium text-slate-200 mb-3"
        >
          <span className="hover:text-white transition-colors cursor-pointer">Home</span>
          <ChevronRight size={13} className="text-slate-300/80" />
          <span className="hover:text-white transition-colors cursor-pointer">Departments</span>
          <ChevronRight size={13} className="text-slate-300/80" />
          <span className="text-[#B9E0FF] font-semibold">E-Resources</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-col gap-5 lg:flex-row lg:items-end justify-between"
        >
          {/* Left: Badge + Title + Subtitle */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3.5 py-1.5 mb-4 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-white">
                Live Resource Library
              </span>
            </div>

            <h1 className="text-[26px] sm:text-[30px] lg:text-[38px] font-extrabold leading-tight tracking-tight">
              {getGreeting()}! Your Academic Hub
            </h1>

            <p className="mt-3 text-[13px] sm:text-sm font-normal text-sky-100/90 leading-relaxed max-w-xl">
              Browse lecture notes, question banks, lab manuals & free software for every
              department, every semester.
            </p>
          </div>

          {/* Right: Live Stats Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex flex-col items-center rounded-2xl bg-white/5 border border-white/15 backdrop-blur-sm px-5 py-3">
              <span className="text-lg font-black text-white">{resources}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-sky-200">Resources</span>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-[#15B981]/15 border border-[#15B981]/40 px-4 py-3 backdrop-blur-sm">
              <Sparkles size={14} className="text-emerald-300" />
              <div className="leading-tight">
                <p className="text-lg font-black text-white">{departments}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">
                  Departments live
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}