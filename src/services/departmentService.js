/**
 * Department Service
 * Communicates with /api/departments and falls back to local data.
 */

import { apiRequest } from "./api";
import { DEPARTMENTS_DATA } from "../data/departments";

export const departmentService = {
  async getDepartments() {
    try {
      const res = await apiRequest("/departments");
      if (res.success && Array.isArray(res.departments) && res.departments.length > 0) {
        return res.departments;
      }
    } catch (err) {
      // Graceful fallback to static data
    }
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
