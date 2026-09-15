import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Flame,
  Star,
  Award,
  BookOpen,
  ArrowRight,
  Clock,
  CheckCircle2,
  Bell,
  PlayCircle,
  FileText,
  Target,
  Sparkles,
  ChevronRight,
  Layers
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function DashboardPage() {
  const { user, streak, points, bookmarks } = useAuth();
  const [courses, setCourses] = useState([]);
  const [dailyTest, setDailyTest] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [certificatesCount, setCertificatesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      try {
        // 1. Fetch courses
        try {
          const coursesRes = await api.get("/courses");
          if (isMounted) {
            const list = Array.isArray(coursesRes) ? coursesRes : coursesRes?.courses || coursesRes?.data || [];
            setCourses(list);
          }
        } catch (e) {}

        // 2. Fetch daily test
        try {
          const testRes = await api.get("/tests");
          if (isMounted) {
            const list = Array.isArray(testRes) ? testRes : testRes?.tests || testRes?.data || [];
            if (list.length > 0) {
              setDailyTest(list[0]);
            }
          }
        } catch (e) {}

        // 3. Fetch announcements
        try {
          const annRes = await api.get("/announcements");
          if (isMounted) {
            const list = Array.isArray(annRes) ? annRes : annRes?.announcements || annRes?.data || [];
            setAnnouncements(list.slice(0, 3));
          }
        } catch (e) {}

        // 4. Fetch my certificates count
        try {
          const certRes = await api.get("/certificates/my");
          if (isMounted) {
            const list = Array.isArray(certRes) ? certRes : certRes?.data || [];
            setCertificatesCount(list.length);
          }
        } catch (e) {}
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  const greetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const activeCourses = courses.filter((c) => (c.progress || 0) > 0 && (c.progress || 0) < 100);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B4A8F] via-[#0062A8] to-sky-700 text-white p-6 sm:p-8 shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-sky-100 mb-3 border border-white/20">
              <span>{user?.department || "Department of Computer Science & Engineering"}</span>
              <span>•</span>
              <span>{user?.year || "III Year"} {user?.section ? `- Sec ${user.section}` : ""}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {greetingTime()}, {user?.name?.split(" ")[0] || "Student"} 👋
            </h1>
            <p className="text-sky-100 text-sm mt-1 max-w-xl">
              Welcome back to TechVerse. You have maintained a <span className="text-amber-300 font-bold">{streak || 1}-day learning streak</span>! Ready to conquer today's challenge?
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {dailyTest ? (
              <Link
                to={`/tests/${dailyTest._id || dailyTest.id}`}
                className="px-5 py-2.5 rounded-2xl bg-white text-[#0B4A8F] font-bold text-xs hover:bg-sky-50 shadow-md transition-all flex items-center gap-2"
              >
                <Award className="w-4 h-4 text-amber-500" />
                <span>Take Today's Test</span>
              </Link>
            ) : (
              <Link
                to="/tests"
                className="px-5 py-2.5 rounded-2xl bg-white text-[#0B4A8F] font-bold text-xs hover:bg-sky-50 shadow-md transition-all flex items-center gap-2"
              >
                <Award className="w-4 h-4 text-amber-500" />
                <span>Explore Tests</span>
              </Link>
            )}
            <Link
              to="/courses"
              className="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-semibold text-xs backdrop-blur-md border border-white/20 transition-colors"
            >
              Browse Catalog
            </Link>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase text-slate-400">Current Streak</span>
            <div className="text-2xl font-black text-slate-800 mt-0.5 flex items-center gap-1.5">
              <Flame className="w-6 h-6 text-amber-500 fill-amber-500" /> {streak || 0} Days
            </div>
          </div>
          <span className="text-[11px] font-bold px-2 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200">
            Active
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase text-slate-400">Total Points</span>
            <div className="text-2xl font-black text-slate-800 mt-0.5 flex items-center gap-1.5">
              <Star className="w-6 h-6 text-amber-400 fill-amber-400" /> {points || 0}
            </div>
          </div>
          <Link to="/leaderboard" className="text-[11px] font-bold px-2 py-1 rounded bg-blue-50 text-[#0062A8] hover:underline">
            Leaderboard
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase text-slate-400">Active Courses</span>
            <div className="text-2xl font-black text-slate-800 mt-0.5 flex items-center gap-1.5">
              <BookOpen className="w-6 h-6 text-[#0062A8]" /> {courses.length}
            </div>
          </div>
          <Link to="/courses" className="text-[11px] font-bold px-2 py-1 rounded bg-slate-100 text-slate-600 hover:text-[#0062A8]">
            Catalog
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase text-slate-400">Certificates</span>
            <div className="text-2xl font-black text-slate-800 mt-0.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" /> {certificatesCount} Earned
            </div>
          </div>
          <Link to="/certificates" className="text-[11px] font-bold px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:underline">
            View
          </Link>
        </div>
      </div>

      {/* 3. Main Grid: Continue Learning & Daily Practice Test */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Continue Learning */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-[#0062A8]" /> Enrolled Courses & Modules
            </h2>
            <Link to="/courses" className="text-xs font-semibold text-[#0062A8] hover:underline flex items-center gap-1">
              View All Courses <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {courses.length > 0 ? (
              courses.slice(0, 3).map((course) => {
                const cId = course._id || course.id;
                const progressVal = course.progress || 0;
                return (
                  <div
                    key={cId}
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-16 h-16 rounded-xl object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-[#0062A8]">
                          <BookOpen className="w-7 h-7" />
                        </div>
                      )}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#0062A8] bg-blue-50 px-2 py-0.5 rounded">
                          {course.category || "Engineering"}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 mt-1">{course.title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Instructor: {course.instructor || "VCET Faculty"}
                        </p>
                      </div>
                    </div>

                    <div className="w-full sm:w-48 shrink-0 flex flex-col items-end">
                      <div className="flex items-center justify-between w-full text-xs font-semibold text-slate-700 mb-1.5">
                        <span>{progressVal}% Completed</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-3">
                        <div
                          className="bg-[#0062A8] h-2 rounded-full transition-all"
                          style={{ width: `${progressVal}%` }}
                        />
                      </div>
                      <Link
                        to={`/courses/${cId}`}
                        className="w-full py-2 px-3 bg-[#0B4A8F] hover:bg-[#0062A8] text-white text-xs font-bold rounded-xl text-center shadow-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <span>{progressVal > 0 ? "Resume Module" : "Start Course"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-3">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                <div>
                  <h4 className="text-sm font-bold text-slate-700">No enrolled courses yet</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Explore institutional courses to start learning and earn certificates.</p>
                </div>
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B4A8F] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#0062A8] transition-colors"
                >
                  <span>Explore Course Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* PrepZone Quick Track */}
          <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-amber-500 text-white rounded-xl shadow-xs">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-950">PrepZone & Recruitment Bootcamp</h4>
                <p className="text-xs text-amber-800 mt-0.5">Practice company exam patterns, C coding patterns, and mock interviews.</p>
              </div>
            </div>
            <Link
              to="/prepzone"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
            >
              Open PrepZone
            </Link>
          </div>
        </div>

        {/* Right 1 Col: Today's Practice Test & Announcements */}
        <div className="space-y-6">
          {/* Today's Daily Test Widget */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Daily Practice Test
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                +10 Pts
              </span>
            </div>

            {dailyTest ? (
              <>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{dailyTest.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {dailyTest.description || "Daily skill assessment to sharpen your quantitative and technical skills."}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 py-2 border-y border-slate-100">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {dailyTest.durationMinutes || 15} Minutes
                  </span>
                  <span>{dailyTest.totalQuestions || dailyTest.questionsCount || 10} Questions</span>
                </div>

                <Link
                  to={`/tests/${dailyTest._id || dailyTest.id}`}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <span>Start Assessment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            ) : (
              <div className="py-4 text-center space-y-2">
                <Award className="w-8 h-8 text-amber-400 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">Daily practice challenges and test series.</p>
                <Link
                  to="/tests"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  <span>View All Tests</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Recent Circulars */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-[#0062A8]" /> Latest Circulars
              </h3>
              <Link to="/announcements" className="text-xs font-semibold text-[#0062A8] hover:underline">
                View all
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {announcements.length > 0 ? (
                announcements.map((a) => (
                  <div key={a._id || a.id} className="py-2.5 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-[#0062A8]">{a.category || "Notice"}</span>
                      <span className="text-slate-400">{a.date || a.createdAt ? new Date(a.createdAt || a.date).toLocaleDateString() : ""}</span>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-800 line-clamp-1 hover:text-[#0062A8] cursor-pointer">
                      {a.title}
                    </h4>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-3 text-center">No active circulars at this moment.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

