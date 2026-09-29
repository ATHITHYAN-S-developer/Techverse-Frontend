import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Target, ArrowUpRight } from "lucide-react";
import { EASE_OUT } from "./motion";

export default function PrepZoneBand() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, ease: EASE_OUT }}
    >
      <Link
        to="/prepzone"
        className="group relative flex flex-col gap-4 overflow-hidden border border-profile-rule bg-profile-paper px-6 py-5 transition-colors hover:border-profile-main/40 sm:flex-row sm:items-center sm:justify-between"
      >
        {/* Gold wash blooms in from the left on hover. */}
        <span
          aria-hidden="true"
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-profile-main/15 via-profile-main/15 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-0"
        />

        <div className="relative flex items-center gap-4">
          <motion.span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-profile-main/12 text-profile-main"
            whileHover={reduceMotion ? undefined : { scale: 1.12, rotate: 12 }}
            transition={{ type: "spring", stiffness: 380, damping: 13 }}
          >
            <Target className="h-4.5 w-4.5" />
          </motion.span>
          <div>
            <h3 className="font-serif text-sm font-semibold text-profile-ink">
              PrepZone &amp; Recruitment Bootcamp
            </h3>
            <p className="mt-1 text-xs text-profile-ink/50">
              Company exam patterns, C coding patterns, and mock interviews.
            </p>
          </div>
        </div>

        <span className="relative inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-profile-main">
          Open PrepZone
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </Link>
    </motion.div>
  );
}
