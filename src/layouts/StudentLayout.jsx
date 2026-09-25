import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  Award,
  Trophy,
  Target,
  Code2,
  Bookmark,
  User,
  LogOut,
  Flame,
  Star,
  Menu,
  X,
  Search,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "../components/NotificationBell";
import GlobalSearchModal from "../components/GlobalSearchModal";
import VisitorCounter from "../components/VisitorCounter";
import vcetLogoImg from "../assets/vcet-logo.png";
import ScrollToTop from "../components/ScrollToTop";

import VcetBanner from "../components/VcetBanner";

const STUDENT_NAV = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Courses", href: "/courses", icon: BookOpen },
  { name: "Academic Resources", href: "/departments", icon: Layers },
  { name: "Daily Tests", href: "/tests", icon: Award },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Certificates", href: "/certificates", icon: CheckCircle2 },
  { name: "PrepZone Hub", href: "/prepzone", icon: Target },
  { name: "Coding Arena", href: "/coding", icon: Code2 },
  { name: "Saved Bookmarks", href: "/bookmarks", icon: Bookmark },
  { name: "Student Profile", href: "/profile", icon: User }
];

export default function StudentLayout() {
  const { user, logout, streak, points } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#f0f9ff] flex flex-col selection:bg-[#0062A8] selection:text-white font-sans">
      <ScrollToTop />
      {/* 1. Global Student Topbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sky-100 px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-2">
            <img src={vcetLogoImg} alt="VCET" className="h-8 w-8 object-contain" />
            <div className="flex flex-col">
              <span className="text-base font-black text-slate-900 leading-none">
                VCET <span className="text-[#0B4A8F]">TechVerse</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Student Learning Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Topbar Center: Global Quick Search */}
        <div className="hidden md:flex items-center">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-500 bg-slate-100 hover:bg-slate-200/80 transition-colors w-64 border border-slate-200/60"
          >
            <Search className="w-3.5 h-3.5 text-[#0062A8]" />
            <span>Search notes, courses, tests...</span>
            <kbd className="ml-auto text-[10px] px-1 py-0.5 bg-white rounded border border-slate-200 text-slate-400">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Topbar Right: Streak, Points, Notification, Profile */}
        <div className="flex items-center gap-3">
          {/* Gamification Badges */}
          <Link
            to="/points"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold hover:bg-amber-100 transition-colors shadow-xs"
            title="Daily Streak & Points"
          >
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{streak} Days</span>
            <span className="text-amber-400">|</span>
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{points} pts</span>
          </Link>

          <NotificationBell />

          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
            <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-[#0062A8] text-white font-bold text-xs flex items-center justify-center shadow-sm">
                {user?.name?.charAt(0) || "S"}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                  {user?.name || "Student"}
                </span>
                <span className="text-[10px] font-medium text-slate-500">
                  {user?.registerNumber || "732924CSE001"}
                </span>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors ml-1"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>
      {/* VCET Banner */}
      <VcetBanner />
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-sky-100 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto flex flex-col justify-between ${
            sidebarOpen ? "translate-x-0 pt-14 lg:pt-0" : "-translate-x-full"
          }`}
        >
          {/* Mobile Sidebar Close Button */}
          <div className="lg:hidden flex justify-end p-3 border-b border-sky-100">
            <button onClick={() => setSidebarOpen(false)} className="p-1 text-slate-500">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-3 space-y-1 overflow-y-auto">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Academic & Learning
            </div>
            {STUDENT_NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? "bg-sky-100/80 text-[#0B4A8F] border border-sky-300/70 shadow-xs"
                      : "text-slate-600 hover:bg-sky-50/70 hover:text-[#0B4A8F]"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-[#0B4A8F]" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Sidebar Footer: Quick Back to Main Website */}
          <div className="p-3 border-t border-sky-100 bg-[#f0f9ff]/50 space-y-2">
            <Link
              to="/"
              className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-600 hover:text-[#0062A8] rounded-lg hover:bg-white"
            >
              <span>VCET Homepage</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Pane */}
        <main className="flex-1 overflow-y-auto p-2 sm:p-4 lg:p-6 bg-[#f0f9ff]">
          <Outlet />
        </main>
      </div>

      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
