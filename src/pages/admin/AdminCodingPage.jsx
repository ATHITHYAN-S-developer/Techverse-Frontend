import React, { useState } from "react";
import {
  Code2,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  X,
  Search,
  Lock,
  Terminal,
  Play,
  Layers,
  Sparkles,
  Cpu
} from "lucide-react";
import { useToast } from "../../context/ToastContext";

const INITIAL_PROBLEMS = [];

export default function AdminCodingPage() {
  const { showSuccess, showError } = useToast();
  const [problems, setProblems] = useState(INITIAL_PROBLEMS);
  const [searchTerm, setSearchTerm] = useState("");
  const [diffFilter, setDiffFilter] = useState("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    difficulty: "Easy",
    category: "Algorithms",
    points: 25,
    timeLimitMs: 1000,
    memoryLimitMb: 256,
    description: "",
    inputFormat: "",
    outputFormat: "",
    constraints: "",
    sampleInput: "",
    sampleOutput: ""
  });

  const handleOpenAdd = () => {
    setEditingProblem(null);
    setFormData({
      title: "",
      slug: "",
      difficulty: "Easy",
      category: "Algorithms",
      points: 25,
      timeLimitMs: 1000,
      memoryLimitMb: 256,
      description: "",
      inputFormat: "",
      outputFormat: "",
      constraints: "",
      sampleInput: "",
      sampleOutput: ""
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (prob) => {
    setEditingProblem(prob);
    setFormData({ ...prob });
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showError("Please enter problem title");
      return;
    }

    if (editingProblem) {
      setProblems((prev) =>
        prev.map((p) => (p.id === editingProblem.id ? { ...p, ...formData } : p))
      );
      showSuccess("Coding problem updated ✓");
    } else {
      const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const newProb = {
        ...formData,
        slug,
        id: `prob-${Date.now()}`,
        allowedLanguages: ["c", "cpp", "java", "python", "javascript"],
        publicTestCasesCount: 2,
        hiddenTestCasesCount: 5,
        submissionsCount: 0,
        passRate: "0%"
      };
      setProblems((prev) => [newProb, ...prev]);
      showSuccess("Coding challenge published to student arena ✓");
    }
    setModalOpen(false);
  };

  const handleDelete = (id) => {
    setProblems((prev) => prev.filter((p) => p.id !== id));
    showSuccess("Problem removed from arena ✓");
  };

  const filtered = problems.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDiff = diffFilter === "ALL" || p.difficulty === diffFilter;
    return matchesSearch && matchesDiff;
  });

  const getDifficultyBadge = (diff) => {
    switch (diff) {
      case "Easy":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Easy</span>;
      case "Medium":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Medium</span>;
      case "Hard":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Hard</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Code2 className="w-6 h-6 text-[#0062A8]" />
            Placement & Technical Coding Arena Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Author algorithmic challenges, public test cases, and private hidden verification test suites.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0062A8] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Problem</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search problems by title, topic, or slug..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-xs sm:text-sm border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0062A8] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={diffFilter}
            onChange={(e) => setDiffFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200 focus:outline-none focus:bg-white"
          >
            <option value="ALL">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Table of Problems */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Problem Details</th>
                <th className="px-4 py-3.5">Difficulty</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Points</th>
                <th className="px-4 py-3.5">Test Suite</th>
                <th className="px-4 py-3.5">Submissions</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-slate-900 text-sm">{p.title}</div>
                    <div className="text-[11px] text-slate-400 font-mono">/{p.slug}</div>
                  </td>
                  <td className="px-4 py-3.5">{getDifficultyBadge(p.difficulty)}</td>
                  <td className="px-4 py-3.5 font-medium text-slate-800">{p.category}</td>
                  <td className="px-4 py-3.5 font-bold text-[#0062A8]">+{p.points} XP</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-emerald-600 font-bold">{p.publicTestCasesCount} Public</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-rose-600 font-bold flex items-center gap-0.5">
                        <Lock className="w-3 h-3" /> {p.hiddenTestCasesCount} Hidden
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">
                    <div>{p.submissionsCount} runs</div>
                    <div className="text-[10px] text-emerald-600 font-bold">Pass: {p.passRate}</div>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 text-[#0062A8] border border-slate-200"
                        title="Edit Problem"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-rose-600 border border-slate-200"
                        title="Delete Problem"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Problem Create/Edit Modal - White Mode */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-slate-800">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-[#0062A8]" />
              {editingProblem ? "Edit Coding Problem" : "Create New Coding Arena Challenge"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Problem Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Reverse Linked List"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-[#0062A8] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:bg-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Problem Description *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="State the mathematical or algorithmic problem statement clearly..."
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-[#0062A8] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Input Format</label>
                  <textarea
                    rows={2}
                    value={formData.inputFormat}
                    onChange={(e) => setFormData({ ...formData, inputFormat: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Output Format</label>
                  <textarea
                    rows={2}
                    value={formData.outputFormat}
                    onChange={(e) => setFormData({ ...formData, outputFormat: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Sample Input (Public)</label>
                  <textarea
                    rows={2}
                    value={formData.sampleInput}
                    onChange={(e) => setFormData({ ...formData, sampleInput: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 font-mono text-[11px] focus:outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Sample Output (Public)</label>
                  <textarea
                    rows={2}
                    value={formData.sampleOutput}
                    onChange={(e) => setFormData({ ...formData, sampleOutput: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 font-mono text-[11px] focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Award Points (XP)</label>
                  <input
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Time Limit (ms)</label>
                  <input
                    type="number"
                    value={formData.timeLimitMs}
                    onChange={(e) => setFormData({ ...formData, timeLimitMs: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Memory Limit (MB)</label>
                  <input
                    type="number"
                    value={formData.memoryLimitMb}
                    onChange={(e) => setFormData({ ...formData, memoryLimitMb: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0062A8] hover:bg-blue-700 text-white font-bold shadow-xs"
                >
                  {editingProblem ? "Save Changes" : "Create Challenge"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
