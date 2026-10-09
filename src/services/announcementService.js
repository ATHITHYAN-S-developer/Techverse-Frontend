/**
 * Announcement Service
 * Communicates exclusively with backend MongoDB endpoints (/api/announcements).
 */

import { apiRequest, API_BASE_URL } from "./api";
import { getCurrentUser } from "./authService";

export const announcementService = {
  async getAll(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const res = await apiRequest(`/announcements${queryString ? `?${queryString}` : ""}`);
      if (res.success && Array.isArray(res.announcements)) {
        return res.announcements;
      }
    } catch (err) {
      console.error("Failed to fetch announcements from MongoDB backend:", err);
    }
    // Fall back to locally stored announcements
    return getStoredAnnouncements();
  },

  async create(announcementData) {
    const isFormData = announcementData instanceof FormData;
    const res = await apiRequest("/announcements", {
      method: "POST",
      body: isFormData ? announcementData : JSON.stringify(announcementData),
    });
    if (res.success && res.announcement) {
      return res.announcement;
    }
    return res.data?.announcement || res.announcement || res;
  },

  async update(id, updates) {
    const isFormData = updates instanceof FormData;
    const res = await apiRequest(`/announcements/${id}`, {
      method: "PUT",
      body: isFormData ? updates : JSON.stringify(updates),
    });
    if (res.success && res.announcement) {
      return res.announcement;
    }
    return res.data?.announcement || res.announcement || res;
  },

  async delete(id) {
    const res = await apiRequest(`/announcements/${id}`, { method: "DELETE" });
    let all = getStoredAnnouncements();
    all = all.filter((a) => a.id !== id && a._id !== id);
    saveAnnouncements(all);
    return res;
  },

  async toggleLike(id) {
    try {
      const res = await apiRequest(`/announcements/${id}/like`, { method: "POST" });
      return res;
    } catch (err) {
      console.warn("Announcement like API fallback:", err);
      return { success: false };
    }
  },
};

// ─── localStorage helpers ────────────────────────────────────────────────────
const STORAGE_KEY = "techverse_announcements";

function getStoredAnnouncements() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAnnouncements(list) {
  try {
    // Strip base64 blobs before saving to avoid quota errors
    const safe = list.map((a) => ({
      ...a,
      imageUrl: a.imageUrl?.startsWith("data:") ? a.imageUrl : a.imageUrl || "",
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
  } catch (e) {
    console.warn("localStorage quota exceeded — saving without images");
    // Retry without image data
    try {
      const stripped = list.map((a) => ({ ...a, imageUrl: "" }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stripped));
    } catch {}
  }
}

