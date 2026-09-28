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
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Headphones,
  Award,
  Laptop,
  CheckCircle2,
  PhoneCall,
  Mail,
} from "lucide-react";
import { placementEventService } from "../services/placementEventService";
import { API_BASE_URL } from "../services/api";

/**
 * Placement drives come exclusively from the backend PlacementEvent
 * collection. Nothing on this page is hardcoded, so an offline or empty
 * backend surfaces as the "no placement events" state rather than stale
 * copy baked into the bundle.
 */
function resolvePoster(item) {
  const raw = item.poster || item.imageUrl || item.image || "";
  if (!raw) return "";
  if (raw.startsWith("data:") || /^https?:\/\//i.test(raw)) return raw;
  const origin = API_BASE_URL.replace(/\/api\/?$/, "");
  return `${origin}${raw.startsWith("/") ? raw : `/uploads/announcements/${raw}`}`;
}

function placementEventToCard(e) {
  const rawDate = e.date || e.eventDate || "";
  const date = rawDate ? String(rawDate).slice(0, 10) : "";

  return {
    id: e._id || e.slug || e.id,
    slug: e.slug || "",
    title: e.title || "Untitled Placement Event",
    subtitle: e.subtitle || "Placement Cell Notification",
    badge: e.badge || "Campus Drive",
    category: e.category || "it-software",
    date,
    time: e.time || "",
    venue: e.venue || "VCET Campus",
    organiser: e.organiser || "Career Development Cell",
    department: e.department || "",
    description: e.description || "",
    tags: Array.isArray(e.tags) ? e.tags : [],
    poster: resolvePoster(e),
    linkUrl: e.linkUrl || "",
    linkText: e.linkText || "View Details",
    postedAt: e.postedAt || e.createdAt || "",
  };
}

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

function postedAtTime(event) {
  const raw = event.postedAt || "";
  if (!raw) return 0;
  const t = new Date(raw).getTime();
  return Number.isNaN(t) ? 0 : t;
}

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

const AUTO_PLAY_INTERVAL = 3500;
const HERO_SLIDE_COUNT = 5;
const POSTED_BY = "Career Development Cell";

function compareUploadOrder(a, b) {
  const delta = postedAtTime(b) - postedAtTime(a);
  if (delta !== 0) return delta;
  return String(b.id || b._id || "").localeCompare(String(a.id || a._id || ""));
}

/* ============================================================================
 * MAIN PAGE COMPONENT
 * ========================================================================== */

export default function PlacementEventsPage() {
  const [selected, setSelected] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendReachable, setBackendReachable] = useState(true);
  const [slideIndex, setSlideIndex] = useState(0);
  const [showHelpModal, setShowHelpModal] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      setLoading(true);
      try {
        const { events: rows, connected } = await placementEventService.getAll({ limit: 100 });
        if (cancelled) return;
        setBackendReachable(connected);
        setEvents((rows || []).map(placementEventToCard));
      } catch (err) {
        console.error("Failed to load placement events:", err);
        if (!cancelled) {
          setBackendReachable(false);
          setEvents([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadEvents();
    return () => {
      cancelled = true;
    };
  }, []);

  const { slides, orderedEvents } = useMemo(() => {
    const ordered = events
      .filter((e) => !isPastEvent(e))
      .sort(compareUploadOrder);

    return {
      slides: ordered.slice(0, HERO_SLIDE_COUNT),
      orderedEvents: ordered,
    };
  }, [events]);

  const totalVisible = orderedEvents.length;

  useEffect(() => {
    if (slideIndex >= slides.length) setSlideIndex(0);
  }, [slides.length, slideIndex]);

  useEffect(() => {
    if (slides.length <= 1 || selected) return;
    const id = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, AUTO_PLAY_INTERVAL);
    return () => clearInterval(id);
  }, [slides.length, selected]);

  useEffect(() => {
    if (!selected && !showHelpModal) return;

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
  }, [selected, showHelpModal]);

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#0F172A] font-sans antialiased pb-24 relative overflow-hidden selection:bg-[#0062A8]/15 selection:text-[#0062A8]">
      <style>{`
        .placement-hero-gradient {
          background: linear-gradient(135deg, #071E3D 0%, #0A3563 50%, #0062A8 100%);
        }
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
        .bento-fade-in {
          animation: bentoFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes bentoFadeIn {
          from { opacity: 0; transform: translateY(12px) scale(0.99); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .placement-hero-blur {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          -webkit-mask-image: linear-gradient(to top, #000 0%, #000 35%, transparent 100%);
          mask-image: linear-gradient(to top, #000 0%, #000 35%, transparent 100%);
        }
      `}</style>

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
            <h3 className="text-lg font-bold text-[#0F172A]">
              {backendReachable ? "No placement events right now" : "Placement events are unavailable"}
            </h3>
            <p className="text-sm text-[#64748B] mt-1 max-w-md mx-auto">
              {backendReachable
                ? "New placement drives, workshops and career events will appear here as soon as they are scheduled."
                : "We could not reach the placement server. Please check your connection and try again shortly."}
            </p>
            {!backendReachable && (
              <button
                onClick={() => window.location.reload()}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#0062A8] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#004E86] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0062A8]/50"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* ---- FULLSCREEN HERO CAROUSEL ---- */}
          {slides.length > 0 && (
            <PlacementHero
              slides={slides}
              activeIndex={slideIndex}
              totalCount={totalVisible}
              onViewMore={(event) => setSelected(event)}
            />
          )}

          {/* ---- SAMSUNG STYLE CATEGORIZED BENTO SHOWCASE (SCROLL DOWN) ---- */}
          <PlacementBentoShowcase
            events={orderedEvents}
            onSelectEvent={(event) => setSelected(event)}
            onOpenHelp={() => setShowHelpModal(true)}
          />
        </>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* FLOATING LIVE HELPDESK / COUNSELOR BADGE (SAMSUNG STYLE)         */}
      {/* ---------------------------------------------------------------- */}
      <button
        onClick={() => setShowHelpModal(true)}
        className="fixed bottom-6 right-6 z-40 group flex items-center gap-3 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200/90 rounded-full pl-2.5 pr-4 py-2 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
        aria-label="Placement Cell Helpdesk"
      >
        <div className="relative w-10 h-10 rounded-full bg-[#EBF3FC] text-[#0062A8] flex items-center justify-center font-bold text-sm ring-2 ring-emerald-500/80 ring-offset-2 overflow-hidden shadow-inner">
          <Headphones size={20} className="text-[#0062A8]" />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider leading-none">Need Help?</p>
          <p className="text-xs font-bold text-[#0F172A] mt-0.5">Placement Cell</p>
        </div>
      </button>

      {/* ---------------------------------------------------------------- */}
      {/* EVENT DETAIL MODAL                                               */}
      {/* ---------------------------------------------------------------- */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-[#E2E8F0] animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <EventModal event={selected} onClose={() => setSelected(null)} />
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* PLACEMENT HELPDESK MODAL                                         */}
      {/* ---------------------------------------------------------------- */}
      {showHelpModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setShowHelpModal(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 border border-[#E2E8F0] animate-in fade-in zoom-in-95 duration-200 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0062A8] flex items-center justify-center font-bold">
                  <Headphones size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Placement Cell Helpdesk</h3>
                  <p className="text-xs text-slate-500">Velalar College of Engg & Tech</p>
                </div>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="py-5 space-y-4 text-sm text-slate-600">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <Building2 size={18} className="text-[#0062A8] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900 text-xs">Placement Office</p>
                  <p className="text-xs text-slate-600 mt-0.5">Block A — First Floor, Room 108</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <PhoneCall size={18} className="text-[#0062A8] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900 text-xs">Drive Coordinator Helpline</p>
                  <p className="text-xs text-slate-600 mt-0.5">+91 (0424) 2244201 / Ext: 312</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <Mail size={18} className="text-[#0062A8] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900 text-xs">Official Queries</p>
                  <p className="text-xs text-slate-600 mt-0.5">placement@velalarengg.ac.in</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#0062A8] hover:bg-[#004f87] text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
 * FULLSCREEN HERO COMPONENT
 * ========================================================================== */

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

      {/* Total drives badge */}
      <div className="absolute top-6 left-4 sm:left-6 lg:left-8 z-20 select-none">
        <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/90 bg-black/30 backdrop-blur-md border border-white/20 rounded-full px-3.5 py-1.5 shadow-lg">
          <Megaphone size={13} />
          {totalCount} {totalCount === 1 ? "drive" : "drives"} live & upcoming
        </span>
      </div>

      {/* ---- BLUR + FADE TRANSITION: dissolves the hero into the white
              bento showcase below so there is no hard seam or gap ---- */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 inset-x-0 h-40 sm:h-48 z-10 pointer-events-none placement-hero-blur"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 inset-x-0 h-40 sm:h-48 z-10 pointer-events-none bg-gradient-to-b from-transparent via-white/60 to-white"
      />

      {/* Slide indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 pointer-events-none select-none">
        {slides.map((slide, i) => (
          <span
            key={slide.id || slide._id || i}
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

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/15 to-transparent" />

      <div className="absolute inset-0 flex items-end z-20">
        <div
          className={`w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-48 sm:pb-56 ${
            active ? "placement-hero-copy" : ""
          }`}
        >
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500 text-white text-[11px] font-black uppercase tracking-wider shadow-sm">
              <Flame size={13} />
              Featured Drive
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
            className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#0F172A] hover:bg-white/90 font-bold text-xs sm:text-sm shadow-xl transition-all cursor-pointer group/vm"
          >
            <span>View More</span>
            <ArrowRight size={16} className="transition-transform group-hover/vm:translate-x-1" />
          </button>
        </div>
      </div>
    </article>
  );
}

/* ============================================================================
 * SAMSUNG-STYLE CATEGORIZED BENTO SHOWCASE (SCROLLED CONTENT)
 * ========================================================================== */

function PlacementBentoShowcase({ events, onSelectEvent, onOpenHelp }) {
  const [pageIndex, setPageIndex] = useState(0);

  // Total pages of 5 items per bento layout
  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(events.length / pageSize));
  const currentPage = Math.min(pageIndex, totalPages - 1);

  // Get current 5 items (pad with recycled items if < 5 so layout is always pristine)
  const currentChunk = useMemo(() => {
    const start = currentPage * pageSize;
    let items = events.slice(start, start + pageSize);
    if (items.length < pageSize && events.length > 0) {
      // Pad from beginning of array to maintain 5 cards
      let padIndex = 0;
      while (items.length < pageSize && padIndex < events.length) {
        items.push(events[padIndex % events.length]);
        padIndex++;
      }
    }
    return items;
  }, [events, currentPage]);

  const handlePrev = () => {
    setPageIndex((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNext = () => {
    setPageIndex((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  // Extract 5 items for the slots
  const card0 = currentChunk[0] || events[0]; // Left Top
  const card1 = currentChunk[1] || events[1] || events[0]; // Left Bottom
  const card2 = currentChunk[2] || events[2] || events[0]; // Center Hero (Tall)
  const card3 = currentChunk[3] || events[3] || events[0]; // Right Top (Dark card)
  const card4 = currentChunk[4] || events[4] || events[0]; // Right Bottom

  return (
    <section className="w-full bg-[#FFFFFF] pt-0 pb-14 sm:pb-16 px-4 sm:px-6 lg:px-10 relative">
      <div className="max-w-[1400px] mx-auto">
        {/* -------------------------------------------------------------- */}
        {/* SAMSUNG BENTO 5-CARD SHOWCASE CONTAINER                       */}
        {/* -------------------------------------------------------------- */}
        <div className="relative group/bento">
          {/* CAROUSEL CONTROLS: LEFT & RIGHT FLOATING BUTTONS */}
          <button
            onClick={handlePrev}
            aria-label="Previous drives"
            className="absolute -left-2 sm:-left-4 lg:-left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#1A1A1A]/80 hover:bg-[#1A1A1A] text-white flex items-center justify-center backdrop-blur-md shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border border-white/10"
          >
            <ChevronLeft size={24} className="stroke-[2.5]" />
          </button>

          <button
            onClick={handleNext}
            aria-label="Next drives"
            className="absolute -right-2 sm:-right-4 lg:-right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#1A1A1A]/80 hover:bg-[#1A1A1A] text-white flex items-center justify-center backdrop-blur-md shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border border-white/10"
          >
            <ChevronRight size={24} className="stroke-[2.5]" />
          </button>

          {/* GRID LAYOUT: 3 COLUMNS (Left 2 stacked, Center 1 Tall, Right 2 stacked) */}
          <div
            key={currentPage}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch bento-fade-in"
          >
            {/* ------------------------------------------------------------ */}
            {/* LEFT COLUMN: 2 STACKED CARDS (lg:col-span-3 or 4)           */}
            {/* ------------------------------------------------------------ */}
            <div className="lg:col-span-3 flex flex-col gap-5 sm:gap-6">
              {/* TOP LEFT CARD (Grey / Studio tone) */}
              <BentoCardSmall
                event={card0}
                tone="silver"
                fallbackIcon={<Sparkles size={36} className="text-slate-400" />}
                onClick={() => onSelectEvent(card0)}
              />

              {/* BOTTOM LEFT CARD (Clean White) */}
              <BentoCardSmall
                event={card1}
                tone="white"
                fallbackIcon={<Award size={36} className="text-blue-500/50" />}
                onClick={() => onSelectEvent(card1)}
              />
            </div>

            {/* ------------------------------------------------------------ */}
            {/* CENTER COLUMN: 1 TALL FEATURED HERO CARD (lg:col-span-6)     */}
            {/* ------------------------------------------------------------ */}
            <div className="lg:col-span-6 flex">
              <BentoCardTall
                event={card2}
                onClick={() => onSelectEvent(card2)}
              />
            </div>

            {/* ------------------------------------------------------------ */}
            {/* RIGHT COLUMN: 2 STACKED CARDS (lg:col-span-3 or 4)          */}
            {/* ------------------------------------------------------------ */}
            <div className="lg:col-span-3 flex flex-col gap-5 sm:gap-6">
              {/* TOP RIGHT CARD (Dark Navy Contrast, Samsung Laptop style) */}
              <BentoCardSmall
                event={card3}
                tone="dark"
                fallbackIcon={<Laptop size={36} className="text-cyan-400/60" />}
                onClick={() => onSelectEvent(card3)}
              />

              {/* BOTTOM RIGHT CARD (Clean White / Silver) */}
              <BentoCardSmall
                event={card4}
                tone="white"
                fallbackIcon={<Briefcase size={36} className="text-indigo-500/50" />}
                onClick={() => onSelectEvent(card4)}
              />
            </div>
          </div>

          {/* PAGE DOTS INDICATOR */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPageIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentPage ? "w-8 bg-[#0F172A]" : "w-2 bg-slate-300 hover:bg-slate-400"
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

/* ============================================================================
 * SMALL BENTO CARD (Left & Right stacked items)
 * ========================================================================== */

function BentoCardSmall({ event, tone = "white", fallbackIcon, onClick }) {
  if (!event) return null;

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
        {event.poster ? (
          <img
            src={event.poster}
            alt={event.title}
            className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className={`w-full h-full rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-105 ${
              isDark
                ? "bg-white/[0.04] border border-white/10"
                : "bg-black/[0.03] border border-black/5"
            }`}
          >
            {fallbackIcon}
          </div>
        )}

        {/* Small subtle badge at top-left of image */}
        {event.badge && (
          <div className="absolute top-2 left-2">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md ${
                isDark
                  ? "bg-white/20 text-white border border-white/20"
                  : "bg-black/60 text-white border border-black/10"
              }`}
            >
              {event.badge}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Typography & Details */}
      <div className="pt-4 text-center">
        <h3
          className={`text-sm sm:text-base font-bold tracking-tight line-clamp-1 group-hover:text-[#0062A8] transition-colors ${
            isDark ? "group-hover:text-cyan-400" : ""
          }`}
        >
          {event.title}
        </h3>
        <p
          className={`text-xs mt-1 font-medium line-clamp-1 ${
            isDark ? "text-slate-300" : "text-slate-600"
          }`}
        >
          {event.subtitle || "Save up to 15%* extra"}
        </p>
      </div>
    </div>
  );
}

/* ============================================================================
 * TALL FEATURED BENTO CARD (Center full-height card)
 * ========================================================================== */

function BentoCardTall({ event, onClick }) {
  if (!event) return null;

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
      <div className="flex items-center justify-between z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-[11px] font-bold tracking-wide">
          <Flame size={13} className="text-amber-400" />
          Featured Campus Drive
        </span>
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          {relativeLabel(event)}
        </span>
      </div>

      {/* Center Showcase Visual Preview */}
      <div className="relative flex-1 my-4 flex items-center justify-center overflow-hidden">
        {event.poster ? (
          <div className="w-full max-w-sm h-full max-h-[290px] sm:max-h-[320px] rounded-2xl overflow-hidden shadow-xl border border-slate-300/60 bg-white group-hover:scale-105 transition-transform duration-500">
            <img
              src={event.poster}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full max-w-sm h-64 rounded-2xl bg-gradient-to-br from-[#0A2540] to-[#0062A8] text-white p-6 flex flex-col items-center justify-center text-center shadow-xl group-hover:scale-105 transition-transform duration-500">
            <Briefcase size={54} strokeWidth={1.5} className="text-cyan-300 mb-3" />
            <h4 className="font-extrabold text-lg text-white line-clamp-2">{event.title}</h4>
            <p className="text-xs text-white/80 mt-1">{event.department || "All Eligible Branches"}</p>
          </div>
        )}
      </div>

      {/* Bottom Typography & Details */}
      <div className="text-center pt-2 z-10">
        <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-[#0F172A] tracking-tight line-clamp-1 group-hover:text-[#0062A8] transition-colors">
          {event.title}
        </h3>
        <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1.5">
          {event.subtitle || "Starting ₹ 6.0 - 8.5 LPA* • Final Year Eligible"}
        </p>

        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0062A8] bg-blue-50 border border-blue-200/80 px-4 py-1.5 rounded-full shadow-xs group-hover:bg-[#0062A8] group-hover:text-white transition-colors">
            View Details & Apply
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * EVENT DETAIL MODAL
 * ========================================================================== */

function EventModal({ event, onClose }) {
  return (
    <>
      {/* Header */}
      <div className="relative bg-[#071E3D] text-white p-6 sm:p-7 flex flex-col justify-end shrink-0">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold border bg-rose-500/25 text-rose-200 border-rose-400/40">
            <Briefcase size={12} />
            PLACEMENT
          </span>
          <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded bg-white/10 text-slate-300">
            {relativeLabel(event)}
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold leading-tight text-white">{event.title}</h2>
        {event.subtitle && (
          <p className="text-xs sm:text-sm text-cyan-300/90 font-medium mt-1">{event.subtitle}</p>
        )}
      </div>

      {/* Body */}
      <div className="p-6 overflow-y-auto overscroll-contain space-y-4 max-h-[60vh]">
        {event.poster && (
          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-inner">
            <img
              src={event.poster}
              alt={`${event.title} poster`}
              className="w-full max-h-[50vh] object-contain bg-slate-50"
            />
          </div>
        )}

        {/* Info tags */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#64748B] pb-3 border-b border-slate-100">
          {event.date && (
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#0F172A] bg-slate-100 px-3 py-1.5 rounded-lg">
              <CalendarDays size={13} className="text-[#0062A8]" /> {formatDateString(event.date)}
            </span>
          )}
          {event.time && (
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#0F172A] bg-slate-100 px-3 py-1.5 rounded-lg">
              <Clock size={13} className="text-[#0062A8]" /> {event.time}
            </span>
          )}
          {event.venue && (
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#0F172A] bg-slate-100 px-3 py-1.5 rounded-lg">
              <MapPin size={13} className="text-[#0062A8]" /> {event.venue}
            </span>
          )}
        </div>

        {event.description && (
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal">
            {event.description}
          </div>
        )}

        {event.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {event.tags.map((tag) => (
              <span key={tag} className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Issuer */}
        <div className="text-xs text-[#64748B] pt-2 space-y-1.5 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <Users2 size={13} className="text-[#0062A8]" />
            Posted By: <strong className="text-[#0F172A]">{POSTED_BY}</strong>
          </div>
          {event.department && (
            <div className="flex items-center gap-1.5">
              <Building2 size={13} className="text-[#0062A8]" />
              Eligible Departments: <strong className="text-[#0F172A]">{event.department}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex gap-3 p-5 border-t border-slate-100 bg-slate-50/50">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-sm font-semibold text-[#0F172A] hover:bg-slate-50 transition-colors cursor-pointer"
        >
          Close
        </button>
        {event.linkUrl && event.linkUrl !== "#" && (
          <a
            href={event.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0062A8] text-white text-sm font-semibold hover:bg-[#004f87] transition-colors cursor-pointer shadow-sm"
          >
            <span>{event.linkText || "Apply / View Portal"}</span>
            <ExternalLink size={14} />
          </a>
        )}
      </div>
    </>
  );
}
