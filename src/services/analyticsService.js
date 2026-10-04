import { api } from "./api";

/**
 * Analytics Service
 *
 * Every method reads live data from the backend. Nothing here invents numbers,
 * so a page that renders these values always reflects the database.
 *
 * The admin dashboard's single round trip is `GET /admin/dashboard`; the other
 * endpoints back the individual analytics screens and the Cmd+K search.
 */

const EMPTY_DISTRIBUTION = [];

/**
 * Full executive-control-center payload. Falls back to a zeroed-but-valid shape
 * so a transient network failure renders an empty dashboard instead of crashing.
 */
export const analyticsService = {
  async getDashboardSummary() {
    const res = await api.get("/admin/dashboard?days=7");
    const payload = res.data || res;

    return {
      generatedAt: payload.generatedAt || null,
      kpis: payload.kpis || {},
      activityTelemetry: payload.activityTelemetry || [],
      departmentDistribution: payload.departmentDistribution || EMPTY_DISTRIBUTION,
      // Keep raw numbers here. The dashboard applies its own formatNumber, and
      // that helper returns "0" for anything that is not a finite number, so
      // pre-formatting these into strings would silently render 0.
      departmentTotal: Number(payload.departmentTotal) || 0,
      branchCount: Number(payload.branchCount) || 0,
      courseVelocity: payload.courseVelocity || [],
      recentActivity: payload.recentActivity || [],
      visitors: payload.visitors || { totalVisits: 0, today: 0, series: [] },
    };
  },

  /** Branch counts, largest cohort first. */
  async getDepartmentDistribution() {
    const dashboard = await this.getDashboardSummary();
    return dashboard.departmentDistribution;
  },

  /** Enrollment / completion counts per published course. */
  async getCourseEnrollmentStats() {
    const res = await api.get("/analytics/overview?days=7");
    const payload = res.data || res;
    return payload.courseStats || [];
  },

  /** Dense per-day visitor series, oldest first. */
  async getVisitorTrends() {
    const dashboard = await this.getDashboardSummary();
    const series = dashboard.visitors?.series || [];

    // Recharts needs real numbers here. These used to be pre-formatted, which
    // both broke the plot and made pageViews concatenate ("12" + "3" = "123").
    return series.map((point) => ({
      day: point.date,
      date: point.isoDate,
      visitors: Number(point.totalVisits) || 0,
      pageViews: (Number(point.courseViews) || 0) + (Number(point.resourceViews) || 0),
    }));
  },

  /** Course-final assessment attempts with average score. */
  async getCourseAssessmentAttempts() {
    const res = await api.get("/analytics/overview?days=14");
    const payload = res.data || res;
    return payload.courseAssessmentTrends || [];
  },

  /** Live session counts for the "Active Users" tile. */
  async getActiveUsers() {
    const dashboard = await this.getDashboardSummary();
    return dashboard.kpis?.activeUsers || { count: 0, students: 0, windowMinutes: 15 };
  },

  async getViolationsAnalytics() {
    const res = await api.get("/analytics/violations");
    const payload = res.data || res;
    if (payload.success) return payload;
    return {
      summary: payload.summary || {},
      violationDistribution: payload.violationDistribution || {},
      chartData: payload.chartData || [],
      recentViolations: payload.recentViolations || [],
    };
  },
};

export default analyticsService;
