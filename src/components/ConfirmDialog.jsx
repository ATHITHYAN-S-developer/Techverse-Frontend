import React from "react";
import { AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ConfirmDialog({
  isOpen,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Confirm",
  confirmVariant = "danger",
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6"
        >
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-lg p-1"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${
              confirmVariant === "danger" ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-[#0062A8]"
            }`}>
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="flex-1">
              <h3 className="text-base font-bold text-slate-800">{title}</h3>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{message}</p>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className={`px-4 py-2 text-xs font-semibold text-white rounded-xl shadow transition-colors ${
                    confirmVariant === "danger"
                      ? "bg-rose-600 hover:bg-rose-700"
                      : "bg-[#0062A8] hover:bg-[#0B4A8F]"
                  }`}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
