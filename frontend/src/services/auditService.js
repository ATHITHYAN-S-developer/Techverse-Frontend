/**
 * Audit Service
 * Communicates exclusively with backend MongoDB endpoints (/api/audit).
 */

import { apiRequest } from "./api";

export const auditService = {
  async getLogs(filter = {}) {
    try {
      const queryString = new URLSearchParams(filter).toString();
      const res = await apiRequest(`/audit${queryString ? `?${queryString}` : ""}`);
      if (res.success && Array.isArray(res.logs)) {
        return res.logs;
      }
    } catch (err) {
      console.error("Failed to fetch audit logs from MongoDB backend:", err);
    }
    return [];
  },

  async logAction(actionData) {
    try {
      const res = await apiRequest("/audit", {
        method: "POST",
        body: JSON.stringify(actionData),
      });
      return res.log || actionData;
    } catch (err) {
      console.warn("Failed to write audit log to backend:", err);
      return actionData;
    }
  },
};
