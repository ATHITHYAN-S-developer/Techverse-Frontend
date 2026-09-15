/**
 * Announcement Service
 * Manages institutional circulars with priority tags, image banners, and audience targeting.
 */

import { apiRequest, API_BASE_URL } from "./api";
import { ANNOUNCEMENTS } from "../data/announcements";

const ANN_KEY = "techverse_announcements";

function getStoredAnnouncements() {
  try {
    const raw = localStorage.getItem(ANN_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return ANNOUNCEMENTS;
}

function saveAnnouncements(ann) {
  localStorage.setItem(ANN_KEY, JSON.stringify(ann));
}

export const announcementService = {
  async getAll(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const res = await apiRequest(`/announcements${queryString ? `?${queryString}` : ""}`);
      if (res.success && Array.isArray(res.announcements)) {
        return res.announcements;
      }
    } catch (err) {
      // Graceful fallback to local data
    }
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
    } catch (err) {
      console.warn("API announcement create failed, using local fallback");
    }

    const all = getStoredAnnouncements();
    const newAnn = {
      id: `ann-${Date.now()}`,
      title: announcementData.title || "Announcement",
      description: announcementData.description || announcementData.content || "",
      category: announcementData.category || "General",
      priority: announcementData.priority || "normal",
      date: new Date().toISOString().split("T")[0],
      department: announcementData.department || "All Departments",
      imageUrl: announcementData.imageUrl || "",
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
