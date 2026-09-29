import { API_BASE_URL } from "./api";

const AUTH_KEY = "techverse_user";
const TOKEN_KEY = "techverse_token";
const LEGACY_AUTH_KEY = "vcetTechHubSession";
const LEGACY_TOKEN_KEY = "vcetTechHubToken";
const OFFLINE_FLAG = "techverse_offline_session";

export function isAuthenticated() {
  return Boolean(getCurrentUser());
}

export function getCurrentUser() {
  try {
    const raw =
      localStorage.getItem(AUTH_KEY) ||
      sessionStorage.getItem(AUTH_KEY) ||
      localStorage.getItem(LEGACY_AUTH_KEY) ||
      sessionStorage.getItem(LEGACY_AUTH_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

export function getAuthToken() {
  return (
    localStorage.getItem(TOKEN_KEY) ||
    sessionStorage.getItem(TOKEN_KEY) ||
    localStorage.getItem(LEGACY_TOKEN_KEY) ||
    sessionStorage.getItem(LEGACY_TOKEN_KEY) ||
    null
  );
}

/**
 * Unified Login Function
 * Sends request to backend REST API: POST /api/auth/login
 * Falls back gracefully to local session if backend server is not running.
 *
 * Students post their date of birth in a `dateOfBirth` field; faculty and admin
 * post a `password`. The backend reads the field that matches the role.
 */
export async function login(credentialsOrIdentifier, secretParam, keepSignedIn = true, role = "student") {
  let identity = "";
  let secret = "";
  let remember = keepSignedIn;
  let userRole = role;

  if (typeof credentialsOrIdentifier === "object" && credentialsOrIdentifier !== null) {
    identity =
      credentialsOrIdentifier.identifier ||
      credentialsOrIdentifier.registerNumber ||
      credentialsOrIdentifier.staffId ||
      credentialsOrIdentifier.facultyId ||
      credentialsOrIdentifier.username ||
      credentialsOrIdentifier.email ||
      "";
    secret =
      credentialsOrIdentifier.dateOfBirth ||
      credentialsOrIdentifier.dob ||
      credentialsOrIdentifier.password ||
      "";
    remember = credentialsOrIdentifier.rememberMe ?? credentialsOrIdentifier.keepSignedIn ?? true;
    userRole = credentialsOrIdentifier.role || role || "student";
  } else {
    identity = String(credentialsOrIdentifier || "").trim();
    secret = String(secretParam || "").trim();
  }

  // Normalize role from "faculty" to "teacher" for backend compatibility
  const normalizedRole = userRole === "faculty" ? "teacher" : userRole;
  const cleanIdentity = identity.trim();
  const cleanSecret = secret.trim();

  if (!cleanIdentity || !cleanSecret) {
    throw new Error(
      `Please enter your ${
        userRole === "student"
          ? "Register Number and Date of Birth"
          : userRole === "faculty" || userRole === "teacher"
          ? "Staff ID and Password"
          : "Admin Username and Password"
      }.`
    );
  }

  // A student's credential is a date of birth, so it is sent under its own name
  // rather than being smuggled through a `password` field the backend ignores.
  const body =
    normalizedRole === "student"
      ? { role: normalizedRole, identifier: cleanIdentity, dateOfBirth: cleanSecret }
      : { role: normalizedRole, identifier: cleanIdentity, password: cleanSecret };

  // 1. Try real Express Backend API
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const data = await response.json();
      const token =
        data?.data?.token ||
        data?.token ||
        data?.data?.accessToken ||
        data?.accessToken;
      const user = data?.data?.user || data?.user;

      if (!token) {
        throw new Error("Login succeeded but no authentication token was returned");
      }

      if (user) {
        // Standardize storage according to specifications
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));

        // Legacy compatibility sync
        localStorage.setItem(LEGACY_TOKEN_KEY, token);
        localStorage.setItem(LEGACY_AUTH_KEY, JSON.stringify(user));

        // A real token supersedes any earlier offline session.
        localStorage.removeItem(OFFLINE_FLAG);

        if (!remember) {
          sessionStorage.setItem(TOKEN_KEY, token);
          sessionStorage.setItem(AUTH_KEY, JSON.stringify(user));
        }
        return user;
      }
    } else {
      const errJson = await response.json().catch(() => ({}));
      if (response.status === 401 || response.status === 403 || response.status === 400) {
        throw new Error(errJson.message || "Invalid login credentials.");
      }
    }
  } catch (apiErr) {
    if (apiErr.message && !apiErr.message.includes("Failed to fetch") && !apiErr.message.includes("NetworkError")) {
      throw apiErr;
    }
    console.warn("[Auth API Fallback]: Backend server offline, falling back to local session.", apiErr.message);
  }

  // 2. Graceful Offline / Local Mock Fallback
  let user = {
    _id: `mock_${normalizedRole}_01`,
    role: normalizedRole,
    keepSignedIn: remember,
    lastLoginAt: new Date().toISOString(),
  };

  if (normalizedRole === "student") {
    const reg = cleanIdentity.toUpperCase();
    user = {
      ...user,
      registerNumber: reg,
      email: `${reg.toLowerCase()}@vcet.ac.in`,
      name: `Student (${reg})`,
      departmentId: "cse",
      classId: "cse_3a",
      points: { totalPoints: 1240, level: 4 },
      streak: { currentStreak: 12, longestStreak: 15 },
      title: "VCET Engineering Scholar",
    };
  } else if (normalizedRole === "teacher") {
    const staff = cleanIdentity.toUpperCase();
    user = {
      ...user,
      staffId: staff,
      email: `${cleanIdentity.toLowerCase()}@vcet.ac.in`,
      name: "Dr. K. S. Sendhilkumar",
      departmentId: "cse",
      designation: "Associate Professor & HOD i/c",
      title: "Faculty / Educator",
    };
  } else if (normalizedRole === "admin") {
    user = {
      ...user,
      username: cleanIdentity.toLowerCase(),
      email: "admin@vcet.ac.in",
      name: "VCET System Administrator",
      departmentId: "cse",
      designation: "System Administrator",
      title: "Portal Administrator",
    };
  }

  localStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LEGACY_AUTH_KEY);
  sessionStorage.removeItem(LEGACY_AUTH_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  sessionStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(OFFLINE_FLAG);

  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(AUTH_KEY, JSON.stringify(user));
  storage.setItem(LEGACY_AUTH_KEY, JSON.stringify(user));

  // Flag this as an offline session rather than storing a placeholder token.
  // "mock_jwt_token_sample" is not a valid JWT, so the backend rejected every
  // protected call with INVALID_TOKEN and the 401 handler wiped the session,
  // logging the user straight back out. With the flag set, api.js omits the
  // Authorization header and protected endpoints fail as AUTH_TOKEN_MISSING,
  // which is non-destructive and leaves public feeds working.
  localStorage.setItem(OFFLINE_FLAG, "1");

  return user;
}

export function isOfflineSession() {
  return localStorage.getItem(OFFLINE_FLAG) === "1";
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LEGACY_AUTH_KEY);
  sessionStorage.removeItem(LEGACY_AUTH_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  sessionStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(OFFLINE_FLAG);
}
