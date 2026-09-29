import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Clock, Sparkles, ArrowUpRight, FileQuestion } from "lucide-react";
import { EASE_OUT, fadeUp } from "./motion";

export default function DailyTestWidget({ test, loading }) {
  const reduceMotion = useReducedMotion();

  const questionCount =
    test?.questions?.length || test?.totalQuestions || test?.questionsCount;
  const reward = test?.pointsReward || 10;
  const testId = test?._id || test?.id;

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.15 }}
      className="group relative overflow-hidden border border-profile-rule bg-white"
    >
      {/* Gold wash that strengthens on hover, so the card reads as the primary
          action in the sidebar. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-profile-main/15 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />

      <div className="relative p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-profile-main">
            <motion.span
              animate={reduceMotion ? undefined : { rotate: [0, 12, -8, 0], scale: [1, 1.12, 1] }}
              transition={{ duration: 3.2, repeat: Infinity, repeatDelay: 3.5, ease: "easeInOut" }}
              className="inline-flex"
            >
              <Sparkles className="h-3.5 w-3.5" />
            </motion.span>
            Daily Practice Test
          </span>
          <span className="rounded-full bg-profile-main/10 px-2.5 py-0.5 text-[10px] font-semibold text-profile-main">
            +{reward} pts
          </span>
        </div>

        {loading ? (
          <div className="mt-5 space-y-2.5">
            <div className="h-3.5 w-3/4 rounded bg-profile-ink/8" />
            <div className="h-3 w-full rounded bg-profile-ink/8" />
            <div className="h-3 w-2/3 rounded bg-profile-ink/8" />
          </div>
        ) : test ? (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ staggerChildren: 0.08, delayChildren: 0.1 }}>
            <h3 className="mt-5 font-serif text-base font-semibold leading-snug text-profile-ink">
              {test.title}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-profile-ink/50">
              {test.description ||
                "Daily skill assessment to sharpen your quantitative and technical skills."}
            </p>

            <dl className="mt-5 flex items-center gap-5 border-y border-profile-rule py-3 text-xs text-profile-ink/55">
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">Duration</dt>
                <Clock className="h-3.5 w-3.5" />
                <dd>{test.durationMinutes || 10} min</dd>
              </div>
              <div>
                <dt className="sr-only">Questions</dt>
                <dd>{questionCount || 10} questions</dd>
              </div>
            </dl>

            <Link
              to={`/tests/${testId}`}
              className="group/btn relative mt-5 flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-profile-main py-2.5 text-xs font-semibold text-white transition-colors hover:bg-profile-hover"
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full"
              />
              <span className="relative">Start assessment</span>
              <ArrowUpRight className="relative h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
            </Link>
          </motion.div>
        ) : (
          <div className="py-8 text-center">
            <FileQuestion className="mx-auto h-7 w-7 text-profile-ink/20" />
            <p className="mt-3 text-xs text-profile-ink/50">
              No test is scheduled right now. Browse the full test series instead.
            </p>
            <Link
              to="/tests"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-profile-ink hover:underline"
            >
              View all tests
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </div>
    </motion.section>
  );
}
