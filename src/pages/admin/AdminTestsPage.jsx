import React, { useState } from "react";
import {
  Activity,
  Plus,
  Trash2,
  Edit,
  ShieldAlert,
  Clock,
  CheckCircle2,
  X,
  FileQuestion,
  Sparkles,
  Sliders,
  AlertTriangle,
  Eye,
  Search,
  Lock,
  Copy,
  Maximize
} from "lucide-react";
import { useToast } from "../../context/ToastContext";

const INITIAL_TESTS = [];

const TEST_TYPES = ["All Types", "Daily Test", "PrepZone Test", "MCQ Test", "Coding Test", "Mixed Test"];

export default function AdminTestsPage() {
  const { showSuccess, showError } = useToast();
  const [tests, setTests] = useState(INITIAL_TESTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    type: "Daily Test",
    department: "All Departments",
    subject: "",
    durationMinutes: 15,
    totalMarks: 20,
    passingScore: 12,
    fullscreenRequired: true,
    antiCopy: true,
    antiPaste: true,
    tabSwitchDetection: true,
    windowBlurDetection: true,
    autoSubmit: true,
    maxViolations: 3
  });

  const handleOpenAdd = () => {
    setEditingTest(null);
    setFormData({
      title: "",
      type: "Daily Test",
      department: "All Departments",
      subject: "General Technical",
      durationMinutes: 15,
      totalMarks: 20,
      passingScore: 12,
      fullscreenRequired: true,
      antiCopy: true,
      antiPaste: true,
      tabSwitchDetection: true,
      windowBlurDetection: true,
      autoSubmit: true,
      maxViolations: 3
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (test) => {
    setEditingTest(test);
    setFormData({
      title: test.title,
      type: test.type,
      department: test.department,
      subject: test.subject,
      durationMinutes: test.durationMinutes,
      totalMarks: test.totalMarks,
      passingScore: test.passingScore,
      fullscreenRequired: test.settings.fullscreenRequired,
      antiCopy: test.settings.antiCopy,
      antiPaste: test.settings.antiPaste,
      tabSwitchDetection: test.settings.tabSwitchDetection,
      windowBlurDetection: test.settings.windowBlurDetection,
      autoSubmit: test.settings.autoSubmit,
      maxViolations: test.settings.maxViolations
    });
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showError("Please enter test title");
      return;
    }

    const testPayload = {
      title: formData.title,
      type: formData.type,
      department: formData.department,
      subject: formData.subject,
      durationMinutes: Number(formData.durationMinutes),
      totalMarks: Number(formData.totalMarks),
      passingScore: Number(formData.passingScore),
      questionsCount: 10,
      settings: {
        fullscreenRequired: formData.fullscreenRequired,
        antiCopy: formData.antiCopy,
        antiPaste: formData.antiPaste,
        tabSwitchDetection: formData.tabSwitchDetection,
        windowBlurDetection: formData.windowBlurDetection,
        autoSubmit: formData.autoSubmit,
        maxViolations: Number(formData.maxViolations)
      }
    };

    if (editingTest) {
      setTests((prev) =>
        prev.map((t) => (t.id === editingTest.id ? { ...t, ...testPayload } : t))
      );
      showSuccess("Test configuration updated ✓");
    } else {
      const newTest = {
        ...testPayload,
        id: `test-${Date.now()}`,
        attemptsCount: 0,
        avgScore: "N/A",
        isActive: true
      };
      setTests((prev) => [newTest, ...prev]);
      showSuccess("New assessment scheduled and published to student test hub ✓");
    }
    setModalOpen(false);
  };

  const handleToggleActive = (test) => {
    setTests((prev) =>
      prev.map((t) => (t.id === test.id ? { ...t, isActive: !t.isActive } : t))
    );
    showSuccess(
      test.isActive ? `Test has been disabled.` : `Test activated for students ✓`
    );
  };

  const handleDelete = (id) => {
    setTests((prev) => prev.filter((t) => t.id !== id));
    showSuccess("Test deleted from repository ✓");
  };

  const filtered = tests.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "All Types" || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#0062A8]" />
            Assessment & Proctored Test Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure MCQ, coding, and placement exams with strict proctoring, anti-cheat locks, and auto-submit rules.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0062A8] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Assessment</span>
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
            placeholder="Search assessments by test title or subject..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-xs sm:text-sm border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0062A8] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200 focus:outline-none focus:bg-white"
          >
            {TEST_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Test Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((test) => (
          <div
            key={test.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all space-y-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 text-[10px] font-bold bg-blue-50 text-[#0062A8] border border-blue-200 rounded-full">
                  {test.type}
                </span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    test.isActive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  {test.isActive ? "Active" : "Closed"}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                {test.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {test.department} • {test.subject}
              </p>

              {/* Exam Rules Pill Icons */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {test.settings.fullscreenRequired && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-800 rounded text-[10px] border border-amber-200 font-mono">
                    <Maximize className="w-3 h-3 text-amber-600" /> Fullscreen
                  </span>
                )}
                {test.settings.tabSwitchDetection && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-800 rounded text-[10px] border border-rose-200 font-mono">
                    <ShieldAlert className="w-3 h-3 text-rose-600" /> Tab-Lock ({test.settings.maxViolations} strikes)
                  </span>
                )}
                {test.settings.antiCopy && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-800 rounded text-[10px] border border-blue-200 font-mono">
                    <Lock className="w-3 h-3 text-[#0062A8]" /> Anti-Copy
                  </span>
                )}
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 mt-3 text-center">
                <div>
                  <span className="text-slate-500 text-[10px]">Duration</span>
                  <p className="font-bold text-slate-900 text-xs">{test.durationMinutes}m</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Pass Mark</span>
                  <p className="font-bold text-emerald-600 text-xs">{test.passingScore}/{test.totalMarks}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Attempts</span>
                  <p className="font-bold text-[#0062A8] text-xs">{test.attemptsCount}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(test)}
                  className="p-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 text-[#0062A8] border border-slate-200"
                  title="Configure"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(test.id)}
                  className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-rose-600 border border-slate-200"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => handleToggleActive(test)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  test.isActive
                    ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                    : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                }`}
              >
                {test.isActive ? "Close Test" : "Activate"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Create / Edit Test - White Mode */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-slate-800">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#0062A8]" />
              {editingTest ? "Configure Assessment Settings" : "Create New Proctored Assessment"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Assessment Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Daily Technical MCQ Challenge #15"
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-[#0062A8] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Test Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:bg-white"
                  >
                    {TEST_TYPES.filter((t) => t !== "All Types").map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Target Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Total Marks</label>
                  <input
                    type="number"
                    value={formData.totalMarks}
                    onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Passing Score</label>
                  <input
                    type="number"
                    value={formData.passingScore}
                    onChange={(e) => setFormData({ ...formData, passingScore: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              {/* Anti-Cheat Proctoring Rules Box */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-[#0062A8] flex items-center gap-2 text-xs">
                  <ShieldAlert className="w-4 h-4 text-[#0062A8]" />
                  Anti-Cheat & Exam-Mode Proctoring Controls
                </h4>

                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.fullscreenRequired}
                      onChange={(e) => setFormData({ ...formData, fullscreenRequired: e.target.checked })}
                      className="rounded accent-[#0062A8]"
                    />
                    <span>Fullscreen Required</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.antiCopy}
                      onChange={(e) => setFormData({ ...formData, antiCopy: e.target.checked })}
                      className="rounded accent-[#0062A8]"
                    />
                    <span>Anti-Copy Lock</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.antiPaste}
                      onChange={(e) => setFormData({ ...formData, antiPaste: e.target.checked })}
                      className="rounded accent-[#0062A8]"
                    />
                    <span>Anti-Paste Lock</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.tabSwitchDetection}
                      onChange={(e) => setFormData({ ...formData, tabSwitchDetection: e.target.checked })}
                      className="rounded accent-[#0062A8]"
                    />
                    <span>Tab-Switch Detection</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.windowBlurDetection}
                      onChange={(e) => setFormData({ ...formData, windowBlurDetection: e.target.checked })}
                      className="rounded accent-[#0062A8]"
                    />
                    <span>Window Blur Detection</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.autoSubmit}
                      onChange={(e) => setFormData({ ...formData, autoSubmit: e.target.checked })}
                      className="rounded accent-[#0062A8]"
                    />
                    <span>Auto-Submit on Max Strikes</span>
                  </label>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                  <span className="text-slate-600">Maximum Allowed Violations:</span>
                  <select
                    value={formData.maxViolations}
                    onChange={(e) => setFormData({ ...formData, maxViolations: Number(e.target.value) })}
                    className="px-3 py-1 bg-white rounded-lg border border-slate-300 text-slate-900 font-bold"
                  >
                    <option value={1}>1 (Strict: Instant Auto-Submit)</option>
                    <option value={2}>2 (1 Warning → Auto-Submit)</option>
                    <option value={3}>3 (2 Warnings → Auto-Submit)</option>
                    <option value={5}>5 (Lenient)</option>
                  </select>
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
                  {editingTest ? "Save Changes" : "Create Assessment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
