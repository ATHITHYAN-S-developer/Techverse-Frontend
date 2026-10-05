import React from "react";
import { motion } from "framer-motion";
import { Download, ArrowUpRight, FileText, Calendar, Tag, Sparkles } from "lucide-react";
import ResourceListItem from "./ResourceListItem";
import ResourceSkeleton from "./ResourceSkeleton";
import EmptyState from "../departments/EmptyState";
import { fileBadge, formatBytes, formatRelativeTime } from "./fileTypeInfo";

function GridCard({ resource, onOpen }) {
  const badge = fileBadge(resource);
  const size = formatBytes(resource.fileSize || resource.size);
  const time = formatRelativeTime(resource.createdAt);

  const urlLower = String(resource?.fileUrl || resource?.externalUrl || resource?.downloadUrl || "").toLowerCase();
  const typeLower = (resource?.type || "").toLowerCase();
  const titleLower = (resource?.title || "").toLowerCase();
  const isSoftware =
    typeLower === "software" ||
    /\.(exe|msi|dmg|pkg|deb|rpm|zip|rar|7z|tar|gz|apk|whl)$/i.test(urlLower) ||
    titleLower.includes("software") ||
    titleLower.includes("blender") ||
    titleLower.includes("python");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onClick={() => onOpen(resource)}
      className="flex flex-col justify-between p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-200 group cursor-pointer"
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <span
            className="w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black tracking-wider border shadow-xs"
            style={{
              backgroundColor: isSoftware ? "#ECFDF5" : badge.bg,
              color: isSoftware ? "#059669" : badge.color,
              borderColor: isSoftware ? "#A7F3D0" : `${badge.color}30`
            }}
          >
            {isSoftware ? "APP" : badge.label}
          </span>
          <div className="flex items-center gap-1.5">
            {resource.departmentCode && (
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                {resource.departmentCode}
              </span>
            )}
            {resource.unit ? (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                Unit {resource.unit}
              </span>
            ) : null}
          </div>
        </div>

        <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
          {resource.title}
        </h3>

        {resource.description && (
          <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
            {resource.description}
          </p>
        )}
      </div>

      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400">
          {size && <span>{size}</span>}
          {typeof resource.downloadsCount === "number" && resource.downloadsCount > 0 && (
            <span className="flex items-center gap-0.5 text-slate-500">
              • <Download size={10} /> {resource.downloadsCount}
            </span>
          )}
        </div>

        {isSoftware ? (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-xs">
            <Download size={13} />
            <span>Download</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-xs">
            <span>View</span>
            <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default function ResourceLibrary({
  title = "Resource Library",
  subtitle = "Everything in one place",
  count,
  viewMode = "list",
  items = [],
  onOpen,
  onReset,
  emptyMessage,
  loading
}) {
  return (
    <section className="mt-4 mb-8" aria-label={title}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-600" />
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {subtitle} {typeof count === "number" && `• ${count} item${count === 1 ? "" : "s"}`}
          </p>
        </div>
      </div>

      {loading ? (
        <ResourceSkeleton rows={4} />
      ) : items.length === 0 ? (
        <EmptyState message={emptyMessage} onReset={onReset} />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {items.map((r) => (
            <GridCard key={r.id || r._id} resource={r} onOpen={onOpen} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden divide-y divide-slate-100">
          {items.map((r) => (
            <ResourceListItem
              key={r.id || r._id}
              resource={r}
              deptCode={r.departmentCode || (r.departmentId?.code)}
              onOpen={onOpen}
            />
          ))}
        </div>
      )}
    </section>
  );
}