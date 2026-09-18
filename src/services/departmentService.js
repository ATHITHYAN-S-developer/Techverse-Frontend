/**
 * Department Service
 * Communicates with /api/departments and falls back to local data.
 */

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
      // Graceful fallback
    }

    const key = Object.keys(DEPARTMENTS_DATA).find(
      (k) =>
        k.toLowerCase() === deptId.toLowerCase() ||
        DEPARTMENTS_DATA[k].code.toLowerCase() === deptId.toLowerCase()
    );
    if (!key) return null;
    return DEPARTMENTS_DATA[key];
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
      if (res.success && Array.isArray(res.subjects) && res.subjects.length > 0) {
        return res.subjects;
      }
    } catch (err) {
      // Graceful fallback
    }

    const dept = await this.getDepartmentById(deptId);
    if (!dept || !dept.curriculum) return [];
    const sem = dept.curriculum.find((s) => s.semester === Number(semesterNumber));
    return sem ? sem.subjects : [];
  },
};