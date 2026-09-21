/**
 * Resource Service
 * Manages academic notes, question banks, previous year papers, lab manuals, software, youtube, updates, technology, aptitude.
 * Uploads are sent as multipart/form-data so PDFs/docs/images land in the server folder, with JSON fallback.
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
  if (payload instanceof FormData) return payload;
  const fd = new FormData();
  fd.append("title", payload.title || payload.name || "");
  fd.append("description", payload.description || "");
  if (payload.departmentId) fd.append("departmentId", payload.departmentId);
  if (payload.department) fd.append("department", payload.department);
  if (payload.subjectId) fd.append("subjectId", payload.subjectId);
  if (payload.subjectCode) fd.append("subjectCode", payload.subjectCode);
  if (payload.subjectName) fd.append("subjectName", payload.subjectName);
  if (payload.semester) fd.append("semester", String(payload.semester));
  fd.append("type", payload.type || "notes");
  if (payload.unit) fd.append("unit", String(payload.unit));
  if (Array.isArray(payload.tags) && payload.tags.length > 0) {
    fd.append("tags", payload.tags.join(","));
  }
  if (payload.externalUrl || payload.url) fd.append("externalUrl", payload.externalUrl || payload.url);
  if (payload.isPublished !== undefined) fd.append("isPublished", payload.isPublished ? "true" : "false");
  if (payload.file instanceof File && payload.file.size > 0) {
    fd.append("file", payload.file);
  }
  return fd;
}

const normalizeResource = (r) => {
  if (!r) return r;
  return {
    ...r,
    id: r.id || r._id,
    name: r.name || r.title,
    title: r.title || r.name,
    description: r.description || "",
    url: r.url || r.externalUrl || r.fileUrl || "#",
    category: r.category || "General",
    type: r.type || "notes",
    tags: Array.isArray(r.tags) ? r.tags : [],
  };
};

export const resourceService = {
  async getAllResources({ all = false } = {}) {
    try {
      const res = await apiRequest(`/resources${all ? "?all=true" : ""}`);
      const list = Array.isArray(res) ? res : res?.resources || res?.data || [];
      return list.map(normalizeResource);
    } catch (e) {
      console.warn("Could not fetch resources:", e);
      return [];
    }
  },

  async getResourcesByType(type) {
    try {
      const res = await apiRequest(`/resources?type=${encodeURIComponent(type || "")}`);
      const list = Array.isArray(res) ? res : res?.resources || res?.data || [];
      return list.map(normalizeResource);
    } catch (e) {
      console.warn("Could not fetch resources by type:", e);
      return [];
    }
  },

  async getResourcesByDepartment(deptCode) {
    try {
      const res = await apiRequest(`/resources?department=${encodeURIComponent(deptCode || "")}`);
      const list = Array.isArray(res) ? res : res?.resources || res?.data || [];
      return list.map(normalizeResource);
    } catch (e) {
      return [];
    }
  },

  async getResourcesBySubject(subjectId) {
    try {
      const res = await apiRequest(`/resources?subjectId=${encodeURIComponent(subjectId || "")}`);
      const list = Array.isArray(res) ? res : res?.resources || res?.data || [];
      return list.map(normalizeResource);
    } catch (e) {
      return [];
    }
  },

  async addResource(payload) {
    const fd = buildResourceFormData(payload);
    const res = await api.post("/resources", fd);
    return normalizeResource(res?.resource || res?.data || res);
  },

  async updateResource(resId, payload) {
    const fd = buildResourceFormData(payload);
    const res = await api.put(`/resources/${resId}`, fd);
    return normalizeResource(res?.resource || res?.data || res);
  },

  async deleteResource(resId) {
    await api.delete(`/resources/${resId}`);
    return true;
  },

  async trackDownload(resId) {
    try {
      await api.post(`/resources/${resId}/download`);
    } catch (e) {
      console.warn("Track download error:", e);
    }
  },
};
