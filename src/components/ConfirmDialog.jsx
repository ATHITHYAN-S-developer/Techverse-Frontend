import React, { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

/**
 * Modal confirmation dialog with proper dialog semantics:
 * role="dialog", aria-modal, labelled/described, Escape closes,
 * backdrop click closes, and initial focus lands on the safe action.
 */
export default function ConfirmDialog({
  isOpen,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "danger",
  onConfirm,
  onCancel,
}) {
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);

  // Close on Escape and lock background scroll while open.
  useEffect(() => {
    if (!isOpen) return undefined;

    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel?.();
      }
      if (e.key === "Tab") {
        // Simple focus trap over the buttons inside the dialog.
        const focusables = dialogRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables?.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Move focus into the dialog (the safe/Cancel action).
    const id = window.setTimeout(() => cancelRef.current?.focus(), 0);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(id);
    };
  }, [isOpen, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0"
            onClick={onCancel}
            aria-hidden="true"
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-message"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6"
          >
            <button
              type="button"
              onClick={onCancel}
              aria-label="Close dialog"
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-700 rounded-lg p-1.5"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>

            <div className="flex items-start gap-4">
              <div
                aria-hidden="true"
                className={cn(
                  "p-3 rounded-xl",
                  confirmVariant === "danger"
                    ? "bg-rose-50 text-rose-600"
                    : "bg-blue-50 text-vcet-blue"
                )}
              >
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="flex-1 pr-6">
                <h3 id="confirm-dialog-title" className="text-base font-bold text-slate-800">
                  {title}
                </h3>
                <p id="confirm-dialog-message" className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                  {message}
                </p>

                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    ref={cancelRef}
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vcet-blue focus-visible:ring-offset-2"
                  >
                    {cancelLabel}
                  </button>
                  <button
                    type="button"
                    onClick={onConfirm}
                    className={cn(
                      "px-4 py-2 text-xs font-semibold text-white rounded-xl shadow transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vcet-blue focus-visible:ring-offset-2",
                      confirmVariant === "danger"
                        ? "bg-rose-600 hover:bg-rose-700"
                        : "bg-vcet-blue hover:bg-vcet-blue-deep"
                    )}
                  >
                    {confirmLabel}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
