import React, { useState } from "react";
import {
  ShieldAlert,
  Maximize2,
  Clock,
  EyeOff,
  CopyX,
  AlertTriangle,
  CheckSquare,
  Square,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function ExamRulesModal({
  isOpen,
  title = "Institutional Assessment",
  durationMinutes = 10,
  maxViolations = 3,
  onStartExam,
  onCancel,
}) {
  const [hasAgreed, setHasAgreed] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-sky-100 overflow-hidden">
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-sky-50 via-blue-50 to-white p-6 sm:p-8 border-b border-sky-100 text-slate-900">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 border border-sky-200 flex items-center justify-center text-[#0B4A8F] shadow-2xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#0B4A8F]">
                VCET Academic Integrity Control
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Exam Mode Security Protocol
              </h2>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            You are about to start <strong className="text-slate-900 font-bold">{title}</strong>. Please review the proctored assessment policies below.
          </p>
        </div>

        {/* Security Rules Checklist */}
        <div className="p-6 sm:p-8 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Rule 1: Fullscreen */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-100 text-blue-700 shrink-0">
                <Maximize2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Fullscreen Required</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  The test runs in full screen. Exiting full screen records a security violation.
                </p>
              </div>
            </div>

            {/* Rule 2: Tab Switching */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
                <EyeOff className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Tab Switch Monitored</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Switching tabs or minimizing the browser will be flagged immediately.
                </p>
              </div>
            </div>

            {/* Rule 3: Clipboard Restrictions */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0">
                <CopyX className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Clipboard Blocked</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Copy, paste, cut, and right-click context menus are disabled in exam mode.
                </p>
              </div>
            </div>

            {/* Rule 4: Timer & Auto-Submit */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Strict Timer: {durationMinutes} Mins</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Assessment auto-submits when time expires or on {maxViolations} violations.
                </p>
              </div>
            </div>
          </div>

          {/* Important Notice Callout */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <strong>Violation Policy:</strong> 1st & 2nd violations will trigger warnings. If <strong>{maxViolations} security violations</strong> are recorded, your assessment will be <strong>automatically terminated and submitted</strong>.
            </div>
          </div>

          {/* Student Agreement Checkbox */}
          <button
            type="button"
            onClick={() => setHasAgreed(!hasAgreed)}
            className="w-full text-left flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer select-none bg-slate-50 hover:bg-slate-100/80 border-slate-200"
          >
            {hasAgreed ? (
              <CheckSquare className="w-5 h-5 text-blue-600 shrink-0" />
            ) : (
              <Square className="w-5 h-5 text-slate-400 shrink-0" />
            )}
            <span className="text-xs font-medium text-slate-700">
              I understand and agree to abide by the VCET Academic Integrity Guidelines during this assessment.
            </span>
          </button>
        </div>

        {/* Modal Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancel & Exit
            </button>
          )}
          <button
            type="button"
            disabled={!hasAgreed}
            onClick={onStartExam}
            className={`ml-auto px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md cursor-pointer ${
              hasAgreed
                ? "bg-[#0B4A8F] hover:bg-[#0062A8] text-white shadow-blue-500/20 active:scale-95"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Enter Fullscreen & Start Test</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
