import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Zap,
  PlayCircle,
  Award,
  Megaphone,
  Layers,
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
  Users,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";

import vcetLogoImg from "../assets/vcet-logo.png";
import TechVerseLogo from "./TechVerseLogo";
import { useAuth } from "../context/AuthContext";
import LogoutConfirmationModal from "./LogoutConfirmationModal";

const NAV_LINKS = [
  { name: "Home", href: "/", icon: Home },
  { name: "Departments", href: "/departments", icon: Layers },
  { name: "PrepZone", href: "/courses", icon: BookOpen },
  { name: "Fundamentals", href: "/fundamentals", icon: Award },
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
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, role, isAuthenticated, logout, streak } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    if (profileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileMenuOpen]);

  useEffect(() => {
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isTabActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const getDashboardPath = () => {
    if (role === "admin") return "/admin/dashboard";
    if (role === "faculty" || role === "teacher" || role === "hod") return "/faculty/dashboard";
    return "/dashboard";
  };

  const getProfilePath = () => {
    if (role === "student") return "/profile";
    return "/faculty/profile";
  };

  return (
    <>
      <header
        className={`w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 transition-shadow duration-200 py-3 sm:py-3.5 ${
          scrolled ? "shadow-sm border-slate-200" : "shadow-none"
        }`}
      >
        <div className="w-full max-w-[1500px] mx-auto px-3 sm:px-5 lg:px-8 flex items-center justify-between gap-3">
          {/* 1. Left: Compact VCET Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 select-none shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vcet-blue-deep rounded-lg group"
            title="VCET TechVerse"
          >
            <TechVerseLogo height="h-8 sm:h-9" />
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
                      ? "text-vcet-blue-deep font-bold"
                      : "text-slate-600 hover:text-vcet-blue-deep font-medium"
                  }`}
                >
                  <span>{link.name}</span>

                  {link.badge && (
                    <span
                      className={`text-[10px] font-black uppercase px-1.5 py-0.2 rounded border transition-colors ${
                        active
                          ? "border-vcet-blue-deep text-vcet-blue-deep bg-blue-50/60"
                          : "border-red-400/80 text-red-600 bg-red-50/50"
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}

                  {active && (
                    <motion.div
                      layoutId="navbarUnderline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-vcet-blue-deep rounded-full"
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
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Streak Badge for Students - Hidden on Home Screen */}
                {role === "student" && location.pathname !== "/" && (
                  <Link
                    to="/dashboard#profile"
                    className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold hover:bg-amber-100 transition-colors shadow-xs shrink-0"
                    title={`${streak?.currentStreak || 0} Day Learning Streak`}
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
                    <span>{streak?.currentStreak || 0}d</span>
                  </Link>
                )}

                {/* User Profile Menu Trigger */}
                <div className="relative shrink-0" ref={profileMenuRef}>
                  <button
                    type="button"
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-1.5 sm:gap-2 group min-w-0 p-1 sm:px-2 rounded-xl hover:bg-slate-100 transition-all cursor-pointer select-none border border-transparent hover:border-slate-200"
                    title="Account & Profile Menu"
                    aria-expanded={profileMenuOpen}
                  >
                    <span className="w-8 h-8 rounded-full bg-vcet-blue-deep text-white font-display text-xs font-semibold flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                      {user?.name?.charAt(0) || "U"}
                    </span>
                    <span className="hidden sm:flex flex-col text-left min-w-0">
                      <span className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[100px] sm:max-w-[140px] group-hover:text-vcet-blue transition-colors">
                        {user?.name || "Student"}
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 tabular-nums truncate max-w-[100px] sm:max-w-[140px]">
                        {role === "student"
                          ? (user?.registerNumber || "Student")
                          : role === "admin"
                            ? "Administrator"
                            : "Faculty"}
                      </span>
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 shrink-0 ${
                        profileMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Profile Dropdown Menu */}
                  <AnimatePresence>
                    {profileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 overflow-hidden"
                      >
                        {/* Header preview */}
                        <div className="px-4 py-3 bg-slate-50/90 border-b border-slate-100 flex items-center gap-3">
                          <span className="w-10 h-10 rounded-full bg-vcet-blue-deep text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                            {user?.name?.charAt(0) || "U"}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {user?.name || "User Profile"}
                            </p>
                            <p className="text-[10px] font-semibold text-vcet-blue truncate mt-0.5">
                              {role === "student"
                                ? "Student"
                                : role === "admin"
                                ? "Administrator"
                                : "Faculty / Teacher"}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {user?.email || user?.staffId || user?.registerNumber || ""}
                            </p>
                          </div>
                        </div>

                        {/* Navigation Options */}
                        <div className="p-1.5 space-y-0.5">
                          {/* Profile Option */}
                          <Link
                            to={getProfilePath()}
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-vcet-blue hover:bg-blue-50/70 transition-colors"
                          >
                            <div className="p-1.5 rounded-lg bg-blue-50 text-vcet-blue">
                              <User className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800">Profile</span>
                              <span className="text-[10px] text-slate-500 font-normal">View & manage profile</span>
                            </div>
                          </Link>

                          {/* Dashboard Option */}
                          <Link
                            to={getDashboardPath()}
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-vcet-blue hover:bg-blue-50/70 transition-colors"
                          >
                            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                              <LayoutDashboard className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800">Dashboard</span>
                              <span className="text-[10px] text-slate-500 font-normal">Go to main dashboard</span>
                            </div>
                          </Link>
                        </div>

                        {/* Divider & Sign Out */}
                        <div className="pt-1 border-t border-slate-100 px-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setProfileMenuOpen(false);
                              setShowLogoutConfirm(true);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                          >
                            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                              <LogOut className="w-4 h-4" />
                            </div>
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="group inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-vcet-blue-deep border border-vcet-blue-deep hover:bg-vcet-blue-deep hover:text-white transition-colors"
              >
                <span>Login</span>
                <ArrowRight
                  size={12}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            )}

            {/* Mobile Hamburger Button with Micro-Animation */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 lg:hidden cursor-pointer shrink-0 border border-slate-200/80 bg-slate-50/70"
              aria-label="Open Navigation Drawer"
            >
              <Menu size={20} />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[70] lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 bottom-0 w-[295px] max-w-[85vw] bg-white shadow-2xl z-50 flex flex-col justify-between overflow-y-auto"
            >
              <div>
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 text-base">VCET</span>
                    <span className="text-xs font-bold text-vcet-blue-deep">TechVerse</span>
                  </div>
                  <motion.button
                    whileHover={{ rotate: 90, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
                  >
                    <X size={20} />
                  </motion.button>
                </div>

                <motion.nav
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.045, delayChildren: 0.08 },
                    },
                  }}
                  className="px-3 py-3 space-y-1"
                >
                  {NAV_LINKS.map((link) => {
                    const Icon = link.icon;
                    const active = isTabActive(link.href);

                    return (
                      <motion.div
                        key={link.name}
                        variants={{
                          hidden: { opacity: 0, x: 20 },
                          visible: {
                            opacity: 1,
                            x: 0,
                            transition: { type: "spring", damping: 25, stiffness: 300 },
                          },
                        }}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link
                          to={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                            active
                              ? "bg-blue-50 text-vcet-blue-deep font-bold border-l-4 border-vcet-blue-deep"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon size={16} className={active ? "text-vcet-blue-deep" : "text-slate-400"} />
                            <span>{link.name}</span>
                          </div>
                          {link.badge && (
                            <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded border border-red-400 text-red-600 bg-red-50">
                              {link.badge}
                            </span>
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}

                  <div className="pt-2 border-t border-slate-100 mt-2 space-y-1">
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, x: 20 },
                        visible: {
                          opacity: 1,
                          x: 0,
                          transition: { type: "spring", damping: 25, stiffness: 300 },
                        },
                      }}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        to="/verify"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-vcet-blue"
                      >
                        <ShieldCheck size={16} className="text-emerald-600" />
                        <span>Verify Certificate</span>
                      </Link>
                    </motion.div>
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, x: 20 },
                        visible: {
                          opacity: 1,
                          x: 0,
                          transition: { type: "spring", damping: 25, stiffness: 300 },
                        },
                      }}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        to="/coding"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-vcet-blue"
                      >
                        <Code2 size={16} className="text-indigo-600" />
                        <span>Coding Arena</span>
                      </Link>
                    </motion.div>
                  </div>
                </motion.nav>
              </div>

              {/* Drawer Bottom Actions */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="p-4 border-t border-slate-100 bg-slate-50"
              >
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <Link
                      to={getProfilePath()}
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 text-vcet-blue-deep border border-blue-200 text-xs font-bold hover:bg-blue-100 transition-colors"
                    >
                      <User size={14} />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      to={getDashboardPath()}
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-vcet-blue-deep text-white text-xs font-bold"
                    >
                      <LayoutDashboard size={14} />
                      <span>Open {role === "admin" ? "Admin Hub" : role === "faculty" ? "Faculty Hub" : "Student Dashboard"}</span>
                    </Link>
                    <button
                      onClick={() => {
                        setShowLogoutConfirm(true);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-vcet-blue-deep text-white text-xs font-bold"
                  >
                    <LogIn size={14} />
                    <span>Login to TechVerse</span>
                  </Link>
                )}
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <LogoutConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          logout();
          navigate("/login");
        }}
      />
    </>
  );
}
