/**
 * Resource Service
 * Manages academic notes, question banks, previous year papers, lab manuals, and software.
 * Uploads are sent as multipart/form-data so PDFs/docs/images land in the server folder.
 */

import api, { apiRequest, API_BASE_URL } from "./api";

export function resolveResourceUrl(url) {
  if (!url) return url;
  if (/^https?:\/\//.test(url)) return url;
  const origin = API_BASE_URL.replace(/\/api\/?$/, "");
  if (url.startsWith("/uploads/") || url.startsWith("/api/")) return `${origin}${url}`;
  return url;
}

export const RESOURCE_TYPES = [
  { value: "notes", label: "Unit Lecture Notes" },
  { value: "question_bank", label: "Question Bank" },
  { value: "previous_paper", label: "Previous University Papers" },
  { value: "lab_manual", label: "Lab Manual" },
  { value: "software", label: "Software & Tools" },
  { value: "syllabus", label: "Syllabus" },
  { value: "project", label: "Project / Mini Project" },
  { value: "reference", label: "Reference Material" },
  { value: "video", label: "Lecture Video Link" },
  { value: "website", label: "Website / External Link" },
];

function buildResourceFormData(payload) {
  const fd = new FormData();
  fd.append("title", payload.title || "");
  fd.append("description", payload.description || "");
  fd.append("departmentId", payload.departmentId || "");
  fd.append("subjectId", payload.subjectId || "");
  fd.append("type", payload.type || "notes");
  if (payload.unit) fd.append("unit", String(payload.unit));
  if (Array.isArray(payload.tags) && payload.tags.length > 0) {
    fd.append("tags", payload.tags.join(","));
  }
  if (payload.externalUrl) fd.append("externalUrl", payload.externalUrl);
  if (payload.isPublished !== undefined) fd.append("isPublished", payload.isPublished ? "true" : "false");
  if (payload.file instanceof File && payload.file.size > 0) {
    fd.append("file", payload.file);
  }
  return fd;
}

export const resourceService = {
  async getAllResources({ all = false } = {}) {
    const res = await apiRequest(`/resources${all ? "?all=true" : ""}`);
    return Array.isArray(res) ? res : res?.resources || res?.data || [];
  },

  async getResourcesBySubject(subjectId) {
    const res = await apiRequest(`/resources?subjectId=${encodeURIComponent(subjectId || "")}`);
    return Array.isArray(res) ? res : res?.resources || res?.data || [];
  },

  async addResource(payload) {
    const fd = buildResourceFormData(payload);
    const res = await api.post("/resources", fd);
    return res?.resource || res?.data || res;
  },

  async updateResource(resId, payload) {
    const fd = buildResourceFormData(payload);
    const res = await api.put(`/resources/${resId}`, fd);
    return res?.resource || res?.data || res;
  },

  async deleteResource(resId) {
    await api.delete(`/resources/${resId}`);
    return true;
  },

  async trackDownload(resId) {
    await api.post(`/resources/${resId}/download`);
  },
};