import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Flame, PlayCircle, Sparkles } from "lucide-react";
import { greetingForNow } from "./useDashboardData";
import { EASE_OUT, EASE_SOFT, fadeUp, staggerParent } from "./motion";

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

/** "2" -> "II Year". The roster stores year as a number, so it must be mapped. */
function yearLabel(year) {
  const n = Number(year);
  if (!Number.isFinite(n) || n < 1) return null;
  return `${ROMAN[n] || n} Year`;
}

/**
 * Reads the branch and year from the roster fields the API actually sends
 * (`courseName` / `courseCode` / `year`). The old copy read `user.department`
 * and `user.year`, neither of which exists on a student, so every student saw
 * "Department of Computer Science & Engineering · 2".
 */
function studentIdentity(user) {
  const branch = user?.courseName || user?.departmentName || null;
  const code = user?.courseCode || null;
  const year = yearLabel(user?.year);
  const section = user?.section ? `Sec ${user.section}` : null;

  return [branch, year, section].filter(Boolean).join(" · ") || "VCET Student";
}

export default function WelcomeHero({ user, streak }) {
  const reduceMotion = useReducedMotion();

  const studentName = (user?.name || "").trim().replace(/\s+/g, " ") || "Student";
  const currentStreak = streak?.currentStreak || 0;
  const longest = streak?.longestStreak || 0;

  const identity = studentIdentity(user);
  const hasStreak = currentStreak > 0;

  return (
    <section className="relative isolate overflow-hidden bg-profile-main">
      {/* Base gradient wash */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(115deg,#003B66_0%,#005391_38%,#0062A9_72%,#1B79C1_100%)]"
      />

      {/* Slow-drifting colour orbs. Blur + mix-blend keeps them reading as light,
          not as shapes. */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-24 -top-28 h-[26rem] w-[26rem] rounded-full bg-profile-main/20 blur-[100px]"
          animate={reduceMotion ? undefined : { x: [0, 40, 0], y: [0, 30, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-20 top-10 h-[22rem] w-[22rem] rounded-full bg-profile-main/25 blur-[90px]"
          animate={reduceMotion ? undefined : { x: [0, -50, 0], y: [0, 40, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        />
        <motion.div
          className="absolute bottom-[-8rem] left-1/3 h-[20rem] w-[20rem] rounded-full bg-white/10 blur-[90px]"
          animate={reduceMotion ? undefined : { x: [0, 30, 0], y: [0, -30, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        />
      </div>

      {/* Faint engineering grid, fading out toward the edges. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]"
      />

      <div className="relative mx-auto max-w-6xl px-6 py-11 sm:px-8 sm:py-14">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <motion.div
            className="max-w-2xl"
            variants={staggerParent(0.09, 0.05)}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp} className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-profile-paper/80 backdrop-blur-sm">
                <Sparkles className="h-3 w-3" />
                {identity}
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="mt-5 font-serif text-[2.1rem] sm:text-[2.85rem] font-bold leading-[1.15] tracking-tight text-white"
            >
              {greetingForNow()},{" "}
              <motion.span
                variants={fadeUp}
                className="block sm:inline font-extrabold text-white tracking-normal drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]"
              >
                {studentName}
              </motion.span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-4 max-w-lg text-sm leading-relaxed text-profile-paper/80"
            >
              {hasStreak ? (
                <>
                  You are on a{" "}
                  <span className="font-semibold text-white tabular-nums">
                    {currentStreak}-day learning streak
                  </span>
                  {longest > currentStreak && (
                    <span className="text-profile-paper/45"> (personal best {longest})</span>
                  )}
                  . One activity today keeps it alive.
                </>
              ) : (
                "Complete a module quiz or coding challenge today to start a learning streak."
              )}
            </motion.p>

            <motion.div variants={fadeUp} className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/courses"
                className="group inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:border-white/50 hover:bg-white/10"
              >
                <PlayCircle className="h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110" />
                Browse catalog
              </Link>
            </motion.div>
          </motion.div>

          {/* Streak dial. Reads as a real gauge rather than a number in a box. */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.25 }}
            className="flex shrink-0 items-center gap-5 self-start rounded-2xl border border-white/15 bg-white/[0.07] p-5 backdrop-blur-md lg:self-auto"
          >
            <StreakDial value={currentStreak} reduceMotion={reduceMotion} />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-profile-paper/70">
                Streak
              </p>
              <p className="mt-1 font-serif text-2xl font-semibold tabular-nums text-white">
                {hasStreak ? `${currentStreak} days` : "Not started"}
              </p>
              <p className="mt-1 text-[11px] text-profile-paper/50">
                {hasStreak
                  ? "Keep it alive with one activity today"
                  : "One test or module starts it"}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Hairline that ties the hero to the metric strip below it. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
      />
    </section>
  );
}

/**
 * Ring gauge for the streak. Sweeps to `min(value / 30, 1)` so the dial stays
 * meaningful past a month instead of pinning at full.
 */
function StreakDial({ value, reduceMotion }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const fraction = Math.min(1, value / 30);
  const offset = circumference * (1 - fraction);

  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90" aria-hidden="true">
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="5"
        />
        <motion.circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="url(#streakGradient)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={reduceMotion ? false : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: EASE_SOFT, delay: 0.35 }}
        />
        <defs>
          <linearGradient id="streakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7FC0F0" />
            <stop offset="100%" stopColor="#2E8BD6" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute inset-0 grid place-items-center">
        <Flame
          className={`h-5 w-5 ${value > 0 ? "fill-profile-main text-profile-main" : "text-white/25"}`}
        />
      </div>
    </div>
  );
}
