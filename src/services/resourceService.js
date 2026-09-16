/**
 * Resource Service
 * Manages academic notes, question banks, previous year papers, lab manuals, software, youtube, updates, technology, aptitude.
 */

import { api } from "./api";

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
  async getAllResources() {
    try {
      const res = await api.get("/resources");
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

  async addResource(resource, user) {
    try {
      const res = await api.post("/resources", {
        body: JSON.stringify({
          title: resource.title || resource.name,
          description: resource.description || "",
          department: resource.department || "CSE",
          semester: Number(resource.semester) || 4,
          subjectCode: resource.subjectCode || "CS8492",
          subjectName: resource.subjectName || "Database Management Systems",
          type: resource.type || "notes",
          url: resource.url || "#",
          format: resource.format || "PDF"
        })
      });
      return res?.resource || res?.data || res;
    } catch (e) {
      throw e;
    }
  },

  async updateResource(resId, updates) {
    try {
      const res = await api.put(`/resources/${resId}`, {
        body: JSON.stringify(updates)
      });
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
  }
};
