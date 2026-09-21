import React from "react";
import { motion } from "framer-motion";
import { SearchX, RotateCcw } from "lucide-react";

export default function EmptyState({ message, onReset }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="bg-white rounded-[20px] border border-slate-200 p-10 sm:p-14 text-center shadow-sm"
    >
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="mx-auto w-16 h-16 rounded-2xl bg-[#EFF6FF] ring-1 ring-blue-100 flex items-center justify-center mb-4"
      >
        <SearchX size={28} className="text-[#0B4A8F]" />
      </motion.div>
      <h3 className="text-base font-bold text-[#0F172A]">No resources found</h3>
      <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
        {message || "We couldn't find any resources matching your current filters."}
      </p>
      <button
        onClick={onReset}
        className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B4A8F] hover:bg-[#084282] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B4A8F] focus-visible:ring-offset-2"
      >
        <RotateCcw size={13} />
        Clear all filters
      </button>
    </motion.div>
  );
}