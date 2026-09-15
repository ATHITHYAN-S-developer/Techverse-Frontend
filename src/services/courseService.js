/**
 * Course Service
 * Fetches courses, handles progress tracking, thumbnail covers, and module completion.
 */

import { apiRequest, API_BASE_URL } from "./api";
import { COURSES } from "../data/courses";

const STORAGE_KEY = "techverse_courses_state";

export function getCourseImageUrl(thumbnailUrl, thumbnail) {
  const url = thumbnailUrl || thumbnail;
  if (!url) {
    return "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80";
  }
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  if (url.startsWith("/uploads/")) {
    return `http://localhost:5000${url}`;
  }
  if (url.startsWith("uploads/")) {
    return `http://localhost:5000/${url}`;
  }
  return `http://localhost:5000/uploads/courses/${url}`;
}

function getStoredCourses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return COURSES;
}

function saveCourses(courses) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
  } catch (e) {
    console.error(e);
  }
}

export const courseService = {
  async getAllCourses(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const res = await apiRequest(`/courses${queryString ? `?${queryString}` : ""}`);
      const courseList = res?.data?.courses || res?.courses;
      if (Array.isArray(courseList)) {
        return courseList;
      }
    } catch (err) {
      console.debug("Failed to fetch courses from API:", err);
    }
    return [];
  },

  async getCourseById(courseId) {
    try {
      const res = await apiRequest(`/courses/${courseId}`);
      const courseData = res?.data?.course || res?.course;
      if (courseData) {
        return {
          ...courseData,
          modules: res?.data?.modules || res?.modules || [],
          enrollment: res?.data?.enrollment || res?.enrollment || null,
        };
      }
    } catch (err) {
      console.debug("Failed to fetch course details from API:", err);
    }

    throw new Error(`Course with ID ${courseId} not found in database.`);
  },

  async markModuleCompleted(courseId, moduleId) {
    try {
      const res = await apiRequest(`/courses/${courseId}/complete-module`, {
        method: "POST",
        body: JSON.stringify({ moduleId }),
      });
      if (res?.data?.success || res?.success) {
        return res?.data?.enrollment || res?.enrollment;
      }
    } catch (err) {
      // Local fallback
    }

    const courses = getStoredCourses();
    const courseIndex = courses.findIndex((c) => c.id === courseId || c.slug === courseId || c._id === courseId);
    if (courseIndex === -1) return null;

    const course = { ...courses[courseIndex] };
    course.modules = (course.modules || []).map((m) =>
      m.id === moduleId || m._id === moduleId ? { ...m, completed: true } : m
    );

    const completedCount = course.modules.filter((m) => m.completed).length;
    course.progress = Math.round((completedCount / course.modules.length) * 100);

    courses[courseIndex] = course;
    saveCourses(courses);
    return course;
  },

  async createCourse(courseData) {
    const token =
      localStorage.getItem("techverse_token") ||
      sessionStorage.getItem("techverse_token") ||
      localStorage.getItem("vcetTechHubToken") ||
      sessionStorage.getItem("vcetTechHubToken");

    console.log("TechVerse auth token exists:", !!token);
    console.log(
      "TechVerse token preview:",
      token ? `${token.substring(0, 20)}...` : "MISSING"
    );
    console.log("Creating course with authenticated API request");

    try {
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
          localStorage.removeItem("vcetTechHubToken");
          localStorage.removeItem("vcetTechHubSession");
          sessionStorage.removeItem("vcetTechHubToken");
          sessionStorage.removeItem("vcetTechHubSession");
        }
        throw new Error(errData.message || "Failed to create course in database");
      }
    } catch (err) {
      console.warn("API course create failed:", err.message);
      throw err;
    }
  },

  async deleteCourse(courseId) {
    try {
      await apiRequest(`/courses/${courseId}`, { method: "DELETE" });
      return true;
    } catch (err) {
      console.debug("Delete course API error:", err);
    }

    let courses = getStoredCourses();
    courses = courses.filter((c) => c.id !== courseId && c.slug !== courseId && c._id !== courseId);
    saveCourses(courses);
    return true;
  },
};
