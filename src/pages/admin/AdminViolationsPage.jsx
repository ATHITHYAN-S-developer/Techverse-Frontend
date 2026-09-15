import React, { useState } from "react";
import {
  ShieldAlert,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  User,
  GraduationCap,
  XCircle,
  CheckCircle,
  FileSpreadsheet,
  Download,
  Flame,
  Shield,
  RefreshCw
} from "lucide-react";
import { useToast } from "../../context/ToastContext";

const INITIAL_VIOLATIONS = [];

export default function AdminViolationsPage() {
  const { showSuccess } = useToast();
  const [violations, setViolations] = useState(INITIAL_VIOLATIONS);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [actionFilter, setActionFilter] = useState("ALL");

  const filtered = violations.filter((v) => {
    const matchesSearch =
      v.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.testTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "ALL" || v.violationType === typeFilter;
    const matchesAction = actionFilter === "ALL" || v.actionTaken === actionFilter;
    return matchesSearch && matchesType && matchesAction;
  });

  const getViolationBadge = (type) => {
    switch (type) {
      case "TAB_SWITCH":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Tab Switch</span>;
      case "COPY_PASTE":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Clipboard Paste</span>;
      case "FULLSCREEN_EXIT":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Fullscreen Exit</span>;
      case "WINDOW_BLUR":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Window Blur</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">{type}</span>;
    }
  };

  const getActionBadge = (action) => {
    switch (action) {
      case "AUTO_SUBMITTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-black rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3" /> Auto-Submitted
          </span>
        );
      case "WARNING_ISSUED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-black rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3 h-3" /> Warning (1/3)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-black rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            Strike (2/3)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-600" />
            Exam Proctoring Telemetry & Violation Audits
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time proctoring security logs: tab switches, clipboard paste interceptions, and automated test terminations.
          </p>
        </div>

        <button
          onClick={() => showSuccess("Proctoring audit exported to CSV ✓")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-all self-start sm:self-auto border border-slate-200"
        >
          <Download className="w-4 h-4 text-[#0062A8]" />
          <span>Export Security Audit</span>
        </button>
      </div>

      {/* KPI Cards for Violations */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Recorded Strikes</span>
          <p className="text-2xl font-black text-slate-900 mt-1">43</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Tab Switch Incidents</span>
          <p className="text-2xl font-black text-rose-600 mt-1">24</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Paste Interceptions</span>
          <p className="text-2xl font-black text-amber-600 mt-1">11</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Auto-Submitted Tests</span>
          <p className="text-2xl font-black text-rose-700 mt-1">8</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student register number, name, or exam title..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-xs sm:text-sm border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0062A8] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200 focus:outline-none focus:bg-white"
          >
            <option value="ALL">All Violation Types</option>
            <option value="TAB_SWITCH">Tab Switch</option>
            <option value="COPY_PASTE">Paste Interception</option>
            <option value="FULLSCREEN_EXIT">Fullscreen Exit</option>
            <option value="WINDOW_BLUR">Window Blur</option>
          </select>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200 focus:outline-none focus:bg-white"
          >
            <option value="ALL">All Enforcement Actions</option>
            <option value="AUTO_SUBMITTED">Auto-Submitted</option>
            <option value="WARNING_ISSUED">Warning Issued</option>
            <option value="STRIKE_RECORDED">Strike Recorded</option>
          </select>
        </div>
      </div>

      {/* Violations Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Student Details</th>
                <th className="px-4 py-3.5">Assessment Title</th>
                <th className="px-4 py-3.5">Violation Trigger</th>
                <th className="px-4 py-3.5">Strikes</th>
                <th className="px-4 py-3.5">Enforcement Action</th>
                <th className="px-4 py-3.5">Timestamp & IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-slate-900 text-sm">{v.studentName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {v.regNo} • {v.department}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 max-w-xs font-medium text-slate-800">
                    <div className="line-clamp-2">{v.testTitle}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="space-y-1">
                      {getViolationBadge(v.violationType)}
                      <p className="text-[10px] text-slate-500 leading-tight">{v.description}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-mono font-bold text-slate-900">
                      {v.strikeCount}/{v.maxStrikes}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">{getActionBadge(v.actionTaken)}</td>
                  <td className="px-4 py-3.5 text-slate-500 text-[11px]">
                    <div className="font-mono text-slate-700">{v.timestamp}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{v.ipAddress}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
