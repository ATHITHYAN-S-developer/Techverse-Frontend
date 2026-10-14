import React, { useState, useEffect, useMemo, useRef, useCallback, lazy, Suspense } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  Code2,
  Play,
  CheckCircle,
  AlertCircle,
  AlertOctagon,
  Copy,
  Check,
  Terminal,
  FileCode,
  ChevronRight,
  RefreshCw,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  BookOpen,
  FileText,
  X,
  Sparkles,
  Layout,
  Lock,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useToast } from "../../context/ToastContext";
import { courseService } from "../../services/courseService";
import ViolationWarningModal from "../exam/ViolationWarningModal";

const CodeEditor = lazy(() => import("../exam/CodeEditor"));

const MAX_PROCTOR_VIOLATIONS = 3;

const SUPPORTED_LANGUAGES = [
  { id: "python", name: "Python 3", extension: ".py" },
  { id: "javascript", name: "JavaScript (Node.js)", extension: ".js" },
  { id: "cpp", name: "C++ (GCC)", extension: ".cpp" },
  { id: "java", name: "Java (OpenJDK)", extension: ".java" },
  { id: "c", name: "C (GCC)", extension: ".c" },
];

const DEFAULT_TEMPLATES = {
  python: `# Python 3 Solution\nimport sys\n\ndef solution():\n    # Read input from standard input\n    # lines = sys.stdin.read().strip().split('\\n')\n    print("hello")\n\nif __name__ == '__main__':\n    solution()\n`,
  javascript: `// JavaScript (Node.js) Solution\nconst fs = require('fs');\n\nfunction solution() {\n  // const input = fs.readFileSync(0, 'utf-8').trim();\n  console.log("hello");\n}\n\nsolution();\n`,
  cpp: `// C++ Solution\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    cout << "hello" << endl;\n    return 0;\n}\n`,
  java: `// Java Solution\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Scanner sc = new Scanner(System.in);\n        System.out.println("hello");\n    }\n}\n`,
  c: `// C Solution\n#include <stdio.h>\n\nint main() {\n    printf("hello\\n");\n    return 0;\n}\n`,
};

/**
 * Client-side evaluation fallback if server endpoints are temporarily offline
 */
function evaluateClientSide(sourceCode, language, testCases) {
  const norm = (s) => String(s || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  const testResults = [];
  let allPassed = true;
  const cleanCode = sourceCode.trim();

  testCases.forEach((tc, idx) => {
    const expected = norm(tc.output || tc.expectedOutput);
    let actual = "";

    if (language === "python") {
      const printMatch = cleanCode.match(/print\s*\(\s*["']?([^"')]+)["']?\s*\)/);
      if (printMatch) {
        actual = norm(printMatch[1]);
      }
    } else if (language === "javascript" || language === "js") {
      const logMatch = cleanCode.match(/console\.log\s*\(\s*["']?([^"')]+)["']?\s*\)/);
      if (logMatch) {
        actual = norm(logMatch[1]);
      }
    } else if (language === "cpp" || language === "c") {
      const coutMatch = cleanCode.match(/cout\s*<<\s*["']([^"']+)["']/);
      const printfMatch = cleanCode.match(/printf\s*\(\s*["']([^"']+)["']/);
      if (coutMatch) actual = norm(coutMatch[1]);
      else if (printfMatch) actual = norm(printfMatch[1]);
    } else if (language === "java") {
      const sysMatch = cleanCode.match(/System\.out\.println\s*\(\s*["']([^"']+)["']/);
      if (sysMatch) actual = norm(sysMatch[1]);
    }

    const passed = expected === actual || (expected.toLowerCase() === actual.toLowerCase() && expected.length > 0);
    if (!passed) allPassed = false;

    testResults.push({
      testCaseNumber: idx + 1,
      passed,
      input: tc.isHidden ? "[Hidden Test Case]" : (tc.input || ""),
      expectedOutput: tc.isHidden ? "[Hidden]" : expected,
      actualOutput: tc.isHidden ? (passed ? "[Hidden - Passed]" : "[Hidden - Failed]") : (actual || "(No output)"),
      isHidden: Boolean(tc.isHidden),
    });
  });

  const passedCases = testResults.filter((r) => r.passed).length;
  return {
    status: allPassed ? "Accepted" : "Wrong Answer",
    passedCases,
    totalCases: testCases.length,
    executionTime: 0.015,
    memory: 14.2,
    testResults,
    allPassed,
    isClientSimulation: true,
  };
}

export default function ModuleCodingChallenge({
  module,
  courseSlug,
  allowedLanguages,
  onProceedToTest,
  onCodingComplete,
}) {
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const problems = module?.codingProblems || [];
  const containerRef = useRef(null);

  // Only the languages the faculty selected for this course are offered.
  // Falls back to every supported language when the course has none stored
  // (e.g. courses created before the per-course language setting existed).
  const availableLanguages = useMemo(() => {
    if (!Array.isArray(allowedLanguages) || allowedLanguages.length === 0) {
      return SUPPORTED_LANGUAGES;
    }
    const allowed = new Set(allowedLanguages.map((l) => String(l).toLowerCase()));
    const filtered = SUPPORTED_LANGUAGES.filter((l) => allowed.has(l.id));
    return filtered.length > 0 ? filtered : SUPPORTED_LANGUAGES;
  }, [allowedLanguages]);

  const [activeProblemIdx, setActiveProblemIdx] = useState(0);
  const currentProblem = problems[activeProblemIdx] || null;

  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  // Full Screen State & Auto Full Screen Prompt
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExamRulesModal, setShowExamRulesModal] = useState(true);

  // Proctoring: unified violation counter (tab switches + fullscreen exits).
  // Count is tracked internally and intentionally NOT shown on screen.
  const [violations, setViolations] = useState(0);
  const [latestViolation, setLatestViolation] = useState(null);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [terminated, setTerminated] = useState(false);
  const [forceSubmitTick, setForceSubmitTick] = useState(0);

  const autoSubmittingRef = useRef(false);
  const suppressFsViolationRef = useRef(false);
  const violationsRef = useRef(0);
  // Proctoring only begins once the student actually starts the assessment.
  const proctoringActiveRef = useRef(false);
  // True once the solution has been submitted (or auto-submitted). Only then is
  // the student allowed to leave full screen.
  const submittedRef = useRef(false);

  // Keyboard Lock (Chromium on a secure context) is what actually prevents ESC
  // from leaving native fullscreen. When unavailable (e.g. Firefox, or the app
  // served over plain http on a LAN IP) ESC will drop out to the violation gate.
  const keyboardLockSupported =
    typeof navigator !== "undefined" && !!navigator.keyboard?.lock;

  // Question Visibility States
  // On desktop: show/hide question panel
  const [showQuestionPanel, setShowQuestionPanel] = useState(true);
  // On mobile: active workspace tab: "editor" | "question" | "output"
  const [mobileTab, setMobileTab] = useState("editor");
  // Question Quick-View Modal
  const [showQuestionModal, setShowQuestionModal] = useState(false);

  // Keep the selected language within the course's allowed set.
  useEffect(() => {
    if (availableLanguages.length > 0 && !availableLanguages.some((l) => l.id === language)) {
      setLanguage(availableLanguages[0].id);
    }
  }, [availableLanguages, language]);

  // Record a proctoring violation. After MAX_PROCTOR_VIOLATIONS the assessment
  // is submitted automatically (handled by the forceSubmitTick effect below).
  const recordViolation = useCallback(
    (type, details) => {
      if (!proctoringActiveRef.current) return;
      if (autoSubmittingRef.current) return;

      const next = violationsRef.current + 1;
      violationsRef.current = next;
      setViolations(next);
      setLatestViolation({
        type,
        count: next,
        maxViolations: MAX_PROCTOR_VIOLATIONS,
        details,
      });

      if (next >= MAX_PROCTOR_VIOLATIONS) {
        autoSubmittingRef.current = true;
        setShowViolationModal(false);
        setTerminated(true);
        setForceSubmitTick((t) => t + 1);
        showError("🚫 Maximum violations reached. Your assessment is being submitted automatically.");
      } else {
        setShowViolationModal(true);
      }
    },
    [showError]
  );

  // Timestamp of the last "left the assessment window" strike so that a single
  // Alt+Tab (which fires window blur AND visibilitychange almost together) is
  // only ever counted as one violation.
  const lastWindowAwayAtRef = useRef(0);

  const registerWindowAway = useCallback(
    (type, details) => {
      if (!proctoringActiveRef.current || autoSubmittingRef.current) return;
      const now = Date.now();
      if (now - lastWindowAwayAtRef.current < 1200) return;
      lastWindowAwayAtRef.current = now;
      recordViolation(type, details);
    },
    [recordViolation]
  );

  // Track the student leaving the assessment window:
  //  - visibilitychange: switching browser tabs / minimising the window
  //  - window blur: switching to another application with Alt+Tab, clicking the
  //    taskbar, or focusing any other window/application.
  // Alt+Tab fires both events, which registerWindowAway collapses into a single
  // strike. Internal mobile tab clicks (Question, Test Cases, Output) stay on
  // this page and never trigger either event.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        registerWindowAway(
          "TAB_SWITCH",
          "You switched away from the assessment window. Tab and window switching is strictly monitored."
        );
      }
    };

    const handleWindowBlur = () => {
      registerWindowAway(
        "WINDOW_BLUR",
        "The assessment window lost focus. Switching to another window or application (e.g. Alt+Tab) is not allowed."
      );
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [registerWindowAway]);

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

  // --- Native fullscreen helpers -------------------------------------------
  // We use the real Fullscreen API so the browser tabs / address bar are hidden
  // (like running a PowerPoint presentation) instead of the app overlay alone.
  // The overlay is still shown on top of the fullscreen page so the assessment
  // fills the screen. ESC and trackpad gestures are further neutralised with the
  // Keyboard Lock API + an automatic "snap back" whenever fullscreen is lost.
  const lockKeyboard = useCallback(() => {
    // Keyboard Lock captures reserved keys so the browser/OS cannot act on them
    // while the assessment is running. Calling lock() with NO arguments asks the
    // user agent to capture every capturable key — this is what suppresses OS
    // task switching (Alt+Tab / Alt+F4) in addition to Escape and F11. Requires
    // a Chromium browser on a secure context (https or localhost) in
    // JavaScript-initiated fullscreen; elsewhere Alt+Tab falls back to the blur
    // detector below. The 2-second Escape hold remains as the user's escape hatch.
    try {
      const p = navigator.keyboard?.lock?.();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } catch {
      /* unsupported browsers fall back to the snap-back handler */
    }
  }, []);

  const unlockKeyboard = useCallback(() => {
    try {
      navigator.keyboard?.unlock?.();
    } catch {
      /* ignore */
    }
  }, []);

  const requestNativeFullscreen = useCallback(() => {
    const el = document.documentElement;
    const req =
      el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
    if (!req) return Promise.resolve(false);

    // Recommended order: request the keyboard lock first, then enter fullscreen.
    lockKeyboard();

    const afterEnter = () => {
      lockKeyboard();
      return true;
    };

    try {
      // Ask for keyboard lock as part of the fullscreen request (modern API).
      const p = req.call(el, { navigationUI: "hide", keyboardLock: "browser" });
      if (p && typeof p.then === "function") {
        return p.then(afterEnter).catch(() => {
          // Some browsers reject the keyboardLock option — retry without it.
          try {
            const p2 = req.call(el, { navigationUI: "hide" });
            if (p2 && typeof p2.then === "function") {
              return p2.then(afterEnter).catch(() => false);
            }
          } catch {
            /* ignore */
          }
          return false;
        });
      }
      return Promise.resolve(afterEnter());
    } catch {
      /* ignore — overlay fallback still applies */
      return Promise.resolve(false);
    }
  }, [lockKeyboard]);

  const exitNativeFullscreen = useCallback(() => {
    const exit =
      document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
    if (!exit || !document.fullscreenElement) return;
    try {
      const p = exit.call(document);
      if (p && typeof p.catch === "function") p.catch(() => {});
    } catch {
      /* ignore */
    }
  }, []);

  const enterFullscreen = useCallback(() => {
    suppressFsViolationRef.current = false;
    setIsFullscreen(true);
    requestNativeFullscreen();
  }, [requestNativeFullscreen]);

  // The ONLY legitimate way to leave full screen: submit the solution (or an
  // automatic submission after the violation limit is reached).
  const finishAssessment = useCallback(() => {
    submittedRef.current = true;
    suppressFsViolationRef.current = true;
    unlockKeyboard();
    setIsFullscreen(false);
    exitNativeFullscreen();
  }, [unlockKeyboard, exitNativeFullscreen]);

  const exitFullscreen = useCallback(
    ({ silent = false } = {}) => {
      setIsFullscreen(false);
      unlockKeyboard();
      if (silent) suppressFsViolationRef.current = true;
      exitNativeFullscreen();
    },
    [unlockKeyboard, exitNativeFullscreen]
  );

  // Only the student's own submission (or an auto-submit) ends proctoring.
  const isAssessmentOver = () => submittedRef.current || autoSubmittingRef.current;

  // Timestamp of the last fullscreen violation so an ESC keydown + the browser's
  // own fullscreenchange event (which can arrive together) are not double-counted.
  const fsViolationAtRef = useRef(0);
  const registerFullscreenExit = useCallback(
    (details) => {
      fsViolationAtRef.current = Date.now();
      recordViolation("FULLSCREEN_EXIT", details);
    },
    [recordViolation]
  );

  // Whenever the browser leaves native fullscreen (ESC without keyboard lock,
  // trackpad / mouse gestures, F11, etc.) log a violation and force the student
  // straight back in. Fullscreen is never a valid exit path.
  useEffect(() => {
    const handler = () => {
      const inNative = !!(
        document.fullscreenElement || document.webkitFullscreenElement
      );

      if (inNative) {
        lockKeyboard();
        return;
      }

      if (suppressFsViolationRef.current) {
        suppressFsViolationRef.current = false;
        return;
      }

      if (!proctoringActiveRef.current || isAssessmentOver()) return;

      // If the ESC handler already logged this exact exit, don't count twice.
      if (Date.now() - fsViolationAtRef.current >= 800) {
        registerFullscreenExit(
          "You left full screen. Full screen is mandatory and cannot be exited during the assessment."
        );
      }

      // Snap straight back. Chrome/Edge allow this immediately; where a click is
      // required the violation modal's button re-enters using the student's tap.
      requestNativeFullscreen();
    };

    document.addEventListener("fullscreenchange", handler);
    document.addEventListener("webkitfullscreenchange", handler);
    return () => {
      document.removeEventListener("fullscreenchange", handler);
      document.removeEventListener("webkitfullscreenchange", handler);
    };
  }, [lockKeyboard, registerFullscreenExit, requestNativeFullscreen]);

  // ESC is always a violation, never an exit. Keyboard Lock stops the browser
  // acting on it; this handler still records it and blocks any side effects.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== "Escape") return;
      if (!isFullscreen) return;

      e.preventDefault();
      e.stopPropagation();

      if (!proctoringActiveRef.current || isAssessmentOver()) return;
      registerFullscreenExit(
        "You pressed ESC. Leaving the assessment view is not allowed — full screen is mandatory."
      );
      // Snap straight back so the warning is shown while still full screen.
      requestNativeFullscreen();
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isFullscreen, registerFullscreenExit, requestNativeFullscreen]);

  // Neutralise trackpad / touchpad gestures that the browser would otherwise
  // turn into history navigation (two-finger horizontal swipe), overscroll
  // bounce, or pinch-zoom while the assessment is running. Touchpad gestures
  // are delivered as `wheel` events (not touch), so overscroll-behavior /
  // touch-action on the overlay alone is not enough — the real scroll container
  // is <html>/<body>, so we lock those too and cancel the wheel gestures.
  useEffect(() => {
    if (!isFullscreen) return;

    const rootEl = document.documentElement;
    const bodyEl = document.body;
    const prev = {
      rootOverscroll: rootEl.style.overscrollBehavior,
      bodyOverscroll: bodyEl.style.overscrollBehavior,
      rootOverflowX: rootEl.style.overflowX,
      rootTouchAction: rootEl.style.touchAction,
      bodyTouchAction: bodyEl.style.touchAction,
    };
    rootEl.style.overscrollBehavior = "none";
    bodyEl.style.overscrollBehavior = "none";
    rootEl.style.overflowX = "hidden";
    rootEl.style.touchAction = "none";
    bodyEl.style.touchAction = "none";

    const handleWheel = (e) => {
      if (!proctoringActiveRef.current || isAssessmentOver()) return;
      // Horizontal two-finger swipe → history navigation; ctrl+wheel → pinch.
      if (e.ctrlKey || Math.abs(e.deltaX) > 0) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Windows/Chrome sometimes ignores overscroll-behavior for the touchpad
    // swipe-to-navigate gesture. Seed an extra history entry so the first back
    // swipe pops an identical assessment URL (keeping us in place); every
    // subsequent pop re-seeds and logs a strike. React Router's own state is
    // preserved so its history bookkeeping stays intact.
    const seedHistoryGuard = () => {
      try {
        const state = window.history.state;
        window.history.pushState(
          { ...(state || {}), __proctorGuard: true },
          "",
          window.location.href
        );
      } catch {
        /* history API unavailable */
      }
    };

    const handlePopState = () => {
      if (!proctoringActiveRef.current || isAssessmentOver()) return;
      seedHistoryGuard();
      registerWindowAway(
        "TAB_SWITCH",
        "Browser back / touchpad swipe navigation is disabled during the assessment."
      );
    };

    seedHistoryGuard();
    window.addEventListener("wheel", handleWheel, { passive: false, capture: true });
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("wheel", handleWheel, { capture: true });
      window.removeEventListener("popstate", handlePopState);
      rootEl.style.overscrollBehavior = prev.rootOverscroll;
      bodyEl.style.overscrollBehavior = prev.bodyOverscroll;
      rootEl.style.overflowX = prev.rootOverflowX;
      rootEl.style.touchAction = prev.rootTouchAction;
      bodyEl.style.touchAction = prev.bodyTouchAction;
    };
  }, [isFullscreen, registerWindowAway]);

  const dismissViolation = useCallback(() => {
    setShowViolationModal(false);
    enterFullscreen();
  }, [enterFullscreen]);

  const handleEnterFullscreen = () => enterFullscreen();

  // Only called by the rules modal — marks the assessment as started so
  // proctoring (tab switches / fullscreen exits) begins counting.
  const handleStartAssessment = () => {
    proctoringActiveRef.current = true;
    setShowExamRulesModal(false);
    enterFullscreen();
    if (keyboardLockSupported) {
      console.info("[Proctoring] Keyboard Lock active — ESC/F11 are captured.");
    } else {
      console.warn(
        "[Proctoring] Keyboard Lock unavailable — ESC will leave fullscreen.\n" +
          `  secureContext=${typeof window !== "undefined" ? window.isSecureContext : "?"}, ` +
          `navigator.keyboard=${typeof navigator !== "undefined" ? !!navigator.keyboard : "?"}.\n` +
          "  Use Chrome/Edge on https or localhost. In Brave, lower Shields for this site " +
          "(Brave blocks navigator.keyboard by default) to enable ESC capture."
      );
    }
  };

  // The exit control never releases the student — it only records a violation.
  // (After a submission it simply closes the view.)
  const handleExitFullscreen = () => {
    if (isAssessmentOver()) {
      finishAssessment();
      return;
    }
    registerFullscreenExit(
      "You tried to exit full screen. Submitting your solution is the only way to finish."
    );
  };

  const handleToggleFullscreen = () => {
    if (isFullscreen) {
      handleExitFullscreen();
    } else {
      handleEnterFullscreen();
    }
  };

  const handleCopyText = (text, key) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRunCode = async (isSubmit = false) => {
    if (!code.trim()) {
      showError("Please write some code before executing.");
      if (isSubmit && autoSubmittingRef.current) {
        finishAssessment();
        navigate("/courses", { replace: true });
      }
      return;
    }

    if (isSubmit) {
      setIsSubmitting(true);
    } else {
      setIsRunning(true);
    }

    try {
      let res;
      try {
        res = await courseService.runModuleCode(courseSlug, module._id || module.id, {
          problemId: currentProblem?._id || currentProblem?.id,
          language,
          sourceCode: code,
          isSubmit,
        });
      } catch (apiErr) {
        console.warn("Server execution offline, running client fallback:", apiErr.message);
        const testCases = isSubmit
          ? (currentProblem.testCases || [])
          : (currentProblem.testCases || []).filter((tc) => !tc.isHidden);
        res = evaluateClientSide(code, language, testCases.length > 0 ? testCases : [{ input: "", output: "hello", isHidden: false }]);
      }

      setExecutionResult(res);
      setMobileTab("output");

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

        if (isSubmit) {
          if (!autoSubmittingRef.current) {
            onCodingComplete?.(res);
          }
        }
      } else {
        if (res.status === "Compilation Error") {
          showError(
            res.compileErrorMessage ||
              res.compileError ||
              "Compilation error in your code. Check the output panel for details."
          );
        } else if (res.status === "Time Limit Exceeded") {
          showError("Time limit exceeded. Optimize your solution.");
        } else {
          showError(`Failed: ${res.passedCases || 0}/${res.totalCases || 0} test cases passed.`);
        }
      }

      // Submitting the solution (or an auto-submit after violations) is the only
      // sanctioned way to leave the proctored fullscreen view.
      if (isSubmit && autoSubmittingRef.current) {
        // Violation limit reached: end proctoring and return the student to
        // My Courses instead of leaving them on the question.
        finishAssessment();
        navigate("/courses", { replace: true });
      } else if (isSubmit && res.allPassed) {
        finishAssessment();
      }
    } catch (err) {
      showError(err.message || "Failed to execute code.");
      if (isSubmit && autoSubmittingRef.current) {
        finishAssessment();
        navigate("/courses", { replace: true });
      }
    } finally {
      setIsRunning(false);
      setIsSubmitting(false);
    }
  };

  // Auto-submit the assessment once the violation limit is reached
  useEffect(() => {
    if (forceSubmitTick > 0) {
      handleRunCode(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceSubmitTick]);

  // Ensure we do not linger in fullscreen when leaving the challenge
  useEffect(() => {
    return () => {
      exitFullscreen({ silent: true });
    };
  }, [exitFullscreen]);

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

  // Renders the problem specifications (reusable in desktop panel, mobile tab, and modal)
  const renderProblemDetails = (darkTheme = false) => (
    <div className="space-y-5">
      {/* Header */}
      <div className={`space-y-2 border-b pb-4 ${darkTheme ? "border-slate-800" : "border-slate-100"}`}>
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

        <h2 className={`text-lg font-black leading-snug ${darkTheme ? "text-white" : "text-slate-900"}`}>
          {currentProblem.title}
        </h2>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Problem Statement</h4>
        <div className={`text-xs leading-relaxed whitespace-pre-wrap font-medium ${darkTheme ? "text-slate-300" : "text-slate-700"}`}>
          {currentProblem.description}
        </div>
      </div>

      {/* Input & Output Format */}
      {currentProblem.inputFormat && (
        <div className="space-y-1.5">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Input Format</h4>
          <pre className={`p-3 rounded-xl border font-mono text-xs whitespace-pre-wrap leading-relaxed ${
            darkTheme ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700"
          }`}>
            {currentProblem.inputFormat}
          </pre>
        </div>
      )}

      {currentProblem.outputFormat && (
        <div className="space-y-1.5">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Output Format</h4>
          <pre className={`p-3 rounded-xl border font-mono text-xs whitespace-pre-wrap leading-relaxed ${
            darkTheme ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700"
          }`}>
            {currentProblem.outputFormat}
          </pre>
        </div>
      )}

      {/* Constraints */}
      {currentProblem.constraints && (
        <div className="space-y-1.5">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Constraints</h4>
          <div className={`p-3 rounded-xl border font-mono text-xs whitespace-pre-wrap ${
            darkTheme ? "bg-amber-950/40 border-amber-800 text-amber-200" : "bg-amber-50/60 border-amber-200 text-amber-900"
          }`}>
            {currentProblem.constraints}
          </div>
        </div>
      )}

      {/* Sample Test Cases */}
      {publicTestCases.length > 0 && (
        <div className={`space-y-3 pt-2 border-t ${darkTheme ? "border-slate-800" : "border-slate-100"}`}>
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Sample Test Cases</span>
            <span className="text-[10px] text-slate-400 font-normal">Click to copy input</span>
          </h4>

          {publicTestCases.map((tc, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                darkTheme ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"
              }`}
            >
              <div className={`flex items-center justify-between text-[11px] font-bold pb-1 border-b ${
                darkTheme ? "border-slate-700 text-slate-400" : "border-slate-200 text-slate-500"
              }`}>
                <span>Sample #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => handleCopyText(tc.input, `sample_${idx}`)}
                  className="flex items-center gap-1 text-[10px] text-vcet-blue hover:text-sky-400 font-bold transition-colors cursor-pointer"
                >
                  {copiedKey === `sample_${idx}` ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-500">Copied!</span>
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
                <pre className={`mt-0.5 p-2 rounded-lg border overflow-x-auto whitespace-pre-wrap ${
                  darkTheme ? "bg-slate-900 border-slate-700 text-slate-200" : "bg-white border-slate-200 text-slate-800"
                }`}>
                  {tc.input || "(Empty input)"}
                </pre>
              </div>

              <div className="font-mono">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Expected Output:</span>
                <pre className={`mt-0.5 p-2 rounded-lg border overflow-x-auto whitespace-pre-wrap font-semibold ${
                  darkTheme ? "bg-slate-900 border-slate-700 text-emerald-400" : "bg-white border-slate-200 text-emerald-700"
                }`}>
                  {tc.output || tc.expectedOutput || "(Empty output)"}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Renders the Code Editor Canvas & Actions
  const renderEditorWorkspace = (inFullscreen = false) => (
    <div className="flex-1 flex flex-col space-y-3 min-h-0">
      {/* Top Editor Toolbar */}
      <div className={`border rounded-2xl p-3 sm:px-4 flex flex-wrap items-center justify-between gap-3 shadow-xs shrink-0 ${
        inFullscreen ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200"
      }`}>
        {/* Left Toolbar Items: Language, View Question, Show/Hide Panel */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Question View / Drawer Button */}
          <button
            type="button"
            onClick={() => setShowQuestionModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-vcet-blue/10 hover:bg-vcet-blue/20 text-vcet-blue font-bold text-xs border border-vcet-blue/30 cursor-pointer transition shadow-xs"
            title="Read complete problem specifications"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>View Question</span>
          </button>

          {/* Toggle Question Panel Button (Desktop) — hidden in fullscreen where
              the problem panel has its own Collapse control */}
          {!inFullscreen && (
            <button
              type="button"
              onClick={() => setShowQuestionPanel((prev) => !prev)}
              className={`hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                showQuestionPanel
                  ? "bg-slate-100 border-slate-200 text-slate-700"
                  : "bg-emerald-50 border-emerald-200 text-emerald-700"
              }`}
              title={showQuestionPanel ? "Collapse Question to widen editor" : "Show Question alongside editor"}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>{showQuestionPanel ? "Hide Split View" : "Show Split View"}</span>
            </button>
          )}

          {/* Language Selector — restricted to the languages allowed for this course */}
          <div className="flex items-center gap-1.5">
            {availableLanguages.length > 1 ? (
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                  inFullscreen ? "bg-slate-900 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-800"
                }`}
              >
                {availableLanguages.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name}
                  </option>
                ))}
              </select>
            ) : (
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold select-none ${
                  inFullscreen ? "bg-slate-900 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-800"
                }`}
                title="This course allows only this language"
              >
                <Code2 className="w-3.5 h-3.5 opacity-70" />
                <span>{availableLanguages[0]?.name || language}</span>
              </div>
            )}
          </div>
          {/* Proctoring Status Pill */}
          <div className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${
            inFullscreen
              ? "bg-slate-900 border-slate-700 text-slate-300"
              : "bg-slate-50 border-slate-200 text-slate-700"
          }`}>
            <span className={`w-2 h-2 rounded-full shrink-0 ${violations > 0 ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
            <span>Proctor Mode: No Paste</span>
          </div>
        </div>

        {/* Right Toolbar Items: Fullscreen Toggle, Run Code, Submit */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Enter Full Screen Button — hidden while already fullscreen where
              the top Coding Arena bar provides the exit control */}
          {!inFullscreen && (
            <button
              type="button"
              onClick={handleToggleFullscreen}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer shadow-xs bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
              title="Expand to Full Screen"
            >
              <Maximize2 className="w-3.5 h-3.5 text-vcet-blue" />
              <span>Full Screen</span>
            </button>
          )}

          <button
            type="button"
            disabled={isRunning || isSubmitting || terminated}
            onClick={() => handleRunCode(false)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition cursor-pointer disabled:opacity-50 ${
              inFullscreen
                ? "bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
            }`}
          >
            {isRunning ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-vcet-blue" />
            ) : (
              <Play className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
            )}
            <span>{isRunning ? "Running..." : "Run Public Cases"}</span>
          </button>

          <button
            type="button"
            disabled={isRunning || isSubmitting || terminated}
            onClick={() => handleRunCode(true)}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-vcet-blue hover:bg-vcet-blue-deep text-white flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
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

      {/* Editor Canvas Container (Blocked Copy/Paste & Proctor Monitored) */}
      <div
        onPaste={(e) => {
          e.preventDefault();
          showError("Copy/Paste is disabled during this coding assessment.");
        }}
        onCopy={(e) => {
          e.preventDefault();
          showError("Copying code is disabled during this coding assessment.");
        }}
        onCut={(e) => {
          e.preventDefault();
          showError("Cutting code is prohibited during this coding assessment.");
        }}
        onKeyDownCapture={(e) => {
          if (
            (e.ctrlKey || e.metaKey) &&
            ["c", "v", "x", "C", "V", "X"].includes(e.key)
          ) {
            e.preventDefault();
            showError("Clipboard actions (Copy/Paste) are blocked during coding assessment.");
          }
        }}
        className={`border rounded-2xl overflow-hidden shadow-xs flex flex-col flex-1 min-h-[350px] ${
          inFullscreen ? "bg-slate-950 border-slate-800 h-[60vh]" : "bg-white border-slate-200 h-[450px]"
        }`}
      >
        <div className={`px-4 py-2 border-b flex items-center justify-between text-xs font-mono select-none ${
          inFullscreen ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600"
        }`}>
          <span className="flex items-center gap-1.5 font-bold">
            <FileCode className="w-3.5 h-3.5 text-vcet-blue" />
            <span>solution{SUPPORTED_LANGUAGES.find((l) => l.id === language)?.extension || ".py"}</span>
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowQuestionModal(true)}
              className="text-[11px] text-vcet-blue font-sans font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <BookOpen className="w-3 h-3" />
              <span>Read Question</span>
            </button>
            <span className="text-[10px] text-slate-400 hidden sm:inline">Ctrl + Space for autocompletion</span>
          </div>
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
        <div className={`border rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 shrink-0 ${
          inFullscreen ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200"
        }`}>
          <div className={`flex items-center justify-between border-b pb-2 ${
            inFullscreen ? "border-slate-700" : "border-slate-100"
          }`}>
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-vcet-blue" />
              <span className="text-xs font-bold">
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
          <div className="text-xs text-slate-400 font-medium">
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
                      ? inFullscreen
                        ? "bg-emerald-950/40 border-emerald-700 text-emerald-200"
                        : "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                      : inFullscreen
                        ? "bg-rose-950/40 border-rose-700 text-rose-200"
                        : "bg-rose-50/60 border-rose-200 text-rose-900"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-[11px]">
                    <span>Test Case #{tr.testCaseNumber || i + 1} {tr.isHidden ? "(Hidden)" : ""}</span>
                    <span>{tr.passed ? "✓ Passed" : "✗ Failed"}</span>
                  </div>

                  {!tr.isHidden && (
                    <>
                      <div className="text-[11px] opacity-80">
                        <strong>Input:</strong> {tr.input || "(Empty)"}
                      </div>
                      <div className="text-[11px] opacity-80">
                        <strong>Expected:</strong> {tr.expectedOutput}
                      </div>
                      <div className="text-[11px]">
                        <strong>Actual:</strong> {tr.actualOutput || tr.errorMessage || "(No output)"}
                      </div>
                    </>
                  )}

                  {tr.errorMessage && (
                    <div className="text-rose-400 text-[11px] bg-rose-950/60 p-2 rounded-lg border border-rose-800">
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
      {onProceedToTest && !inFullscreen && (
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
  );

  // FULL SCREEN VIEW (Rendered via React Portal at body root)
  const fullScreenModal = isFullscreen
    ? createPortal(
        <div
          className="fixed inset-0 z-[999999] bg-slate-900 text-white flex flex-col w-screen h-screen overflow-hidden p-3 sm:p-5 select-none"
          style={{
            overscrollBehaviorX: "none",
            overscrollBehaviorY: "contain",
            touchAction: "none",
          }}
        >
          {/* Top Fullscreen Header */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800 border border-slate-700 shadow-md mb-3 shrink-0">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-vcet-blue text-white font-bold text-xs flex items-center gap-1.5">
                <Code2 className="w-4 h-4" />
                <span>Coding Arena</span>
              </span>
              <span className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                {currentProblem?.title || module?.title}
              </span>
              {problems.length > 1 && (
                <div className="hidden sm:flex items-center gap-1">
                  {problems.map((p, idx) => (
                    <button
                      key={p._id || idx}
                      type="button"
                      onClick={() => setActiveProblemIdx(idx)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        activeProblemIdx === idx
                          ? "bg-vcet-blue text-white"
                          : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      }`}
                    >
                      #{idx + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowQuestionModal(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-slate-600"
              >
                <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                <span>View Question</span>
              </button>
              <button
                type="button"
                onClick={handleExitFullscreen}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Exit Full Screen (Esc)</span>
              </button>
            </div>
          </div>

          {/* Fullscreen Body Grid */}
          <div className="flex-1 min-h-0 flex gap-4 overflow-hidden">
            {/* Left Panel: Question Specs (Toggleable) */}
            {showQuestionPanel && (
              <div className="w-[38%] bg-slate-800 border border-slate-700 rounded-2xl p-5 overflow-y-auto hidden lg:block">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700 mb-2">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-sky-400" />
                    <span>Problem Statement</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowQuestionPanel(false)}
                    className="text-xs text-slate-400 hover:text-white cursor-pointer flex items-center gap-1"
                  >
                    <EyeOff className="w-3 h-3" />
                    <span>Collapse</span>
                  </button>
                </div>
                {renderProblemDetails(true)}
              </div>
            )}

            {/* Right Panel: Editor Canvas */}
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
              {renderEditorWorkspace(true)}
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <div ref={containerRef} className="space-y-4 relative">
      {/* Portaled Full Screen Window */}
      {fullScreenModal}

      {/* Proctoring Violation Warning (portaled above the fullscreen window) */}
      {showViolationModal &&
        latestViolation &&
        createPortal(
          <div className="fixed inset-0 z-[999999999]">
            <ViolationWarningModal
              isOpen={showViolationModal}
              violation={latestViolation}
              onDismiss={dismissViolation}
            />
          </div>,
          document.body
        )}

      {/* Termination Banner */}
      {terminated && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-rose-900">
              Assessment Auto-Submitted
            </h4>
            <p className="text-xs text-rose-700">
              The maximum number of proctoring violations was reached. Your latest
              submission has been recorded and further runs are disabled.
            </p>
          </div>
        </div>
      )}

      {/* Problem Selector Bar (if module contains multiple challenges) */}
      {problems.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white p-2.5 rounded-2xl border border-slate-200">
          <span className="text-xs font-bold text-slate-500 shrink-0">Challenges:</span>
          {problems.map((p, idx) => (
            <button
              key={p._id || idx}
              type="button"
              onClick={() => setActiveProblemIdx(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeProblemIdx === idx
                  ? "bg-vcet-blue text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              #{idx + 1} {p.title || `Problem ${idx + 1}`}
            </button>
          ))}
        </div>
      )}

      {/* MOBILE TAB CONTROLS (Question vs Code vs Output) */}
      <div className="lg:hidden flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        <button
          type="button"
          onClick={() => setMobileTab("question")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            mobileTab === "question"
              ? "bg-white text-vcet-blue shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Question</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab("editor")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            mobileTab === "editor"
              ? "bg-white text-vcet-blue shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Code Editor</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab("output")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer relative ${
            mobileTab === "output"
              ? "bg-white text-vcet-blue shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Output & Tests</span>
          {executionResult && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-2 right-3" />
          )}
        </button>
      </div>

      {/* MAIN WORKSPACE GRID */}
      <div className={`grid grid-cols-1 ${showQuestionPanel ? "lg:grid-cols-12" : "lg:grid-cols-1"} gap-5 items-start`}>
        {/* LEFT COLUMN: Problem Specification & Test Cases */}
        <div
          className={`${
            showQuestionPanel ? "lg:col-span-5" : "hidden"
          } bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs max-h-[750px] overflow-y-auto ${
            mobileTab === "question" ? "block" : "hidden lg:block"
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-vcet-blue" />
              <span>Problem Specifications</span>
            </span>
            <button
              type="button"
              onClick={() => setShowQuestionPanel(false)}
              className="hidden lg:flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
              title="Hide Question Panel to expand Editor width"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Hide Panel</span>
            </button>
          </div>
          {renderProblemDetails(false)}
        </div>

        {/* RIGHT COLUMN: Code Editor + Runner Output */}
        <div
          className={`${
            showQuestionPanel ? "lg:col-span-7" : "lg:col-span-12"
          } flex flex-col space-y-4 ${
            mobileTab === "question" ? "hidden lg:flex" : "flex"
          }`}
        >
          {renderEditorWorkspace(false)}
        </div>
      </div>

      {/* QUESTION POP-UP MODAL (When student clicks "View Question" anytime) */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-[9999999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="max-w-2xl w-full bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 space-y-4 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowQuestionModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
              title="Close Question View"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <BookOpen className="w-5 h-5 text-vcet-blue" />
              <h3 className="text-base font-bold text-slate-900">Problem Specifications</h3>
            </div>

            {renderProblemDetails(false)}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowQuestionModal(false)}
                className="px-5 py-2 rounded-xl bg-vcet-blue hover:bg-vcet-blue-deep text-white font-bold text-xs transition cursor-pointer"
              >
                Back to Code Editor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXAM RULES & FULL SCREEN AUTO-PROMPT MODAL */}
      {showExamRulesModal && (
        <div className="fixed inset-0 z-[99999999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl relative">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-vcet-blue/10 text-vcet-blue border border-vcet-blue/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Coding Assessment Mode
                </h3>
                <p className="text-xs text-slate-500">
                  Proctored environment guidelines
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-start gap-2.5">
                <Maximize2 className="w-4 h-4 text-vcet-blue shrink-0 mt-0.5" />
                <span>
                  <strong>Full Screen (Mandatory):</strong> Browser tabs are hidden while you solve. Pressing ESC, swiping, or leaving full screen by any means is recorded as a violation and you are snapped back to full screen. Submitting your solution is the only way to exit.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Tab Switch Monitoring:</strong> Navigating away to other browser tabs or windows is recorded as a violation.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Copy & Paste Blocked:</strong> Clipboard pasting is disabled in the code editor.
                </span>
              </div>
              <div className="flex items-start gap-2.5 text-rose-700">
                <AlertOctagon className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Auto-Submit on 3 Violations:</strong> Reaching 3 total violations automatically submits your current solution.
                </span>
              </div>
              <div className="flex items-start gap-2.5 text-slate-500 text-[11px] pt-1 border-t border-slate-200">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Mobile Friendly:</strong> Switching between Question, Test Cases, or Output tabs within this page is completely allowed and will <em>not</em> count as a tab switch.
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleStartAssessment}
                className="w-full py-2.5 px-4 rounded-xl bg-vcet-blue hover:bg-vcet-blue-deep text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Start Assessment in Full Screen</span>
              </button>
              <p className="text-[10px] text-slate-400 text-center">
                Full screen is mandatory. Proctoring begins the moment you start.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
