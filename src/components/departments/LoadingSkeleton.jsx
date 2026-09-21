import React from "react";

function SkeletonBar({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200/70 ${className}`} />;
}

export default function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Hero skeleton */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0B4A8F, #084282 50%, #063A75)" }}>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18 lg:py-24 space-y-6">
          <SkeletonBar className="h-9 w-64 bg-white/20" />
          <SkeletonBar className="h-14 w-[540px] max-w-full bg-white/20" />
          <SkeletonBar className="h-14 w-[400px] max-w-full bg-white/20" />
          <SkeletonBar className="h-4 w-[560px] max-w-full bg-white/20" />
          <div className="grid grid-cols-2 gap-8 pt-6 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <SkeletonBar className="h-8 w-24 bg-white/20" />
                <SkeletonBar className="h-3 w-20 bg-white/20" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 space-y-8">
        <div className="flex gap-3">
          <SkeletonBar className="h-11 w-56 rounded-full" />
          <SkeletonBar className="h-11 w-48 rounded-full" />
          <SkeletonBar className="h-11 w-44 rounded-full" />
        </div>

        <div className="bg-white rounded-[20px] border border-slate-200 p-5 sm:p-6 space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row">
            <SkeletonBar className="h-11 flex-1" />
            <SkeletonBar className="h-11 w-56" />
            <SkeletonBar className="h-11 w-40" />
          </div>
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <SkeletonBar className="h-4 w-72" />
            <SkeletonBar className="h-5 w-24 rounded-full" />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-[20px] border border-slate-200 p-6 space-y-4 shadow-sm">
              <div className="flex justify-between">
                <SkeletonBar className="h-5 w-20" />
                <SkeletonBar className="h-5 w-24" />
              </div>
              <SkeletonBar className="h-5 w-3/4" />
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <SkeletonBar className="h-10 w-full rounded-xl" />
                <SkeletonBar className="h-10 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}