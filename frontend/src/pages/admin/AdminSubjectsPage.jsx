import React, { useState } from "react";
import { BookOpen, Search, Plus, Trash2, Edit, X } from "lucide-react";
import { useToast } from "../../context/ToastContext";

const INITIAL_SUBJECTS = [
  { id: "sub-1", code: "CS8492", name: "Database Management Systems", department: "CSE", semester: 4, credits: 3, units: 5, assignedFaculty: "Prof. S. R. Murugesan" },
  { id: "sub-2", code: "CS8351", name: "Data Structures & Algorithms", department: "CSE", semester: 3, credits: 4, units: 5, assignedFaculty: "Dr. K. Sathish Kumar" },
  { id: "sub-3", code: "AD8501", name: "Artificial Intelligence Foundations", department: "AI&DS", semester: 5, credits: 3, units: 5, assignedFaculty: "Prof. P. Naveen" },
  { id: "sub-4", code: "EC8452", name: "Signals and Systems", department: "ECE", semester: 4, credits: 4, units: 5, assignedFaculty: "Prof. M. Thangavel" },
  { id: "sub-5", code: "IT8501", name: "Web Technology & Cloud", department: "IT", semester: 5, credits: 3, units: 5, assignedFaculty: "Dr. V. Kavitha" }
];

export default function AdminSubjectsPage() {
  const { showSuccess } = useToast();
  const [subjects, setSubjects] = useState(INITIAL_SUBJECTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    department: "CSE",
    semester: 4,
    credits: 3,
    units: 5,
    assignedFaculty: ""
  });

  const handleSave = (e) => {
    e.preventDefault();
    const newSub = {
      ...formData,
      id: `sub-${Date.now()}`
    };
    setSubjects([...subjects, newSub]);
    showSuccess("Subject added to academic curriculum ✓");
    setModalOpen(false);
  };

  const filtered = subjects.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === "ALL" || s.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Subjects & Curriculum Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure subject codes, credits, unit counts, and faculty assignments.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0062A8] hover:bg-[#00528c] text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search subjects by code (CS8492...) or name..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-xs sm:text-sm border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 border border-slate-300 focus:outline-none w-full md:w-auto"
        >
          <option value="ALL">All Departments</option>
          <option value="CSE">CSE</option>
          <option value="AI&DS">AI&DS</option>
          <option value="IT">IT</option>
          <option value="ECE">ECE</option>
          <option value="EEE">EEE</option>
          <option value="MECH">MECH</option>
          <option value="CIVIL">CIVIL</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Subject Code & Name</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Semester</th>
                <th className="px-4 py-3.5">Credits / Units</th>
                <th className="px-4 py-3.5">Assigned Faculty</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-900 text-sm">{s.name}</div>
                    <div className="text-[#0062A8] font-mono font-bold text-[11px] mt-0.5">{s.code}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 font-semibold text-[#0062A8] text-[11px]">
                      {s.department}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-medium text-slate-700">
                    Sem {s.semester}
                  </td>
                  <td className="px-4 py-4 text-slate-600 font-medium">
                    {s.credits} Credits • {s.units} Units
                  </td>
                  <td className="px-4 py-4 text-slate-800 font-medium">
                    {s.assignedFaculty}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => setSubjects(subjects.filter((sub) => sub.id !== s.id))}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Subject"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm text-slate-900">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Curriculum Subject</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subject Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="CS8492"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono"
                  />
                </div>
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
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Database Management Systems"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Semester</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Sem {s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Credits</label>
                  <input
                    type="number"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Units</label>
                  <input
                    type="number"
                    value={formData.units}
                    onChange={(e) => setFormData({ ...formData, units: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Assigned Faculty</label>
                <input
                  type="text"
                  value={formData.assignedFaculty}
                  onChange={(e) => setFormData({ ...formData, assignedFaculty: e.target.value })}
                  placeholder="Prof. S. R. Murugesan"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-[#0062A8] text-white font-bold rounded-xl shadow hover:bg-[#00528c]">
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
