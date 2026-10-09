import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getCurrentUser, login as authLogin, logout as authLogout } from "../services/authService";
import api from "../services/api";

const AuthContext = createContext(null);

const DEFAULT_NOTIFICATIONS = [
  {
    id: "notif-2",
    title: "New Course Module: Python Day 8",
    message: "Object-Oriented Programming module and hands-on quiz is live.",
    type: "course",
    time: "2 hours ago",
    read: false,
    link: "/courses/python-mastery",
  },
  {
    id: "notif-4",
    title: "Certificate Generated",
    message: "Your certificate for 'Database Engineering with MongoDB' has been minted.",
    type: "certificate",
    time: "1 day ago",
    read: true,
    link: "/certificates",
  },
];

const EMPTY_GAMIFICATION = {
  streak: { currentStreak: 0, longestStreak: 0, lastActiveDate: null, freezeCount: 0 },
};

function normaliseGamification(source) {
  if (!source) return EMPTY_GAMIFICATION;

  const rawStreak = source.streak ?? EMPTY_GAMIFICATION.streak;

  const currentStreak = Number(
    typeof rawStreak === "object" ? rawStreak.currentStreak : rawStreak
  ) || 0;
  const longestStreak = Number(
    typeof rawStreak === "object" ? rawStreak.longestStreak : rawStreak
  ) || 0;
  return {
    streak: {
      currentStreak,
      longestStreak,
      lastActiveDate: typeof rawStreak === "object" ? rawStreak.lastActiveDate ?? null : null,
      freezeCount: typeof rawStreak === "object" ? rawStreak.freezeCount || 0 : 0,
    },
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentUser());
  const [gamification, setGamification] = useState(() =>
    normaliseGamification(getCurrentUser())
  );
  const [gamificationLoading, setGamificationLoading] = useState(false);
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem("techverse_user_bookmarks");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem("techverse_user_notifications");
      return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATIONS;
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  });

  useEffect(() => {
    localStorage.setItem("techverse_user_bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem("techverse_user_notifications", JSON.stringify(notifications));
  }, [notifications]);

  /**
   * Re-read the server-owned streak after student activity.
   */
  const refreshStreak = useCallback(async () => {
    try {
      const res = await api.get("/users/streak");
      const streak = res?.streak || res?.data?.streak;
      if (streak) {
        setGamification(normaliseGamification({ streak }));
        return true;
      }
    } catch {
      // Offline or unauthenticated: fall back to whatever the user object holds.
    } finally {
      setGamificationLoading(false);
    }
    return false;
  }, []);

  useEffect(() => {
    if (user) {
      setGamificationLoading(true);
      refreshStreak();
    } else {
      setGamification(EMPTY_GAMIFICATION);
      setGamificationLoading(false);
    }
  }, [user, refreshStreak]);

  const login = async (credentials, secret, keepSignedIn = true, role = "student") => {
    const authenticatedUser = await authLogin(credentials, secret, keepSignedIn, role);
    setUser(authenticatedUser);
    setGamification(normaliseGamification(authenticatedUser));
    setGamificationLoading(true);
    return authenticatedUser;
  };

  const logout = () => {
    authLogout();
    setUser(null);
    setGamification(EMPTY_GAMIFICATION);
    setGamificationLoading(false);
  };

  const updateProfile = async (updates) => {
    let serverUser = {};
    try {
      const response = await api.put("/auth/profile", updates);
      serverUser = response.user || response.data?.user || {};
    } catch (err) {
      console.error("Failed to update profile on server:", err);
      throw err;
    }

    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates, ...serverUser };
      const storage = prev.keepSignedIn ? localStorage : sessionStorage;
      storage.setItem("techverse_user", JSON.stringify(updated));
      storage.setItem("vcetTechHubSession", JSON.stringify(updated));
      return updated;
    });
  };

  const toggleBookmark = useCallback((item) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.id === item.id);
      if (exists) {
        return prev.filter((b) => b.id !== item.id);
      } else {
        return [...prev, { ...item, savedAt: new Date().toISOString() }];
      }
    });
  }, []);

  const isBookmarked = useCallback(
    (id) => bookmarks.some((b) => b.id === id),
    [bookmarks]
  );

  const markNotificationRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const value = {
    user,
    role: user?.role || "guest",
    isAuthenticated: Boolean(user),
    login,
    logout,
    updateProfile,
    gamification,
    gamificationLoading,
    streak: gamification.streak,
    refreshStreak,
    bookmarks,
    toggleBookmark,
    isBookmarked,
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
