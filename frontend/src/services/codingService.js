/**
 * Coding Arena Service
 * Communicates exclusively with backend MongoDB endpoints (/api/coding).
 */

import { api } from "./api";

export const codingService = {
  async getAllCodingTests() {
    try {
      const res = await api.get("/coding");
      if (res.data?.codingTests) {
        return res.data.codingTests;
      }
    } catch (err) {
      console.error("Failed to fetch coding tests from MongoDB backend:", err);
    }
    return [];
  },

  async getCodingTestById(id) {
    const res = await api.get(`/coding/${id}`);
    if (res.data?.codingTest) {
      return res.data.codingTest;
    }
    throw new Error(`Coding test '${id}' not found in MongoDB database.`);
  },

  async runCode(testId, problemId, language, sourceCode) {
    const res = await api.post(`/coding/${testId}/run`, {
      problemId,
      language,
      sourceCode,
    });
    return res.data;
  },

  async submitCode(testId, problemId, language, sourceCode, options = {}) {
    const { violations = [], submissionType = "manual" } = options;
    const res = await api.post(`/coding/${testId}/submit`, {
      problemId,
      language,
      sourceCode,
      violations,
      submissionType,
    });
    return res.data;
  },

  async reportViolation(testId, type, details, currentViolationCount) {
    try {
      const res = await api.post(`/coding/${testId}/violation`, {
        type,
        details,
        currentViolationCount,
      });
      return res.data;
    } catch (err) {
      return {
        success: true,
        currentViolationCount,
        maxViolations: 3,
        shouldAutoSubmit: currentViolationCount >= 3,
      };
    }
  },
};
