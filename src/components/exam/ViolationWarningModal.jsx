import React from "react";
import { AlertOctagon, ShieldAlert, Maximize2, AlertTriangle, ArrowRight } from "lucide-react";

export default function ViolationWarningModal({
  isOpen,
  violation,
  onDismiss,
}) {
  if (!isOpen || !violation) return null;

  const count = violation.count || 1;
  const maxViolations = violation.maxViolations || 3;
  const isFinalStrike = count >= maxViolations;

  const getViolationTitle = (type) => {
    switch (type) {
      case "TAB_SWITCH":
        return "Tab Switch / Window Inactive";
      case "FULLSCREEN_EXIT":
        return "Exited Fullscreen Mode";
      case "WINDOW_BLUR":
        return "Focus Lost from Assessment Window";
      case "COPY_ATTEMPT":
        return "Copy Operation Blocked";
      case "PASTE_ATTEMPT":
        return "Paste Operation Blocked";
      case "CUT_ATTEMPT":
        return "Cut Operation Blocked";
      case "CONTEXT_MENU":
        return "Right-Click Context Menu Blocked";
      default:
        return "Security Violation Detected";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className={`relative w-full max-w-md rounded-3xl p-6 sm:p-8 text-white shadow-2xl border ${
        isFinalStrike ? "bg-rose-950 border-rose-600/60" : "bg-slate-900 border-amber-500/50"
      }`}>
        <div className="text-center space-y-4">
          {/* Warning Icon */}
          <div className={`w-16 h-16 mx-auto rounded-3xl flex items-center justify-center animate-bounce shadow-lg ${
            isFinalStrike ? "bg-rose-600/30 text-rose-400 border border-rose-500" : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
          }`}>
            {isFinalStrike ? <AlertOctagon className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
          </div>

          <div>
            <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-1.5 ${
              isFinalStrike ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
            }`}>
              Strike {count} of {maxViolations}
            </span>
            <h3 className="text-xl font-black text-white">
              {getViolationTitle(violation.type)}
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              {violation.details || "An action violating exam security rules was recorded by the proctoring monitor."}
            </p>
          </div>

          {/* Strikes Progress Bar */}
          <div className="space-y-1.5 py-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
              <span>Security Violations</span>
              <span>{count} / {maxViolations} Allowed</span>
            </div>
            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex gap-1 p-0.5">
              {Array.from({ length: maxViolations }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-full flex-1 rounded-full transition-all duration-300 ${
                    idx < count
                      ? isFinalStrike
                        ? "bg-rose-500"
                        : "bg-amber-500"
                      : "bg-slate-700/60"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Action notice */}
          {isFinalStrike ? (
            <div className="p-3.5 rounded-2xl bg-rose-900/60 border border-rose-700/60 text-xs text-rose-200">
              <AlertTriangle className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
              Maximum allowed violations reached. Your assessment is now being submitted automatically to the evaluation server.
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-amber-950/60 border border-amber-800/60 text-xs text-amber-200">
              Please maintain fullscreen and stay within this window. Another violation may result in automatic test termination.
            </div>
          )}

          {!isFinalStrike && (
            <button
              type="button"
              onClick={onDismiss}
              className="w-full py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95 transition-all"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Resume Exam & Return to Fullscreen</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
