/**
 * Tech Pulse Service
 * Manages the dedicated Tech Pulse feed (`/api/tech-pulse`): admin-published link
 * cards with an optional uploaded logo. Replaces the old `type: "updates"`
 * resource rows.
 */

import { apiRequest, API_BASE_URL } from "./api";

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

const normalizePost = (p) => {
  if (!p) return p;
  return {
    ...p,
    id: p.id || p._id,
    // The public list view is rendered by ResourceListView, which keys the
    // card icon off `type` and `category`.
    type: p.type || "updates",
    name: p.name || p.title,
    slug: p.slug || slugify(p.title),
    tags: normalizeTags(p.tags),
    logoUrl: resolveTechPulseLogo(p.logoUrl),
    url: p.url || p.externalUrl || "",
  };
};

export function buildTechPulseFormData(payload) {
  if (payload instanceof FormData) return payload;
  const fd = new FormData();
  fd.append("title", payload.title || "");
  fd.append("url", payload.url || payload.externalUrl || "");
  fd.append("description", payload.description || "");
  fd.append("category", payload.category || "Technology News");
  fd.append("platform", payload.platform || "");
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
  async getPublished(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const res = await apiRequest(`/tech-pulse${queryString ? `?${queryString}` : ""}`);
      if (res.success && Array.isArray(res.posts)) {
        return res.posts.map(normalizePost);
      }
    } catch (err) {
      console.warn("Tech Pulse feed unavailable, using curated fallback:", err);
    }
    return [];
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

  async getAllAdmin() {
    const res = await apiRequest("/tech-pulse/admin");
    if (res.success && Array.isArray(res.posts)) return res.posts.map(normalizePost);
    return [];
  },

  async create(payload) {
    const res = await apiRequest("/tech-pulse", {
      method: "POST",
      body: buildTechPulseFormData(payload),
    });
    if (res.success && res.post) return normalizePost(res.post);
    throw new Error(res.message || "Failed to publish post.");
  },

  async update(id, payload) {
    const res = await apiRequest(`/tech-pulse/${id}`, {
      method: "PUT",
      body: buildTechPulseFormData(payload),
    });
    if (res.success && res.post) return normalizePost(res.post);
    throw new Error(res.message || "Failed to update post.");
  },

  async remove(id) {
    const res = await apiRequest(`/tech-pulse/${id}`, { method: "DELETE" });
    return Boolean(res.success);
  },
};
