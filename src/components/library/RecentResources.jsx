import React from "react";
import { motion } from "framer-motion";
import { History, ArrowUpRight } from "lucide-react";
import { fileBadge, formatRelativeTime } from "./fileTypeInfo";

export default function RecentResources({ items, onOpen }) {
  const withTime = items.filter((r) => formatRelativeTime(r.createdAt) !== null);
  if (withTime.length === 0) return null;

  return (
    <section className="mt-8 px-5 sm:px-0 pb-6" aria-label="Recently added resources">
      <div className="flex items-end justify-between mb-3">
        <div>
          <h2 className="font-serif text-base sm:text-lg font-extrabold text-profile-ink tracking-tight">
            Recently Added
          </h2>
          <p className="text-xs text-profile-ink/70 mt-0.5">Fresh uploads from departments</p>
        </div>
      </div>

      <div className="relative pl-5">
        <div className="absolute left-[7px] top-1 bottom-1 w-px bg-profile-alt" />
        <div className="space-y-4">
          {withTime.slice(0, 4).map((r) => {
            const badge = fileBadge(r);
            return (
              <motion.button
                key={r.id || r._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => onOpen(r)}
                className="relative flex items-start gap-3 w-full text-left group"
              >
                <span className="absolute -left-5 top-1.5 h-[15px] w-[15px] rounded-full bg-profile-light border-[3px] border-profile-main" />
                <span
                  className="shrink-0 h-9 w-9 mt-0.5 rounded-lg flex items-center justify-center text-[10px] font-extrabold tracking-wide"
                  style={{ backgroundColor: badge.bg, color: badge.color }}
                >
                  {badge.label}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-profile-ink leading-snug line-clamp-1 group-hover:text-profile-main transition-colors">
                    {r.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {r.departmentCode && (
                      <span className="text-[10px] font-bold text-profile-ink/60 uppercase tracking-wide">
                        {r.departmentCode}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-profile-ink/60">
                      <History size={10} />
                      {formatRelativeTime(r.createdAt)}
                    </span>
                  </div>
                </div>
                <ArrowUpRight
                  size={15}
                  className="mt-1 shrink-0 text-profile-ink/40 group-hover:text-profile-main transition-colors"
                />
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}