/**
 * Axios / Fetch REST API Base Client Configuration
 * Communicates with the TechVerse Express + MongoDB backend.
 */

const getBackendHost = () => {
  if (typeof window !== "undefined" && window.location && window.location.hostname) {
    return `http://${window.location.hostname}:5000/api`;
  }
  return "http://localhost:5000/api";
};

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  getBackendHost();

export async function apiRequest(endpoint, options = {}) {
  const token =
    localStorage.getItem("techverse_token") ||
    sessionStorage.getItem("techverse_token") ||
    localStorage.getItem("vcetTechHubToken") ||
    sessionStorage.getItem("vcetTechHubToken");

  const headers = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 401 && (errorData.code === "USER_NOT_FOUND" || errorData.code === "INVALID_TOKEN")) {
        localStorage.removeItem("techverse_token");
        localStorage.removeItem("techverse_user");
        sessionStorage.removeItem("techverse_token");
        sessionStorage.removeItem("techverse_user");
        localStorage.removeItem("vcetTechHubToken");
        localStorage.removeItem("vcetTechHubSession");
        sessionStorage.removeItem("vcetTechHubToken");
        sessionStorage.removeItem("vcetTechHubSession");
      }
      throw new Error(
        errorData.message || `Request failed with HTTP status ${response.status}`
      );
    }

    const data = await response.json();
    return { data, status: response.status, ...data };
  } catch (error) {
    console.debug(`[REST API Call]: ${endpoint}`, error.message);
    throw error;
  }
}

export const api = {
  get: (endpoint, options = {}) => apiRequest(endpoint, { method: "GET", ...options }),
  post: (endpoint, body, options = {}) =>
    apiRequest(endpoint, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),
  put: (endpoint, body, options = {}) =>
    apiRequest(endpoint, {
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),
  delete: (endpoint, options = {}) => apiRequest(endpoint, { method: "DELETE", ...options }),
};

export const incrementVisitor = async () => {
  const response = await api.post("/visitors/increment");
  return response.data || response;
};

export const getVisitorCount = async () => {
  const response = await api.get("/visitors/count");
  return response.data || response;
};

export default api;

