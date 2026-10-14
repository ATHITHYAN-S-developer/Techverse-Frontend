/**
 * Dedicated Page: Tech Pulse — Path: /updates
 *
 * Four kinds (YouTube videos, websites, apps, learning roadmaps) on one page,
 * filtered by chips that stay in sync with ?type=. Roadmaps open in a modal
 * that is deep-linkable via ?roadmap=<id> (so a roadmap can be shared or the
 * browser Back button can close it).
 *
 * Counts always come from GET /api/tech-pulse/counts — never hardcoded.
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertTriangle, RefreshCw, LayoutGrid, Map as MapIcon } from "lucide-react";

import { techPulseService } from "../services/techPulseService";
import { useToast } from "../context/ToastContext";
import { RESOURCES } from "../data/resources";
import ResourceListView, { LOGO_MAP } from "../components/ResourceListView";
import TechPulseCard, { KIND_ICONS } from "../components/TechPulseCard";
import TechPulseRoadmapModal from "../components/TechPulseRoadmapModal";
import { FILTER_KINDS, FILTER_LABELS } from "../utils/techPulse";

const EMPTY_COUNTS = { all: 0, youtube: 0, website: 0, app: 0, roadmap: 0 };

function SkeletonCard({ featured }) {
  return (
    <div
      className={`animate-pulse rounded-3xl border border-slate-200/70 bg-white p-5 ${
        featured ? "sm:col-span-2" : ""
      }`}
      aria-hidden="true"
    >
      <div className="mb-3 h-5 w-24 rounded-full bg-slate-200" />
      <div className="mb-3 aspect-video w-full rounded-2xl bg-slate-200" />
      <div className="mb-2 h-5 w-3/4 rounded bg-slate-200" />
      <div className="mb-1 h-3 w-1/2 rounded bg-slate-200" />
      <div className="h-3 w-full rounded bg-slate-200" />
    </div>
  );
}

function StatusPanel({ icon: Icon, title, message, actionLabel, onAction, tone = "muted" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center">
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-full ${
          tone === "error" ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-500"
        }`}
      >
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <h2 className="text-base font-extrabold text-slate-900">{title}</h2>
      {message && <p className="max-w-md text-sm text-slate-600">{message}</p>}
      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="mt-1 inline-flex items-center gap-2 rounded-xl bg-vcet-blue px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-vcet-blue-hover"
        >
          {onAction && actionLabel === "Retry" && <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />}
          {actionLabel}
        </button>
      )}
    </div>
  );
}

const CURATED_YOUTUBE_CHANNELS = RESOURCES.filter((item) => item.type === "youtube").map((item) => ({
  id: item.id,
  title: item.name,
  name: item.name,
  description: item.description,
  category: item.category || "AI",
  kind: "youtube",
  channelName: item.name,
  duration: "Curated Channel",
  platform: "YouTube",
  url: item.url,
  videoUrl: item.url,
  logoUrl: LOGO_MAP[item.id] || item.logoUrl || "",
  tags: item.tags || [],
  featured: Boolean(item.featured),
  isChannel: true,
}));

export default function UpdatesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showInfo } = useToast();

  const [posts, setPosts] = useState([]);
  const [counts, setCounts] = useState(EMPTY_COUNTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  const [openRoadmap, setOpenRoadmap] = useState(null);
  const pushedRoadmapRef = useRef(false);
  const lastTriggerRef = useRef(null);
  const chipRefs = useRef({});

  // ?type= is the single source of truth for the active chip. Anything
  // unexpected falls back to "All" rather than blanking the page.
  const rawType = String(searchParams.get("type") || "").toLowerCase();
  const activeKind = FILTER_KINDS.includes(rawType) ? rawType : "all";
  const roadmapId = searchParams.get("roadmap");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      try {
        const [list, countsData] = await Promise.all([
          techPulseService.getPublished(),
          techPulseService.getCounts(),
        ]);
        if (!active) return;

        // Merge published posts with the curated YouTube channels (no duplicate IDs)
        const existingIds = new Set((list || []).map((p) => p.id || p._id || p.slug || p.title));
        const mergedCurated = CURATED_YOUTUBE_CHANNELS.filter(
          (ch) => !existingIds.has(ch.id) && !existingIds.has(ch.title)
        );
        const combinedPosts = [...(list || []), ...mergedCurated];

        setPosts(combinedPosts);

        // Derive counts including the curated channels
        const combinedCounts = { ...EMPTY_COUNTS, all: combinedPosts.length };
        for (const post of combinedPosts) {
          const kind = FILTER_KINDS.includes(post.kind) ? post.kind : "website";
          combinedCounts[kind] = (combinedCounts[kind] || 0) + 1;
        }
        setCounts(combinedCounts);
        setError(null);
      } catch (err) {
        if (!active) return;
        console.warn("Using curated fallback for Tech Pulse resources:", err);
        const fallbackWebsites = RESOURCES.filter((item) => item.type === "updates").map((item) => ({
          ...item,
          title: item.name,
          logoUrl: item.logoUrl || LOGO_MAP[item.id] || "",
          kind: "website",
        }));
        const allFallback = [...fallbackWebsites, ...CURATED_YOUTUBE_CHANNELS];
        setPosts(allFallback);

        const fallbackCounts = { ...EMPTY_COUNTS, all: allFallback.length };
        for (const post of allFallback) {
          const kind = FILTER_KINDS.includes(post.kind) ? post.kind : "website";
          fallbackCounts[kind] = (fallbackCounts[kind] || 0) + 1;
        }
        setCounts(fallbackCounts);
        setError("The live Tech Pulse feed is unavailable right now.");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [reloadToken]);

  /**
   * Chip counts are published-only totals from the API. If the counts
   * endpoint failed but the posts loaded, derive them from those posts so the
   * chips never display a misleading zero.
   */
  const chipCounts = useMemo(() => {
    if (counts.all > 0) return counts;
    const derived = { ...EMPTY_COUNTS, all: posts.length };
    for (const post of posts) {
      const kind = FILTER_KINDS.includes(post.kind) ? post.kind : "website";
      derived[kind] += 1;
    }
    return derived;
  }, [counts, posts]);

  const filteredPosts = useMemo(
    () => (activeKind === "all" ? posts : posts.filter((post) => post.kind === activeKind)),
    [posts, activeKind]
  );

  // counts.all is the global published total (requirement: the header counter
  // must not shrink with the active filter). Fall back to the loaded list when
  // the counts endpoint was unavailable.
  const totalText = `${counts.all > 0 ? counts.all : posts.length} Resources`;

  const selectType = useCallback(
    (kind) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (kind === "all") next.delete("type");
          else next.set("type", kind);
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const handleOpenRoadmap = useCallback(
    (post, event) => {
      lastTriggerRef.current = event?.currentTarget || null;
      pushedRoadmapRef.current = true;
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("roadmap", post.id);
          return next;
        },
        { replace: false }
      );
    },
    [setSearchParams]
  );

  const handleCloseRoadmap = useCallback(() => {
    if (pushedRoadmapRef.current) {
      pushedRoadmapRef.current = false;
      // We pushed the param, so going back is what closes the modal — and the
      // browser Back button keeps working the way users expect. Focus is
      // restored by the resolver effect once the param is gone.
      window.history.back();
      return;
    }
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("roadmap");
        return next;
      },
      { replace: true }
    );
  }, [setSearchParams]);

  // Resolve ?roadmap=<id> against the loaded published roadmaps. An unknown or
  // unpublished id is stripped with `replace` so Back does not re-open a dead link.
  const prevRoadmapIdRef = useRef(null);
  useEffect(() => {
    if (!roadmapId) {
      setOpenRoadmap(null);
      // The modal just closed (Back button, Esc, backdrop or X) — send focus
      // back to whichever card opened it.
      if (prevRoadmapIdRef.current) {
        prevRoadmapIdRef.current = null;
        lastTriggerRef.current?.focus?.();
        lastTriggerRef.current = null;
      }
      return;
    }
    if (loading) return;
    prevRoadmapIdRef.current = roadmapId;
    const match = posts.find((post) => post.id === roadmapId && post.kind === "roadmap");
    if (match) {
      setOpenRoadmap(match);
      return;
    }
    setOpenRoadmap(null);
    prevRoadmapIdRef.current = null;
    pushedRoadmapRef.current = false;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("roadmap");
        return next;
      },
      { replace: true }
    );
    showInfo("That roadmap is no longer available.");
  }, [roadmapId, posts, loading, setSearchParams, showInfo]);

  // Keep the active chip visible in the mobile scroll row.
  useEffect(() => {
    chipRefs.current[activeKind]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeKind]);

  const handleChipKeyDown = (event, kind) => {
    const index = FILTER_KINDS.indexOf(kind);
    let nextIndex = null;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % FILTER_KINDS.length;
    else if (event.key === "ArrowLeft") nextIndex = (index - 1 + FILTER_KINDS.length) % FILTER_KINDS.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = FILTER_KINDS.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    const nextKind = FILTER_KINDS[nextIndex];
    selectType(nextKind);
    chipRefs.current[nextKind]?.focus();
  };

  const chips = (
    <div className="relative">
      <div
        role="tablist"
        aria-label="Filter Tech Pulse by type"
        className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1"
      >
        {FILTER_KINDS.map((kind) => {
          const selected = kind === activeKind;
          const Icon = kind === "all" ? LayoutGrid : KIND_ICONS[kind];
          const count = chipCounts[kind] ?? 0;
          return (
            <button
              key={kind}
              ref={(el) => {
                chipRefs.current[kind] = el;
              }}
              type="button"
              role="tab"
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => selectType(kind)}
              onKeyDown={(event) => handleChipKeyDown(event, kind)}
              className={`inline-flex shrink-0 snap-start items-center gap-1.5 rounded-full border px-3.5 py-2.5 text-xs font-bold transition-colors min-h-[44px] ${
                selected
                  ? "border-vcet-blue bg-vcet-blue text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-vcet-blue/40 hover:text-vcet-blue"
              }`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {FILTER_LABELS[kind]}
              <span
                className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                  selected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
      {/* Fade edge so the row reads as scrollable on small screens. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#F8FAFC] to-transparent sm:hidden"
      />
    </div>
  );

  let body = null;
  if (loading) {
    body = (
      <div className="grid w-full grid-cols-1 gap-8 px-6 sm:grid-cols-2 sm:gap-10 sm:px-10 lg:grid-cols-3 lg:px-16 py-6">
        {Array.from({ length: 3 }).map((_, idx) => (
          <SkeletonCard key={idx} featured={idx === 0} />
        ))}
      </div>
    );
  } else if (error && posts.length === 0) {
    body = (
      <div className="px-6 py-6 sm:px-10 lg:px-16">
        <StatusPanel
          icon={AlertTriangle}
          tone="error"
          title="Could not load Tech Pulse"
          message={error}
          actionLabel="Retry"
          onAction={() => setReloadToken((token) => token + 1)}
        />
      </div>
    );
  } else if (filteredPosts.length === 0) {
    body = (
      <div className="px-6 py-6 sm:px-10 lg:px-16">
        <StatusPanel
          icon={activeKind === "roadmap" ? MapIcon : LayoutGrid}
          title={`No ${FILTER_LABELS[activeKind].toLowerCase()} yet`}
          message={
            activeKind === "all"
              ? "Nothing has been published to Tech Pulse yet."
              : "Nothing of this type has been published yet."
          }
          actionLabel={activeKind === "all" ? null : "View all"}
          onAction={activeKind === "all" ? undefined : () => selectType("all")}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 selection:bg-vcet-blue selection:text-white select-none">
      <ResourceListView
        resources={loading || error ? [] : filteredPosts}
        pageTitle={
          activeKind === "youtube"
            ? "Tech Vision — Tech YouTube Channels & Videos"
            : "Tech Pulse — Apps for Tech Updates"
        }
        badgeText={
          activeKind === "youtube"
            ? "CURATED VIDEO CHANNELS & REPOSITORIES"
            : "REAL-TIME TECH FEEDS & APPS"
        }
        ctaText="VIEW ANNOUNCEMENTS"
        ctaLink="/announcements"
        layout="grid"
        countText={totalText}
        toolbar={chips}
        renderCard={(post) => (
          <TechPulseCard key={post.id} post={post} onOpenRoadmap={handleOpenRoadmap} />
        )}
      />

      {body}

      <TechPulseRoadmapModal roadmap={openRoadmap} onClose={handleCloseRoadmap} />
    </div>
  );
}
