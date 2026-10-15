/**
 * Client-side browser identification used to gate unsupported browsers
 * out of proctored assessments (the rest of the site keeps working there).
 */

export async function isBraveBrowser() {
  if (typeof navigator === "undefined") return false;

  // Brave exposes navigator.brave.isBrave() — resolves true only in Brave.
  try {
    if (navigator.brave && typeof navigator.brave.isBrave === "function") {
      if (await navigator.brave.isBrave()) return true;
    }
  } catch {
    /* fall through to heuristics */
  }

  // User-Agent Client Hints brands list (Chromium-based browsers).
  try {
    const brands = navigator.userAgentData?.brands || [];
    if (
      brands.some((b) => String(b.brand || "").toLowerCase().includes("brave"))
    ) {
      return true;
    }
  } catch {
    /* ignore */
  }

  // Legacy user-agent string fallback.
  return /brave/i.test(navigator.userAgent || "");
}
