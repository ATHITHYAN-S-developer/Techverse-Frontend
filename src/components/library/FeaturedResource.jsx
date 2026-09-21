import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowUpRight, Star, FileText } from "lucide-react";

export default function FeaturedResource({ resource, deptCode, onOpen }) {
  if (!resource) return null;

  return (
    <section className="mt-6 px-5 sm:px-0" aria-label="Featured resource">
      <div className="hidden mb-3">
        <span>spacer</span>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B4A8F] via-[#084282] to-[#063A75] text-white shadow-xl shadow-blue-900/20"
      >
        <div className="absolute -right-10 -top-14 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-[#10B981]/20 blur-3xl" />

        <div className="relative px-5 py-6 sm:px-8 sm:py-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles size={12} className="text-amber-300" />
              Featured Resource
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-blue-100">
              <Star size={11} className="fill-amber-300 text-amber-300" />
              Most Downloaded
            </span>
            {deptCode && (
              <span className="hidden sm:inline-flex rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-blue-100">
                {deptCode}
              </span>
            )}
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="text-lg sm:text-2xl font-extrabold leading-snug tracking-tight">
                {resource.title}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-blue-100/90 leading-relaxed line-clamp-2">
                {resource.description}
              </p>
            </div>
            <button
              onClick={() => onOpen(resource)}
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-white text-[#0B4A8F] px-4 py-2.5 text-[13px] font-bold shadow-lg transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]"
            >
              <FileText size={15} />
              Open
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}