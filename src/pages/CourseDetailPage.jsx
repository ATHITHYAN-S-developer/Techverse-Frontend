import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Clock,
  Award,
  CheckCircle2,
  Lock,
  PlayCircle,
  ArrowRight,
  Users,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Info,
  Video,
  Code2,
  HelpCircle,
  Layers,
  Settings,
  Edit,
} from "lucide-react";
import { courseService } from "../services/courseService";
import { courseAssessmentService } from "../services/courseAssessmentService";
import { useAuth } from "../context/AuthContext";


export default function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isFacultyOrAdmin = user && (user.role === "faculty" || user.role === "teacher" || user.role === "admin");
  const moduleManagerLink = user?.role === "admin" ? "/admin/modules" : "/faculty/modules";
  const courseManagerLink = user?.role === "admin" ? "/admin/courses" : "/faculty/courses";

  const [course, setCourse] = useState(null);
  const [courseTest, setCourseTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorInfo, setErrorInfo] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await courseService.getCourseById(courseId);
        setCourse(data);

        const assessment = await courseAssessmentService.getCourseAssessmentForCourse(data.slug || courseId);
        setCourseTest(assessment);
      } catch (err) {
        console.error("Error loading course details:", err);
        const status = err?.response?.status;
        const msg = err?.response?.data?.message || err?.message;
        const code = err?.response?.data?.code;
        setErrorInfo({ status, message: msg, code });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-vcet-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (errorInfo?.code === "DEPARTMENT_RESTRICTED" || errorInfo?.status === 403) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-5">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shadow-sm">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-800">Department Restricted Course</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            {errorInfo.message || "This course is exclusively reserved for students of its designated department. It is not accessible to other departments."}
          </p>
        </div>
        <div>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-vcet-blue text-white rounded-xl text-xs font-bold hover:bg-[#004f88] transition shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Browse Available Courses
          </Link>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Course Not Found</h2>
        <p className="text-xs text-slate-500">The requested course could not be located in the catalog.</p>
        <Link to="/courses" className="inline-block px-4 py-2 bg-vcet-blue text-white rounded-xl text-xs font-bold cursor-pointer">
          Back to Courses
        </Link>
      </div>
    );
  }

  // Dynamic accurate percentage calculation based on completed modules/videos vs total modules
  const completedCount = course.modules?.filter((m) => m.completed).length || 0;
  const totalMods = course.modules?.length || 0;
  const calculatedProgress = totalMods > 0 ? Math.round((completedCount / totalMods) * 100) : 0;
  const userProgress = Math.max(calculatedProgress, course.enrollment?.progressPercentage ?? 0, course.progress ?? 0);
  const hasStarted = completedCount > 0 || userProgress > 0;
  const isNewToCourse = !hasStarted;

  // Process course description as a clean paragraph
  const rawDesc = course.courseDescription || course.description || "";
  const cleanDescParagraph = rawDesc
    .replace(/^Line \d+:?\s*/gm, "")
    .replace(/(🚀 Core Fundamentals:|💻 Practical Applications:|🎓 Career Outcome:|🐍 Python Foundations:|💡 Problem Solving:|📜 Verified Skill:|🌐 Frontend Excellence:|⚡ Backend & Database:|🛡️ Full-Stack Project:|☁️ Cloud Essentials:|🐳 DevOps Tools:|🔒 Enterprise Deployment:|💻 Practical Hands-On:|🎓 Skill Outcome:)\s*/gi, "")
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" ");

  const firstIncompleteModule = course.modules?.find((m) => !m.completed) || course.modules?.[0];
  const courseSlug = course.id || course.slug || course._id;

  return (
    <div className="w-full max-w-[1600px] mx-auto py-3 sm:py-5 px-2 sm:px-4 lg:px-6 space-y-5 select-none">
      {/* Back button */}
      <button
        onClick={() => navigate("/courses")}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-vcet-blue transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Courses Catalog
      </button>

      {/* Faculty / Educator Management Bar */}
      {isFacultyOrAdmin && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-vcet-blue text-white">
              <Settings className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Course Management Studio</h4>
              <p className="text-[11px] text-slate-500">
                You have educator permissions to modify this course and author its curriculum modules.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`${moduleManagerLink}?courseId=${course._id || course.id}`}
              className="px-3.5 py-1.5 bg-vcet-blue hover:bg-vcet-blue-deep text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Manage Modules ({totalMods})</span>
            </Link>
            <Link
              to={courseManagerLink}
              className="px-3.5 py-1.5 bg-white border border-slate-300 hover:border-vcet-blue text-slate-800 hover:text-vcet-blue text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer"
            >
              Edit Course Info
            </Link>
          </div>
        </div>
      )}

      {/* =========================================================================
          NEW STUDENT WELCOME BOX (Bright Ice-Blue Theme)
          ========================================================================= */}
      {isNewToCourse && (
        <div className="bg-gradient-to-r from-sky-100 via-blue-50 to-indigo-100/80 text-slate-900 rounded-3xl p-5 sm:p-7 shadow-sm border border-sky-200/90 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/40 skew-x-12 pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-sky-300 text-[11px] font-bold tracking-wide text-vcet-blue uppercase shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-vcet-blue" />
                <span>Welcome New Student</span>
              </div>
              <span className="text-xs text-slate-600 font-medium">
                Student: <span className="font-bold text-slate-900">{user?.name || user?.username || "Student"}</span>
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                Welcome to {course.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                You are currently new to this course. Review the course overview below before starting your lessons.
              </p>
            </div>

            {/* Clean Paragraph Box */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-sky-200/80 shadow-2xs">
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                {cleanDescParagraph}
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                <Info className="w-4 h-4 text-vcet-blue" />
                <span>Completion benchmark: {course.passingPercentage || course.passingScore || 50}% assessment score for verified certificate.</span>
              </div>
              {firstIncompleteModule && (
                <Link
                  to={`/courses/${courseSlug}/module/${firstIncompleteModule.id || firstIncompleteModule._id}`}
                  className="px-6 py-3 bg-vcet-blue hover:bg-vcet-blue-deep text-white font-extrabold text-xs rounded-xl shadow-md inline-flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Start Course Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Course Hero Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 text-xs font-bold bg-blue-50 text-vcet-blue rounded-full border border-blue-200">
              {course.category}
            </span>
            <span className="text-xs font-semibold text-slate-500">{course.level || "Beginner to Intermediate"}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
            {course.title}
          </h1>

          <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-vcet-blue" />
              <span>{course.duration || "30 Days"}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-vcet-blue" />
              <span>{course.modules?.length || course.totalModules || 0} Modules</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Verified Certificate Included</span>
            </div>
          </div>
        </div>

        {/* Action / Progress Box */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
              <span>Overall Progress</span>
              <span className="text-vcet-blue">{userProgress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden mb-4">
              <div
                className="bg-vcet-blue h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${userProgress}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Pass benchmark: {course.passingPercentage || course.passingScore || 50}% on module assessments to unlock certificate.
            </p>
          </div>

          {userProgress >= 100 ? (
            <Link
              to="/certificates"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>🏆 Course Completed • View Certificate</span>
            </Link>
          ) : firstIncompleteModule ? (
            <Link
              to={`/courses/${courseSlug}/module/${firstIncompleteModule.id || firstIncompleteModule._id}`}
              className="w-full py-3 bg-vcet-blue hover:bg-vcet-blue-deep text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>{hasStarted ? "Continue Learning" : "Start First Module"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <div className="w-full py-2.5 bg-slate-200 text-slate-500 font-semibold text-xs rounded-xl text-center">
              Modules Coming Soon
            </div>
          )}
        </div>
      </div>

      {/* COURSE DESCRIPTION */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 text-vcet-blue">
            <BookOpen className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Course Description</h2>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
          <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
            {cleanDescParagraph}
          </p>
        </div>
      </div>

      {/* Modules Syllabus List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-vcet-blue" /> Course Curriculum & Modules ({totalMods})
          </h2>
          {isFacultyOrAdmin && (
            <Link
              to={`${moduleManagerLink}?courseId=${course._id || course.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-vcet-blue hover:bg-blue-100 font-bold text-xs transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Add / Edit Modules</span>
            </Link>
          )}
        </div>

        {course.modules && course.modules.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {course.modules.map((mod, idx) => {
              const isPassed = mod.completed || Boolean(mod.testPassed);
              const isCourseCompleted = userProgress >= 100 || Boolean(course.isCourseCompleted) || (totalMods > 0 && completedCount >= totalMods);
              const isUnlocked = isCourseCompleted || isFacultyOrAdmin || (mod.isUnlocked !== undefined ? mod.isUnlocked : (idx === 0 || isPassed));

              const videoCount = mod.videos?.length || (mod.videoUrl ? 1 : 1);
              const codingCount = mod.codingProblems?.length || (mod.hasCoding ? 1 : 0);
              const mcqCount = mod.mcqs?.length || (mod.hasMCQ ? 5 : 0);

              return (
                <div
                  key={mod.id || mod._id || idx}
                  className={`py-4 first:pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                    !isUnlocked ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`mt-0.5 p-2 rounded-xl ${
                      isPassed
                        ? "bg-emerald-100 text-emerald-700"
                        : isUnlocked
                        ? "bg-blue-50 text-vcet-blue"
                        : "bg-slate-100 text-slate-400"
                    }`}>
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : isUnlocked ? (
                        <PlayCircle className="w-4 h-4" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold font-mono text-slate-400 uppercase">
                          Module {mod.moduleNumber || idx + 1}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-vcet-blue transition-colors">
                          {mod.title}
                        </h3>
                        {isPassed ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Completed ✓
                          </span>
                        ) : isUnlocked ? (
                          <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                            Available 🔓
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            Locked 🔒
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{mod.summary || mod.description || "Interactive video lesson and practical assessment."}</p>

                      {/* Content Badges */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-vcet-blue border border-blue-200/60 flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          <span>{videoCount} Video{videoCount > 1 ? "s" : ""}</span>
                        </span>

                        {(mod.hasCoding || codingCount > 0) && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200/60 flex items-center gap-1">
                            <Code2 className="w-3 h-3" />
                            <span>{codingCount > 0 ? `${codingCount} Coding Challenge${codingCount > 1 ? "s" : ""}` : "Coding Arena"}</span>
                          </span>
                        )}

                        {(mod.hasMCQ || mcqCount > 0) && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
                            <HelpCircle className="w-3 h-3" />
                            <span>{mcqCount > 0 ? `${mcqCount} MCQ Test` : "Knowledge Quiz"}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    {isUnlocked ? (
                      <Link
                        to={`/courses/${courseSlug}/module/${mod.id || mod._id}`}
                        className={`px-3.5 py-1.5 font-semibold text-xs rounded-lg transition-colors cursor-pointer ${
                          isPassed
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200"
                            : "bg-slate-100 group-hover:bg-vcet-blue group-hover:text-white text-slate-700"
                        }`}
                      >
                        {isPassed ? "Review Module" : "Open Lesson"}
                      </Link>
                    ) : (
                      <span className="px-3.5 py-1.5 bg-slate-100 text-slate-400 font-semibold text-xs rounded-lg flex items-center gap-1 cursor-not-allowed">
                        <Lock className="w-3 h-3" />
                        Locked
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-10 text-center space-y-3 border border-dashed border-slate-200 rounded-2xl">
            <p className="text-sm font-semibold text-slate-600">No modules available yet</p>
            <p className="text-xs text-slate-400">Curriculum modules published by faculty or administrators in MongoDB will appear here.</p>
            {isFacultyOrAdmin && (
              <Link
                to={`${moduleManagerLink}?courseId=${course._id || course.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-vcet-blue text-white font-bold text-xs shadow-xs"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Add First Module</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

