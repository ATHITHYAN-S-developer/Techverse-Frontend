import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";import {
  LogOut,
  Menu,
  X,
  Search,
  ExternalLink,
  Flame,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "../components/NotificationBell";
import GlobalSearchModal from "../components/GlobalSearchModal";
import techverseLogoImg from "../assets/techverse-logo.png";
import ScrollToTop from "../components/ScrollToTop";
import VcetBanner from "../components/VcetBanner";

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
      { name: "PrepZone Hub", href: "/prepzone" },
      { name: "Coding Arena", href: "/coding" },
    ],
  },
  {
    label: "Account",
    items: [{ name: "Profile & Account", href: "/dashboard#profile" }],
  },
];

function NavLinks({ onNavigate }) {
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="py-2">
      {STUDENT_NAV.map((group) => (
        <div key={group.label} className="mb-7 last:mb-0">
          <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-profile-ink/35">
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`relative block py-1.5 pl-3 pr-2 text-[13px] leading-snug transition-colors ${
                      active
                        ? "text-profile-ink font-semibold"
                        : "text-profile-ink/70 hover:text-profile-main"
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
                </li>
              );
            })}
          </ul>
        </div>
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
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close the mobile overlay whenever the route changes.
  const location = useLocation();
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="h-screen overflow-hidden bg-profile-paper text-profile-ink selection:bg-profile-main selection:text-white font-sans flex flex-col">
      <ScrollToTop />

      {/* Topbar */}
      <header className="sticky top-0 z-40 bg-profile-paper/95 backdrop-blur-md border-b border-profile-rule">
        <div className="px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden -ml-1 p-2 text-profile-ink/70 hover:text-profile-ink"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center gap-2.5 min-w-0 group">
              <img
                src={techverseLogoImg}
                alt="TechVerse"
                className="h-8 sm:h-9 w-auto max-w-[170px] sm:max-w-[200px] object-contain transition-transform group-hover:scale-[1.02]"
              />
              <span className="hidden md:inline-block text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200 uppercase tracking-wider">
                Student Portal
              </span>
            </Link>
          </div>

          {/* Gamification + identity */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              to="/dashboard#profile"
              className="hidden sm:flex items-baseline gap-2 text-xs hover:opacity-70 transition-opacity"
              title="Current learning streak"
            >
              <span className="inline-flex items-center gap-1.5 font-display font-semibold text-profile-main tabular-nums">
                <Flame className="w-3.5 h-3.5 fill-profile-main" />
                {streak?.currentStreak || 0}
                <span className="font-sans font-normal text-profile-ink/45">day streak</span>
              </span>
            </Link>

            <NotificationBell />

            <Link to="/dashboard#profile" className="flex items-center gap-2.5 group min-w-0">
              <span className="w-8 h-8 rounded-full bg-profile-main text-white font-display text-xs font-semibold flex items-center justify-center shrink-0">
                {user?.name?.charAt(0) || "S"}
              </span>
              <span className="hidden sm:flex flex-col text-left min-w-0">
                <span className="text-xs font-semibold text-profile-ink leading-tight truncate max-w-[130px] group-hover:text-profile-main transition-colors">
                  {user?.name || "Student"}
                </span>
                <span className="text-[10px] font-medium text-profile-ink/45 tabular-nums">
                  {user?.registerNumber || user?.email || "Student"}
                </span>
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-profile-ink/40 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1 shrink-0"
              title="Sign Out"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
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

        {/* Mobile overlay nav */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-profile-ink/30 backdrop-blur-sm"
              onClick={closeSidebar}
              aria-hidden="true"
            />
            <div className="relative w-72 max-w-[85vw] bg-profile-paper border-r border-profile-rule overflow-y-auto flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between px-5 h-16 border-b border-profile-rule">
                  <span className="font-display text-sm font-semibold text-profile-ink">Navigate</span>
                  <button
                    onClick={closeSidebar}
                    className="p-1.5 -mr-1.5 text-profile-ink/70 hover:text-profile-ink"
                    aria-label="Close navigation"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="px-4 py-6">
                  <NavLinks onNavigate={closeSidebar} />
                </div>
              </div>
              <div className="px-5 py-6 border-t border-profile-rule space-y-3">
                <Link
                  to="/"
                  onClick={closeSidebar}
                  className="flex items-center justify-between text-xs text-profile-ink/70"
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
            </div>
          </div>
        )}

        {/* Content */}
        <main className="min-h-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
