/**
 * Resource Service
 * Manages academic notes, question banks, previous year papers, lab manuals, software, and external links.
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
  fd.append("title", payload.title || payload.name || "");
  fd.append("description", payload.description || "");
  fd.append("departmentId", payload.departmentId || payload.department || "");
  fd.append("subjectId", payload.subjectId || "");
  fd.append("type", payload.type || "notes");
  if (payload.unit) fd.append("unit", String(payload.unit));
  if (Array.isArray(payload.tags) && payload.tags.length > 0) {
    fd.append("tags", payload.tags.join(","));
  }
  if (payload.externalUrl || payload.url) {
    fd.append("externalUrl", payload.externalUrl || payload.url);
  }
  if (payload.isPublished !== undefined) {
    fd.append("isPublished", payload.isPublished ? "true" : "false");
  }
  if (payload.file instanceof File && payload.file.size > 0) {
    fd.append("file", payload.file);
  }
  return fd;
}

const normalizeResource = (r) => ({
  ...r,
  id: r.id || r._id,
  name: r.name || r.title,
  description: r.description || "",
  url: r.url || r.externalUrl || r.fileUrl || "#",
  category: r.category || "General",
  type: r.type || "notes",
  tags: r.tags || [],
});

export const resourceService = {
  async getAllResources(options = {}) {
    try {
      const all = typeof options === "object" ? options.all : false;
      const res = await apiRequest(`/resources${all ? "?all=true" : ""}`);
      const list = Array.isArray(res) ? res : res?.resources || res?.data || [];
      return list.map(normalizeResource);
    } catch (e) {
      console.warn("Could not fetch resources from API:", e);
      return [];
    }
  },

  async getResourcesByType(type) {
    try {
      const res = await api.get(`/resources?type=${type}`);
      const list = Array.isArray(res) ? res : res?.resources || res?.data || [];
      return list.map(normalizeResource);
    } catch (e) {
      console.warn("Could not fetch resources by type from API:", e);
      return [];
    }
  },

  async getResourcesByDepartment(deptCode) {
    try {
      const res = await api.get(`/resources?department=${deptCode || ""}`);
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
    try {
      const isFormData = payload.file instanceof File;
      if (isFormData) {
        const fd = buildResourceFormData(payload);
        const res = await api.post("/resources", fd);
        return res?.resource || res?.data || res;
      }
      const res = await api.post("/resources", {
        title: payload.title || payload.name,
        description: payload.description || "",
        department: payload.department || payload.departmentId || "CSE",
        semester: Number(payload.semester) || 4,
        subjectCode: payload.subjectCode || "CS8492",
        subjectName: payload.subjectName || "Database Management Systems",
        type: payload.type || "notes",
        url: payload.url || payload.externalUrl || "#",
        format: payload.format || "PDF",
      });
      return res?.resource || res?.data || res;
    } catch (e) {
      throw e;
    }
  },

  async updateResource(resId, payload) {
    try {
      const isFormData = payload.file instanceof File;
      const body = isFormData ? buildResourceFormData(payload) : payload;
      const res = await api.put(`/resources/${resId}`, body);
      return res?.resource || res?.data || res;
    } catch (e) {
      throw e;
    }
  },

  async deleteResource(resId) {
    try {
      await api.delete(`/resources/${resId}`);
      return true;
    } catch (e) {
      throw e;
    }
  },

  async trackDownload(resId) {
    try {
      await api.post(`/resources/${resId}/download`);
    } catch (e) {
      // ignore track error
    }
  },
};

export default resourceService;
