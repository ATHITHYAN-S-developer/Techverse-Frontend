/**
 * TechPulseRoadmapModal
 * Full detail view for a `kind: "roadmap"` Tech Pulse post: level, duration and
 * the ordered steps, each opening its own link in a new tab.
 *
 * Accessibility: role="dialog" + aria-modal, labelled by the roadmap title,
 * Escape and backdrop close, Tab is trapped inside, body scroll is locked, and
 * focus returns to whatever opened it.
 */

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Map, Clock, BarChart3, ExternalLink } from "lucide-react";

const LEVEL_TONES = {
  Beginner: "bg-emerald-100 text-emerald-800",
  Intermediate: "bg-amber-100 text-amber-800",
  Advanced: "bg-rose-100 text-rose-800",
};

export default function TechPulseRoadmapModal({ roadmap, onClose }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    if (!roadmap) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose?.();
        return;
      }
      if (event.key !== "Tab") return;

      const focusables = dialogRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => closeRef.current?.focus(), 0);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(timer);
    };
  }, [roadmap, onClose]);

  const steps = Array.isArray(roadmap?.steps) ? roadmap.steps : [];

  return (
    <AnimatePresence>
      {roadmap && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-950/60 p-0 sm:p-6 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose?.();
          }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tech-pulse-roadmap-title"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[85vh] sm:max-w-2xl sm:rounded-3xl"
          >
            {/* Sticky header */}
            <div className="sticky top-0 z-10 flex items-start gap-3 border-b border-slate-200 bg-white px-5 py-4 sm:px-7 sm:py-6">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-vcet-blue/10 text-vcet-blue">
                <Map className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <h2
                  id="tech-pulse-roadmap-title"
                  className="text-lg font-extrabold leading-snug tracking-tight text-slate-900 sm:text-xl"
                >
                  {roadmap.title}
                </h2>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-slate-500">
                  {roadmap.level && (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${
                        LEVEL_TONES[roadmap.level] || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      <BarChart3 className="h-3 w-3" aria-hidden="true" />
                      {roadmap.level}
                    </span>
                  )}
                  {roadmap.durationText && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {roadmap.durationText}
                    </span>
                  )}
                  <span>
                    {steps.length} step{steps.length === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={() => onClose?.()}
                aria-label="Close roadmap"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {roadmap.description && (
              <p className="border-b border-slate-100 px-5 py-4 text-sm leading-relaxed text-slate-600 sm:px-7">
                {roadmap.description}
              </p>
            )}

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
              {steps.length === 0 ? (
                <p className="text-sm text-slate-500">This roadmap has no steps yet.</p>
              ) : (
                <ol className="space-y-3">
                  {steps.map((step, index) => (
                    <li
                      key={`${step.title}-${index}`}
                      className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition-colors hover:border-vcet-blue/40"
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-vcet-blue text-[11px] font-black text-white">
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900">{step.title}</h3>
                            {step.resourceType && (
                              <span className="rounded-md bg-white px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 ring-1 ring-slate-200">
                                {step.resourceType}
                              </span>
                            )}
                          </div>
                          {step.description && (
                            <p className="mt-1 text-xs leading-relaxed text-slate-600">
                              {step.description}
                            </p>
                          )}
                          {step.url && (
                            <a
                              href={step.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-vcet-blue hover:underline"
                            >
                              Open resource
                              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                            </a>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
