import React from "react";
import { ArrowRight, Download } from "lucide-react";
import { fileBadge, formatBytes, formatRelativeTime } from "./fileTypeInfo";

export default function ResourceListItem({ resource, deptCode, isFeatured, onOpen }) {
  const badge = fileBadge(resource);
  const size = formatBytes(resource.fileSize || resource.size);
  const time = formatRelativeTime(resource.createdAt);

  return (
    <button
      onClick={() => onOpen(resource)}
      className="w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 sm:py-4 text-left border-b border-slate-100 last:border-b-0 hover:bg-[#F8FAFC] transition-colors duration-150 group"
    >
      <span
        className="shrink-0 h-11 w-11 rounded-xl flex items-center justify-center text-[11px] font-extrabold tracking-wide"
        style={{ backgroundColor: badge.bg, color: badge.color }}
      >
        {badge.label}
      </span>

      <div className="min-w-0 flex-1">
        <p
          className={`truncate ${
            isFeatured
              ? "text-[13px] sm:text-sm font-bold text-[#0B4A8F]"
              : "text-[13px] sm:text-sm font-bold text-[#0F172A] group-hover:text-[#0B4A8F]"
          } transition-colors`}
        >
          {resource.title}
        </p>
        {resource.description && (
          <p className="text-[11px] sm:text-xs text-slate-400 truncate mt-0.5">
            {resource.description}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {deptCode && (
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              {deptCode}
            </span>
          )}
          {resource.semester ? (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
              Semester {resource.semester}
            </span>
          ) : null}
          {size && (
            <span className="text-[10px] font-medium text-slate-400">{size}</span>
          )}
          {time && (
            <span className="text-[10px] font-medium text-slate-400">{time}</span>
          )}
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-1.5 sm:gap-2">
        {typeof resource.downloadsCount === "number" && resource.downloadsCount > 0 && (
          <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
            <Download size={12} />
            {resource.downloadsCount}
          </span>
        )}
        <span className="inline-flex items-center rounded-lg bg-[#0B4A8F] group-hover:bg-[#084282] text-white px-3 py-1.5 text-[11px] font-bold transition-colors duration-150">
          Open
          <ArrowRight size={12} className="ml-1 group-hover:translate-x-0.5 transition-transform duration-150" />
        </span>
      </div>
    </button>
  );
}