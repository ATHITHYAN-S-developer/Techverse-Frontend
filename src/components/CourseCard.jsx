import React from "react";
import { Clock, BookOpen, Award, Star, ArrowRight, Bookmark, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCourseImageUrl } from "../services/courseService";

export default function CourseCard({ course }) {
  const navigate = useNavigate();
  const { isBookmarked, toggleBookmark } = useAuth();
  const courseId = course.slug || course.id || course._id;
  const bookmarked = isBookmarked(courseId);
  const coverImage = getCourseImageUrl(course.thumbnailUrl, course.thumbnail);
  const courseUrl = `/courses/${courseId}`;

  const rawDesc = course.courseDescription || course.description || "";
  const descPreview = rawDesc
    .replace(/^Line \d+:?\s*/gm, "")
    .replace(/(🚀 Core Fundamentals:|💻 Practical Applications:|🎓 Career Outcome:|🐍 Python Foundations:|💡 Problem Solving:|📜 Verified Skill:|🌐 Frontend Excellence:|⚡ Backend & Database:|🛡️ Full-Stack Project:|☁️ Cloud Essentials:|🐳 DevOps Tools:|🔒 Enterprise Deployment:|💻 Practical Hands-On:|🎓 Skill Outcome:)\s*/gi, "")
    .trim();

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-[#0B4A8F]/30 transition-all duration-300 flex flex-col justify-between cursor-pointer">
      {/* Thumbnail Area */}
      <Link to={courseUrl} className="relative aspect-video w-full overflow-hidden bg-slate-100 block">
        <img
          src={coverImage}
          alt={course.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-80" />
        
        {/* Category Badge */}
        <span className="absolute top-3 left-3 px-2.5 py-1 text-[11px] font-bold bg-white/90 backdrop-blur-md text-[#0B4A8F] rounded-full shadow-xs">
          {course.category}
        </span>

        {/* Bookmark Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleBookmark({ id: courseId, title: course.title, type: "Course", url: courseUrl });
          }}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/60 backdrop-blur-md text-white hover:text-amber-400 transition-colors z-10 cursor-pointer"
          aria-label="Bookmark course"
        >
          <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-amber-400 text-amber-400" : ""}`} />
        </button>

        {/* Rating & Modules */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs font-medium">
          <span className="flex items-center gap-1 bg-slate-900/40 px-2 py-0.5 rounded backdrop-blur-xs">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {course.rating || 4.9}
          </span>
          <span className="bg-slate-900/40 px-2 py-0.5 rounded backdrop-blur-xs">
            {course.totalModules || course.modulesCount || course.modules?.length || 0} Modules
          </span>
        </div>
      </Link>

      {/* Course Info */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <Link to={courseUrl} className="block">
            <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0B4A8F] transition-colors leading-snug">
              {course.title}
            </h3>
          </Link>

          {/* Course Description (3-Line Glimpse Box) */}
          <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-blue-50/40 group-hover:border-blue-100 transition-colors">
            <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#0B4A8F] uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3 text-[#0B4A8F]" />
              <span>Course Description</span>
            </div>
            <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-normal">
              {descPreview}
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100">
          {/* Progress Bar (if available) */}
          {course.progress !== undefined && course.progress > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                <span>Progress</span>
                <span className="text-[#0B4A8F]">{course.progress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#0B4A8F] h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> {course.duration}
            </span>
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-emerald-600" /> Certificate
            </span>
          </div>

          <Link
            to={courseUrl}
            className="w-full py-2.5 px-4 bg-slate-100 group-hover:bg-[#0B4A8F] group-hover:text-white text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer"
          >
            {course.progress > 0 ? "Continue Learning" : "View Course Modules"}
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
