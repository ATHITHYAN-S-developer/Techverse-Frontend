import React, { useState, useEffect, useMemo } from "react";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
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

/** Short status line used on the bento cards — "HAPPENING TODAY" / "ENDS BY SEP 30". */
function relativeLabel(item) {
  const ev = eventDateString(item);
  if (!ev) return "ONGOING";
  if (ev === todayString()) return "HAPPENING TODAY";
  if (ev < todayString()) return "ENDED";
  return `ENDS BY ${formatShortDate(ev)}`;
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
        // Request the full set explicitly. The endpoint paginates at 15 by
        // default, which silently truncated the feed and left the last few
        // uploads off the page entirely.
        const data = await announcementService.getAll({ limit: 100 });
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

  // Everything the slideshow did not show. The section below renders only
  // these — it must not repeat the hero's items, otherwise the counts the
  // layout below is built around are wrong.
  const olderAnnouncements = useMemo(
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
    <div className="min-h-screen bg-[#FFFFFF] text-[#0F172A] font-sans antialiased pb-24 relative overflow-hidden selection:bg-[#0062A8]/15 selection:text-[#0062A8]">
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
        /* Bento grid: fade/rise on every page change. */
        .bento-fade-in {
          animation: bentoFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes bentoFadeIn {
          from { opacity: 0; transform: translateY(12px) scale(0.99); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        /* Hero → bento handoff: blur strongest at the seam, masked out above. */
        .vcet-hero-blur {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          -webkit-mask-image: linear-gradient(to top, #000 0%, #000 35%, transparent 100%);
          mask-image: linear-gradient(to top, #000 0%, #000 35%, transparent 100%);
        }
        @media (prefers-reduced-motion: reduce) {
          .vcet-hero-copy, .vcet-hero-zoom, .bento-fade-in { animation: none; }
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

          {/* ---- EVERYTHING BELOW THE SLIDESHOW, ADAPTED TO HOW MANY ARE LEFT ---- */}
          <AnnouncementGrid
            announcements={olderAnnouncements}
            onSelect={(item) => setSelected(item)}
          />
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

      {/* ---- BLUR + FADE TRANSITION: dissolves the hero into the white
              bento showcase below so there is no hard seam or gap ---- */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 inset-x-0 h-40 sm:h-48 z-10 pointer-events-none vcet-hero-blur"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 inset-x-0 h-40 sm:h-48 z-10 pointer-events-none bg-gradient-to-b from-transparent via-white/60 to-white"
      />

      {/* Slide dots (decorative — the hero autoplays) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 pointer-events-none select-none">
        {slides.map((slide, i) => (
          <span
            key={slide._id || slide.id || i}
            aria-hidden="true"
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === safeIndex ? "w-10 bg-[#0F172A]" : "w-4 bg-[#0F172A]/25"
            }`}
          />
        ))}
        {multiple && (
          <span className="ml-2 text-[10px] font-bold tracking-widest text-[#0F172A]/45 tabular-nums">
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
      <div className="absolute inset-0 flex items-end z-20">
        <div
          className={`w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-48 sm:pb-56 ${
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
/* ADAPTIVE GRID — everything that did not fit in the slideshow                */
/*                                                                            */
/* The slideshow owns the 5 newest uploads, so this section renders only the   */
/* remainder. The remainder's size picks the layout:                          */
/*   1 → one full-bleed card                                                   */
/*   2 → two equal columns                                                    */
/*   3 → three equal columns                                                  */
/*   4 → 2x2 grid                                                             */
/*   5 → the bento (2 stacked | 1 tall | 2 stacked)                           */
/*   6+ → bento, then slide right for the rest as full-width cards             */
/* -------------------------------------------------------------------------- */

/** Cards in one bento page. */
const BENTO_PAGE_SIZE = 5;

/**
 * Build the list of pages shown below the slideshow.
 *
 * Full groups of 5 become bento pages. A trailing partial group of 1-4 items
 * becomes one "rest" page that is laid out by count, using the same rules as
 * a short list: 1 → full-screen slide, 2 → split into two, 3 → three across,
 * 4 → 2x2. Partial groups are never squeezed into an incomplete bento, which
 * would leave empty columns.
 */
function buildGridPages(announcements) {
  const pages = [];
  for (let i = 0; i < announcements.length; i += BENTO_PAGE_SIZE) {
    const chunk = announcements.slice(i, i + BENTO_PAGE_SIZE);
    pages.push({ type: chunk.length === BENTO_PAGE_SIZE ? "bento" : "rest", items: chunk });
  }
  return pages;
}

function AnnouncementGrid({ announcements, onSelect }) {
  const [page, setPage] = useState(0);

  const total = announcements.length;

  const pages = useMemo(() => buildGridPages(announcements), [announcements]);
  const totalPages = pages.length;
  const safePage = Math.min(page, totalPages - 1);

  // Clamp back to a valid page whenever the list shrinks (e.g. an expired post
  // retires) so the view never lands on an empty page.
  useEffect(() => {
    if (page > safePage) setPage(safePage);
  }, [page, safePage]);

  if (total === 0) return null;

  const goPrev = () => setPage((p) => (p > 0 ? p - 1 : totalPages - 1));
  const goNext = () => setPage((p) => (p < totalPages - 1 ? p + 1 : 0));

  // ---- 1 to 4 items: a single screen, layout chosen by count, no arrows ----
  if (total < BENTO_PAGE_SIZE) {
    // A lone item is full-bleed, matching the remainder-page treatment.
    const fullBleed = total === 1;

    return (
      <section
        className={`w-full bg-[#FFFFFF] ${fullBleed ? "pb-0 px-0" : "pb-14 sm:pb-16 px-4 sm:px-6 lg:px-10"}`}
      >
        <div className={fullBleed ? "w-full" : "max-w-[1400px] mx-auto"}>
          <div key={total} className="bento-fade-in">
            <EqualRowGrid items={announcements} onSelect={onSelect} />
          </div>
        </div>
      </section>
    );
  }

  // ---- 5 or more: page through bento screens and remainder rows ----
  const current = pages[safePage];

  // A single leftover renders as a full-bleed slide; 2-4 share a padded row.
  const isFullBleed = current?.type === "rest" && current.items.length === 1;

  return (
    <section
      className={`w-full bg-[#FFFFFF] relative ${
        isFullBleed ? "pb-0 px-0" : "pb-14 sm:pb-16 px-4 sm:px-6 lg:px-10"
      }`}
    >
      <div className={isFullBleed ? "w-full" : "max-w-[1400px] mx-auto"}>
        <div className="relative group/grid">
          {/* Arrows sit inside the padded area so a full-bleed slide still
              has somewhere to put them. */}
          <button
            onClick={goPrev}
            aria-label="Previous updates"
            className={`absolute top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#1A1A1A]/80 hover:bg-[#1A1A1A] text-white flex items-center justify-center backdrop-blur-md shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border border-white/10 ${
              isFullBleed ? "left-2 sm:left-6" : "left-0 lg:-left-6"
            }`}
          >
            <ChevronLeft size={24} className="stroke-[2.5]" />
          </button>
          <button
            onClick={goNext}
            aria-label="Next updates"
            className={`absolute top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#1A1A1A]/80 hover:bg-[#1A1A1A] text-white flex items-center justify-center backdrop-blur-md shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border border-white/10 ${
              isFullBleed ? "right-2 sm:right-6" : "right-0 lg:-right-6"
            }`}
          >
            <ChevronRight size={24} className="stroke-[2.5]" />
          </button>

          <div key={safePage} className="bento-fade-in">
            {current?.type === "rest" ? (
              <EqualRowGrid items={current.items} onSelect={onSelect} />
            ) : (
              <BentoGrid items={current.items} onSelect={onSelect} />
            )}
          </div>

          {totalPages > 1 && (
            <div className={`flex items-center justify-center gap-2 ${isFullBleed ? "mt-6 px-4" : "mt-8"}`}>
              {pages.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === safePage ? "w-8 bg-[#0F172A]" : "w-2 bg-slate-300 hover:bg-slate-400"
                  }`}
                  aria-label={`Go to page ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* EQUAL-COLUMN GRID — used for 1 to 4 leftover items                          */
/* 1 → full bleed · 2 → two across · 3 → three across · 4 → 2x2                 */
/* -------------------------------------------------------------------------- */
function EqualRowGrid({ items, onSelect }) {
  const count = items.length;

  const columns = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2",
  }[count] || "grid-cols-1";

  // A lone item gets the full-screen slide, matching the tail treatment.
  if (count === 1) {
    return <FullScreenSlide item={items[0]} onClick={() => onSelect(items[0])} />;
  }

  return (
    <div className={`grid ${columns} gap-5 sm:gap-6 items-stretch`}>
      {items.map((item, i) => (
        <EqualCard key={item._id || item.id || i} item={item} onClick={() => onSelect(item)} />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* EQUAL CARD — one cell of the 2 / 3 / 4-up row                                */
/* -------------------------------------------------------------------------- */
function EqualCard({ item, onClick }) {
  if (!item) return null;

  const catStyle = getCategoryStyle(item.category);
  const Icon = catStyle.icon;
  const poster = resolvePoster(item);
  const dateStr = eventDateString(item);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="group relative flex flex-col overflow-hidden rounded-[28px] bg-[#EBEFF4] border border-slate-200/80 cursor-pointer transition-all duration-300 hover:scale-[1.015] hover:shadow-2xl min-h-[300px] sm:min-h-[340px]"
    >
      {/* Poster fills the card, copy sits over a bottom scrim */}
      {poster ? (
        <img
          src={poster}
          alt={item.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 hero-gradient flex items-center justify-center">
          <Icon size={120} strokeWidth={0.75} className="text-white/[0.09]" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/15" />

      {/* Badges */}
      <div className="relative z-10 flex items-start justify-between gap-2 p-5">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider backdrop-blur-md ${
            poster
              ? "bg-black/60 text-white border border-white/15"
              : "bg-white/20 text-white border border-white/20"
          }`}
        >
          <Icon size={10} />
          {catStyle.label}
        </span>
        {dateStr && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-900/80 text-white text-[9px] font-black uppercase tracking-wider backdrop-blur-md">
            <CalendarDays size={9} /> {formatShortDate(dateStr)}
          </span>
        )}
      </div>

      {/* Copy */}
      <div className="relative z-10 mt-auto p-5 sm:p-6">
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white/75">
          <Flame size={11} /> {relativeLabel(item)}
        </span>
        <h3 className="mt-2 text-lg sm:text-xl font-extrabold text-white leading-tight tracking-tight line-clamp-2 group-hover:text-white/90 transition-colors">
          {item.title}
        </h3>
        <p className="mt-1.5 text-xs font-semibold text-white/70 line-clamp-1">
          {deptLabel(item)}
          {issuerName(item) ? ` • ${issuerName(item)}` : ""}
        </p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-white bg-white/10 border border-white/15 backdrop-blur-sm px-3.5 py-1.5 rounded-full">
          View Details
          <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* FULL-SCREEN SLIDE — the tail item, shown alone once the bento fills up       */
/* -------------------------------------------------------------------------- */
function FullScreenSlide({ item, onClick }) {
  if (!item) return null;

  const catStyle = getCategoryStyle(item.category);
  const Icon = catStyle.icon;
  const poster = resolvePoster(item);
  const dateStr = eventDateString(item);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="group relative w-full h-[clamp(360px,62vh,560px)] overflow-hidden bg-[#071E3D] cursor-pointer"
    >
      {poster ? (
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover vcet-hero-zoom"
        />
      ) : (
        <div className="absolute inset-0 hero-gradient flex items-center justify-center">
          <Icon size={220} strokeWidth={0.5} className="text-white/[0.07]" />
        </div>
      )}

      {/* Legibility scrims, same as the hero above */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/15 to-transparent" />

      <div className="absolute inset-0 flex items-end z-20">
        <div className="w-full max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 pb-20 sm:pb-24 vcet-hero-copy">
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500 text-white text-[11px] font-black uppercase tracking-wider">
              <Flame size={13} />
              More Updates
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider border backdrop-blur-sm ${catStyle.badgeBg}`}
            >
              <Icon size={12} />
              {catStyle.label}
            </span>
            {dateStr && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold text-white bg-white/10 border border-white/15 backdrop-blur-sm">
                <CalendarDays size={11} /> Event: {formatDateString(dateStr)}
              </span>
            )}
            {item.isPinned && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-amber-950 border border-amber-300">
                <Pin size={10} /> PINNED
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-[1.08] tracking-tight max-w-4xl drop-shadow-[0_2px_18px_rgba(0,0,0,0.55)]">
            {item.title}
          </h2>

          <p className="mt-4 text-sm sm:text-base text-white/80 leading-relaxed max-w-2xl line-clamp-2">
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
          </div>

          <span className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#0F172A] font-bold text-xs sm:text-sm shadow-lg">
            View More
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>

      {/* Fade into the page background at the very bottom */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 inset-x-0 h-24 z-10 pointer-events-none bg-gradient-to-b from-transparent to-white"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* BENTO GRID — 5 items: 2 stacked | 1 tall | 2 stacked                        */
/* -------------------------------------------------------------------------- */
function BentoGrid({ items, onSelect }) {
  const [card0, card1, card2, card3, card4] = items;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
      {/* LEFT COLUMN: 2 STACKED CARDS */}
      <div className="lg:col-span-3 flex flex-col gap-5 sm:gap-6">
        <AnnouncementCardSmall item={card0} tone="silver" onClick={() => onSelect(card0)} />
        <AnnouncementCardSmall item={card1} tone="white" onClick={() => onSelect(card1)} />
      </div>

      {/* CENTER COLUMN: 1 TALL FEATURED CARD */}
      <div className="lg:col-span-6 flex">
        <AnnouncementCardTall item={card2} onClick={() => onSelect(card2)} />
      </div>

      {/* RIGHT COLUMN: 2 STACKED CARDS */}
      <div className="lg:col-span-3 flex flex-col gap-5 sm:gap-6">
        <AnnouncementCardSmall item={card3} tone="dark" onClick={() => onSelect(card3)} />
        <AnnouncementCardSmall item={card4} tone="white" onClick={() => onSelect(card4)} />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SMALL BENTO CARD (Left & Right stacked items)                               */
/* -------------------------------------------------------------------------- */
function AnnouncementCardSmall({ item, tone = "white", onClick }) {
  if (!item) return null;

  const catStyle = getCategoryStyle(item.category);
  const Icon = catStyle.icon;
  const poster = resolvePoster(item);
  const dateStr = eventDateString(item);

  const isDark = tone === "dark";
  const isSilver = tone === "silver";

  const containerClasses = isDark
    ? "bg-gradient-to-br from-[#0B1528] via-[#0F1E38] to-[#162744] text-white border border-slate-800"
    : isSilver
    ? "bg-[#ECEEF2] text-[#0F172A] border border-slate-200/60"
    : "bg-white text-[#0F172A] border border-slate-200/80 shadow-xs";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={`group relative flex-1 min-h-[220px] sm:min-h-[240px] rounded-[26px] p-5 sm:p-6 flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${containerClasses}`}
    >
      {/* Top Graphic / Preview Area */}
      <div className="relative w-full h-28 sm:h-32 rounded-2xl overflow-hidden flex items-center justify-center">
        {poster ? (
          <img
            src={poster}
            alt={item.title}
            className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className={`w-full h-full rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-105 ${
              isDark ? "bg-white/[0.04] border border-white/10" : "bg-black/[0.03] border border-black/5"
            }`}
          >
            <Icon size={36} strokeWidth={1.25} className={isDark ? "text-cyan-300/60" : "text-slate-400"} />
          </div>
        )}

        {/* Category + pinned badges at top-left of the preview */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider backdrop-blur-md ${
              isDark
                ? "bg-white/20 text-white border border-white/20"
                : "bg-black/60 text-white border border-black/10"
            }`}
          >
            <Icon size={10} />
            {catStyle.label}
          </span>
          {item.isPinned && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400 text-amber-950 border border-amber-300">
              <Pin size={9} /> PIN
            </span>
          )}
        </div>

        {/* Date chip at top-right of the preview */}
        {dateStr && (
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-900/80 text-white text-[9px] font-black uppercase tracking-wider backdrop-blur-md">
            <CalendarDays size={9} /> {formatShortDate(dateStr)}
          </span>
        )}
      </div>

      {/* Bottom Typography & Details */}
      <div className="pt-4 text-center">
        <h3
          className={`text-sm sm:text-base font-bold tracking-tight line-clamp-1 group-hover:text-[#0062A8] transition-colors ${
            isDark ? "group-hover:text-cyan-400" : ""
          }`}
        >
          {item.title}
        </h3>
        <p
          className={`text-xs mt-1 font-medium line-clamp-1 ${
            isDark ? "text-slate-300" : "text-slate-600"
          }`}
        >
          {deptLabel(item)}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* TALL FEATURED BENTO CARD (Center full-height card)                          */
/* -------------------------------------------------------------------------- */
function AnnouncementCardTall({ item, onClick }) {
  if (!item) return null;

  const catStyle = getCategoryStyle(item.category);
  const Icon = catStyle.icon;
  const poster = resolvePoster(item);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="group relative w-full h-full min-h-[460px] sm:min-h-[500px] lg:min-h-[510px] rounded-[32px] bg-[#EBEFF4] border border-slate-200/80 p-6 sm:p-8 flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.015] hover:shadow-2xl"
    >
      {/* Top Badge */}
      <div className="flex items-center justify-between z-10 gap-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-[11px] font-bold tracking-wide">
          <Flame size={13} className="text-amber-400" />
          Featured Update
        </span>
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">
          {relativeLabel(item)}
        </span>
      </div>

      {/* Center Showcase Visual Preview */}
      <div className="relative flex-1 my-4 flex items-center justify-center overflow-hidden">
        {poster ? (
          <div className="w-full max-w-sm h-full max-h-[290px] sm:max-h-[320px] rounded-2xl overflow-hidden shadow-xl border border-slate-300/60 bg-white group-hover:scale-105 transition-transform duration-500">
            <img src={poster} alt={item.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full max-w-sm h-64 rounded-2xl hero-gradient text-white p-6 flex flex-col items-center justify-center text-center shadow-xl group-hover:scale-105 transition-transform duration-500">
            <Icon size={54} strokeWidth={1.5} className="text-cyan-300 mb-3" />
            <h4 className="font-extrabold text-lg text-white line-clamp-2">{item.title}</h4>
            <p className="text-xs text-white/80 mt-1">{deptLabel(item)}</p>
          </div>
        )}
      </div>

      {/* Bottom Typography & Details */}
      <div className="text-center pt-2 z-10">
        <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-[#0F172A] tracking-tight line-clamp-2 group-hover:text-[#0062A8] transition-colors">
          {item.title}
        </h3>
        <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1.5 line-clamp-1">
          {deptLabel(item)}
          {issuerName(item) ? ` • ${issuerName(item)}` : ""}
        </p>

        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0062A8] bg-blue-50 border border-blue-200/80 px-4 py-1.5 rounded-full shadow-xs group-hover:bg-[#0062A8] group-hover:text-white transition-colors">
            View Details
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
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