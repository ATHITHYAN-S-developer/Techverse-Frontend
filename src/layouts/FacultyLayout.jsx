import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Layers,
  Megaphone,
  Users,
  PlusCircle,
  User,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  BookOpen,
  Code2,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import techverseLogoImg from "../assets/techverse-logo.png";
import TechVerseLogo from "../components/TechVerseLogo";
import ScrollToTop from "../components/ScrollToTop";
import VcetBanner from "../components/VcetBanner";
import LogoutConfirmationModal from "../components/LogoutConfirmationModal";

const getFacultyNav = (isHod) => {
  if (isHod) {
    return [
      { name: "HOD Dashboard", href: "/faculty/dashboard", icon: LayoutDashboard },
      { name: "Create & Manage Courses", href: "/faculty/courses", icon: BookOpen },
      { name: "All Course Modules", href: "/faculty/modules", icon: Layers },
      { name: "Course Students", href: "/faculty/modules/students", icon: GraduationCap },
      { name: "Coding Arena", href: "/faculty/coding", icon: Code2 },
      { name: "Manage Resources", href: "/faculty/resources", icon: Layers },
      { name: "Department Circulars", href: "/faculty/announcements", icon: Megaphone },
      { name: "Student Directory", href: "/faculty/students", icon: Users },
      { name: "Profile & Account", href: "/faculty/profile", icon: User }
    ];
  }

  // Regular Faculty Navigation: cannot create courses, manages assigned courses and modules only
  return [
    { name: "Faculty Dashboard", href: "/faculty/dashboard", icon: LayoutDashboard },
    { name: "My Assigned Courses", href: "/faculty/courses", icon: BookOpen },
    { name: "Course Modules & Syllabus", href: "/faculty/modules", icon: Layers },
    { name: "Course Students", href: "/faculty/modules/students", icon: GraduationCap },
    { name: "Coding Arena", href: "/faculty/coding", icon: Code2 },
    { name: "Manage Resources", href: "/faculty/resources", icon: Layers },
    { name: "Department Circulars", href: "/faculty/announcements", icon: Megaphone },
    { name: "Student Directory", href: "/faculty/students", icon: Users },
    { name: "Profile & Account", href: "/faculty/profile", icon: User }
  ];
};

export default function FacultyLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const staffId = String(user?.staffId || user?.facultyId || "").toUpperCase();

  const isHod =
    staffId.includes("104") ||
    staffId.includes("HOD") ||
    user?.role === "hod" ||
    user?.title?.toLowerCase().includes("hod") ||
    user?.title?.toLowerCase().includes("head of the department") ||
    user?.designation?.toLowerCase().includes("hod") ||
    user?.designation?.toLowerCase().includes("head of the department") ||
    user?.isHod === true;

  const facultyNav = getFacultyNav(isHod);

  const deptCode =
    user?.departmentId?.code ||
    user?.departmentCode ||
    (staffId.includes("CSE") ? "CSE" : staffId.includes("AIDS") ? "AI&DS" : staffId.includes("IT") ? "IT" : null);

  const deptName =
    user?.departmentId?.name ||
    user?.departmentName ||
    user?.department ||
    (deptCode === "CSE" ? "Computer Science & Engineering" : null) ||
    (deptCode === "AI&DS" ? "Artificial Intelligence & Data Science" : null) ||
    (deptCode === "IT" ? "Information Technology" : null) ||
    (deptCode ? `Department of ${deptCode}` : "Velalar College of Engineering and Technology");

  const displayDeptBadge = isHod
    ? `Head of the Department • ${deptCode || deptName}`
    : (deptName.startsWith("Department of") ? deptName : `Department of ${deptName}`);

  // Escape closes the mobile drawer
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Lock body scroll on mobile when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/faculty/dashboard") return location.pathname === "/faculty/dashboard";
    if (location.pathname === path) return true;
    if (!location.pathname.startsWith(path + "/")) return false;
    // Prefix match — only the LONGEST matching nav entry should appear active
    // (e.g. /faculty/modules/students must not also highlight "Course Modules").
    const longestMatch = facultyNav.reduce((best, item) => {
      const href = item.href;
      const matches =
        location.pathname === href || location.pathname.startsWith(href + "/");
      return matches && href.length > best.length ? href : best;
    }, "");
    return longestMatch === path;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-vcet-blue selection:text-white font-sans">
      <ScrollToTop />
      <LogoutConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
      />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-vcet-blue focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      {/* 1. Global Faculty Topbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link to="/" className="flex items-center gap-2 group">
            <TechVerseLogo iconSize="h-9 w-9 sm:h-10 sm:w-10" textSize="text-lg sm:text-xl" />
            <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-vcet-blue font-bold border border-blue-200 uppercase tracking-wider">
              {isHod ? "HOD Portal" : user?.role === "admin" ? "Admin Hub" : "Faculty Hub"}
            </span>
          </Link>
        </div>

        {/* Topbar Center: Dynamic Department Badge */}
        <div className="hidden md:flex items-center">
          <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-vcet-blue text-xs font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-vcet-blue" />
            {displayDeptBadge}
          </span>
        </div>

        {/* Topbar Right: Add Resource Quick Action, Notification, Profile, Mobile Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/faculty/resources"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-vcet-blue hover:bg-vcet-blue-deep text-white text-xs font-bold shadow-xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Upload Notes</span>
          </Link>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <Link to="/faculty/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-vcet-blue-deep text-white font-bold text-xs flex items-center justify-center shadow-sm">
                {user?.name?.charAt(0) || "F"}
              </div>
              <div className="flex flex-col text-left hidden sm:flex">
                <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[130px]">
                  {user?.name || "Prof. S. R. Murugesan"}
                </span>
                <span className="text-[10px] font-medium text-slate-500">
                  {user?.staffId || user?.facultyId || (isHod ? "VCET-FAC-CSE-104" : "VCET-FACULTY")}
                </span>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors ml-1 cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Consistently Positioned Mobile Hamburger Button (Right Side) with Micro-Animation */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden cursor-pointer"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* VCET Banner */}
      <VcetBanner />

      {/* 2. Main Body with Sidebar + Dynamic Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Backdrop & Drawer with Spring Animation */}
        <AnimatePresence>
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
                onClick={() => setSidebarOpen(false)}
                aria-hidden="true"
              />

              <motion.aside
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
                className="fixed inset-y-0 right-0 z-50 w-72 max-w-[85vw] bg-white border-l border-slate-200 flex flex-col justify-between shadow-2xl overflow-y-auto"
              >
                {/* Mobile Drawer Header */}
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 bg-slate-50/80 shrink-0">
                  <div className="flex items-center gap-2">
                    <TechVerseLogo iconSize="h-8 w-8" textSize="text-base" />
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-vcet-blue font-bold uppercase tracking-wider">
                      {isHod ? "HOD Portal" : "Faculty Portal"}
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ rotate: 90, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSidebarOpen(false)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
                    aria-label="Close navigation"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                <div className="p-3 space-y-1 overflow-y-auto flex-1">
                  <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {isHod ? "HOD Management" : "Faculty Management"}
                  </div>
                  {facultyNav.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          active
                            ? "bg-vcet-blue-deep text-white shadow-sm"
                            : "text-slate-600 hover:bg-slate-100 hover:text-vcet-blue-deep"
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${active ? "text-white" : "text-slate-400"}`} />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>

                {/* Mobile Drawer Footer */}
                <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2 shrink-0">
                  <Link
                    to="/"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-600 hover:text-vcet-blue rounded-lg hover:bg-white"
                  >
                    <span>Main Portal</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.aside>
            </div>
          )}
        </AnimatePresence>

        {/* Desktop Fixed Sidebar */}
        <aside className="hidden lg:flex w-64 shrink-0 border-r border-slate-200 bg-white flex-col justify-between shadow-none">
          <div className="p-3 space-y-1 overflow-y-auto flex-1">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {isHod ? "HOD Management" : "Faculty Management"}
            </div>
            {facultyNav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? "bg-vcet-blue-deep text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-vcet-blue-deep"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-white" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2">
            <Link
              to="/"
              className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-600 hover:text-vcet-blue rounded-lg hover:bg-white"
            >
              <span>Main Portal</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Pane */}
        <main id="main-content" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
