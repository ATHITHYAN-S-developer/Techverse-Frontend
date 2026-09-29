import React from "react";
import { motion } from "framer-motion";
import {
  Cpu,
  Brain,
  Radio,
  Zap,
  Building,
  HeartPulse,
  Activity,
  Network,
  Building2,
  ArrowRight,
  BookOpen
} from "lucide-react";

const ICON_MAP = {
  Cpu,
  Brain,
  Radio,
  Zap,
  Building,
  HeartPulse,
  Activity,
  Network,
  Building2
};

export default function DepartmentExplorer({ departments = [], selectedDeptId, onSelect }) {
  if (!departments.length) return null;

  return (
    <section aria-label="Browse by department" className="my-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
            Departments Overview
          </h2>
        </div>
        {selectedDeptId !== "all" && (
          <button
            onClick={() => onSelect("all")}
            className="text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            View All Departments
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-8 gap-2.5">
        {departments.map((dept, idx) => {
          const Icon = ICON_MAP[dept.icon] || Building2;
          const isSelected =
            String(selectedDeptId) === String(dept.id) ||
            String(selectedDeptId).toLowerCase() === String(dept.code).toLowerCase();
          const deptColor = dept.color || "#0284c7";

          return (
            <motion.button
              key={dept.id || dept._id || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03, duration: 0.3, ease: "easeOut" }}
              whileHover={{ y: -2 }}
              onClick={() => onSelect(dept.id)}
              className={`relative flex flex-col items-center justify-between p-3.5 rounded-xl border text-center transition-all duration-200 group ${
                isSelected
                  ? "bg-blue-50/80 border-blue-500 shadow-sm shadow-blue-500/10 ring-2 ring-blue-500/20"
                  : "bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-transform duration-200 group-hover:scale-105"
                style={{
                  backgroundColor: `${deptColor}15`,
                  color: deptColor
                }}
              >
                <Icon size={20} strokeWidth={2} />
              </span>

              <span className="text-[12px] font-extrabold text-slate-800 leading-tight line-clamp-1 group-hover:text-blue-600 transition-colors">
                {dept.code}
              </span>

              <span className="text-[10px] font-semibold text-slate-400 mt-1">
                {dept.count ? `${dept.count} items` : "Explore"}
              </span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}