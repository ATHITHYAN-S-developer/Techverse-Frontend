import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  Layers,
  Award,
  CheckCircle2,
  Megaphone,
  BarChart3,
  ShieldAlert,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Shield,
  Activity,
  UserCheck,
  Code2,
  Flame,
  Globe,
  Search,
  Sliders,
  FileCheck2,
  Sparkles,
  Command,
  ChevronRight,
  Puzzle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "../components/NotificationBell";
import vcetLogoImg from "../assets/vcet-logo.png";
import ScrollToTop from "../components/ScrollToTop";
import AnnouncementMarquee from "../components/AnnouncementMarquee";
import VcetBanner from "../components/VcetBanner";

const ADMIN_NAV_TREE = [
  {
    category: "MAIN",
    items: [
      { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, badge: "Live" },
      { name: "Announcements", href: "/admin/announcements", icon: Megaphone },
    ],
  },
  {
    category: "PEOPLE",
    items: [
      { name: "Students", href: "/admin/students", icon: GraduationCap },
      { name: "Teachers", href: "/admin/faculty", icon: UserCheck },
    ],
  },
  {
    category: "ACADEMIC",
    items: [
      { name: "Departments", href: "/admin/departments", icon: Building2 },
      { name: "Classes", href: "/admin/classes", icon: Users },
      { name: "Subjects", href: "/admin/subjects", icon: BookOpen },
      { name: "Resources", href: "/admin/resources", icon: Layers },
    ],
  },
  {
    category: "CONTENT",
    items: [
      { name: "Courses", href: "/admin/courses", icon: BookOpen },
      { name: "Course Modules", href: "/admin/modules", icon: Puzzle },
    ],
  },
  {
    category: "ASSESSMENT",
    items: [
      { name: "Tests & MCQs", href: "/admin/tests", icon: Activity },
      { name: "Coding Arena", href: "/admin/coding", icon: Code2 },
      { name: "Test Violations", href: "/admin/violations", icon: ShieldAlert, alert: true },
    ],
  },
  {
    category: "ACHIEVEMENT",
    items: [
      { name: "Certificates", href: "/admin/certificates", icon: Award },
      { name: "Points & Streaks", href: "/admin/points", icon: Flame },
      { name: "Leaderboard", href: "/admin/leaderboard", icon: FileCheck2 },
    ],
  },
  {
    category: "ANALYTICS",
    items: [
      { name: "Analytics & Reports", href: "/admin/analytics", icon: BarChart3 },
      { name: "Visitor Traffic", href: "/admin/visitors", icon: Globe },
    ],
  },
  {
    category: "SYSTEM",
    items: [
      { name: "Security Audit Logs", href: "/admin/audit-logs", icon: Shield },
      { name: "System Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Keyboard shortcut Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
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
    if (path === "/admin/dashboard") return location.pathname === "/admin/dashboard";
    return location.pathname.startsWith(path);
  };

  const quickSearchItems = [
    { title: "Students Directory", category: "PEOPLE", link: "/admin/students" },
    { title: "Faculty Roster & Roles", category: "PEOPLE", link: "/admin/faculty" },
    { title: "Departments (7 Branches)", category: "ACADEMIC", link: "/admin/departments" },
    { title: "Classes & Sections", category: "ACADEMIC", link: "/admin/classes" },
    { title: "Subjects & Syllabus Units", category: "ACADEMIC", link: "/admin/subjects" },
    { title: "Academic Resources", category: "ACADEMIC", link: "/admin/resources" },
    { title: "Self-Paced Courses", category: "CONTENT", link: "/admin/courses" },
    { title: "Course Modules Builder", category: "CONTENT", link: "/admin/modules" },
    { title: "Daily Practice Tests", category: "ASSESSMENT", link: "/admin/tests" },
    { title: "Coding Arena Problems", category: "ASSESSMENT", link: "/admin/coding" },
    { title: "Exam Violation Telemetry", category: "ASSESSMENT", link: "/admin/violations" },
    { title: "Issued Certificates", category: "ACHIEVEMENT", link: "/admin/certificates" },
    { title: "Points & Streak Config", category: "ACHIEVEMENT", link: "/admin/points" },
    { title: "Institutional Leaderboard", category: "ACHIEVEMENT", link: "/admin/leaderboard" },
    { title: "Telemetry & Analytics", category: "ANALYTICS", link: "/admin/analytics" },
    { title: "Visitor Trends", category: "ANALYTICS", link: "/admin/visitors" },
    { title: "Security Audit Logs", category: "SYSTEM", link: "/admin/audit-logs" },
    { title: "Platform Settings", category: "SYSTEM", link: "/admin/settings" },
  ];

  const filteredSearch = searchQuery.trim()
    ? quickSearchItems.filter(
        (i) =>
          i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : quickSearchItems;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-[#0062A8] selection:text-white font-sans">
      <ScrollToTop />

      {/* 1. TOP HEADER - Clean White */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-xs">
        {/* Left: Hamburger & Institutional Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden cursor-pointer"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-2.5">
            <img src={vcetLogoImg} alt="VCET" className="h-8 w-8 object-contain" />
            <div className="flex flex-col">
              <span className="font-black text-sm tracking-tight text-slate-900 flex items-center gap-1.5">
                Tech<span className="text-[#0062A8]">Verse</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-[#0062A8] font-extrabold border border-blue-200">
                  ADMIN
                </span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                Velalar College of Engineering & Technology
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Global Quick Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-100/90 border border-slate-200 hover:border-slate-300 text-slate-500 text-xs transition-all cursor-pointer shadow-xs"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search students, teachers, courses, resources...</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono text-slate-500 shadow-xs">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right: Notifications, Profile, View Portal */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 md:hidden cursor-pointer"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          <NotificationBell />

          <Link
            to="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition-colors font-medium"
          >
            <span>Live Portal</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          {/* Admin Avatar Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0062A8] to-sky-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              AD
            </div>
            <div className="hidden lg:block text-left">
              <span className="text-xs font-bold text-slate-800 block leading-tight">
                {user?.name || "System Admin"}
              </span>
              <span className="text-[10px] text-[#0062A8] font-bold leading-tight">
                Administrator
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* VCET Banner */}
      <VcetBanner />
      <AnnouncementMarquee />

      {/* 2. BODY: FIXED SIDEBAR + MAIN CONTENT AREA */}
      <div className="flex flex-1 relative">
        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* FIXED SIDEBAR - Pristine White */}
        <aside
          className={`fixed top-[53px] bottom-0 left-0 w-64 bg-white border-r border-slate-200 z-50 transition-transform duration-200 lg:translate-x-0 overflow-y-auto flex flex-col justify-between shadow-xs ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-3 space-y-4">
            {ADMIN_NAV_TREE.map((sec, sIdx) => (
              <div key={sIdx} className="space-y-1">
                <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase px-3 block">
                  {sec.category}
                </span>
                <div className="space-y-0.5">
                  {sec.items.map((item, iIdx) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={iIdx}
                        to={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          active
                            ? "bg-blue-50 text-[#0062A8] font-bold border-l-4 border-[#0062A8] shadow-xs"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className={`w-4 h-4 shrink-0 ${active ? "text-[#0062A8]" : "text-slate-400"}`} />
                          <span className="truncate">{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                            {item.badge}
                          </span>
                        )}
                        {item.alert && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200 animate-pulse">
                            Security
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Sidebar Institutional Badge */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/70">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2.5 shadow-xs">
              <Shield className="w-4 h-4 text-[#0062A8] shrink-0" />
              <div className="min-w-0">
                <span className="text-slate-900 font-bold block truncate">VCET Governance</span>
                <span className="text-[10px] text-slate-400 block truncate">v1.0 • Erode, TN</span>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 min-w-0 max-w-full overflow-x-hidden bg-slate-50">
          <Outlet />
        </main>
      </div>

      {/* 3. GLOBAL SEARCH MODAL (CTRL+K) */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center gap-3">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search administration modules, students, settings..."
                className="w-full bg-transparent border-0 outline-none text-sm text-slate-900 placeholder:text-slate-400"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filteredSearch.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    navigate(item.link);
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 text-xs flex items-center justify-between text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <ChevronRight className="w-3.5 h-3.5 text-[#0062A8]" />
                    <span className="font-bold">{item.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">{item.category}</span>
                </button>
              ))}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
              <span>Use ↑↓ to navigate</span>
              <span>ESC to close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
