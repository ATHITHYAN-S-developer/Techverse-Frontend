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
