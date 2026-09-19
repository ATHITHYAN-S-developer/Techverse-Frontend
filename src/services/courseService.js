/**
 * Course Service
 * Communicates exclusively with backend MongoDB endpoints (/api/courses).
 */

import { apiRequest, API_BASE_URL } from "./api";

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
      const res = await apiRequest(`/courses${queryString ? `?${queryString}` : ""}`);
      const courseList = res?.data?.courses || res?.courses;
      if (Array.isArray(courseList)) {
        return courseList.map((c) => {
          const cId = c.slug || c.id || c._id;
          const localCompleted = getLocalCompletedModules(cId);
          const totalMods = c.modules?.length || c.totalModules || 0;
          const completedCount = localCompleted.length;
          const calcProgress = totalMods > 0 ? Math.round((completedCount / totalMods) * 100) : 0;
          return {
            ...c,
            progress: Math.max(calcProgress, c.progress || 0),
          };
        });
      }
    } catch (err) {
      console.error("Failed to fetch courses from MongoDB backend:", err);
    }
    return [];
  },

  async getCourseById(courseId) {
    const res = await apiRequest(`/courses/${courseId}`);
    const courseData = res?.data?.course || res?.course;
    if (courseData) {
      const cId = courseData.slug || courseData.id || courseData._id || courseId;
      const rawModules = res?.data?.modules || res?.modules || [];
      const localCompleted = getLocalCompletedModules(cId, courseData.slug, courseData._id);

      const modules = rawModules.map((m) => {
        const mId = String(m._id || m.id);
        const isCompleted = Boolean(m.completed) || localCompleted.includes(mId);
        return { ...m, completed: isCompleted };
      });

      const completedCount = modules.filter((m) => m.completed).length;
      const totalCount = modules.length;
      const calculatedProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      const backendProgress = res?.data?.enrollment?.progressPercentage ?? courseData.progress ?? 0;
      const progress = Math.max(calculatedProgress, backendProgress);

      return {
        ...courseData,
        modules,
        progress,
        enrollment: res?.data?.enrollment || res?.enrollment ? {
          ...res?.data?.enrollment,
          progressPercentage: progress,
        } : { progressPercentage: progress },
      };
    }

    throw new Error(`Course with ID '${courseId}' not found in MongoDB database.`);
  },

  async getCourseBySlug(slug) {
    try {
      const res = await apiRequest(`/courses/${slug}`);
      return res?.data || res;
    } catch (err) {
      console.error("Failed to fetch course by slug:", err);
      throw err;
    }
  },

  async markModuleCompleted(courseId, moduleId) {
    addLocalCompletedModule(courseId, moduleId);
    try {
      const targetId = typeof courseId === "object" ? (courseId.slug || courseId._id || courseId.id) : courseId;
      const res = await apiRequest(`/courses/${targetId}/complete-module`, {
        method: "POST",
        body: JSON.stringify({ moduleId }),
      });
      if (res?.data?.success || res?.success) {
        return res?.data || res;
      }
    } catch (err) {
      console.warn("Backend progress sync fallback to local storage:", err);
    }
    return { success: true };
  },

  async createCourse(courseData) {
    const token =
      localStorage.getItem("techverse_token") ||
      sessionStorage.getItem("techverse_token") ||
      localStorage.getItem("vcetTechHubToken") ||
      sessionStorage.getItem("vcetTechHubToken");

    let body;
    let headers = {};
    if (courseData instanceof FormData) {
      body = courseData;
    } else {
      body = JSON.stringify(courseData);
      headers = { "Content-Type": "application/json" };
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/courses`, {
      method: "POST",
      headers,
      body,
    });

    if (res.ok) {
      const data = await res.json();
      return data.course;
    } else {
      const errData = await res.json().catch(() => ({}));
      if (res.status === 401 && (errData.code === "USER_NOT_FOUND" || errData.code === "INVALID_TOKEN")) {
        localStorage.removeItem("techverse_token");
        localStorage.removeItem("techverse_user");
        sessionStorage.removeItem("techverse_token");
        sessionStorage.removeItem("techverse_user");
      }
      throw new Error(errData.message || "Failed to create course in MongoDB database");
    }
  },

  async deleteCourse(courseId) {
    await apiRequest(`/courses/${courseId}`, { method: "DELETE" });
    return true;
  },

  async recordVideoProgress(courseSlug, moduleId, data) {
    try {
      const res = await apiRequest(`/courses/${courseSlug}/modules/${moduleId}/video-progress`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      return res?.data || res;
    } catch (err) {
      console.warn("Video progress tracking notice:", err.message);
      throw err;
    }
  },

  async getModuleProgression(courseSlug, moduleId) {
    try {
      const res = await apiRequest(`/courses/${courseSlug}/modules/${moduleId}/progression`);
      return res?.data || res;
    } catch (err) {
      console.warn("Could not fetch module progression:", err.message);
      return null;
    }
  },

  async getCourseProgression(courseSlug) {
    try {
      const res = await apiRequest(`/courses/${courseSlug}/progression`);
      return res?.data || res;
    } catch (err) {
      console.warn("Could not fetch course progression:", err.message);
      return null;
    }
  },

  async submitModuleTest(courseSlug, moduleId, data) {
    const res = await apiRequest(`/courses/${courseSlug}/modules/${moduleId}/submit-test`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res?.data || res;
  },
};

