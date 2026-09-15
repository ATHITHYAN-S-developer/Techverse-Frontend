import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getCurrentUser, login as authLogin, logout as authLogout } from "../services/authService";

const AuthContext = createContext(null);

const DEFAULT_NOTIFICATIONS = [
  {
    id: "notif-1",
    title: "Zoho Campus Drive Registration Open",
    message: "Pre-placement training registration is now open for III & IV Year CSE/IT/AI&DS.",
    type: "placement",
    time: "10 mins ago",
    read: false,
    link: "/placement",
  },
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
    id: "notif-3",
    title: "Daily Practice Test Ready",
    message: "Today's assessment on Data Structures & Algorithms is available. Maintain your 7-day streak!",
    type: "test",
    time: "5 hours ago",
    read: false,
    link: "/tests/dsa-day-3",
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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentUser());
  const [points, setPoints] = useState(() => {
    const saved = localStorage.getItem("techverse_user_points");
    return saved ? parseInt(saved, 10) : 820;
  });
  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem("techverse_user_streak");
    return saved ? parseInt(saved, 10) : 7;
  });
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

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem("techverse_user_points", points.toString());
  }, [points]);

  useEffect(() => {
    localStorage.setItem("techverse_user_streak", streak.toString());
  }, [streak]);

  useEffect(() => {
    localStorage.setItem("techverse_user_bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem("techverse_user_notifications", JSON.stringify(notifications));
  }, [notifications]);

  const login = async (credentials, passwordOrDob, keepSignedIn = true, role = "student") => {
    const authenticatedUser = await authLogin(credentials, passwordOrDob, keepSignedIn, role);
    setUser(authenticatedUser);
    return authenticatedUser;
  };

  const logout = () => {
    authLogout();
    setUser(null);
  };

  const updateProfile = (updates) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      const storage = prev.keepSignedIn ? localStorage : sessionStorage;
      storage.setItem("techverse_user", JSON.stringify(updated));
      storage.setItem("vcetTechHubSession", JSON.stringify(updated));
      return updated;
    });
  };

  const addPoints = useCallback((amount, reason = "Daily Activity") => {
    setPoints((prev) => {
      const next = prev + amount;
      return next;
    });
  }, []);

  const incrementStreak = useCallback(() => {
    setStreak((prev) => prev + 1);
  }, []);

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

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || "guest",
        isAuthenticated: Boolean(user),
        login,
        logout,
        updateProfile,
        points,
        streak,
        addPoints,
        incrementStreak,
        bookmarks,
        toggleBookmark,
        isBookmarked,
        notifications,
        unreadCount,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
