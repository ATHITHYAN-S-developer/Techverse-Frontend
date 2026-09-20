import React from "react";
import { RefreshCw, AlertCircle } from "lucide-react";

export default function ErrorState({ onRetry }) {
  return (
    <div className="bg-white rounded-[20px] border border-slate-200 p-10 sm:p-14 text-center shadow-sm">
      <div className="mx-auto w-16 h-16 rounded-2xl bg-red-50 ring-1 ring-red-200 flex items-center justify-center mb-4">
        <AlertCircle size={28} className="text-[#EF4444]" />
      </div>
      <h3 className="text-base font-bold text-[#0F172A]">Unable to load resources</h3>
      <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
        Something went wrong while loading the learning materials. Please try again.
      </p>
      <button
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B4A8F] hover:bg-[#084282] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B4A8F] focus-visible:ring-offset-2"
      >
        <RefreshCw size={13} className="animate-spin [animation-duration:2.5s]" />
        Try Again
      </button>
    </div>
  );
}