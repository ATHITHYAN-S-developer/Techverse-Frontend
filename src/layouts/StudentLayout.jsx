import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  Menu,
  X,
  Search,
  ExternalLink,
  Flame,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import GlobalSearchModal from "../components/GlobalSearchModal";
import techverseLogoImg from "../assets/techverse-logo.png";
import TechVerseLogo from "../components/TechVerseLogo";
import ScrollToTop from "../components/ScrollToTop";
import VcetBanner from "../components/VcetBanner";
import LogoutConfirmationModal from "../components/LogoutConfirmationModal";

/**
 * Text-only navigation. Grouped by purpose rather than shown as a flat icon
 * list, with a gold left-rule marking the active item.
 */
const STUDENT_NAV = [
  {
    label: "Learning",
    items: [
      { name: "Dashboard", href: "/dashboard" },
      { name: "My Courses", href: "/courses" },
      { name: "Academic Resources", href: "/departments" },
    ],
  },
  {
    label: "Progress",
    items: [
      { name: "Certificates", href: "/certificates" },
      { name: "Saved Bookmarks", href: "/bookmarks" },
    ],
  },
  {
    label: "Practice",
    items: [
      { name: "Coding Arena", href: "/coding" },
    ],
  },
  {
    label: "Account",
    items: [{ name: "Profile & Account", href: "/profile" }],
  },
];

const navGroupVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

const navItemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", damping: 25, stiffness: 300 },
  },
};

function NavLinks({ onNavigate, animated = false }) {
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  const GroupContainer = animated ? motion.div : "div";
  const ItemContainer = animated ? motion.li : "li";

  return (
    <nav className="py-2">
      {STUDENT_NAV.map((group, groupIdx) => (
        <GroupContainer
          key={group.label}
          {...(animated
            ? {
                variants: navGroupVariants,
                initial: "hidden",
                animate: "visible",
                transition: { delay: groupIdx * 0.06 },
              }
            : {})}
          className="mb-7 last:mb-0"
        >
          <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-profile-ink/75">
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = isActive(item.href);
              return (
                <ItemContainer
                  key={item.name}
                  {...(animated ? { variants: navItemVariants } : {})}
                >
                  <Link
                    to={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`relative block py-1.5 pl-3 pr-2 text-[13px] leading-snug transition-all rounded-md ${
                      active
                        ? "text-profile-ink font-semibold bg-profile-alt/60"
                        : "text-profile-ink/70 hover:text-profile-main hover:translate-x-1"
                    }`}
                  >
                    {active && (
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2px] bg-profile-main"
                      />
                    )}
                    {item.name}
                  </Link>
                </ItemContainer>
              );
            })}
          </ul>
        </GroupContainer>
      ))}
    </nav>
  );
}

export default function StudentLayout() {
  const { user, logout, streak } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close the mobile overlay whenever the route changes.
  const location = useLocation();
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate("/login");
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="h-dvh overflow-hidden bg-profile-paper text-profile-ink selection:bg-profile-main selection:text-white font-sans flex flex-col">
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

      {/* Topbar */}
      <header className="sticky top-0 z-40 bg-profile-paper/95 backdrop-blur-md border-b border-profile-rule">
        <div className="px-4 sm:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link to="/" className="flex items-center gap-2.5 min-w-0 group">
              <TechVerseLogo iconSize="h-9 w-9 sm:h-10 sm:w-10" textSize="text-lg sm:text-xl" />
              <span className="hidden md:inline-block text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200 uppercase tracking-wider">
                Student Portal
              </span>
            </Link>
          </div>

          {/* Gamification + identity + Mobile Menu on Right */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            <Link
              to="/dashboard#profile"
              className="hidden sm:flex items-baseline gap-2 text-xs hover:opacity-70 transition-opacity"
              title="Current learning streak"
            >
              <span className="inline-flex items-center gap-1.5 font-display font-semibold text-profile-main tabular-nums">
                <Flame className="w-3.5 h-3.5 fill-profile-main" />
                {streak?.currentStreak || 0}
                <span className="font-sans font-normal text-profile-ink/70">day streak</span>
              </span>
            </Link>

            <Link to="/dashboard#profile" className="flex items-center gap-2 group min-w-0" title="View Profile">
              <span className="w-8 h-8 rounded-full bg-profile-main text-white font-display text-xs font-semibold flex items-center justify-center shrink-0">
                {user?.name?.charAt(0) || "S"}
              </span>
              <span className="flex flex-col text-left min-w-0">
                <span className="text-xs font-semibold text-profile-ink leading-tight truncate max-w-[100px] sm:max-w-[140px] group-hover:text-profile-main transition-colors">
                  {user?.name || "Student"}
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium text-profile-ink/70 tabular-nums truncate max-w-[100px] sm:max-w-[140px]">
                  {user?.registerNumber || "Student"}
                </span>
              </span>
            </Link>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-profile-ink/60 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
              title="Sign Out"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Consistently Positioned Mobile Hamburger Button (Right Side) with Micro-Animation */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-profile-ink/70 hover:text-profile-ink hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </header>

      <VcetBanner />

      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex h-full min-h-0 w-56 shrink-0 flex-col justify-between border-r border-profile-rule bg-profile-paper overflow-y-auto">
          <div className="px-4 py-8">
            <NavLinks />
          </div>
          <div className="px-4 py-6 border-t border-profile-rule space-y-3">
            <Link
              to="/"
              className="flex items-center justify-between text-xs text-profile-ink/70 hover:text-profile-main transition-colors"
            >
              VCET Homepage
              <ExternalLink className="w-3 h-3 opacity-50" />
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs text-profile-ink/70 hover:text-rose-700 transition-colors"
            >
              <LogOut className="w-3 h-3" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Mobile Animated Overlay Nav */}
        <AnimatePresence>
          {sidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-50">
              {/* Animated Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="fixed inset-0 bg-profile-ink/40 backdrop-blur-sm"
                onClick={closeSidebar}
                aria-hidden="true"
              />

              {/* Drawer sliding smoothly from the right side */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
                className="fixed top-0 right-0 bottom-0 w-72 max-w-[85vw] bg-profile-paper border-l border-profile-rule shadow-2xl z-50 flex flex-col justify-between overflow-y-auto"
              >
                <div>
                  <div className="flex items-center justify-between px-5 h-16 border-b border-profile-rule">
                    <span className="font-display text-sm font-semibold text-profile-ink">Navigate</span>
                    <motion.button
                      whileHover={{ rotate: 90, scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={closeSidebar}
                      className="p-1.5 -mr-1.5 text-profile-ink/70 hover:text-profile-ink cursor-pointer rounded-lg hover:bg-slate-100"
                      aria-label="Close navigation"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>
                  <div className="px-4 py-6">
                    <NavLinks onNavigate={closeSidebar} animated={true} />
                  </div>
                </div>
                <div className="px-5 py-6 border-t border-profile-rule space-y-3">
                  <Link
                    to="/"
                    onClick={closeSidebar}
                    className="flex items-center justify-between text-xs text-profile-ink/70 hover:text-profile-main transition-colors"
                  >
                    VCET Homepage
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-xs text-profile-ink/70 hover:text-rose-700 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Content */}
        <main id="main-content" className="min-h-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
