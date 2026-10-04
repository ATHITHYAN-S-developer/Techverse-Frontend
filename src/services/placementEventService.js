/**
 * Placement Event Service
 * Communicates exclusively with backend MongoDB endpoints (/api/placement-events).
 */

import { apiRequest, API_BASE_URL } from "./api";

export const placementEventService = {
  /**
   * Fetch active placement drives (or all drives if params.all = true).
   * @param {object} params
   */
  async getAll(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const res = await apiRequest(`/placement-events${queryString ? `?${queryString}` : ""}`);
      if (res.success && Array.isArray(res.placementEvents)) {
        return { events: res.placementEvents, connected: true };
      }
      return { events: [], connected: true };
    } catch (err) {
      console.error("Failed to fetch placement events from MongoDB backend:", err);
      return { events: [], connected: false };
    }
  },

  async getById(id) {
    return apiRequest(`/placement-events/${id}`);
  },

  async create(eventData) {
    let body;
    let headers = {};
    if (eventData instanceof FormData) {
      body = eventData;
    } else {
      body = JSON.stringify(eventData);
      headers = { "Content-Type": "application/json" };
    }

    const token =
      localStorage.getItem("techverse_token") ||
      sessionStorage.getItem("techverse_token") ||
      localStorage.getItem("vcetTechHubToken") ||
      sessionStorage.getItem("vcetTechHubToken");
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/placement-events`, {
      method: "POST",
      headers,
      body,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || "Failed to create placement event.");
    }
    const data = await res.json();
    return data.placementEvent;
  },

  async update(id, updates) {
    let body;
    let headers = {};
    if (updates instanceof FormData) {
      body = updates;
    } else {
      body = JSON.stringify(updates);
      headers = { "Content-Type": "application/json" };
    }

    const token =
      localStorage.getItem("techverse_token") ||
      sessionStorage.getItem("techverse_token") ||
      localStorage.getItem("vcetTechHubToken") ||
      sessionStorage.getItem("vcetTechHubToken");
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/placement-events/${id}`, {
      method: "PUT",
      headers,
      body,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || "Failed to update placement event.");
    }
    const data = await res.json();
    return data.placementEvent;
  },

  async delete(id) {
    return apiRequest(`/placement-events/${id}`, { method: "DELETE" });
  },
};
