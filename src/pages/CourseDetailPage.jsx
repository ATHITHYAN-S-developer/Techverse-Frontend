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
  ArrowLeft
} from "lucide-react";
import { courseService } from "../services/courseService";
import { useAuth } from "../context/AuthContext";

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await courseService.getCourseById(courseId);
        setCourse(data);
      } catch (err) {
        console.error(err);
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

  const firstIncompleteModule = course.modules?.find((m) => !m.completed) || course.modules?.[0];

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate("/courses")}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0062A8] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Courses Catalog
      </button>

      {/* Course Hero Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
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

          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            {course.description}
          </p>

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
              <span className="text-[#0062A8]">{course.progress || 0}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden mb-4">
              <div
                className="bg-[#0062A8] h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${course.progress || 0}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Pass benchmark: {course.passingPercentage || 75}% on module assessments to unlock certificate.
            </p>
          </div>

          {firstIncompleteModule ? (
            <Link
              to={`/courses/${course.id}/module/${firstIncompleteModule.id}`}
              className="w-full py-3 bg-[#0B4A8F] hover:bg-[#0062A8] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <span>{course.progress > 0 ? "Continue Learning" : "Start First Module"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <div className="w-full py-2.5 bg-slate-200 text-slate-500 font-semibold text-xs rounded-xl text-center">
              Modules Coming Soon
            </div>
          )}
        </div>
      </div>

      {/* Modules Syllabus List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
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
                    to={`/courses/${course.id}/module/${mod.id || mod._id}`}
                    className="px-3.5 py-1.5 bg-slate-100 group-hover:bg-[#0062A8] group-hover:text-white text-slate-700 font-semibold text-xs rounded-lg transition-colors"
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
