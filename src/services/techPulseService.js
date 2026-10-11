/**
 * Tech Pulse Service
 * Manages the dedicated Tech Pulse feed (`/api/tech-pulse`): admin-published
 * link cards across four kinds — youtube | website | app | roadmap — with an
 * optional uploaded logo.
 */

import { apiRequest, API_BASE_URL } from "./api";
import { TECH_PULSE_KINDS, FILTER_KINDS } from "../utils/techPulse";

export function resolveTechPulseLogo(logoUrl) {
  if (!logoUrl) return logoUrl;
  if (/^https?:\/\//.test(logoUrl) || logoUrl.startsWith("data:")) return logoUrl;
  const origin = API_BASE_URL.replace(/\/api\/?$/, "");
  if (logoUrl.startsWith("/uploads/") || logoUrl.startsWith("/api/")) {
    return `${origin}${logoUrl}`;
  }
  return `${origin}/uploads/tech-pulse/${logoUrl}`;
}

const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeTags = (tags) => {
  if (Array.isArray(tags)) return tags;
  return String(tags || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
};

const normalizeSteps = (steps) =>
  (Array.isArray(steps) ? steps : []).map((step) => ({
    title: String(step?.title ?? "").trim(),
    url: String(step?.url ?? "").trim(),
    description: String(step?.description ?? "").trim(),
    resourceType: String(step?.resourceType ?? "Article").trim() || "Article",
  }));

const normalizePost = (p) => {
  if (!p) return p;
  // Rows written before the kind discriminator existed are websites.
  const kind = TECH_PULSE_KINDS.includes(p.kind) ? p.kind : "website";
  return {
    ...p,
    id: p.id || p._id,
    // The public list view is rendered by ResourceListView, which keys the
    // card icon off `type` and `category`.
    type: p.type || "updates",
    kind,
    name: p.name || p.title,
    slug: p.slug || slugify(p.title),
    tags: normalizeTags(p.tags),
    steps: normalizeSteps(p.steps),
    logoUrl: resolveTechPulseLogo(p.logoUrl),
    url: p.url || p.externalUrl || "",
    // Kind-specific links, used by the cards for the real outbound target.
    videoUrl: p.videoUrl || "",
    videoId: p.videoId || "",
    channelName: p.channelName || "",
    duration: p.duration || "",
    sourceName: p.sourceName || "",
    appName: p.appName || "",
    playStoreUrl: p.playStoreUrl || "",
    appStoreUrl: p.appStoreUrl || "",
    webUrl: p.webUrl || "",
    platform: p.platform || "",
    level: p.level || "Beginner",
    durationText: p.durationText || "",
  };
};

const appendArray = (fd, key, items) => {
  if (!items?.length) return;
  fd.append(key, JSON.stringify(items));
};

/**
 * Builds the multipart payload the admin form submits. Steps travel as a JSON
 * string because multer's text fields cannot carry nested objects.
 */
export function buildTechPulseFormData(payload) {
  if (payload instanceof FormData) return payload;
  const fd = new FormData();
  fd.append("kind", payload.kind || "website");
  fd.append("title", payload.title || "");
  fd.append("url", payload.url || payload.externalUrl || "");
  fd.append("description", payload.description || "");
  fd.append("category", payload.category || "Technology News");
  fd.append("platform", payload.platform || "");

  // kind-specific text fields (empty strings clear them on update)
  fd.append("videoUrl", payload.videoUrl || "");
  fd.append("channelName", payload.channelName || "");
  fd.append("duration", payload.duration || "");
  fd.append("sourceName", payload.sourceName || "");
  fd.append("appName", payload.appName || "");
  fd.append("playStoreUrl", payload.playStoreUrl || "");
  fd.append("appStoreUrl", payload.appStoreUrl || "");
  fd.append("webUrl", payload.webUrl || "");
  fd.append("level", payload.level || "Beginner");
  fd.append("durationText", payload.durationText || "");
  appendArray(fd, "steps", normalizeSteps(payload.steps));

  const tags = normalizeTags(payload.tags);
  if (tags.length > 0) fd.append("tags", tags.join(","));
  fd.append("featured", payload.featured ? "true" : "false");
  fd.append("isPublished", payload.isPublished ? "true" : "false");
  if (payload.logo instanceof File && payload.logo.size > 0) {
    fd.append("logo", payload.logo);
  }
  if (payload.removeLogo) fd.append("removeLogo", "true");
  return fd;
}

export const techPulseService = {
  /**
   * Published posts, newest first.
   * @param {{kind?: string}} params  optional kind filter
   * @throws when the API is unreachable — callers decide how to degrade.
   */
  async getPublished(params = {}) {
    const query = new URLSearchParams();
    if (params.kind && FILTER_KINDS.includes(params.kind) && params.kind !== "all") {
      query.set("kind", params.kind);
    }
    const queryString = query.toString();
    const res = await apiRequest(`/tech-pulse${queryString ? `?${queryString}` : ""}`);
    if (res?.success && Array.isArray(res.posts)) return res.posts.map(normalizePost);
    throw new Error(res?.message || "Tech Pulse feed unavailable.");
  },

  /**
   * Published totals per kind for the filter chips. Never throws: a missing
   * counts response must not take the whole page down, so we degrade to zeros
   * (the "All" chip keeps working off the posts we already loaded).
   */
  async getCounts() {
    const empty = { all: 0, youtube: 0, website: 0, app: 0, roadmap: 0 };
    try {
      const res = await apiRequest("/tech-pulse/counts");
      if (!res?.success || !res.counts) return empty;
      return { ...empty, ...res.counts };
    } catch (err) {
      console.warn("Tech Pulse counts unavailable:", err);
      return empty;
    }
  },

  async getCount() {
    try {
      const res = await apiRequest("/tech-pulse/count");
      if (res.success && typeof res.count === "number") return res.count;
    } catch (err) {
      console.warn("Tech Pulse count unavailable:", err);
    }
    return 0;
  },

  /** Single post by id. Throws when missing so deep links can fall back. */
  async getById(id) {
    const res = await apiRequest(`/tech-pulse/${id}`);
    if (res?.success && res.post) return normalizePost(res.post);
    throw new Error(res?.message || "Post not found.");
  },

  async getAllAdmin(params = {}) {
    const query = new URLSearchParams();
    if (params.kind && FILTER_KINDS.includes(params.kind) && params.kind !== "all") {
      query.set("kind", params.kind);
    }
    const queryString = query.toString();
    const res = await apiRequest(`/tech-pulse/admin${queryString ? `?${queryString}` : ""}`);
    if (res.success && Array.isArray(res.posts)) return res.posts.map(normalizePost);
    return [];
  },

  async create(payload) {
    const res = await apiRequest("/tech-pulse", {
      method: "POST",
      body: buildTechPulseFormData(payload),
    });
    if (res.success && res.post) return normalizePost(res.post);
    const error = new Error(res.message || "Failed to publish post.");
    error.fieldErrors = res.errors || null;
    throw error;
  },

  async update(id, payload) {
    const res = await apiRequest(`/tech-pulse/${id}`, {
      method: "PUT",
      body: buildTechPulseFormData(payload),
    });
    if (res.success && res.post) return normalizePost(res.post);
    const error = new Error(res.message || "Failed to update post.");
    error.fieldErrors = res.errors || null;
    throw error;
  },

  async remove(id) {
    const res = await apiRequest(`/tech-pulse/${id}`, { method: "DELETE" });
    return Boolean(res.success);
  },
};
