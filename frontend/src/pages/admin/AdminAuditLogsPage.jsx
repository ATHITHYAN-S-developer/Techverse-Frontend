import React, { useState, useEffect } from "react";
import { ShieldAlert, Search, Filter, ShieldCheck, Clock, User, ArrowUpRight } from "lucide-react";
import { auditService } from "../../services/auditService";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [actionFilter, setActionFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadLogs();
  }, [actionFilter, searchTerm]);

  const loadLogs = async () => {
    const data = await auditService.getLogs({
      action: actionFilter,
      search: searchTerm
    });
    setLogs(data);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-900">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">
          System Security & Audit Activity Logs
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Immutable event log tracking administrative state changes, account blocks, logins, and resource mutations.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit trail by user, ID, resource, details..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-xs sm:text-sm border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 border border-slate-300 focus:outline-none w-full md:w-auto"
        >
          <option value="ALL">All Actions</option>
          <option value="LOGIN">LOGIN</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
          <option value="BLOCK">BLOCK</option>
          <option value="UNBLOCK">UNBLOCK</option>
          <option value="PUBLISH">PUBLISH</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-4 py-3.5">User Identity</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Action</th>
                <th className="px-4 py-3.5">Target Resource</th>
                <th className="px-4 py-3.5">Details & IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                    {log.timestamp.replace("T", " ").replace("Z", "")}
                  </td>
                  <td className="px-4 py-3.5 font-sans">
                    <div className="font-bold text-slate-900 text-xs">{log.userName}</div>
                    <div className="text-slate-400 font-mono text-[10px]">{log.userIdentifier}</div>
                  </td>
                  <td className="px-4 py-3.5 font-sans">
                    <span className="capitalize font-semibold text-slate-700">{log.userRole}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-0.5 rounded font-black text-[10px] uppercase ${
                      log.action === "CREATE" || log.action === "PUBLISH"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : log.action === "DELETE" || log.action === "BLOCK"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-blue-50 text-[#0062A8] border border-blue-200"
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[#0062A8] font-bold">
                    {log.resourceType}: {log.resourceId}
                  </td>
                  <td className="px-4 py-3.5 font-sans text-slate-600">
                    <div className="line-clamp-1">{log.details}</div>
                    <div className="text-[10px] text-slate-400 font-mono">IP: {log.ipAddress}</div>
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
