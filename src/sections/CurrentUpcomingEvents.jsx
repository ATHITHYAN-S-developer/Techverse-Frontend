/**
 * Homepage section: "CURRENT & UPCOMING EVENTS" auto-slideshow + "PAST EVENTS" grid.
 *
 * - The slideshow contains ONLY events whose date is today or in the future.
 * - Past events move below into the grid automatically.
 * - Autoplay every AUTO_PLAY_INTERVAL ms; no manual navigation controls; pauses on hover.
 * - Uses the real event date from the API (never the creation date).
 */
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Flame,
  CalendarDays,
  Building2,
  Megaphone,
  AlertCircle,
  Briefcase,
  Trophy,
  GraduationCap,
  FileText,
  PartyPopper,
  Pin,
  UserRound,
} from "lucide-react";
import { announcementService } from "../services/announcementService";
import { API_BASE_URL } from "../services/api";

const AUTO_PLAY_INTERVAL = 3000;

/* ───────────────────────────── helpers ───────────────────────────── */

function resolvePoster(item) {
  const raw = item.imageUrl || item.image || "";
  if (!raw) return "";
  if (raw.startsWith("data:") || /^https?:\/\//i.test(raw)) return raw;
  const origin = API_BASE_URL.replace(/\/api\/?$/, "");
  return `${origin}${raw.startsWith("/") ? raw : `/uploads/announcements/${raw}`}`;
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

/** "current" (today / ongoing), "upcoming" (future). */
function eventStatus(item) {
  const ev = eventDateString(item);
  if (!ev || ev === todayString()) return "current";
  return "upcoming";
}

function announcementTimestamp(item) {
  const raw = item.publishDate || item.createdAt || item.date;
  if (!raw) return 0;
  const t = new Date(raw).getTime();
  return Number.isNaN(t) ? 0 : t;
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
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
}

function formatPublishDate(item) {
  const raw = item.publishDate || item.createdAt || item.date;
  if (!raw) return "RECENT";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "RECENT";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase();
}

function deptLabel(item) {
  return item.departmentId?.code || item.departmentId?.name || item.department || "ALL DEPARTMENTS";
}

/** Name of the faculty/person who issued the announcement (populated user → stored name → fallback). */
function issuerName(item) {
  return item.createdBy?.name || item.authorName || item.author || "";
}

/* ─────────────────────── category colours ─────────────────────── */

const categoryConfig = {
  placement: { label: "PLACEMENT", badgeBg: "bg-blue-50 text-[#0062A8] border-blue-200/80", icon: Briefcase },
  hackathon: { label: "HACKATHON", badgeBg: "bg-purple-50 text-purple-700 border-purple-200/80", icon: Trophy },
  academic: { label: "ACADEMIC", badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200/80", icon: GraduationCap },
  exam: { label: "EXAM", badgeBg: "bg-amber-50 text-amber-800 border-amber-200/80", icon: FileText },
  event: { label: "EVENTS", badgeBg: "bg-rose-50 text-rose-700 border-rose-200/80", icon: PartyPopper },
  general: { label: "GENERAL", badgeBg: "bg-slate-100 text-slate-700 border-slate-200", icon: Megaphone },
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

/* ─────────────────────────────── section ─────────────────────────────── */

export default function CurrentUpcomingEvents() {
  const [announcements, setAnnouncements] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await announcementService.getAll();
        if (active) setAnnouncements(data || []);
      } catch {
        if (active) setAnnouncements([]);
      } finally {
        if (active) setLoaded(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Base sort: pinned first, then newest-first (used only for undated tie-breaks).
  const sortedAnnouncements = useMemo(() => {
    return [...announcements].sort((a, b) => {
      const aPin = a.isPinned || a.pinned ? 1 : 0;
      const bPin = b.isPinned || b.pinned ? 1 : 0;
      if (aPin !== bPin) return bPin - aPin;
      return announcementTimestamp(b) - announcementTimestamp(a);
    });
  }, [announcements]);

  // CURRENT + UPCOMING → slideshow, earliest event date first.
  const currentAnnouncements = useMemo(() => {
    return sortedAnnouncements
      .filter((a) => !isPastEvent(a))
      .sort((a, b) => {
        const aPin = a.isPinned || a.pinned ? 1 : 0;
        const bPin = b.isPinned || b.pinned ? 1 : 0;
        if (aPin !== bPin) return bPin - aPin;
        const ea = eventDateString(a);
        const eb = eventDateString(b);
        if (ea && eb && ea !== eb) return ea < eb ? -1 : 1;
        if (ea && !eb) return -1;
        if (!ea && eb) return 1;
        return announcementTimestamp(b) - announcementTimestamp(a);
      });
  }, [sortedAnnouncements]);

  // PAST → grid below, most recently ended first.
  const pastAnnouncements = useMemo(() => {
    return sortedAnnouncements
      .filter(isPastEvent)
      .sort((a, b) => {
        const ea = eventDateString(a);
        const eb = eventDateString(b);
        if (ea && eb && ea !== eb) return ea > eb ? -1 : 1;
        return announcementTimestamp(b) - announcementTimestamp(a);
      });
  }, [sortedAnnouncements]);

  // Every current/upcoming event participates in the auto-cycle (no cap).
  const slides = currentAnnouncements;

  // Keep the index valid when the list shrinks.
  useEffect(() => {
    if (slides.length > 0 && slideIndex >= slides.length) setSlideIndex(0);
  }, [slides.length, slideIndex]);

  // Autoplay every 3s — fully automatic (no manual navigation controls).
  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    const id = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, AUTO_PLAY_INTERVAL);
    return () => clearInterval(id);
  }, [slides.length, paused]);

  return (
    <section
      id="current-upcoming-events"
      className="bg-[#F7F9FC] py-16 sm:py-20"
    >
      <style>{`
        .hero-gradient {
          background: linear-gradient(135deg, #071E3D 0%, #0A3563 50%, #0062A8 100%);
        }
        .vcet-fade-in {
          animation: vcetFadeIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes vcetFadeIn {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Heading */}
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-[11px] font-black uppercase tracking-widest mb-3">
              <Flame size={13} />
              Current & Upcoming Events
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
              What's happening now — and next
            </h2>
            <p className="text-sm text-[#64748B] mt-1 font-medium">
              Events dated today or later auto-play below; past events move to the bottom.
            </p>
          </div>
          {loaded && announcements.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0062A8] bg-white px-3 py-1.5 rounded-full border border-slate-200">
                <Megaphone size={12} /> {currentAnnouncements.length} current & upcoming
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200">
                {pastAnnouncements.length} past
              </span>
            </div>
          )}
        </div>

        {!loaded ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#0062A8] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium text-[#64748B]">Loading events...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center shadow-xs">
            <AlertCircle size={40} className="text-amber-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#0F172A]">No events available</h3>
            <p className="text-sm text-[#64748B] mt-1">Check back soon for updates.</p>
          </div>
        ) : (
          <>
            {/* SLIDESHOW (current + upcoming only) */}
            {slides.length > 0 ? (
              <div className="space-y-3">
                <SlideCarousel
                  slides={slides}
                  activeIndex={slideIndex}
                  paused={paused}
                  onPause={() => setPaused(true)}
                  onResume={() => setPaused(false)}
                />
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-10 text-center shadow-xs">
                <AlertCircle size={34} className="text-amber-500 mx-auto mb-3" />
                <h3 className="text-base font-bold text-[#0F172A]">No current or upcoming events</h3>
                <p className="text-sm text-[#64748B] mt-1">The newest updates will appear here automatically.</p>
              </div>
            )}

            {/* PAST EVENTS */}
            {pastAnnouncements.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
                  <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    Past Events ({pastAnnouncements.length})
                  </h3>
                  <div className="flex-1 h-px bg-slate-200/70" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {pastAnnouncements.map((ann) => (
                    <PastEventCard key={ann._id || ann.id} item={ann} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

/* ─────────────────────────── slide carousel ─────────────────────────── */

function SlideCarousel({ slides, activeIndex, paused, onPause, onResume }) {
  const safeIndex = slides.length ? activeIndex % slides.length : 0;
  const item = slides[safeIndex];
  const catStyle = getCategoryStyle(item.category);
  const Icon = catStyle.icon;
  const poster = resolvePoster(item);
  const multiple = slides.length > 1;
  const status = eventStatus(item);
  const ev = eventDateString(item);

  return (
    <div
      className="relative rounded-3xl overflow-hidden bg-white border border-[#E2E8F0] shadow-sm hover:shadow-lg transition-shadow"
      onMouseEnter={onPause}
      onMouseLeave={onResume}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] min-h-[300px]">
        {/* Poster / Fallback Visual */}
        <div key={`poster-${safeIndex}`} className="relative min-h-[210px] lg:min-h-[300px] overflow-hidden bg-[#0A3563] vcet-fade-in">
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
          <div className="absolute inset-0 lg:bg-gradient-to-r lg:from-transparent lg:to-black/15 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>

        {/* Text Pane */}
        <div key={`text-${safeIndex}`} className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center vcet-fade-in">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider border ${catStyle.badgeBg}`}
            >
              <Icon size={12} />
              {catStyle.label}
            </span>
            {status === "upcoming" ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-50 text-[#0062A8] border border-blue-200/80 text-[10px] font-black uppercase tracking-wider">
                <CalendarDays size={11} />
                Upcoming Event
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-black uppercase tracking-wider">
                <Flame size={11} />
                Current Event
              </span>
            )}
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
            {issuerName(item) && (
              <span className="inline-flex items-center gap-1.5 font-semibold text-[#0F172A] bg-slate-100 px-2.5 py-1 rounded-md">
                <UserRound size={13} className="text-[#0062A8]" /> Issued by {issuerName(item)}
              </span>
            )}
            {ev ? (
              <span className="inline-flex items-center gap-1.5 font-bold text-[#0062A8] bg-[#E8F3FB] px-2 py-0.5 rounded">
                <CalendarDays size={13} /> Event: {formatDateString(ev)}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={13} className="text-[#0062A8]" />
                {formatPublishDate(item)}
              </span>
            )}
            {paused && multiple && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                ● Paused
              </span>
            )}
          </div>

          <Link
            to="/announcements"
            className="inline-flex items-center gap-2 self-start px-5 py-2.5 rounded-xl bg-[#0062A8] hover:bg-[#0B4A8F] text-white font-bold text-xs shadow-md transition-all cursor-pointer group/vm"
          >
            <span>View More</span>
            <ArrowRight size={14} className="group-hover/vm:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────── past event card ───────────────────────────── */

function PastEventCard({ item }) {
  const catStyle = getCategoryStyle(item.category);
  const Icon = catStyle.icon;
  const poster = resolvePoster(item);
  const ev = eventDateString(item);

  return (
    <Link
      to="/announcements"
      className="group flex flex-col bg-white rounded-2xl border border-[#E2E8F0] shadow-xs hover:shadow-lg hover:-translate-y-1 hover:border-blue-300/80 transition-all duration-200 overflow-hidden cursor-pointer"
    >
      {/* Poster / Visual */}
      <div className="relative h-28 sm:h-32 overflow-hidden bg-[#0A3563]">
        {poster ? (
          <img
            src={poster}
            alt={`${item.title} poster`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full hero-gradient flex items-center justify-center">
            <Icon size={34} strokeWidth={1.25} className="text-white/25" />
          </div>
        )}

        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black tracking-wider border shadow-sm ${catStyle.badgeBg}`}
          >
            <Icon size={10} />
            {catStyle.label}
          </span>
        </div>

        {ev && (
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-900/80 text-white text-[9px] font-black uppercase tracking-wider shadow-sm">
            Ended {formatShortDate(ev)}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-3.5 flex flex-col flex-1">
        <h4 className="text-xs font-bold text-[#0F172A] group-hover:text-[#0062A8] transition-colors leading-snug mb-1 line-clamp-2">
          {item.title}
        </h4>
        <p className="text-[11px] text-[#64748B] line-clamp-2 leading-relaxed mb-2 flex-1">
          {item.description || item.content}
        </p>
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-[10px] font-semibold text-slate-400 truncate max-w-[60%]">
            {deptLabel(item)}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0062A8]">
            View More
            <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}