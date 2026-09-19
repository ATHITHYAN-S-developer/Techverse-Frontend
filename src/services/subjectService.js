/**
 * Subject Service
 * Communicates with /api/subjects to load and manage subjects.
 */

import api, { apiRequest } from "./api";

export const SUBJECT_SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export const subjectService = {
  async getSubjectsByDepartment(deptId, { semester, all = false } = {}) {
    const params = new URLSearchParams();
    if (deptId) params.set("departmentId", deptId);
    if (semester) params.set("semester", semester);
    if (all) params.set("all", "true");
    const qs = params.toString();

    const res = await apiRequest(`/subjects${qs ? `?${qs}` : ""}`);
    return Array.isArray(res) ? res : res?.subjects || res?.data || [];
  },

  async getSubjectById(subjectId) {
    const res = await apiRequest(`/subjects/${subjectId}`);
    return res?.subject || res?.data || res;
  },

  async createSubject(payload) {
    const res = await api.post("/subjects", payload);
    return res?.subject || res?.data || res;
  },

  async updateSubject(subjectId, payload) {
    const res = await api.put(`/subjects/${subjectId}`, payload);
    return res?.subject || res?.data || res;
  },

  async deleteSubject(subjectId) {
    const res = await api.delete(`/subjects/${subjectId}`);
    return res;
  },
};