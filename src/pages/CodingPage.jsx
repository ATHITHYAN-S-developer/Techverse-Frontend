import React, { useState, useEffect, useCallback, lazy, Suspense, useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  Code2,
  Play,
  CheckCircle,
  XCircle,
  Sparkles,
  Terminal,
  RotateCcw,
  Tag,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  ShieldCheck,
  Maximize2,
  Minimize2,
  HelpCircle,
  Flame,
  Layers,
  ChevronDown,
  ChevronUp,
  Settings,
  Edit,
  Cpu,
  RefreshCw,
  User,
  AlertTriangle,
  Check,
  GraduationCap,
  Globe,
  FileCode,
  FileText,
  BarChart3,
  Copy,
} from "lucide-react";
import confetti from "canvas-confetti";
import { codingService } from "../services/codingService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const CodeEditor = lazy(() => import("../components/exam/CodeEditor"));

const SUPPORTED_LANGUAGES = [
  { id: "python", name: "Python 3", extension: ".py" },
  { id: "javascript", name: "JavaScript (Node.js)", extension: ".js" },
  { id: "cpp", name: "C++ (GCC)", extension: ".cpp" },
  { id: "java", name: "Java (OpenJDK)", extension: ".java" },
  { id: "c", name: "C (GCC)", extension: ".c" },
];

export default function CodingPage() {
  const { user, refreshStreak } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const [tests, setTests] = useState([]);
  const [currentTest, setCurrentTest] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [consoleOutput, setConsoleOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [activeOutputTab, setActiveOutputTab] = useState("console"); // "console" | "testcases"
  const [loading, setLoading] = useState(true);

  // View Mode: "list" (Problem Selection) or "compiler" (Active Online Compiler)
  const [viewMode, setViewMode] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [difficultyTabs, setDifficultyTabs] = useState(["All", "Easy", "Medium", "Hard"]);

  // Mobile Workspace Navigation: "specs" | "editor" | "output"
  const [mobileTab, setMobileTab] = useState("editor");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Submission flow states
  const [submissionSummary, setSubmissionSummary] = useState(null);
  const [isTerminalCollapsed, setIsTerminalCollapsed] = useState(false);
  const [specTab, setSpecTab] = useState("description"); // "description" | "samples"
  const [copiedKey, setCopiedKey] = useState(null);

  const isTeacherOrAdmin = user?.role === "faculty" || user?.role === "teacher" || user?.role === "admin";

  // Sync fullscreen state with browser changes
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  // Lock body scroll when compiler is active to prevent any background scroll
  useEffect(() => {
    if (viewMode === "compiler") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [viewMode]);

  // Copy to clipboard helper
  const handleCopyText = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Load coding tests from backend
  const loadTests = async () => {
    setLoading(true);
    try {
      const list = await codingService.getAllCodingTests();
      setTests(list);
      setDifficultyTabs(["All", ...codingService.getDifficultyOptions()]);
      if (list.length > 0) {
        const testToSelect = currentTest ? list.find((t) => t._id === currentTest._id) || list[0] : list[0];
        setCurrentTest(testToSelect);
      }
    } catch (err) {
      console.error("Failed to load tests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, []);

  // Open the compiler workspace for a problem directly (no timers, no proctoring)
  const handleOpenCompiler = (prob, silent = false) => {
    if (!prob) return;
    setSelectedProblem(prob);
    setCode(prob.starterCode?.[language] || prob.starterCode?.python || prob.starterCode?.javascript || "");
    setTestResults(null);
    setConsoleOutput("");
    setMobileTab("editor");
    setViewMode("compiler");
    if (!silent) showSuccess(`Loaded "${prob.title}" in the compiler`);
  };

  // Open a whole module box (assessment track) straight into its compiler
  const openModule = (test) => {
    if (!test) return;
    setCurrentTest(test);
    handleOpenCompiler(test.problems?.[0], false);
  };

  // Toggle fullscreen mode
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          await document.documentElement.webkitRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn("Fullscreen toggle error:", err);
    }
  };

  // Return to the problem list
  const handleExitAssessment = () => {
    setViewMode("list");
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setIsFullscreen(false);
  };

  // Submit the current solution directly (no END gate, no cooldown)
  const handleSubmitSolution = () => {
    if (!currentTest || !selectedProblem || isSubmitting) return;
    handleFinalSubmit();
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    if (selectedProblem?.starterCode?.[lang]) {
      setCode(selectedProblem.starterCode[lang]);
    } else {
      if (lang === "python") {
        setCode("import sys\n\ndef solution():\n    lines = sys.stdin.read().strip().split('\\n')\n    # Write solution here\n\nif __name__ == '__main__':\n    solution()");
      } else if (lang === "javascript") {
        setCode("const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\n// Write solution here\n");
      } else if (lang === "cpp") {
        setCode("#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write solution here\n    return 0;\n}");
      } else if (lang === "java") {
        setCode("import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Write solution\n    }\n}");
      } else if (lang === "c") {
        setCode("#include <stdio.h>\n\nint main() {\n    // Write solution\n    return 0;\n}");
      }
    }
  };

  const handleResetCode = () => {
    if (selectedProblem?.starterCode?.[language]) {
      setCode(selectedProblem.starterCode[language]);
      showInfo("Code reset to original starter template.");
    }
  };

  // Run Code against Public Test Cases
  const handleRunPublicCases = async () => {
    if (!currentTest || !selectedProblem || isRunning) return;
    setIsRunning(true);
    setActiveOutputTab("console");
    setIsTerminalCollapsed(false);
    setMobileTab("output");
    setConsoleOutput("Compiling and executing code against public test cases...\n");

    try {
      const res = await codingService.runCode(currentTest._id, selectedProblem._id, language, code);
      setTestResults(res);

      if (res.allPassed || res.status === "Accepted") {
        setConsoleOutput(
          `>>> [Public Test Suite: Passed ${res.passed || res.passedCases || 2}/${res.total || res.totalCases || 2}]\nExecution Time: ${res.executionTime}s | Memory: ${res.memory}MB\n\nAll public test cases passed successfully. You can now submit your solution.`
        );
        showSuccess("Public test cases passed!");
      } else {
        const compilerDetail = res.compileErrorMessage
          ? `\n\nCompiler output:\n${res.compileErrorMessage}`
          : `\n\nDetails:\n${res.testResults?.[0]?.errorMessage || "Output did not match expected output."}`;
        setConsoleOutput(
          `>>> [Public Test Suite: ${res.status}]\nPassed ${res.passed || res.passedCases || 0}/${res.total || res.totalCases || 2} public cases.${compilerDetail}`
        );
        showInfo("Some public test cases failed. Check details in Test Cases tab.");
      }
    } catch (err) {
      if (err?.busy) {
        setConsoleOutput(`>>> Arena temporarily unavailable.\n${err.message}`);
        showError(err.message);
      } else {
        showError("Execution failed. Please check code syntax.");
      }
    } finally {
      setIsRunning(false);
    }
  };

  // Final Submit Handler
  const handleFinalSubmit = useCallback(
    async () => {
      if (!currentTest || !selectedProblem || isSubmitting) return;
      setIsSubmitting(true);
      setActiveOutputTab("console");
      setMobileTab("output");
      setConsoleOutput("Evaluating solution against all hidden server-side test cases...\n");

      try {
        const result = await codingService.submitCode(
          currentTest._id,
          selectedProblem._id,
          language,
          code,
          { submissionType: "manual" }
        );

        setTestResults(result);

        // Return to the problem list and surface the results
        setViewMode("list");
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        setIsFullscreen(false);
        setSubmissionSummary({
          ...result,
          problemTitle: selectedProblem.title,
          problemId: selectedProblem._id,
          language,
        });

        if (result.isAccepted || result.status === "Accepted") {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
          showSuccess(`Accepted! All ${result.passedCases || result.totalCases}/${result.totalCases} test cases passed!`);
          refreshStreak();
        } else {
          showInfo(`Assessment submitted! Passed ${result.passedCases || 0}/${result.totalCases || 0} test cases.`);
        }
      } catch (err) {
        if (err?.busy) {
          setConsoleOutput(`>>> Arena temporarily unavailable.\n${err.message}`);
          showError(err.message);
        } else {
          showError("Submission failed. Please check network connection.");
        }
        setViewMode("list");
        setIsFullscreen(false);
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentTest, selectedProblem, isSubmitting, language, code, refreshStreak, showSuccess, showError, showInfo]
  );

  // Problems for the currently selected module (used throughout the compiler)
  const allProblems = currentTest?.problems || [];
  const selectedIndex = allProblems.findIndex(
    (p) => (p._id || p.title) === (selectedProblem?._id || selectedProblem?.title)
  );

  if (loading && !currentTest) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-vcet-blue border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Loading VCET Coding Arena...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-3 sm:py-6 px-3 sm:px-6 lg:px-8 space-y-5 text-slate-800">
      {/* 0. Educator / Teacher Management Banner */}
      {isTeacherOrAdmin && (
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-blue-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md shrink-0">
              <ShieldCheck className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-sm text-white">Educator / Faculty Studio</span>
                <span className="px-2 py-0.5 rounded-md bg-blue-500/30 text-blue-200 text-[10px] font-bold">
                  Problem Management
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5 leading-relaxed">
                Configure assessment tracks, set custom time limits in minutes, customize test suites and starter templates.
              </p>
            </div>
          </div>

          <Link
            to={user?.role === "admin" ? "/admin/coding" : "/faculty/coding"}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-blue-900 font-black text-xs hover:bg-blue-50 shadow-md active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            <Settings className="w-4 h-4 text-vcet-blue" />
            <span>Open Problem Authoring Studio</span>
          </Link>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW MODE 1: PROBLEM SELECTION LIST                      */}
      {/* ======================================================== */}
      {viewMode === "list" && (
        <div className="space-y-5 sm:space-y-6 animate-fadeIn">
          {/* Main Hero Header Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-8 shadow-xs relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-vcet-blue border border-blue-200 shadow-2xs">
                    <Code2 className="w-3.5 h-3.5" />
                    <span>VCET Online Compiler & Test Arena</span>
                  </span>

                  {currentTest?.targetAudience === "department" && currentTest?.department !== "ALL" ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs">
                      <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                      <span>{currentTest.department} Department Restricted</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                      <Globe className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Open to All VCETians</span>
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Problem Statement Selection
                </h1>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Browse problem statements designed by department faculty. Click on any problem to open the online
                  compiler. No timers, no lockouts — solve at your own pace and submit whenever you're ready.
                </p>
              </div>
</div>
          </div>

{/* Module boxes: one box per assessment track (click to open its coding page) */}
          <div className="space-y-4">
            {[...tests]
              .sort(
                (a, b) =>
                  ({ Easy: 0, Medium: 1, Hard: 2 }[a.difficulty] ?? 9) -
                  ({ Easy: 0, Medium: 1, Hard: 2 }[b.difficulty] ?? 9)
              )
              .map((test, tIdx) => (
              <div
                key={test._id || tIdx}
                role="button"
                tabIndex={0}
                onClick={() => openModule(test)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openModule(test);
                  }
                }}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden cursor-pointer group hover:border-vcet-blue hover:shadow-md transition-all"
              >
                <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                      <Code2 className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg font-black text-slate-900 group-hover:text-vcet-blue transition-colors truncate">
                        {test.title}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                        {test.description || "Practice and solve coding problems in the online compiler"}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 transition-all">
                    <Play className="w-3.5 h-3.5 fill-white" />
                    Open
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW MODE 2: ACTIVE ONLINE COMPILER WORKSPACE             */}
      {/* ======================================================== */}
      {/* ======================================================== */}
      {/* VIEW MODE 2: FULL-SCREEN REDESIGNED COMPILER WORKSPACE    */}
      {/* Rendered via portal directly to document.body to ensure   */}
      {/* 100% viewport width/height, hiding all sidebars & banners */}
      {/* ======================================================== */}
      {viewMode === "compiler" && selectedProblem && createPortal(
        <div className="fixed inset-0 z-[9999] w-screen h-screen bg-sky-50 text-slate-800 flex flex-col overflow-hidden select-text font-sans antialiased">
          {/* 1. TOP HEADER NAVIGATION BAR */}
          <header className="h-14 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between gap-3 shrink-0 shadow-lg select-none">
            {/* Left: Exit + Problem Title & Difficulty + Author */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
              <button
                type="button"
                onClick={handleExitAssessment}
                className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-sky-600 border border-slate-200 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold shrink-0"
                title="Back to problem list"
              >
                <ArrowLeft className="w-4 h-4 text-slate-400" />
                <span className="hidden sm:inline">Back to Problems</span>
              </button>

              <div className="h-4 w-px bg-slate-200 hidden sm:block shrink-0" />

              <div className="min-w-0 flex items-center gap-2 sm:gap-2.5">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight truncate max-w-[140px] sm:max-w-xs md:max-w-md">
                  {selectedProblem.title}
                </h2>
                <span
                  className="md:hidden shrink-0 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold"
                  title="Question number out of total"
                >
                  Q{selectedIndex + 1}/{allProblems.length}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 border ${
                    selectedProblem.difficulty === "Easy"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : selectedProblem.difficulty === "Hard"
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {selectedProblem.difficulty || "Medium"}
                </span>

                <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-400 pl-2 border-l border-slate-200 shrink-0 truncate">
                  <User className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span className="truncate">
                    Author:{" "}
                    <strong className="text-slate-700">
                      {selectedProblem.author ||
                        selectedProblem.createdByName ||
                        currentTest?.createdBy?.name ||
                        "Dr. S. K. Manikandan"}
                    </strong>
                  </span>
                  <span className="text-[10px] font-bold bg-sky-500/10 text-sky-600 border border-sky-500/20 px-1.5 py-0.2 rounded-md">
                    VCET Faculty
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Language Dropdown, Reset, Fullscreen Toggle */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2 sm:px-2.5 py-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 hidden sm:inline">Lang:</span>
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.id} value={l.id} className="bg-white text-slate-800">
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleResetCode}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-sky-600 border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                title="Reset code template"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden lg:inline">Reset</span>
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-sky-600 border border-slate-200 transition-colors cursor-pointer"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Workspace"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </header>

          {/* MOBILE SEGMENTED VIEW SWITCHER (< lg screens) */}
          <div className="lg:hidden flex items-center p-1 bg-slate-100 border-b border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setMobileTab("specs")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mobileTab === "specs" ? "bg-white text-sky-600 shadow-xs" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Problem Specs</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileTab("editor")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mobileTab === "editor" ? "bg-white text-sky-600 shadow-xs" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Code Editor</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileTab("output")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer relative ${
                mobileTab === "output" ? "bg-white text-sky-600 shadow-xs" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Console & Tests</span>
              {testResults && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-2 right-3" />
              )}
            </button>
          </div>

          {/* 2. MAIN WORKSPACE: SPLIT GRID LAYOUT */}
          <main className="flex-1 min-h-0 flex flex-col lg:flex-row gap-3 p-3 pt-2 bg-sky-50 overflow-hidden">
            {/* LEFT QUESTION RAIL: select any question number (vertical on desktop, horizontal scroll on mobile) */}
            <div className="shrink-0 flex lg:flex-col items-center gap-1.5 p-1.5 bg-white border border-slate-200 rounded-2xl overflow-x-auto lg:overflow-x-hidden lg:overflow-y-auto lg:w-12">
              <span
                className="hidden lg:block text-[9px] font-black tracking-[0.25em] text-slate-500 uppercase select-none mb-1 text-center leading-none"
                style={{ writingMode: "vertical-rl" }}
              >
                Questions
              </span>
              {allProblems.map((p, i) => {
                const isActive = (p._id || p.title) === (selectedProblem._id || selectedProblem.title);
                return (
                  <button
                    key={p._id || i}
                    type="button"
                    onClick={() => handleOpenCompiler(p, true)}
                    title={`Question ${i + 1}: ${p.title}`}
                    className={`shrink-0 w-9 h-9 lg:w-10 lg:h-10 rounded-xl text-xs font-black flex items-center justify-center transition-all cursor-pointer border ${
                      isActive
                        ? "bg-sky-500/20 text-sky-300 border-sky-500/60 shadow-md shadow-sky-500/20"
                        : "bg-slate-100 text-slate-500 border-slate-200 hover:text-sky-600 hover:border-sky-300"
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            {/* LEFT PANEL: Problem Statement & Specifications */}
            <div
              className={`w-full lg:w-[42%] xl:w-[40%] flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl ${
                mobileTab !== "specs" ? "hidden lg:flex" : "flex"
              }`}
            >
              {/* Left Panel Tabs Header */}
              <div className="h-11 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 select-none">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setSpecTab("description")}
                    className={`flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer py-2 ${
                      specTab === "description"
                        ? "text-sky-600 border-b-2 border-sky-600"
                        : "text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Problem Description</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSpecTab("samples")}
                    className={`flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer py-2 ${
                      specTab === "samples"
                        ? "text-sky-600 border-b-2 border-sky-600"
                        : "text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Sample Test Cases ({selectedProblem.publicTestCases?.length || 0})</span>
                  </button>
                </div>
              </div>

              {/* Left Panel Scrollable Content */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-5 text-slate-600 text-xs sm:text-sm">
                {specTab === "description" ? (
                  <>
                    {/* Faculty Attribution Pill */}
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-vcet-blue text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {((selectedProblem.author || selectedProblem.createdByName || "P")[0]).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                            Author & Faculty
                          </span>
                          <span className="text-xs font-bold text-slate-700 truncate block">
                            {selectedProblem.author ||
                              selectedProblem.createdByName ||
                              currentTest?.createdBy?.name ||
                              "Dr. S. K. Manikandan"}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-sky-500/10 text-sky-600 border border-sky-500/20 px-2 py-0.5 rounded-md shrink-0">
                        VCET Faculty
                      </span>
                    </div>

                    {/* Problem Statement */}
                    <div className="space-y-1.5">
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Problem Statement
                      </h3>
                      <div className="text-slate-700 leading-relaxed font-sans whitespace-pre-line text-sm">
                        {selectedProblem.description}
                      </div>
                    </div>

                    {/* Input Format */}
                    {selectedProblem.inputFormat && (
                      <div className="space-y-1.5">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Input Format Specification
                        </h4>
                        <pre className="p-3 rounded-xl bg-sky-50 border border-slate-200 font-mono text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                          {selectedProblem.inputFormat}
                        </pre>
                      </div>
                    )}

                    {/* Output Format */}
                    {selectedProblem.outputFormat && (
                      <div className="space-y-1.5">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Output Format Specification
                        </h4>
                        <pre className="p-3 rounded-xl bg-sky-50 border border-slate-200 font-mono text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                          {selectedProblem.outputFormat}
                        </pre>
                      </div>
                    )}

                    {/* Constraints */}
                    {selectedProblem.constraints && (
                      <div className="space-y-1.5">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Constraints
                        </h4>
                        <div className="p-3 rounded-xl bg-sky-50 border border-slate-200 space-y-1 font-mono text-xs text-amber-700">
                          {Array.isArray(selectedProblem.constraints) ? (
                            selectedProblem.constraints.map((c, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                <span>{c}</span>
                              </div>
                            ))
                          ) : (
                            <div>{selectedProblem.constraints}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : null}

                {/* Sample Test Cases (Always visible or in tab) */}
                <div className="space-y-3 pt-1">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Sample Test Cases</span>
                    <span className="text-[10px] text-slate-500 font-normal">Click to copy input</span>
                  </h4>

                  {(selectedProblem.publicTestCases || []).slice(0, 3).map((tc, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-sky-50 border border-slate-200 text-xs space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 pb-1 border-b border-slate-100">
                        <span>Sample #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(tc.input, `input_${idx}`)}
                          className="flex items-center gap-1 text-[10px] text-sky-600 hover:text-sky-300 transition-colors cursor-pointer"
                        >
                          {copiedKey === `input_${idx}` ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Input</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="font-mono text-slate-700">
                        <span className="text-slate-400 font-bold block text-[10px] uppercase">Input:</span>
                        <pre className="mt-0.5 p-2 rounded-lg bg-white border border-slate-100 overflow-x-auto whitespace-pre-wrap">
                          {tc.input}
                        </pre>
                      </div>

                      <div className="font-mono text-emerald-600">
                        <span className="text-slate-400 font-bold block text-[10px] uppercase">Expected Output:</span>
                        <pre className="mt-0.5 p-2 rounded-lg bg-white border border-slate-100 overflow-x-auto whitespace-pre-wrap">
                          {tc.expectedOutput}
                        </pre>
                      </div>

                      {tc.explanation && (
                        <div className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-100">
                          Explanation: {tc.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT PANEL: Code Editor & Collapsible Terminal */}
            <div
              className={`flex-1 min-h-0 flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl ${
                mobileTab === "specs" ? "hidden lg:flex" : "flex"
              }`}
            >
              {/* Top Editor Toolbar (Filename & Action Buttons) */}
              <div className="h-12 bg-white border-b border-slate-200 px-3 sm:px-4 flex items-center justify-between shrink-0 select-none">
                {/* File Tab */}
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-50 border border-slate-200 text-xs font-mono font-bold text-slate-700">
                    <FileCode className="w-3.5 h-3.5 text-sky-600" />
                    <span>solution{SUPPORTED_LANGUAGES.find((l) => l.id === language)?.extension || ".py"}</span>
                  </span>
                </div>

                {/* Run & Submit Actions */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    disabled={isRunning || isSubmitting}
                    onClick={handleRunPublicCases}
                    className="px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-sky-600 flex items-center gap-1.5 border border-slate-200 transition-all shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-400" />
                    <span>{isRunning ? "Running..." : "Run Public Cases"}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting || isRunning}
                    onClick={handleSubmitSolution}
                    className="px-4 sm:px-5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center gap-1.5 shadow-md shadow-emerald-950/70 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? "Evaluating..." : "Submit Solution"}</span>
                  </button>
                </div>
              </div>

              {/* Code Editor Full Canvas */}
              <div className="flex-1 min-h-0 relative bg-white overflow-hidden">
                <Suspense
                  fallback={
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      spellCheck="false"
                      className="w-full h-full p-4 bg-transparent text-slate-800 font-mono text-xs sm:text-sm leading-relaxed resize-none selection:bg-blue-600/40"
                      placeholder="Loading editor..."
                    />
                  }
                >
                  <CodeEditor
                    value={code}
                    onChange={setCode}
                    language={language}
                    placeholder="Write your algorithmic solution here..."
                  />
                </Suspense>
              </div>

              {/* Collapsible Compiler Console & Test Results Drawer */}
              <div className="shrink-0 flex flex-col bg-sky-50 border-t border-slate-200 select-none">
                {/* Drawer Header Bar */}
                <div className="h-9 bg-slate-50 px-3 sm:px-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveOutputTab("console");
                        setIsTerminalCollapsed(false);
                      }}
                      className={`flex items-center gap-1.5 font-bold transition-colors cursor-pointer py-1 ${
                        activeOutputTab === "console" && !isTerminalCollapsed
                          ? "text-sky-600 border-b-2 border-sky-600"
                          : "text-slate-400 hover:text-slate-700"
                      }`}
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Compiler Terminal</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveOutputTab("testcases");
                        setIsTerminalCollapsed(false);
                      }}
                      className={`flex items-center gap-1.5 font-bold transition-colors cursor-pointer py-1 ${
                        activeOutputTab === "testcases" && !isTerminalCollapsed
                          ? "text-sky-600 border-b-2 border-sky-600"
                          : "text-slate-400 hover:text-slate-700"
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>
                        Test Cases{" "}
                        {testResults ? `(${testResults.passedCases || 0}/${testResults.totalCases || 0})` : ""}
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setConsoleOutput("")}
                      className="text-[10px] text-slate-500 hover:text-slate-600 transition-colors cursor-pointer"
                      title="Clear terminal"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsTerminalCollapsed(!isTerminalCollapsed)}
                      className="p-1 rounded text-slate-400 hover:text-sky-600 transition-colors cursor-pointer"
                      title={isTerminalCollapsed ? "Expand Terminal" : "Collapse Terminal"}
                    >
                      {isTerminalCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Drawer Body (When Expanded) */}
                {!isTerminalCollapsed && (
                  <div className="h-40 sm:h-52 overflow-hidden bg-white">
                    {activeOutputTab === "console" ? (
                      <pre className="h-full p-3 sm:p-4 font-mono text-xs text-slate-600 overflow-y-auto whitespace-pre-wrap leading-relaxed select-text">
                        {consoleOutput ||
                          "Compiler output and runtime logs will appear here after clicking 'Run Public Cases' or 'Submit Solution'."}
                      </pre>
                    ) : (
                      <div className="h-full p-3 overflow-y-auto space-y-2">
                        {(testResults?.testResults || []).length > 0 ? (
                          testResults.testResults.map((tr, idx) => (
                            <div
                              key={idx}
                              className={`p-2.5 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                                tr.passed
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                  : "bg-rose-50 border-rose-200 text-rose-800"
                              }`}
                            >
                              <div className="space-y-1 min-w-0">
                                <div className="font-bold flex items-center gap-1.5">
                                  {tr.passed ? (
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  ) : (
                                    <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                  )}
                                  <span>
                                    Test Case #{tr.testCaseNumber} {tr.isHidden ? "(Hidden Evaluation)" : "(Public)"}
                                  </span>
                                </div>
                                {!tr.isHidden && (
                                  <div className="text-[11px] font-mono text-slate-400 space-y-0.5">
                                    <div>Input: {tr.input}</div>
                                    <div>Expected: {tr.expectedOutput}</div>
                                    <div>Output: {tr.actualOutput}</div>
                                  </div>
                                )}
                              </div>
                              <span className="text-[10px] font-mono text-slate-400 shrink-0">
                                {tr.executionTime}ms
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-500 italic p-4 text-center">
                            No test cases evaluated yet. Click 'Run Public Cases' to verify your solution against samples.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </main>

          {/* STICKY BOTTOM ACTION BAR ON MOBILE (< lg screens) */}
          <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md px-4 py-2.5 border-t border-slate-200 flex items-center justify-between gap-3 shadow-2xl">
            <button
              type="button"
              disabled={isRunning || isSubmitting}
              onClick={handleRunPublicCases}
              className="flex-1 py-2 px-3 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-white flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-400" />
              <span>{isRunning ? "Running..." : "Run Cases"}</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting || isRunning}
              onClick={handleSubmitSolution}
              className="flex-1 py-2 px-3 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Testing..." : "Submit Solution"}</span>
            </button>
          </div>

          </div>,
        document.body
      )}

      {/* ======================================================== */}
      {/* ASSESSMENT SUBMITTED RESULTS MODAL                     */}
      {submissionSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 text-center">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-inner ${
                submissionSummary.isAccepted || submissionSummary.status === "Accepted"
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-amber-100 text-amber-600"
              }`}
            >
              {submissionSummary.isAccepted || submissionSummary.status === "Accepted" ? (
                <CheckCircle className="w-9 h-9" />
              ) : (
                <AlertTriangle className="w-9 h-9" />
              )}
            </div>

            <div className="space-y-2">
              <span
                className={`px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase border ${
                  submissionSummary.isAccepted || submissionSummary.status === "Accepted"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {submissionSummary.isAccepted || submissionSummary.status === "Accepted"
                  ? "Assessment Concluded — Passed"
                  : "Assessment Concluded — Evaluated"}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {submissionSummary.problemTitle || "Solution Submitted"}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your examination session has concluded and your solution was compiled against the evaluation test suite.
              </p>
            </div>

            {/* Score & Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
                <span
                  className={`text-xs sm:text-sm font-black ${
                    submissionSummary.isAccepted || submissionSummary.status === "Accepted"
                      ? "text-emerald-600"
                      : "text-amber-600"
                  }`}
                >
                  {submissionSummary.status || "Evaluated"}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Test Cases</span>
                <span className="text-xs sm:text-sm font-mono font-black text-slate-900">
                  {submissionSummary.passedCases ?? 0} / {submissionSummary.totalCases ?? 0}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Runtime</span>
                <span className="text-xs sm:text-sm font-mono font-bold text-slate-700">
                  {submissionSummary.executionTime || "0.00"}s
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSubmissionSummary(null)}
              className="w-full py-3.5 rounded-2xl text-xs font-black bg-slate-900 hover:bg-slate-100 text-white transition-all cursor-pointer shadow-md active:scale-98"
            >
              Back to Coding Arena
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
