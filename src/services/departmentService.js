/**
 * Department Service
 * Communicates with backend MongoDB endpoints (/api/departments, /api/subjects).
 */

import api, { apiRequest } from "./api";
import { DEPARTMENTS_DATA } from "../data/departments";

export const departmentService = {
  async getAllDepartments() {
    return this.getDepartments({ all: true });
  },

  async getDepartments({ all = false } = {}) {
    try {
      const res = await apiRequest(`/departments${all ? "?all=true" : ""}`);
      if (res?.success && Array.isArray(res.departments) && res.departments.length > 0) {
        return res.departments;
      }
      if (Array.isArray(res) && res.length > 0) {
        return res;
      }
    } catch (err) {
      console.warn("Failed to fetch departments from backend:", err);
    }
    if (all) return [];
    return Object.values(DEPARTMENTS_DATA);
  },

  async getDepartmentById(deptId) {
    try {
      const res = await apiRequest(`/departments/${deptId}`);
      if (res?.success && res.department) {
        return res.department;
      }
      if (res?.data) return res.data;
    } catch (err) {
      console.error(`Failed to fetch department '${deptId}':`, err);
    }
    return null;
  },

  async createDepartment(payload) {
    const res = await api.post("/departments", payload);
    return res?.department || res?.data || res;
  },

  async updateDepartment(deptId, payload) {
    const res = await api.put(`/departments/${deptId}`, payload);
    return res?.department || res?.data || res;
  },

  async deleteDepartment(deptId) {
    const res = await api.delete(`/departments/${deptId}`);
    return res;
  },

  async getSubjectsForSemester(deptId, semesterNumber) {
    try {
      const res = await apiRequest(`/subjects?departmentId=${deptId}&semester=${semesterNumber}`);
      if (res?.success && Array.isArray(res.subjects)) {
        return res.subjects;
      }
      if (Array.isArray(res)) return res;
    } catch (err) {
      console.error("Failed to fetch subjects:", err);
    }
    return [];
  },
};