import React from "react";
import { Clock, ShieldAlert, Maximize2, AlertTriangle, Send } from "lucide-react";

export default function ExamModeHeader({
  title,
  timeLeftSeconds,
  formatTime,
  violationCount = 0,
  maxViolations = 3,
  isFullscreen,
  onSubmitExam,
  isSubmitting = false,
}) {
  const isTimeCritical = timeLeftSeconds <= 120; // Under 2 minutes

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sky-100 text-slate-800 px-4 py-3 sm:px-6 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand & Test Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-[#0B4A8F] shrink-0 shadow-2xs">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0B4A8F] block">
              VCET Exam Mode Active
            </span>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[200px] sm:max-w-md">
              {title}
            </h2>
          </div>
        </div>

        {/* Center/Right: Timer, Violation Counter, and Submit */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Violations Counter Pill */}
          <div
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              violationCount > 0
                ? "bg-rose-50 border-rose-300 text-rose-700 animate-pulse"
                : "bg-sky-50/70 border-sky-200 text-slate-700"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {violationCount} / {maxViolations} <span className="hidden sm:inline">Strikes</span>
            </span>
          </div>

          {/* Fullscreen Status Pill */}
          <div
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
              isFullscreen
                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                : "bg-amber-50 border-amber-300 text-amber-800"
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isFullscreen ? "Fullscreen ON" : "Fullscreen Alert"}</span>
          </div>

          {/* Live Countdown Timer */}
          <div
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl font-mono text-xs sm:text-sm font-black border transition-all ${
              isTimeCritical
                ? "bg-rose-600 text-white border-rose-500 animate-bounce shadow-md shadow-rose-600/30"
                : "bg-sky-50 border-sky-200 text-[#0B4A8F]"
            }`}
          >
            <Clock className="w-4 h-4 text-[#0B4A8F]" />
            <span>{formatTime ? formatTime(timeLeftSeconds) : timeLeftSeconds}</span>
          </div>

          {/* Submit Test Button */}
          <button
            type="button"
            onClick={onSubmitExam}
            disabled={isSubmitting}
            className="px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-[#0B4A8F] hover:bg-[#0062A8] text-white flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? "Submitting..." : "Submit Test"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
