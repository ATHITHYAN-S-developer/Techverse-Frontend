import { test, expect } from "@playwright/test";
import {
  FOOTER_QUICK_LINKS,
  FOOTER_DOMAIN_LINKS,
  footerLinkLocator,
  assertFooterLink,
  assertDestinationPage,
} from "./helpers";

test.describe("Footer", () => {
  test("Quick Links section is present with working navigation links", async ({ page }) => {
    await page.goto("/");

    const footer = page.locator("footer");
    await expect(footer.getByRole("heading", { name: "QUICK LINKS" })).toBeVisible();

    for (const link of FOOTER_QUICK_LINKS) {
      await assertFooterLink(footer, link.label, link.href);
    }
  });

  test("Resource Domains section is present and points to the correct pages", async ({ page }) => {
    await page.goto("/");

    const footer = page.locator("footer");
    await expect(footer.getByRole("heading", { name: "RESOURCE DOMAINS" })).toBeVisible();

    for (const domain of FOOTER_DOMAIN_LINKS) {
      await assertFooterLink(footer, domain.label, domain.href);
    }
  });

  test("Connect section shows contact details and the external college website link", async ({
    page,
  }) => {
    await page.goto("/");

    const footer = page.locator("footer");
    await expect(footer.getByRole("heading", { name: "CONNECT" })).toBeVisible();

    await expect(footer.getByText(/Thindal, Erode, Tamil Nadu/)).toBeVisible();
    await expect(footer.getByText("+91 424 2244201")).toBeVisible();

    const email = footer.getByRole("link", { name: "principal@velalarengg.ac.in" });
    await expect(email).toHaveAttribute("href", "mailto:principal@velalarengg.ac.in");

    const website = footer.getByRole("link", { name: /VCET Official Website/ });
    await expect(website).toBeVisible();
    await expect(website).toHaveAttribute("href", "https://www.velalarengg.ac.in/");
    await expect(website).toHaveAttribute("target", "_blank");

    await expect(footer.getByText(/© 2026 TechVerse/)).toBeVisible();
  });

  test("each footer navigation link actually loads its destination page", async ({ page }) => {
    await page.goto("/");

    for (const link of FOOTER_QUICK_LINKS) {
      await page.goto("/");
      await footerLinkLocator(page.locator("footer"), link.label).click();
      await assertDestinationPage(page, link.href);
    }
  });
});