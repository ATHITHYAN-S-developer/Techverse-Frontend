import React, { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import confetti from "canvas-confetti";
import { codingService } from "../services/codingService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useExamMode } from "../hooks/useExamMode";
import ExamRulesModal from "../components/exam/ExamRulesModal";
import ViolationWarningModal from "../components/exam/ViolationWarningModal";

const SUPPORTED_LANGUAGES = [
  { id: "python", name: "Python 3", extension: ".py" },
  { id: "javascript", name: "JavaScript (Node.js)", extension: ".js" },
  { id: "cpp", name: "C++ (GCC)", extension: ".cpp" },
  { id: "java", name: "Java (OpenJDK)", extension: ".java" },
  { id: "c", name: "C (Clang)", extension: ".c" },
];

export default function CodingPage() {
  const { user, addPoints, incrementStreak } = useAuth();
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

  // Exam Mode State
  const [examModeActive, setExamModeActive] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(2700); // 45 mins in secs

  const isTeacherOrAdmin = user?.role === "faculty" || user?.role === "teacher" || user?.role === "admin";

  // Load coding tests from backend
  const loadTests = async () => {
    setLoading(true);
    try {
      const list = await codingService.getAllCodingTests();
      setTests(list);
      if (list.length > 0) {
        const testToSelect = currentTest ? list.find((t) => t._id === currentTest._id) || list[0] : list[0];
        setCurrentTest(testToSelect);
        if (testToSelect.problems && testToSelect.problems.length > 0) {
          const prob = testToSelect.problems[0];
          setSelectedProblem(prob);
          setCode(prob.starterCode?.[language] || prob.starterCode?.python || prob.starterCode?.javascript || "");
        }
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

  const handleSelectTest = (test) => {
    setCurrentTest(test);
    if (test.problems && test.problems.length > 0) {
      const firstProb = test.problems[0];
      setSelectedProblem(firstProb);
      setCode(firstProb.starterCode?.[language] || firstProb.starterCode?.python || firstProb.starterCode?.javascript || "");
    } else {
      setSelectedProblem(null);
      setCode("");
    }
    setTestResults(null);
    setConsoleOutput("");
  };

  const handleSelectProblem = (prob) => {
    setSelectedProblem(prob);
    setCode(prob.starterCode?.[language] || prob.starterCode?.python || prob.starterCode?.javascript || "");
    setTestResults(null);
    setConsoleOutput("");
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    if (selectedProblem?.starterCode?.[lang]) {
      setCode(selectedProblem.starterCode[lang]);
    } else {
      // Fallback boilerplate
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

  // Exam Submission handler
  const handleFinalSubmit = useCallback(
    async (violationsList = [], submissionType = "manual") => {
      if (!currentTest || !selectedProblem || isSubmitting) return;
      setIsSubmitting(true);
      setActiveOutputTab("console");
      setConsoleOutput("Evaluating solution against all hidden server-side test cases...\n");

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
            `✅ All ${result.passedCases || result.totalCases}/${result.totalCases} Test Cases Passed!\n\nStatus: Accepted\nExecution Time: ${result.executionTime}s\nMemory: ${result.memory}MB`
          );
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          showSuccess(`🎉 Accepted! Solution passed all test suites (+${result.pointsAwarded || selectedProblem.points || 30} Points)`);
          if (result.pointsAwarded) {
            addPoints(result.pointsAwarded, `Solved Coding Problem: ${selectedProblem.title}`);
          }
          incrementStreak();
        } else {
          setConsoleOutput(
            `❌ ${result.status} (${result.passedCases || 0}/${result.totalCases} cases passed)\n\nExecution Time: ${result.executionTime}s\nMemory: ${result.memory}MB`
          );
          showError(`Solution status: ${result.status}`);
        }
      } catch (err) {
        showError("Submission failed. Please check network connection.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentTest, selectedProblem, isSubmitting, language, code, addPoints, incrementStreak, showSuccess, showError]
  );

  // Hook for Exam Mode Proctoring
  const {
    isFullscreen,
    violations,
    violationCount,
    latestViolation,
    showWarningModal,
    dismissWarning,
    enterFullscreen,
    exitFullscreen,
  } = useExamMode({
    isActive: examModeActive,
    maxViolations: currentTest?.settings?.maxViolations || 3,
    onAutoSubmit: (vList, type) => handleFinalSubmit(vList, type),
    onViolationRecorded: async (type, details, count) => {
      if (currentTest) {
        await codingService.reportViolation(currentTest._id, type, details, count);
      }
    },
    enableAntiCopy: currentTest?.settings?.antiCopy !== false,
    enableAntiPaste: currentTest?.settings?.antiPaste !== false,
    enableFullscreen: currentTest?.settings?.fullscreenRequired !== false,
  });

  // Run Code against Public Test Cases Only
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
        setConsoleOutput(
          `>>> [Public Test Suite: ${res.status}]\nPassed ${res.passed || res.passedCases || 0}/${res.total || res.totalCases || 2} public cases.\n\nError/Details:\n${res.testResults?.[0]?.errorMessage || "Output did not match expected output."}`
        );
        showInfo("Some public test cases failed. Check details in Test Cases tab.");
      }
    } catch (err) {
      showError("Execution failed. Please check code syntax.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleStartExamConfirmed = async () => {
    setShowRulesModal(false);
    await enterFullscreen();
    setExamModeActive(true);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (loading && !selectedProblem) {
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
      {/* 0. Teacher / Faculty Management Banner */}
      {isTeacherOrAdmin && (
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 border border-blue-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md">
              <ShieldCheck className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-white">Educator / Teacher Mode</span>
                <span className="px-2 py-0.5 rounded-md bg-blue-500/30 text-blue-200 text-[10px] font-bold">
                  Customization Active
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                You can create custom coding challenges, edit problem statements, starter templates, and hidden test suites.
              </p>
            </div>
          </div>

          <Link
            to={user?.role === "admin" ? "/admin/coding" : "/faculty/coding"}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-blue-900 font-black text-xs hover:bg-blue-50 shadow-md active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            <Settings className="w-4 h-4 text-[#0062A8]" />
            <span>Customize Challenges & Tests</span>
          </Link>
        </div>
      )}

      {/* 1. Header & Proctored Assessment Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-2">
            <Code2 className="w-3.5 h-3.5" />
            <span>TechVerse Placement & Laboratory Coding Arena</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {currentTest?.title || "Algorithmic Practice Arena"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {currentTest?.description || "Solve frequently asked recruitment coding questions with sandboxed compilers and hidden testcase suites."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Assessment Track Switcher Dropdown if multiple exist */}
          {tests.length > 1 && (
            <div className="relative">
              <select
                value={currentTest?._id}
                onChange={(e) => {
                  const found = tests.find((t) => t._id === e.target.value);
                  if (found) handleSelectTest(found);
                }}
                className="px-4 py-2.5 bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {tests.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!examModeActive ? (
            <button
              type="button"
              onClick={() => setShowRulesModal(true)}
              className="px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Enter Exam Mode</span>
            </button>
          ) : (
            <div className="flex items-center gap-3 bg-slate-900 text-white px-4 py-2 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <Clock className="w-4 h-4 animate-pulse" />
                <span>{formatTime(timeLeft)}</span>
              </div>
              <div className="h-4 w-px bg-slate-700" />
              <span className="text-xs font-bold text-rose-400">
                {violationCount} / {currentTest?.settings?.maxViolations || 3} Strikes
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Main Coding Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 5 Cols: Problem Selector & Problem Description */}
        <div className="lg:col-span-5 space-y-4">
          {/* Problem Selector Dropdown / Pills */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                Select Problem ({currentTest?.problems?.length || 0} Available)
              </span>
              <button
                onClick={loadTests}
                className="text-[11px] text-[#0062A8] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                title="Refresh problems"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Sync</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(currentTest?.problems || []).map((p, idx) => {
                const isSelected = selectedProblem?._id === p._id || (!selectedProblem && idx === 0);
                return (
                  <button
                    key={p._id || idx}
                    type="button"
                    onClick={() => handleSelectProblem(p)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <span>{p.title}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                        isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {p.difficulty || "Med"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Problem Statement Card */}
          {selectedProblem ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    selectedProblem.difficulty === "Easy"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : selectedProblem.difficulty === "Hard"
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {selectedProblem.difficulty || "Medium"}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                  <Tag className="w-3.5 h-3.5" />
                  <span>
                    {Array.isArray(selectedProblem.tags)
                      ? selectedProblem.tags.join(", ")
                      : selectedProblem.tags || "Algorithms"}
                  </span>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-900">{selectedProblem.title}</h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 whitespace-pre-line leading-relaxed">
                  {selectedProblem.description}
                </p>
              </div>

              {/* Input & Output format */}
              {selectedProblem.inputFormat && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Input Format
                  </h4>
                  <p className="text-xs text-slate-500">{selectedProblem.inputFormat}</p>
                </div>
              )}

              {selectedProblem.outputFormat && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Output Format
                  </h4>
                  <p className="text-xs text-slate-500">{selectedProblem.outputFormat}</p>
                </div>
              )}

              {/* Constraints */}
              {selectedProblem.constraints && selectedProblem.constraints.length > 0 && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Constraints
                  </h4>
                  <ul className="list-disc list-inside text-xs text-slate-500 space-y-0.5">
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
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm text-center text-slate-400">
              <Code2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-600">No problem selected.</p>
            </div>
          )}
        </div>

        {/* Right 7 Cols: Code Editor & Execution Output */}
        <div className="lg:col-span-7 space-y-4">
          {/* Editor Controls Bar */}
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
                title="Reset Code"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Reset Template</span>
              </button>
            </div>
          </div>

          {/* Interactive Code Editor Area */}
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
              <span>UTF-8</span>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck="false"
              rows={16}
              className="w-full p-4 bg-transparent text-slate-100 font-mono text-xs sm:text-sm leading-relaxed focus:outline-none resize-none selection:bg-blue-600/40"
              placeholder="Write your algorithmic solution here..."
            />
          </div>

          {/* Editor Action Buttons: Run & Submit */}
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              disabled={isRunning || isSubmitting || !selectedProblem}
              onClick={handleRunPublicCases}
              className="px-6 py-3 rounded-2xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              <span>{isRunning ? "Running Compiler..." : "Run Public Cases"}</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting || isRunning || !selectedProblem}
              onClick={() => handleFinalSubmit(violations, "manual")}
              className="px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isSubmitting ? "Evaluating..." : "Submit Solution"}</span>
            </button>
          </div>

          {/* Console / Test Results Tabs */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-4 pb-3 border-b border-slate-800">
              <button
                type="button"
                onClick={() => setActiveOutputTab("console")}
                className={`text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeOutputTab === "console" ? "text-blue-400 border-b-2 border-blue-400 pb-1" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Compiler Terminal</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveOutputTab("testcases")}
                className={`text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeOutputTab === "testcases" ? "text-blue-400 border-b-2 border-blue-400 pb-1" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Test Cases {testResults ? `(${testResults.passedCases || 0}/${testResults.totalCases || 0})` : ""}</span>
              </button>
            </div>

            {activeOutputTab === "console" ? (
              <pre className="p-4 rounded-2xl bg-slate-950 font-mono text-xs text-slate-300 min-h-[100px] max-h-[220px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {consoleOutput || "Compiler output and runtime logs will appear here after clicking 'Run Public Cases' or 'Submit Solution'."}
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
                          {tr.passed ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                          <span>Test Case #{tr.testCaseNumber} {tr.isHidden ? "(Hidden Verification Case)" : "(Public)"}</span>
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
                    No test runs recorded yet. Click 'Run Public Cases' to test your code.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Exam Rules Modal */}
      <ExamRulesModal
        isOpen={showRulesModal}
        title={currentTest?.title || "Placement Algorithmic Assessment"}
        durationMinutes={currentTest?.timeLimit || 45}
        maxViolations={currentTest?.settings?.maxViolations || 3}
        onStartExam={handleStartExamConfirmed}
        onCancel={() => setShowRulesModal(false)}
      />

      {/* Violation Warning Modal */}
      <ViolationWarningModal
        isOpen={showWarningModal}
        violation={latestViolation}
        onDismiss={dismissWarning}
      />
    </div>
  );
}

