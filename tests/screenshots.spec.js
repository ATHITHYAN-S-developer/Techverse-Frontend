import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const SCREENSHOT_DIR = path.join(process.cwd(), "screenshots");

function screenshotPath(projectName, label) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  return path.join(SCREENSHOT_DIR, `${projectName}-${label}.png`);
}

test.describe("Screenshots", () => {
  test("capture the homepage at the current viewport", async ({ page }, testInfo) => {
    const project = testInfo.project.name;

    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await page.screenshot({ path: screenshotPath(project, "home"), fullPage: true });
  });

  test("capture a subpage at the current viewport", async ({ page }, testInfo) => {
    const project = testInfo.project.name;

    await page.goto("/updates");
    await expect(page.getByText("daily.dev").first()).toBeVisible();

    await page.screenshot({ path: screenshotPath(project, "updates"), fullPage: true });
  });
});