import { expect } from "@playwright/test";

const FOOTER_QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Tech Explorer", href: "/technology" },
  { label: "Tech Pulse", href: "/updates" },
  { label: "Tech Vision", href: "/youtube" },
  { label: "Skill Forge", href: "/aptitude" },
];

const FOOTER_DOMAIN_LINKS = [
  { label: "Tech Explorer (Websites)", href: "/technology" },
  { label: "Tech Pulse (App Updates)", href: "/updates" },
  { label: "Tech Vision (YouTube)", href: "/youtube" },
  { label: "Skill Forge (Aptitude)", href: "/aptitude" },
];

const PAGE_MARKERS = {
  "/": null,
  "/technology": "Google AI Studio",
  "/updates": "daily.dev",
  "/youtube": "Matt Wolfe",
  "/aptitude": "IndiaBIX",
};

export { FOOTER_QUICK_LINKS, FOOTER_DOMAIN_LINKS, PAGE_MARKERS };

/**
 * Footer Quick Links and Resource Domains each render as
 * `<a><span aria-hidden="false">→</span><span>{label}</span></a>`.
 * The arrow makes the accessible name something like "→ Home", so
 * `getByRole("link", { name: ..., exact: true })` can't match. Instead we
 * resolve the leaf span (exact text) and climb to its parent anchor.
 */
export function footerLinkLocator(footer, label) {
  return footer.getByText(label, { exact: true }).locator("..");
}

export async function assertFooterLink(footer, label, href) {
  const link = footerLinkLocator(footer, label);
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute("href", href);
  return link;
}

export async function assertDestinationPage(page, href) {
  await expect(page).toHaveURL(new RegExp(`${href}$`));

  const marker = PAGE_MARKERS[href];
  if (marker) {
    await expect(page.getByText(marker).first()).toBeVisible();
  } else {
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
}