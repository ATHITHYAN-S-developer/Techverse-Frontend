import { test, expect } from "@playwright/test";
import { FOOTER_QUICK_LINKS, footerLinkLocator } from "./helpers";

const CTA_BUTTONS = [
  "Explore Tech Explorer",
  "Explore Tech Pulse",
  "Explore Tech Vision",
  "Explore Skill Forge",
];

const FOOTER_SECTIONS = ["QUICK LINKS", "RESOURCE DOMAINS", "CONNECT"];

async function viewportWidth(page) {
  return (await page.viewportSize()).width;
}

test.describe("Responsive layout", () => {
  test("page has no horizontal overflow at this viewport", async ({ page }) => {
    await page.goto("/");

    const widths = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));

    // Allow 1px of tolerance for subpixel rendering.
    expect(widths.scrollWidth).toBeLessThanOrEqual(widths.clientWidth + 1);
  });

  test("hero title fits within the viewport", async ({ page }) => {
    await page.goto("/");

    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();

    const width = await viewportWidth(page);
    const box = await heading.boundingBox();

    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
  });

  test("all CTA buttons are visible and clickable at this viewport", async ({ page }) => {
    await page.goto("/");

    for (const label of CTA_BUTTONS) {
      const button = page.getByRole("button", { name: label });
      await button.scrollIntoViewIfNeeded();
      await expect(button).toBeVisible();
      await expect(button).toBeEnabled();
    }
  });

  test("footer navigation columns are all usable at this viewport", async ({ page }) => {
    await page.goto("/");

    const footer = page.locator("footer");
    for (const section of FOOTER_SECTIONS) {
      await expect(footer.getByRole("heading", { name: section })).toBeVisible();
    }

    for (const link of FOOTER_QUICK_LINKS) {
      await expect(footerLinkLocator(footer, link.label)).toBeVisible();
    }
  });

  test("domain sections scroll into view and stay within the viewport width", async ({ page }) => {
    await page.goto("/");

    const width = await viewportWidth(page);
    const sectionIds = [
      "section-technology",
      "section-updates",
      "section-youtube",
      "section-aptitude",
    ];

    for (const sectionId of sectionIds) {
      const section = page.locator(`#${sectionId}`);
      await section.scrollIntoViewIfNeeded();
      await expect(section).toBeInViewport();

      const box = await section.boundingBox();
      expect(box.width).toBeLessThanOrEqual(width + 1);
      expect(box.x).toBeGreaterThanOrEqual(-1);
    }
  });
});