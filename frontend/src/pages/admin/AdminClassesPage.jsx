import React, { useState } from "react";
import { Users, Plus, Edit, Trash2, X } from "lucide-react";
import { useToast } from "../../context/ToastContext";

const INITIAL_CLASSES = [
  { id: "cls-1", department: "CSE", year: "II Year", semester: 4, section: "A", name: "II CSE - A", studentCount: 64, classAdvisor: "Prof. S. R. Murugesan" },
  { id: "cls-2", department: "CSE", year: "II Year", semester: 4, section: "B", name: "II CSE - B", studentCount: 62, classAdvisor: "Dr. V. Kavitha" },
  { id: "cls-3", department: "CSE", year: "III Year", semester: 6, section: "A", name: "III CSE - A", studentCount: 60, classAdvisor: "Dr. K. Sathish Kumar" },
  { id: "cls-4", department: "AI&DS", year: "II Year", semester: 4, section: "A", name: "II AI&DS - A", studentCount: 58, classAdvisor: "Prof. P. Naveen" },
  { id: "cls-5", department: "IT", year: "IV Year", semester: 8, section: "A", name: "IV IT - A", studentCount: 65, classAdvisor: "Prof. M. Thangavel" }
];

export default function AdminClassesPage() {
  const { showSuccess } = useToast();
  const [classes, setClasses] = useState(INITIAL_CLASSES);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    department: "CSE",
    year: "II Year",
    semester: 4,
    section: "A",
    name: "II CSE - A",
    classAdvisor: ""
  });

  const handleSave = (e) => {
    e.preventDefault();
    const newCls = {
      ...formData,
      id: `cls-${Date.now()}`,
      studentCount: 0
    };
    setClasses([...classes, newCls]);
    showSuccess("Class section created ✓");
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Classes & Sections Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure academic cohorts, semester section divisions, and class advisors.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0062A8] hover:bg-[#00528c] text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Class Section</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((cls) => (
          <div key={cls.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-[#0062A8] border border-blue-200">
                {cls.department}
              </span>
              <span className="text-xs text-slate-500 font-mono">Sem {cls.semester}</span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">{cls.name}</h3>
              <p className="text-xs text-slate-500 mt-1">Advisor: {cls.classAdvisor || "Not Assigned"}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>{cls.studentCount} Students Enrolled</span>
              <span className="text-[#0062A8] font-semibold">{cls.year}</span>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm text-slate-900">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Create Class Section</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  >
                    <option value="CSE">CSE</option>
                    <option value="AI&DS">AI&DS</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="MECH">MECH</option>
                    <option value="CIVIL">CIVIL</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Section</label>
                  <input
                    type="text"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Class Display Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. III CSE - A"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Class Advisor Faculty</label>
                <input
                  type="text"
                  value={formData.classAdvisor}
                  onChange={(e) => setFormData({ ...formData, classAdvisor: e.target.value })}
                  placeholder="Prof. S. R. Murugesan"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-[#0062A8] text-white font-bold rounded-xl shadow hover:bg-[#00528c]">
                  Create Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
