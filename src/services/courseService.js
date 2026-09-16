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
  if (url.startsWith("/uploads/")) {
    return `http://localhost:5000${url}`;
  }
  if (url.startsWith("uploads/")) {
    return `http://localhost:5000/${url}`;
  }
  return `http://localhost:5000/uploads/courses/${url}`;
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
      console.error("Failed to fetch courses from MongoDB backend:", err);
    }
    return [];
  },

  async getCourseById(courseId) {
    const res = await apiRequest(`/courses/${courseId}`);
    const courseData = res?.data?.course || res?.course;
    if (courseData) {
      return {
        ...courseData,
        modules: res?.data?.modules || res?.modules || [],
        enrollment: res?.data?.enrollment || res?.enrollment || null,
      };
    }

    throw new Error(`Course with ID '${courseId}' not found in MongoDB database.`);
  },

  async markModuleCompleted(courseId, moduleId) {
    const res = await apiRequest(`/courses/${courseId}/complete-module`, {
      method: "POST",
      body: JSON.stringify({ moduleId }),
    });
    if (res?.data?.success || res?.success) {
      return res?.data || res;
    }
    return null;
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
};
