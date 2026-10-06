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
  AlertTriangle,
  ExternalLink,
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
    if (trimmed.includes("youtube.com/shorts/")) {
      const match = trimmed.match(/shorts\/([a-zA-Z0-9_-]{11})/);
      if (match) return match[1];
    }
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
  const [embedError, setEmbedError] = useState("");

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
    setEmbedError("");

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
          onError: (event) => {
            if (isDestroyed) return;
            console.warn("YouTube Player error event:", event.data);
            if (event.data === 101 || event.data === 150) {
              setEmbedError("This video cannot be played inside an embedded player because the YouTube creator or music copyright owner has disabled third-party website embedding (Error 101/150).");
            } else if (event.data === 100) {
              setEmbedError("This YouTube video was deleted or marked private by its creator.");
            } else if (event.data === 2) {
              setEmbedError("Invalid YouTube video ID parameter.");
            } else {
              setEmbedError("Unable to play video in embedded mode.");
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
      <div className="aspect-video w-full rounded-2xl bg-white border border-vcet-gray-border flex items-center justify-center text-vcet-dark text-sm">
        Video tutorial loading or not available.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="aspect-video w-full rounded-2xl overflow-hidden bg-white shadow-sm border border-vcet-gray-border relative">
        <div ref={containerRef} className="w-full h-full" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-vcet-dark bg-white p-3 rounded-xl border border-vcet-gray-border">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${isPlaying ? "bg-vcet-blue" : "bg-vcet-gray"}`} />
          <span className="font-semibold">
            {isPlaying ? "Playing Lesson" : "Paused"}
          </span>
        </div>
        <div className="flex items-center gap-4 font-mono text-vcet-dark">
          <span>Time: {Math.floor(currentSeconds / 60)}:{String(currentSeconds % 60).padStart(2, "0")}</span>
          {totalSeconds > 0 && (
            <span>Total: {Math.floor(totalSeconds / 60)}:{String(totalSeconds % 60).padStart(2, "0")}</span>
          )}
        </div>
      </div>

      {embedError && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-amber-950 text-sm">YouTube Blocked In-App Playback</p>
              <p className="text-amber-900 leading-relaxed">{embedError}</p>
              <p className="text-slate-600 text-[11px] pt-1">
                Tip for Faculty: Use an educational lecture or tutorial video with <strong>"Allow embedding"</strong> enabled in YouTube Studio, or standard courses (e.g., NPTEL, FreeCodeCamp, university lectures).
              </p>
            </div>
          </div>
          <div className="pt-1 flex items-center gap-2">
            <a
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Watch on YouTube</span>
            </a>
          </div>
        </div>
      )}
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
  const [isCourseCompletedModal, setIsCourseCompletedModal] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(null);
  const [testStartTime, setTestStartTime] = useState(null);

  // Clear countdown timer when modal closes
  useEffect(() => {
    let timer = null;
    if (showCertificateModal && isCourseCompletedModal && redirectCountdown !== null && redirectCountdown > 0) {
      timer = setTimeout(() => {
        setRedirectCountdown((prev) => (prev > 1 ? prev - 1 : 0));
      }, 1000);
    } else if (showCertificateModal && isCourseCompletedModal && redirectCountdown === 0) {
      setShowCertificateModal(false);
      navigate("/certificates");
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showCertificateModal, isCourseCompletedModal, redirectCountdown, navigate]);

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
          const isVidMandatory = Boolean(activeMod.hasVideo && activeMod.isVideoMandatory);
          setVideoRequirementMet(isCourseDone || !isVidMandatory || Boolean(progRes.videoRequirementMet));
          setTestUnlocked(isCourseDone || !isVidMandatory || Boolean(progRes.testUnlocked));
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
          const isVidMandatory = Boolean(activeMod.hasVideo && activeMod.isVideoMandatory);
          setWatchPercentage(isCourseDone ? 100 : 0);
          setUniqueWatchedSeconds(0);
          setVideoRequirementMet(isCourseDone || !isVidMandatory);
          setTestUnlocked(isCourseDone || !isVidMandatory);
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
          particleCount: 160,
          spread: 80,
          origin: { y: 0.5 },
        });

        // Check if completing this module finishes the entire course
        const otherModulesCompleted = allModulesMap
          .filter((m) => String(m._id) !== String(currentModule._id))
          .every((m) => m.completed || m.testPassed);
        const isCourseNowDone = otherModulesCompleted || Boolean(result.courseCertificate);

        if (isCourseNowDone) {
          setIsCourseCompletedModal(true);
          setRedirectCountdown(4);
          setCertificate(
            result.courseCertificate ||
            result.certificate || {
              studentName: user?.name,
              registerNumber: user?.registerNumber,
              courseName: course?.title,
              score: result.scorePercentage,
              certificateNumber: `VCET-CERT-${String(course?._id || "2026").slice(-6).toUpperCase()}`,
              grade: result.scorePercentage >= 85 ? "Distinction" : "First Class",
            }
          );
          setShowCertificateModal(true);
          showSuccess(`🏆 Course Completed! Automatically redirecting to your certificate in 4s...`);
        } else {
          setIsCourseCompletedModal(false);
          setRedirectCountdown(null);
          if (result.certificate) {
            setCertificate(result.certificate);
            setShowCertificateModal(true);
          }
          showSuccess(`Congratulations! Module passed with ${result.scorePercentage}%.`);
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
      <div className="min-h-screen bg-white text-vcet-dark flex flex-col items-center justify-center p-6">
        <div className="w-10 h-10 border-3 border-vcet-blue border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-vcet-dark">Loading course lesson...</p>
      </div>
    );
  }

  // If student attempted to access a locked module directly
  if (isModuleLocked) {
    return (
      <div className="min-h-screen bg-white text-vcet-dark flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-vcet-gray-border rounded-2xl p-8 text-center space-y-5 shadow-sm">
          <div className="w-14 h-14 bg-vcet-blue/10 text-vcet-blue rounded-2xl flex items-center justify-center mx-auto border border-vcet-blue/20">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-vcet-dark mb-2">Module Locked</h2>
            <p className="text-sm text-vcet-dark leading-relaxed">
              Please complete the previous modules in this course to unlock this lesson and its assessment.
            </p>
          </div>
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="w-full py-2.5 px-5 rounded-xl bg-vcet-blue hover:bg-[#00518c] text-white font-semibold text-sm transition cursor-pointer"
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
    <div className="min-h-screen bg-white text-vcet-dark flex flex-col font-sans">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-40 bg-white border-b border-vcet-gray-border px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to={`/courses/${courseId}`}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-vcet-dark transition border border-vcet-gray-border"
            title="Back to Course"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-vcet-blue/10 text-vcet-blue border border-vcet-blue/20">
                Module {currentModNumber} of {allModulesMap.length || 1}
              </span>
              <span className="text-xs text-vcet-dark font-medium truncate max-w-[200px] sm:max-w-sm">
                {course?.title}
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-vcet-dark tracking-tight truncate max-w-[260px] sm:max-w-md">
              {currentModule?.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Simple Word Progress Badge */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-vcet-dark font-semibold">Progress:</span>
            {testResult?.passed ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-vcet-blue/10 text-vcet-blue border border-vcet-blue/20">
                Completed
              </span>
            ) : videoRequirementMet || testUnlocked ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-vcet-blue/10 text-vcet-blue border border-vcet-blue/20">
                Assessment Ready
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-vcet-dark border border-vcet-gray-border">
                In Progress
              </span>
            )}
          </div>

          {/* Mobile Syllabus Drawer Trigger */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-xl bg-white text-vcet-dark border border-vcet-gray-border"
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
          <div className="flex items-center gap-3 border-b border-vcet-gray-border pb-4">
            <button
              onClick={() => setActiveTab("video")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === "video"
                  ? "bg-vcet-blue text-white shadow-sm"
                  : "bg-white text-vcet-dark hover:bg-slate-50 border border-vcet-gray-border"
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
                  ? "bg-vcet-blue text-white shadow-sm"
                  : testUnlocked || videoRequirementMet
                  ? "bg-white text-vcet-blue hover:bg-slate-50 border border-vcet-blue/30"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed border border-vcet-gray-border"
              }`}
            >
              {testUnlocked || videoRequirementMet ? (
                <CheckCircle2 className="w-4 h-4 text-vcet-blue" />
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
              <div className="bg-white border border-vcet-gray-border rounded-2xl p-6 space-y-4">
                <h3 className="text-base sm:text-lg font-bold text-vcet-dark flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-vcet-blue" />
                  <span>Module Overview</span>
                </h3>
                <p className="text-vcet-dark text-sm leading-relaxed">
                  {currentModule?.description || "Master the concepts in this module and complete the video lesson to unlock the knowledge assessment test."}
                </p>

                {/* Call-to-action banner when unlocked */}
                {testUnlocked || videoRequirementMet ? (
                  <div className="p-4 rounded-xl bg-white border border-vcet-blue/30 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-vcet-blue/10 text-vcet-blue">
                        <CheckCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-vcet-dark">Video Lesson Completed</h4>
                        <p className="text-xs text-vcet-dark">Complete the knowledge assessment test to earn your certificate and proceed.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab("test");
                        if (!testStartTime) setTestStartTime(Date.now());
                      }}
                      className="px-5 py-2.5 rounded-xl bg-vcet-blue hover:bg-[#00518c] text-white font-bold text-xs transition cursor-pointer flex items-center gap-2"
                    >
                      <span>Start Assessment</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-white border border-vcet-gray-border flex items-center gap-2.5 text-vcet-dark text-xs">
                    <Lock className="w-4 h-4 text-vcet-blue shrink-0" />
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
                <div className="bg-white border border-vcet-gray-border rounded-2xl p-10 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-vcet-blue/10 text-vcet-blue border border-vcet-blue/20 flex items-center justify-center mx-auto">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-vcet-dark">Knowledge Assessment is Locked</h3>
                  <p className="text-sm text-vcet-dark max-w-md mx-auto">
                    Please finish watching the tutorial video lesson to unlock this assessment test.
                  </p>
                  <button
                    onClick={() => setActiveTab("video")}
                    className="px-6 py-2.5 rounded-xl bg-vcet-blue hover:bg-[#00518c] text-white font-bold text-xs transition cursor-pointer"
                  >
                    Resume Tutorial Video
                  </button>
                </div>
              ) : testResult ? (
                /* Assessment Result Review Panel */
                <div className="space-y-6">
                  <div className="p-6 sm:p-8 rounded-2xl border border-vcet-gray-border bg-white text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto border border-vcet-blue/20 bg-vcet-blue/10 text-vcet-blue">
                      <Award className="w-7 h-7" />
                    </div>

                    <div>
                      <span className="text-xs uppercase font-bold tracking-wider text-vcet-dark">
                        Assessment Result
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-bold text-vcet-dark mt-1">
                        Score: {testResult.scorePercentage}%
                      </h2>
                      <p className="text-sm text-vcet-dark mt-2">
                        {testResult.passed
                          ? `Passed! Appreciation Certificate is issued.`
                          : `Score did not meet the 50% passing threshold. Please review and try again.`}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      {testResult.passed && certificate && (
                        <button
                          onClick={() => setShowCertificateModal(true)}
                          className="px-5 py-2.5 rounded-xl bg-vcet-blue hover:bg-[#00518c] text-white font-bold text-xs transition cursor-pointer flex items-center gap-2"
                        >
                          <Award className="w-4 h-4" />
                          <span>View Appreciation Certificate</span>
                        </button>
                      )}

                      {testResult.passed && nextModule && (
                        <button
                          onClick={() => navigate(`/courses/${courseId}/module/${nextModule._id || nextModule.moduleNumber}`)}
                          className="px-5 py-2.5 rounded-xl bg-vcet-blue hover:bg-[#00518c] text-white font-bold text-xs transition cursor-pointer flex items-center gap-2"
                        >
                          <span>Proceed to Module {nextModule.moduleNumber}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={handleRetryTest}
                        className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-vcet-dark font-semibold text-xs transition border border-vcet-gray-border flex items-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Retake Assessment</span>
                      </button>
                    </div>
                  </div>

                  {/* Question Review Breakdown */}
                  {testResult.questions && testResult.questions.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-vcet-dark">Answer Status Review</h4>
                      {testResult.questions.map((q, qIdx) => (
                        <div
                          key={qIdx}
                          className="p-5 rounded-2xl border border-vcet-gray-border bg-white text-left space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-sm font-bold text-vcet-dark">
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
                            {q.options?.map((opt, optIdx) => {
                              const isSelected = Number(q.selectedAnswer) === optIdx;
                              return (
                                <div
                                  key={optIdx}
                                  className={`p-2.5 rounded-xl border ${
                                    isSelected
                                      ? q.isCorrect
                                        ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold"
                                        : "bg-red-50 border-red-300 text-red-800 font-semibold"
                                      : "bg-white border-vcet-gray-border text-vcet-dark"
                                  }`}
                                >
                                  {opt} {isSelected && (q.isCorrect ? " (Your Answer - Correct)" : " (Your Answer - Incorrect)")}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Assessment Questions Form */
                <div className="space-y-6">
                  <div className="bg-white border border-vcet-gray-border rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-vcet-dark">
                        Module {currentModNumber} Knowledge Assessment
                      </h3>
                      <p className="text-xs text-vcet-dark">
                        {currentModule?.mcqs?.length || 0} Questions • Minimum 50% score required to pass and unlock Module {currentModNumber + 1}.
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-slate-100 text-vcet-dark border border-vcet-gray-border">
                      Answered: {Object.keys(testAnswers).length} / {currentModule?.mcqs?.length || 0}
                    </span>
                  </div>

                  {/* Questions List */}
                  <div className="space-y-6">
                    {currentModule?.mcqs?.map((q, qIdx) => (
                      <div key={qIdx} className="bg-white border border-vcet-gray-border rounded-2xl p-6 space-y-4">
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-7 h-7 rounded-xl bg-vcet-blue/10 text-vcet-blue font-bold text-xs flex items-center justify-center border border-vcet-blue/20">
                            {qIdx + 1}
                          </span>
                          <h4 className="text-sm sm:text-base font-bold text-vcet-dark leading-snug">
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
                                    ? "bg-vcet-blue text-white border-vcet-blue font-semibold"
                                    : "bg-white hover:bg-slate-50 text-vcet-dark border-vcet-gray-border"
                                }`}
                              >
                                <span>{opt}</span>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                  isSelected ? "border-white bg-white text-vcet-blue" : "border-vcet-gray-border"
                                }`}>
                                  {isSelected && <div className="w-2 h-2 rounded-full bg-vcet-blue" />}
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
                      className="px-8 py-3 rounded-xl bg-vcet-blue hover:bg-[#00518c] text-white font-bold text-sm transition cursor-pointer shadow-sm disabled:opacity-50 flex items-center gap-2"
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
          className={`fixed lg:static inset-y-0 right-0 z-50 w-80 bg-white border-l border-vcet-gray-border p-6 flex flex-col space-y-6 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0 shadow-2xl" : "translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-vcet-dark">Course Syllabus</h3>
              <p className="text-xs text-vcet-dark">Sequential Progression</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg bg-white text-vcet-dark border border-vcet-gray-border"
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
                      ? "bg-blue-50/50 border-vcet-blue shadow-sm"
                      : isPassed
                      ? "bg-white border-vcet-gray-border hover:border-vcet-blue"
                      : isUnlocked
                      ? "bg-white border-vcet-gray-border hover:border-vcet-blue"
                      : "bg-slate-50 border-vcet-gray-border opacity-60 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-vcet-dark font-mono">
                      Module {mNum}
                    </span>
                    {isPassed ? (
                      <span className="px-2 py-0.5 rounded-md bg-vcet-blue/10 text-vcet-blue text-[10px] font-bold flex items-center gap-1 border border-vcet-blue/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed
                      </span>
                    ) : isUnlocked ? (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-vcet-dark text-[10px] font-bold flex items-center gap-1 border border-vcet-gray-border">
                        <PlayCircle className="w-3 h-3" />
                        Available
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-vcet-dark text-[10px] font-bold flex items-center gap-1 border border-vcet-gray-border">
                        <Lock className="w-3 h-3" />
                        Locked
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-vcet-dark line-clamp-1">
                    {m.title}
                  </h4>
                </div>
              );
            })}
          </div>
        </aside>
      </div>

      {/* 3. Certificate & Course Completion Celebration Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full bg-[#FFFFFF] border border-vcet-line rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative text-center">
            <button
              onClick={() => {
                setShowCertificateModal(false);
                setRedirectCountdown(null);
              }}
              className="absolute top-5 right-5 p-2 rounded-xl bg-[#FFFFFF] hover:bg-vcet-surface text-vcet-dark transition border border-vcet-line cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {isCourseCompletedModal ? (
              /* COURSE COMPLETED FULL CELEBRATION */
              <>
                <div className="w-20 h-20 rounded-3xl bg-vcet-blue/10 text-vcet-blue border border-vcet-blue/30 flex items-center justify-center mx-auto shadow-inner">
                  <Award className="w-10 h-10 text-vcet-blue" />
                </div>

                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/30 text-xs font-bold uppercase tracking-wider mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span>Course Fully Completed • 100% Mastery</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-vcet-dark">
                    Congratulations! 🏆
                  </h2>
                  <p className="text-xs sm:text-sm text-vcet-dark font-medium max-w-lg mx-auto">
                    You have successfully completed all modules in <strong className="text-vcet-blue">{course?.title}</strong>. Your official verified institutional certificate has been issued!
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-vcet-surface border border-vcet-line text-left text-xs space-y-3 font-mono">
                  <div className="flex justify-between border-b border-vcet-line pb-2">
                    <span className="text-vcet-dark">Student Name:</span>
                    <span className="text-vcet-dark font-bold">{certificate?.studentName || user?.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-vcet-line pb-2">
                    <span className="text-vcet-dark">Register Number:</span>
                    <span className="text-vcet-dark font-bold">{certificate?.registerNumber || user?.registerNumber}</span>
                  </div>
                  <div className="flex justify-between border-b border-vcet-line pb-2">
                    <span className="text-vcet-dark">Course Title:</span>
                    <span className="text-vcet-dark font-bold">{course?.title}</span>
                  </div>
                  <div className="flex justify-between border-b border-vcet-line pb-2">
                    <span className="text-vcet-dark">Credential Type:</span>
                    <span className="text-[#16A34A] font-bold">Official Course Completion Certificate</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-vcet-dark">Status:</span>
                    <span className="text-vcet-blue font-bold">Verified & Authenticated (VCET)</span>
                  </div>
                </div>

                {redirectCountdown !== null && redirectCountdown > 0 && (
                  <p className="text-xs font-semibold text-[#0077C8] animate-pulse">
                    ⏱️ Automatically opening your certificate portfolio in {redirectCountdown}s...
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowCertificateModal(false);
                      setRedirectCountdown(null);
                      navigate("/certificates");
                    }}
                    className="px-6 py-3.5 rounded-xl bg-vcet-blue hover:bg-[#0077C8] text-[#FFFFFF] font-extrabold text-xs tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <span>View Certificate in My Portfolio</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDownloadCertificate(certificate)}
                    className="px-6 py-3.5 rounded-xl bg-[#FFFFFF] hover:bg-vcet-surface text-vcet-blue border border-vcet-blue font-bold text-xs transition cursor-pointer flex items-center gap-2"
                  >
                    <Download className="w-4 h-4 text-vcet-blue" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </>
            ) : (
              /* MODULE LEVEL APPRECIATION */
              <>
                <div className="w-16 h-16 rounded-2xl bg-vcet-blue/10 text-vcet-blue border border-vcet-blue/20 flex items-center justify-center mx-auto">
                  <Award className="w-8 h-8" />
                </div>

                <div>
                  <span className="text-xs uppercase font-bold tracking-widest text-vcet-blue">
                    Module Milestone Reached
                  </span>
                  <h2 className="text-2xl font-bold text-vcet-dark mt-1">
                    Module {currentModNumber} Completed!
                  </h2>
                  <p className="text-xs text-vcet-dark mt-1">
                    Velalar College of Engineering and Technology (Autonomous)
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-vcet-surface border border-vcet-line text-left text-xs space-y-3 font-mono">
                  <div className="flex justify-between border-b border-vcet-line pb-2">
                    <span className="text-vcet-dark">Student Name:</span>
                    <span className="text-vcet-dark font-bold">{certificate?.studentName || user?.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-vcet-line pb-2">
                    <span className="text-vcet-dark">Register Number:</span>
                    <span className="text-vcet-dark font-bold">{certificate?.registerNumber || user?.registerNumber}</span>
                  </div>
                  <div className="flex justify-between border-b border-vcet-line pb-2">
                    <span className="text-vcet-dark">Module Completed:</span>
                    <span className="text-vcet-dark font-bold">{currentModule?.title}</span>
                  </div>
                  <div className="flex justify-between border-b border-vcet-line pb-2">
                    <span className="text-vcet-dark">Assessment Score:</span>
                    <span className="text-vcet-blue font-bold">{certificate?.score || testResult?.scorePercentage}% ({certificate?.grade || "Distinction"})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-vcet-dark">Certificate ID:</span>
                    <span className="text-vcet-blue font-bold">{certificate?.certificateNumber}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => handleDownloadCertificate(certificate)}
                    className="px-6 py-3 rounded-xl bg-vcet-blue hover:bg-[#0077C8] text-[#FFFFFF] font-bold text-xs transition cursor-pointer flex items-center gap-2"
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
                      className="px-6 py-3 rounded-xl bg-[#FFFFFF] hover:bg-vcet-surface text-vcet-dark border border-vcet-line font-bold text-xs transition cursor-pointer flex items-center gap-2"
                    >
                      <span>Proceed to Module {nextModule.moduleNumber}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
