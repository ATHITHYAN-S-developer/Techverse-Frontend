import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Flame, BookOpen, Award } from "lucide-react";
import { fadeUp, staggerParent, useCountUp, useInViewOnce } from "./motion";

const METRICS = [
  {
    key: "streak",
    label: "Current Streak",
    icon: Flame,
    to: null,
    showView: false,
    accent: "text-profile-main",
    fill: "fill-profile-main",
    unit: (n) => (n === 1 ? "day" : "days"),
  },
  {
    key: "courses",
    label: "Active Courses",
    icon: BookOpen,
    to: "/courses",
    showView: true,
    accent: "text-profile-ink",
    fill: "",
    unit: () => "in progress",
  },
  {
    key: "certificates",
    label: "Certificates",
    icon: Award,
    to: "/certificates",
    showView: true,
    accent: "text-emerald-600",
    fill: "",
    unit: () => "earned",
  },
];

/**
 * Three metrics as one divided row separated by hairline rules. Values read
 * from the authenticated student's streak plus fetched course/certificate counts.
 *
 * Values roll up when the strip scrolls into view rather than on mount, so a
 * student who lands mid-page does not watch numbers count past off-screen.
 */
export default function MetricStrip({
  streak,
  activeCourses,
  certificatesCount,
  loading,
  gamificationLoading,
}) {
  const reduceMotion = useReducedMotion();
  const [ref, inView] = useInViewOnce();

  const streakPending = gamificationLoading ?? loading;

  // `null` means "still loading" and renders an em dash rather than a fake 0.
  const targets = {
    streak: streakPending ? null : (streak?.currentStreak ?? 0),
    courses: loading ? null : activeCourses,
    certificates: loading ? null : certificatesCount,
  };

  return (
    <motion.section
      ref={ref}
      aria-label="Key metrics"
      className="grid grid-cols-1 border-t border-b border-profile-rule sm:grid-cols-3"
      variants={staggerParent(0.07)}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      {METRICS.map((metric, index) => (
        <MetricCell
          key={metric.key}
          metric={metric}
          value={targets[metric.key]}
          index={index}
          reduceMotion={reduceMotion}
          inView={inView}
        />
      ))}
    </motion.section>
  );
}

function MetricCell({ metric, value, index, reduceMotion, inView }) {
  const Icon = metric.icon;
  const isLink = Boolean(metric.to);
  const Container = isLink ? Link : "div";

  return (
    <motion.div variants={fadeUp}>
      <Container
        {...(isLink ? { to: metric.to } : {})}
        className={`group relative block overflow-hidden px-5 py-6 transition-colors duration-300 ${
          isLink ? "hover:bg-profile-alt cursor-pointer" : ""
        } ${
          index > 0 ? "border-t border-profile-rule sm:border-t-0 sm:border-l" : ""
        } ${index > 0 ? "sm:border-profile-rule" : ""}`}
      >
        {/* Accent rail that wipes across on hover for actionable links */}
        {isLink && (
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-profile-main to-profile-hover transition-transform duration-500 ease-out group-hover:scale-x-100"
          />
        )}

        <div className="flex items-center gap-1.5">
          <motion.span
            className="inline-flex"
            whileHover={reduceMotion ? undefined : { scale: 1.2, rotate: -7 }}
            transition={{ type: "spring", stiffness: 400, damping: 14 }}
          >
            <Icon className={`h-3.5 w-3.5 ${metric.accent} ${metric.fill}`} />
          </motion.span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-profile-ink/45">
            {metric.label}
          </span>
        </div>

        <p className="mt-2.5 font-serif text-3xl font-semibold tabular-nums text-profile-ink">
          {value === null ? (
            <span className="text-profile-ink/25">{"\u2014"}</span>
          ) : (
            <Counter
              target={value}
              startDelay={index * 90}
              reduceMotion={reduceMotion}
              inView={inView}
            />
          )}
        </p>

        <p className="mt-0.5 text-[11px] text-profile-ink/40">
          {value === null ? "loading" : metric.unit(value)}
          {metric.showView && (
            <>
              {" \u00b7 "}
              <span className="text-profile-ink transition-colors group-hover:text-profile-main">
                view
              </span>
            </>
          )}
        </p>
      </Container>
    </motion.div>
  );
}

/** Rolls 0 -> target once the strip is visible. */
function Counter({ target, startDelay, reduceMotion, inView }) {
  const animated = useCountUp(inView ? target : 0, { duration: 1000, startDelay });

  if (!inView) return 0;
  return reduceMotion ? target : animated;
}

export { METRICS };
