import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowUpRight, Star, FileText, Download, Building2, Tag } from "lucide-react";

export default function FeaturedResource({ resource, deptCode, onOpen }) {
  if (!resource) return null;

  return (
    <section className="mt-4 mb-6" aria-label="Featured resource">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B2347] via-[#0D3866] to-[#0A2540] text-white border border-blue-900/60 shadow-xl shadow-blue-950/20"
      >
        {/* Background decorative elements */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-2xl bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-2xl bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="relative p-6 sm:p-8">
          {/* Header Badges */}
          <div className="flex items-center gap-2.5 mb-4 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/20 border border-amber-400/30 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-amber-300 backdrop-blur-sm">
              <Sparkles size={13} className="text-amber-300" />
              Featured Resource
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 border border-white/15 px-2.5 py-1 text-[11px] font-semibold text-white/90">
              <Star size={12} className="fill-amber-300 text-amber-300" />
              Most Downloaded
            </span>
            {deptCode && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-blue-500/20 border border-blue-400/30 px-2.5 py-1 text-[11px] font-bold text-blue-200">
                <Building2 size={12} />
                {deptCode}
              </span>
            )}
            {resource.semester && (
              <span className="inline-flex items-center rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/80">
                Semester {resource.semester}
              </span>
            )}
          </div>

          {/* Content & Action */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-3xl space-y-2">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold leading-snug tracking-tight text-white">
                {resource.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-2">
                {resource.description || "Comprehensive academic lecture notes and curriculum materials prepared for VCET engineering scholars."}
              </p>
              {resource.tags && (
                <div className="flex items-center gap-1.5 pt-1 text-[11px] text-blue-200/80">
                  <Tag size={12} />
                  <span>{Array.isArray(resource.tags) ? resource.tags.join(" • ") : resource.tags}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onOpen(resource)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white px-5 py-3 text-sm font-extrabold shadow-lg shadow-blue-500/30 transition-all duration-200"
              >
                <FileText size={16} />
                <span>Open Material</span>
                <ArrowUpRight size={15} />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}