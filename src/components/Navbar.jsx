import React, { useState, useEffect } from "react";
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
  Users
} from "lucide-react";
import techverseLogoImg from "../assets/techverse-logo.png";
import TechVerseLogo from "./TechVerseLogo";
import vcetLogoImg from "../assets/vcet-logo.png";
import { useAuth } from "../context/AuthContext";
import LogoutConfirmationModal from "./LogoutConfirmationModal";

const NAV_LINKS = [
  { name: "Home", href: "/", icon: Home },
  { name: "Departments", href: "/departments", icon: Layers },
  { name: "PrepZone", href: "/courses", icon: BookOpen },
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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const { user, role, isAuthenticated, logout, streak } = useAuth();

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
    if (role === "faculty" || role === "teacher" || role === "hod") return "/faculty/dashboard";
    return "/dashboard";
  };

  return (
    <>
      <header
        className={`w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 transition-shadow duration-200 py-3 sm:py-3.5 ${
          scrolled ? "shadow-sm border-slate-200" : "shadow-none"
        }`}
      >
        <div className="w-full max-w-[1500px] mx-auto px-3 sm:px-5 lg:px-8 flex items-center justify-between gap-3">
          {/* 1. Left: Compact VCET Brand Wordmark */}
          <Link
            to="/"
            className="flex items-center gap-2.5 select-none shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vcet-blue-deep rounded-lg group"
            title="VCET TechVerse"
          >
            <TechVerseLogo iconSize="h-10 w-10 sm:h-12 sm:w-12" textSize="text-[22px] sm:text-[25px]" />
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
                {/* Streak Badge for Students */}
                {role === "student" && (
                  <Link
                    to="/dashboard#profile"
                    className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold hover:bg-amber-100 transition-colors"
                    title={`${streak?.currentStreak || 0} Day Streak`}
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{streak?.currentStreak || 0}d</span>
                  </Link>
                )}

                {/* Consistent User Profile Navigation - Displays Full Name on Desktop and Mobile */}
                <Link
                  to={role === "student" ? "/dashboard#profile" : getDashboardPath()}
                  className="flex items-center gap-2 group min-w-0"
                  title="View Profile & Dashboard"
                >
                  <span className="w-8 h-8 rounded-full bg-vcet-blue-deep text-white font-display text-xs font-semibold flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    {user?.name?.charAt(0) || "U"}
                  </span>
                  <span className="flex flex-col text-left min-w-0">
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
                </Link>
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
              className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 lg:hidden cursor-pointer"
              aria-label="Open Navigation Drawer"
            >
              <Menu size={22} />
            </motion.button>
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
                      to={getDashboardPath()}
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-vcet-blue-deep text-white text-xs font-bold"
                    >
                      <User size={14} />
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
