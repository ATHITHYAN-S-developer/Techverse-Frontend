import React, { useState, useEffect, useCallback, lazy, Suspense, useRef } from "react";
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
  ShieldAlert,
  ShieldCheck,
  Clock,
  Maximize2,
  HelpCircle,
  Flame,
  Layers,
  Award,
  ChevronDown,
  Settings,
  Edit,
  Cpu,
  RefreshCw,
  User,
  Lock,
  Unlock,
  AlertTriangle,
  Search,
  Check
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

const LOCKOUT_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const FOUR_HOURS_IN_SECONDS = 4 * 60 * 60; // 14,400 seconds (4 hours)

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

  // 4-Hour Timer & Proctoring
  const [timeLeft, setTimeLeft] = useState(FOUR_HOURS_IN_SECONDS);
  const [isTestActive, setIsTestActive] = useState(false);
  const [tabSwitchAlert, setTabSwitchAlert] = useState(null); // stores message if auto-submitted
  const [lockStatusMap, setLockStatusMap] = useState({}); // problemId -> { isLocked, remainingMs, unlockTime }

  const isTeacherOrAdmin = user?.role === "faculty" || user?.role === "teacher" || user?.role === "admin";
  const timerRef = useRef(null);
  const isSubmittingRef = useRef(false);

  // Helper: Get lock key
  const getLockKey = useCallback(
    (problemId) => `techverse_lock_${user?._id || user?.id || "guest"}_${problemId}`,
    [user]
  );

  // Helper: Refresh Lockouts
  const refreshLockouts = useCallback(
    (problemsList = []) => {
      const now = Date.now();
      const updatedMap = {};
      const listToCheck = problemsList.length > 0 ? problemsList : currentTest?.problems || [];

      listToCheck.forEach((prob) => {
        if (!prob?._id) return;
        const key = getLockKey(prob._id);
        const storedTs = localStorage.getItem(key);
        if (storedTs) {
          const timestamp = parseInt(storedTs, 10);
          const elapsed = now - timestamp;
          if (elapsed < LOCKOUT_DURATION_MS) {
            updatedMap[prob._id] = {
              isLocked: true,
              remainingMs: LOCKOUT_DURATION_MS - elapsed,
              unlockTime: new Date(timestamp + LOCKOUT_DURATION_MS)
            };
          } else {
            localStorage.removeItem(key);
            updatedMap[prob._id] = { isLocked: false, remainingMs: 0 };
          }
        } else {
          updatedMap[prob._id] = { isLocked: false, remainingMs: 0 };
        }
      });
      setLockStatusMap(updatedMap);
    },
    [currentTest, getLockKey]
  );

  // Lock a problem for 24 Hours
  const lockProblem = useCallback(
    (problemId) => {
      if (!problemId) return;
      const key = getLockKey(problemId);
      localStorage.setItem(key, Date.now().toString());
      refreshLockouts();
    },
    [getLockKey, refreshLockouts]
  );

  // Load coding tests from backend
  const loadTests = async () => {
    setLoading(true);
    try {
      const list = await codingService.getAllCodingTests();
      setTests(list);
      if (list.length > 0) {
        const testToSelect = currentTest ? list.find((t) => t._id === currentTest._id) || list[0] : list[0];
        setCurrentTest(testToSelect);
        refreshLockouts(testToSelect.problems || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, []);

  // Live timer interval for lockout countdown
  useEffect(() => {
    const interval = setInterval(() => {
      refreshLockouts();
    }, 1000);
    return () => clearInterval(interval);
  }, [refreshLockouts]);

  // Live 4-Hour Timer for Active Test in Compiler Mode
  useEffect(() => {
    if (viewMode === "compiler" && isTestActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            // Auto submit on time out
            handleFinalSubmit([], "time_expired");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [viewMode, isTestActive, timeLeft]);

  // Format seconds into HH:MM:SS
  const formatExamTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Format lockout remaining time
  const formatLockRemaining = (ms) => {
    const totalSecs = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  // Open problem in compiler
  const handleOpenInCompiler = (prob) => {
    const lockInfo = lockStatusMap[prob._id];
    if (lockInfo?.isLocked) {
      showError(`This problem is locked for 24 hours. Retry available in ${formatLockRemaining(lockInfo.remainingMs)}.`);
      return;
    }

    setSelectedProblem(prob);
    setCode(prob.starterCode?.[language] || prob.starterCode?.python || prob.starterCode?.javascript || "");
    setTestResults(null);
    setConsoleOutput("");
    setTimeLeft(FOUR_HOURS_IN_SECONDS);
    setIsTestActive(true);
    setViewMode("compiler");
  };

  // Handle Tab Switch Auto-Submit Execution
  const handleTabSwitchAutoSubmit = useCallback(async () => {
    if (isSubmittingRef.current || !selectedProblem || !currentTest || !isTestActive) return;

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setIsTestActive(false);

    // Apply 24-hour lockout immediately
    lockProblem(selectedProblem._id);

    setTabSwitchAlert({
      problemTitle: selectedProblem.title,
      reason: "Tab switch detected while solving this test problem.",
      time: new Date().toLocaleTimeString(),
    });

    try {
      const result = await codingService.submitCode(
        currentTest._id,
        selectedProblem._id,
        language,
        code,
        {
          violations: [{ type: "tab_switch", timestamp: new Date().toISOString() }],
          submissionType: "tab_switch_auto_submit",
        }
      );
      setTestResults(result);
      setConsoleOutput(
        `🚨 TEST AUTO-SUBMITTED (TAB SWITCH DETECTED)\n----------------------------------------\nYou switched tabs or minimized the browser window during testing.\nPer VCET examination regulations, your current code was automatically compiled and submitted.\n\n🔒 24-HOUR LOCKOUT ACTIVATED:\nYou can retry solving this problem after 24 hours.\n\nExecution Result:\nStatus: ${result.status}\nPassed Cases: ${result.passedCases || 0}/${result.totalCases || 0}`
      );
    } catch (err) {
      console.error("Auto submit failed:", err);
      setConsoleOutput("🚨 Test auto-submitted due to tab switch.\nProblem is locked for 24 hours.");
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  }, [selectedProblem, currentTest, isTestActive, language, code, lockProblem]);

  // Anti-Cheat Tab-Switch Detection Listener
  useEffect(() => {
    if (viewMode !== "compiler" || !isTestActive) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleTabSwitchAutoSubmit();
      }
    };

    const handleBlur = () => {
      // Optional extra protection when window loses focus
      if (document.hidden) {
        handleTabSwitchAutoSubmit();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [viewMode, isTestActive, handleTabSwitchAutoSubmit]);

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

  // Final Manual Submit Handler
  const handleFinalSubmit = useCallback(
    async (violationsList = [], submissionType = "manual") => {
      if (!currentTest || !selectedProblem || isSubmitting) return;
      setIsSubmitting(true);
      setActiveOutputTab("console");
      setConsoleOutput("Evaluating solution against all hidden server-side test cases...\n");

      // Lock problem for 24 hours on submission
      lockProblem(selectedProblem._id);
      setIsTestActive(false);

      try {
        const result = await codingService.submitCode(
          currentTest._id,
          selectedProblem._id,
          language,
          code,
          { violations: violationsList, submissionType }
        );

        setTestResults(result);

        if (result.isAccepted || result.status === "Accepted") {
          setConsoleOutput(
            `✅ All ${result.passedCases || result.totalCases}/${result.totalCases} Test Cases Passed!\n\nStatus: Accepted\nExecution Time: ${result.executionTime}s\nMemory: ${result.memory}MB\n\n🔒 Note: Cooldown active. You can retry solving questions after 24 hours.`
          );
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          showSuccess("Accepted! Solution passed all test suites.");
          refreshStreak();
        } else {
          setConsoleOutput(
            `❌ ${result.status} (${result.passedCases || 0}/${result.totalCases} cases passed)\n\nExecution Time: ${result.executionTime}s\nMemory: ${result.memory}MB${
              result.compileErrorMessage ? `\n\nCompiler output:\n${result.compileErrorMessage}` : ""
            }\n\n🔒 Note: This problem is now locked for 24 hours.`
          );
          showError(`Solution status: ${result.status}`);
        }
      } catch (err) {
        if (err?.busy) {
          setConsoleOutput(`>>> Arena temporarily unavailable.\n${err.message}`);
          showError(err.message);
        } else {
          showError("Submission failed. Please check network connection.");
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentTest, selectedProblem, isSubmitting, language, code, lockProblem, refreshStreak, showSuccess, showError]
  );

  // Filter problems for list view
  const allProblems = currentTest?.problems || [];
  const filteredProblems = allProblems.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(p.tags) && p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesDiff = selectedDifficulty === "All" || p.difficulty === selectedDifficulty;
    return matchesSearch && matchesDiff;
  });

  if (loading && !currentTest) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Loading Coding Arena...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* 0. Educator / Teacher Management Banner */}
      {isTeacherOrAdmin && (
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 border border-blue-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md">
              <ShieldCheck className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-white">Educator / Faculty Management</span>
                <span className="px-2 py-0.5 rounded-md bg-blue-500/30 text-blue-200 text-[10px] font-bold">
                  Problem Management
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                Create new coding problem statements, set creators, customize test suites and starter templates.
              </p>
            </div>
          </div>

          <Link
            to={user?.role === "admin" ? "/admin/coding" : "/faculty/coding"}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-blue-900 font-black text-xs hover:bg-blue-50 shadow-md active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            <Settings className="w-4 h-4 text-[#0062A8]" />
            <span>Manage Problems & Tests</span>
          </Link>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW MODE 1: PROBLEM STATEMENT SELECTION LIST             */}
      {/* ======================================================== */}
      {viewMode === "list" && (
        <div className="space-y-6">
          {/* Main Top Header */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0062A8] text-xs font-bold">
                  <Code2 className="w-3.5 h-3.5" />
                  <span>VCET Online Compiler & Test Arena</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Problem Statement Selection
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
                  Browse problem statements designed by department faculty. Click on any problem to launch the online compiler.
                  Attempts feature a <strong className="text-slate-800">4-hour duration</strong>, strict <strong className="text-rose-600">anti-cheat tab-switching auto execution</strong>, and a <strong className="text-slate-800">24-hour retry cooldown</strong>.
                </p>
              </div>

              {/* Assessment Track Switcher */}
              {tests.length > 1 && (
                <div className="shrink-0 space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Assessment Track
                  </label>
                  <select
                    value={currentTest?._id}
                    onChange={(e) => {
                      const found = tests.find((t) => t._id === e.target.value);
                      if (found) {
                        setCurrentTest(found);
                        refreshLockouts(found.problems || []);
                      }
                    }}
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
                  >
                    {tests.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Quick Rules Banner */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                <Clock className="w-5 h-5 text-[#0062A8] shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-800">4-Hour Max Duration</div>
                  <div className="text-[11px] text-slate-500">Ample time to write & verify solutions</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-rose-50/60 border border-rose-100">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-rose-900">Auto-Submits on Tab Switch</div>
                  <div className="text-[11px] text-rose-700">Switching tabs immediately submits test</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50/60 border border-amber-100">
                <Lock className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-amber-900">24-Hour Retry Cooldown</div>
                  <div className="text-[11px] text-amber-700">Can retry solving after 1 day</div>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search problem statement by title, topic..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-bold text-slate-500">Difficulty:</span>
              {["All", "Easy", "Medium", "Hard"].map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedDifficulty === diff
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Problem Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProblems.map((prob, idx) => {
              const lockInfo = lockStatusMap[prob._id] || { isLocked: false };
              const creatorName =
                prob.author ||
                prob.createdByName ||
                currentTest?.createdBy?.name ||
                "Dr. K. S. Sendhilkumar (HOD / CSE)";

              return (
                <div
                  key={prob._id || idx}
                  className={`bg-white rounded-3xl border transition-all flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md ${
                    lockInfo.isLocked
                      ? "border-amber-200/90 bg-amber-50/20"
                      : "border-slate-200 hover:border-blue-400"
                  }`}
                >
                  <div className="p-6 space-y-4">
                    {/* Top Row: Difficulty & 4-Hour Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-bold border ${
                          prob.difficulty === "Easy"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : prob.difficulty === "Hard"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {prob.difficulty || "Medium"}
                      </span>

                      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        <Clock className="w-3 h-3 text-[#0062A8]" />
                        <span>4 Hours</span>
                      </div>
                    </div>

                    {/* Problem Title */}
                    <div>
                      <h3 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                        {prob.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                        {prob.description}
                      </p>
                    </div>

                    {/* Creator Info (Name of who created this problem statement) */}
                    <div className="pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-blue-50/80 border border-blue-100 text-[#0062A8]">
                        <User className="w-4 h-4 shrink-0 text-[#0062A8]" />
                        <div className="text-[11px] leading-tight">
                          <span className="text-slate-500 block text-[10px] font-medium">Problem Created By:</span>
                          <span className="font-bold text-slate-900">{creatorName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    {prob.tags && (
                      <div className="flex flex-wrap gap-1.5">
                        {(Array.isArray(prob.tags) ? prob.tags : [prob.tags]).map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-semibold"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom / Action Area */}
                  <div className="p-6 pt-0">
                    {lockInfo.isLocked ? (
                      <div className="space-y-2">
                        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
                          <div className="flex items-center gap-2 font-bold">
                            <Lock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Locked for 24h</span>
                          </div>
                          <span className="font-mono text-[11px] font-bold text-amber-700">
                            {formatLockRemaining(lockInfo.remainingMs)}
                          </span>
                        </div>
                        <button
                          type="button"
                          disabled
                          className="w-full py-3 rounded-2xl text-xs font-bold bg-slate-100 text-slate-400 cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <Lock className="w-4 h-4" />
                          <span>Retry Available After 1 Day</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenInCompiler(prob)}
                        className="w-full py-3 px-4 rounded-2xl text-xs font-black bg-[#0062A8] hover:bg-[#004f88] text-white flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 active:scale-98 transition-all cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Solve Problem in Compiler</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProblems.length === 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <Code2 className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No problems match your search</h3>
              <p className="text-xs text-slate-500">Try adjusting your search terms or difficulty filter.</p>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW MODE 2: ACTIVE ONLINE COMPILER WORKSPACE             */}
      {/* ======================================================== */}
      {viewMode === "compiler" && selectedProblem && (
        <div className="space-y-6">
          {/* Top Bar for Compiler Mode */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                title="Return to problem list"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Problems</span>
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">
                    {selectedProblem.title}
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      selectedProblem.difficulty === "Easy"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : selectedProblem.difficulty === "Hard"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {selectedProblem.difficulty || "Medium"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <User className="w-3.5 h-3.5 text-[#0062A8]" />
                  <span>
                    Created by:{" "}
                    <strong className="text-slate-800">
                      {selectedProblem.author ||
                        selectedProblem.createdByName ||
                        currentTest?.createdBy?.name ||
                        "Dr. K. S. Sendhilkumar (HOD / CSE)"}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Test Timer & Anti-Cheat Status */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-2xl border border-slate-800 shadow-sm">
                <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">
                    4-Hour Test Timer
                  </span>
                  <span className="text-sm font-mono font-black text-amber-400">
                    {formatExamTime(timeLeft)}
                  </span>
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Anti-Cheat Active: Tab switch auto-submits</span>
              </div>
            </div>
          </div>

          {/* Main Coding Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 5 Cols: Problem Description & Creator Details */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-5 max-h-[75vh] overflow-y-auto">
                {/* Creator Attribution Card */}
                <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#0062A8] text-white flex items-center justify-center font-bold text-xs">
                      {((selectedProblem.author || selectedProblem.createdByName || "Prof")[0]).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        Problem Author
                      </div>
                      <div className="text-xs font-bold text-slate-900">
                        {selectedProblem.author ||
                          selectedProblem.createdByName ||
                          currentTest?.createdBy?.name ||
                          "Dr. K. S. Sendhilkumar (HOD / CSE)"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded text-[#0062A8] border border-blue-200">
                      VCET CSE
                    </span>
                  </div>
                </div>

                {/* Problem Statement Details */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Problem Description
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                    {selectedProblem.description}
                  </p>
                </div>

                {/* Input & Output format */}
                {selectedProblem.inputFormat && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Input Format
                    </h4>
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 font-mono">
                      {selectedProblem.inputFormat}
                    </p>
                  </div>
                )}

                {selectedProblem.outputFormat && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Output Format
                    </h4>
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 font-mono">
                      {selectedProblem.outputFormat}
                    </p>
                  </div>
                )}

                {/* Constraints */}
                {selectedProblem.constraints && selectedProblem.constraints.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Constraints
                    </h4>
                    <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                      {Array.isArray(selectedProblem.constraints) ? (
                        selectedProblem.constraints.map((c, i) => <li key={i}>{c}</li>)
                      ) : (
                        <li>{selectedProblem.constraints}</li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Sample Test Cases */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Sample Test Cases
                  </h4>
                  {(selectedProblem.publicTestCases || []).slice(0, 3).map((tc, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
                      <div className="font-mono text-slate-700 whitespace-pre-wrap">
                        <strong className="text-slate-900">Input:</strong> {tc.input}
                      </div>
                      <div className="font-mono text-emerald-700 whitespace-pre-wrap">
                        <strong className="text-slate-900">Expected:</strong> {tc.expectedOutput}
                      </div>
                      {tc.explanation && (
                        <div className="text-[11px] text-slate-400 italic">
                          Explanation: {tc.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 7 Cols: Online Compiler & Execution Console */}
            <div className="lg:col-span-7 space-y-4">
              {/* Compiler Controls Bar */}
              <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Language:
                  </span>
                  <select
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetCode}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                    title="Reset Code Template"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="hidden sm:inline">Reset Template</span>
                  </button>
                </div>
              </div>

              {/* Code Editor Window */}
              <div className="relative bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                    <span className="ml-2 font-bold text-slate-300">
                      solution{SUPPORTED_LANGUAGES.find((l) => l.id === language)?.extension || ".py"}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold">Online Sandbox Compiler</span>
                </div>

                <div className="h-[430px]">
                  <Suspense
                    fallback={
                      <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        spellCheck="false"
                        className="w-full h-full p-4 bg-transparent text-slate-100 font-mono text-xs sm:text-sm leading-relaxed focus:outline-none resize-none selection:bg-blue-600/40"
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
              </div>

              {/* Editor Action Buttons: Run & Submit */}
              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  disabled={isRunning || isSubmitting}
                  onClick={handleRunPublicCases}
                  className="px-6 py-3 rounded-2xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                  <span>{isRunning ? "Running Compiler..." : "Run Public Cases"}</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting || isRunning}
                  onClick={() => handleFinalSubmit([], "manual")}
                  className="px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{isSubmitting ? "Evaluating..." : "Submit Solution"}</span>
                </button>
              </div>

              {/* Console & Test Results Window */}
              <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-xl space-y-4">
                <div className="flex items-center gap-4 pb-3 border-b border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveOutputTab("console")}
                    className={`text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      activeOutputTab === "console"
                        ? "text-blue-400 border-b-2 border-blue-400 pb-1"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Compiler Terminal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveOutputTab("testcases")}
                    className={`text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      activeOutputTab === "testcases"
                        ? "text-blue-400 border-b-2 border-blue-400 pb-1"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Test Cases {testResults ? `(${testResults.passedCases || 0}/${testResults.totalCases || 0})` : ""}</span>
                  </button>
                </div>

                {activeOutputTab === "console" ? (
                  <pre className="p-4 rounded-2xl bg-slate-950 font-mono text-xs text-slate-300 min-h-[120px] max-h-[220px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                    {consoleOutput || "Compiler output and runtime execution logs will appear here after clicking 'Run Public Cases' or 'Submit Solution'."}
                  </pre>
                ) : (
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto">
                    {(testResults?.testResults || []).length > 0 ? (
                      testResults.testResults.map((tr, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-2xl border text-xs flex items-start justify-between gap-3 ${
                            tr.passed
                              ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
                              : "bg-rose-950/30 border-rose-500/40 text-rose-200"
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="font-bold flex items-center gap-1.5">
                              {tr.passed ? (
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                              )}
                              <span>
                                Test Case #{tr.testCaseNumber} {tr.isHidden ? "(Hidden Verification)" : "(Public)"}
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
                          <span className="text-[11px] font-mono text-slate-400 shrink-0">
                            {tr.executionTime}ms
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic p-2">
                        No test cases run yet. Click 'Run Public Cases' to execute your code.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB-SWITCH AUTO-SUBMITTED NOTIFICATION MODAL             */}
      {/* ======================================================== */}
      {tabSwitchAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-rose-200 space-y-5 text-center">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase bg-rose-50 text-rose-700 border border-rose-200">
                Anti-Cheat Auto-Submission
              </span>
              <h3 className="text-xl font-black text-slate-900">
                Tab Switch Detected — Test Auto-Submitted!
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                You navigated away or switched browser tabs while solving{" "}
                <strong className="text-slate-900">"{tabSwitchAlert.problemTitle}"</strong>.
                Per VCET test solving protocols, your solution was automatically compiled and submitted to prevent unauthorized assistance.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-left space-y-1.5">
              <div className="font-bold flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>24-Hour (1 Day) Cooldown Activated</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                You can retry solving this problem statement after 24 hours. Your current attempt has been logged for evaluation.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setTabSwitchAlert(null);
                  setViewMode("list");
                }}
                className="w-full py-3 rounded-2xl text-xs font-black bg-slate-900 hover:bg-slate-800 text-white transition-all cursor-pointer shadow-md"
              >
                Return to Problem Statements
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
