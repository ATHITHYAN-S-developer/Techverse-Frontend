import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Laptop, Globe2 } from "lucide-react";

const CATEGORIES = [
  { id: "notes", label: "Academic Notes & Subjects", icon: BookOpen },
  { id: "softwares", label: "Free Software & Tools", icon: Laptop },
  { id: "all", label: "All E-Resources", icon: Globe2 },
];

export default function CategoryTabs({ active, onSelect, counts }) {
  return (
    <div
      role="tablist"
      aria-label="Resource categories"
      className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-1"
    >
      {CATEGORIES.map(({ id, label, icon: Icon }) => {
        const isActive = active === id;
        return (
          <motion.button
            key={id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onSelect(id)}
            initial={false}
            whileHover={{ y: -2 }}
            className={`relative flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold transition-colors duration-200 cursor-pointer select-none whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B4A8F]/50 ${
              isActive
                ? "text-white shadow-md"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 shadow-sm"
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="category-pill"
                className="absolute inset-0 rounded-full bg-[#0B4A8F]"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Icon size={16} />
              <span>{label}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {counts[id] ?? 0}
              </span>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}