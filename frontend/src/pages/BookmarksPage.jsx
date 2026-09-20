import React from "react";
import { Link } from "react-router-dom";
import { Bookmark, Trash2, ArrowRight, BookOpen, FileText, Code2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function BookmarksPage() {
  const { bookmarks, toggleBookmark } = useAuth();
  const { showSuccess } = useToast();

  const handleRemove = (item) => {
    toggleBookmark(item);
    showSuccess("Bookmark removed");
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0062A8] text-xs font-bold shadow-xs mb-2">
          <Bookmark className="w-3.5 h-3.5" />
          <span>My Personal Library</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Saved Resources & Courses
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Quickly access your bookmarked lecture notes, course modules, and placement coding problems.
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-400 space-y-3">
          <Bookmark className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
          <h3 className="text-base font-bold text-slate-700">No bookmarks saved yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click the bookmark icon on any course or academic note to save it here for offline reference.
          </p>
          <div className="pt-2">
            <Link
              to="/courses"
              className="inline-block px-5 py-2.5 bg-[#0062A8] hover:bg-[#0B4A8F] text-white font-bold text-xs rounded-xl shadow"
            >
              Explore Courses
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookmarks.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-[#0062A8]/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-[#0062A8]">
                    {b.type || "Course"}
                  </span>
                  <button
                    onClick={() => handleRemove(b)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    title="Remove Bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">{b.title}</h3>
              </div>

              <Link
                to={b.url || `/courses/${b.id}`}
                className="w-full py-2 bg-slate-100 hover:bg-[#0062A8] hover:text-white text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Open Resource</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
