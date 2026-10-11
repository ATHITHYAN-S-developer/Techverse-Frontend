/**
 * TechPulseCard
 * One card component, four variants (youtube | website | app | roadmap) sharing
 * a single outer shell so a mixed grid still reads as one feed.
 *
 * Interaction model — exactly one interactive element per card, so screen
 * readers never announce the same destination twice:
 *   - youtube / website / app → one <a> whose ::after stretches over the card
 *   - roadmap                 → one <button> that opens the step modal
 * The CTA at the bottom of the card is therefore decorative (pointer-events-none).
 */

import React, { useState } from "react";
import { Youtube, Globe, Smartphone, Map, Play, ExternalLink, Sparkles } from "lucide-react";
import {
  KIND_LABELS,
  youtubeThumb,
  faviconUrl,
  hostFromUrl,
} from "../utils/techPulse";

export const KIND_ICONS = {
  youtube: Youtube,
  website: Globe,
  app: Smartphone,
  roadmap: Map,
};

const KIND_MEDIA_TINT = {
  youtube: "from-red-500/15 via-white to-white",
  website: "from-vcet-blue/12 via-white to-white",
  app: "from-emerald-500/12 via-white to-white",
  roadmap: "from-vcet-blue-deep/15 via-vcet-blue/8 to-white",
};

/** aspect-video media block that degrades: hotlink → uploaded logo → kind icon. */
function CardMedia({ post, kind }) {
  const uploaded = post.logoUrl || "";
  const hotlink =
    kind === "youtube"
      ? youtubeThumb(post.videoId)
      : faviconUrl(post.url || post.webUrl || post.playStoreUrl || post.appStoreUrl);

  // Prefer the admin's uploaded image; fall back to the hotlinked one.
  const sources = [uploaded, hotlink].filter(Boolean);
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const src = sources[index];
  const Icon = KIND_ICONS[kind] || Globe;

  return (
    <div
      className={`relative w-full aspect-video rounded-2xl overflow-hidden bg-gradient-to-br ${
        KIND_MEDIA_TINT[kind] || KIND_MEDIA_TINT.website
      } border border-slate-200/70`}
    >
      {/* Skeleton shimmer until the image settles (or forever, if there is none). */}
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-slate-200/60" aria-hidden="true" />
      )}

      {src ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          onError={() => {
            setLoaded(false);
            setIndex((i) => i + 1);
          }}
          className={`absolute inset-0 h-full w-full transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          } ${kind === "youtube" ? "object-cover" : "object-contain p-6"}`}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="h-12 w-12 text-vcet-blue/45" strokeWidth={1.5} aria-hidden="true" />
        </div>
      )}

      {kind === "youtube" && (
        <span
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/65 backdrop-blur-sm ring-1 ring-white/40">
            <Play className="h-5 w-5 translate-x-px fill-white text-white" />
          </span>
        </span>
      )}

      {kind === "app" && post.platform && (
        <span className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-slate-900/75 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
          {post.platform}
        </span>
      )}
    </div>
  );
}

/** Short numbered preview so a roadmap reads as a roadmap before you open it. */
function StepPreview({ steps }) {
  const preview = steps.slice(0, 3);
  if (!preview.length) return null;
  return (
    <ol className="mt-1 space-y-1.5">
      {preview.map((step, idx) => (
        <li key={`${step.title}-${idx}`} className="flex items-start gap-2 text-xs text-slate-600">
          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-vcet-blue/12 text-[9px] font-black text-vcet-blue">
            {idx + 1}
          </span>
          <span className="line-clamp-1">{step.title}</span>
        </li>
      ))}
      {steps.length > 3 && (
        <li className="pl-6 text-[11px] font-semibold text-vcet-blue">
          + {steps.length - 3} more step{steps.length - 3 === 1 ? "" : "s"}
        </li>
      )}
    </ol>
  );
}

export default function TechPulseCard({ post, onOpenRoadmap }) {
  if (!post) return null;
  const kind = post.kind || "website";
  const isRoadmap = kind === "roadmap";
  const Icon = KIND_ICONS[kind] || Globe;
  const featured = Boolean(post.featured);

  const href = post.url || post.webUrl || post.playStoreUrl || post.appStoreUrl || "";
  const metaLine =
    kind === "youtube"
      ? [post.channelName, post.duration].filter(Boolean).join(" · ")
      : kind === "website"
        ? post.sourceName || hostFromUrl(post.url)
        : kind === "app"
          ? [post.appName, post.platform].filter(Boolean).join(" · ")
          : [post.level, post.durationText, `${post.steps?.length || 0} steps`]
              .filter(Boolean)
              .join(" · ");

  const shell =
    "group/card relative flex h-full flex-col rounded-3xl border border-slate-200/80 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus-within:outline-none focus-within:ring-2 focus-within:ring-vcet-blue focus-within:ring-offset-2";

  return (
    <article className={`${shell} ${featured ? "sm:col-span-2" : ""}`}>
      {/* Top row: kind badge + meta + optional Top Pick */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-vcet-blue/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-vcet-blue">
          <Icon className="h-3 w-3" aria-hidden="true" />
          {KIND_LABELS[kind] || kind}
        </span>
        {featured && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-800">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            Top Pick
          </span>
        )}
      </div>

      <div className="mb-3">
        <CardMedia post={post} kind={kind} />
      </div>

      <h3 className="text-lg font-extrabold leading-snug tracking-tight text-slate-900 transition-colors group-hover/card:text-vcet-blue">
        {isRoadmap ? (
          <button
            type="button"
            onClick={(event) => onOpenRoadmap?.(post, event)}
            className="text-left after:absolute after:inset-0 after:content-[''] after:z-[1]"
          >
            {post.title}
          </button>
        ) : (
          <a
            href={href || undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="after:absolute after:inset-0 after:content-[''] after:z-[1]"
          >
            {post.title}
          </a>
        )}
      </h3>

      {metaLine && (
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {metaLine}
        </p>
      )}

      {post.description && (
        <p className="mt-2 text-sm leading-relaxed text-slate-600 line-clamp-3">
          {post.description}
        </p>
      )}

      {isRoadmap && <StepPreview steps={post.steps || []} />}

      {!isRoadmap && post.tags?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* CTA row pinned to the bottom so equal-height cards line up.
          Decorative: the card's single interactive element already covers it. */}
      <div className="mt-auto flex items-center justify-between border-t border-slate-200/70 pt-4">
        <span className="text-[11px] text-slate-500">
          {isRoadmap ? "Step-by-step path" : hostFromUrl(href) || KIND_LABELS[kind]}
        </span>
        <span className="pointer-events-none inline-flex items-center gap-1.5 text-xs font-bold text-vcet-blue">
          <span className="border-b-2 border-vcet-blue pb-0.5">
            {isRoadmap ? "View roadmap" : "Open"}
          </span>
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}
