/**
 * Test Service
 * Communicates exclusively with backend MongoDB endpoints (/api/tests).
 */

import { api } from "./api";

export const testService = {
  async getAllTests() {
    try {
      const res = await api.get("/tests");
      if (res.data?.tests) {
        return res.data.tests;
      }
    } catch (err) {
      console.error("Failed to fetch tests from MongoDB backend:", err);
    }
    return [];
  },

  async getTestById(testId) {
    const res = await api.get(`/tests/${testId}`);
    if (res.data?.test) {
      return res.data.test;
    }
    throw new Error(`Daily test '${testId}' not found in MongoDB database.`);
  },

  async getTodayTest() {
    try {
      const res = await api.get("/tests/today");
      if (res.data?.test) {
        return res.data;
      }
    } catch (err) {
      console.error("Failed to fetch today's test from MongoDB backend:", err);
    }
    return { test: null, previousAttempt: null };
  },

  async submitTestAttempt(testId, answersObject, user, options = {}) {
    const { violations = [], submissionType = "manual", timeSpentSeconds = 0 } = options;

    const formattedAnswers = Object.entries(answersObject).map(([qId, ans]) => ({
      questionId: qId,
      selectedAnswer: Number(ans),
    }));

    const res = await api.post(`/tests/${testId}/submit`, {
      answers: formattedAnswers,
      violations,
      submissionType,
      timeSpentSeconds,
    });

    if (res.data?.result) {
      const result = res.data.result;
      return {
        percentage: result.percentage,
        passed: result.passed,
        pointsAwarded: result.pointsEarned,
        correctCount: result.score,
        totalCount: result.totalMarks,
        violationsCount: result.violationsCount || violations.length,
        submissionType: result.submissionType || submissionType,
        breakdown: result.breakdown,
      };
    }
    throw new Error("Failed to submit test attempt to MongoDB backend.");
  },

  async reportViolation(testId, type, details, currentViolationCount) {
    try {
      const res = await api.post(`/tests/${testId}/violation`, {
        type,
        details,
        currentViolationCount,
      });
      return res.data;
    } catch (err) {
      console.warn("Violation report warning:", err.message);
      return {
        success: true,
        currentViolationCount,
        maxViolations: 3,
        shouldAutoSubmit: currentViolationCount >= 3,
      };
    }
  },

  async getUserAttempts() {
    try {
      const res = await api.get("/tests/my/attempts");
      if (res.data?.attempts) {
        return res.data.attempts;
      }
    } catch (err) {
      console.error("Failed to fetch user test attempts from MongoDB backend:", err);
    }
    return [];
  },
};
