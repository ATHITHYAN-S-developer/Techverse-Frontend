import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CalendarDays,
  Clock,
  MapPin,
  Building2,
  ArrowRight,
  X,
  ExternalLink,
  PartyPopper,
  Flame,
  Users2,
  Briefcase,
  Megaphone,
} from "lucide-react";
import { announcementService } from "../services/announcementService";
import { API_BASE_URL } from "../services/api";

/* ============================================================================
 * EVENT CONTENT
 * ----------------------------------------------------------------------------
 * Placement events are pulled live from the announcements feed (the same data
 * shown on the Announcements page) and filtered to placement items, so a
 * placement circular published by faculty appears here automatically.
 *
 * Rules for the split:
 *   • no `date`, or a date in the future  -> "New Events"
 *   • a date in the past                   -> "Past Events"
 *
 * Fields: title, date (YYYY-MM-DD), time, venue, organiser, department,
 *         description, tags[], poster (image url), linkUrl, linkText, postedAt
 * ========================================================================== */

/**
 * Extra hand-written events — merged with the announcement feed.
 *
 * `postedAt` drives the slideshow's "newest post first" order, so keep it later
 * than the `createdAt` of anything coming out of the announcements API.
 */
const EXTRA_EVENTS = [
  {
    id: "tcs-campus-hiring-2026",
    title: "TCS Campus Hiring Drive 2026 — Off-Campus Recruitment Round",
    date: "2026-09-24",
    time: "09:30 AM – 04:00 PM",
    venue: "VCET Placement Cell, Block A — Seminar Hall 1",
    organiser: "TCS Talent Acquisition Team",
    department: "CSE, IT, AI & DS, ECE, EEE",
    description:
      "Tata Consultancy Services conducted its 2026 campus hiring round for final-year and pre-final-year students of Velalar College of Engineering and Technology.\n\n" +
      "TCS NQT (National Qualifier Test) formed the first stage, followed by a group discussion, a technical interview and an HR interview, all conducted on the same day. Candidates shortlisted from the aptitude round were required to report by 8:45 AM carrying two printed copies of their resume, a government photo ID and their college ID card.\n\n" +
      "Students who had cleared TCS NQT in either of the previous two cycles, and candidates belonging to reserved categories, presented the relevant valid documentation at the help desk before the drive began.\n\n" +
      "The drive has concluded. Candidates who did not report on the drive date were not considered for the next round, and the college will not process a re-attempt request for the same cycle.",
    tags: ["Placement", "TCS", "Campus Hiring", "CSE", "IT", "AI & DS", "Final Year"],
    poster: "/images/tcs-placement-2026.jpg",
    linkUrl: "https://www.tcs.com/careers",
    linkText: "TCS Careers",
    postedAt: "2026-09-26T05:00:00.000Z",
  },
  {
    id: "zoho-campus-hiring-2026",
    title: "Zoho Campus Hiring Drive 2026 — Technical & Design Round",
    date: "2026-10-19",
    time: "09:00 AM – 03:30 PM",
    venue: "VCET Placement Cell, Block A — Seminar Hall 2",
    organiser: "Zoho Corporation Talent Acquisition",
    department: "CSE, IT, AI & DS",
    description:
      "Zoho Corporation is conducting its 2026 campus hiring drive for Software Developer roles at Velalar College of Engineering and Technology.\n\n" +
      "The selection process runs across three stages on a single day: a written aptitude test on C and Java fundamentals, a pure problem-solving round without standard library support, and a final advanced application design interview.\n\n" +
      "III Year and IV Year B.E./B.Tech students in CSE, IT and AI & DS may register. Shortlisted candidates must report by 8:15 AM with two printed copies of their resume, a government photo ID and their college ID card.\n\n" +
      "Shortlisting from the aptitude round is a prerequisite for the design interview, so candidates are advised to revise recursion, data structures and complexity analysis before attending.",
    tags: ["Placement", "Zoho", "Campus Hiring", "CSE", "IT", "AI & DS", "Technical"],
    poster: "/images/zoho-placement-2026.jpg",
    linkUrl: "https://www.zoho.com/careers/",
    linkText: "Zoho Careers",
    postedAt: "2026-09-26T06:00:00.000Z",
  },
  {
    id: "hexaware-campus-hiring-2026",
    title: "Hexaware Campus Hiring Drive 2026 — Graduate Engineer Trainee",
    date: "2026-10-10",
    time: "10:00 AM – 04:00 PM",
    venue: "VCET Placement Cell, Block A — Seminar Hall 1",
    organiser: "Hexaware Technologies Talent Acquisition",
    department: "CSE, IT, AI & DS, ECE, EEE",
    description:
      "Hexaware Technologies is conducting its 2026 campus hiring drive for Graduate Engineer Trainee roles at Velalar College of Engineering and Technology.\n\n" +
      "The selection process runs across three stages on a single day: an online aptitude assessment covering logical reasoning and quantitative ability, a group discussion, and a technical interview followed by an HR interview.\n\n" +
      "Final-year B.E./B.Tech students in CSE, IT, AI & DS, ECE and EEE may register. Shortlisted candidates must report by 9:15 AM carrying two printed copies of their resume, all consolidated mark sheets, a government photo ID and their college ID card.\n\n" +
      "The technical interview will cover core data structures, OOP concepts, database management systems and live problem solving. Candidates are advised to carry a pen and a copy of their current semester mark sheet for document verification.",
    tags: ["Placement", "Hexaware", "Campus Hiring", "GET", "CSE", "IT", "AI & DS", "Final Year"],
    poster: "/images/hexaware-placement-2026.jpg",
    linkUrl: "https://www.hexaware.com/careers/",
    linkText: "Hexaware Careers",
    postedAt: "2026-09-26T07:00:00.000Z",
  },
];

/** Announcement categories that count as placement events. */
function isPlacementCategory(cat) {
  return String(cat || "").toLowerCase().includes("placement");
}

/**
 * Placement posts that must not be listed on this page. The Zoho circular is
 * withheld here only — the announcement itself is left untouched in the
 * database, so it still appears on the Announcements page as usual.
 */
const HIDDEN_PLACEMENT_TITLES = new Set([
  "Zoho Campus Hiring Drive 2026: Technical & Advanced Coding Registration",
]);

/** True when a placement post is withheld from this page. */
function isHiddenPlacementEvent(event) {
  return HIDDEN_PLACEMENT_TITLES.has(String(event?.title || "").trim());
}

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

/** Map an announcement into the event shape used by the cards and modal. */
function announcementToEvent(a) {
  // Only an explicit event/expiry date counts — a missing date means the
  // drive is still open, so it belongs in "New Events".
  const rawDate = a.eventDate || a.expiryDate || a.deadline || "";
  const date = rawDate ? String(rawDate).slice(0, 10) : "";
  const department = a.departmentId?.name || a.departmentId?.code || a.department || "";

  return {
    id: a._id || a.id,
    title: a.title || "Untitled Event",
    date,
    time: a.time || "",
    venue: a.venue || "",
    organiser: a.createdBy?.name || a.authorName || a.author || "Placement Cell",
    department,
    description: a.description || a.content || "",
    tags: [a.category, department, a.targetAudience].filter(Boolean),
    poster: resolvePoster(a),
    linkUrl: a.linkUrl || "",
    linkText: a.linkText || "View Details",
    // Drives the "newest post first" slideshow order.
    postedAt: a.createdAt || a.publishDate || "",
  };
}

/* -------------------------------------------------------------------------- */
/* helpers                                                                     */
/* -------------------------------------------------------------------------- */

function todayString() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function eventDateString(event) {
  const raw = event.date || "";
  return raw ? String(raw).slice(0, 10) : "";
}

/** When the post was published, as a comparable timestamp (0 when unknown). */
function postedAtTime(event) {
  const raw = event.postedAt || "";
  if (!raw) return 0;
  const t = new Date(raw).getTime();
  return Number.isNaN(t) ? 0 : t;
}

/** No date → treat as still upcoming. Otherwise compare against today. */
function isPastEvent(event) {
  const ev = eventDateString(event);
  if (!ev) return false;
  return ev < todayString();
}

function formatDateString(raw) {
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw).toUpperCase();
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase();
}

function formatShortDate(raw) {
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw).toUpperCase();
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
}

/** "TODAY" / "IN 3 DAYS" / "ENDED 2 DAYS AGO" style countdown. */
function relativeLabel(event) {
  const ev = eventDateString(event);
  if (!ev) return "DATE TO BE ANNOUNCED";

  const target = new Date(`${ev}T00:00:00`);
  const now = new Date(`${todayString()}T00:00:00`);
  const days = Math.round((target - now) / 86400000);

  if (days === 0) return "HAPPENING TODAY";
  if (days === 1) return "TOMORROW";
  if (days > 1) return `IN ${days} DAYS`;
  if (days === -1) return "ENDED YESTERDAY";
  return `ENDED ${Math.abs(days)} DAYS AGO`;
}

/** Cadence for the fullscreen placement showcase. */
const AUTO_PLAY_INTERVAL = 3000;

/** How many of the most recently uploaded drives run in the fullscreen hero. */
const HERO_SLIDE_COUNT = 5;

/** Every placement circular is issued by the college Career Development Cell. */
const POSTED_BY = "Career Development Cell";

/**
 * Newest-upload-first comparator. A batch insert stamps every document with the
 * same createdAt millisecond, so the record id — which increases with insertion
 * order — breaks the tie and keeps the order stable across re-seeds.
 */
function compareUploadOrder(a, b) {
  const delta = postedAtTime(b) - postedAtTime(a);
  if (delta !== 0) return delta;
  return String(b.id || b._id || "").localeCompare(String(a.id || a._id || ""));
}

/* -------------------------------------------------------------------------- */
/* page                                                                        */
/* -------------------------------------------------------------------------- */

export default function PlacementEventsPage() {
  const [selected, setSelected] = useState(null);
  const [events, setEvents] = useState(EXTRA_EVENTS);
  const [loading, setLoading] = useState(true);
  const [slideIndex, setSlideIndex] = useState(0);

  // Placement events are sourced from the announcements feed.
  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      setLoading(true);
      try {
        const announcements = await announcementService.getAll({ limit: 100 });
        if (cancelled) return;
        const fromFeed = (announcements || [])
          .filter((a) => isPlacementCategory(a.category))
          .map(announcementToEvent);
        setEvents([...EXTRA_EVENTS, ...fromFeed]);
      } catch (err) {
        console.error("Failed to load placement events:", err);
        if (!cancelled) setEvents(EXTRA_EVENTS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadEvents();
    return () => {
      cancelled = true;
    };
  }, []);

  // Drives whose date has passed are retired from the page entirely. Whatever
  // remains is ordered by upload recency, newest first, and split into the
  // fullscreen hero and the grid below it.
  const { slides, gridEvents } = useMemo(() => {
    // Withheld and expired drives are dropped before anything else, so they
    // never reach the hero, the grid or the total count.
    const ordered = events
      .filter((e) => !isHiddenPlacementEvent(e) && !isPastEvent(e))
      .sort(compareUploadOrder);

    return {
      slides: ordered.slice(0, HERO_SLIDE_COUNT),
      gridEvents: ordered.slice(HERO_SLIDE_COUNT),
    };
  }, [events]);

  const totalVisible = slides.length + gridEvents.length;

  // Keep the slide index valid when the list shrinks (new post / filter change).
  useEffect(() => {
    if (slideIndex >= slides.length) setSlideIndex(0);
  }, [slides.length, slideIndex]);

  // Autoplay the showcase — 3 second cadence, held while a detail modal is open.
  useEffect(() => {
    if (slides.length <= 1 || selected) return;
    const id = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, AUTO_PLAY_INTERVAL);
    return () => clearInterval(id);
  }, [slides.length, selected]);

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

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#0F172A] font-sans antialiased pb-24 relative overflow-hidden">
      {/* Shared styling with the Announcements page */}
      <style>{`
        .placement-hero-gradient {
          background: linear-gradient(135deg, #071E3D 0%, #0A3563 50%, #0062A8 100%);
        }
        /* Fullscreen hero: staggered copy entrance + slow poster push-in. */
        .placement-hero-copy {
          animation: placementHeroCopy 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes placementHeroCopy {
          from { opacity: 0; transform: translateY(34px); }
          to   { opacity: 1; transform: none; }
        }
        .placement-hero-zoom {
          animation: placementHeroZoom 9s ease-out both;
        }
        @keyframes placementHeroZoom {
          from { transform: scale(1.03); }
          to   { transform: scale(1.15); }
        }
        .placement-slide-in {
          animation: placementSlideIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes placementSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: none; }
        }
        /* Grid cards show the poster only; the copy fades in on hover/focus. */
        .placement-card-reveal {
          opacity: 0;
          transition: opacity 0.25s ease;
        }
        .group:hover .placement-card-reveal,
        .group:focus-within .placement-card-reveal,
        .group:focus-visible .placement-card-reveal {
          opacity: 1;
        }
        /* Touch devices have no hover — keep the overlay legible there. */
        @media (hover: none) {
          .placement-card-reveal { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .placement-hero-copy, .placement-hero-zoom { animation: none; }
          .placement-card-reveal { transition: none; }
        }
      `}</style>

      {/* ---------------------------------------------------------------- */}
      {/* FULLSCREEN HERO + GRID                                           */}
      {/* ---------------------------------------------------------------- */}
      {loading ? (
        <div className="h-[calc(100vh-64px)] supports-[height:100svh]:h-[calc(100svh-64px)] flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-[#0062A8] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-[#64748B]">Fetching placement events...</p>
        </div>
      ) : totalVisible === 0 ? (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 pb-24">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] px-6 py-16 text-center shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-[#F7F9FC] border border-[#E2E8F0] flex items-center justify-center mx-auto mb-4">
              <PartyPopper size={28} className="text-[#0062A8]/40" />
            </div>
            <h3 className="text-lg font-bold text-[#0F172A]">No placement events right now</h3>
            <p className="text-sm text-[#64748B] mt-1 max-w-md mx-auto">
              New placement drives, workshops and career events will appear here as soon as they are
              scheduled.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* ---- 5 MOST RECENTLY UPLOADED DRIVES (EDGE-TO-EDGE HERO) ---- */}
          {slides.length > 0 && (
            <PlacementHero
              slides={slides}
              activeIndex={slideIndex}
              totalCount={totalVisible}
              onViewMore={(event) => setSelected(event)}
            />
          )}

          {/* ---- REMAINING DRIVES (SCROLL DOWN) ---- */}
          {/* Full-bleed: no max-width cap, and the tiles flex to fill the row so
              there is no empty gutter on the left or right. */}
          <div className="w-full px-3 sm:px-4 lg:px-6 py-12 sm:py-14 pb-24">
            {gridEvents.length > 0 && (
              <div className="flex flex-wrap gap-3 sm:gap-4 py-6">
                {gridEvents.map((event) => (
                  <EventCard key={event.id || event._id} event={event} onClick={() => setSelected(event)} />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* EVENT DETAIL MODAL                                                 */}
      {/* ---------------------------------------------------------------- */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-[#E2E8F0]"
            onClick={(e) => e.stopPropagation()}
          >
            <EventModal event={selected} onClose={() => setSelected(null)} />
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* FULLSCREEN HERO — the most recently uploaded drives                          */
/* Edge-to-edge, viewport-filling slideshow: poster as a full-bleed background  */
/* with the copy overlaid on a legibility scrim. Slides cross-fade.             */
/* -------------------------------------------------------------------------- */
function PlacementHero({ slides, activeIndex, totalCount, onViewMore }) {
  const safeIndex = slides.length ? activeIndex % slides.length : 0;
  const multiple = slides.length > 1;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Latest placement drives"
      className="relative w-full h-[calc(100vh-64px)] supports-[height:100svh]:h-[calc(100svh-64px)] overflow-hidden bg-[#071E3D]"
    >
      {slides.map((event, i) => (
        <HeroSlide
          key={event.id || event._id || i}
          event={event}
          active={i === safeIndex}
          onViewMore={onViewMore}
        />
      ))}

      {/* Total drives on record */}
      <div className="absolute top-6 left-4 sm:left-6 lg:left-8 z-20 select-none">
        <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/90 bg-black/30 backdrop-blur-md border border-white/20 rounded-full px-3.5 py-1.5">
          <Megaphone size={13} />
          {totalCount} {totalCount === 1 ? "drive" : "drives"} total
        </span>
      </div>

      {/* Slide dots (decorative — the hero autoplays) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 pointer-events-none select-none">
        {slides.map((slide, i) => (
          <span
            key={slide.id || slide._id || i}
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
function HeroSlide({ event, active, onViewMore }) {
  const dateStr = eventDateString(event);
  const upcoming = dateStr && dateStr > todayString();

  return (
    <article
      aria-hidden={!active}
      className={`absolute inset-0 transition-opacity duration-[1200ms] ease-out ${
        active ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
      }`}
    >
      {/* Full-bleed background */}
      {event.poster ? (
        <img
          src={event.poster}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover ${active ? "placement-hero-zoom" : ""}`}
        />
      ) : (
        <div className="absolute inset-0 placement-hero-gradient flex items-center justify-center">
          <Briefcase size={220} strokeWidth={0.5} className="text-white/[0.07]" />
        </div>
      )}

      {/* Legibility scrims — vertical for the copy, horizontal for the left rail */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/15 to-transparent" />

      {/* Overlaid copy */}
      <div className="absolute inset-0 flex items-end">
        <div
          className={`w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-24 ${
            active ? "placement-hero-copy" : ""
          }`}
        >
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500 text-white text-[11px] font-black uppercase tracking-wider">
              <Flame size={13} />
              Latest Placement Drives
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider bg-blue-50 text-[#0062A8] border border-blue-200/80 backdrop-blur-sm">
              <Briefcase size={12} />
              PLACEMENT
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider backdrop-blur-sm border ${
                upcoming
                  ? "bg-blue-500/25 text-white border-blue-300/40"
                  : "bg-rose-500/25 text-white border-rose-300/40"
              }`}
            >
              {upcoming ? <CalendarDays size={11} /> : <Flame size={11} />}
              {upcoming ? "Upcoming Drive" : "Happening Today"}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-[1.06] tracking-tight max-w-4xl drop-shadow-[0_2px_18px_rgba(0,0,0,0.55)]">
            {event.title}
          </h2>

          <p className="mt-5 text-sm sm:text-base text-white/80 leading-relaxed max-w-2xl line-clamp-2 sm:line-clamp-3">
            {event.description || "No further details available."}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-white/80">
            {event.department && (
              <span className="inline-flex items-center gap-1.5 font-semibold text-white bg-white/10 border border-white/15 backdrop-blur-sm px-2.5 py-1 rounded-md">
                <Building2 size={13} /> {event.department}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 font-semibold text-white bg-white/10 border border-white/15 backdrop-blur-sm px-2.5 py-1 rounded-md">
              <Users2 size={13} /> Posted by {POSTED_BY}
            </span>
            {dateStr && (
              <span className="inline-flex items-center gap-1.5 font-bold text-white bg-white/10 border border-white/15 backdrop-blur-sm px-2.5 py-1 rounded-md">
                <CalendarDays size={13} />
                Ends by {formatDateString(dateStr)}
              </span>
            )}
            {event.time && (
              <span className="inline-flex items-center gap-1.5 font-semibold text-white bg-white/10 border border-white/15 backdrop-blur-sm px-2.5 py-1 rounded-md">
                <Clock size={13} /> {event.time}
              </span>
            )}
          </div>

          <button
            onClick={() => onViewMore(event)}
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
/* EVENT CARD — poster only. The copy is hidden behind a hover/focus overlay,  */
/* so the resting state of the grid is nothing but the drive's image.          */
/* -------------------------------------------------------------------------- */
function EventCard({ event, onClick }) {
  const ev = eventDateString(event);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="group relative flex-1 basis-[104px] sm:basis-[124px] min-w-[104px] max-w-[190px] aspect-[2/3] rounded-xl sm:rounded-2xl border border-white/10 shadow-md hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0062A8] focus-visible:ring-offset-2 transition-[transform,box-shadow,border-color] duration-300 ease-out cursor-pointer placement-slide-in bg-[#0A3563] hover:z-30 hover:-translate-y-1.5 hover:scale-[1.16] hover:border-white/40 hover:shadow-black/40 focus-visible:z-30 focus-visible:scale-[1.08] will-change-transform"
    >
      {/* Poster — the entire resting state */}
      {event.poster ? (
        <img
          src={event.poster}
          alt={`${event.title} poster`}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="absolute inset-0 placement-hero-gradient flex items-center justify-center">
          <PartyPopper size={32} strokeWidth={1.25} className="text-white/25" />
        </div>
      )}

      {/* Hover / focus overlay: pops in with the growth, then shows the copy */}
      <div className="placement-card-reveal absolute inset-0 flex flex-col justify-end p-2.5 sm:p-3 bg-gradient-to-t from-black/92 via-black/65 to-black/10 text-white rounded-[inherit]">
        <h4 className="text-[11px] sm:text-xs font-bold text-white leading-tight line-clamp-3 drop-shadow-[0_1px_8px_rgba(0,0,0,0.7)]">
          {event.title}
        </h4>

        {event.description && (
          <p className="mt-1 text-[9px] sm:text-[10px] text-white/70 leading-relaxed line-clamp-4 sm:line-clamp-5">
            {event.description}
          </p>
        )}

        <div className="mt-2 space-y-0.5 text-[9px] font-semibold text-white/60">
          {ev && (
            <div className="flex items-center gap-1">
              <Calendar size={9} className="shrink-0" />
              <span className="truncate">Ends {formatShortDate(ev)}</span>
            </div>
          )}
          {event.venue && (
            <div className="flex items-center gap-1">
              <MapPin size={9} className="shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
          )}
        </div>

        <div className="mt-2 pt-2 border-t border-white/15 flex items-center justify-center gap-1 rounded-full bg-white px-2 py-1 text-[9px] font-black uppercase tracking-wider text-[#0F172A] shadow-lg">
          View More
          <ArrowRight size={9} />
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* EVENT MODAL                                                                 */
/* -------------------------------------------------------------------------- */
function EventModal({ event, onClose }) {
  return (
    <>
      {/* Header */}
      <div className="relative bg-slate-900 text-white p-6 flex flex-col justify-end shrink-0">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border bg-rose-500/20 text-rose-200 border-rose-400/40">
            <Briefcase size={12} />
            PLACEMENT
          </span>
          <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-white/10 text-slate-300">
            {relativeLabel(event)}
          </span>
        </div>

        <h2 className="text-xl font-bold leading-tight drop-shadow-xs">{event.title}</h2>
      </div>

      {/* Body */}
      <div className="p-6 overflow-y-auto overscroll-contain space-y-4">
        {event.poster && (
          <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
            <img
              src={event.poster}
              alt={`${event.title} poster`}
              className="w-full max-h-[55vh] object-contain bg-slate-50"
            />
          </div>
        )}

        {/* Info tags */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B] pb-3 border-b border-slate-100">
          {event.date && (
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#0F172A] bg-slate-100 px-2.5 py-1 rounded-md">
              <CalendarDays size={13} /> {formatDateString(event.date)}
            </span>
          )}
          {event.time && (
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#0F172A] bg-slate-100 px-2.5 py-1 rounded-md">
              <Clock size={13} /> {event.time}
            </span>
          )}
          {event.venue && (
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#0F172A] bg-slate-100 px-2.5 py-1 rounded-md">
              <MapPin size={13} /> {event.venue}
            </span>
          )}
        </div>

        {event.description && (
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal">
            {event.description}
          </div>
        )}

        {event.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {event.tags.map((tag) => (
              <span key={tag} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Issuer — always the Career Development Cell, on its own line */}
        <div className="text-xs text-[#64748B] pt-2 space-y-1">
          <div className="flex items-center gap-1.5">
            <Users2 size={13} className="text-[#0062A8]" />
            Posted By: <strong className="text-[#0F172A]">{POSTED_BY}</strong>
          </div>
          {event.department && (
            <div className="flex items-center gap-1.5">
              <Building2 size={13} className="text-[#0062A8]" />
              Department: <strong className="text-[#0F172A]">{event.department}</strong>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-semibold text-[#0F172A] hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Close
          </button>
          {event.linkUrl && event.linkUrl !== "#" && (
            <a
              href={event.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0062A8] text-white text-sm font-semibold hover:bg-[#004f87] transition-colors cursor-pointer"
            >
              <span>{event.linkText || "View Details"}</span>
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    </>
  );
}
