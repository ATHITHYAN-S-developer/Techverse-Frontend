import { useEffect, useRef, useState } from "react";

/**
 * Shared motion language for the student dashboard.
 *
 * Everything here is deliberately declarative so the same entrance plays on
 * every card. The house easing is the one already used by the hero treatments
 * in AnnouncementsPage and PlacementEventsPage: a fast-out, slow-in curve that
 * lands softly instead of snapping.
 */

export const EASE_OUT = [0.16, 1, 0.3, 1];
export const EASE_SOFT = [0.22, 1, 0.36, 1];

/** Parent wrapper: release children one after another. */
export const staggerParent = (stagger = 0.06, delayChildren = 0) => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

/** Standard card/row entrance. */
export const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE_OUT },
  },
};

/** Same travel, but from the side the element enters from. */
export const fadeInLeft = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

export const fadeInRight = {
  hidden: { opacity: 0, x: 16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

/** Slight scale for badges and pills. */
export const popIn = {
  hidden: { opacity: 0, scale: 0.86 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: EASE_OUT } },
};

/**
 * Count a number up on mount. Returns a plain number so the caller can keep
 * using `tabular-nums` text rather than a motion component.
 *
 * Uses rAF rather than framer so the value stays a string-formattable number,
 * and bails out to the final value immediately when the visitor has asked for
 * reduced motion.
 */
export function useCountUp(target, { duration = 1100, startDelay = 0 } = {}) {
  const [value, setValue] = useState(0);
  const frame = useRef(0);

  useEffect(() => {
    const to = Number(target) || 0;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(to);
      return undefined;
    }

    let startTime = null;
    const waitUntil = startDelay;

    const step = (timestamp) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime - waitUntil;

      if (elapsed < 0) {
        frame.current = requestAnimationFrame(step);
        return;
      }

      const t = Math.min(1, elapsed / duration);
      // easeOutExpo: fast start, long settle.
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setValue(Math.round(to * eased));

      if (t < 1) frame.current = requestAnimationFrame(step);
    };

    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration, startDelay]);

  return value;
}

/**
 * True once the element has scrolled into view. Used so a value only counts up
 * when the student can actually see it.
 */
export function useInViewOnce(options = { threshold: 0.35 }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || inView) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, options);

    observer.observe(node);
    return () => observer.disconnect();
  }, [inView, options]);

  return [ref, inView];
}
