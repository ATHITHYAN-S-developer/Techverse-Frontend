import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Download, Calendar, Tag, ExternalLink } from "lucide-react";
import { fileBadge, formatBytes, formatRelativeTime } from "./fileTypeInfo";

export default function ResourceListItem({ resource, deptCode, onOpen }) {
  const badge = fileBadge(resource);
  const size = formatBytes(resource.fileSize || resource.size);
  const time = formatRelativeTime(resource.createdAt);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ backgroundColor: "rgba(248, 250, 252, 0.9)" }}
      className="w-full flex items-center justify-between gap-4 p-4 border-b border-slate-100 last:border-b-0 transition-colors group"
    >
      <div className="flex items-start gap-3.5 min-w-0 flex-1">
        {/* File Type Badge */}
        <span
          className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-[11px] font-black tracking-wider border shadow-xs"
          style={{
            backgroundColor: badge.bg,
            color: badge.color,
            borderColor: `${badge.color}30`
          }}
        >
          {badge.label}
        </span>

        {/* Resource Details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              onClick={() => onOpen(resource)}
              className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer truncate"
            >
              {resource.title}
            </h3>
            {deptCode && (
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                {deptCode}
              </span>
            )}
            {resource.semester && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                Sem {resource.semester}
              </span>
            )}
          </div>

          {resource.description && (
            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
              {resource.description}
            </p>
          )}

          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400 flex-wrap font-medium">
            {time && <span>{time}</span>}
            {size && <span>• {size}</span>}
            {typeof resource.downloadsCount === "number" && resource.downloadsCount > 0 && (
              <span className="flex items-center gap-1 text-slate-500">
                • <Download size={11} /> {resource.downloadsCount} downloads
              </span>
            )}
            {resource.tags && (
              <span className="hidden sm:inline-flex items-center gap-1 text-slate-500">
                • <Tag size={10} />
                {Array.isArray(resource.tags) ? resource.tags.slice(0, 3).join(", ") : resource.tags}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="shrink-0 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onOpen(resource)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-blue-600 text-slate-700 hover:text-white text-xs font-bold transition-all duration-200 shadow-xs group/btn"
        >
          <span>Open</span>
          <ArrowUpRight size={13} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}