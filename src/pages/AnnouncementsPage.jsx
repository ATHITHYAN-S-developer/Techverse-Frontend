import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Building2,
  Calendar,
  Clock,
  ExternalLink,
  X,
  Briefcase,
  Trophy,
  GraduationCap,
  FileText,
  PartyPopper,
  Megaphone,
  Sparkles,
  Pin,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import { announcementService } from "../services/announcementService";

// Professional Category Badges & Color Palette
const categoryConfig = {
  placement: {
    label: "PLACEMENT",
    badgeBg: "bg-blue-50 text-[#0062A8] border-blue-200/80",
    dotBg: "bg-[#0062A8]",
    accent: "#0062A8",
    icon: Briefcase,
  },
  hackathon: {
    label: "HACKATHON",
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200/80",
    dotBg: "bg-purple-600",
    accent: "#7c3aed",
    icon: Trophy,
  },
  academic: {
    label: "ACADEMIC",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    dotBg: "bg-emerald-600",
    accent: "#059669",
    icon: GraduationCap,
  },
  exam: {
    label: "EXAM",
    badgeBg: "bg-amber-50 text-amber-800 border-amber-200/80",
    dotBg: "bg-amber-600",
    accent: "#d97706",
    icon: FileText,
  },
  event: {
    label: "EVENTS",
    badgeBg: "bg-rose-50 text-rose-700 border-rose-200/80",
    dotBg: "bg-rose-600",
    accent: "#e11d48",
    icon: PartyPopper,
  },
  general: {
    label: "GENERAL",
    badgeBg: "bg-slate-100 text-slate-700 border-slate-200",
    dotBg: "bg-slate-600",
    accent: "#475569",
    icon: Megaphone,
  },
};

function getCategoryStyle(cat) {
  const key = String(cat || "General").toLowerCase();
  if (key.includes("placement")) return categoryConfig.placement;
  if (key.includes("hackathon")) return categoryConfig.hackathon;
  if (key.includes("academic")) return categoryConfig.academic;
  if (key.includes("exam")) return categoryConfig.exam;
  if (key.includes("event")) return categoryConfig.event;
  return categoryConfig.general;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selected, setSelected] = useState(null);

  const categories = ["ALL", "PLACEMENT", "HACKATHON", "ACADEMIC", "EXAM", "EVENTS", "GENERAL"];
  const departments = ["All", "CSE", "AI&DS", "IT", "ECE", "EEE", "MECH", "CIVIL"];

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await announcementService.getAll();
      setAnnouncements(data || []);
      setLoading(false);
    }
    loadData();
  }, []);

  // Body scroll lock on modal
  useEffect(() => {
    if (selected) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selected]);

  // Filtering announcements
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((item) => {
      const title = item.title || "";
      const desc = item.description || item.content || "";
      const author = item.authorName || item.author || "";
      const cat = item.category || "General";
      const deptName = item.departmentId?.code || item.departmentId?.name || item.department || "All Departments";

      const matchSearch =
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        author.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        selectedCategory === "ALL" ||
        cat.toUpperCase().includes(selectedCategory) ||
        (selectedCategory === "EVENTS" && cat.toUpperCase().includes("EVENT"));

      const matchDept =
        selectedDept === "All" ||
        deptName.toLowerCase().includes(selectedDept.toLowerCase()) ||
        deptName === "All Departments";

      return matchSearch && matchCategory && matchDept;
    });
  }, [announcements, searchQuery, selectedCategory, selectedDept]);

  // Extract featured announcement (pinned or first item)
  const featuredItem = useMemo(() => {
    if (filteredAnnouncements.length === 0) return null;
    const pinned = filteredAnnouncements.find((item) => item.isPinned || item.pinned || item.priority === "urgent");
    return pinned || filteredAnnouncements[0];
  }, [filteredAnnouncements]);

  // Remaining grid items
  const gridItems = useMemo(() => {
    if (!featuredItem) return filteredAnnouncements;
    return filteredAnnouncements.filter((item) => (item._id || item.id) !== (featuredItem._id || featuredItem.id));
  }, [filteredAnnouncements, featuredItem]);

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#0F172A] font-sans antialiased pb-24 relative overflow-hidden">
      {/* Dynamic CSS Styling for Watermark & Micro-interactions */}
      <style>{`
        .vcet-background {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: clamp(120px, 18vw, 280px);
          font-weight: 900;
          letter-spacing: 0.2em;
          color: rgba(255, 255, 255, 0.055);
          white-space: nowrap;
          pointer-events: none;
          user-select: none;
          z-index: 0;
        }

        .hero-gradient {
          background: linear-gradient(135deg, #071E3D 0%, #0A3563 50%, #0062A8 100%);
        }

        .vcet-title {
          position: relative;
          z-index: 3;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 18px;
          margin-bottom: 16px;
        }

        .vcet-title strong {
          font-size: 28px;
          font-weight: 900;
          letter-spacing: 6px;
          color: white;
        }

        .vcet-title span {
          font-size: 22px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.7);
        }

        .vcet-marquee-strip {
          position: relative;
          overflow: hidden;
          background: #ffffff;
          border-top: 1px solid #E2E8F0;
          border-bottom: 1px solid #E2E8F0;
          height: 48px;
          display: flex;
          align-items: center;
          white-space: nowrap;
          user-select: none;
          pointer-events: none;
        }

        .vcet-marquee-content {
          display: flex;
          align-items: center;
          gap: 32px;
          animation: vcetMarqueeScroll 20s linear infinite;
          will-change: transform;
          width: max-content;
        }

        .vcet-marquee-text {
          font-size: 26px;
          font-weight: 900;
          letter-spacing: 0.25em;
          color: rgba(0, 98, 168, 0.12);
          line-height: 1;
          font-family: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
          text-transform: uppercase;
        }

        .vcet-marquee-bullet {
          font-size: 14px;
          color: rgba(0, 98, 168, 0.25);
          line-height: 1;
        }

        @keyframes vcetMarqueeScroll {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0%);
          }
        }
      `}</style>

      {/* 1. HERO SECTION */}
      <section className="hero-gradient text-white py-14 sm:py-18 lg:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden shadow-md text-center">
        {/* Subtle Stationary Background Watermark */}
        <div className="vcet-background" aria-hidden="true">
          VCET
        </div>

        {/* Content Container */}
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center">
          {/* Centered Stationary Bold VCET Header */}
          <div className="vcet-title">
            <span>↔</span>
            <strong>VCET</strong>
            <span>↔</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Institutional Announcements
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed font-normal mt-3 max-w-xl">
            Stay updated with placements, examinations, hackathons, events and academic notifications.
          </p>

          {/* Student Portal Button */}
          <div className="mt-6">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer"
            >
              <span>Student Portal</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* VCET MARQUEE STRIP (Under Institutional Announcements, Above Search Bar) */}
      <div className="vcet-marquee-strip" aria-hidden="true">
        <div className="vcet-marquee-content">
          {Array.from({ length: 20 }).map((_, idx) => (
            <React.Fragment key={idx}>
              <span className="vcet-marquee-text">VCET</span>
              <span className="vcet-marquee-bullet">•</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 2. PROFESSIONAL EXPLORE SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 relative z-20">
        {/* Explore Heading */}
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            Explore Announcements
          </h2>
          <p className="text-sm text-[#64748B] mt-1 font-medium">
            Discover the latest updates from across the institution.
          </p>
        </div>

        {/* Search + Department Filter Box */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search announcements, events, placements..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0062A8]/20 focus:border-[#0062A8] bg-[#F7F9FC] focus:bg-white transition-all font-medium"
              />
            </div>

            {/* Department Filter Dropdown */}
            <div className="w-full sm:w-auto shrink-0 relative">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full sm:w-auto appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-semibold text-[#0F172A] bg-[#F7F9FC] hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#0062A8]/20 cursor-pointer transition-all"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept === "All" ? "Department: All" : `Dept: ${dept}`}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
            </div>
          </div>

          {/* Category Navigation Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-slate-100 no-scrollbar">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase transition-all whitespace-nowrap cursor-pointer border ${
                    active
                      ? "bg-[#0062A8] text-white border-[#0062A8] shadow-xs"
                      : "bg-[#F7F9FC] text-[#64748B] border-[#E2E8F0] hover:bg-slate-100 hover:text-[#0F172A]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. ANNOUNCEMENT GRID & FEATURED SECTION */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 relative z-10 space-y-8">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#0062A8] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium text-[#64748B]">Fetching VCET announcements...</p>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center shadow-xs">
            <AlertCircle size={40} className="text-amber-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#0F172A]">No matching announcements</h3>
            <p className="text-sm text-[#64748B] mt-1">
              Try adjusting your search criteria or resetting filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("ALL");
                setSelectedDept("All");
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-[#0062A8] text-white text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-[#004f87] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* FEATURED ANNOUNCEMENT (Visual Weight 1) */}
            {featuredItem && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-[#0062A8]" />
                  <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    Featured Announcement
                  </span>
                </div>
                <FeaturedCard item={featuredItem} onClick={() => setSelected(featuredItem)} />
              </div>
            )}

            {/* ANNOUNCEMENT GRID (Visual Weight 2) */}
            {gridItems.length > 0 && (
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                  Recent Announcements ({gridItems.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {gridItems.map((ann) => (
                    <StandardCard
                      key={ann._id || ann.id}
                      item={ann}
                      onClick={() => setSelected(ann)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* 4. ANNOUNCEMENT DETAILS MODAL */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-[#E2E8F0] animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <AnnouncementModal item={selected} onClose={() => setSelected(null)} />
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* FEATURED ANNOUNCEMENT CARD (Visual Weight 1)                               */
/* -------------------------------------------------------------------------- */
function FeaturedCard({ item, onClick }) {
  const catStyle = getCategoryStyle(item.category);
  const Icon = catStyle.icon;
  const dateStr = item.publishDate
    ? new Date(item.publishDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase()
    : item.date || "ACTIVE";
  const deptStr = item.departmentId?.code || item.departmentId?.name || item.department || "ALL DEPARTMENTS";

  return (
    <div
      onClick={onClick}
      className="group relative bg-white rounded-2xl border border-blue-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 p-6 sm:p-7 cursor-pointer overflow-hidden flex flex-col justify-between border-l-4 border-l-[#0062A8]"
    >
      {/* Top Meta Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-100 text-[#0062A8]">
            FEATURED • {item.category || "CIRCULAR"}
          </span>
          {item.isPinned && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
              <Pin size={10} /> PINNED
            </span>
          )}
        </div>
        <span className="text-xs font-semibold text-[#64748B]">
          {dateStr} • {deptStr}
        </span>
      </div>

      {/* Main Title & Description */}
      <div className="space-y-2 mb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-[#0F172A] group-hover:text-[#0062A8] transition-colors leading-snug">
          {item.title}
        </h3>
        <p className="text-sm text-[#64748B] line-clamp-3 leading-relaxed font-normal">
          {item.description || item.content}
        </p>
      </div>

      {/* Bottom Action Row */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <span className="text-xs font-medium text-slate-500">
          Issued by: <strong className="text-slate-700">{item.authorName || item.author || "VCET Admin"}</strong>
        </span>
        <button className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0062A8] group-hover:translate-x-0.5 transition-transform">
          <span>View Details</span>
          <ArrowRight size={14} className="group-hover:hidden" />
          <ArrowUpRight size={14} className="hidden group-hover:block" />
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* STANDARD ANNOUNCEMENT CARD (Visual Weight 2)                               */
/* -------------------------------------------------------------------------- */
function StandardCard({ item, onClick }) {
  const catStyle = getCategoryStyle(item.category);
  const Icon = catStyle.icon;
  const dateStr = item.publishDate
    ? new Date(item.publishDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase()
    : item.date || "ACTIVE";
  const deptStr = item.departmentId?.code || item.departmentId?.name || item.department || "ALL DEPT";

  return (
    <div
      onClick={onClick}
      className="group relative bg-white rounded-xl border border-[#E2E8F0] shadow-xs hover:shadow-lg hover:-translate-y-1 hover:border-blue-300/80 transition-all duration-200 p-5 flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Category Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider border ${catStyle.badgeBg}`}>
            <Icon size={12} />
            {catStyle.label}
          </span>
          {item.deadline && (
            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
              Due: {item.deadline}
            </span>
          )}
        </div>

        {/* Title */}
        <h4 className="text-base font-bold text-[#0F172A] group-hover:text-[#0062A8] transition-colors leading-snug mb-2 line-clamp-2">
          {item.title}
        </h4>

        {/* Short Description */}
        <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed mb-4">
          {item.description || item.content}
        </p>
      </div>

      <div>
        {/* Metadata & Action Divider */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-[#64748B]">
          <span className="font-semibold text-[11px]">
            {dateStr} • {deptStr}
          </span>
          <span className="inline-flex items-center gap-1 font-bold text-[#0062A8]">
            <span>View Details</span>
            <ArrowRight size={13} className="group-hover:hidden transition-transform" />
            <ArrowUpRight size={13} className="hidden group-hover:block transition-transform" />
          </span>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ANNOUNCEMENT DETAIL MODAL                                                  */
/* -------------------------------------------------------------------------- */
function AnnouncementModal({ item, onClose }) {
  const catStyle = getCategoryStyle(item.category);
  const Icon = catStyle.icon;
  const dateStr = item.publishDate
    ? new Date(item.publishDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : item.date || "Active";
  const deptStr = item.departmentId?.name || item.departmentId?.code || item.department || "All Departments";

  return (
    <>
      {/* Modal Header */}
      <div className="relative bg-slate-900 text-white p-6 flex flex-col justify-end shrink-0">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold border ${catStyle.badgeBg}`}>
            <Icon size={12} />
            {catStyle.label}
          </span>
          {item.priority && (
            <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-white/10 text-slate-300">
              {item.priority} priority
            </span>
          )}
        </div>

        <h2 className="text-xl font-bold leading-tight drop-shadow-xs">{item.title}</h2>
      </div>

      {/* Modal Body */}
      <div className="p-6 overflow-y-auto space-y-4">
        {/* Info Tags */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B] pb-3 border-b border-slate-100">
          <span className="inline-flex items-center gap-1.5 font-semibold text-[#0F172A] bg-slate-100 px-2.5 py-1 rounded-md">
            <Building2 size={13} /> {deptStr}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar size={13} /> {dateStr}
          </span>
          {item.deadline && (
            <span className="inline-flex items-center gap-1 text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded">
              Deadline: {item.deadline}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal">
          {item.content || item.description || "No further details available for this announcement."}
        </div>

        {/* Issuer info */}
        <div className="text-xs text-[#64748B] pt-2">
          Issued by: <strong className="text-[#0F172A]">{item.authorName || item.author || "Academic Office"}</strong>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-semibold text-[#0F172A] hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Close
          </button>
          {item.linkUrl && item.linkUrl !== "#" && (
            <a
              href={item.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0062A8] text-white text-sm font-semibold hover:bg-[#004f87] transition-colors cursor-pointer"
            >
              <span>{item.linkText || "View Portal"}</span>
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    </>
  );
}
