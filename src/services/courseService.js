/**
 * Course Service
 * Communicates with backend MongoDB endpoints (/api/courses and /api/modules).
 */

import { api, apiRequest, API_BASE_URL } from "./api";

export function getCourseImageUrl(thumbnailUrl, thumbnail) {
  const url = thumbnailUrl || thumbnail;
  if (!url) {
    return "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80";
  }
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  const backendBase = typeof window !== "undefined" && window.location?.hostname
    ? `http://${window.location.hostname}:5000`
    : "http://localhost:5000";

  if (url.startsWith("/uploads/")) {
    return `${backendBase}${url}`;
  }
  if (url.startsWith("uploads/")) {
    return `${backendBase}/${url}`;
  }
  return `${backendBase}/uploads/courses/${url}`;
}

export function getLocalCompletedModules(courseId, courseSlug, courseMongoId) {
  try {
    const keys = [
      `techverse_completed_modules_${courseId}`,
      courseSlug ? `techverse_completed_modules_${courseSlug}` : null,
      courseMongoId ? `techverse_completed_modules_${courseMongoId}` : null,
    ].filter(Boolean);

    const resultSet = new Set();
    for (const k of keys) {
      const raw = localStorage.getItem(k);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            parsed.forEach((id) => resultSet.add(String(id)));
          }
        } catch { }
      }
    }
    return Array.from(resultSet);
  } catch {
    return [];
  }
}

export function addLocalCompletedModule(courseKey, moduleId) {
  try {
    const strId = String(moduleId);
    const keysToSave = [];

    if (typeof courseKey === "string") {
      keysToSave.push(`techverse_completed_modules_${courseKey}`);
    } else if (courseKey && typeof courseKey === "object") {
      if (courseKey.slug) keysToSave.push(`techverse_completed_modules_${courseKey.slug}`);
      if (courseKey._id) keysToSave.push(`techverse_completed_modules_${courseKey._id}`);
      if (courseKey.id) keysToSave.push(`techverse_completed_modules_${courseKey.id}`);
    }

    keysToSave.forEach((k) => {
      const raw = localStorage.getItem(k);
      const existing = raw ? JSON.parse(raw) : [];
      if (!existing.includes(strId)) {
        existing.push(strId);
        localStorage.setItem(k, JSON.stringify(existing));
      }
    });
  } catch (err) {
    console.error("Error saving local completed module:", err);
  }
}

export const courseService = {
  async getAllCourses(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const res = await api.get(`/courses${queryString ? `?${queryString}` : ""}`);
      const courseList = res?.courses || res?.data?.courses || res?.data || [];
      if (Array.isArray(courseList)) {
        return courseList.map((c) => {
          const cId = c.slug || c.id || c._id;
          const localCompleted = getLocalCompletedModules(cId, c.slug, c._id);
          const totalMods = c.modules?.length || c.totalModules || c.modulesCount || 0;
          const completedCount = localCompleted.length;
          const calcProgress = totalMods > 0 ? Math.round((completedCount / totalMods) * 100) : 0;
          return {
            ...c,
            progress: Math.max(calcProgress, c.progress || 0),
          };
        });
      }
    } catch (err) {
      console.error("Failed to fetch courses from backend:", err);
    }
    return [];
  },

  async getMyCourses(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const res = await api.get(`/courses/my${queryString ? `?${queryString}` : ""}`);
      const courseList = res?.courses || res?.data?.courses || res?.data || [];
      if (Array.isArray(courseList)) {
        return courseList.map((c) => {
          const cId = c.slug || c.id || c._id;
          const localCompleted = getLocalCompletedModules(cId, c.slug, c._id);
          const totalMods = c.modules?.length || c.totalModules || c.modulesCount || 0;
          const completedCount = localCompleted.length;
          const calcProgress = totalMods > 0 ? Math.round((completedCount / totalMods) * 100) : 0;
          return {
            ...c,
            progress: Math.max(calcProgress, c.progress || 0),
          };
        });
      }
    } catch (err) {
      console.error("Failed to fetch my courses from backend:", err);
    }
    return [];
  },

  async getCourseById(courseId) {
    const res = await api.get(`/courses/${courseId}`);
    const courseData = res?.course || res?.data?.course;
    if (courseData) {
      const cId = courseData.slug || courseData.id || courseData._id || courseId;
      const rawModules = res?.modules || res?.data?.modules || [];
      const localCompleted = getLocalCompletedModules(cId, courseData.slug, courseData._id);

      const modules = rawModules.map((m) => {
        const mId = String(m._id || m.id);
        const isCompleted = Boolean(m.completed) || localCompleted.includes(mId);
        return { ...m, completed: isCompleted };
      });

      const completedCount = modules.filter((m) => m.completed).length;
      const totalCount = modules.length;
      const calculatedProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      const backendProgress = res?.enrollment?.progressPercentage ?? res?.data?.enrollment?.progressPercentage ?? courseData.progress ?? 0;
      const progress = Math.max(calculatedProgress, backendProgress);

      return {
        ...courseData,
        modules,
        progress,
        enrollment: res?.enrollment || res?.data?.enrollment ? {
          ...(res?.enrollment || res?.data?.enrollment),
          progressPercentage: progress,
        } : { progressPercentage: progress },
      };
    }

    throw new Error(`Course with ID '${courseId}' not found.`);
  },

  async getCourseBySlug(slug) {
    try {
      const res = await api.get(`/courses/${slug}`);
      return res?.data || res;
    } catch (err) {
      console.error("Failed to fetch course by slug:", err);
      throw err;
    }
  },

  async createCourse(courseData) {
    const res = await api.post("/courses", courseData);
    return res?.course || res?.data?.course || res?.data || res;
  },

  async updateCourse(courseId, courseData) {
    const res = await api.put(`/courses/${courseId}`, courseData);
    return res?.course || res?.data?.course || res?.data || res;
  },

  async deleteCourse(courseId) {
    await api.delete(`/courses/${courseId}`);
    return true;
  },

  async markModuleCompleted(courseId, moduleId) {
    addLocalCompletedModule(courseId, moduleId);
    try {
      const targetId = typeof courseId === "object" ? (courseId.slug || courseId._id || courseId.id) : courseId;
      const res = await api.post(`/courses/${targetId}/complete-module`, { moduleId });
      if (res?.success || res?.data?.success) {
        return res?.data || res;
      }
    } catch (err) {
      console.warn("Backend progress sync fallback to local storage:", err);
    }
    return { success: true };
  },

  // ----------------------------------------------------------------
  // Course Module Specific Methods (/api/modules)
  // ----------------------------------------------------------------
  async getModulesByCourse(courseId) {
    try {
      const res = await api.get(`/modules?courseId=${courseId}`);
      return res?.modules || res?.data?.modules || res?.data || [];
    } catch (err) {
      console.error("Failed to fetch modules for course:", err);
      return [];
    }
  },

  async getModuleById(moduleId) {
    const res = await api.get(`/modules/${moduleId}`);
    return res?.module || res?.data?.module || res?.data || res;
  },

  async createModule(moduleData) {
    const res = await api.post("/modules", moduleData);
    return res?.module || res?.data?.module || res?.data || res;
  },

  async updateModule(moduleId, moduleData) {
    const res = await api.put(`/modules/${moduleId}`, moduleData);
    return res?.module || res?.data?.module || res?.data || res;
  },

  async deleteModule(moduleId) {
    await api.delete(`/modules/${moduleId}`);
    return true;
  },

  // ----------------------------------------------------------------
  // Progression & Video & Test Submission Methods
  // ----------------------------------------------------------------
  async recordVideoProgress(courseSlug, moduleId, data) {
    try {
      const res = await api.post(`/courses/${courseSlug}/modules/${moduleId}/video-progress`, data);
      return res?.data || res;
    } catch (err) {
      console.warn("Video progress tracking notice:", err.message);
      throw err;
    }
  },

  async getModuleProgression(courseSlug, moduleId) {
    try {
      const res = await api.get(`/courses/${courseSlug}/modules/${moduleId}/progression`);
      return res?.data || res;
    } catch (err) {
      console.warn("Could not fetch module progression:", err.message);
      return null;
    }
  },

  async getCourseProgression(courseSlug) {
    try {
      const res = await api.get(`/courses/${courseSlug}/progression`);
      return res?.data || res;
    } catch (err) {
      console.warn("Could not fetch course progression:", err.message);
      return null;
    }
  },

  async submitModuleTest(courseSlug, moduleId, data) {
    const res = await api.post(`/courses/${courseSlug}/modules/${moduleId}/submit-test`, data);
    return res?.data || res;
  },
};
