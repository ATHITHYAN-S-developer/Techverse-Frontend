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
  Building2,
  GraduationCap,
  Globe,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Hash,
  Sliders,
  Cpu,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { codingService } from "../../services/codingService";
import { departmentService } from "../../services/departmentService";

const DEFAULT_DEPARTMENTS = [
  { code: "CSE", name: "Computer Science & Engineering" },
  { code: "ECE", name: "Electronics & Communication Engineering" },
  { code: "EEE", name: "Electrical & Electronics Engineering" },
  { code: "IT", name: "Information Technology" },
  { code: "AIDS", name: "Artificial Intelligence & Data Science" },
  { code: "AIML", name: "Artificial Intelligence & Machine Learning" },
  { code: "MECH", name: "Mechanical Engineering" },
  { code: "MDE", name: "Medical Electronics" },
  { code: "BME", name: "Biomedical Engineering" },
  { code: "CYS", name: "Cyber Security" },
];

const SUGGESTED_TAGS = [
  "Arrays",
  "Strings",
  "Two Pointers",
  "Sliding Window",
  "Hash Map",
  "Binary Search",
  "Recursion",
  "Dynamic Programming",
  "Trees",
  "Graphs",
  "Zoho",
  "TCS NQT",
  "Infosys",
  "Amazon",
  "Wipro",
];

const BOILERPLATE_PRESETS = {
  python: `import sys

def solution():
    # Read entire input from stdin
    lines = sys.stdin.read().strip().split('\\n')
    if not lines or not lines[0]:
        return
    # Write your solution logic here
    print(lines[0])

if __name__ == '__main__':
    solution()`,
  javascript: `const fs = require('fs');

function solve() {
    // Read all input from stdin
    const input = fs.readFileSync(0, 'utf-8').trim().split('\\n');
    if (!input.length || !input[0]) return;
    // Write your solution logic here
    console.log(input[0]);
}

solve();`,
  cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    // Write your solution here
    return 0;
}`,
  java: `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Write your solution here
    }
}`,
  c: `#include <stdio.h>
#include <stdlib.h>

int main() {
    // Write your solution here
    return 0;
}`,
};

export default function AdminCodingPage() {
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const [tests, setTests] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [diffFilter, setDiffFilter] = useState("ALL");
  const [departments, setDepartments] = useState(DEFAULT_DEPARTMENTS);

  // Problem Modal
  const [problemModalOpen, setProblemModalOpen] = useState(false);
  const [problemModalTab, setProblemModalTab] = useState("overview"); // "overview" | "specs" | "code" | "tests"
  const [editingProblem, setEditingProblem] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [testSuiteTab, setTestSuiteTab] = useState("public"); // "public" | "hidden"

  // Preview Modal
  const [previewProblem, setPreviewProblem] = useState(null);

  // Test / Assessment Modal
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);

  // Problem Form State
  const [problemForm, setProblemForm] = useState({
    title: "",
    slug: "",
    difficulty: "Medium",
    timeLimit: "",
    tags: "Array, Zoho",
    description: "",
    inputFormat: "First line contains N. Second line contains N space-separated integers.",
    outputFormat: "Print the required result to standard output.",
    constraints: "1 <= N <= 10^5\n1 <= Arr[i] <= 10^9",
    starterCode: { ...BOILERPLATE_PRESETS },
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
    fullscreenRequired: true,
    antiCopy: true,
    antiPaste: true,
    maxViolations: 3,
    targetAudience: "all",
    department: "ALL",
    departmentId: "",
    departmentName: "All VCETians",
  });

  useEffect(() => {
    departmentService
      .getAllDepartments()
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          setDepartments(res);
        }
      })
      .catch(() => {});
  }, []);

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
    setProblemModalTab("overview");
    setTestSuiteTab("public");
    setProblemForm({
      title: "",
      slug: "",
      difficulty: "Medium",
      timeLimit: "",
      tags: "Array, Zoho",
      description: "",
      inputFormat: "First line contains N. Second line contains N space-separated integers.",
      outputFormat: "Print the required output to standard output.",
      constraints: "1 <= N <= 10^5\n1 <= Arr[i] <= 10^9",
      starterCode: { ...BOILERPLATE_PRESETS },
      publicTestCases: [
        { input: "5\n1 2 3 4 5", expectedOutput: "15", explanation: "Sum of elements" },
      ],
      hiddenTestCases: [
        { input: "3\n10 20 30", expectedOutput: "60" },
        { input: "1\n100", expectedOutput: "100" },
      ],
    });
    setProblemModalOpen(true);
  };

  const handleOpenEditProblem = (prob) => {
    setEditingProblem(prob);
    setProblemModalTab("overview");
    setTestSuiteTab("public");
    setProblemForm({
      title: prob.title || "",
      slug: prob.slug || "",
      difficulty: prob.difficulty || "Medium",
      timeLimit: prob.timeLimit ? String(prob.timeLimit) : "",
      tags: Array.isArray(prob.tags) ? prob.tags.join(", ") : prob.tags || "",
      description: prob.description || "",
      inputFormat: prob.inputFormat || "",
      outputFormat: prob.outputFormat || "",
      constraints: Array.isArray(prob.constraints) ? prob.constraints.join("\n") : prob.constraints || "",
      starterCode: prob.starterCode || { ...BOILERPLATE_PRESETS },
      publicTestCases: prob.publicTestCases?.length ? prob.publicTestCases : [{ input: "", expectedOutput: "", explanation: "" }],
      hiddenTestCases: prob.hiddenTestCases?.length ? prob.hiddenTestCases : [{ input: "", expectedOutput: "" }],
    });
    setProblemModalOpen(true);
  };

  const handleSaveProblem = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!problemForm.title.trim()) {
      showError("Please enter a problem title");
      setProblemModalTab("overview");
      return;
    }
    if (!problemForm.description.trim()) {
      showError("Please provide a problem statement / description");
      setProblemModalTab("specs");
      return;
    }

    const payload = {
      ...problemForm,
      timeLimit: problemForm.timeLimit && Number(problemForm.timeLimit) > 0 ? Number(problemForm.timeLimit) : null,
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
    const userDept = user?.departmentCode || user?.department || "CSE";
    const foundDept = departments.find((d) => d.code === userDept);
    setTestForm({
      title: "",
      slug: "",
      description: "",
      category: "Placement",
      difficulty: "Medium",
      timeLimit: 45,
      fullscreenRequired: true,
      antiCopy: true,
      antiPaste: true,
      maxViolations: 3,
      targetAudience: "all",
      department: userDept,
      departmentId: foundDept?._id || "",
      departmentName: foundDept?.name || "All VCETians",
    });
    setTestModalOpen(true);
  };

  const handleOpenEditTest = (t) => {
    setEditingTest(t);
    const isDept = t.targetAudience === "department" || (t.department && t.department !== "ALL");
    const deptCode = t.department || user?.departmentCode || "CSE";
    const foundDept = departments.find((d) => d.code === deptCode);
    setTestForm({
      title: t.title || "",
      slug: t.slug || "",
      description: t.description || "",
      category: t.category || "Placement",
      difficulty: t.difficulty || "Medium",
      timeLimit: t.timeLimit || 45,
      fullscreenRequired: t.settings?.fullscreenRequired !== false,
      antiCopy: t.settings?.antiCopy !== false,
      antiPaste: t.settings?.antiPaste !== false,
      maxViolations: t.settings?.maxViolations || 3,
      targetAudience: isDept ? "department" : "all",
      department: deptCode,
      departmentId: t.departmentId || foundDept?._id || "",
      departmentName: t.departmentName || foundDept?.name || "All VCETians",
    });
    setTestModalOpen(true);
  };

  const handleSaveTest = async (e) => {
    e.preventDefault();
    if (!testForm.title.trim()) {
      showError("Please enter an assessment title");
      return;
    }

    const isDept = testForm.targetAudience === "department";
    const chosenDeptCode = isDept ? testForm.department : "ALL";
    const chosenDeptObj = departments.find((d) => d.code === chosenDeptCode);

    const payload = {
      ...testForm,
      slug: testForm.slug || testForm.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      targetAudience: isDept ? "department" : "all",
      department: chosenDeptCode,
      departmentId: isDept ? (testForm.departmentId || chosenDeptObj?._id || null) : null,
      departmentName: isDept ? (chosenDeptObj?.name || chosenDeptCode) : "All VCETians",
      settings: {
        fullscreenRequired: testForm.fullscreenRequired,
        antiCopy: testForm.antiCopy,
        antiPaste: testForm.antiPaste,
        maxViolations: Number(testForm.maxViolations) || 3,
        autoSubmitOnViolation: true,
      },
      problems: editingTest?.problems || [],
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

  // Tag Helpers
  const handleAddSuggestedTag = (tag) => {
    const existing = problemForm.tags.split(",").map((t) => t.trim()).filter(Boolean);
    if (!existing.includes(tag)) {
      setProblemForm({ ...problemForm, tags: [...existing, tag].join(", ") });
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const existing = problemForm.tags.split(",").map((t) => t.trim()).filter(Boolean);
    setProblemForm({
      ...problemForm,
      tags: existing.filter((t) => t !== tagToRemove).join(", "),
    });
  };

  const getDifficultyBadge = (diff) => {
    switch (diff) {
      case "Easy":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Easy
          </span>
        );
      case "Medium":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Medium
          </span>
        );
      case "Hard":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            Hard
          </span>
        );
      default:
        return null;
    }
  };

  const totalPublicCases = problemsList.reduce((acc, p) => acc + (p.publicTestCases?.length || 0), 0);
  const totalHiddenCases = problemsList.reduce((acc, p) => acc + (p.hiddenTestCases?.length || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-800 pb-16">
      {/* 1. Ultra-Modern Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 p-6 sm:p-8 text-white shadow-xl overflow-hidden">
        {/* Glow orb decorations */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-sky-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>VCET Algorithmic Assessment Studio v2.4</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Code2 className="w-7 h-7 text-sky-400" />
              <span>Faculty Coding Engineering Studio</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Design enterprise coding challenges, configure starter code templates in 5 programming languages, and build hidden verification test suites for automated student proctoring.
            </p>

            {/* Quick Metrics Chips */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-200">
                <Hash className="w-3.5 h-3.5 text-sky-400" />
                <span>{problemsList.length} Challenges</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{totalPublicCases + totalHiddenCases} Verification Test Cases</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-200">
                {activeTest?.targetAudience === "department" && activeTest?.department !== "ALL" ? (
                  <>
                    <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                    <span>{activeTest.department} Department Restricted</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-3.5 h-3.5 text-blue-400" />
                    <span>Open to All VCETians</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleOpenAddTest}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs backdrop-blur-md transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <FolderPlus className="w-4 h-4 text-sky-300" />
              <span>New Assessment Track</span>
            </button>

            <button
              onClick={handleOpenAddProblem}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-black text-xs shadow-lg shadow-blue-500/25 active:scale-95 transition-all cursor-pointer border border-blue-400/30"
            >
              <Plus className="w-4 h-4" />
              <span>Create Coding Problem</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Assessment Track Switcher Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-vcet-blue" />
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">
              Active Assessment Tracks ({tests.length})
            </span>
          </div>
          <button
            onClick={loadData}
            className="text-xs text-vcet-blue font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {tests.map((t) => {
            const isSelected = activeTest?._id === t._id || activeTest?.slug === t.slug;
            const isDept = t.targetAudience === "department" && t.department && t.department !== "ALL";
            return (
              <div
                key={t._id}
                className={`group flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-blue-500/40"
                    : "bg-slate-50 text-slate-700 border-slate-200/90 hover:bg-slate-100 hover:border-slate-300"
                }`}
                onClick={() => setSelectedTestId(t._id)}
              >
                <span>{t.title}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : isDept
                      ? "bg-purple-100 text-purple-700 border border-purple-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  {isDept ? `${t.department} Only` : "All VCET"}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isSelected ? "bg-white/15 text-slate-200" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {t.problems?.length || 0} Probs
                </span>
                {isSelected && (
                  <div className="flex items-center gap-1 ml-1 border-l border-white/20 pl-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditTest(t);
                      }}
                      className="opacity-75 hover:opacity-100 text-sky-300 hover:text-white p-1 rounded hover:bg-white/10 cursor-pointer"
                      title="Edit Track & Scope"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTest(t._id);
                      }}
                      className="opacity-75 hover:opacity-100 text-rose-300 hover:text-rose-100 p-1 rounded hover:bg-white/10 cursor-pointer"
                      title="Delete Track"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          <button
            onClick={handleOpenAddTest}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-dashed border-slate-300 text-slate-600 hover:text-vcet-blue hover:border-vcet-blue hover:bg-blue-50/50 text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Track</span>
          </button>
        </div>
      </div>

      {/* 3. Search & Filters Bar */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search problems by title, tags (Zoho, Array, DP), or description..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50/80 rounded-2xl text-xs sm:text-sm border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-vcet-blue focus:bg-white transition-all outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {["ALL", "Easy", "Medium", "Hard"].map((d) => (
            <button
              key={d}
              onClick={() => setDiffFilter(d)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                diffFilter === d
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {d === "ALL" ? "All Levels" : d}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Problems Studio Table */}
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-slate-900">Challenges in Track:</span>
            <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-vcet-blue text-xs font-black">
              {activeTest?.title || "Default Track"}
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            Showing {filteredProblems.length} of {problemsList.length} problems
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="px-6 py-4">Challenge & Identifier</th>
                <th className="px-4 py-4">Difficulty</th>
                <th className="px-4 py-4">Topic / Companies</th>
                <th className="px-4 py-4">Verification Suites</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProblems.length > 0 ? (
                filteredProblems.map((p) => (
                  <tr key={p._id || p.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm group-hover:text-vcet-blue transition-colors">
                        {p.title}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                        <span>/{p.slug || p._id}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        {getDifficultyBadge(p.difficulty)}
                        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                          <Clock className="w-3 h-3 text-vcet-blue" />
                          <span>{p.timeLimit ? `${p.timeLimit} Mins` : `${activeTest?.timeLimit || 45} Mins`}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-800">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(Array.isArray(p.tags) ? p.tags : [p.tags]).filter(Boolean).map((tg, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold border border-slate-200/70"
                          >
                            {tg}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                          <Eye className="w-3 h-3 text-emerald-600" />
                          <span>{p.publicTestCases?.length || 1} Public</span>
                        </span>
                        <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-rose-600" />
                          <span>{p.hiddenTestCases?.length || 2} Hidden</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewProblem(p)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-vcet-blue transition-colors cursor-pointer"
                          title="Preview Problem & Test Cases"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditProblem(p)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-vcet-blue transition-colors cursor-pointer"
                          title="Edit Challenge"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProblem(p._id || p.id)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete Challenge"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-slate-400">
                    <Code2 className="w-12 h-12 mx-auto text-slate-300 mb-2 stroke-[1.5]" />
                    <p className="font-bold text-slate-700 text-sm">No coding challenges found in this track.</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Click the "Create Coding Problem" button above to author your first algorithmic challenge with custom test suites.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          5. ULTRA-ADVANCED PROBLEM AUTHORING SUITE MODAL
          ========================================================================= */}
      {problemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-white border border-slate-200/90 rounded-3xl w-full max-w-5xl shadow-2xl relative max-h-[92vh] flex flex-col overflow-hidden text-slate-800">
            {/* Modal Header */}
            <div className="px-6 sm:px-8 py-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-vcet-blue px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200">
                    Challenge Authoring Studio
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500 font-semibold truncate max-w-xs">
                    Target Track: <strong className="text-slate-800">{activeTest?.title}</strong>
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-vcet-blue" />
                  <span>{editingProblem ? "Edit Coding Challenge & Test Suites" : "Create New Custom Coding Challenge"}</span>
                </h2>
              </div>

              <button
                onClick={() => setProblemModalOpen(false)}
                className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Workflow Navigation Tabs */}
            <div className="px-6 sm:px-8 border-b border-slate-100 bg-white flex items-center gap-2 overflow-x-auto shrink-0 pt-2">
              {[
                { id: "overview", label: "1. Problem Overview", icon: FileCode },
                { id: "specs", label: "2. Statement & Specs", icon: BookOpen },
                { id: "code", label: "3. Starter Code IDE", icon: Terminal },
                { id: "tests", label: "4. Test Suites & Scoring", icon: ShieldCheck, badge: `${problemForm.publicTestCases.length + problemForm.hiddenTestCases.length}` },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = problemModalTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setProblemModalTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? "border-vcet-blue text-vcet-blue bg-blue-50/50"
                        : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${isActive ? "bg-vcet-blue text-white" : "bg-slate-100 text-slate-600"}`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Modal Body: Tab Content */}
            <form onSubmit={handleSaveProblem} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-xs">
              {/* TAB 1: Problem Overview */}
              {problemModalTab === "overview" && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Challenge Title */}
                  <div className="space-y-1.5">
                    <label className="block text-slate-800 font-bold text-xs">
                      Challenge Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={problemForm.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
                        setProblemForm({ ...problemForm, title, slug: problemForm.slug ? problemForm.slug : slug });
                      }}
                      placeholder="e.g. Find the Second Largest Element in Array"
                      className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-300 text-slate-900 font-bold text-sm focus:border-vcet-blue focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                    />
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>Generated slug: /{problemForm.slug || "custom-slug"}</span>
                      <span>Required field</span>
                    </div>
                  </div>

                  {/* Difficulty Selection: Visual Cards */}
                  <div className="space-y-2">
                    <label className="block text-slate-800 font-bold text-xs">
                      Difficulty Level <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        {
                          id: "Easy",
                          color: "emerald",
                          title: "Easy",
                          desc: "Basic logic, single loops, beginner placement problems",
                        },
                        {
                          id: "Medium",
                          color: "amber",
                          title: "Medium",
                          desc: "Data structures, hash maps, two pointers, searching",
                        },
                        {
                          id: "Hard",
                          color: "rose",
                          title: "Hard",
                          desc: "Dynamic programming, graph algorithms, complex math",
                        },
                      ].map((lvl) => {
                        const isChosen = problemForm.difficulty === lvl.id;
                        return (
                          <button
                            key={lvl.id}
                            type="button"
                            onClick={() => setProblemForm({ ...problemForm, difficulty: lvl.id })}
                            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                              isChosen
                                ? lvl.id === "Easy"
                                  ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/30 shadow-xs"
                                  : lvl.id === "Medium"
                                  ? "bg-amber-50 border-amber-500 ring-2 ring-amber-500/30 shadow-xs"
                                  : "bg-rose-50 border-rose-500 ring-2 ring-rose-500/30 shadow-xs"
                                : "bg-slate-50/70 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-extrabold text-sm text-slate-900">{lvl.title}</span>
                              <span
                                className={`w-3 h-3 rounded-full ${
                                  lvl.id === "Easy"
                                    ? "bg-emerald-500"
                                    : lvl.id === "Medium"
                                    ? "bg-amber-500"
                                    : "bg-rose-500"
                                }`}
                              />
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed">{lvl.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Problem Time Limit (Minutes) */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-slate-800 font-bold text-xs flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-vcet-blue" />
                        <span>Problem Time Limit (Minutes)</span>
                      </label>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        Default Track Limit: <strong>{activeTest?.timeLimit || 45} mins</strong>
                      </span>
                    </div>
                    <input
                      type="number"
                      min={1}
                      max={480}
                      value={problemForm.timeLimit || ""}
                      onChange={(e) => setProblemForm({ ...problemForm, timeLimit: e.target.value })}
                      placeholder={`Leave blank to use track default (${activeTest?.timeLimit || 45} mins)`}
                      className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-300 text-slate-900 font-bold text-xs focus:border-vcet-blue focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                    />
                    <p className="text-[10px] text-slate-500">
                      Configure custom solving duration in minutes for this specific challenge (e.g., 30, 45, 60, 90 mins).
                    </p>
                  </div>

                  {/* Company & Topic Tags */}
                  <div className="space-y-2 p-5 bg-slate-50 rounded-2xl border border-slate-200/90">
                    <label className="block text-slate-800 font-bold text-xs">
                      Topic & Company Tags (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={problemForm.tags}
                      onChange={(e) => setProblemForm({ ...problemForm, tags: e.target.value })}
                      placeholder="e.g. Arrays, TCS, Infosys, Zoho, Sliding Window"
                      className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-300 text-slate-900 font-medium focus:border-vcet-blue focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                    />

                    {/* Tag preview chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {problemForm.tags
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean)
                        .map((tag, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-vcet-blue border border-blue-200 font-bold text-[11px]"
                          >
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="hover:text-rose-600 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                    </div>

                    {/* One-click suggested tag chips */}
                    <div className="pt-2 border-t border-slate-200/60">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        One-Click Suggested Tags:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {SUGGESTED_TAGS.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleAddSuggestedTag(tag)}
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-vcet-blue hover:border-vcet-blue hover:bg-blue-50/50 text-[10px] font-bold transition-all cursor-pointer"
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Statement & Specifications */}
              {problemModalTab === "specs" && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Problem Description */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-slate-800 font-bold text-xs">
                        Problem Statement & Algorithmic Task <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[11px] text-slate-400">Clear explanations help students understand problem constraints</span>
                    </div>
                    <textarea
                      rows={5}
                      required
                      value={problemForm.description}
                      onChange={(e) => setProblemForm({ ...problemForm, description: e.target.value })}
                      placeholder="Explain the algorithmic problem, edge cases, and expected solution approach in detail..."
                      className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-300 text-slate-900 text-xs leading-relaxed focus:border-vcet-blue focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                    />
                  </div>

                  {/* Input / Output Formats */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <label className="block text-slate-800 font-bold text-xs">
                        Input Format Specification
                      </label>
                      <textarea
                        rows={3}
                        value={problemForm.inputFormat}
                        onChange={(e) => setProblemForm({ ...problemForm, inputFormat: e.target.value })}
                        placeholder="e.g. First line contains integer N. Second line contains N integers separated by space."
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-slate-900 text-xs focus:border-vcet-blue outline-none"
                      />
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <label className="block text-slate-800 font-bold text-xs">
                        Output Format Specification
                      </label>
                      <textarea
                        rows={3}
                        value={problemForm.outputFormat}
                        onChange={(e) => setProblemForm({ ...problemForm, outputFormat: e.target.value })}
                        placeholder="e.g. Print single integer representing the second largest element, or -1 if not found."
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-slate-900 text-xs focus:border-vcet-blue outline-none"
                      />
                    </div>
                  </div>

                  {/* Constraints */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-slate-800 font-bold text-xs">
                        Input Constraints (1 per line)
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">Limits & Complexity</span>
                    </div>
                    <textarea
                      rows={3}
                      value={problemForm.constraints}
                      onChange={(e) => setProblemForm({ ...problemForm, constraints: e.target.value })}
                      placeholder="1 <= N <= 10^5&#10;1 <= Arr[i] <= 10^9&#10;Time Limit: 2.0s"
                      className="w-full px-3 py-2 bg-white font-mono text-xs rounded-xl border border-slate-300 text-slate-900 focus:border-vcet-blue outline-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: Starter Code IDE */}
              {problemModalTab === "code" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-xs">Multi-Language Boilerplate Studio</h3>
                      <p className="text-[11px] text-slate-500">Provide clean starting code for candidates in Python, JS, C++, Java, and C.</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setProblemForm((prev) => ({
                          ...prev,
                          starterCode: {
                            ...prev.starterCode,
                            [activeLangTab]: BOILERPLATE_PRESETS[activeLangTab],
                          },
                        }));
                        showInfo(`Boilerplate template loaded for ${activeLangTab.toUpperCase()}`);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reset to Standard Boilerplate</span>
                    </button>
                  </div>

                  {/* IDE Window Box */}
                  <div className="rounded-2xl bg-slate-950 text-white border border-slate-800 overflow-hidden shadow-lg">
                    {/* IDE Title Bar */}
                    <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* macOS Window Dots */}
                        <div className="flex items-center gap-1.5 mr-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          starter_{activeLangTab}.{activeLangTab === "python" ? "py" : activeLangTab === "javascript" ? "js" : activeLangTab === "cpp" ? "cpp" : activeLangTab === "java" ? "java" : "c"}
                        </span>
                      </div>

                      {/* Language Switcher Tabs */}
                      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                        {["python", "javascript", "cpp", "java", "c"].map((lng) => (
                          <button
                            key={lng}
                            type="button"
                            onClick={() => setActiveLangTab(lng)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              activeLangTab === lng
                                ? "bg-blue-600 text-white shadow-xs"
                                : "text-slate-400 hover:text-white"
                            }`}
                          >
                            {lng.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Monospace Code Editor */}
                    <div className="relative">
                      <textarea
                        rows={10}
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
                        className="w-full p-4 bg-transparent font-mono text-xs text-slate-100 leading-relaxed outline-none border-0 resize-y"
                        placeholder={`Write default boilerplate starter code for ${activeLangTab}...`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Test Suites & Scoring */}
              {problemModalTab === "tests" && (
                <div className="space-y-5 animate-fadeIn">
                  {/* Test Suites Switcher */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setTestSuiteTab("public")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          testSuiteTab === "public"
                            ? "bg-white text-emerald-700 shadow-xs border border-emerald-200"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Public Cases ({problemForm.publicTestCases.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTestSuiteTab("hidden")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          testSuiteTab === "hidden"
                            ? "bg-white text-rose-700 shadow-xs border border-rose-200"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <Lock className="w-3.5 h-3.5 text-rose-600" />
                        <span>Hidden Test Suites ({problemForm.hiddenTestCases.length})</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={testSuiteTab === "public" ? addPublicTestCase : addHiddenTestCase}
                      className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 text-white transition-all cursor-pointer shadow-xs ${
                        testSuiteTab === "public"
                          ? "bg-emerald-600 hover:bg-emerald-700"
                          : "bg-rose-600 hover:bg-rose-700"
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{testSuiteTab === "public" ? "Add Public Case" : "Add Hidden Case"}</span>
                    </button>
                  </div>

                  {/* PUBLIC TEST CASES */}
                  {testSuiteTab === "public" && (
                    <div className="space-y-3">
                      <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Public test cases are returned to students during <strong>Run Code</strong> so they can debug their solutions.</span>
                      </div>

                      {problemForm.publicTestCases.map((tc, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 relative group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                              Public Test Case #{idx + 1}
                            </span>
                            {problemForm.publicTestCases.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removePublicTestCase(idx)}
                                className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                                title="Remove test case"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <span className="text-[10px] text-slate-500 font-bold block mb-1">Standard Input (stdin):</span>
                              <textarea
                                rows={3}
                                value={tc.input}
                                onChange={(e) => updatePublicTestCase(idx, "input", e.target.value)}
                                placeholder="e.g. 5&#10;1 2 3 4 5"
                                className="w-full p-2.5 bg-slate-50 font-mono text-xs rounded-xl border border-slate-200 focus:bg-white focus:border-emerald-500 outline-none"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 font-bold block mb-1">Expected Output (stdout):</span>
                              <textarea
                                rows={3}
                                value={tc.expectedOutput}
                                onChange={(e) => updatePublicTestCase(idx, "expectedOutput", e.target.value)}
                                placeholder="e.g. 15"
                                className="w-full p-2.5 bg-slate-50 font-mono text-xs rounded-xl border border-slate-200 focus:bg-white focus:border-emerald-500 outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-500 font-bold block mb-1">Explanation / Hint (Optional):</span>
                            <input
                              type="text"
                              value={tc.explanation || ""}
                              onChange={(e) => updatePublicTestCase(idx, "explanation", e.target.value)}
                              placeholder="e.g. The sum of integers 1 through 5 is 15."
                              className="w-full px-3 py-1.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:bg-white outline-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* HIDDEN TEST CASES */}
                  {testSuiteTab === "hidden" && (
                    <div className="space-y-3">
                      <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-800 text-xs">
                        <Lock className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Hidden test suites are evaluated server-side upon final <strong>Submit Solution</strong>. Students never see these inputs.</span>
                      </div>

                      {problemForm.hiddenTestCases.map((tc, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 relative group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                              Hidden Verification Case #{idx + 1}
                            </span>
                            {problemForm.hiddenTestCases.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeHiddenTestCase(idx)}
                                className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                                title="Remove hidden test case"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <span className="text-[10px] text-slate-500 font-bold block mb-1">Hidden Input (stdin):</span>
                              <textarea
                                rows={3}
                                value={tc.input}
                                onChange={(e) => updateHiddenTestCase(idx, "input", e.target.value)}
                                placeholder="Private input data"
                                className="w-full p-2.5 bg-slate-50 font-mono text-xs rounded-xl border border-slate-200 focus:bg-white focus:border-rose-500 outline-none"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 font-bold block mb-1">Expected Output (stdout):</span>
                              <textarea
                                rows={3}
                                value={tc.expectedOutput}
                                onChange={(e) => updateHiddenTestCase(idx, "expectedOutput", e.target.value)}
                                placeholder="Exact expected output"
                                className="w-full p-2.5 bg-slate-50 font-mono text-xs rounded-xl border border-slate-200 focus:bg-white focus:border-rose-500 outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-5 border-t border-slate-200/80 shrink-0">
                <div className="flex items-center gap-2">
                  {problemModalTab !== "overview" && (
                    <button
                      type="button"
                      onClick={() => {
                        const tabs = ["overview", "specs", "code", "tests"];
                        const curIdx = tabs.indexOf(problemModalTab);
                        if (curIdx > 0) setProblemModalTab(tabs[curIdx - 1]);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Previous Step</span>
                    </button>
                  )}

                  {problemModalTab !== "tests" && (
                    <button
                      type="button"
                      onClick={() => {
                        const tabs = ["overview", "specs", "code", "tests"];
                        const curIdx = tabs.indexOf(problemModalTab);
                        if (curIdx < tabs.length - 1) setProblemModalTab(tabs[curIdx + 1]);
                      }}
                      className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-vcet-blue font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <span>Next Step</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setProblemModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black shadow-md shadow-blue-500/25 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{editingProblem ? "Save Challenge Updates" : "Publish Challenge to Track"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          6. PREVIEW PROBLEM MODAL
          ========================================================================= */}
      {previewProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto text-slate-800 space-y-5">
            <button
              onClick={() => setPreviewProblem(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-blue-50 text-vcet-blue">
                <Code2 className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Candidate Simulation Preview
                </span>
                <h2 className="text-xl font-black text-slate-900">{previewProblem.title}</h2>
              </div>
              <div className="ml-auto pr-8">{getDifficultyBadge(previewProblem.difficulty)}</div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-xs text-slate-800">Problem Statement:</h4>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{previewProblem.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 block text-[11px]">Input Format:</span>
                <p className="text-slate-500 font-mono text-[11px]">{previewProblem.inputFormat || "Standard input (stdin)"}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 block text-[11px]">Output Format:</span>
                <p className="text-slate-500 font-mono text-[11px]">{previewProblem.outputFormat || "Standard output (stdout)"}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-800">Public Test Cases:</h4>
              <div className="space-y-2">
                {(previewProblem.publicTestCases || []).map((tc, idx) => (
                  <div key={idx} className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs font-mono space-y-1.5">
                    <span className="text-[10px] font-bold text-emerald-800">Test Case #{idx + 1}</span>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Input:</span>
                        <pre className="p-1.5 bg-white rounded border border-emerald-100 whitespace-pre-wrap">{tc.input}</pre>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Expected:</span>
                        <pre className="p-1.5 bg-white rounded border border-emerald-100 whitespace-pre-wrap">{tc.expectedOutput}</pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                onClick={() => setPreviewProblem(null)}
                className="px-6 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          7. ASSESSMENT TRACK MODAL WITH DEPARTMENT ACCESS SCOPE
          ========================================================================= */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto text-slate-800 space-y-5">
            <button
              onClick={() => setTestModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-vcet-blue">
                Assessment Track Customization
              </span>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 mt-0.5">
                <FolderPlus className="w-5 h-5 text-vcet-blue" />
                {editingTest ? "Edit Coding Assessment Track" : "Create New Coding Assessment Track"}
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 font-bold focus:border-vcet-blue focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={testForm.description}
                  onChange={(e) => setTestForm({ ...testForm, description: e.target.value })}
                  placeholder="Recruitment / Laboratory practical assessment..."
                  className="w-full px-3.5 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:bg-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Category</label>
                  <select
                    value={testForm.category}
                    onChange={(e) => setTestForm({ ...testForm, category: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:bg-white cursor-pointer outline-none"
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
                    className="w-full px-3.5 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:bg-white outline-none"
                  />
                </div>
              </div>

              {/* Target Audience & Department Scope Selector */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-vcet-blue" />
                    Target Audience / Department Eligibility *
                  </label>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    Who can take this assessment?
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      setTestForm((prev) => ({
                        ...prev,
                        targetAudience: "all",
                        department: "ALL",
                        departmentName: "All VCETians",
                      }))
                    }
                    className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      testForm.targetAudience === "all"
                        ? "bg-blue-50 border-vcet-blue text-vcet-blue ring-1 ring-vcet-blue shadow-xs font-bold"
                        : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 font-medium"
                    }`}
                  >
                    <Globe
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        testForm.targetAudience === "all" ? "text-vcet-blue" : "text-slate-400"
                      }`}
                    />
                    <div>
                      <div className="text-xs font-bold leading-tight">All VCETians</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                        Open to all departments
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setTestForm((prev) => {
                        const fallbackDept = prev.department && prev.department !== "ALL"
                          ? prev.department
                          : user?.departmentCode || user?.department || "CSE";
                        const found = departments.find((d) => d.code === fallbackDept);
                        return {
                          ...prev,
                          targetAudience: "department",
                          department: fallbackDept,
                          departmentId: found?._id || prev.departmentId || null,
                          departmentName: found?.name || fallbackDept,
                        };
                      })
                    }
                    className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      testForm.targetAudience === "department"
                        ? "bg-purple-50 border-purple-600 text-purple-900 ring-1 ring-purple-600 shadow-xs font-bold"
                        : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 font-medium"
                    }`}
                  >
                    <GraduationCap
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        testForm.targetAudience === "department" ? "text-purple-600" : "text-slate-400"
                      }`}
                    />
                    <div>
                      <div className="text-xs font-bold leading-tight">Particular Department</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                        Only for specific department
                      </div>
                    </div>
                  </button>
                </div>

                {testForm.targetAudience === "department" && (
                  <div className="pt-2 border-t border-slate-200">
                    <label className="block text-slate-700 font-bold mb-1 text-[11px]">
                      Select Eligible Department *
                    </label>
                    <select
                      value={testForm.department}
                      onChange={(e) => {
                        const code = e.target.value;
                        const found = departments.find((d) => d.code === code);
                        setTestForm((prev) => ({
                          ...prev,
                          department: code,
                          departmentId: found?._id || null,
                          departmentName: found?.name || code,
                        }));
                      }}
                      className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-purple-300 text-slate-900 font-bold text-xs focus:ring-2 focus:ring-purple-400 cursor-pointer shadow-xs outline-none"
                    >
                      {departments.map((dept) => (
                        <option key={dept.code} value={dept.code}>
                          {dept.code} — {dept.name || dept.code}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-purple-700 font-semibold mt-1.5 flex items-center gap-1">
                      <span>✓</span>
                      <span>Only enrolled students from {testForm.department} will be permitted to access this track.</span>
                    </p>
                  </div>
                )}
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
                  className="px-6 py-2 rounded-xl bg-vcet-blue hover:bg-blue-700 text-white font-black shadow-sm cursor-pointer"
                >
                  {editingTest ? "Save Changes" : "Create Assessment Track"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
