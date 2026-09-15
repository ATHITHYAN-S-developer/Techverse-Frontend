import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  Flame,
  Star,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  HelpCircle,
  Check,
  AlertTriangle,
  FileCheck2,
  Maximize2,
} from "lucide-react";
import confetti from "canvas-confetti";
import { testService } from "../services/testService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useExamMode } from "../hooks/useExamMode";
import ExamRulesModal from "../components/exam/ExamRulesModal";
import ViolationWarningModal from "../components/exam/ViolationWarningModal";
import ExamModeHeader from "../components/exam/ExamModeHeader";

export default function DailyTestPage() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { user, addPoints, incrementStreak, streak } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [examStarted, setExamStarted] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600); // in seconds
  const [timeSpent, setTimeSpent] = useState(0);

  const selectedAnswersRef = useRef(selectedAnswers);
  useEffect(() => {
    selectedAnswersRef.current = selectedAnswers;
  }, [selectedAnswers]);

  // Load test details
  useEffect(() => {
    async function load() {
      try {
        let t = null;
        if (testId) {
          t = await testService.getTestById(testId);
        } else {
          const todayRes = await testService.getTodayTest();
          t = todayRes?.test;
          if (!t) {
            const all = await testService.getAllTests();
            t = all && all.length > 0 ? all[0] : null;
          }
        }
        if (t) {
          setTest(t);
          const durationSecs = ((t.durationMinutes || (t.timeLimitSeconds ? t.timeLimitSeconds / 60 : 15)) || 15) * 60;
          setTimeLeft(durationSecs);
        }
      } catch (err) {
        console.error("Test loading error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [testId]);

  // Handle final submission (manual, timer, or violation-triggered)
  const handleSubmit = useCallback(
    async (violationsList = [], submissionType = "manual") => {
      if (submitted || isSubmitting || !test) return;
      setIsSubmitting(true);
      setSubmitted(true);

      try {
        const evaluation = await testService.submitTestAttempt(
          test._id || test.id,
          selectedAnswersRef.current,
          user,
          {
            violations: violationsList,
            submissionType,
            timeSpentSeconds: timeSpent,
          }
        );

        setResult(evaluation);

        if (evaluation.pointsAwarded > 0) {
          addPoints(evaluation.pointsAwarded, `Completed Daily Test: ${test.title}`);
        }
        incrementStreak();

        if (evaluation.passed) {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          showSuccess(`🎉 Passed with ${evaluation.percentage}%! Points +${evaluation.pointsAwarded}`);
        } else {
          showInfo(`Test submitted. Your score: ${evaluation.percentage}%`);
        }
      } catch (err) {
        showError("Failed to submit test. Please check connection.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [submitted, isSubmitting, test, user, timeSpent, addPoints, incrementStreak, showSuccess, showError, showInfo]
  );

  // Hook for Exam Mode (Fullscreen, Tab Switch, Clipboard, Auto-submit)
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
    isActive: examStarted && !submitted,
    maxViolations: test?.maxViolations || 3,
    onAutoSubmit: (recordedViolations, type) => handleSubmit(recordedViolations, type),
    onViolationRecorded: async (type, details, count) => {
      if (test) {
        await testService.reportViolation(test._id || test.id, type, details, count);
      }
    },
    enableAntiCopy: test?.antiCopy !== false,
    enableAntiPaste: test?.antiPaste !== false,
    enableFullscreen: test?.fullscreenRequired !== false,
  });

  // Start exam flow after accepting rules
  const handleStartExamConfirmed = async () => {
    setShowRulesModal(false);
    await enterFullscreen();
    setExamStarted(true);
  };

  // Timer countdown
  useEffect(() => {
    if (!examStarted || submitted || timeLeft <= 0 || !test) return;

    const timer = setInterval(() => {
      setTimeSpent((s) => s + 1);
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(violations, "auto_timer");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, submitted, timeLeft, test, violations, handleSubmit]);

  const handleSelectOption = (questionId, optionIndex) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (loading || !test) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Loading Assessment Environment...</p>
        </div>
      </div>
    );
  }

  const questions = test.questions || [];
  const currentQ = questions[currentQIndex] || {};
  const currentQId = currentQ._id || currentQ.id;

  // 1. PRE-EXAM OVERVIEW SCREEN
  if (!examStarted && !submitted) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-2">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>VCET Exam Mode • Proctored Assessment</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{test.title}</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Category: <strong className="text-slate-700">{test.category}</strong> • Difficulty: <strong className="text-slate-700">{test.difficulty}</strong>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Streak: {streak?.currentStreak || 0} Days</span>
              </div>
            </div>
          </div>

          {/* Test Meta Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Questions</span>
              <span className="text-xl font-black text-slate-900">{questions.length} MCQs</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Duration</span>
              <span className="text-xl font-black text-slate-900">{test.durationMinutes || 10} Mins</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Passing Mark</span>
              <span className="text-xl font-black text-slate-900">{test.passingPercentage || 60}%</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Rewards</span>
              <span className="text-xl font-black text-blue-600">+{test.pointsReward || 10} Pts</span>
            </div>
          </div>

          {/* Exam Mode Safeguards notice */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
              <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Exam Mode Safeguards Activated</span>
            </div>
            <p className="text-xs text-blue-800 leading-relaxed">
              When started, this assessment will launch in fullscreen. Tab switches, window minimization, and copy/paste actions will be recorded as security strikes.
            </p>
          </div>

          {/* Start Button */}
          <div className="flex items-center justify-between pt-4">
            <Link
              to="/daily-test"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              ← Back to Tests
            </Link>
            <button
              type="button"
              onClick={() => setShowRulesModal(true)}
              className="px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white flex items-center gap-2 shadow-lg shadow-blue-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Start Assessment in Exam Mode</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Rules Modal */}
        <ExamRulesModal
          isOpen={showRulesModal}
          title={test.title}
          durationMinutes={test.durationMinutes || 10}
          maxViolations={test.maxViolations || 3}
          onStartExam={handleStartExamConfirmed}
          onCancel={() => setShowRulesModal(false)}
        />
      </div>
    );
  }

  // 2. ACTIVE EXAM MODE SCREEN
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col select-none">
      {/* Sticky Exam Mode Header */}
      {!submitted && (
        <ExamModeHeader
          title={test.title}
          timeLeftSeconds={timeLeft}
          formatTime={formatTime}
          violationCount={violationCount}
          maxViolations={test.maxViolations || 3}
          isFullscreen={isFullscreen}
          onSubmitExam={() => handleSubmit(violations, "manual")}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Main Question / Result Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {!submitted ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 8 Cols: Question Area */}
            <div className="lg:col-span-8 bg-slate-800/90 rounded-3xl border border-slate-700 p-6 sm:p-8 shadow-xl space-y-6">
              {/* Question Header */}
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-700">
                <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-bold">
                  Question {currentQIndex + 1} of {questions.length}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {selectedAnswers[currentQId] !== undefined ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Answered
                    </span>
                  ) : (
                    "Not Answered"
                  )}
                </span>
              </div>

              {/* Question Text */}
              <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                {currentQ.question}
              </h3>

              {/* Options List */}
              <div className="space-y-3">
                {(currentQ.options || []).map((opt, oIdx) => {
                  const isSelected = selectedAnswers[currentQId] === oIdx;
                  return (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => handleSelectOption(currentQId, oIdx)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                        isSelected
                          ? "bg-blue-600/30 border-blue-500 text-white shadow-md shadow-blue-500/10"
                          : "bg-slate-700/40 border-slate-700 text-slate-200 hover:bg-slate-700/70"
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                          isSelected ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300"
                        }`}
                      >
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className="text-xs sm:text-sm font-medium flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                <button
                  type="button"
                  disabled={currentQIndex === 0}
                  onClick={() => setCurrentQIndex((i) => Math.max(0, i - 1))}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-700/50 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Previous
                </button>

                {currentQIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQIndex((i) => Math.min(questions.length - 1, i + 1))}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSubmit(violations, "manual")}
                    className="px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    Submit Test <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Right 4 Cols: Question Palette & Proctoring Status */}
            <div className="lg:col-span-4 space-y-4">
              {/* Question Navigation Palette */}
              <div className="bg-slate-800/90 rounded-3xl border border-slate-700 p-5 shadow-xl space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Question Palette ({Object.keys(selectedAnswers).length}/{questions.length})
                </h4>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, idx) => {
                    const qId = q._id || q.id;
                    const isAnswered = selectedAnswers[qId] !== undefined;
                    const isCurrent = currentQIndex === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentQIndex(idx)}
                        className={`h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isCurrent
                            ? "ring-2 ring-blue-400 bg-blue-600 text-white font-black"
                            : isAnswered
                            ? "bg-emerald-600/30 border border-emerald-500/50 text-emerald-300"
                            : "bg-slate-700/60 text-slate-400 hover:bg-slate-700"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Security Monitor Card */}
              <div className="bg-slate-800/90 rounded-3xl border border-slate-700 p-5 shadow-xl space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <ShieldAlert className="w-4 h-4 text-blue-400" />
                  <span>Exam Mode Monitor</span>
                </div>
                <div className="text-[11px] text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Fullscreen:</span>
                    <span className={isFullscreen ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                      {isFullscreen ? "Locked" : "Warning"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Strikes:</span>
                    <span className={violationCount > 0 ? "text-rose-400 font-bold" : "text-slate-300"}>
                      {violationCount} / {test.maxViolations || 3}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Clipboard:</span>
                    <span className="text-emerald-400 font-bold">Protected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* 3. POST-TEST EVALUATION & RESULTS VIEW */
          <div className="bg-slate-800/90 rounded-3xl border border-slate-700 p-6 sm:p-10 shadow-2xl space-y-8 animate-in fade-in">
            {/* Results Banner */}
            <div className="text-center space-y-3 pb-6 border-b border-slate-700">
              <div
                className={`w-16 h-16 mx-auto rounded-3xl flex items-center justify-center ${
                  result?.passed
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                }`}
              >
                {result?.passed ? <Award className="w-8 h-8" /> : <HelpCircle className="w-8 h-8" />}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {result?.passed ? "Assessment Passed!" : "Assessment Completed"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                {result?.submissionType === "auto_violation"
                  ? "⚠️ This test was automatically submitted due to reaching the maximum violation limit."
                  : result?.submissionType === "auto_timer"
                  ? "⏱️ This test was automatically submitted when the countdown timer expired."
                  : "Your answers have been evaluated strictly on the backend."}
              </p>
            </div>

            {/* Score Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700 text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Score</span>
                <span className="text-2xl font-black text-white">{result?.percentage || 0}%</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700 text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Correct</span>
                <span className="text-2xl font-black text-emerald-400">
                  {result?.correctCount || 0} / {result?.totalCount || questions.length}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700 text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Points Awarded</span>
                <span className="text-2xl font-black text-blue-400">+{result?.pointsAwarded || 0}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700 text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Violations</span>
                <span className={`text-2xl font-black ${result?.violationsCount > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                  {result?.violationsCount || 0}
                </span>
              </div>
            </div>

            {/* Detailed Question Answers Breakdown */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                Detailed Solutions & Explanations
              </h3>
              <div className="space-y-3">
                {(result?.breakdown || []).map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border ${
                      item.isCorrect
                        ? "bg-emerald-950/20 border-emerald-500/30"
                        : "bg-rose-950/20 border-rose-500/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="text-xs sm:text-sm font-bold text-white">
                        {idx + 1}. {item.question}
                      </h4>
                      {item.isCorrect ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase shrink-0">
                          Correct
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-bold uppercase shrink-0">
                          Incorrect
                        </span>
                      )}
                    </div>
                    <div className="text-xs space-y-1 text-slate-300">
                      <div>
                        Your Answer:{" "}
                        <strong className={item.isCorrect ? "text-emerald-400" : "text-rose-400"}>
                          {item.selectedAnswer !== null && item.options?.[item.selectedAnswer]
                            ? item.options[item.selectedAnswer]
                            : "Not Answered"}
                        </strong>
                      </div>
                      {!item.isCorrect && (
                        <div>
                          Correct Answer:{" "}
                          <strong className="text-emerald-400">
                            {item.options?.[item.correctAnswer] || item.correctAnswer}
                          </strong>
                        </div>
                      )}
                      {item.explanation && (
                        <p className="text-[11px] text-slate-400 mt-1 italic">
                          💡 {item.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Post-Test Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-700">
              <Link
                to="/daily-test"
                className="px-6 py-3 rounded-2xl font-bold text-xs bg-slate-700 hover:bg-slate-600 text-white transition-colors"
              >
                ← Back to Daily Tests
              </Link>
              <Link
                to="/leaderboard"
                className="px-6 py-3 rounded-2xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center gap-1.5"
              >
                <span>View Leaderboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Violation Warning Modal */}
      <ViolationWarningModal
        isOpen={showWarningModal}
        violation={latestViolation}
        onDismiss={dismissWarning}
      />
    </div>
  );
}
