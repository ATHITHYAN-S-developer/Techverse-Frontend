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
  Star,
  Users,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Info
} from "lucide-react";
import { courseService } from "../services/courseService";
import { useAuth } from "../context/AuthContext";

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await courseService.getCourseById(courseId);
        setCourse(data);
      } catch (err) {
        console.error("Error loading course details:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#0062A8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Course Not Found</h2>
        <p className="text-xs text-slate-500">The requested course could not be located in the catalog.</p>
        <Link to="/courses" className="inline-block px-4 py-2 bg-[#0062A8] text-white rounded-xl text-xs font-bold">
          Back to Courses
        </Link>
      </div>
    );
  }

  // Determine if student is new to this specific course
  const userProgress = course.enrollment?.progressPercentage ?? course.progress ?? 0;
  const hasStarted = (course.modules && course.modules.some((m) => m.completed)) || userProgress > 0;
  const isNewToCourse = !hasStarted;

  // Process 3-line course description as a clean paragraph
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
    <div className="w-full max-w-[1600px] mx-auto py-3 sm:py-5 px-2 sm:px-4 lg:px-6 space-y-5">
      {/* Back button */}
      <button
        onClick={() => navigate("/courses")}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0062A8] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Courses Catalog
      </button>

      {/* =========================================================================
          NEW STUDENT WELCOME BOX (Bright Ice-Blue Theme)
          ========================================================================= */}
      {isNewToCourse && (
        <div className="bg-gradient-to-r from-sky-100 via-blue-50 to-indigo-100/80 text-slate-900 rounded-3xl p-5 sm:p-7 shadow-sm border border-sky-200/90 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/40 skew-x-12 pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-sky-300 text-[11px] font-bold tracking-wide text-[#0062A8] uppercase shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#0062A8]" />
                <span>Welcome New Student</span>
              </div>
              <span className="text-xs text-slate-600 font-medium">
                Student ID: <span className="font-bold text-slate-900">{user?.registerNumber || user?.username || "csr004"}</span>
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

            {/* Clean 3-Line Paragraph Box */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-sky-200/80 shadow-2xs">
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                {cleanDescParagraph}
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                <Info className="w-4 h-4 text-[#0062A8]" />
                <span>Completion benchmark: {course.passingPercentage || 50}% assessment score for verified certificate.</span>
              </div>
              {firstIncompleteModule && (
                <Link
                  to={`/courses/${courseSlug}/module/${firstIncompleteModule.id || firstIncompleteModule._id}`}
                  className="px-6 py-3 bg-[#0062A8] hover:bg-[#0B4A8F] text-white font-extrabold text-xs rounded-xl shadow-md inline-flex items-center gap-2 transition-all cursor-pointer"
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
            <span className="px-3 py-1 text-xs font-bold bg-blue-50 text-[#0062A8] rounded-full border border-blue-200">
              {course.category}
            </span>
            <span className="text-xs font-semibold text-slate-500">{course.level}</span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {course.rating || 4.9}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
            {course.title}
          </h1>

          <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#0062A8]" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#0062A8]" />
              <span>{course.modules?.length || 0} Modules</span>
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
              <span className="text-[#0062A8]">{userProgress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden mb-4">
              <div
                className="bg-[#0062A8] h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${userProgress}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Pass benchmark: {course.passingPercentage || 50}% on module assessments to unlock certificate.
            </p>
          </div>

          {firstIncompleteModule ? (
            <Link
              to={`/courses/${courseSlug}/module/${firstIncompleteModule.id || firstIncompleteModule._id}`}
              className="w-full py-3 bg-[#0062A8] hover:bg-[#0B4A8F] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
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

      {/* =========================================================================
          COURSE DESCRIPTION (Clean 3-Line Paragraph for EVERY course)
          ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 text-[#0062A8]">
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
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#0062A8]" /> Course Curriculum & Modules
        </h2>

        {course.modules && course.modules.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {course.modules.map((mod, idx) => (
              <div
                key={mod.id || mod._id || idx}
                className="py-4 first:pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-3.5">
                  <div className={`mt-0.5 p-1.5 rounded-full ${
                    mod.completed
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-blue-50 text-[#0062A8]"
                  }`}>
                    {mod.completed ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <PlayCircle className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0062A8] transition-colors">
                        {mod.title}
                      </h3>
                      {mod.completed && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded">
                          Completed
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{mod.summary || mod.description}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#0B4A8F] border border-blue-200/60">
                        🎥 Video (Required)
                      </span>
                      {mod.hasCoding && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200/60">
                          💻 Coding Problem
                        </span>
                      )}
                      {mod.hasMCQ && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          📝 MCQ Quiz
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <span className="text-xs text-slate-400">{mod.duration}</span>
                  <Link
                    to={`/courses/${courseSlug}/module/${mod.id || mod._id}`}
                    className="px-3.5 py-1.5 bg-slate-100 group-hover:bg-[#0062A8] group-hover:text-white text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    {mod.completed ? "Review" : "Open Lesson"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center space-y-2 border border-dashed border-slate-200 rounded-2xl">
            <p className="text-sm font-semibold text-slate-600">No modules available yet</p>
            <p className="text-xs text-slate-400">Curriculum modules published by faculty or administrators in MongoDB will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
