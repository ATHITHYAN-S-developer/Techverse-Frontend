/**
 * Test Service
 * Communicates with backend /api/tests and provides anti-cheat violation reporting.
 */

import { api } from "./api";
import { DAILY_TESTS } from "../data/dailyTests";

const ATTEMPTS_KEY = "techverse_test_attempts";

function getStoredAttempts() {
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
}

function saveAttempt(attempt) {
  const attempts = getStoredAttempts();
  attempts.unshift(attempt);
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
}

export const testService = {
  async getAllTests() {
    try {
      const res = await api.get("/tests");
      if (res.data?.tests && res.data.tests.length > 0) {
        return res.data.tests;
      }
    } catch (err) {
      console.warn("Backend /api/tests offline, using fallback:", err.message);
    }
    return DAILY_TESTS;
  },

  async getTestById(testId) {
    try {
      const res = await api.get(`/tests/${testId}`);
      if (res.data?.test) {
        return res.data.test;
      }
    } catch (err) {
      console.warn(`Backend /api/tests/${testId} unavailable, using fallback:`, err.message);
    }

    const test = DAILY_TESTS.find((t) => t.id === testId || t._id === testId);
    if (!test) {
      return DAILY_TESTS[0];
    }
    return test;
  },

  async getTodayTest() {
    try {
      const res = await api.get("/tests/today");
      if (res.data?.test) {
        return res.data;
      }
    } catch (err) {
      console.warn("Backend /api/tests/today offline, using fallback:", err.message);
    }
    return { test: DAILY_TESTS[0], previousAttempt: null };
  },

  async submitTestAttempt(testId, answersObject, user, options = {}) {
    const { violations = [], submissionType = "manual", timeSpentSeconds = 0 } = options;

    // Format answers array
    const formattedAnswers = Object.entries(answersObject).map(([qId, ans]) => ({
      questionId: qId,
      selectedAnswer: Number(ans),
    }));

    try {
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
    } catch (err) {
      console.warn("Backend /api/tests/:id/submit failed, falling back to client evaluation:", err.message);
    }

    // Client fallback evaluation
    const test = await this.getTestById(testId);
    let score = 0;
    const breakdown = (test.questions || []).map((q) => {
      const qId = q._id || q.id;
      const selected = answersObject[qId] !== undefined ? Number(answersObject[qId]) : null;
      const isCorrect = selected !== null && selected === q.correctAnswer;
      if (isCorrect) score += 1;
      return {
        _id: qId,
        question: q.question,
        options: q.options,
        selectedAnswer: selected,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const totalCount = test.questions?.length || 1;
    const percentage = Math.round((score / totalCount) * 100);
    const passed = percentage >= (test.passingPercentage || 60);
    const pointsAwarded = (test.pointsReward || 10) + (passed && violations.length === 0 ? 5 : 0);

    const attempt = {
      id: `att-${Date.now()}`,
      testId,
      testTitle: test.title,
      userId: user?.registerNumber || user?.staffId || "student",
      userName: user?.name || "Student",
      score,
      totalQuestions: totalCount,
      percentage,
      passed,
      pointsAwarded,
      violationsCount: violations.length,
      submissionType,
      completedAt: new Date().toISOString(),
    };
    saveAttempt(attempt);

    return {
      attempt,
      percentage,
      passed,
      pointsAwarded,
      correctCount: score,
      totalCount,
      violationsCount: violations.length,
      submissionType,
      breakdown,
    };
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
      console.warn("Violation report failed:", err.message);
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
      // Fallback
    }
    return getStoredAttempts();
  },
};
