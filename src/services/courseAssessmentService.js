/** Client for course-final assessment endpoints. */

import { api } from "./api";

export const courseAssessmentService = {
  async getCourseAssessmentForCourse(courseSlug) {
    const res = await api.get(`/course-assessments/course/${courseSlug}`);
    return res.data?.test || null;
  },

  async getCourseAssessmentById(courseSlug, assessmentId) {
    const res = await api.get(`/course-assessments/${courseSlug}/${assessmentId}`);
    if (res.data?.test) {
      return res.data.test;
    }
    throw new Error(`Course assessment '${assessmentId}' not found.`);
  },

  async submitCourseAssessment(courseSlug, assessmentId, answersObject, options = {}) {
    const { violations = [], submissionType = "manual", timeSpentSeconds = 0 } = options;

    const formattedAnswers = Object.entries(answersObject).map(([qId, ans]) => ({
      questionId: qId,
      selectedAnswer: Number(ans),
    }));

    const res = await api.post(`/course-assessments/${courseSlug}/${assessmentId}/submit`, {
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
        correctCount: result.score,
        totalCount: result.totalMarks,
        violationsCount: result.violationsCount || violations.length,
        submissionType: result.submissionType || submissionType,
        breakdown: result.breakdown,
      };
    }
    throw new Error("Failed to submit test attempt to MongoDB backend.");
  },

  async reportViolation(courseSlug, assessmentId, type, details, currentViolationCount) {
    try {
      const res = await api.post(`/course-assessments/${courseSlug}/${assessmentId}/violation`, {
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
};
