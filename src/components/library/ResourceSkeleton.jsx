import React from "react";

export default function ResourceSkeleton({ rows = 4 }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden" role="status" aria-label="Loading resources">
      <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4">
        <div className="h-11 w-11 rounded-xl bg-slate-100 animate-pulse shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-2/3 rounded-md bg-slate-100 animate-pulse" />
          <div className="h-3 w-1/2 rounded-md bg-slate-100 animate-pulse" />
        </div>
        <div className="h-8 w-16 rounded-lg bg-slate-100 animate-pulse shrink-0" />
      </div>
      {Array.from({ length: Math.max(0, rows - 1) }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 border-t border-slate-100"
        >
          <div className="h-11 w-11 rounded-xl bg-slate-100 animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-2/3 rounded-md bg-slate-100 animate-pulse" />
            <div className="h-3 w-1/2 rounded-md bg-slate-100 animate-pulse" />
          </div>
          <div className="h-8 w-16 rounded-lg bg-slate-100 animate-pulse shrink-0" />
        </div>
      ))}
      <span className="sr-only">Loading resources…</span>
    </div>
  );
}