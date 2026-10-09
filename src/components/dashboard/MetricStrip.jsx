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
      className="grid grid-cols-3 gap-2.5 sm:gap-4 my-6 sm:my-8"
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
        className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3 sm:p-5 shadow-xs transition-all duration-300 hover:shadow-md hover:border-blue-300 ${
          isLink ? "cursor-pointer" : ""
        }`}
      >
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
            {metric.label}
          </span>
          <span className="p-1 sm:p-1.5 rounded-lg bg-slate-50 text-slate-600 group-hover:scale-110 transition-transform shrink-0">
            <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${metric.accent} ${metric.fill}`} />
          </span>
        </div>

        <div className="mt-1.5 sm:mt-3">
          <p className="font-sans text-xl sm:text-3xl font-black tabular-nums text-slate-900">
            {value === null ? (
              <span className="text-slate-300">{"\u2014"}</span>
            ) : (
              <Counter
                target={value}
                startDelay={index * 90}
                reduceMotion={reduceMotion}
                inView={inView}
              />
            )}
          </p>

          <p className="text-[10px] sm:text-xs text-slate-400 font-medium truncate mt-0.5">
            {value === null ? "loading" : metric.unit(value)}
            {metric.showView && (
              <span className="text-blue-600 ml-1 font-bold group-hover:underline">
                →
              </span>
            )}
          </p>
        </div>
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
