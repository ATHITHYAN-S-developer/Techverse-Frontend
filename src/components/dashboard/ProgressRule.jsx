import React, { useEffect, useRef } from "react";

/**
 * Thin progress rule for the dashboard's course rows. Centralised here so the
 * bar's height, radius, fill colour and animation stay identical across rows.
 *
 * The fill grows from 0 once the value is known, so arriving data does not
 * simply pop to its final width. `delay` staggers it when several rules render
 * in the same list.
 */
export default function ProgressRule({
  value = 0,
  className = "",
  delay = 0,
  reduceMotion = false,
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value || 0)));
  const fillRef = useRef(null);

  useEffect(() => {
    const node = fillRef.current;
    if (!node || reduceMotion) return undefined;

    // Commit 0 first so the browser has a start width to transition from, then
    // release the real value on the next frame.
    node.style.width = "0%";
    const frame = requestAnimationFrame(() => {
      node.style.width = `${pct}%`;
    });

    return () => cancelAnimationFrame(frame);
  }, [pct, reduceMotion]);

  return (
    <div
      className={`h-[3px] w-full overflow-hidden rounded-full bg-profile-ink/10 ${className}`}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${pct}% complete`}
    >
      <div
        ref={fillRef}
        className={`h-full rounded-full transition-[width] duration-1000 ease-out ${
          pct >= 100 ? "bg-profile-main" : "bg-profile-main/60"
        }`}
        style={{
          width: reduceMotion ? `${pct}%` : "0%",
          transitionDelay: reduceMotion ? "0ms" : `${delay}ms`,
        }}
      />
    </div>
  );
}
