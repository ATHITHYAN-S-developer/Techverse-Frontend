import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Lock,
  Printer,
  CheckCheck,
} from "lucide-react";
import confetti from "canvas-confetti";
import { courseService } from "../services/courseService";
import { downloadCertificatePdf } from "../services/certificatePdfGenerator";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

/**
 * Extract YouTube 11-char Video ID safely
 */
function getYouTubeVideoId(url) {
  if (!url) return "";
  const trimmed = String(url).trim();
  if (trimmed.length === 11 && !trimmed.includes("/") && !trimmed.includes(".") && !trimmed.includes("?")) {
    return trimmed;
  }
  try {
    if (trimmed.includes("youtube.com/embed/")) {
      const match = trimmed.match(/embed\/([a-zA-Z0-9_-]{11})/);
      if (match) return match[1];
    }
    if (trimmed.includes("youtu.be/")) {
      const match = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
      if (match) return match[1];
    }
    const match = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (match) return match[1];

    const genericMatch = trimmed.match(/([a-zA-Z0-9_-]{11})/);
    return genericMatch ? genericMatch[1] : "";
  } catch (e) {
    return "";
  }
}

/**
 * YouTube Player Component with Real-Time 5-Second Segment Tracking
 */
function TrackedYouTubePlayer({
  videoUrl,
  moduleTitle,
  courseSlug,
  moduleId,
  watchPercentage,
  onProgressUpdate,
}) {
  const videoId = getYouTubeVideoId(videoUrl);
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [apiReady, setApiReady] = useState(false);

  // Initialize YouTube IFrame API
  useEffect(() => {
    if (!window.YT || !window.YT.Player) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setApiReady(true);
      };
    } else {
      setApiReady(true);
    }
  }, []);

  // Initialize Player once API and DOM are ready
  useEffect(() => {
    if (!apiReady || !containerRef.current || !videoId) return;

    let isDestroyed = false;

    try {
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            if (isDestroyed) return;
            const dur = event.target.getDuration();
            if (dur && dur > 0) setTotalSeconds(Math.round(dur));
          },
          onStateChange: (event) => {
            if (isDestroyed) return;
            // YT.PlayerState.PLAYING === 1
            if (event.data === 1) {
              setIsPlaying(true);
            } else {
              setIsPlaying(false);
            }
          },
        },
      });
    } catch (err) {
      console.warn("YouTube Player initialization notice:", err);
    }

    return () => {
      isDestroyed = true;
      if (playerRef.current && typeof playerRef.current.destroy === "function") {
        try {
          playerRef.current.destroy();
        } catch (e) {}
      }
    };
  }, [apiReady, videoId]);

  // Interval timer during playback to discretize watch segments
  useEffect(() => {
    if (!isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    let lastSentSegment = null;
    let pendingSegments = new Set();

    intervalRef.current = setInterval(async () => {
      if (!playerRef.current || typeof playerRef.current.getCurrentTime !== "function") return;

      try {
        const time = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration() || totalSeconds;
        const playbackRate = playerRef.current.getPlaybackRate ? playerRef.current.getPlaybackRate() : 1;

        setCurrentSeconds(Math.round(time));
        if (duration > 0 && totalSeconds === 0) setTotalSeconds(Math.round(duration));

        const segmentIdx = Math.floor(time / 5);
        pendingSegments.add(segmentIdx);

        // Send updates on new segment
        if (segmentIdx !== lastSentSegment && pendingSegments.size >= 1) {
          lastSentSegment = segmentIdx;
          const segmentsToSend = Array.from(pendingSegments);
          pendingSegments.clear();

          try {
            const result = await courseService.recordVideoProgress(courseSlug, moduleId, {
              segments: segmentsToSend,
              currentTime: time,
              duration,
              playbackRate,
            });

            if (result && typeof result.watchPercentage === "number") {
              onProgressUpdate(result);
            }
          } catch (e) {
            // Silently ignore minor network errors during playback
          }
        }
      } catch (err) {
        // Player state access exception
      }
    }, 1500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, courseSlug, moduleId, totalSeconds, onProgressUpdate]);

  if (!videoId) {
    return (
      <div className="aspect-video w-full rounded-2xl bg-white border border-[#C9C9C9] flex items-center justify-center text-[#444445] text-sm">
        Video tutorial loading or not available.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="aspect-video w-full rounded-2xl overflow-hidden bg-white shadow-sm border border-[#C9C9C9] relative">
        <div ref={containerRef} className="w-full h-full" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#444445] bg-white p-3 rounded-xl border border-[#C9C9C9]">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${isPlaying ? "bg-[#0062A8]" : "bg-[#C9C9C9]"}`} />
          <span className="font-semibold">
            {isPlaying ? "Playing Lesson" : "Paused"}
          </span>
        </div>
        <div className="flex items-center gap-4 font-mono text-[#444445]">
          <span>Time: {Math.floor(currentSeconds / 60)}:{String(currentSeconds % 60).padStart(2, "0")}</span>
          {totalSeconds > 0 && (
            <span>Total: {Math.floor(totalSeconds / 60)}:{String(totalSeconds % 60).padStart(2, "0")}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CourseLearningPage() {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showInfo, showError } = useToast();

  const [course, setCourse] = useState(null);
  const [currentModule, setCurrentModule] = useState(null);
  const [progression, setProgression] = useState(null);
  const [allModulesMap, setAllModulesMap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Active View Tab: "video" | "test"
  const [activeTab, setActiveTab] = useState("video");

  // Progression & Watch Tracking State
  const [watchPercentage, setWatchPercentage] = useState(0);
  const [uniqueWatchedSeconds, setUniqueWatchedSeconds] = useState(0);
  const [videoRequirementMet, setVideoRequirementMet] = useState(false);
  const [testUnlocked, setTestUnlocked] = useState(false);
  const [isModuleLocked, setIsModuleLocked] = useState(false);

  // Test & Assessment State
  const [testAnswers, setTestAnswers] = useState({});
  const [submittingTest, setSubmittingTest] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [testStartTime, setTestStartTime] = useState(null);

  // Fetch Course and Progression Data
  const loadModuleAndProgression = useCallback(async () => {
    try {
      setLoading(true);
      // Reset module-level states on load
      setActiveTab("video");
      setTestAnswers({});
      setTestResult(null);
      setTestStartTime(null);
      setShowCertificateModal(false);

      const res = await courseService.getCourseBySlug(courseId);
      const courseData = res?.course || res;
      setCourse(courseData);

      const modulesList = res?.modules || courseData?.modules || [];
      const isCourseDone = Boolean(courseData?.isCourseCompleted || (modulesList.length > 0 && modulesList.every((m) => m.completed || m.testPassed)));
      setAllModulesMap(modulesList.map((m) => isCourseDone ? { ...m, isUnlocked: true, testUnlocked: true, videoRequirementMet: true } : m));

      // Find current active module
      let activeMod = null;
      if (moduleId) {
        activeMod = modulesList.find(
          (m) => String(m._id) === String(moduleId) || String(m.moduleNumber) === String(moduleId)
        );
      }
      if (!activeMod && modulesList.length > 0) {
        activeMod = modulesList[0];
      }

      setCurrentModule(activeMod);

      // Fetch progression data for this module
      if (activeMod && activeMod._id) {
        const progRes = await courseService.getModuleProgression(courseId, activeMod._id);
        if (progRes) {
          setProgression(progRes);
          setWatchPercentage(progRes.watchPercentage || (isCourseDone ? 100 : 0));
          setUniqueWatchedSeconds(progRes.uniqueWatchedSeconds || 0);
          setVideoRequirementMet(isCourseDone || Boolean(progRes.videoRequirementMet));
          setTestUnlocked(isCourseDone || Boolean(progRes.testUnlocked));
          setIsModuleLocked(isCourseDone ? false : !progRes.isUnlocked);

          if (progRes.testScore !== null && progRes.testScore !== undefined) {
            setTestResult({
              scorePercentage: progRes.testScore,
              passed: progRes.testPassed,
            });
          }

          if (progRes.certificate) {
            setCertificate(progRes.certificate);
          }
        } else {
          setWatchPercentage(isCourseDone ? 100 : 0);
          setUniqueWatchedSeconds(0);
          setVideoRequirementMet(isCourseDone);
          setTestUnlocked(isCourseDone);
          setIsModuleLocked(isCourseDone ? false : (activeMod.moduleNumber > 1));
        }
      }
    } catch (err) {
      console.error("Failed to load course module progression:", err);
      showError("Could not load module data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [courseId, moduleId, showError]);

  useEffect(() => {
    loadModuleAndProgression();
  }, [loadModuleAndProgression]);

  // Handle live progress updates from TrackedYouTubePlayer
  const handleProgressUpdate = useCallback((result) => {
    if (!result) return;
    setWatchPercentage(result.watchPercentage || 0);
    setUniqueWatchedSeconds(result.uniqueWatchedSeconds || 0);

    if (result.videoRequirementMet) {
      if (!videoRequirementMet) {
        showSuccess("Lesson completed. Knowledge assessment test is now unlocked!");
      }
      setVideoRequirementMet(true);
      setTestUnlocked(true);
    }
  }, [videoRequirementMet, showSuccess]);

  // Handle Test Answer Selection
  const handleSelectAnswer = (questionIdx, optionIdx) => {
    setTestAnswers((prev) => ({
      ...prev,
      [questionIdx]: optionIdx,
    }));
  };

  // Submit Test for Server-Side Grading
  const handleSubmitTest = async () => {
    const questions = currentModule?.mcqs || [];
    if (questions.length === 0) {
      showError("No test questions available for this module.");
      return;
    }

    const answeredCount = Object.keys(testAnswers).length;
    if (answeredCount < questions.length) {
      const confirmSubmit = window.confirm(
        `You have answered ${answeredCount} of ${questions.length} questions. Submit anyway?`
      );
      if (!confirmSubmit) return;
    }

    try {
      setSubmittingTest(true);
      const timeSpent = testStartTime ? Math.round((Date.now() - testStartTime) / 1000) : 60;

      const result = await courseService.submitModuleTest(courseId, currentModule._id, {
        answers: testAnswers,
        timeSpentSeconds: timeSpent,
      });

      setTestResult(result);

      if (result.passed) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        showSuccess(`Congratulations! You passed with ${result.scorePercentage}%.`);

        if (result.certificate) {
          setCertificate(result.certificate);
          setShowCertificateModal(true);
        }

        loadModuleAndProgression();
      } else {
        showError(`Score: ${result.scorePercentage}%. Passing requires at least 50%. Please review and try again.`);
      }
    } catch (err) {
      console.error("Test submission failed:", err);
      showError(err.message || "Failed to submit test. Please complete the video lesson first.");
    } finally {
      setSubmittingTest(false);
    }
  };

  // Reset Test for Retry
  const handleRetryTest = () => {
    setTestAnswers({});
    setTestResult(null);
    setTestStartTime(Date.now());
    setActiveTab("test");
  };

  // Download PDF Certificate
  const handleDownloadCertificate = async (certObj = certificate) => {
    try {
      showInfo("Generating official PDF certificate...");
      const certData = {
        type: "module_appreciation",
        studentName: certObj?.studentName || user?.name || "Student",
        registerNumber: certObj?.registerNumber || user?.registerNumber || "732921104001",
        department: user?.department || "Department of Computer Science & Engineering",
        courseName: course?.title || "Course",
        moduleTitle: currentModule?.title || `Module ${currentModule?.moduleNumber}`,
        score: certObj?.score || testResult?.scorePercentage || 100,
        grade: (certObj?.score || testResult?.scorePercentage || 100) >= 85 ? "Distinction" : "First Class",
        certificateNumber: certObj?.certificateNumber || `VCET-MOD-${String(currentModule?._id || "2026").slice(-6).toUpperCase()}`,
        verificationCode: certObj?.verificationCode || `0x${Math.random().toString(16).substring(2, 10).toUpperCase()}`,
        issuedAt: certObj?.issuedAt || new Date().toISOString(),
      };

      await downloadCertificatePdf(certData);
      showSuccess("Certificate downloaded successfully!");
    } catch (e) {
      console.error("Certificate generation error:", e);
      showError("Could not render certificate PDF.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-[#444445] flex flex-col items-center justify-center p-6">
        <div className="w-10 h-10 border-3 border-[#0062A8] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-[#444445]">Loading course lesson...</p>
      </div>
    );
  }

  // If student attempted to access a locked module directly
  if (isModuleLocked) {
    return (
      <div className="min-h-screen bg-white text-[#444445] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-[#C9C9C9] rounded-2xl p-8 text-center space-y-5 shadow-sm">
          <div className="w-14 h-14 bg-[#0062A8]/10 text-[#0062A8] rounded-2xl flex items-center justify-center mx-auto border border-[#0062A8]/20">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#444445] mb-2">Module Locked</h2>
            <p className="text-sm text-[#444445] leading-relaxed">
              Please complete the previous modules in this course to unlock this lesson and its assessment.
            </p>
          </div>
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="w-full py-2.5 px-5 rounded-xl bg-[#0062A8] hover:bg-[#00518c] text-white font-semibold text-sm transition cursor-pointer"
          >
            Back to Course Syllabus
          </button>
        </div>
      </div>
    );
  }

  const currentModNumber = currentModule?.moduleNumber || 1;
  const nextModule = allModulesMap.find((m) => m.moduleNumber === currentModNumber + 1);

  return (
    <div className="min-h-screen bg-white text-[#444445] flex flex-col font-sans">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#C9C9C9] px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to={`/courses/${courseId}`}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-[#444445] transition border border-[#C9C9C9]"
            title="Back to Course"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#0062A8]/10 text-[#0062A8] border border-[#0062A8]/20">
                Module {currentModNumber} of {allModulesMap.length || 1}
              </span>
              <span className="text-xs text-[#444445] font-medium truncate max-w-[200px] sm:max-w-sm">
                {course?.title}
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-[#444445] tracking-tight truncate max-w-[260px] sm:max-w-md">
              {currentModule?.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Simple Word Progress Badge */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-[#444445] font-semibold">Progress:</span>
            {testResult?.passed ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#0062A8]/10 text-[#0062A8] border border-[#0062A8]/20">
                Completed
              </span>
            ) : videoRequirementMet || testUnlocked ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#0062A8]/10 text-[#0062A8] border border-[#0062A8]/20">
                Assessment Ready
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-[#444445] border border-[#C9C9C9]">
                In Progress
              </span>
            )}
          </div>

          {/* Mobile Syllabus Drawer Trigger */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-xl bg-white text-[#444445] border border-[#C9C9C9]"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left / Main Learning Panel */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto w-full">
          {/* TAB SWITCHER */}
          <div className="flex items-center gap-3 border-b border-[#C9C9C9] pb-4">
            <button
              onClick={() => setActiveTab("video")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === "video"
                  ? "bg-[#0062A8] text-white shadow-sm"
                  : "bg-white text-[#444445] hover:bg-slate-50 border border-[#C9C9C9]"
              }`}
            >
              <Video className="w-4 h-4" />
              <span>1. Tutorial Video</span>
            </button>

            <button
              onClick={() => {
                if (testUnlocked || videoRequirementMet) {
                  setActiveTab("test");
                  if (!testStartTime) setTestStartTime(Date.now());
                } else {
                  showError("Please complete the tutorial video lesson to proceed to the assessment.");
                }
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === "test"
                  ? "bg-[#0062A8] text-white shadow-sm"
                  : testUnlocked || videoRequirementMet
                  ? "bg-white text-[#0062A8] hover:bg-slate-50 border border-[#0062A8]/30"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed border border-[#C9C9C9]"
              }`}
            >
              {testUnlocked || videoRequirementMet ? (
                <CheckCircle2 className="w-4 h-4 text-[#0062A8]" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              <span>2. Knowledge Assessment Test</span>
            </button>
          </div>

          {/* TAB 1: TUTORIAL VIDEO VIEW */}
          {activeTab === "video" && (
            <div className="space-y-6">
              <TrackedYouTubePlayer
                videoUrl={currentModule?.videoUrl}
                moduleTitle={currentModule?.title}
                courseSlug={courseId}
                moduleId={currentModule?._id}
                watchPercentage={watchPercentage}
                onProgressUpdate={handleProgressUpdate}
              />

              {/* Module Description & Unlock Callout */}
              <div className="bg-white border border-[#C9C9C9] rounded-2xl p-6 space-y-4">
                <h3 className="text-base sm:text-lg font-bold text-[#444445] flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#0062A8]" />
                  <span>Module Overview</span>
                </h3>
                <p className="text-[#444445] text-sm leading-relaxed">
                  {currentModule?.description || "Master the concepts in this module and complete the video lesson to unlock the knowledge assessment test."}
                </p>

                {/* Call-to-action banner when unlocked */}
                {testUnlocked || videoRequirementMet ? (
                  <div className="p-4 rounded-xl bg-white border border-[#0062A8]/30 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#0062A8]/10 text-[#0062A8]">
                        <CheckCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#444445]">Video Lesson Completed</h4>
                        <p className="text-xs text-[#444445]">Complete the knowledge assessment test to earn your certificate and proceed.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab("test");
                        if (!testStartTime) setTestStartTime(Date.now());
                      }}
                      className="px-5 py-2.5 rounded-xl bg-[#0062A8] hover:bg-[#00518c] text-white font-bold text-xs transition cursor-pointer flex items-center gap-2"
                    >
                      <span>Start Assessment</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-white border border-[#C9C9C9] flex items-center gap-2.5 text-[#444445] text-xs">
                    <Lock className="w-4 h-4 text-[#0062A8] shrink-0" />
                    <span>Watch the tutorial video lesson to unlock the knowledge assessment test.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: KNOWLEDGE ASSESSMENT TEST VIEW */}
          {activeTab === "test" && (
            <div className="space-y-6">
              {!testUnlocked && !videoRequirementMet ? (
                <div className="bg-white border border-[#C9C9C9] rounded-2xl p-10 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#0062A8]/10 text-[#0062A8] border border-[#0062A8]/20 flex items-center justify-center mx-auto">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#444445]">Knowledge Assessment is Locked</h3>
                  <p className="text-sm text-[#444445] max-w-md mx-auto">
                    Please finish watching the tutorial video lesson to unlock this assessment test.
                  </p>
                  <button
                    onClick={() => setActiveTab("video")}
                    className="px-6 py-2.5 rounded-xl bg-[#0062A8] hover:bg-[#00518c] text-white font-bold text-xs transition cursor-pointer"
                  >
                    Resume Tutorial Video
                  </button>
                </div>
              ) : testResult ? (
                /* Assessment Result Review Panel */
                <div className="space-y-6">
                  <div className="p-6 sm:p-8 rounded-2xl border border-[#C9C9C9] bg-white text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto border border-[#0062A8]/20 bg-[#0062A8]/10 text-[#0062A8]">
                      <Award className="w-7 h-7" />
                    </div>

                    <div>
                      <span className="text-xs uppercase font-bold tracking-wider text-[#444445]">
                        Assessment Result
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-bold text-[#444445] mt-1">
                        Score: {testResult.scorePercentage}%
                      </h2>
                      <p className="text-sm text-[#444445] mt-2">
                        {testResult.passed
                          ? `Passed! Appreciation Certificate is issued.`
                          : `Score did not meet the 50% passing threshold. Please review and try again.`}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      {testResult.passed && certificate && (
                        <button
                          onClick={() => setShowCertificateModal(true)}
                          className="px-5 py-2.5 rounded-xl bg-[#0062A8] hover:bg-[#00518c] text-white font-bold text-xs transition cursor-pointer flex items-center gap-2"
                        >
                          <Award className="w-4 h-4" />
                          <span>View Appreciation Certificate</span>
                        </button>
                      )}

                      {testResult.passed && nextModule && (
                        <button
                          onClick={() => navigate(`/courses/${courseId}/module/${nextModule._id || nextModule.moduleNumber}`)}
                          className="px-5 py-2.5 rounded-xl bg-[#0062A8] hover:bg-[#00518c] text-white font-bold text-xs transition cursor-pointer flex items-center gap-2"
                        >
                          <span>Proceed to Module {nextModule.moduleNumber}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={handleRetryTest}
                        className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#444445] font-semibold text-xs transition border border-[#C9C9C9] flex items-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Retake Assessment</span>
                      </button>
                    </div>
                  </div>

                  {/* Question Review Breakdown */}
                  {testResult.questions && testResult.questions.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-[#444445]">Answer Breakdown & Explanations</h4>
                      {testResult.questions.map((q, qIdx) => (
                        <div
                          key={qIdx}
                          className="p-5 rounded-2xl border border-[#C9C9C9] bg-white text-left space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-sm font-bold text-[#444445]">
                              {qIdx + 1}. {q.questionText}
                            </span>
                            {q.isCorrect ? (
                              <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                                Correct ✓
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded bg-red-50 text-red-700 text-xs font-bold border border-red-200">
                                Incorrect ✗
                              </span>
                            )}
                          </div>

                          <div className="space-y-1.5 text-xs font-medium">
                            {q.options?.map((opt, optIdx) => (
                              <div
                                key={optIdx}
                                className={`p-2.5 rounded-xl border ${
                                  optIdx === q.correctAnswer
                                    ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold"
                                    : Number(q.selectedAnswer) === optIdx
                                    ? "bg-red-50 border-red-300 text-red-800"
                                    : "bg-white border-[#C9C9C9] text-[#444445]"
                                }`}
                              >
                                {opt} {optIdx === q.correctAnswer && " (Correct Answer)"}
                              </div>
                            ))}
                          </div>

                          {q.explanation && (
                            <p className="text-xs text-[#444445] bg-slate-50 p-3 rounded-xl border border-[#C9C9C9]">
                              <strong className="text-[#444445]">Explanation:</strong> {q.explanation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Assessment Questions Form */
                <div className="space-y-6">
                  <div className="bg-white border border-[#C9C9C9] rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-[#444445]">
                        Module {currentModNumber} Knowledge Assessment
                      </h3>
                      <p className="text-xs text-[#444445]">
                        {currentModule?.mcqs?.length || 0} Questions • Minimum 50% score required to pass and unlock Module {currentModNumber + 1}.
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-slate-100 text-[#444445] border border-[#C9C9C9]">
                      Answered: {Object.keys(testAnswers).length} / {currentModule?.mcqs?.length || 0}
                    </span>
                  </div>

                  {/* Questions List */}
                  <div className="space-y-6">
                    {currentModule?.mcqs?.map((q, qIdx) => (
                      <div key={qIdx} className="bg-white border border-[#C9C9C9] rounded-2xl p-6 space-y-4">
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-7 h-7 rounded-xl bg-[#0062A8]/10 text-[#0062A8] font-bold text-xs flex items-center justify-center border border-[#0062A8]/20">
                            {qIdx + 1}
                          </span>
                          <h4 className="text-sm sm:text-base font-bold text-[#444445] leading-snug">
                            {q.question}
                          </h4>
                        </div>

                        {/* Options */}
                        <div className="space-y-2.5 pt-1">
                          {q.options?.map((opt, optIdx) => {
                            const isSelected = testAnswers[qIdx] === optIdx;
                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => handleSelectAnswer(qIdx, optIdx)}
                                className={`w-full text-left p-3.5 sm:p-4 rounded-xl text-xs sm:text-sm transition cursor-pointer flex items-center justify-between border ${
                                  isSelected
                                    ? "bg-[#0062A8] text-white border-[#0062A8] font-semibold"
                                    : "bg-white hover:bg-slate-50 text-[#444445] border-[#C9C9C9]"
                                }`}
                              >
                                <span>{opt}</span>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                  isSelected ? "border-white bg-white text-[#0062A8]" : "border-[#C9C9C9]"
                                }`}>
                                  {isSelected && <div className="w-2 h-2 rounded-full bg-[#0062A8]" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={handleSubmitTest}
                      disabled={submittingTest}
                      className="px-8 py-3 rounded-xl bg-[#0062A8] hover:bg-[#00518c] text-white font-bold text-sm transition cursor-pointer shadow-sm disabled:opacity-50 flex items-center gap-2"
                    >
                      {submittingTest ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Evaluating Answers...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Submit Assessment</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Right / Sidebar: Sequential Course Syllabus */}
        <aside
          className={`fixed lg:static inset-y-0 right-0 z-50 w-80 bg-white border-l border-[#C9C9C9] p-6 flex flex-col space-y-6 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0 shadow-2xl" : "translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#444445]">Course Syllabus</h3>
              <p className="text-xs text-[#444445]">Sequential Progression</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg bg-white text-[#444445] border border-[#C9C9C9]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {allModulesMap.map((m, index) => {
              const mNum = m.moduleNumber || index + 1;
              const isCurrent = String(m._id) === String(currentModule?._id);
              const isPassed = Boolean(m.testPassed || m.completed);
              const isUnlocked = Boolean(m.isUnlocked);

              return (
                <div
                  key={m._id || index}
                  onClick={() => {
                    if (isUnlocked) {
                      navigate(`/courses/${courseId}/module/${m._id || mNum}`);
                      setSidebarOpen(false);
                    } else {
                      showError(`Module ${mNum} is locked. Complete Module ${mNum - 1} first.`);
                    }
                  }}
                  className={`p-3.5 rounded-2xl border transition text-left cursor-pointer space-y-2 ${
                    isCurrent
                      ? "bg-blue-50/50 border-[#0062A8] shadow-sm"
                      : isPassed
                      ? "bg-white border-[#C9C9C9] hover:border-[#0062A8]"
                      : isUnlocked
                      ? "bg-white border-[#C9C9C9] hover:border-[#0062A8]"
                      : "bg-slate-50 border-[#C9C9C9] opacity-60 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#444445] font-mono">
                      Module {mNum}
                    </span>
                    {isPassed ? (
                      <span className="px-2 py-0.5 rounded-md bg-[#0062A8]/10 text-[#0062A8] text-[10px] font-bold flex items-center gap-1 border border-[#0062A8]/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed
                      </span>
                    ) : isUnlocked ? (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[#444445] text-[10px] font-bold flex items-center gap-1 border border-[#C9C9C9]">
                        <PlayCircle className="w-3 h-3" />
                        Available
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[#444445] text-[10px] font-bold flex items-center gap-1 border border-[#C9C9C9]">
                        <Lock className="w-3 h-3" />
                        Locked
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-[#444445] line-clamp-1">
                    {m.title}
                  </h4>
                </div>
              );
            })}
          </div>
        </aside>
      </div>

      {/* 3. Appreciation Certificate Modal */}
      {showCertificateModal && certificate && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full bg-white border border-[#C9C9C9] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative text-center">
            <button
              onClick={() => setShowCertificateModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white hover:bg-slate-50 text-[#444445] transition border border-[#C9C9C9]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-[#0062A8]/10 text-[#0062A8] border border-[#0062A8]/20 flex items-center justify-center mx-auto">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-[#0062A8]">
                Official Credential Issued
              </span>
              <h2 className="text-2xl font-bold text-[#444445] mt-1">
                Certificate of Appreciation
              </h2>
              <p className="text-xs text-[#444445] mt-1">
                Velalar College of Engineering and Technology (Autonomous)
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#C9C9C9] text-left text-xs space-y-3 font-mono">
              <div className="flex justify-between border-b border-[#C9C9C9] pb-2">
                <span className="text-[#444445]">Student Name:</span>
                <span className="text-[#444445] font-bold">{certificate.studentName || user?.name}</span>
              </div>
              <div className="flex justify-between border-b border-[#C9C9C9] pb-2">
                <span className="text-[#444445]">Register Number:</span>
                <span className="text-[#444445] font-bold">{certificate.registerNumber || user?.registerNumber}</span>
              </div>
              <div className="flex justify-between border-b border-[#C9C9C9] pb-2">
                <span className="text-[#444445]">Module Completed:</span>
                <span className="text-[#444445] font-bold">{currentModule?.title}</span>
              </div>
              <div className="flex justify-between border-b border-[#C9C9C9] pb-2">
                <span className="text-[#444445]">Assessment Score:</span>
                <span className="text-[#0062A8] font-bold">{certificate.score || testResult?.scorePercentage}% ({certificate.grade || "Distinction"})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#444445]">Certificate ID:</span>
                <span className="text-[#0062A8] font-bold">{certificate.certificateNumber}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => handleDownloadCertificate(certificate)}
                className="px-6 py-3 rounded-xl bg-[#0062A8] hover:bg-[#00518c] text-white font-bold text-xs transition cursor-pointer flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF Certificate</span>
              </button>

              {nextModule && (
                <button
                  onClick={() => {
                    setShowCertificateModal(false);
                    navigate(`/courses/${courseId}/module/${nextModule._id || nextModule.moduleNumber}`);
                  }}
                  className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-[#444445] border border-[#C9C9C9] font-bold text-xs transition cursor-pointer flex items-center gap-2"
                >
                  <span>Proceed to Module {nextModule.moduleNumber}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
