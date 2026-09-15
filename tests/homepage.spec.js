import { test, expect } from "@playwright/test";

const CTA_BUTTONS = [
  { label: "Explore Tech Explorer", path: "/technology", marker: "Google AI Studio" },
  { label: "Explore Tech Pulse", path: "/updates", marker: "daily.dev" },
  { label: "Explore Tech Vision", path: "/youtube", marker: "Matt Wolfe" },
  { label: "Explore Skill Forge", path: "/aptitude", marker: "IndiaBIX" },
];

const DOMAIN_SECTIONS = [
  "section-technology",
  "section-updates",
  "section-youtube",
  "section-aptitude",
];

test.describe("Homepage", () => {
  test("loads successfully and renders the TechVerse hero section with the correct title", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/TechVerse/);

    const heroHeading = page.getByRole("heading", { level: 1 });
    await expect(heroHeading).toBeVisible();
    await expect(heroHeading).toContainText("Tech");
    await expect(heroHeading).toContainText("Verse");

    await expect(page.getByText("AN INITIATIVE OF")).toBeVisible();

    const empowerLogo = page.getByAltText(
      "Velalar College of Engineering and Technology - Empowering the Next Generation"
    );
    await expect(empowerLogo).toBeVisible();
  });

  test("all four CTA buttons are visible and clickable and navigate to the right pages", async ({
    page,
  }) => {
    await page.goto("/");

    for (const cta of CTA_BUTTONS) {
      const button = page.getByRole("button", { name: cta.label });
      await button.scrollIntoViewIfNeeded();
      await expect(button).toBeVisible();
      await expect(button).toBeEnabled();
      await button.click();

      await expect(page).toHaveURL(new RegExp(`${cta.path}$`));
      await expect(page.getByText(cta.marker).first()).toBeVisible();

      await page.goto("/");
    }
  });

  test("scrolls to each domain section on the homepage", async ({ page }) => {
    await page.goto("/");

    for (const sectionId of DOMAIN_SECTIONS) {
      const section = page.locator(`#${sectionId}`);
      await expect(section).toHaveCount(1);
      await section.scrollIntoViewIfNeeded();
      await expect(section).toBeInViewport();
    }
  });
});