import React, { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
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
  Code2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "../components/NotificationBell";
import vcetLogoImg from "../assets/vcet-logo.png";
import ScrollToTop from "../components/ScrollToTop";

const FACULTY_NAV = [
  { name: "Faculty Dashboard", href: "/faculty/dashboard", icon: LayoutDashboard },
  { name: "Coding Arena & Tests", href: "/faculty/coding", icon: Code2 },
  { name: "Manage Resources", href: "/faculty/resources", icon: Layers },
  { name: "Manage Subjects", href: "/faculty/subjects", icon: BookOpen },
  { name: "Department Circulars", href: "/faculty/announcements", icon: Megaphone },
  { name: "Student Directory", href: "/faculty/students", icon: Users },
  { name: "Faculty Profile", href: "/profile", icon: User }
];

export default function FacultyLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/faculty/dashboard") return location.pathname === "/faculty/dashboard";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-[#0062A8] selection:text-white font-sans">
      <ScrollToTop />
      {/* 1. Global Faculty Topbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between">
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
              <span className="text-[10px] font-semibold text-[#0062A8] uppercase tracking-wider">
                Faculty & Educator Hub
              </span>
            </div>
          </Link>
        </div>

        {/* Topbar Center: Department Badge */}
        <div className="hidden md:flex items-center">
          <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0062A8] text-xs font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0062A8]" />
            Department of Computer Science & Engineering
          </span>
        </div>

        {/* Topbar Right: Add Resource Quick Action, Notification, Profile */}
        <div className="flex items-center gap-3">
          <Link
            to="/faculty/resources"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0062A8] hover:bg-[#0B4A8F] text-white text-xs font-bold shadow-xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Upload Notes</span>
          </Link>

          <NotificationBell />

          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-[#0B4A8F] text-white font-bold text-xs flex items-center justify-center shadow-sm">
                {user?.name?.charAt(0) || "F"}
              </div>
              <div className="flex flex-col text-left hidden sm:flex">
                <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[130px]">
                  {user?.name || "Prof. S. R. Murugesan"}
                </span>
                <span className="text-[10px] font-medium text-slate-500">
                  {user?.facultyId || "VCET-FAC-CSE-104"}
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

      {/* 2. Main Body with Sidebar + Dynamic Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto flex flex-col justify-between ${
            sidebarOpen ? "translate-x-0 pt-14 lg:pt-0" : "-translate-x-full"
          }`}
        >
          {/* Mobile Sidebar Close Button */}
          <div className="lg:hidden flex justify-end p-3 border-b border-slate-100">
            <button onClick={() => setSidebarOpen(false)} className="p-1 text-slate-500">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-3 space-y-1 overflow-y-auto">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Faculty Management
            </div>
            {FACULTY_NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? "bg-[#0B4A8F] text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-[#0B4A8F]"
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
              className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-600 hover:text-[#0062A8] rounded-lg hover:bg-white"
            >
              <span>Main Portal</span>
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
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
