import React, { useState, useEffect, lazy, Suspense } from "react";
import {
  Code2,
  Play,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  Clock,
  Terminal,
  FileCode,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Award,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useToast } from "../../context/ToastContext";
import { courseService } from "../../services/courseService";

const CodeEditor = lazy(() => import("../exam/CodeEditor"));

const SUPPORTED_LANGUAGES = [
  { id: "python", name: "Python 3", extension: ".py" },
  { id: "javascript", name: "JavaScript (Node.js)", extension: ".js" },
  { id: "cpp", name: "C++ (GCC)", extension: ".cpp" },
  { id: "java", name: "Java (OpenJDK)", extension: ".java" },
  { id: "c", name: "C (GCC)", extension: ".c" },
];

const DEFAULT_TEMPLATES = {
  python: `# Python 3 Solution\nimport sys\n\ndef solution():\n    # Read input from standard input\n    # lines = sys.stdin.read().strip().split('\\n')\n    print("Hello, TechVerse!")\n\nif __name__ == '__main__':\n    solution()\n`,
  javascript: `// JavaScript (Node.js) Solution\nconst fs = require('fs');\n\nfunction solution() {\n  // const input = fs.readFileSync(0, 'utf-8').trim();\n  console.log("Hello, TechVerse!");\n}\n\nsolution();\n`,
  cpp: `// C++ Solution\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    cout << "Hello, TechVerse!" << endl;\n    return 0;\n}\n`,
  java: `// Java Solution\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Scanner sc = new Scanner(System.in);\n        System.out.println("Hello, TechVerse!");\n    }\n}\n`,
  c: `// C Solution\n#include <stdio.h>\n\nint main() {\n    printf("Hello, TechVerse!\\n");\n    return 0;\n}\n`,
};

export default function ModuleCodingChallenge({
  module,
  courseSlug,
  onProceedToTest,
}) {
  const { showSuccess, showError } = useToast();
  const problems = module?.codingProblems || [];

  const [activeProblemIdx, setActiveProblemIdx] = useState(0);
  const currentProblem = problems[activeProblemIdx] || null;

  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [activeTab, setActiveTab] = useState("editor"); // "editor" | "output"

  // Sync starter code when switching problems or languages
  useEffect(() => {
    if (currentProblem) {
      if (typeof currentProblem.starterCode === "string" && currentProblem.starterCode.trim()) {
        setCode(currentProblem.starterCode);
      } else if (
        typeof currentProblem.starterCode === "object" &&
        currentProblem.starterCode?.[language]
      ) {
        setCode(currentProblem.starterCode[language]);
      } else {
        setCode(DEFAULT_TEMPLATES[language] || DEFAULT_TEMPLATES.python);
      }
      setExecutionResult(null);
    }
  }, [activeProblemIdx, currentProblem, language]);

  const handleCopyText = (text, key) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRunCode = async (isSubmit = false) => {
    if (!code.trim()) {
      showError("Please write some code before executing.");
      return;
    }

    if (isSubmit) {
      setIsSubmitting(true);
    } else {
      setIsRunning(true);
    }

    try {
      const res = await courseService.runModuleCode(courseSlug, module._id || module.id, {
        problemId: currentProblem?._id || currentProblem?.id,
        language,
        sourceCode: code,
        isSubmit,
      });

      setExecutionResult(res);
      setActiveTab("output");

      if (res.allPassed) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
        showSuccess(
          isSubmit
            ? "🎉 All test cases passed! Solution successfully accepted."
            : "✓ Public test cases passed!"
        );
      } else {
        if (res.status === "Compilation Error") {
          showError("Compilation error in your code. Check the console for details.");
        } else if (res.status === "Time Limit Exceeded") {
          showError("Time limit exceeded. Optimize your solution.");
        } else {
          showError(`Failed: ${res.passedCases || 0}/${res.totalCases || 0} test cases passed.`);
        }
      }
    } catch (err) {
      showError(err.message || "Failed to execute code. Please try again.");
    } finally {
      setIsRunning(false);
      setIsSubmitting(false);
    }
  };

  if (!currentProblem) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No Coding Challenges Configured</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          The faculty coordinator has marked this module for coding but hasn&apos;t published any problems yet.
        </p>
      </div>
    );
  }

  // Filter public (non-hidden) test cases for presentation
  const publicTestCases = (currentProblem.testCases || []).filter((tc) => !tc.isHidden);

  return (
    <div className="space-y-4">
      {/* Problem Selector Bar (if module contains multiple challenges) */}
      {problems.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-500 shrink-0">Problems:</span>
          {problems.map((p, idx) => (
            <button
              key={p._id || idx}
              type="button"
              onClick={() => setActiveProblemIdx(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeProblemIdx === idx
                  ? "bg-vcet-blue text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              #{idx + 1} {p.title || `Problem ${idx + 1}`}
            </button>
          ))}
        </div>
      )}

      {/* Main Coding Arena Grid (Split Screen on large displays) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Problem Specification & Test Cases */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs max-h-[750px] overflow-y-auto">
          {/* Header */}
          <div className="space-y-2 border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold tracking-widest text-vcet-blue uppercase">
                Challenge #{activeProblemIdx + 1} of {problems.length}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  currentProblem.difficulty === "Easy"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : currentProblem.difficulty === "Hard"
                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {currentProblem.difficulty || "Medium"}
              </span>
            </div>

            <h2 className="text-lg font-black text-slate-900 leading-snug">
              {currentProblem.title}
            </h2>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Problem Statement</h4>
            <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
              {currentProblem.description}
            </div>
          </div>

          {/* Input & Output Format */}
          {currentProblem.inputFormat && (
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Input Format</h4>
              <pre className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                {currentProblem.inputFormat}
              </pre>
            </div>
          )}

          {currentProblem.outputFormat && (
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Output Format</h4>
              <pre className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                {currentProblem.outputFormat}
              </pre>
            </div>
          )}

          {/* Constraints */}
          {currentProblem.constraints && (
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Constraints</h4>
              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 font-mono text-xs text-amber-900 whitespace-pre-wrap">
                {currentProblem.constraints}
              </div>
            </div>
          )}

          {/* Sample Test Cases */}
          {publicTestCases.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Sample Test Cases</span>
                <span className="text-[10px] text-slate-400 font-normal">Click to copy input</span>
              </h4>

              {publicTestCases.map((tc, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 pb-1 border-b border-slate-200">
                    <span>Sample #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(tc.input, `sample_${idx}`)}
                      className="flex items-center gap-1 text-[10px] text-vcet-blue hover:text-vcet-blue-deep font-bold transition-colors cursor-pointer"
                    >
                      {copiedKey === `sample_${idx}` ? (
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

                  <div className="font-mono">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Input:</span>
                    <pre className="mt-0.5 p-2 rounded-lg bg-white border border-slate-200 overflow-x-auto whitespace-pre-wrap text-slate-800">
                      {tc.input || "(Empty input)"}
                    </pre>
                  </div>

                  <div className="font-mono">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Expected Output:</span>
                    <pre className="mt-0.5 p-2 rounded-lg bg-white border border-slate-200 overflow-x-auto whitespace-pre-wrap text-emerald-700 font-semibold">
                      {tc.output || tc.expectedOutput || "(Empty output)"}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Code Editor + Runner Output */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          {/* Top Control Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:px-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Language:</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Run / Submit Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isRunning || isSubmitting}
                onClick={() => handleRunCode(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 border border-slate-200 transition-all cursor-pointer disabled:opacity-50"
              >
                {isRunning ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-vcet-blue" />
                ) : (
                  <Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                )}
                <span>{isRunning ? "Running..." : "Run Public Cases"}</span>
              </button>

              <button
                type="button"
                disabled={isRunning || isSubmitting}
                onClick={() => handleRunCode(true)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-vcet-blue hover:bg-vcet-blue-deep text-white flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle className="w-3.5 h-3.5" />
                )}
                <span>{isSubmitting ? "Evaluating..." : "Submit Solution"}</span>
              </button>
            </div>
          </div>

          {/* Editor Canvas */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs h-[420px] flex flex-col">
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-mono text-slate-600">
              <span className="flex items-center gap-1.5 font-bold">
                <FileCode className="w-3.5 h-3.5 text-vcet-blue" />
                <span>solution{SUPPORTED_LANGUAGES.find((l) => l.id === language)?.extension || ".py"}</span>
              </span>
              <span className="text-[10px] text-slate-400">Ctrl + Space for autocompletion</span>
            </div>

            <div className="flex-1 overflow-hidden relative">
              <Suspense
                fallback={
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    spellCheck="false"
                    className="w-full h-full p-4 font-mono text-xs text-slate-800 bg-transparent resize-none leading-relaxed"
                    placeholder="Write your algorithmic solution here..."
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

          {/* Terminal / Test Case Output Console */}
          {executionResult && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-vcet-blue" />
                  <span className="text-xs font-bold text-slate-800">
                    Execution Results {executionResult.isSubmit ? "(Full Evaluation)" : "(Public Run)"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      executionResult.allPassed
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-rose-100 text-rose-800 border border-rose-300"
                    }`}
                  >
                    {executionResult.status || (executionResult.allPassed ? "Accepted" : "Wrong Answer")}
                  </span>

                  {executionResult.executionTime !== undefined && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      ⏱️ {executionResult.executionTime}s
                    </span>
                  )}
                </div>
              </div>

              {/* Summary Stats */}
              <div className="text-xs text-slate-600 font-medium">
                Passed <strong>{executionResult.passedCases ?? executionResult.passed ?? 0}</strong> of{" "}
                <strong>{executionResult.totalCases ?? executionResult.total ?? 0}</strong> test cases.
              </div>

              {/* Per-Test Case Badges */}
              {Array.isArray(executionResult.testResults) && executionResult.testResults.length > 0 && (
                <div className="space-y-2 pt-1 max-h-56 overflow-y-auto">
                  {executionResult.testResults.map((tr, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border text-xs font-mono space-y-1 ${
                        tr.passed
                          ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                          : "bg-rose-50/60 border-rose-200 text-rose-900"
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-[11px]">
                        <span>Test Case #{tr.testCaseNumber || i + 1} {tr.isHidden ? "(Hidden)" : ""}</span>
                        <span>{tr.passed ? "✓ Passed" : "✗ Failed"}</span>
                      </div>

                      {!tr.isHidden && (
                        <>
                          <div className="text-[11px] text-slate-600">
                            <strong>Input:</strong> {tr.input}
                          </div>
                          <div className="text-[11px] text-slate-600">
                            <strong>Expected:</strong> {tr.expectedOutput}
                          </div>
                          <div className="text-[11px]">
                            <strong>Actual:</strong> {tr.actualOutput || tr.errorMessage || "(No output)"}
                          </div>
                        </>
                      )}

                      {tr.errorMessage && (
                        <div className="text-rose-600 text-[11px] bg-rose-100/60 p-2 rounded-lg">
                          Error: {tr.errorMessage}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action callout to proceed to assessment test */}
          {onProceedToTest && (
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800">Finished coding practice?</h4>
                <p className="text-[11px] text-slate-500">
                  Proceed to the knowledge assessment test to complete this module.
                </p>
              </div>
              <button
                type="button"
                onClick={onProceedToTest}
                className="px-4 py-2 rounded-xl bg-vcet-blue hover:bg-vcet-blue-deep text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <span>Take Knowledge Assessment</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
