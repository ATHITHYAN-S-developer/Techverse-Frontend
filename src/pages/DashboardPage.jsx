import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  BookOpen,
  Award,
  Code2,
  ArrowRight,
  User,
  GraduationCap,
  Flame,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useDashboardData } from "../components/dashboard/useDashboardData";
import WelcomeHero from "../components/dashboard/WelcomeHero";
import MetricStrip from "../components/dashboard/MetricStrip";
import CourseLedger from "../components/dashboard/CourseLedger";
import CircularsWidget from "../components/dashboard/CircularsWidget";
import ProfilePage from "./ProfilePage";
import { fadeUp } from "../components/dashboard/motion";

export default function DashboardPage() {
  const { user, streak, gamificationLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { courses, announcements, certificatesCount, loading } = useDashboardData();
  const reduceMotion = useReducedMotion();

  // Tab state: "overview" | "profile"
  const [activeTab, setActiveTab] = useState(
    location.hash === "#profile" ? "profile" : "overview"
  );

  useEffect(() => {
    if (location.hash === "#profile") {
      setActiveTab("profile");
      setTimeout(() => {
        document.getElementById("profile")?.scrollIntoView({ behavior: "smooth" });
      }, 60);
    } else {
      setActiveTab("overview");
    }
  }, [location.hash]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "profile") {
      window.location.hash = "profile";
    } else {
      // Remove hash cleanly without page reload
      navigate("/dashboard", { replace: true });
    }
  };

  const enrolledCourses = courses.filter((course) => Boolean(course.enrollment));
  const activeCourses = enrolledCourses.filter(
    (course) => (course.progress || 0) < 100
  ).length;

  return (
    <div className="min-h-full bg-slate-50/60 font-body pb-16">
      {/* ========================================================
          HERO & GREETING
      ======================================================== */}
      <WelcomeHero user={user} streak={streak} />

      {/* ========================================================
          MOBILE & DESKTOP SUB-NAV VIEW SWITCHER
      ======================================================== */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
          <div className="flex items-center p-1 bg-slate-200/70 rounded-2xl border border-slate-200 self-start sm:self-auto shadow-inner">
            <button
              onClick={() => handleTabChange("overview")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "overview"
                  ? "bg-white text-blue-700 shadow-sm border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
              <span>Learning Hub</span>
            </button>

            <button
              onClick={() => handleTabChange("profile")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "profile"
                  ? "bg-white text-blue-700 shadow-sm border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
              <span>Student Profile</span>
            </button>
          </div>

          {activeTab === "overview" ? (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>VCET Academic Portal Active</span>
            </div>
          ) : (
            <button
              onClick={() => handleTabChange("overview")}
              className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 self-start sm:self-auto"
            >
              <span>← Back to Learning Hub</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================
          VIEW 1: OVERVIEW & LEARNING HUB
      ======================================================== */}
      {activeTab === "overview" && (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Key Metrics Strip (3 Modern Cards) */}
          <MetricStrip
            streak={streak}
            activeCourses={activeCourses}
            certificatesCount={certificatesCount}
            loading={loading}
            gamificationLoading={gamificationLoading}
          />

          {/* Quick Action Bento Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <Link
              to="/coding"
              className="group p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Code2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">Coding Arena</div>
                <div className="text-[10px] text-slate-400 truncate">Algorithm Practice</div>
              </div>
            </Link>

            <Link
              to="/courses"
              className="group p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">Courses</div>
                <div className="text-[10px] text-slate-400 truncate">Placement Tracks</div>
              </div>
            </Link>

            <Link
              to="/certificates"
              className="group p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Award className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">Certificates</div>
                <div className="text-[10px] text-slate-400 truncate">Verified Credentials</div>
              </div>
            </Link>

            <Link
              to="/profile"
              className="group p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all flex items-center gap-3 text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">My Profile</div>
                <div className="text-[10px] text-slate-400 truncate">Account Details</div>
              </div>
            </Link>
          </div>

          {/* Main 2-Column Learning Content (Courses + Circulars) */}
          <div className="grid grid-cols-1 gap-8 py-4 lg:grid-cols-3 lg:gap-8">
            <motion.div
              className="space-y-6 lg:col-span-2"
              initial={reduceMotion ? false : "hidden"}
              whileInView="visible"
              viewport={{ once: true, amount: 0.12 }}
              variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
            >
              <motion.div variants={fadeUp}>
                <CourseLedger courses={courses} loading={loading} />
              </motion.div>
            </motion.div>

            <motion.aside
              className="space-y-6"
              initial={reduceMotion ? false : "hidden"}
              whileInView="visible"
              viewport={{ once: true, amount: 0.12 }}
              variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
            >
              <motion.div variants={fadeUp}>
                <CircularsWidget announcements={announcements} loading={loading} />
              </motion.div>
            </motion.aside>
          </div>
        </div>
      )}

      {/* ========================================================
          VIEW 2: DIGITAL ID & STUDENT PROFILE
      ======================================================== */}
      {activeTab === "profile" && <ProfilePage embedded />}
    </div>
  );
}
