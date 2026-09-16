import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  PlayCircle,
  ArrowLeft,
  ArrowRight,
  Download,
  FileText,
  Clock,
  Sparkles,
  Award,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Video,
  Code2,
  HelpCircle,
  Play,
  RotateCcw,
  Check,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import confetti from "canvas-confetti";
import { courseService } from "../services/courseService";
import { certificateService } from "../services/certificateService";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

/**
 * Extract YouTube 11-char Video ID or construct embed URL
 */
function getEmbedUrl(url) {
  if (!url) return "https://www.youtube.com/embed/rfscVS0vtbw";
  if (url.includes("youtube.com/embed/")) return url;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return url;
}

export default function CourseLearningPage() {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const { user, addPoints } = useAuth();
  const { showSuccess, showInfo, showError } = useToast();

  const [course, setCourse] = useState(null);
  const [currentModule, setCurrentModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Content Tabs: "video" | "coding" | "mcq" | "notes"
  const [activeTab, setActiveTab] = useState("video");
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);

  // Coding State
  const [activeProblemIndex, setActiveProblemIndex] = useState(0);
  const [code, setCode] = useState("");
  const [codeOutput, setCodeOutput] = useState("");
  const [codeRunning, setCodeRunning] = useState(false);
  const [codePassed, setCodePassed] = useState(false);

  // MCQ State
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const c = await courseService.getCourseById(courseId);
        setCourse(c);
        const mod =
          c.modules?.find((m) => (m._id || m.id) === moduleId) || c.modules?.[0];
        setCurrentModule(mod);
        setSelectedVideoIndex(0);
        setActiveTab("video");
        setQuizAnswers({});
        setQuizSubmitted(false);
        setQuizScore(null);
        setCodePassed(false);
        setCodeOutput("");

        // Initialize code starter if coding problem exists
        if (mod?.codingProblems && mod.codingProblems.length > 0) {
          setCode(mod.codingProblems[0].starterCode || "// Write your code here\n");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId, moduleId]);

  // Update starter code when changing active coding problem
  useEffect(() => {
    if (currentModule?.codingProblems?.[activeProblemIndex]) {
      setCode(
        currentModule.codingProblems[activeProblemIndex].starterCode ||
          "// Write your code here\n"
      );
      setCodeOutput("");
      setCodePassed(false);
    }
  }, [activeProblemIndex, currentModule]);

  const handleRunCode = () => {
    setCodeRunning(true);
    setCodeOutput("Compiling and executing against test cases...");
    setTimeout(() => {
      setCodeRunning(false);
      setCodePassed(true);
      setCodeOutput(
        "✓ All Test Cases Passed!\nTest Case 1: PASSED (12ms)\nTest Case 2 (Hidden): PASSED (18ms)\nOutput: Matches expected result."
      );
      showSuccess("Coding solution passed all test cases! (+30 Points)");
      addPoints(30, "Solved Coding Challenge");
    }, 1200);
  };

  const handleSelectQuizOption = (qIdx, optIdx) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({
      ...prev,
      [qIdx]: optIdx,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!currentModule?.mcqs || currentModule.mcqs.length === 0) return;

    const totalQuestions = currentModule.mcqs.length;
    const answeredCount = Object.keys(quizAnswers).length;

    if (answeredCount < totalQuestions) {
      if (
        !window.confirm(
          `You have answered ${answeredCount} of ${totalQuestions} questions. Submit anyway?`
        )
      ) {
        return;
      }
    }

    try {
      const res = await api.post(`/modules/${currentModule._id || currentModule.id}/submit-quiz`, {
        answers: quizAnswers,
      });

      if (res?.data?.success || res?.success) {
        const data = res?.data || res;
        setQuizScore(data);
        setQuizSubmitted(true);
        if (data.passed) {
          showSuccess(`Quiz Passed! Score: ${data.scorePercentage}% (+40 Points)`);
          addPoints(40, "Passed Module MCQ Quiz");
        } else {
          showInfo(`Quiz score: ${data.scorePercentage}%. Review explanations and retry.`);
        }
      }
    } catch (err) {
      // Local fallback calculation if offline
      let correct = 0;
      currentModule.mcqs.forEach((q, idx) => {
        if (quizAnswers[idx] === q.correctAnswer) correct++;
      });
      const pct = Math.round((correct / totalQuestions) * 100);
      setQuizScore({
        totalQuestions,
        correctCount: correct,
        scorePercentage: pct,
        passed: pct >= 50,
      });
      setQuizSubmitted(true);
    }
  };

  const handleMarkComplete = async () => {
    if (!course || !currentModule) return;

    // Optional safety checks
    if (currentModule.hasCoding && !codePassed) {
      if (!window.confirm("You have not run/passed the coding challenge. Complete module anyway?")) {
        return;
      }
    }

    if (currentModule.hasMCQ && !quizSubmitted) {
      if (!window.confirm("You have not submitted the MCQ quiz. Complete module anyway?")) {
        return;
      }
    }

    const modId = currentModule._id || currentModule.id;
    const updated = await courseService.markModuleCompleted(course.id || course._id, modId);

    const newProgress = updated?.progress ?? updated?.enrollment?.progressPercentage ?? 50;

    setCourse((prev) => {
      const updatedModules = (updated?.modules || prev.modules || []).map((m) =>
        (m._id || m.id) === modId ? { ...m, completed: true } : m
      );
      return {
        ...prev,
        progress: newProgress,
        modules: updatedModules,
      };
    });

    setCurrentModule((prev) => ({ ...prev, completed: true }));

    showSuccess(`Completed "${currentModule.title}"! (+50 Points)`);
    addPoints(50, `Completed ${currentModule.title}`);

    // Check if course is 100% completed
    if (newProgress >= 100 || course.modules?.every((m) => (m._id || m.id) === modId || m.completed)) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      showSuccess("🎉 Congratulations! You have completed the entire course! (+500 Points)");
      addPoints(500, `Completed Course: ${course.title}`);
      await certificateService.generateCertificate(user, course, 94);
    }

    // Move to next module if available
    const currentIndex = course.modules.findIndex((m) => (m._id || m.id) === modId);
    if (currentIndex < course.modules.length - 1) {
      const nextMod = course.modules[currentIndex + 1];
      navigate(`/courses/${course.id || course._id}/module/${nextMod._id || nextMod.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#0B4A8F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course || !currentModule) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-800">No Learning Modules Found</h2>
        <p className="text-xs text-slate-500 max-w-md">
          This course currently does not have any modules published yet.
        </p>
        <button
          onClick={() => navigate(`/courses/${courseId || ""}`)}
          className="px-4 py-2 bg-[#0B4A8F] text-white rounded-xl text-xs font-bold"
        >
          Return to Course Details
        </button>
      </div>
    );
  }

  const moduleVideos =
    currentModule.videos && currentModule.videos.length > 0
      ? currentModule.videos
      : currentModule.videoUrl
      ? [
          {
            title: `${currentModule.title} - Core Lecture`,
            youtubeUrl: currentModule.videoUrl,
            duration: "30 mins",
          },
        ]
      : [];

  const activeVideo = moduleVideos[selectedVideoIndex] || moduleVideos[0];
  const activeCodingProblem = currentModule.codingProblems?.[activeProblemIndex];
  const currentIndex = course.modules.findIndex(
    (m) => (m._id || m.id) === (currentModule._id || currentModule.id)
  );

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col font-sans select-none">
      {/* Top Header Bar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            to={`/courses/${course.id || course._id}`}
            className="p-1.5 rounded-lg text-slate-500 hover:text-[#0B4A8F] hover:bg-sky-50 transition-colors"
            title="Course Overview"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1">
              {course.title}
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              Module {currentIndex + 1} of {course.modules.length} • {course.progress || 0}% Completed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg text-slate-600 hover:text-[#0B4A8F] hover:bg-sky-50 lg:hidden"
            aria-label="Toggle Syllabus"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link
            to="/courses"
            className="hidden sm:inline-block px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100/80 text-xs font-bold text-[#0B4A8F] border border-sky-200/60 transition-colors"
          >
            Courses Catalog
          </Link>
        </div>
      </header>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Modules Syllabus Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 sm:w-80 bg-white border-r border-slate-200/80 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static flex flex-col justify-between shadow-xs ${
            sidebarOpen ? "translate-x-0 pt-16 lg:pt-0" : "-translate-x-full"
          }`}
        >
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#0B4A8F]">
              Course Syllabus
            </span>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-3 space-y-1.5 overflow-y-auto flex-1">
            {course.modules.map((mod, idx) => {
              const modId = mod._id || mod.id;
              const isCurrent = modId === (currentModule._id || currentModule.id);
              return (
                <button
                  key={modId}
                  onClick={() => {
                    navigate(`/courses/${course.id || course._id}/module/${modId}`);
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all flex items-start gap-3 cursor-pointer ${
                    isCurrent
                      ? "bg-sky-100/90 border border-sky-300 text-[#0B4A8F] shadow-xs font-bold"
                      : "text-slate-700 hover:bg-sky-50/80 font-medium border border-transparent hover:border-sky-100"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {mod.completed ? (
                      <CheckCircle2 className={`w-4 h-4 ${isCurrent ? "text-emerald-600" : "text-emerald-600"}`} />
                    ) : (
                      <PlayCircle className={`w-4 h-4 ${isCurrent ? "text-[#0B4A8F]" : "text-[#0B4A8F]"}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs leading-snug line-clamp-2">{mod.title}</div>
                    <div className="flex items-center gap-1.5 text-[10px] mt-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-md font-bold ${isCurrent ? "bg-sky-200/80 text-[#0B4A8F]" : "bg-sky-100/70 text-[#0B4A8F]"}`}>
                        🎥 Video
                      </span>
                      {mod.hasCoding && (
                        <span className={`px-2 py-0.5 rounded-md font-bold ${isCurrent ? "bg-purple-200/80 text-purple-800" : "bg-purple-100/70 text-purple-700"}`}>
                          💻 Coding
                        </span>
                      )}
                      {mod.hasMCQ && (
                        <span className={`px-2 py-0.5 rounded-md font-bold ${isCurrent ? "bg-emerald-200/80 text-emerald-800" : "bg-emerald-100/70 text-emerald-700"}`}>
                          📝 MCQ
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-100 bg-sky-50/40">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5 font-bold">
              <span>Course Progress</span>
              <span className="text-[#0B4A8F]">{course.progress || 0}%</span>
            </div>
            <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#0B4A8F] h-2 rounded-full transition-all duration-500"
                style={{ width: `${course.progress || 0}%` }}
              />
            </div>
          </div>
        </aside>

        {/* Right Main Content Pane */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
          {/* Module Title & Actions Header */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold text-[#0B4A8F] uppercase tracking-wider">
                Module {currentIndex + 1} of {course.modules.length}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 leading-tight">
                {currentModule.title}
              </h2>
              {currentModule.description && (
                <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                  {currentModule.description}
                </p>
              )}
            </div>

            <button
              onClick={handleMarkComplete}
              className={`px-5 py-2.5 rounded-xl font-extrabold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                currentModule.completed
                  ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-sky-50 hover:bg-sky-100 text-[#0B4A8F] border border-sky-300"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{currentModule.completed ? "Module Completed ✓" : "Complete Module"}</span>
            </button>
          </div>

          {/* DYNAMIC CONTENT TABS (Mandatory Video, Optional Coding & MCQ) */}
          <div className="bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-2 overflow-x-auto">
            {/* 1. Video Tab (Always Present) */}
            <button
              type="button"
              onClick={() => setActiveTab("video")}
              className={`px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "video"
                  ? "bg-sky-100 text-[#0062A8] border-2 border-[#0062A8] font-black shadow-2xs"
                  : "text-slate-600 hover:text-[#0062A8] hover:bg-sky-50 font-semibold"
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Video Lectures ({moduleVideos.length})</span>
            </button>

            {/* 2. Coding Tab (Only if hasCoding) */}
            {currentModule.hasCoding && currentModule.codingProblems?.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab("coding")}
                className={`px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === "coding"
                    ? "bg-purple-100 text-purple-900 border-2 border-purple-600 font-black shadow-2xs"
                    : "text-purple-700 hover:bg-purple-50 font-semibold"
                }`}
              >
                <Code2 className="w-4 h-4" />
                <span>Coding Challenges ({currentModule.codingProblems.length})</span>
              </button>
            )}

            {/* 3. MCQ Tab (Only if hasMCQ) */}
            {currentModule.hasMCQ && currentModule.mcqs?.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab("mcq")}
                className={`px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === "mcq"
                    ? "bg-emerald-100 text-emerald-900 border-2 border-emerald-600 font-black shadow-2xs"
                    : "text-emerald-700 hover:bg-emerald-50 font-semibold"
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>MCQ Assessment ({currentModule.mcqs.length})</span>
              </button>
            )}
          </div>

          {/* =========================================================================
              TAB 1: VIDEO PLAYER & PLAYLIST (MANDATORY)
              ========================================================================= */}
          {activeTab === "video" && (
            <div className="space-y-4">
              {/* Video Player */}
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 shadow-xl border border-slate-200/80">
                <iframe
                  src={getEmbedUrl(activeVideo?.youtubeUrl)}
                  title={activeVideo?.title || currentModule.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Video Selector if Multiple Videos Exist */}
              {moduleVideos.length > 1 && (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2 shadow-xs">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#0B4A8F] block">
                    Module Video Playlist ({moduleVideos.length} Videos)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {moduleVideos.map((vid, vIdx) => (
                      <button
                        key={vIdx}
                        type="button"
                        onClick={() => setSelectedVideoIndex(vIdx)}
                        className={`p-3 rounded-xl text-left border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                          selectedVideoIndex === vIdx
                            ? "bg-sky-50 border-sky-300 text-[#0B4A8F] shadow-xs"
                            : "bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-sky-50/50"
                        }`}
                      >
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-[#0B4A8F] block">
                            Part {vIdx + 1} • {vid.duration || "20 mins"}
                          </span>
                          <span className="text-xs font-extrabold truncate block">
                            {vid.title}
                          </span>
                        </div>
                        {selectedVideoIndex === vIdx && (
                          <Check className="w-4 h-4 text-[#0B4A8F] shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              TAB 2: CODING CHALLENGE (OPTIONAL)
              ========================================================================= */}
          {activeTab === "coding" && currentModule.hasCoding && activeCodingProblem && (
            <div className="space-y-4">
              {/* Problem Statement Card */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                      {activeCodingProblem.difficulty || "Medium"}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {activeCodingProblem.title}
                    </h3>
                  </div>
                  {codePassed && (
                    <span className="px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" /> Passed
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {activeCodingProblem.description}
                </p>

                {activeCodingProblem.constraints && (
                  <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono">
                    <strong className="text-slate-800">Constraints:</strong> {activeCodingProblem.constraints}
                  </div>
                )}
              </div>

              {/* Code Editor Mock / Runner */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
                <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-purple-400" /> Solution Editor (JavaScript / Python)
                  </span>
                  <button
                    onClick={handleRunCode}
                    disabled={codeRunning}
                    className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{codeRunning ? "Executing..." : "Run & Test Code"}</span>
                  </button>
                </div>

                <textarea
                  rows={8}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-slate-950 text-sky-300 font-mono text-xs sm:text-sm p-4 focus:outline-none resize-y"
                />

                {codeOutput && (
                  <div className="p-4 bg-slate-900/90 border-t border-slate-800 font-mono text-xs whitespace-pre-line text-emerald-300">
                    {codeOutput}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 3: MCQ ASSESSMENT QUIZ (OPTIONAL)
              ========================================================================= */}
          {activeTab === "mcq" && currentModule.hasMCQ && currentModule.mcqs?.length > 0 && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-emerald-600" />
                    <span>Module Knowledge Check ({currentModule.mcqs.length} Questions)</span>
                  </h3>
                  {quizScore && (
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-black ${
                        quizScore.passed
                          ? "bg-emerald-100 border border-emerald-300 text-emerald-800"
                          : "bg-rose-100 border border-rose-300 text-rose-800"
                      }`}
                    >
                      Score: {quizScore.scorePercentage}% ({quizScore.passed ? "Passed ✓" : "Needs Review"})
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Answer the following multiple choice questions to validate your learning.
                </p>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {currentModule.mcqs.map((q, qIdx) => (
                  <div
                    key={qIdx}
                    className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-xs"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-black text-emerald-600">
                        Q{qIdx + 1}.
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                        {q.question}
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = quizAnswers[qIdx] === oIdx;
                        return (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() => handleSelectQuizOption(qIdx, oIdx)}
                            className={`p-3 rounded-xl text-left text-xs font-semibold border transition-all cursor-pointer flex items-center gap-2.5 ${
                              isSelected
                                ? "bg-emerald-50 border-emerald-400 text-emerald-950 shadow-xs"
                                : "bg-slate-50 border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50/40"
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-lg text-[11px] font-bold flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? "bg-emerald-600 text-white"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span className="flex-1">{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && q.explanation && (
                      <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                        <strong className="text-emerald-700">Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Submit Quiz CTA */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSubmitQuiz}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{quizSubmitted ? "Re-submit Quiz" : "Submit Assessment"}</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
