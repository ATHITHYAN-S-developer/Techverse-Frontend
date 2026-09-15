import { test, expect } from "@playwright/test";

const MEDIA_EXT_PATTERN =
  /\.(png|jpe?g|gif|svg|webp|avif|ico|mp4|mp3|ogg|ogv|webm|mov)(\?|#|$)/i;

function isMediaRequest(url, headers = {}) {
  const contentType = (headers["content-type"] || "").toLowerCase();
  if (
    contentType.startsWith("image/") ||
    contentType.startsWith("video/") ||
    contentType.startsWith("audio/")
  ) {
    return true;
  }
  return MEDIA_EXT_PATTERN.test(url);
}

function trackBrokenMedia(page) {
  const broken = [];

  const onRequestFailed = (request) => {
    const url = request.url();
    let headers = {};
    try {
      headers = request.headers() || {};
    } catch {
      headers = {};
    }
    if (isMediaRequest(url, headers)) {
      broken.push({
        url,
        kind: "request failed",
        detail: request.failure()?.errorText ?? "unknown error",
      });
    }
  };

  const onResponse = (response) => {
    if (response.status() >= 400 && isMediaRequest(response.url(), response.headers())) {
      broken.push({ url: response.url(), kind: `HTTP ${response.status()}` });
    }
  };

  page.on("requestfailed", onRequestFailed);
  page.on("response", onResponse);

  return () => {
    page.off("requestfailed", onRequestFailed);
    page.off("response", onResponse);
    return broken;
  };
}

async function listBrokenImages(page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll("img"))
      .filter((img) => img.complete && img.naturalWidth === 0)
      .map((img) => img.src)
  );
}

/**
 * Waits until every <img> has finished loading or errored (img.complete is
 * true in both cases), so equality checks below are not subject to timing races.
 * A genuinely missing image errors -> complete && naturalWidth === 0 -> caught.
 */
async function waitForAllImages(page) {
  await page.waitForFunction(
    () => Array.from(document.querySelectorAll("img")).every((img) => img.complete),
    null,
    { timeout: 15_000 }
  );
}

const SUBPAGES = [
  { path: "/technology", marker: "Google AI Studio" },
  { path: "/updates", marker: "daily.dev" },
  { path: "/youtube", marker: "Matt Wolfe" },
  { path: "/aptitude", marker: "IndiaBIX" },
];

test.describe("Media assets", () => {
  test("homepage images and background media load without 404 or failed requests", async ({
    page,
  }) => {
    const stopTracking = trackBrokenMedia(page);

    await page.goto("/");

    // Let the hero campus slideshow cycle so follow-up background images load too.
    await page.waitForTimeout(7500);

    // Scroll through the whole page to force all section images to load.
    await page.evaluate(() =>
      window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" })
    );
    await waitForAllImages(page);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));

    const brokenImages = await listBrokenImages(page);
    const brokenMedia = stopTracking();

    expect(brokenImages).toEqual([]);
    expect(brokenMedia).toEqual([]);
  });

  for (const subpage of SUBPAGES) {
    test(`${subpage.path} page images load without 404 or failed requests`, async ({ page }) => {
      const stopTracking = trackBrokenMedia(page);

      await page.goto(subpage.path);
      await expect(page.getByText(subpage.marker).first()).toBeVisible();
      await waitForAllImages(page);

      const brokenImages = await listBrokenImages(page);
      const brokenMedia = stopTracking();

      expect(brokenImages).toEqual([]);
      expect(brokenMedia).toEqual([]);
    });
  }

  test("hero campus background images are served (no broken slideshow)", async ({ page }) => {
    const stopTracking = trackBrokenMedia(page);

    await page.goto("/");
    await page.waitForTimeout(7500);
    const brokenMedia = stopTracking();

    expect(brokenMedia).toEqual([]);
  });

  test("public background video asset is served without 404", async ({ request }) => {
    const response = await request.fetch("/home-banner-video.mp4", {
      method: "HEAD",
    });

    expect([200, 206]).toContain(response.status());
  });
});