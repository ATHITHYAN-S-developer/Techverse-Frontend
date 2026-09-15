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
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white px-4 py-3 sm:px-6 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand & Test Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400 block">
              VCET Exam Mode Active
            </span>
            <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md">
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
                ? "bg-rose-950/60 border-rose-500/50 text-rose-300 animate-pulse"
                : "bg-slate-800/80 border-slate-700 text-slate-300"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>
              {violationCount} / {maxViolations} <span className="hidden sm:inline">Strikes</span>
            </span>
          </div>

          {/* Fullscreen Status Pill */}
          <div
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
              isFullscreen
                ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                : "bg-amber-950/60 border-amber-500/40 text-amber-300"
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>{isFullscreen ? "Fullscreen ON" : "Fullscreen Alert"}</span>
          </div>

          {/* Live Countdown Timer */}
          <div
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl font-mono text-xs sm:text-sm font-black border transition-all ${
              isTimeCritical
                ? "bg-rose-600 text-white border-rose-500 animate-bounce shadow-lg shadow-rose-600/30"
                : "bg-slate-800 border-slate-700 text-white"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTime ? formatTime(timeLeftSeconds) : timeLeftSeconds}</span>
          </div>

          {/* Submit Test Button */}
          <button
            type="button"
            onClick={onSubmitExam}
            disabled={isSubmitting}
            className="px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? "Submitting..." : "Submit Test"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
