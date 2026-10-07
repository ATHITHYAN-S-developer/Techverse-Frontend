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
  ShieldAlert,
  ShieldCheck,
  Clock,
  Maximize2,
  Minimize2,
  HelpCircle,
  Flame,
  Layers,
  Award,
  ChevronDown,
  ChevronUp,
  Settings,
  Edit,
  Cpu,
  RefreshCw,
  User,
  Lock,
  Unlock,
  AlertTriangle,
  Search,
  Check,
  GraduationCap,
  Globe,
  FileCode,
  FileText,
  BarChart3,
  X,
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

const LOCKOUT_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

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

  // Mobile Workspace Navigation: "specs" | "editor" | "output"
  const [mobileTab, setMobileTab] = useState("editor");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Dynamic Per-Problem / Per-Test Timer & Proctoring
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [isTestActive, setIsTestActive] = useState(false);
  const [tabSwitchAlert, setTabSwitchAlert] = useState(null);
  const [lockStatusMap, setLockStatusMap] = useState({}); // problemId -> { isLocked, remainingMs, unlockTime }

  // Pre-Test Readiness & Fullscreen Confirmation Modal State
  const [preTestModalProblem, setPreTestModalProblem] = useState(null);
  const [agreedToGuidelines, setAgreedToGuidelines] = useState(false);

  // Submission "END" confirmation & assessment flow states
  const [showEndSubmitModal, setShowEndSubmitModal] = useState(false);
  const [endInputText, setEndInputText] = useState("");
  const [submissionSummary, setSubmissionSummary] = useState(null);
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false);
  const [isTerminalCollapsed, setIsTerminalCollapsed] = useState(false);
  const [specTab, setSpecTab] = useState("description"); // "description" | "samples"
  const [copiedKey, setCopiedKey] = useState(null);

  const isTeacherOrAdmin = user?.role === "faculty" || user?.role === "teacher" || user?.role === "admin";
  const timerRef = useRef(null);
  const isSubmittingRef = useRef(false);

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

  // Helper: Format duration minutes into user-friendly text (e.g. "45 Mins", "1 Hour", "2 Hours")
  const formatDurationText = useCallback((mins) => {
    const m = Number(mins) || 45;
    if (m >= 60 && m % 60 === 0) {
      const h = m / 60;
      return `${h} Hour${h > 1 ? "s" : ""}`;
    }
    if (m >= 60) {
      const h = Math.floor(m / 60);
      const remM = m % 60;
      return `${h}h ${remM}m`;
    }
    return `${m} Mins`;
  }, []);

  // Helper: Get effective time limit in minutes for a problem or test
  const getEffectiveMinutes = useCallback(
    (prob) => {
      if (prob?.timeLimit && Number(prob.timeLimit) > 0) {
        return Number(prob.timeLimit);
      }
      if (currentTest?.timeLimit && Number(currentTest.timeLimit) > 0) {
        return Number(currentTest.timeLimit);
      }
      return 45;
    },
    [currentTest]
  );

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
              unlockTime: new Date(timestamp + LOCKOUT_DURATION_MS),
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
      console.error("Failed to load tests", err);
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

  // Live Dynamic Timer for Active Test in Compiler Mode
  useEffect(() => {
    if (viewMode === "compiler" && isTestActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            // Auto submit on time out
            handleFinalSubmit([], "time_expired");
            showInfo("Exam time limit reached! Solution automatically submitted.");
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

  // Format seconds into HH:MM:SS or MM:SS
  const formatExamTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
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

  // Prompt Readiness & Fullscreen Authorization Dialog before opening compiler
  const handleRequestStartTest = (prob) => {
    const lockInfo = lockStatusMap[prob._id];
    if (lockInfo?.isLocked) {
      showError(`This problem is locked for 24 hours. Retry available in ${formatLockRemaining(lockInfo.remainingMs)}.`);
      return;
    }
    setPreTestModalProblem(prob);
    setAgreedToGuidelines(false);
  };

  // User confirmed readiness and authorizes Fullscreen mode
  const handleConfirmEnterTest = async () => {
    if (!preTestModalProblem) return;
    const prob = preTestModalProblem;

    // Trigger Browser Fullscreen
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        await document.documentElement.webkitRequestFullscreen();
      }
    } catch (err) {
      console.warn("Fullscreen request was not granted by browser:", err);
    }

    const durationMins = getEffectiveMinutes(prob);
    const durationSeconds = durationMins * 60;

    setSelectedProblem(prob);
    setCode(prob.starterCode?.[language] || prob.starterCode?.python || prob.starterCode?.javascript || "");
    setTestResults(null);
    setConsoleOutput("");
    setTimeLeft(durationSeconds);
    setIsTestActive(true);
    setIsFullscreen(true);
    setMobileTab("editor");
    setViewMode("compiler");
    setPreTestModalProblem(null);
    showSuccess(`Assessment started in Fullscreen (${formatDurationText(durationMins)})`);
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

  // Request to exit assessment (asks for confirmation if test is active)
  const handleExitAssessment = () => {
    if (isTestActive) {
      setShowExitConfirmModal(true);
    } else {
      setViewMode("list");
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // User confirmed exit from active exam
  const handleConfirmExit = () => {
    setShowExitConfirmModal(false);
    setIsTestActive(false);
    setViewMode("list");
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setIsFullscreen(false);
    showInfo("Assessment session exited. Your progress was preserved.");
  };

  // Trigger the "END" confirmation modal before submitting
  const handleRequestSubmitSolution = () => {
    if (!currentTest || !selectedProblem || isSubmitting) return;
    setEndInputText("");
    setShowEndSubmitModal(true);
  };

  // Confirmed final submission after typing "END"
  const handleConfirmEndSubmit = async () => {
    if (endInputText.trim().toUpperCase() !== "END") return;
    setShowEndSubmitModal(false);
    setEndInputText("");
    await handleFinalSubmit([], "manual_end");
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

  // Final Manual / Auto Submit Handler
  const handleFinalSubmit = useCallback(
    async (violationsList = [], submissionType = "manual_end") => {
      if (!currentTest || !selectedProblem || isSubmitting) return;
      setIsSubmitting(true);
      setActiveOutputTab("console");
      setMobileTab("output");
      setConsoleOutput("Evaluating solution against all hidden server-side test cases...\n");

      const isForcedEnd = submissionType === "time_expired" || submissionType === "tab_switch_auto_submit";
      const isManualEnd = submissionType === "manual_end" || submissionType === "manual";

      if (isForcedEnd || isManualEnd) {
        setIsTestActive(false);
        lockProblem(selectedProblem._id);
      }

      try {
        const result = await codingService.submitCode(
          currentTest._id,
          selectedProblem._id,
          language,
          code,
          { violations: violationsList, submissionType }
        );

        setTestResults(result);

        if (isManualEnd || isForcedEnd) {
          // Escape from the exam and return to problem list!
          setIsTestActive(false);
          lockProblem(selectedProblem._id);
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
          }
          setIsFullscreen(false);
          setViewMode("list");
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
        }
      } catch (err) {
        if (err?.busy) {
          setConsoleOutput(`>>> Arena temporarily unavailable.\n${err.message}`);
          showError(err.message);
        } else {
          showError("Submission failed. Please check network connection.");
        }
        if (isManualEnd || isForcedEnd) {
          setViewMode("list");
          setIsTestActive(false);
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
          }
          setIsFullscreen(false);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentTest, selectedProblem, isSubmitting, language, code, lockProblem, refreshStreak, showSuccess, showError, showInfo]
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

  const activeTestDuration = currentTest?.timeLimit ? Number(currentTest.timeLimit) : 45;
  const activeProblemDuration = selectedProblem ? getEffectiveMinutes(selectedProblem) : activeTestDuration;

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
                  Browse problem statements designed by department faculty. Click on any problem to launch the online
                  compiler. Attempts feature a{" "}
                  <strong className="text-slate-900 font-extrabold">
                    {formatDurationText(activeTestDuration)} duration
                  </strong>
                  , strict <span className="text-rose-600 font-bold">anti-cheat tab-switching auto execution</span>, and
                  a <strong className="text-amber-700 font-bold">24-hour retry cooldown</strong>.
                </p>
              </div>

              {/* Assessment Track Switcher */}
              {tests.length > 1 && (
                <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shrink-0 w-full lg:w-80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-vcet-blue" />
                      <span>Assessment Track</span>
                    </span>
                    <span className="text-[10px] font-bold text-vcet-blue bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      {tests.length} Tracks Available
                    </span>
                  </div>

                  <select
                    value={currentTest?._id || ""}
                    onChange={(e) => {
                      const found = tests.find((t) => t._id === e.target.value);
                      if (found) {
                        setCurrentTest(found);
                        refreshLockouts(found.problems || []);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 text-slate-900 text-xs font-bold rounded-xl focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-xs outline-none"
                  >
                    {tests.map((t) => {
                      const isDept = t.targetAudience === "department" && t.department && t.department !== "ALL";
                      return (
                        <option key={t._id} value={t._id}>
                          {t.title} ({formatDurationText(t.timeLimit || 45)}) {isDept ? `[${t.department} Only]` : "[All VCET]"}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}
            </div>

            {/* Quick Rules Banner (Fully Responsive 1-col on mobile, 3-col on desktop) */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-vcet-blue flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {formatDurationText(activeTestDuration)} Test Timer
                  </div>
                  <div className="text-[11px] text-slate-500">Configured time per problem attempt</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-rose-900">Auto-Submits on Tab Switch</div>
                  <div className="text-[11px] text-rose-700">Switching tabs immediately submits test</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-900">24-Hour Retry Cooldown</div>
                  <div className="text-[11px] text-amber-700">Can retry solving after 1 day</div>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar (Mobile Stacked, Desktop Inline) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search problem statement by title, topic..."
                className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-300 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 shadow-2xs outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-bold text-slate-500 mr-1 shrink-0">Difficulty:</span>
              {["All", "Easy", "Medium", "Hard"].map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedDifficulty === diff
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Problem Cards Grid (1 col on mobile, 2 col on tablet, 3 col on desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredProblems.map((prob, idx) => {
              const lockInfo = lockStatusMap[prob._id] || { isLocked: false };
              const probDurationMins = getEffectiveMinutes(prob);
              const creatorName =
                prob.author ||
                prob.createdByName ||
                currentTest?.createdBy?.name ||
                "Dr. S. K. Manikandan (Faculty / VCET)";

              return (
                <div
                  key={prob._id || idx}
                  className={`bg-white rounded-3xl border transition-all flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                    lockInfo.isLocked
                      ? "border-amber-200/90 bg-amber-50/20"
                      : "border-slate-200/90 hover:border-vcet-blue"
                  }`}
                >
                  <div className="p-5 sm:p-6 space-y-4">
                    {/* Top Row: Difficulty & Dynamic Time Limit Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black border ${
                          prob.difficulty === "Easy"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : prob.difficulty === "Hard"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            prob.difficulty === "Easy"
                              ? "bg-emerald-500"
                              : prob.difficulty === "Hard"
                              ? "bg-rose-500"
                              : "bg-amber-500"
                          }`}
                        />
                        <span>{prob.difficulty || "Medium"}</span>
                      </span>

                      {/* Dynamic Time Limit Pill (Working per test/problem) */}
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
                        <Clock className="w-3.5 h-3.5 text-vcet-blue" />
                        <span>{formatDurationText(probDurationMins)}</span>
                      </div>
                    </div>

                    {/* Problem Title */}
                    <div>
                      <h3 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {prob.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                        {prob.description}
                      </p>
                    </div>

                    {/* Problem Creator Badge */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-blue-50/70 border border-blue-100/80 text-vcet-blue">
                        <div className="w-7 h-7 rounded-full bg-vcet-blue text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {((creatorName || "P")[0]).toUpperCase()}
                        </div>
                        <div className="text-[11px] leading-tight min-w-0">
                          <span className="text-slate-500 block text-[10px] font-medium truncate">Problem Author:</span>
                          <span className="font-bold text-slate-900 truncate block">{creatorName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Company / Topic Tags */}
                    {prob.tags && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(Array.isArray(prob.tags) ? prob.tags : [prob.tags]).map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-semibold"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom / Action Area */}
                  <div className="p-5 sm:p-6 pt-0">
                    {lockInfo.isLocked ? (
                      <div className="space-y-2">
                        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold">
                            <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Locked for 24h</span>
                          </div>
                          <span className="font-mono text-[11px] font-bold text-amber-700">
                            {formatLockRemaining(lockInfo.remainingMs)}
                          </span>
                        </div>
                        <button
                          type="button"
                          disabled
                          className="w-full py-2.5 rounded-2xl text-xs font-bold bg-slate-100 text-slate-400 cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <Lock className="w-4 h-4" />
                          <span>Retry Available After 1 Day</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRequestStartTest(prob)}
                        className="w-full py-3 px-4 rounded-2xl text-xs font-black bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 active:scale-98 transition-all cursor-pointer"
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
      {/* ======================================================== */}
      {/* VIEW MODE 2: FULL-SCREEN REDESIGNED COMPILER WORKSPACE    */}
      {/* Rendered via portal directly to document.body to ensure   */}
      {/* 100% viewport width/height, hiding all sidebars & banners */}
      {/* ======================================================== */}
      {viewMode === "compiler" && selectedProblem && createPortal(
        <div className="fixed inset-0 z-[9999] w-screen h-screen bg-[#0A0E17] text-slate-100 flex flex-col overflow-hidden select-text font-sans antialiased">
          {/* 1. TOP HEADER NAVIGATION BAR */}
          <header className="h-14 bg-[#0D1322] border-b border-slate-800/90 px-3 sm:px-6 flex items-center justify-between gap-3 shrink-0 shadow-lg select-none">
            {/* Left: Exit + Problem Title & Difficulty + Author */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
              <button
                type="button"
                onClick={handleExitAssessment}
                className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 hover:text-white border border-slate-700/80 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold shrink-0"
                title="Exit Assessment"
              >
                <ArrowLeft className="w-4 h-4 text-slate-400" />
                <span className="hidden sm:inline">Exit Exam</span>
              </button>

              <div className="h-4 w-px bg-slate-800 hidden sm:block shrink-0" />

              <div className="min-w-0 flex items-center gap-2 sm:gap-2.5">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight truncate max-w-[140px] sm:max-w-xs md:max-w-md">
                  {selectedProblem.title}
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 border ${
                    selectedProblem.difficulty === "Easy"
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : selectedProblem.difficulty === "Hard"
                      ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                      : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                  }`}
                >
                  {selectedProblem.difficulty || "Medium"}
                </span>

                <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-400 pl-2 border-l border-slate-800 shrink-0 truncate">
                  <User className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="truncate">
                    Author:{" "}
                    <strong className="text-slate-200">
                      {selectedProblem.author ||
                        selectedProblem.createdByName ||
                        currentTest?.createdBy?.name ||
                        "Dr. S. K. Manikandan"}
                    </strong>
                  </span>
                  <span className="text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 px-1.5 py-0.2 rounded-md">
                    VCET Faculty
                  </span>
                </div>
              </div>
            </div>

            {/* Center: Live Countdown HUD & Anti-Cheat Badge */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Dynamic Live Test Timer */}
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono font-bold text-xs sm:text-sm tracking-wider transition-all ${
                  timeLeft <= 60
                    ? "bg-rose-950/80 text-rose-300 border-rose-700/80 shadow-md shadow-rose-950/50 animate-pulse"
                    : timeLeft <= 300
                    ? "bg-amber-950/80 text-amber-300 border-amber-700/80 animate-pulse"
                    : "bg-slate-900/90 text-amber-400 border-slate-700/80 shadow-inner"
                }`}
                title="Continuous Proctored Exam Timer"
              >
                <Clock className={`w-3.5 h-3.5 shrink-0 ${timeLeft <= 300 ? "text-rose-400" : "text-amber-400"}`} />
                <span>{formatExamTime(timeLeft)}</span>
                <span className="text-[9px] font-sans uppercase font-bold text-slate-400 hidden sm:inline">
                  Remaining
                </span>
              </div>

              {/* Anti-Cheat Badge */}
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs font-semibold shrink-0">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="hidden md:inline text-[11px]">Anti-Cheat Active (Tab switch auto-submits)</span>
                <span className="md:hidden text-[10px]">Proctored</span>
              </div>
            </div>

            {/* Right: Language Dropdown, Reset, Fullscreen Toggle */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-xl px-2 sm:px-2.5 py-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 hidden sm:inline">Lang:</span>
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-100 outline-none cursor-pointer"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.id} value={l.id} className="bg-slate-900 text-white">
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleResetCode}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                title="Reset code template"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden lg:inline">Reset</span>
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors cursor-pointer"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Workspace"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </header>

          {/* MOBILE SEGMENTED VIEW SWITCHER (< lg screens) */}
          <div className="lg:hidden flex items-center p-1 bg-slate-900 border-b border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => setMobileTab("specs")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mobileTab === "specs" ? "bg-slate-800 text-sky-400 shadow-xs" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Problem Specs</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileTab("editor")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mobileTab === "editor" ? "bg-slate-800 text-sky-400 shadow-xs" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Code Editor</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileTab("output")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer relative ${
                mobileTab === "output" ? "bg-slate-800 text-sky-400 shadow-xs" : "text-slate-400 hover:text-slate-200"
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
          <main className="flex-1 min-h-0 flex flex-col lg:flex-row gap-3 p-3 pt-2 bg-[#0A0E17] overflow-hidden">
            {/* LEFT PANEL: Problem Statement & Specifications */}
            <div
              className={`w-full lg:w-[42%] xl:w-[40%] flex flex-col bg-[#111827] border border-slate-800/90 rounded-2xl overflow-hidden shadow-2xl ${
                mobileTab !== "specs" ? "hidden lg:flex" : "flex"
              }`}
            >
              {/* Left Panel Tabs Header */}
              <div className="h-11 bg-[#0F172A] border-b border-slate-800 px-4 flex items-center justify-between shrink-0 select-none">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setSpecTab("description")}
                    className={`flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer py-2 ${
                      specTab === "description"
                        ? "text-sky-400 border-b-2 border-sky-400"
                        : "text-slate-400 hover:text-slate-200"
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
                        ? "text-sky-400 border-b-2 border-sky-400"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Sample Test Cases ({selectedProblem.publicTestCases?.length || 0})</span>
                  </button>
                </div>
              </div>

              {/* Left Panel Scrollable Content */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-5 text-slate-300 text-xs sm:text-sm">
                {specTab === "description" ? (
                  <>
                    {/* Faculty Attribution Pill */}
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-vcet-blue text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {((selectedProblem.author || selectedProblem.createdByName || "P")[0]).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                            Author & Faculty
                          </span>
                          <span className="text-xs font-bold text-slate-200 truncate block">
                            {selectedProblem.author ||
                              selectedProblem.createdByName ||
                              currentTest?.createdBy?.name ||
                              "Dr. S. K. Manikandan"}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-md shrink-0">
                        VCET Faculty
                      </span>
                    </div>

                    {/* Problem Statement */}
                    <div className="space-y-1.5">
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Problem Statement
                      </h3>
                      <div className="text-slate-200 leading-relaxed font-sans whitespace-pre-line text-sm">
                        {selectedProblem.description}
                      </div>
                    </div>

                    {/* Input Format */}
                    {selectedProblem.inputFormat && (
                      <div className="space-y-1.5">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Input Format Specification
                        </h4>
                        <pre className="p-3 rounded-xl bg-[#080C16] border border-slate-800 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
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
                        <pre className="p-3 rounded-xl bg-[#080C16] border border-slate-800 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
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
                        <div className="p-3 rounded-xl bg-[#080C16] border border-slate-800 space-y-1 font-mono text-xs text-amber-300">
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
                    <div key={idx} className="p-3.5 rounded-xl bg-[#080C16] border border-slate-800 text-xs space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 pb-1 border-b border-slate-800/80">
                        <span>Sample #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(tc.input, `input_${idx}`)}
                          className="flex items-center gap-1 text-[10px] text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
                        >
                          {copiedKey === `input_${idx}` ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Input</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="font-mono text-slate-200">
                        <span className="text-slate-400 font-bold block text-[10px] uppercase">Input:</span>
                        <pre className="mt-0.5 p-2 rounded-lg bg-[#04060A] border border-slate-800/60 overflow-x-auto whitespace-pre-wrap">
                          {tc.input}
                        </pre>
                      </div>

                      <div className="font-mono text-emerald-400">
                        <span className="text-slate-400 font-bold block text-[10px] uppercase">Expected Output:</span>
                        <pre className="mt-0.5 p-2 rounded-lg bg-[#04060A] border border-slate-800/60 overflow-x-auto whitespace-pre-wrap">
                          {tc.expectedOutput}
                        </pre>
                      </div>

                      {tc.explanation && (
                        <div className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800/60">
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
              className={`flex-1 min-h-0 flex flex-col bg-[#111827] border border-slate-800/90 rounded-2xl overflow-hidden shadow-2xl ${
                mobileTab === "specs" ? "hidden lg:flex" : "flex"
              }`}
            >
              {/* Top Editor Toolbar (Filename & Action Buttons) */}
              <div className="h-12 bg-[#0F172A] border-b border-slate-800 px-3 sm:px-4 flex items-center justify-between shrink-0 select-none">
                {/* File Tab */}
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#080C16] border border-slate-800 text-xs font-mono font-bold text-slate-200">
                    <FileCode className="w-3.5 h-3.5 text-sky-400" />
                    <span>solution{SUPPORTED_LANGUAGES.find((l) => l.id === language)?.extension || ".py"}</span>
                  </span>
                  <span className="hidden sm:inline-block text-[10px] text-slate-500 font-semibold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800">
                    VCET Online Sandbox Compiler
                  </span>
                </div>

                {/* Run & Submit Actions */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    disabled={isRunning || isSubmitting}
                    onClick={handleRunPublicCases}
                    className="px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white flex items-center gap-1.5 border border-slate-700/80 transition-all shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                    <span>{isRunning ? "Running..." : "Run Public Cases"}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting || isRunning}
                    onClick={handleRequestSubmitSolution}
                    className="px-4 sm:px-5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center gap-1.5 shadow-md shadow-emerald-950/70 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? "Evaluating..." : "Submit Solution"}</span>
                  </button>
                </div>
              </div>

              {/* Code Editor Full Canvas */}
              <div className="flex-1 min-h-0 relative bg-[#0F172A] overflow-hidden">
                <Suspense
                  fallback={
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      spellCheck="false"
                      className="w-full h-full p-4 bg-transparent text-slate-100 font-mono text-xs sm:text-sm leading-relaxed resize-none selection:bg-blue-600/40"
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
              <div className="shrink-0 flex flex-col bg-[#080C16] border-t border-slate-800/90 select-none">
                {/* Drawer Header Bar */}
                <div className="h-9 bg-[#0B0F19] px-3 sm:px-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveOutputTab("console");
                        setIsTerminalCollapsed(false);
                      }}
                      className={`flex items-center gap-1.5 font-bold transition-colors cursor-pointer py-1 ${
                        activeOutputTab === "console" && !isTerminalCollapsed
                          ? "text-sky-400 border-b-2 border-sky-400"
                          : "text-slate-400 hover:text-slate-200"
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
                          ? "text-sky-400 border-b-2 border-sky-400"
                          : "text-slate-400 hover:text-slate-200"
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
                      className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                      title="Clear terminal"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsTerminalCollapsed(!isTerminalCollapsed)}
                      className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title={isTerminalCollapsed ? "Expand Terminal" : "Collapse Terminal"}
                    >
                      {isTerminalCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Drawer Body (When Expanded) */}
                {!isTerminalCollapsed && (
                  <div className="h-40 sm:h-52 overflow-hidden bg-[#04060A]">
                    {activeOutputTab === "console" ? (
                      <pre className="h-full p-3 sm:p-4 font-mono text-xs text-slate-300 overflow-y-auto whitespace-pre-wrap leading-relaxed select-text">
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
                                  ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-200"
                                  : "bg-rose-950/20 border-rose-500/40 text-rose-200"
                              }`}
                            >
                              <div className="space-y-1 min-w-0">
                                <div className="font-bold flex items-center gap-1.5">
                                  {tr.passed ? (
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  ) : (
                                    <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
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
          <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0D1322]/95 backdrop-blur-md px-4 py-2.5 border-t border-slate-800 flex items-center justify-between gap-3 shadow-2xl">
            <button
              type="button"
              disabled={isRunning || isSubmitting}
              onClick={handleRunPublicCases}
              className="flex-1 py-2 px-3 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
              <span>{isRunning ? "Running..." : "Run Cases"}</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting || isRunning}
              onClick={handleRequestSubmitSolution}
              className="flex-1 py-2 px-3 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Testing..." : "Submit Solution"}</span>
            </button>
          </div>

          {/* ======================================================== */}
          {/* THE "END" SUBMISSION CONFIRMATION MODAL                   */}
          {/* User must type "END" to finalize and escape from the exam  */}
          {/* ======================================================== */}
          {showEndSubmitModal && (
            <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
              <div className="bg-[#111827] border border-slate-700/80 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 text-slate-100 animate-scaleUp">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                      Assessment Submission
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                      Finalize & Escape Exam
                    </h3>
                  </div>
                </div>

                {/* Problem Info & Warning Notice */}
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Problem:</span>
                    <span className="font-bold text-white truncate max-w-[200px]">{selectedProblem.title}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Time Remaining:</span>
                    <span className="font-mono font-bold text-amber-400">{formatExamTime(timeLeft)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                    Once submitted, your final code will be evaluated against all test cases, this problem will enter a 24-hour review cooldown, and you will escape the test environment.
                  </div>
                </div>

                {/* Prompt & Input Box */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">
                    To confirm and escape the exam, please type <strong className="text-emerald-400 font-mono">END</strong> below:
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={endInputText}
                    onChange={(e) => setEndInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && endInputText.trim().toUpperCase() === "END") {
                        handleConfirmEndSubmit();
                      }
                    }}
                    placeholder="Type END"
                    className={`w-full text-center uppercase tracking-widest font-mono font-bold text-lg py-3 px-4 rounded-xl bg-slate-950 border-2 outline-none transition-all ${
                      endInputText.trim().toUpperCase() === "END"
                        ? "border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/20"
                        : "border-slate-700 text-slate-200 focus:border-sky-500"
                    }`}
                  />
                  {endInputText.trim().toUpperCase() === "END" ? (
                    <p className="text-[11px] text-emerald-400 text-center font-bold flex items-center justify-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Ready to submit! Press Enter or click Confirm.
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-500 text-center">
                      Word must match "END" (case-insensitive) to enable submission.
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEndSubmitModal(false);
                      setEndInputText("");
                    }}
                    className="py-3 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel / Keep Coding
                  </button>

                  <button
                    type="button"
                    disabled={endInputText.trim().toUpperCase() !== "END" || isSubmitting}
                    onClick={handleConfirmEndSubmit}
                    className="py-3 px-4 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{isSubmitting ? "Submitting..." : "Confirm & Submit"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* EXIT CONFIRMATION MODAL                                  */}
          {/* ======================================================== */}
          {showExitConfirmModal && (
            <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
              <div className="bg-[#111827] border border-slate-700/80 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 text-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                      Exit Active Assessment
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                      Leave Exam Session?
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  You are currently taking a timed assessment. If you leave without clicking Submit Solution and typing END, your final evaluation will not be recorded.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowExitConfirmModal(false)}
                    className="py-3 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    Stay in Exam
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmExit}
                    className="py-3 px-4 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950 active:scale-95 transition-all cursor-pointer"
                  >
                    Exit to Problems List
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>,
        document.body
      )}

      {/* ======================================================== */}
      {/* TAB-SWITCH AUTO-SUBMITTED NOTIFICATION MODAL             */}
      {/* ======================================================== */}
      {tabSwitchAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-rose-200 space-y-5 text-center">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase bg-rose-50 text-rose-700 border border-rose-200">
                Anti-Cheat Auto-Submission
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                Tab Switch Detected — Test Auto-Submitted!
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                You navigated away or switched browser tabs while solving{" "}
                <strong className="text-slate-900 font-bold">"{tabSwitchAlert.problemTitle}"</strong>.
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

      {/* ======================================================== */}
      {/* PRE-TEST READINESS & FULLSCREEN PERMISSION MODAL         */}
      {/* ======================================================== */}
      {preTestModalProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl border border-slate-200/90 space-y-5 text-slate-800">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 text-vcet-blue flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-vcet-blue block">
                    Assessment Authorization
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                    Ready to Enter Test & Fullscreen?
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreTestModalProblem(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Problem Info Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wider">
                  Selected Challenge
                </span>
                <h4 className="font-bold text-sm text-slate-900 truncate">
                  {preTestModalProblem.title}
                </h4>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-vcet-blue border border-blue-200">
                  {formatDurationText(getEffectiveMinutes(preTestModalProblem))} Timer
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  {preTestModalProblem.difficulty || "Medium"}
                </span>
              </div>
            </div>

            {/* Proctoring Protocol Guidelines */}
            <div className="space-y-2.5 text-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Assessment Proctoring Guidelines:
              </span>

              <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100/90 flex items-start gap-2.5 text-slate-700">
                <Clock className="w-4 h-4 text-vcet-blue shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block font-bold">Continuous Test Timer</strong>
                  <span className="text-[11px] text-slate-600">
                    The {formatDurationText(getEffectiveMinutes(preTestModalProblem))} timer starts immediately and continues running uninterrupted across submissions.
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100/90 flex items-start gap-2.5 text-slate-700">
                <Maximize2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block font-bold">Automatic Fullscreen Requirement</strong>
                  <span className="text-[11px] text-slate-600">
                    Clicking Start will immediately open your browser in Fullscreen mode.
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100/90 flex items-start gap-2.5 text-rose-900">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-rose-950 block font-bold">Anti-Cheat Auto-Submission</strong>
                  <span className="text-[11px] text-rose-700">
                    Switching browser tabs, minimizing the window, or navigating away will automatically submit your attempt and activate a 24-hour retry cooldown.
                  </span>
                </div>
              </div>
            </div>

            {/* Confirmation Checkbox */}
            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreedToGuidelines}
                onChange={(e) => setAgreedToGuidelines(e.target.checked)}
                className="w-4 h-4 rounded text-vcet-blue focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-800">
                I am ready and agree to enter the proctored test in Fullscreen
              </span>
            </label>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setPreTestModalProblem(null)}
                className="py-3 px-4 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                Cancel / Return
              </button>

              <button
                type="button"
                disabled={!agreedToGuidelines}
                onClick={handleConfirmEnterTest}
                className="py-3 px-4 rounded-xl text-xs font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md shadow-blue-500/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Start Fullscreen Test</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ASSESSMENT SUBMITTED RESULTS MODAL (ESCAPED FROM EXAM)   */}
      {/* ======================================================== */}
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

            {/* 24-Hour Cooldown notice */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-left flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">24-Hour Review Cooldown Active</strong>
                <span className="text-[11px] text-slate-600">
                  Per VCET assessment policy, this challenge will unlock for re-attempt after 24 hours.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSubmissionSummary(null)}
              className="w-full py-3.5 rounded-2xl text-xs font-black bg-slate-900 hover:bg-slate-800 text-white transition-all cursor-pointer shadow-md active:scale-98"
            >
              Back to Coding Arena
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
