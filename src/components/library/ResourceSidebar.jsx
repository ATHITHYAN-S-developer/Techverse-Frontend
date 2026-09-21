import React from "react";
import { LayoutDashboard, BookOpen, FileText, ClipboardList, Monitor, Download, X, GraduationCap } from "lucide-react";

const NAV_ITEMS = [
  { key: "all", label: "Overview", icon: LayoutDashboard },
  { key: "subjects", label: "Subjects", icon: BookOpen },
  { key: "notes", label: "Lecture Notes", icon: FileText },
  { key: "question_bank", label: "Question Banks", icon: ClipboardList },
  { key: "software", label: "Free Software", icon: Monitor },
  { key: "downloads", label: "Downloads", icon: Download },
];

export default function ResourceSidebar({
  activeKey,
  onNav,
  departments,
  selectedDeptId,
  onDeptChange,
  resourceCount,
  open,
  onClose,
}) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-[274px] bg-white border-r border-slate-200 shadow-xl lg:shadow-none lg:static lg:sticky lg:top-[64px] lg:h-[calc(100vh-64px)] lg:overflow-y-auto lg:shrink-0 transition-transform duration-300 ease-out ${
        open ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}
      role="navigation"
      aria-label="E-Resources sidebar"
    >
      <div className="flex items-center justify-between px-5 py-4 lg:pt-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
          E-Resources
        </p>
        <button
          onClick={onClose}
          aria-label="Close E-Resources sidebar"
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-[#0B4A8F] hover:bg-slate-100 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="px-3 space-y-1" aria-label="Resource categories">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeKey === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNav(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors duration-150 relative ${
                active
                  ? "bg-[#EFF6FF] text-[#0B4A8F]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-[#0B4A8F]"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r bg-[#0B4A8F]" />
              )}
              <Icon size={17} className={active ? "text-[#0B4A8F]" : "text-slate-400"} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-5 pt-6 pb-2">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
          <GraduationCap size={13} />
          Departments
        </div>
      </div>

      <nav className="px-3 pb-6 space-y-1" aria-label="Filter by department">
        <button
          onClick={() => onDeptChange("all")}
          className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors duration-150 ${
            selectedDeptId === "all"
              ? "bg-[#EFF6FF] text-[#0B4A8F]"
              : "text-slate-600 hover:bg-slate-50 hover:text-[#0B4A8F]"
          }`}
        >
          <span className="truncate">All Departments</span>
        </button>
        {departments.map((dept) => {
          const active = selectedDeptId === dept.id || selectedDeptId === dept.code;
          return (
            <button
              key={dept.id}
              onClick={() => onDeptChange(dept.id)}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors duration-150 ${
                active
                  ? "bg-[#EFF6FF] text-[#0B4A8F]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-[#0B4A8F]"
              }`}
            >
              <span className="truncate">{dept.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-5 pb-6 lg:pb-8">
        <div className="rounded-xl bg-[#F8FAFC] border border-slate-100 px-4 py-3">
          <p className="text-[11px] font-medium text-slate-400">Total materials</p>
          <p className="text-lg font-extrabold text-[#0B4A8F]">
            {resourceCount}
            <span className="text-xs font-semibold text-slate-400 ml-1">resources</span>
          </p>
        </div>
      </div>
    </aside>
  );
}