import React, { useState } from "react";
import { Building2, Plus, Edit, CheckCircle, Ban, Users, BookOpen, Layers } from "lucide-react";
import { DEPARTMENTS_DATA } from "../../data/departments";
import { useToast } from "../../context/ToastContext";

export default function AdminDepartmentsPage() {
  const { showSuccess } = useToast();
  const [departments, setDepartments] = useState(() =>
    Object.values(DEPARTMENTS_DATA).map((d) => ({ ...d, isActive: true }))
  );

  const toggleDept = (code) => {
    setDepartments((prev) =>
      prev.map((d) => (d.code === code ? { ...d, isActive: !d.isActive } : d))
    );
    showSuccess("Department status updated ✓");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Department Management (7 Engineering Branches)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure department curricula, HOD appointments, and active resource status.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {departments.map((d) => (
          <div
            key={d.code}
            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-blue-50 text-[#0062A8] border border-blue-200 font-mono">
                  {d.code}
                </span>
                <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                  d.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}>
                  {d.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">{d.name}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{d.tagline}</p>

              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#0062A8]" />
                  <span>{d.stats?.students || "800+"} Students</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{d.stats?.resources || "180+"} Resources</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">HOD: Dr. K. Venkatachalam</span>
              <button
                onClick={() => toggleDept(d.code)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors ${
                  d.isActive
                    ? "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
                    : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                {d.isActive ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
