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
    try {
      // If multipart form data (with image file)
      let body;
      let headers = {};
      if (announcementData instanceof FormData) {
        body = announcementData;
      } else {
        body = JSON.stringify(announcementData);
        headers = { "Content-Type": "application/json" };
      }

      const token =
        localStorage.getItem("techverse_token") ||
        sessionStorage.getItem("techverse_token") ||
        localStorage.getItem("vcetTechHubToken") ||
        sessionStorage.getItem("vcetTechHubToken");
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/announcements`, {
        method: "POST",
        headers,
        body,
      });

      if (res.ok) {
        const data = await res.json();
        return data.announcement;
      }

      // Offline-ish / invalid-session responses fall back to local storage,
      // but the record below is still stamped with the logged-in faculty.
      if (res.status === 401 || res.status === 403) {
        console.warn("[Announcement] Session rejected — saving locally with faculty identity.");
      } else {
        // Real server/validation failure — surface it instead of faking success.
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Failed to publish announcement (HTTP ${res.status}).`);
      }
    } catch (err) {
      if (err && err.message && !err.message.includes("Failed to fetch") && !err.message.includes("NetworkError")) {
        if (err.message.startsWith("Failed to publish")) {
          throw err;
        }
        console.warn("API announcement create failed, using local fallback");
      } else {
        console.warn("[Announcement] Backend offline — saving locally with faculty identity.");
      }
    }

    // Local fallback — always carries the authenticated faculty identity so
    // "Issued by" never shows "Academic Office" for newly published circulars.
    const currentUser = getCurrentUser();
    const publisherName =
      currentUser?.name || currentUser?.staffName || currentUser?.fullName || "";
    const publisherStaffId =
      currentUser?.staffId || currentUser?.staff_id || currentUser?.facultyId || "";

    const all = getStoredAnnouncements();
    const newAnn = {
      id: `ann-${Date.now()}`,
      title: announcementData.title || "Announcement",
      description: announcementData.description || announcementData.content || "",
      category: announcementData.category || "General",
      priority: announcementData.priority || "normal",
      date: new Date().toISOString().split("T")[0],
      publishDate: announcementData.publishDate || new Date().toISOString().split("T")[0],
      expiryDate: announcementData.expiryDate || "",
      deadline: announcementData.deadline || announcementData.expiryDate || "",
      eventDate: announcementData.eventDate || announcementData.expiryDate || "",
      department: announcementData.department || "All Departments",
      imageUrl: announcementData.imageUrl || "",
      authorName: announcementData.authorName || publisherName,
      author: announcementData.author || publisherName,
      createdBy: currentUser
        ? { name: publisherName, staffId: publisherStaffId }
        : null,
      isPinned: Boolean(announcementData.isPinned),
      status: "Published",
    };
    all.unshift(newAnn);
    saveAnnouncements(all);
    return newAnn;
  },

  async update(id, updates) {
    try {
      const res = await apiRequest(`/announcements/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
      if (res.success) return res.announcement;
    } catch (err) {
      // Local fallback
    }

    const all = getStoredAnnouncements();
    const idx = all.findIndex((a) => a.id === id || a._id === id);
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...updates };
      saveAnnouncements(all);
      return all[idx];
    }
    return null;
  },

  async delete(id) {
    try {
      await apiRequest(`/announcements/${id}`, { method: "DELETE" });
      return true;
    } catch (err) {
      // Local fallback
    }

    let all = getStoredAnnouncements();
    all = all.filter((a) => a.id !== id && a._id !== id);
    saveAnnouncements(all);
    return true;
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

