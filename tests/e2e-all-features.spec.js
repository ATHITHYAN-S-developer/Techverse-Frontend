import { test, expect } from "@playwright/test";

test.describe("TechVerse Full E2E & Bug Regression Test Suite", () => {

  // 1. PUBLIC PAGES
  test("Public Homepage & Certificate Verification", async ({ page }) => {
    // Check Homepage
    await page.goto("/");
    await expect(page).toHaveTitle(/TechVerse/i);
    await expect(page.locator("body")).not.toBeEmpty();

    // Verify Certificate Page
    await page.goto("/verify");
    await expect(page.getByText("Verify VCET Credential")).toBeVisible();
    await page.locator('input[placeholder*="Certificate ID"]').fill("VCET-CERT-2026-PY-0091");
    await page.getByRole("button", { name: /verify credential/i }).click();
    await expect(page.getByText("Python Programming Masterclass").first()).toBeVisible({ timeout: 5000 });
  });

  // 2. STUDENT PORTAL (Login, Dashboard, Profile, Certificates)
  test("Student Portal: Login, Dashboard, Tests, and Profile", async ({ page }, testInfo) => {
    // Navigate to Login
    await page.goto("/login");
    await expect(page.getByText("Welcome Back")).toBeVisible();

    // Fill Student Credentials (register number + date of birth, ISO for the date input)
    await page.locator('input[name="studentReg"]').fill("732924CSE001");
    await page.locator('input[name="studentDob"]').fill("2007-09-20");
    await page.locator('button[type="submit"]').click();

    // Verify Redirect to Student Dashboard (BUG #001 Regression Check)
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 8000 });
    await expect(page.getByText("Current Streak")).toBeVisible();
    await expect(page.locator("body")).not.toBeEmpty();

    // The streak figure must be a real number, not a placeholder.
    const metricValue = (label) =>
      page.locator('section[aria-label="Key metrics"] a', { hasText: label }).locator("p").first();

    await expect(metricValue("Current Streak")).toHaveText(/^\d+$/);
    await expect(page.getByText("Total Points", { exact: true })).toHaveCount(0);

    // Daily test routes are no longer part of the product.
    await page.goto("/tests");
    await expect(page).toHaveURL(/\/$/);

    // The leaderboard was removed; the route should no longer exist.
    await page.goto("/leaderboard");
    await expect(page).not.toHaveURL(/.*leaderboard/);

    // Profile now lives on the combined dashboard page.
    await page.goto("/profile");
    await expect(page).toHaveURL(/dashboard#profile$/);
    await expect(page.locator("#profile-email")).toBeEnabled();
    await expect(page.locator("#profile").getByText("Streak", { exact: true })).toBeVisible();
    await expect(page.locator("#profile").getByText("Points", { exact: true })).toHaveCount(0);
    if (testInfo.project.name === "desktop") {
      await expect(
        page.getByRole("navigation").getByRole("link", { name: "Dashboard" })
      ).toBeInViewport();
    }

    // Verify Certificates Page
    await page.goto("/certificates");
    await expect(page.locator("body")).not.toBeEmpty();
  });

  // 3. TEACHER / FACULTY PORTAL
  test("Teacher Portal: Workspace, Resources & Students Directory", async ({ page }) => {
    // Navigate to Login and switch to Faculty tab
    await page.goto("/login");
    await page.getByRole("button", { name: "Teachers" }).click();

    // Fill Faculty Credentials
    await page.locator('input[name="facultyEmail"]').fill("VCET-FAC-CSE-104");
    await page.locator('input[name="facultyPassword"]').fill("faculty123");
    await page.locator('button[type="submit"]').click();

    // Verify Faculty Dashboard
    await expect(page).toHaveURL(/.*faculty/, { timeout: 8000 });
    await expect(page.locator("body")).not.toBeEmpty();

    // Verify Faculty Resources Page (BUG #007 Regression Check)
    await page.goto("/faculty/resources");
    await expect(page.getByText("Department E-Resources Management")).toBeVisible();
    await expect(page.locator("body")).not.toBeEmpty();

    // Verify Faculty Students Directory (BUG #006 Regression Check)
    await page.goto("/faculty/students");
    await expect(page.getByText("Department Student Directory")).toBeVisible();
    await expect(page.locator("body")).not.toBeEmpty();
  });

  // 4. ADMIN CONTROL CENTER
  test("Admin rewards navigation is removed and leaderboard uses streaks", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Admin" }).click();
    await page.locator('input[name="adminUsername"]').fill("admin");
    await page.locator('input[name="adminPassword"]').fill("VcetTech@123");
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/.*admin/, { timeout: 8000 });
    await expect(page.getByRole("link", { name: /points/i })).toHaveCount(0);
    await page.goto("/admin/leaderboard");
    await expect(page.getByText("Current Streak", { exact: true })).toBeVisible();
    await expect(page.getByText("Total Points", { exact: true })).toHaveCount(0);
  });

  test("Admin Portal: Students, Faculty Directory & Certificates", async ({ page }) => {
    // Navigate to Login and switch to Admin tab
    await page.goto("/login");
    await page.getByRole("button", { name: "Admin" }).click();

    // Fill Admin Credentials
    await page.locator('input[name="adminUsername"]').fill("admin");
    await page.locator('input[name="adminPassword"]').fill("VcetTech@123");
    await page.locator('button[type="submit"]').click();

    // Verify Admin Dashboard
    await expect(page).toHaveURL(/.*admin/, { timeout: 8000 });
    await expect(page.locator("body")).not.toBeEmpty();
    await expect(page.getByRole("link", { name: /points/i })).toHaveCount(0);

    await page.goto("/admin/leaderboard");
    await expect(page.getByText("Current Streak", { exact: true })).toBeVisible();
    await expect(page.getByText("Total Points", { exact: true })).toHaveCount(0);

    // Verify Admin Students Page (BUG #002 Regression Check)
    await page.goto("/admin/students");
    await expect(page.locator("body")).not.toBeEmpty();

    // Verify Admin Faculty & Staff Profile (BUG #003 Regression Check)
    await page.goto("/admin/faculty");
    await expect(page.getByText("Faculty & Staff Directory")).toBeVisible();
    await expect(page.locator("body")).not.toBeEmpty();

    // Verify Admin Certificates Page (BUG #009 Regression Check)
    await page.goto("/admin/certificates");
    await expect(page.getByText("Institutional Certificate Registry")).toBeVisible();
    await expect(page.locator("body")).not.toBeEmpty();
  });

  // 5. SECURITY & ROUTE GUARDS
  test("Role Security: Unauthenticated access redirects to /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/.*login/);

    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/.*login/);

    await page.goto("/faculty/dashboard");
    await expect(page).toHaveURL(/.*login/);
  });

});
