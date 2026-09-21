import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Code2,
  Plus,
  Trash2,
  Edit,
  Eye,
  X,
  Search,
  Lock,
  Terminal,
  Play,
  Layers,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ExternalLink,
  BookOpen,
  FileCode,
  FolderPlus,
  RefreshCw,
  Award,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { codingService } from "../../services/codingService";

export default function AdminCodingPage() {
  const { showSuccess, showError, showInfo } = useToast();

  const [tests, setTests] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [diffFilter, setDiffFilter] = useState("ALL");

  // Problem Modal
  const [problemModalOpen, setProblemModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);

  // Test / Assessment Modal
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);

  // Problem Form State
  const [problemForm, setProblemForm] = useState({
    title: "",
    slug: "",
    difficulty: "Medium",
    tags: "Algorithms, Placement",
    description: "",
    inputFormat: "Standard Input (stdin)",
    outputFormat: "Standard Output (stdout)",
    constraints: "1 <= N <= 10^5",
    points: 25,
    starterCode: {
      python: "import sys\n\ndef solution():\n    lines = sys.stdin.read().strip().split('\\n')\n    # Write your solution here\n\nif __name__ == '__main__':\n    solution()",
      javascript: "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\n// Write your solution here\n",
      cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}",
      java: "import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write solution\n    }\n}",
      c: "#include <stdio.h>\n\nint main() {\n    // Write solution\n    return 0;\n}",
    },
    publicTestCases: [
      { input: "5\n1 2 3 4 5", expectedOutput: "15", explanation: "Sum of elements" },
    ],
    hiddenTestCases: [
      { input: "3\n10 20 30", expectedOutput: "60" },
      { input: "1\n100", expectedOutput: "100" },
    ],
  });

  const [activeLangTab, setActiveLangTab] = useState("python");

  // Test Form State
  const [testForm, setTestForm] = useState({
    title: "",
    slug: "",
    description: "",
    category: "Placement",
    difficulty: "Medium",
    timeLimit: 45,
    pointsReward: 50,
    bonusPoints: 25,
    fullscreenRequired: true,
    antiCopy: true,
    antiPaste: true,
    maxViolations: 3,
  });

  // Load tests
  const loadData = async () => {
    setLoading(true);
    try {
      const list = await codingService.getAdminCodingTests();
      setTests(list);
      if (list.length > 0 && !selectedTestId) {
        setSelectedTestId(list[0]._id);
      }
    } catch (err) {
      showError("Failed to fetch coding assessments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeTest = tests.find((t) => t._id === selectedTestId) || tests[0];
  const problemsList = activeTest?.problems || [];

  const filteredProblems = problemsList.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.tags && p.tags.join(" ").toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDiff = diffFilter === "ALL" || p.difficulty === diffFilter;
    return matchesSearch && matchesDiff;
  });

  // Handle Open Problem Modal
  const handleOpenAddProblem = () => {
    if (!activeTest) {
      showError("Please select or create an assessment first.");
      return;
    }
    setEditingProblem(null);
    setProblemForm({
      title: "",
      slug: "",
      difficulty: "Medium",
      tags: "Array, Zoho",
      description: "",
      inputFormat: "Standard Input (stdin)",
      outputFormat: "Standard Output (stdout)",
      constraints: "1 <= N <= 10^5",
      points: 25,
      starterCode: {
        python: "import sys\n\ndef solution():\n    lines = sys.stdin.read().strip().split('\\n')\n    # Write your solution here\n\nif __name__ == '__main__':\n    solution()",
        javascript: "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\n// Write your solution here\n",
        cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}",
        java: "import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write solution\n    }\n}",
        c: "#include <stdio.h>\n\nint main() {\n    // Write solution\n    return 0;\n}",
      },
      publicTestCases: [
        { input: "2 7 11 15\n9", expectedOutput: "0 1", explanation: "Target pair sum" },
      ],
      hiddenTestCases: [
        { input: "3 2 4\n6", expectedOutput: "1 2" },
        { input: "3 3\n6", expectedOutput: "0 1" },
      ],
    });
    setProblemModalOpen(true);
  };

  const handleOpenEditProblem = (prob) => {
    setEditingProblem(prob);
    setProblemForm({
      title: prob.title || "",
      slug: prob.slug || "",
      difficulty: prob.difficulty || "Medium",
      tags: Array.isArray(prob.tags) ? prob.tags.join(", ") : prob.tags || "",
      description: prob.description || "",
      inputFormat: prob.inputFormat || "",
      outputFormat: prob.outputFormat || "",
      constraints: Array.isArray(prob.constraints) ? prob.constraints.join("\n") : prob.constraints || "",
      points: prob.points || 25,
      starterCode: prob.starterCode || {
        python: "",
        javascript: "",
        cpp: "",
        java: "",
        c: "",
      },
      publicTestCases: prob.publicTestCases?.length ? prob.publicTestCases : [{ input: "", expectedOutput: "", explanation: "" }],
      hiddenTestCases: prob.hiddenTestCases?.length ? prob.hiddenTestCases : [{ input: "", expectedOutput: "" }],
    });
    setProblemModalOpen(true);
  };

  const handleSaveProblem = async (e) => {
    e.preventDefault();
    if (!problemForm.title.trim()) {
      showError("Please enter a problem title");
      return;
    }

    const payload = {
      ...problemForm,
      slug: problemForm.slug || problemForm.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      tags: problemForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
      constraints: problemForm.constraints.split("\n").map((c) => c.trim()).filter(Boolean),
    };

    try {
      if (editingProblem) {
        await codingService.updateProblemInTest(activeTest._id, editingProblem._id, payload);
        showSuccess("Coding problem updated successfully ✓");
      } else {
        await codingService.addProblemToTest(activeTest._id, payload);
        showSuccess("New problem added to assessment ✓");
      }
      setProblemModalOpen(false);
      loadData();
    } catch (err) {
      showError("Failed to save problem");
    }
  };

  const handleDeleteProblem = async (problemId) => {
    if (!window.confirm("Are you sure you want to remove this problem?")) return;
    try {
      await codingService.deleteProblemFromTest(activeTest._id, problemId);
      showSuccess("Problem removed from assessment ✓");
      loadData();
    } catch (err) {
      showError("Failed to delete problem");
    }
  };

  // Test Modal Handlers
  const handleOpenAddTest = () => {
    setEditingTest(null);
    setTestForm({
      title: "",
      slug: "",
      description: "",
      category: "Placement",
      difficulty: "Medium",
      timeLimit: 45,
      pointsReward: 50,
      bonusPoints: 25,
      fullscreenRequired: true,
      antiCopy: true,
      antiPaste: true,
      maxViolations: 3,
    });
    setTestModalOpen(true);
  };

  const handleSaveTest = async (e) => {
    e.preventDefault();
    if (!testForm.title.trim()) {
      showError("Please enter an assessment title");
      return;
    }

    const payload = {
      ...testForm,
      slug: testForm.slug || testForm.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      settings: {
        fullscreenRequired: testForm.fullscreenRequired,
        antiCopy: testForm.antiCopy,
        antiPaste: testForm.antiPaste,
        maxViolations: Number(testForm.maxViolations) || 3,
        autoSubmitOnViolation: true,
      },
      problems: [],
    };

    try {
      if (editingTest) {
        await codingService.updateCodingTest(editingTest._id, payload);
        showSuccess("Assessment updated successfully ✓");
      } else {
        const created = await codingService.createCodingTest(payload);
        showSuccess("New coding assessment created ✓");
        setSelectedTestId(created._id);
      }
      setTestModalOpen(false);
      loadData();
    } catch (err) {
      showError("Failed to save coding assessment");
    }
  };

  const handleDeleteTest = async (testId) => {
    if (!window.confirm("Are you sure you want to delete this assessment and all its problems?")) return;
    try {
      await codingService.deleteCodingTest(testId);
      showSuccess("Assessment deleted ✓");
      setSelectedTestId("");
      loadData();
    } catch (err) {
      showError("Failed to delete assessment");
    }
  };

  // Helper for test case manipulation
  const addPublicTestCase = () => {
    setProblemForm((prev) => ({
      ...prev,
      publicTestCases: [...prev.publicTestCases, { input: "", expectedOutput: "", explanation: "" }],
    }));
  };

  const removePublicTestCase = (idx) => {
    setProblemForm((prev) => ({
      ...prev,
      publicTestCases: prev.publicTestCases.filter((_, i) => i !== idx),
    }));
  };

  const updatePublicTestCase = (idx, field, val) => {
    setProblemForm((prev) => {
      const updated = [...prev.publicTestCases];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...prev, publicTestCases: updated };
    });
  };

  const addHiddenTestCase = () => {
    setProblemForm((prev) => ({
      ...prev,
      hiddenTestCases: [...prev.hiddenTestCases, { input: "", expectedOutput: "" }],
    }));
  };

  const removeHiddenTestCase = (idx) => {
    setProblemForm((prev) => ({
      ...prev,
      hiddenTestCases: prev.hiddenTestCases.filter((_, i) => i !== idx),
    }));
  };

  const updateHiddenTestCase = (idx, field, val) => {
    setProblemForm((prev) => {
      const updated = [...prev.hiddenTestCases];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...prev, hiddenTestCases: updated };
    });
  };

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
      {/* 1. Top Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0062A8] text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Faculty & Educator Control Center</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Code2 className="w-6 h-6 text-[#0062A8]" />
            Teacher Coding Customization & Assessment Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Author algorithmic challenges, configure starter code templates in 5 languages, and design hidden verification suites.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/coding"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            <span>Preview Student Arena</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <button
            onClick={handleOpenAddTest}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-all cursor-pointer shadow-sm"
          >
            <FolderPlus className="w-4 h-4" />
            <span>New Assessment</span>
          </button>

          <button
            onClick={handleOpenAddProblem}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Coding Problem</span>
          </button>
        </div>
      </div>

      {/* 2. Assessment Track Switcher Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
            Active Assessment Track
          </span>
          <button
            onClick={loadData}
            className="text-xs text-[#0062A8] font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {tests.map((t) => {
            const isSelected = (activeTest?._id === t._id) || (activeTest?.slug === t.slug);
            return (
              <div
                key={t._id}
                className={`group flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#0B4A8F] text-white border-[#0B4A8F] shadow-sm"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
                onClick={() => setSelectedTestId(t._id)}
              >
                <span>{t.title}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {t.problems?.length || 0} Probs
                </span>
                {isSelected && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTest(t._id);
                    }}
                    className="ml-1 opacity-70 hover:opacity-100 text-rose-300 hover:text-rose-100 p-0.5 rounded"
                    title="Delete Track"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Search & Filters Bar */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search problems by title, tags (Zoho, Array, DP), or description..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-2xl text-xs sm:text-sm border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0062A8] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={diffFilter}
            onChange={(e) => setDiffFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 rounded-2xl text-xs font-bold text-slate-700 border border-slate-200 focus:outline-none focus:bg-white cursor-pointer"
          >
            <option value="ALL">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      {/* 4. Table of Customized Problems */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Problem Details</th>
                <th className="px-4 py-3.5">Difficulty</th>
                <th className="px-4 py-3.5">Tags / Company</th>
                <th className="px-4 py-3.5">Points</th>
                <th className="px-4 py-3.5">Verification Suites</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProblems.length > 0 ? (
                filteredProblems.map((p) => (
                  <tr key={p._id || p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 text-sm">{p.title}</div>
                      <div className="text-[11px] text-slate-400 font-mono">/{p.slug || p._id}</div>
                    </td>
                    <td className="px-4 py-4">{getDifficultyBadge(p.difficulty)}</td>
                    <td className="px-4 py-4 font-medium text-slate-800">
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(p.tags) ? p.tags : [p.tags]).filter(Boolean).map((tg, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                            {tg}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 font-bold text-[#0062A8]">
                      +{p.points || 25} XP
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {p.publicTestCases?.length || 1} Public Cases
                        </span>
                        <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> {p.hiddenTestCases?.length || 2} Hidden Cases
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditProblem(p)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-[#0062A8] transition-colors cursor-pointer"
                          title="Edit Problem & Test Cases"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProblem(p._id || p.id)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                          title="Delete Problem"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <Code2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No problems found in this assessment.</p>
                    <p className="text-xs text-slate-400 mt-1">Click "Create Coding Problem" to author challenges for your students.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Create / Edit Problem Customization Modal */}
      {problemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto text-slate-800 space-y-6">
            <button
              onClick={() => setProblemModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-100 pb-4">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#0062A8]">
                Problem Authoring Suite
              </span>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 mt-0.5">
                <Code2 className="w-5 h-5 text-[#0062A8]" />
                {editingProblem ? "Edit Coding Challenge & Test Cases" : "Create New Custom Coding Challenge"}
              </h2>
            </div>

            <form onSubmit={handleSaveProblem} className="space-y-6 text-xs">
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">Challenge Title *</label>
                  <input
                    type="text"
                    required
                    value={problemForm.title}
                    onChange={(e) => setProblemForm({ ...problemForm, title: e.target.value })}
                    placeholder="e.g. Subarray with Given Sum"
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-[#0062A8] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Difficulty Level</label>
                  <select
                    value={problemForm.difficulty}
                    onChange={(e) => setProblemForm({ ...problemForm, difficulty: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 font-bold focus:outline-none focus:bg-white cursor-pointer"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tags / Companies (Comma separated)</label>
                  <input
                    type="text"
                    value={problemForm.tags}
                    onChange={(e) => setProblemForm({ ...problemForm, tags: e.target.value })}
                    placeholder="e.g. Arrays, Sliding Window, Zoho, Amazon"
                    className="w-full px-3.5 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Award XP Points</label>
                  <input
                    type="number"
                    value={problemForm.points}
                    onChange={(e) => setProblemForm({ ...problemForm, points: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              {/* Problem Description */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Problem Statement / Description *</label>
                <textarea
                  rows={4}
                  required
                  value={problemForm.description}
                  onChange={(e) => setProblemForm({ ...problemForm, description: e.target.value })}
                  placeholder="Explain the algorithmic problem, input constraints, and expectations in detail..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 leading-relaxed focus:outline-none focus:border-[#0062A8] focus:bg-white"
                />
              </div>

              {/* Input / Output & Constraints */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Input Format</label>
                  <textarea
                    rows={2}
                    value={problemForm.inputFormat}
                    onChange={(e) => setProblemForm({ ...problemForm, inputFormat: e.target.value })}
                    placeholder="e.g. First line contains N. Second line contains N integers."
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Output Format</label>
                  <textarea
                    rows={2}
                    value={problemForm.outputFormat}
                    onChange={(e) => setProblemForm({ ...problemForm, outputFormat: e.target.value })}
                    placeholder="e.g. Print space-separated starting and ending indices."
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Constraints (1 per line)</label>
                  <textarea
                    rows={2}
                    value={problemForm.constraints}
                    onChange={(e) => setProblemForm({ ...problemForm, constraints: e.target.value })}
                    placeholder="1 <= N <= 10^5&#10;1 <= Arr[i] <= 10^9"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              {/* Multi-Language Starter Code Editor */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-blue-400" />
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
                      Starter Code Templates by Language
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {["python", "javascript", "cpp", "java", "c"].map((lng) => (
                      <button
                        key={lng}
                        type="button"
                        onClick={() => setActiveLangTab(lng)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          activeLangTab === lng
                            ? "bg-blue-600 text-white"
                            : "text-slate-400 hover:text-white hover:bg-slate-800"
                        }`}
                      >
                        {lng.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  rows={6}
                  value={problemForm.starterCode?.[activeLangTab] || ""}
                  onChange={(e) =>
                    setProblemForm((prev) => ({
                      ...prev,
                      starterCode: {
                        ...prev.starterCode,
                        [activeLangTab]: e.target.value,
                      },
                    }))
                  }
                  className="w-full p-3 bg-slate-950 font-mono text-xs text-slate-100 rounded-xl border border-slate-800 focus:outline-none"
                  placeholder={`Provide boilerplate starter code for ${activeLangTab}...`}
                />
              </div>

              {/* Public Test Cases Builder */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <Eye className="w-4 h-4 text-emerald-600" />
                    <span>Public Test Cases (Visible to Students during Run Code)</span>
                  </div>
                  <button
                    type="button"
                    onClick={addPublicTestCase}
                    className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Public Case</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {problemForm.publicTestCases.map((tc, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-xl border border-emerald-200 space-y-2 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-emerald-700">
                          Public Test Case #{idx + 1}
                        </span>
                        {problemForm.publicTestCases.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePublicTestCase(idx)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold">Input:</span>
                          <textarea
                            rows={2}
                            value={tc.input}
                            onChange={(e) => updatePublicTestCase(idx, "input", e.target.value)}
                            placeholder="Stdin input"
                            className="w-full p-2 bg-slate-50 font-mono text-xs rounded-lg border border-slate-200"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold">Expected Output:</span>
                          <textarea
                            rows={2}
                            value={tc.expectedOutput}
                            onChange={(e) => updatePublicTestCase(idx, "expectedOutput", e.target.value)}
                            placeholder="Stdout output"
                            className="w-full p-2 bg-slate-50 font-mono text-xs rounded-lg border border-slate-200"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hidden Test Cases Builder */}
              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-800 font-bold">
                    <Lock className="w-4 h-4 text-rose-600" />
                    <span>Hidden Test Cases (Private server-side evaluation suite)</span>
                  </div>
                  <button
                    type="button"
                    onClick={addHiddenTestCase}
                    className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Hidden Case</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {problemForm.hiddenTestCases.map((tc, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-xl border border-rose-200 space-y-2 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-rose-700">
                          Hidden Test Case #{idx + 1}
                        </span>
                        {problemForm.hiddenTestCases.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeHiddenTestCase(idx)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold">Input:</span>
                          <textarea
                            rows={2}
                            value={tc.input}
                            onChange={(e) => updateHiddenTestCase(idx, "input", e.target.value)}
                            placeholder="Stdin input"
                            className="w-full p-2 bg-slate-50 font-mono text-xs rounded-lg border border-slate-200"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold">Expected Output:</span>
                          <textarea
                            rows={2}
                            value={tc.expectedOutput}
                            onChange={(e) => updateHiddenTestCase(idx, "expectedOutput", e.target.value)}
                            placeholder="Stdout output"
                            className="w-full p-2 bg-slate-50 font-mono text-xs rounded-lg border border-slate-200"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setProblemModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  {editingProblem ? "Save Problem & Test Suites" : "Publish Problem to Arena"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Create / Edit Assessment Track Modal */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto text-slate-800 space-y-5">
            <button
              onClick={() => setTestModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#0062A8]">
                Assessment Customization
              </span>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 mt-0.5">
                <FolderPlus className="w-5 h-5 text-[#0062A8]" />
                Create New Coding Assessment Track
              </h2>
            </div>

            <form onSubmit={handleSaveTest} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Assessment Track Title *</label>
                <input
                  type="text"
                  required
                  value={testForm.title}
                  onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
                  placeholder="e.g. CSE 3rd Sem Python Lab Assessment"
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-[#0062A8] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={testForm.description}
                  onChange={(e) => setTestForm({ ...testForm, description: e.target.value })}
                  placeholder="Recruitment / Laboratory practical assessment..."
                  className="w-full px-3.5 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Category</label>
                  <select
                    value={testForm.category}
                    onChange={(e) => setTestForm({ ...testForm, category: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:bg-white cursor-pointer"
                  >
                    <option value="Placement">Placement</option>
                    <option value="Laboratory">Laboratory Assessment</option>
                    <option value="Data Structures">Data Structures & Algo</option>
                    <option value="Web Technologies">Web Technologies</option>
                    <option value="Daily Challenge">Daily Challenge</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Time Limit (Minutes)</label>
                  <input
                    type="number"
                    value={testForm.timeLimit}
                    onChange={(e) => setTestForm({ ...testForm, timeLimit: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              {/* Proctoring Settings */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 text-xs block mb-1">Proctoring & Anti-Cheat Settings</span>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={testForm.fullscreenRequired}
                      onChange={(e) => setTestForm({ ...testForm, fullscreenRequired: e.target.checked })}
                      className="rounded text-blue-600"
                    />
                    <span>Fullscreen Required</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={testForm.antiCopy}
                      onChange={(e) => setTestForm({ ...testForm, antiCopy: e.target.checked })}
                      className="rounded text-blue-600"
                    />
                    <span>Anti-Copy / Paste</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setTestModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#0062A8] hover:bg-blue-700 text-white font-black shadow-sm cursor-pointer"
                >
                  Create Assessment Track
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
