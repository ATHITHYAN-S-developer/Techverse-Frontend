import React, { useState } from "react";
import { Settings, Save, Shield, Database, Bell, Lock } from "lucide-react";
import { useToast } from "../../context/ToastContext";

export default function AdminSettingsPage() {
  const { showSuccess } = useToast();
  const [academicYear, setAcademicYear] = useState("2026-2027 (Autonomous)");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowStudentDownloads, setAllowStudentDownloads] = useState(true);
  const [passingThreshold, setPassingThreshold] = useState(75);

  const handleSave = (e) => {
    e.preventDefault();
    showSuccess("Platform configuration saved successfully ✓");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-slate-900">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">
          System & Institutional Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure academic calendar thresholds, authentication rules, and portal maintenance flags.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
            <Settings className="w-4 h-4 text-[#0062A8]" /> Academic Term Settings
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Active Academic Term</label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Course Pass Benchmark (%)</label>
              <input
                type="number"
                value={passingThreshold}
                onChange={(e) => setPassingThreshold(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
            <Lock className="w-4 h-4 text-amber-500" /> Security & Access Flags
          </h3>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
              <div>
                <div className="font-bold text-slate-900">Enable Open Resource Downloads</div>
                <div className="text-slate-500 text-[11px]">Allow students to download PDFs and question banks without authentication.</div>
              </div>
              <input
                type="checkbox"
                checked={allowStudentDownloads}
                onChange={(e) => setAllowStudentDownloads(e.target.checked)}
                className="w-4 h-4 accent-[#0062A8] rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
              <div>
                <div className="font-bold text-slate-900">Portal Maintenance Mode</div>
                <div className="text-slate-500 text-[11px]">Disable student test attempts temporarily during university exam syncs.</div>
              </div>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-4 h-4 accent-[#0062A8] rounded"
              />
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#0062A8] hover:bg-[#00528c] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
