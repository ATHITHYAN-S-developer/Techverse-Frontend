/**
 * Visitor Counter Service for VCET Tech Hub (TechVerse)
 * Synchronized with live MongoDB Backend REST API (/api/visitors/increment & /api/visitors/count)
 * Atomic increment on every page load/refresh with React StrictMode protection.
 */

import { incrementVisitor as apiIncrementVisitor, getVisitorCount as apiGetVisitorCount } from "./api";

const LOCAL_STORAGE_KEY = "vcet_tech_hub_visitor_count";

// In-memory single-flight promise to prevent React StrictMode duplicate execution during the same page load
let activeIncrementPromise = null;

/**
 * Increment the visitor counter on actual page load / refresh
 * React StrictMode will reuse the in-flight/resolved promise during the same page load.
 * On browser reload / F5, memory resets and triggers a new increment.
 */
export async function recordAndGetVisitorCount(onUpdate) {
  // 1. Instantly provide cached count if available so UI doesn't flicker
  let cachedCount = null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw && !isNaN(Number(raw))) {
      cachedCount = Number(raw);
      onUpdate?.({ count: cachedCount, isLive: true });
    }
  } catch (e) {}

  // 2. Reuse in-memory promise for this page load (prevents React 18/19 StrictMode double count)
  if (!activeIncrementPromise) {
    activeIncrementPromise = (async () => {
      try {
        const responseData = await apiIncrementVisitor();
        const totalVisits = responseData?.data?.totalVisits ?? responseData?.totalVisits;

        if (typeof totalVisits === "number") {
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, String(totalVisits));
          } catch (e) {}
          return { count: totalVisits, isLive: true };
        }
      } catch (err) {
        console.debug("[Visitor Service] Could not increment count:", err.message);
        throw err;
      }
    })();
  }

  try {
    const result = await activeIncrementPromise;
    if (result && typeof result.count === "number") {
      onUpdate?.(result);
      return result;
    }
  } catch (err) {
    // If increment fails, try getting current count without incrementing
    try {
      const countData = await apiGetVisitorCount();
      const totalVisits = countData?.data?.totalVisits ?? countData?.totalVisits;
      if (typeof totalVisits === "number") {
        const fallbackResult = { count: totalVisits, isLive: true };
        onUpdate?.(fallbackResult);
        return fallbackResult;
      }
    } catch (countErr) {
      console.debug("[Visitor Service] Fallback get count failed:", countErr.message);
    }
  }

  // If server is completely unreachable, return null or cached count
  const finalResult = {
    count: cachedCount,
    isLive: false,
    error: true,
  };
  onUpdate?.(finalResult);
  return finalResult;
}

export { apiIncrementVisitor as incrementVisitor, apiGetVisitorCount as getVisitorCount };
