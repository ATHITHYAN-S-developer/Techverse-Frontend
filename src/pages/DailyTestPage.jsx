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
  Lock,
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

      let evaluation = null;
      try {
        evaluation = await testService.submitTestAttempt(
          test._id || test.id,
          selectedAnswersRef.current,
          user,
          {
            violations: violationsList,
            submissionType,
            timeSpentSeconds: timeSpent,
          }
        );
      } catch (err) {
        console.warn("Backend evaluation request failed, computing fallback evaluation:", err);
        const questionsList = test.questions || [];
        let score = 0;
        const breakdown = questionsList.map((q) => {
          const qId = q._id || q.id;
          const selected = selectedAnswersRef.current[qId] ?? null;
          let isCorrect = false;
          if (selected !== null && selected !== undefined) {
            if (typeof q.correctAnswer === "number") {
              isCorrect = Number(selected) === Number(q.correctAnswer);
            } else if (typeof q.correctAnswer === "string") {
              isCorrect = q.options?.[selected]?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
            }
          }
          if (isCorrect) score += 1;
          return {
            _id: qId,
            question: q.question,
            options: q.options || [],
            selectedAnswer: selected,
            correctAnswer: q.correctAnswer ?? 0,
            isCorrect,
            explanation: q.explanation || "",
          };
        });
        const percentage = questionsList.length > 0 ? Math.round((score / questionsList.length) * 100) : 0;
        const passed = percentage >= (test.passingPercentage || 60);
        evaluation = {
          percentage,
          passed,
          pointsAwarded: passed ? (test.pointsReward || 10) : 0,
          correctCount: score,
          totalCount: questionsList.length,
          violationsCount: violationsList.length,
          submissionType,
          breakdown,
        };
      }

      if (evaluation) {
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
      }
      setIsSubmitting(false);
    },
    [submitted, isSubmitting, test, user, timeSpent, addPoints, incrementStreak, showSuccess, showInfo]
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

  // 0. LOCKED FINAL COURSE ASSESSMENT SCREEN
  if (test?.isLocked) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-sky-100 p-8 sm:p-10 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase font-bold tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Prerequisite Requirement
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
              Final Course Assessment Locked
            </h1>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              {test.lockReason || "You must attend and pass all individual module knowledge tests in this course before attempting the final assessment."}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold flex items-center justify-around">
            <span>Course Progress:</span>
            <span className="font-bold text-[#0062A8]">{test.completedModulesCount} of {test.totalModules} Module Tests Passed</span>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate(test.courseSlug ? `/courses/${test.courseSlug}` : "/courses")}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0062A8] hover:bg-[#00518c] text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Go to Course Modules</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/tests")}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs transition cursor-pointer"
            >
              View Daily Tests
            </button>
          </div>
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
        <div className="bg-white rounded-3xl border border-sky-100 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-sky-100">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold mb-2">
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
            <div className="p-4 rounded-2xl bg-[#f0f9ff] border border-sky-100 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Questions</span>
              <span className="text-xl font-black text-slate-900">{questions.length} MCQs</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#f0f9ff] border border-sky-100 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Duration</span>
              <span className="text-xl font-black text-slate-900">{test.durationMinutes || 10} Mins</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#f0f9ff] border border-sky-100 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Passing Mark</span>
              <span className="text-xl font-black text-slate-900">{test.passingPercentage || 60}%</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#f0f9ff] border border-sky-100 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Rewards</span>
              <span className="text-xl font-black text-sky-600">+{test.pointsReward || 10} Pts</span>
            </div>
          </div>

          {/* Exam Mode Safeguards notice */}
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-900">
              <ShieldAlert className="w-4 h-4 text-sky-600 shrink-0" />
              <span>Exam Mode Safeguards Activated</span>
            </div>
            <p className="text-xs text-sky-800 leading-relaxed">
              When started, this assessment will launch in fullscreen. Tab switches, window minimization, and copy/paste actions will be recorded as security strikes.
            </p>
          </div>

          {/* Start Button */}
          <div className="flex items-center justify-between pt-4">
            <Link
              to="/daily-test"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-sky-50 hover:text-sky-700 transition-colors"
            >
              ← Back to Tests
            </Link>
            <button
              type="button"
              onClick={() => setShowRulesModal(true)}
              className="px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider bg-sky-600 hover:bg-sky-700 text-white flex items-center gap-2 shadow-md shadow-sky-600/20 active:scale-95 transition-all cursor-pointer"
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
    <div className="min-h-screen flex flex-col select-none bg-slate-50/60 text-slate-900">
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
            <div className="lg:col-span-8 bg-white rounded-3xl border border-sky-100 p-6 sm:p-8 shadow-sm space-y-6">
              {/* Question Header */}
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <span className="px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-[#0B4A8F] text-xs font-bold">
                  Question {currentQIndex + 1} of {questions.length}
                </span>
                <span className="text-xs font-medium">
                  {selectedAnswers[currentQId] !== undefined ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Answered
                    </span>
                  ) : (
                    <span className="text-slate-400">Not Answered</span>
                  )}
                </span>
              </div>

              {/* Question Text */}
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
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
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3.5 ${
                        isSelected
                          ? "bg-sky-50/80 border-[#0B4A8F] text-[#0B4A8F] shadow-xs"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-sky-50/40 hover:border-sky-200"
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                          isSelected ? "bg-[#0B4A8F] text-white" : "bg-slate-100 text-slate-600"
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
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={currentQIndex === 0}
                  onClick={() => setCurrentQIndex((i) => Math.max(0, i - 1))}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Previous
                </button>

                {currentQIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQIndex((i) => Math.min(questions.length - 1, i + 1))}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#0B4A8F] hover:bg-[#0062A8] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
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
              <div className="bg-white rounded-3xl border border-sky-100 p-5 shadow-sm space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
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
                            ? "ring-2 ring-sky-400 bg-[#0B4A8F] text-white font-black shadow-xs"
                            : isAnswered
                            ? "bg-emerald-50 border border-emerald-300 text-emerald-700"
                            : "bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Security Monitor Card */}
              <div className="bg-white rounded-3xl border border-sky-100 p-5 shadow-sm space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <ShieldAlert className="w-4 h-4 text-[#0B4A8F]" />
                  <span>Exam Mode Monitor</span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-1.5">
                  <div className="flex justify-between">
                    <span>Fullscreen:</span>
                    <span className={isFullscreen ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                      {isFullscreen ? "Locked" : "Warning"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Strikes:</span>
                    <span className={violationCount > 0 ? "text-rose-600 font-bold" : "text-slate-700 font-bold"}>
                      {violationCount} / {test.maxViolations || 3}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Clipboard:</span>
                    <span className="text-emerald-600 font-bold">Protected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* 3. POST-TEST EVALUATION & RESULTS VIEW (WHITE & ICE BLUE THEME) */
          <div className="bg-white rounded-3xl border border-sky-100 p-6 sm:p-10 shadow-sm space-y-8 animate-in fade-in">
            {/* Results Banner */}
            <div className="text-center space-y-3 pb-6 border-b border-sky-100">
              <div
                className={`w-16 h-16 mx-auto rounded-3xl flex items-center justify-center ${
                  result?.passed
                    ? "bg-sky-50 text-sky-600 border-2 border-sky-200 shadow-xs"
                    : "bg-slate-50 text-slate-600 border border-slate-200"
                }`}
              >
                {result?.passed ? <Award className="w-8 h-8" /> : <HelpCircle className="w-8 h-8" />}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                {result?.passed ? "Assessment Passed!" : "Assessment Completed"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
                {result?.submissionType === "auto_violation"
                  ? "⚠️ This test was automatically submitted due to reaching the maximum security strike limit."
                  : result?.submissionType === "auto_timer"
                  ? "⏱️ This test was automatically submitted when the countdown timer expired."
                  : "Your answers have been evaluated and recorded securely on the backend."}
              </p>
            </div>

            {/* Score Metrics (White & Ice Blue Cards) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white border-2 border-sky-100 hover:border-sky-200 transition-all text-center shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Score</span>
                <span className="text-2xl font-black text-sky-600">{result?.percentage || 0}%</span>
              </div>
              <div className="p-4 rounded-2xl bg-white border-2 border-sky-100 hover:border-sky-200 transition-all text-center shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Correct</span>
                <span className="text-2xl font-black text-sky-600">
                  {result?.correctCount || 0} / {result?.totalCount || questions.length}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-white border-2 border-sky-100 hover:border-sky-200 transition-all text-center shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Points Awarded</span>
                <span className="text-2xl font-black text-sky-600">+{result?.pointsAwarded || 0}</span>
              </div>
              <div className="p-4 rounded-2xl bg-white border-2 border-sky-100 hover:border-sky-200 transition-all text-center shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Violations</span>
                <span className={`text-2xl font-black ${result?.violationsCount > 0 ? "text-rose-600" : "text-slate-700"}`}>
                  {result?.violationsCount || 0}
                </span>
              </div>
            </div>

            {/* Detailed Solutions & Explanations */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider text-sky-800">
                  Detailed Solutions & Explanations
                </h3>
                <span className="text-xs text-slate-500 font-semibold">
                  {questions.length} Questions Reviewed
                </span>
              </div>

              <div className="space-y-4">
                {(result?.breakdown || []).map((item, idx) => {
                  const isCorrect = item.isCorrect;
                  const selectedText =
                    item.selectedAnswer !== null && item.selectedAnswer !== undefined && item.options?.[item.selectedAnswer]
                      ? item.options[item.selectedAnswer]
                      : "Not Answered";
                  const correctText = item.options?.[item.correctAnswer] || item.correctAnswer || "Option A";

                  return (
                    <div
                      key={idx}
                      className={`p-5 rounded-2xl border transition-all ${
                        isCorrect
                          ? "bg-white border-2 border-sky-200 shadow-xs"
                          : "bg-white border-2 border-rose-200 shadow-xs"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-start gap-2">
                          <span className={`text-xs font-black ${isCorrect ? "text-sky-700" : "text-rose-600"}`}>
                            {idx + 1}.
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                            {item.question}
                          </h4>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-black shrink-0 ${
                            isCorrect
                              ? "bg-sky-50 text-sky-700 border border-sky-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {isCorrect ? "CORRECT" : "INCORRECT"}
                        </span>
                      </div>

                      {/* Answers review area */}
                      <div className="space-y-2 pt-1">
                        <div className="text-xs text-slate-700 flex items-center gap-2">
                          <span className="font-bold text-slate-500 text-[11px]">Your Answer:</span>
                          <span
                            className={`font-bold ${
                              isCorrect ? "text-sky-700" : "text-rose-600"
                            }`}
                          >
                            {selectedText}
                          </span>
                        </div>

                        {!isCorrect && (
                          <div className="text-xs text-slate-700 flex items-center gap-2">
                            <span className="font-bold text-slate-500 text-[11px]">Correct Answer:</span>
                            <span className="font-bold text-emerald-600">
                              {correctText}
                            </span>
                          </div>
                        )}

                        {item.explanation && (
                          <div className="mt-2.5 p-3 rounded-xl bg-sky-50/50 border border-sky-100 text-xs text-slate-600 leading-relaxed flex items-start gap-2">
                            <span className="text-amber-500">💡</span>
                            <span>{item.explanation}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Post-Test Actions (White & Ice Blue Buttons) */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-sky-100">
              <Link
                to="/daily-test"
                className="px-6 py-3 rounded-xl font-bold text-xs bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-colors shadow-xs"
              >
                ← Back to Daily Tests
              </Link>
              <Link
                to="/leaderboard"
                className="px-6 py-3 rounded-xl font-extrabold text-xs bg-sky-600 hover:bg-sky-700 text-white transition-all shadow-sm flex items-center gap-2"
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
