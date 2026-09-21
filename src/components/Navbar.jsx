import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Globe,
  Zap,
  PlayCircle,
  Award,
  Megaphone,
  Layers,
  Target,
  ArrowRight,
  User,
  Menu,
  X,
  LogIn,
  BookOpen,
  Code2,
  ShieldCheck,
  LogOut,
  Flame,
  Users
} from "lucide-react";
import vcetLogoImg from "../assets/vcet-logo.png";
import vcetWideLogo from "../assets/vcet-wide-logo.png";
import { useAuth } from "../context/AuthContext";

const NAV_LINKS = [
  { name: "Home", href: "/", icon: Home },
  { name: "Departments", href: "/departments", icon: Layers },
  { name: "Courses", href: "/courses", icon: BookOpen },
  { name: "PrepZone", href: "/prepzone", icon: Target },
  { name: "Technology", href: "/technology", icon: Globe },
  { name: "Tech Pulse", href: "/updates", icon: Zap },
  {
    name: "Announcements",
    href: "/announcements",
    icon: Megaphone,
    badge: "NEW",
  },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const { user, role, isAuthenticated, logout, streak, points } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isTabActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const getDashboardPath = () => {
    if (role === "admin") return "/admin/dashboard";
    if (role === "faculty" || role === "teacher") return "/faculty/dashboard";
    return "/dashboard";
  };

  return (
    <>
      <header
        className={`w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 transition-all duration-200 ${
          scrolled ? "py-2 shadow-sm" : "py-3 sm:py-3.5 shadow-none"
        }`}
      >
        <div className="w-full max-w-[1500px] mx-auto px-3 sm:px-5 lg:px-8 flex items-center justify-between gap-3">
          {/* 1. Left: Compact VCET Brand Wordmark */}
          <Link
            to="/"
            className="flex items-center gap-2.5 select-none shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B4A8F] rounded-lg"
            title="VCET TechVerse"
          >
            {!logoError ? (
              <img
                src={vcetLogoImg}
                alt="VCET Shield"
                className={`transition-all duration-200 object-contain ${
                  scrolled ? "h-8 w-8" : "h-9 w-9"
                }`}
                onError={() => setLogoError(true)}
              />
            ) : (
              <img
                src={vcetWideLogo}
                alt="VCET"
                className={`transition-all duration-200 object-contain ${
                  scrolled ? "h-7 max-w-[140px]" : "h-8 max-w-[160px]"
                }`}
              />
            )}

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-none">
                  VCET
                </span>
                <span className="text-xs font-bold text-[#0B4A8F] uppercase tracking-wider">
                  TechVerse
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-500 hidden sm:block leading-none mt-0.5">
                Autonomous
              </span>
            </div>
          </Link>

          {/* 2. Center: Text-Forward Navigation with Shared Underline Slider */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
            {NAV_LINKS.map((link) => {
              const active = isTabActive(link.href);

              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`relative py-1 text-[13px] tracking-tight transition-colors duration-150 select-none flex items-center gap-1.5 ${
                    active
                      ? "text-[#0B4A8F] font-bold"
                      : "text-slate-600 hover:text-[#0B4A8F] font-medium"
                  }`}
                >
                  <span>{link.name}</span>

                  {link.badge && (
                    <span
                      className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded border transition-colors ${
                        active
                          ? "border-[#0B4A8F] text-[#0B4A8F] bg-blue-50/60"
                          : "border-red-400/80 text-red-600 bg-red-50/50"
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}

                  {active && (
                    <motion.div
                      layoutId="navbarUnderline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0B4A8F] rounded-full"
                      transition={{ duration: 0.18, ease: "easeInOut" }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* 3. Right: Streak Badge & Login/User Menu */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Authenticated State vs Public Login */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {/* Streak Badge for Students */}
                {role === "student" && (
                  <Link
                    to="/points"
                    className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold hover:bg-amber-100 transition-colors"
                    title={`${streak} Day Streak • ${points} Points`}
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{streak}d</span>
                  </Link>
                )}

                {/* Role / Dashboard Button */}
                <Link
                  to={getDashboardPath()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#0B4A8F] hover:bg-[#0062A8] shadow-sm transition-all"
                >
                  <User size={13} />
                  <span className="max-w-[90px] truncate hidden sm:inline">
                    {role === "admin" ? "Admin Hub" : role === "faculty" ? "Faculty" : user?.name?.split(" ")[0] || "Dashboard"}
                  </span>
                  <span className="sm:hidden">Hub</span>
                </Link>
              </div>
            ) : (
              <Link
                to="/login"
                className="group inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-[#0B4A8F] border border-[#0B4A8F] hover:bg-[#0B4A8F] hover:text-white transition-colors"
              >
                <span>Login</span>
                <ArrowRight
                  size={12}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 lg:hidden focus:outline-none"
              aria-label="Open Navigation Drawer"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed top-0 right-0 bottom-0 w-[290px] bg-white shadow-2xl z-50 flex flex-col justify-between"
            >
              <div>
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 text-base">VCET</span>
                    <span className="text-xs font-bold text-[#0B4A8F]">TechVerse</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                  >
                    <X size={20} />
                  </button>
                </div>

                <nav className="px-3 py-3 space-y-1">
                  {NAV_LINKS.map((link) => {
                    const Icon = link.icon;
                    const active = isTabActive(link.href);

                    return (
                      <Link
                        key={link.name}
                        to={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                          active
                            ? "bg-blue-50 text-[#0B4A8F] font-bold border-l-4 border-[#0B4A8F]"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={16} className={active ? "text-[#0B4A8F]" : "text-slate-400"} />
                          <span>{link.name}</span>
                        </div>
                        {link.badge && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded border border-red-400 text-red-600 bg-red-50">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}

                  <div className="pt-2 border-t border-slate-100 mt-2 space-y-1">
                    <Link
                      to="/verify"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-[#0062A8]"
                    >
                      <ShieldCheck size={16} className="text-emerald-600" />
                      <span>Verify Certificate</span>
                    </Link>
                    <Link
                      to="/coding"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-[#0062A8]"
                    >
                      <Code2 size={16} className="text-indigo-600" />
                      <span>Coding Arena</span>
                    </Link>
                  </div>
                </nav>
              </div>

              {/* Drawer Bottom Actions */}
              <div className="p-4 border-t border-slate-100 bg-slate-50">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <Link
                      to={getDashboardPath()}
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0B4A8F] text-white text-xs font-bold"
                    >
                      <User size={14} />
                      <span>Open {role === "admin" ? "Admin Hub" : role === "faculty" ? "Faculty Hub" : "Student Dashboard"}</span>
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0B4A8F] text-white text-xs font-bold"
                  >
                    <LogIn size={14} />
                    <span>Login to TechVerse</span>
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
