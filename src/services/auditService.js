/**
 * Audit Service
 * Manages security audit logs for administrative monitoring.
 */

import { AUDIT_LOGS } from "../data/auditLogsData";

const AUDIT_KEY = "techverse_audit_logs";

function getStoredLogs() {
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return AUDIT_LOGS;
}

export const auditService = {
  async getLogs(filter = {}) {
    let logs = getStoredLogs();
    if (filter.action && filter.action !== "ALL") {
      logs = logs.filter((l) => l.action === filter.action);
    }
    if (filter.role && filter.role !== "ALL") {
      logs = logs.filter((l) => l.userRole === filter.role);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.userName.toLowerCase().includes(q) ||
          l.userIdentifier.toLowerCase().includes(q) ||
          l.details.toLowerCase().includes(q) ||
          l.resourceId.toLowerCase().includes(q)
      );
    }
    return logs;
  },

  async logAction(actionData) {
    const logs = getStoredLogs();
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: "SUCCESS",
      ipAddress: "192.168.1.100",
      ...actionData
    };
    logs.unshift(newLog);
    localStorage.setItem(AUDIT_KEY, JSON.stringify(logs));
    return newLog;
  }
};
