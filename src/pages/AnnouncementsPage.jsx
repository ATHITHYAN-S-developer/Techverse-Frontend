import React, { useState, useEffect, useMemo } from "react";
import {
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
  AlertCircle,
  Flame,
  CalendarDays,
  UserRound,
} from "lucide-react";
import { announcementService } from "../services/announcementService";
import { API_BASE_URL } from "../services/api";

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

/** Comparable timestamp for upload-order sorting. Never rendered to the user. */
function announcementTimestamp(item) {
  // createdAt first: the database stamps it at insert time, so a brand-new
  // upload always outranks older posts regardless of its publish date.
  const raw = item.createdAt || item.publishDate || item.date;
  if (!raw) return 0;
  const t = new Date(raw).getTime();
  return Number.isNaN(t) ? 0 : t;
}

/**
 * Newest-upload-first comparator. A batch insert stamps every document with the
 * same createdAt millisecond, so _id (which increases with insertion order)
 * breaks the tie and keeps the order stable across re-seeds.
 */
function compareUploadOrder(a, b) {
  const delta = announcementTimestamp(b) - announcementTimestamp(a);
  if (delta !== 0) return delta;
  return String(b._id || "").localeCompare(String(a._id || ""));
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

/** True once an event's date has passed — such posts are retired from the page. */
function isPastEvent(item, today = todayString()) {
  const ev = eventDateString(item);
  if (!ev) return false; // no date → ongoing
  return ev < today;
}

/** "current" (today / no date = ongoing) or "upcoming" (event date is after today). */
function eventStatus(item, today = todayString()) {
  const ev = eventDateString(item);
  if (!ev || ev === today) return "current";
  return "upcoming";
}

function formatDateString(raw) {
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw).toUpperCase();
  return d
    .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    .toUpperCase();
}

function formatShortDate(raw) {
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw).toUpperCase();
  return d
    .toLocaleDateString("en-US", { month: "short", day: "numeric" })
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

const AUTO_PLAY_INTERVAL = 3000;

/** How many of the most recently uploaded events run in the fullscreen hero; the rest list below. */
const HERO_SLIDE_COUNT = 5;

/**
 * Announcement categories that belong to the Placement page. Placement
 * circulars are listed there only and must never surface here.
 */
function isPlacementCategory(cat) {
  return String(cat || "").toLowerCase().includes("placement");
}

/**
 * True when an announcement is withheld from this page. Driven by category
 * rather than by title, so a newly published placement drive is routed away
 * automatically instead of needing to be listed here by hand.
 */
function isHiddenAnnouncement(item) {
  return isPlacementCategory(item?.category);
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const [slideIndex, setSlideIndex] = useState(0);

  // Today's date, re-read every minute. Drives auto-retirement so a post drops
  // off the page the moment its event date passes, without a manual reload.
  const [today, setToday] = useState(todayString);

  useEffect(() => {
    const id = setInterval(() => setToday(todayString()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await announcementService.getAll();
        setAnnouncements((data || []).filter((a) => !isHiddenAnnouncement(a)));
      } catch (err) {
        console.error("Failed to load announcements data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Freeze the page behind the modal. Without this, scrolling past the end of
  // the dialog chains through and scrolls the main page underneath. The
  // scrollbar width is replaced with padding so the layout does not jump when
  // the scrollbar disappears.
  useEffect(() => {
    if (!selected) return;

    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
    };
  }, [selected]);

  // Auto-retire expired posts — anything whose event date has already passed is
  // removed from this page entirely rather than lingering in the list below.
  const liveAnnouncements = useMemo(
    () => announcements.filter((a) => !isPastEvent(a, today)),
    [announcements, today]
  );

  // Upload order: most recently posted first, so the newest uploads lead both
  // the slideshow and the list below it.
  const orderedByUpload = useMemo(() => {
    return [...liveAnnouncements].sort(compareUploadOrder);
  }, [liveAnnouncements]);

  // Fullscreen slideshow: the most recently uploaded events.
  const recentSlides = useMemo(
    () => orderedByUpload.slice(0, HERO_SLIDE_COUNT),
    [orderedByUpload]
  );

  // Everything beyond that is listed under the hero, reached by scrolling.
  const pastUpdates = useMemo(
    () => orderedByUpload.slice(HERO_SLIDE_COUNT),
    [orderedByUpload]
  );

  // Keep slide index valid when the list shrinks
  useEffect(() => {
    if (recentSlides.length > 0 && slideIndex >= recentSlides.length) {
      setSlideIndex(0);
    }
  }, [recentSlides.length, slideIndex]);

  // Autoplay every 3s — fully automatic (no manual navigation, no hover-pause).
  useEffect(() => {
    if (recentSlides.length <= 1) return;
    const id = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % recentSlides.length);
    }, AUTO_PLAY_INTERVAL);
    return () => clearInterval(id);
  }, [recentSlides.length]);

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#0F172A] font-sans antialiased relative overflow-hidden">
      {/* Dynamic CSS Styling for Watermark & Micro-interactions */}
      <style>{`
        .hero-gradient {
          background: linear-gradient(135deg, #071E3D 0%, #0A3563 50%, #0062A8 100%);
        }
        /* Fullscreen hero: staggered copy entrance + slow poster push-in. */
        .vcet-hero-copy {
          animation: vcetHeroCopy 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes vcetHeroCopy {
          from { opacity: 0; transform: translateY(34px); }
          to   { opacity: 1; transform: none; }
        }
        .vcet-hero-zoom {
          animation: vcetHeroZoom 9s ease-out both;
        }
        @keyframes vcetHeroZoom {
          from { transform: scale(1.03); }
          to   { transform: scale(1.15); }
        }
        @media (prefers-reduced-motion: reduce) {
          .vcet-hero-copy, .vcet-hero-zoom { animation: none; }
        }
      `}</style>

      {loading ? (
        <div className="h-[calc(100vh-64px)] supports-[height:100svh]:h-[calc(100svh-64px)] flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-[#0062A8] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-[#64748B]">Fetching VCET announcements...</p>
        </div>
      ) : liveAnnouncements.length === 0 ? (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 pb-24">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center shadow-xs">
            <AlertCircle size={40} className="text-amber-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#0F172A]">No announcements yet</h3>
            <p className="text-sm text-[#64748B] mt-1">
              Check back soon for the latest updates from across the institution.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* ---- FULLSCREEN CURRENT & UPCOMING EVENTS (EDGE-TO-EDGE HERO) ---- */}
          {recentSlides.length > 0 && (
            <FullscreenHero
              slides={recentSlides}
              activeIndex={slideIndex}
              totalCount={liveAnnouncements.length}
              onViewMore={(item) => setSelected(item)}
            />
          )}

          {/* ---- PAST EVENTS / ARCHIVE GRID ---- */}
          {pastUpdates.length > 0 && (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 pb-24">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {pastUpdates.map((ann) => (
                  <PastUpdateCard
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
/* FULLSCREEN HERO — Current & Upcoming Events                                  */
/* Edge-to-edge, viewport-filling slideshow: poster as full-bleed background   */
/* with the copy overlaid on a legibility scrim. Slides cross-fade.            */
/* -------------------------------------------------------------------------- */
function FullscreenHero({ slides, activeIndex, totalCount, onViewMore }) {
  const safeIndex = slides.length ? activeIndex % slides.length : 0;
  const multiple = slides.length > 1;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Current and upcoming events"
      className="relative w-full h-[calc(100vh-64px)] supports-[height:100svh]:h-[calc(100svh-64px)] overflow-hidden bg-[#071E3D]"
    >
      {slides.map((item, i) => (
        <HeroSlide
          key={item._id || item.id || i}
          item={item}
          active={i === safeIndex}
          onViewMore={onViewMore}
        />
      ))}

      {/* Total events on record — current, upcoming and past combined */}
      <div className="absolute top-6 left-4 sm:left-6 lg:left-8 z-20 select-none">
        <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/90 bg-black/30 backdrop-blur-md border border-white/20 rounded-full px-3.5 py-1.5">
          <Megaphone size={13} />
          {totalCount} {totalCount === 1 ? "event" : "events"} total
        </span>
      </div>

      {/* Slide dots (decorative — the hero autoplays) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 pointer-events-none select-none">
        {slides.map((slide, i) => (
          <span
            key={slide._id || slide.id || i}
            aria-hidden="true"
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === safeIndex ? "w-10 bg-white" : "w-4 bg-white/40"
            }`}
          />
        ))}
        {multiple && (
          <span className="ml-2 text-[10px] font-bold tracking-widest text-white/70 tabular-nums">
            {String(safeIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </span>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* HERO SLIDE                                                                    */
/* -------------------------------------------------------------------------- */
function HeroSlide({ item, active, onViewMore }) {
  const catStyle = getCategoryStyle(item.category);
  const Icon = catStyle.icon;
  const poster = resolvePoster(item);
  const upcoming = eventStatus(item) === "upcoming";

  return (
    <article
      aria-hidden={!active}
      className={`absolute inset-0 transition-opacity duration-[1200ms] ease-out ${
        active ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
      }`}
    >
      {/* Full-bleed background */}
      {poster ? (
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover ${active ? "vcet-hero-zoom" : ""}`}
        />
      ) : (
        <div className="absolute inset-0 hero-gradient flex items-center justify-center">
          <Icon size={220} strokeWidth={0.5} className="text-white/[0.07]" />
        </div>
      )}

      {/* Legibility scrims — vertical for the copy, horizontal for the left rail */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/15 to-transparent" />

      {/* Overlaid copy */}
      <div className="absolute inset-0 flex items-end">
        <div
          className={`w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-24 ${
            active ? "vcet-hero-copy" : ""
          }`}
        >
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500 text-white text-[11px] font-black uppercase tracking-wider">
              <Flame size={13} />
              Current &amp; Upcoming Events
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider border backdrop-blur-sm ${catStyle.badgeBg}`}
            >
              <Icon size={12} />
              {catStyle.label}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider backdrop-blur-sm border ${
                upcoming
                  ? "bg-blue-500/25 text-white border-blue-300/40"
                  : "bg-rose-500/25 text-white border-rose-300/40"
              }`}
            >
              {upcoming ? <CalendarDays size={11} /> : <Flame size={11} />}
              {upcoming ? "Upcoming Event" : "Current Event"}
            </span>
            {item.isPinned && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-amber-950 border border-amber-300">
                <Pin size={10} /> PINNED
              </span>
            )}
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-[1.06] tracking-tight max-w-4xl drop-shadow-[0_2px_18px_rgba(0,0,0,0.55)]">
            {item.title}
          </h2>

          <p className="mt-5 text-sm sm:text-base text-white/80 leading-relaxed max-w-2xl line-clamp-2 sm:line-clamp-3">
            {item.description || item.content || "No further details available."}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-white/80">
            <span className="inline-flex items-center gap-1.5 font-semibold text-white bg-white/10 border border-white/15 backdrop-blur-sm px-2.5 py-1 rounded-md">
              <Building2 size={13} /> {deptLabel(item)}
            </span>
            {issuerName(item) && (
              <span className="inline-flex items-center gap-1.5 font-semibold text-white bg-white/10 border border-white/15 backdrop-blur-sm px-2.5 py-1 rounded-md">
                <UserRound size={13} /> Issued by {issuerName(item)}
              </span>
            )}
            {eventDateString(item) && (
              <span className="inline-flex items-center gap-1.5 font-bold text-white bg-white/10 border border-white/15 backdrop-blur-sm px-2.5 py-1 rounded-md">
                <CalendarDays size={13} />
                Event: {formatDateString(eventDateString(item))}
              </span>
            )}
          </div>

          <button
            onClick={() => onViewMore(item)}
            className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#0F172A] hover:bg-white/90 font-bold text-xs sm:text-sm shadow-lg transition-all cursor-pointer group/vm"
          >
            <span>View More</span>
            <ArrowRight size={16} className="transition-transform group-hover/vm:translate-x-1" />
          </button>
        </div>
      </div>
    </article>
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

        {eventDateString(item) && (
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-900/80 text-white text-[9px] font-black uppercase tracking-wider shadow-sm">
            <Calendar size={9} /> {isPastEvent(item) ? "Ended" : "Ends by"} {formatShortDate(eventDateString(item))}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#64748B] mb-1.5">
          <Building2 size={12} className="text-[#0062A8]" />
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
            {issuerName(item)}
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
        <div className="p-6 overflow-y-auto overscroll-contain space-y-4">
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
          {eventDateString(item) && (
            <span className="inline-flex items-center gap-1 text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded">
              {isPastEvent(item) ? "Ended:" : "Ends by:"} {formatDateString(eventDateString(item))}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal">
          {item.content || item.description || "No further details available for this announcement."}
        </div>

        {/* Issuer info */}
        {issuerName(item) && (
          <div className="text-xs text-[#64748B] pt-2 space-y-1">
            <div>
              Issued by: <strong className="text-[#0F172A]">{issuerName(item)}</strong>
            </div>
            {issuerDepartment(item) && (
              <div>
                Department: <strong className="text-[#0F172A]">{issuerDepartment(item)}</strong>
              </div>
            )}
          </div>
        )}

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