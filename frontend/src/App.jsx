/**
 * Main Application Component for VCET Tech Hub (TechVerse)
 * Complete multi-role architecture with React Router 7.
 * Palette: VCET Blue (#0B4A8F / #0062A8), Dark Gray (#444445), Slate Soft (#F0F6FC).
 */

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

// Layouts
import PublicLayout from "./layouts/PublicLayout";
import StudentLayout from "./layouts/StudentLayout";
import FacultyLayout from "./layouts/FacultyLayout";
import AdminLayout from "./layouts/AdminLayout";

// Public Pages
import HomePage from "./pages/HomePage";
import DepartmentResourcesPage from "./pages/DepartmentResourcesPage";
import TrainingPage from "./pages/TrainingPage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import CourseLearningPage from "./pages/CourseLearningPage";
import DailyTestPage from "./pages/DailyTestPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import CertificatesPage from "./pages/CertificatesPage";
import VerifyCertificatePage from "./pages/VerifyCertificatePage";
import CodingPage from "./pages/CodingPage";
import CompanyDetailPage from "./pages/CompanyDetailPage";
import TechnologyPage from "./pages/TechnologyPage";
import UpdatesPage from "./pages/UpdatesPage";
import YouTubePage from "./pages/YouTubePage";
import AptitudePage from "./pages/AptitudePage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import LoginPage from "./pages/LoginPage";
import BookmarksPage from "./pages/BookmarksPage";
import ProfilePage from "./pages/ProfilePage";

// Role-Specific Dashboards
import DashboardPage from "./pages/DashboardPage";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import FacultyResourcesPage from "./pages/faculty/FacultyResourcesPage";
import FacultyAnnouncementsPage from "./pages/faculty/FacultyAnnouncementsPage";
import FacultyStudentsPage from "./pages/faculty/FacultyStudentsPage";

// Admin Control Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminStudentsPage from "./pages/admin/AdminStudentsPage";
import AdminFacultyPage from "./pages/admin/AdminFacultyPage";
import AdminDepartmentsPage from "./pages/admin/AdminDepartmentsPage";
import AdminClassesPage from "./pages/admin/AdminClassesPage";
import AdminSubjectsPage from "./pages/admin/AdminSubjectsPage";
import AdminResourcesPage from "./pages/admin/AdminResourcesPage";
import AdminAnnouncementsPage from "./pages/admin/AdminAnnouncementsPage";
import AdminCoursesPage from "./pages/admin/AdminCoursesPage";
import AdminCourseModulesPage from "./pages/admin/AdminCourseModulesPage";
import AdminTestsPage from "./pages/admin/AdminTestsPage";
import AdminCodingPage from "./pages/admin/AdminCodingPage";
import AdminViolationsPage from "./pages/admin/AdminViolationsPage";
import AdminCertificatesPage from "./pages/admin/AdminCertificatesPage";
import AdminPointsPage from "./pages/admin/AdminPointsPage";
import AdminLeaderboardPage from "./pages/admin/AdminLeaderboardPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";
import AdminVisitorsPage from "./pages/admin/AdminVisitorsPage";
import AdminAuditLogsPage from "./pages/admin/AdminAuditLogsPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";

// Protected Route Guard
function RequireAuth({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If user doesn't have required role, redirect to appropriate home dashboard
    if (user?.role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === "faculty" || user?.role === "teacher") return <Navigate to="/faculty/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* 1. Public Pages (Navbar + Footer) */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/technology" element={<TechnologyPage />} />
              <Route path="/departments" element={<DepartmentResourcesPage />} />
              <Route path="/departments/:departmentId" element={<DepartmentResourcesPage />} />
              <Route path="/prepzone" element={<TrainingPage />} />
              <Route path="/training" element={<TrainingPage />} />
              <Route path="/placement" element={<Navigate to="/prepzone" replace />} />
              <Route path="/companies/:company" element={<CompanyDetailPage />} />
              <Route path="/updates" element={<UpdatesPage />} />
              <Route path="/youtube" element={<YouTubePage />} />
              <Route path="/aptitude" element={<AptitudePage />} />
              <Route path="/announcements" element={<AnnouncementsPage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:courseId" element={<CourseDetailPage />} />
              <Route path="/verify" element={<VerifyCertificatePage />} />
              <Route path="/login" element={<LoginPage />} />
            </Route>

            {/* 2. Student Learning & Gamification Portal */}
            <Route
              element={
                <RequireAuth allowedRoles={["student", "faculty", "admin"]}>
                  <StudentLayout />
                </RequireAuth>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/courses/:courseId/module/:moduleId" element={<CourseLearningPage />} />
              <Route path="/tests" element={<DailyTestPage />} />
              <Route path="/tests/:testId" element={<DailyTestPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/points" element={<LeaderboardPage />} />
              <Route path="/certificates" element={<CertificatesPage />} />
              <Route path="/coding" element={<CodingPage />} />
              <Route path="/bookmarks" element={<BookmarksPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* 3. Faculty Management Portal */}
            <Route
              path="/faculty"
              element={
                <RequireAuth allowedRoles={["faculty", "teacher", "admin"]}>
                  <FacultyLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Navigate to="/faculty/dashboard" replace />} />
              <Route path="dashboard" element={<FacultyDashboard />} />
              <Route path="resources" element={<FacultyResourcesPage />} />
              <Route path="announcements" element={<FacultyAnnouncementsPage />} />
              <Route path="students" element={<FacultyStudentsPage />} />
            </Route>

            {/* 4. Institutional Admin Control Center */}
            <Route
              path="/admin"
              element={
                <RequireAuth allowedRoles={["admin"]}>
                  <AdminLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="announcements" element={<AdminAnnouncementsPage />} />
              <Route path="students" element={<AdminStudentsPage />} />
              <Route path="faculty" element={<AdminFacultyPage />} />
              <Route path="departments" element={<AdminDepartmentsPage />} />
              <Route path="classes" element={<AdminClassesPage />} />
              <Route path="subjects" element={<AdminSubjectsPage />} />
              <Route path="resources" element={<AdminResourcesPage />} />
              <Route path="courses" element={<AdminCoursesPage />} />
              <Route path="modules" element={<AdminCourseModulesPage />} />
              <Route path="tests" element={<AdminTestsPage />} />
              <Route path="coding" element={<AdminCodingPage />} />
              <Route path="violations" element={<AdminViolationsPage />} />
              <Route path="certificates" element={<AdminCertificatesPage />} />
              <Route path="points" element={<AdminPointsPage />} />
              <Route path="leaderboard" element={<AdminLeaderboardPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              <Route path="visitors" element={<AdminVisitorsPage />} />
              <Route path="audit-logs" element={<AdminAuditLogsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>

            {/* 5. Fallback Wildcard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
