/**
 * Placement Event Service
 *
 * Communicates with the backend MongoDB endpoint (/api/placement-events).
 * The Placement page holds no hardcoded drives: when the backend is
 * unreachable this returns an empty list so the page can render its
 * "no drives" state instead of stale local data.
 */

import { apiRequest } from "./api";

export const placementEventService = {
  /**
   * Fetch active placement drives.
   * @param {object} params  e.g. { limit: 100, category: "it-software" }
   * @returns {Promise<{events: Array, connected: boolean}>} `connected` is false
   *   when the backend could not be reached, which lets the page distinguish
   *   "no drives published" from "server offline".
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
};
