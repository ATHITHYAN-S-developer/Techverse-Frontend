import { api } from "./api";

/**
 * Analytics Service
 * Provides institutional telemetry, student distributions, course completions, and resource stats.
 */

export const analyticsService = {
  async getDashboardSummary() {
    return {
      totalStudents: 5240,
      totalFaculty: 215,
      totalDepartments: 7,
      totalResources: 1180,
      totalCourses: 18,
      certificatesIssued: 3420,
      totalVisitorsToday: 840,
      activeOnline: 142
    };
  },

  async getDepartmentDistribution() {
    return [
      { name: "CSE", students: 1250, resources: 320, color: "#0062A8" },
      { name: "AI&DS", students: 780, resources: 210, color: "#0B4A8F" },
      { name: "IT", students: 820, resources: 195, color: "#0284C7" },
      { name: "ECE", students: 950, resources: 240, color: "#2563EB" },
      { name: "EEE", students: 540, resources: 130, color: "#0D9488" },
      { name: "MECH", students: 510, resources: 145, color: "#F59E0B" },
      { name: "CIVIL", students: 390, resources: 95, color: "#EF4444" }
    ];
  },

  async getCourseEnrollmentStats() {
    return [
      { name: "Python", enrollments: 1420, completions: 890, rate: 62 },
      { name: "MERN Stack", enrollments: 1850, completions: 740, rate: 40 },
      { name: "Java Core", enrollments: 1650, completions: 920, rate: 55 },
      { name: "AI & ML", enrollments: 980, completions: 410, rate: 42 },
      { name: "AWS Cloud", enrollments: 1120, completions: 680, rate: 60 },
      { name: "Git & DevOps", enrollments: 2200, completions: 1890, rate: 85 }
    ];
  },

  async getVisitorTrends() {
    return [
      { day: "Mon", visitors: 620, pageViews: 2400 },
      { day: "Tue", visitors: 780, pageViews: 3100 },
      { day: "Wed", visitors: 890, pageViews: 3800 },
      { day: "Thu", visitors: 810, pageViews: 3400 },
      { day: "Fri", visitors: 950, pageViews: 4200 },
      { day: "Sat", visitors: 540, pageViews: 1900 },
      { day: "Sun", visitors: 420, pageViews: 1500 }
    ];
  },

  async getMonthlyTestAttempts() {
    return [
      { week: "Week 1", attempts: 1240, avgScore: 78 },
      { week: "Week 2", attempts: 1580, avgScore: 82 },
      { week: "Week 3", attempts: 2100, avgScore: 85 },
      { week: "Week 4", attempts: 2450, avgScore: 87 }
    ];
  },

  async getViolationsAnalytics() {
    try {
      const res = await api.get("/analytics/violations");
      if (res.data?.success) {
        return res.data;
      }
    } catch (err) {
      console.warn("Violations analytics API fallback:", err.message);
    }
    return {
      summary: {
        totalStarted: 142,
        totalCompleted: 128,
        totalAutoSubmitted: 7,
        totalViolations: 99,
        activeTests: 7,
      },
      violationDistribution: {
        tabSwitch: 31,
        fullscreenExit: 14,
        windowBlur: 27,
        copyAttempt: 9,
        pasteAttempt: 18,
      },
      chartData: [
        { name: "Tab Switch", count: 31, color: "#EF4444" },
        { name: "Window Blur", count: 27, color: "#F59E0B" },
        { name: "Paste Attempt", count: 18, color: "#8B5CF6" },
        { name: "Fullscreen Exit", count: 14, color: "#EC4899" },
        { name: "Copy Attempt", count: 9, color: "#3B82F6" },
      ],
      recentViolations: [
        {
          _id: "v1",
          studentId: { name: "Athithya R", registerNumber: "732924CSE001" },
          testType: "coding",
          type: "TAB_SWITCH",
          timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
          details: "Tab switch / visibility change detected",
        },
        {
          _id: "v2",
          studentId: { name: "Athithya R", registerNumber: "732924CSE001" },
          testType: "coding",
          type: "FULLSCREEN_EXIT",
          timestamp: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
          details: "Student exited fullscreen mode",
        },
        {
          _id: "v3",
          studentId: { name: "Kavya Dharshini P", registerNumber: "732924CSE042" },
          testType: "mcq",
          type: "COPY_ATTEMPT",
          timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
          details: "Ctrl+C copy shortcut intercepted",
        },
      ],
    };
  }
};

