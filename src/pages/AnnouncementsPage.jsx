import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Building2,
  Calendar,
  ExternalLink,
  X,
  Briefcase,
  Trophy,
  GraduationCap,
  FileText,
  PartyPopper,
  Megaphone,
  Pin,
  ArrowRight,
  ChevronDown,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Flame,
  CalendarDays,
} from "lucide-react";
import { announcementService } from "../services/announcementService";
import { API_BASE_URL } from "../services/api";
import AnnouncementMarquee from "../components/AnnouncementMarquee";

/**
 * Resolve an announcement's poster image URL.
 * - data: URIs and absolute http(s) URLs are used as-is.
 * - App-relative /uploads/... paths are prefixed with the backend origin,
 *   since uploads are served by the backend (not the Vite dev server).
 */
function resolvePoster(item) {
  const raw = item.imageUrl || item.image || "";
  if (!raw) return "";
  if (raw.startsWith("data:") || /^https?:\/\//i.test(raw)) return raw;
  const origin = API_BASE_URL.replace(/\/api\/?$/, "");
  return `${origin}${raw.startsWith("/") ? raw : `/uploads/announcements/${raw}`}`;
}

/** Comparable timestamp so announcements sort newest-first (and pinned first). */
function announcementTimestamp(item) {
  const raw = item.publishDate || item.createdAt || item.date;
  if (!raw) return 0;
  const t = new Date(raw).getTime();
  return Number.isNaN(t) ? 0 : t;
}

/** Humanised date label, e.g. "SEP 10, 2026". */
function formatDate(item) {
  const raw = item.publishDate || item.createdAt || item.date;
  if (!raw) return "RECENT";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "RECENT";
  return d
    .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    .toUpperCase();
}

function todayString() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** The actual event date (YYYY-MM-DD) — eventDate, else expiryDate, else deadline. */
function eventDateString(item) {
  const raw = item.eventDate || item.expiryDate || item.deadline || "";
  return raw ? String(raw).slice(0, 10) : "";
}

function isPastEvent(item) {
  const ev = eventDateString(item);
  if (!ev) return false; // no date → ongoing
  return ev < todayString();
}

function formatDateString(raw) {
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw).toUpperCase();
  return d
    .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    .toUpperCase();
}

function deptLabel(item) {
  return item.departmentId?.code || item.departmentId?.name || item.department || "ALL DEPARTMENTS";
}

/** Resolve the announcement's issuer name (populated createdBy → legacy author fields). */
function issuerName(item) {
  return item.createdBy?.name || item.authorName || item.author || "";
}

/** Resolve the issuer's department when populated. */
function issuerDepartment(item) {
  const dept = item.createdBy?.departmentId;
  return dept?.name || dept?.code || "";
}

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

  const [slideIndex, setSlideIndex] = useState(0);
  const [paused, setPaused] = useState(false);

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
      const author = issuerName(item);
      const cat = item.category || "General";
      const deptName = deptLabel(item);

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

  // Sort: pinned first, then newest-first. The newest announcement
  // automatically becomes the FIRST slide of the Recent Updates carousel.
  const sortedAnnouncements = useMemo(() => {
    return [...filteredAnnouncements].sort((a, b) => {
      const aPin = a.isPinned || a.pinned ? 1 : 0;
      const bPin = b.isPinned || b.pinned ? 1 : 0;
      if (aPin !== bPin) return bPin - aPin;
      return announcementTimestamp(b) - announcementTimestamp(a);
    });
  }, [filteredAnnouncements]);

  // Top 3 newest go into the slideshow — everything older is a "Past Update".
  const recentSlides = sortedAnnouncements.slice(0, 3);
  const pastUpdates = sortedAnnouncements.slice(3);

  // Keep slide index valid when the list shrinks
  useEffect(() => {
    if (recentSlides.length > 0 && slideIndex >= recentSlides.length) {
      setSlideIndex(0);
    }
  }, [recentSlides.length, slideIndex]);

  // Autoplay every 6s, paused on hover
  useEffect(() => {
    if (recentSlides.length <= 1 || paused) return;
    const id = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % recentSlides.length);
    }, 6000);
    return () => clearInterval(id);
  }, [recentSlides.length, paused]);

  const goPrev = () =>
    setSlideIndex((prev) => (prev - 1 + recentSlides.length) % recentSlides.length);
  const goNext = () => setSlideIndex((prev) => (prev + 1) % recentSlides.length);

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#0F172A] font-sans antialiased pb-24 relative overflow-hidden">
      {/* Dynamic CSS Styling for Watermark & Micro-interactions */}
      <style>{`
        .hero-gradient {
          background: linear-gradient(135deg, #071E3D 0%, #0A3563 50%, #0062A8 100%);
        }
        .vcet-slide-in {
          animation: vcetSlideIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes vcetSlideIn {
          from { opacity: 0; transform: translateX(14px); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>

      {/* 1. HERO SECTION */}
      <section className="hero-gradient text-white py-14 sm:py-18 lg:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden shadow-md text-center">
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[11px] font-bold uppercase tracking-widest mb-4 backdrop-blur-sm">
            <Flame size={13} className="text-amber-300" />
            <span>Institutional Circulars & Updates</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Institutional Announcements
          </h1>

          <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed font-normal mt-3 max-w-xl">
            Stay updated with placements, examinations, hackathons, events and academic notifications.
          </p>

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

      {/* VCET Watermark Marquee below the Hero */}
      <AnnouncementMarquee />

      {/* 2. PROFESSIONAL EXPLORE SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 relative z-20">
        <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
              Explore Announcements
            </h2>
            <p className="text-sm text-[#64748B] mt-1 font-medium">
              Discover the latest updates from across the institution.
            </p>
          </div>
          {!loading && announcements.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200">
                <Megaphone size={12} className="text-[#0062A8]" />
                {announcements.length} total updates
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-200">
                <Flame size={12} />
                {recentSlides.length} recent
              </span>
            </div>
          )}
        </div>

        {/* Search + Department Filter Box */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
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

      {/* 3. RECENT UPDATES CAROUSEL + PAST UPDATES GRID */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 relative z-10 space-y-10">
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
            {/* ---- RECENT UPDATES (CAROUSEL) ---- */}
            {recentSlides.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-[11px] font-black uppercase tracking-wider">
                    <Flame size={13} />
                    Recent Updates
                  </span>
                  <span className="text-xs font-medium text-[#64748B]">
                    Newest circular goes first — hover to pause, use the arrows or dots to navigate
                  </span>
                </div>

                <RecentCarousel
                  slides={recentSlides}
                  activeIndex={slideIndex}
                  paused={paused}
                  onSelect={(i) => setSlideIndex(i)}
                  onPrev={goPrev}
                  onNext={goNext}
                  onPause={() => setPaused(true)}
                  onResume={() => setPaused(false)}
                  onViewMore={(item) => setSelected(item)}
                />
              </section>
            )}

            {/* ---- PAST UPDATES (GRID) ---- */}
            {pastUpdates.length > 0 && (
              <section className="space-y-3 pt-1">
                <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
                  <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    Past Updates ({pastUpdates.length})
                  </h3>
                  <div className="flex-1 h-px bg-slate-200/70" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {pastUpdates.map((ann) => (
                    <PastUpdateCard
                      key={ann._id || ann.id}
                      item={ann}
                      onClick={() => setSelected(ann)}
                    />
                  ))}
                </div>
              </section>
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
/* RECENT UPDATES CAROUSEL                                                     */
/* -------------------------------------------------------------------------- */
function RecentCarousel({
  slides,
  activeIndex,
  paused,
  onSelect,
  onPrev,
  onNext,
  onPause,
  onResume,
  onViewMore,
}) {
  const safeIndex = slides.length ? activeIndex % slides.length : 0;
  const item = slides[safeIndex];
  const catStyle = getCategoryStyle(item.category);
  const Icon = catStyle.icon;
  const poster = resolvePoster(item);
  const multiple = slides.length > 1;

  return (
    <div
      className="relative rounded-3xl overflow-hidden bg-white border border-[#E2E8F0] shadow-sm hover:shadow-lg transition-shadow"
      onMouseEnter={onPause}
      onMouseLeave={onResume}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] min-h-[300px]">
        {/* Poster / Fallback Visual */}
        <div className="relative min-h-[210px] lg:min-h-[300px] overflow-hidden bg-[#0A3563]">
          {poster ? (
            <img
              src={poster}
              alt={`${item.title} poster`}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 hero-gradient flex items-center justify-center">
              <Icon size={72} strokeWidth={1.25} className="text-white/25" />
              <span className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-widest text-blue-100">
                {catStyle.label}
              </span>
            </div>
          )}
          {/* Soft gradient into text pane */}
          <div className="absolute inset-0 lg:bg-gradient-to-r lg:from-transparent lg:to-black/15 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>

        {/* Text Pane */}
        <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider border ${catStyle.badgeBg}`}
            >
              <Icon size={12} />
              {catStyle.label}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-black uppercase tracking-wider">
              <Flame size={11} />
              Recent Update
            </span>
            {item.isPinned && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                <Pin size={10} /> PINNED
              </span>
            )}
          </div>

          <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#0F172A] leading-tight mb-3 line-clamp-2">
            {item.title}
          </h3>

          <p className="text-sm text-[#64748B] leading-relaxed line-clamp-3 mb-5">
            {item.description || item.content || "No further details available."}
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#64748B] mb-5">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#0F172A] bg-slate-100 px-2.5 py-1 rounded-md">
              <Building2 size={13} /> {deptLabel(item)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={13} className="text-[#0062A8]" />
              {formatDate(item)}
            </span>
            {item.deadline && (
              <span className="inline-flex items-center gap-1 text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded">
                Deadline: {item.deadline}
              </span>
            )}
            {paused && multiple && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                ● Paused
              </span>
            )}
          </div>

          <button
            onClick={() => onViewMore(item)}
            className="inline-flex items-center gap-2 self-start px-5 py-2.5 rounded-xl bg-[#0062A8] hover:bg-[#0B4A8F] text-white font-bold text-xs shadow-md transition-all cursor-pointer group/vm"
          >
            <span>View More</span>
            <ArrowRight size={14} className="group-hover/vm:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Arrows */}
      {multiple && (
        <>
          <button
            onClick={onPrev}
            title="Previous update"
            aria-label="Previous update"
            className="absolute top-4 right-16 w-9 h-9 rounded-full bg-white/90 hover:bg-white border border-slate-200 text-slate-700 hover:text-[#0062A8] shadow-md flex items-center justify-center transition-all cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={onNext}
            title="Next update"
            aria-label="Next update"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 hover:bg-white border border-slate-200 text-slate-700 hover:text-[#0062A8] shadow-md flex items-center justify-center transition-all cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* Dots */}
      {multiple && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide._id || slide.id || i}
              onClick={() => onSelect(i)}
              aria-label={`Go to update ${i + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                i === safeIndex ? "w-8 bg-[#0062A8]" : "w-2.5 bg-slate-300 hover:bg-[#0062A8]/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* PAST UPDATE CARD (Grid)                                                     */
/* -------------------------------------------------------------------------- */
function PastUpdateCard({ item, onClick }) {
  const catStyle = getCategoryStyle(item.category);
  const Icon = catStyle.icon;
  const poster = resolvePoster(item);

  return (
    <div
      onClick={onClick}
      className="group relative bg-white rounded-2xl border border-[#E2E8F0] shadow-xs hover:shadow-lg hover:-translate-y-1 hover:border-blue-300/80 transition-all duration-200 overflow-hidden flex flex-col cursor-pointer"
    >
      {/* Poster / Visual */}
      <div className="relative h-36 overflow-hidden bg-[#0A3563]">
        {poster ? (
          <img
            src={poster}
            alt={`${item.title} poster`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full hero-gradient flex items-center justify-center">
            <Icon size={44} strokeWidth={1.25} className="text-white/25" />
          </div>
        )}

        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black tracking-wider border shadow-sm ${catStyle.badgeBg}`}
          >
            <Icon size={10} />
            {catStyle.label}
          </span>
          {item.isPinned && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200 shadow-sm">
              <Pin size={9} /> PIN
            </span>
          )}
        </div>

        {item.deadline && (
          <span className="absolute bottom-2 left-2 text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
            Due: {item.deadline}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#64748B] mb-1.5">
          <Calendar size={12} className="text-[#0062A8]" />
          <span>{formatDate(item)}</span>
          <span className="text-slate-300">•</span>
          <span className="truncate">{deptLabel(item)}</span>
        </div>

        <h4 className="text-sm font-bold text-[#0F172A] group-hover:text-[#0062A8] transition-colors leading-snug mb-1.5 line-clamp-2">
          {item.title}
        </h4>

        <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed mb-3 flex-1">
          {item.description || item.content}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-[10px] font-semibold text-slate-400 truncate max-w-[55%]">
            {item.authorName || item.author || "VCET Admin"}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0062A8]">
            View More
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ANNOUNCEMENT DETAIL MODAL                                                   */
/* -------------------------------------------------------------------------- */
function AnnouncementModal({ item, onClose }) {
  const catStyle = getCategoryStyle(item.category);
  const Icon = catStyle.icon;
  const dateStr = formatDate(item).toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  const deptStr = item.departmentId?.name || item.departmentId?.code || item.department || "All Departments";
  const poster = resolvePoster(item);

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
        {/* Poster Image */}
        {poster && (
          <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
            <img
              src={poster}
              alt={`${item.title} poster`}
              className="w-full max-h-[55vh] object-contain bg-slate-50"
            />
          </div>
        )}

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
          {eventDateString(item) && (
            <span className="inline-flex items-center gap-1 text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded">
              {isPastEvent(item) ? "Ended:" : "Ends:"} {formatDateString(eventDateString(item))}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal">
          {item.content || item.description || "No further details available for this announcement."}
        </div>

        {/* Issuer info */}
        <div className="text-xs text-[#64748B] pt-2 space-y-1">
          <div>
            Issued by: <strong className="text-[#0F172A]">{issuerName(item) || "Academic Office"}</strong>
          </div>
          {issuerDepartment(item) && (
            <div>
              Department: <strong className="text-[#0F172A]">{issuerDepartment(item)}</strong>
            </div>
          )}
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