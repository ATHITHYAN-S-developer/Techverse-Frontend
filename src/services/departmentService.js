/**
 * Department Service
 * Communicates exclusively with backend MongoDB endpoints (/api/departments, /api/subjects).
 */

import { apiRequest } from "./api";

export const departmentService = {
  async getDepartments() {
    try {
      const res = await apiRequest("/departments");
      if (res.success && Array.isArray(res.departments)) {
        return res.departments;
      }
    } catch (err) {
      console.error("Failed to fetch departments from MongoDB backend:", err);
    }
    return [];
import api, { apiRequest } from "./api";
import { DEPARTMENTS_DATA } from "../data/departments";

export const departmentService = {
  async getDepartments({ all = false } = {}) {
    const res = await apiRequest(`/departments${all ? "?all=true" : ""}`);
    if (res.success && Array.isArray(res.departments) && res.departments.length > 0) {
      return res.departments;
    }
    if (all) return [];
    return Object.values(DEPARTMENTS_DATA);
  },

  async getDepartmentById(deptId) {
    try {
      const res = await apiRequest(`/departments/${deptId}`);
      if (res.success && res.department) {
        return res.department;
      }
    } catch (err) {
      console.error(`Failed to fetch department '${deptId}' from MongoDB backend:`, err);
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
      if (res.success && Array.isArray(res.subjects)) {
        return res.subjects;
      }
    } catch (err) {
      console.error("Failed to fetch subjects from MongoDB backend:", err);
    }
    return [];
  },
};