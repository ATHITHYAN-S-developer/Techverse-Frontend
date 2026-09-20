import { test, expect } from "@playwright/test";
import {
  FOOTER_QUICK_LINKS,
  footerLinkLocator,
  assertDestinationPage,
} from "./helpers";

test.describe("Navigation", () => {
  for (const link of FOOTER_QUICK_LINKS) {
    test(`Quick Links /${link.label} navigates to the correct destination`, async ({ page }) => {
      await page.goto("/");

      const quickLink = footerLinkLocator(page.locator("footer"), link.label);
      await expect(quickLink).toBeVisible();
      await quickLink.click();

      await assertDestinationPage(page, link.href);
    });
  }

  test("clicking the domain card images navigates to their pages", async ({ page }) => {
    const domains = [
      { sectionId: "section-technology", path: "/technology" },
      { sectionId: "section-updates", path: "/updates" },
      { sectionId: "section-youtube", path: "/youtube" },
      { sectionId: "section-aptitude", path: "/aptitude" },
    ];

    await page.goto("/");

    for (const domain of domains) {
      const section = page.locator(`#${domain.sectionId}`);
      const image = section.locator("img");
      await expect(image.first()).toBeVisible();
      await image.first().scrollIntoViewIfNeeded();
      await image.first().click();

      await expect(page).toHaveURL(new RegExp(`${domain.path}$`));
      await page.goto("/");
    }
  });
});