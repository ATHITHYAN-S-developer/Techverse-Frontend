import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Megaphone } from "lucide-react";
import SectionHeading from "./SectionHeading";
import { fadeUp, staggerParent } from "./motion";

export default function CircularsWidget({ announcements, loading }) {
  const reduceMotion = useReducedMotion();

  return (
    <section>
      <SectionHeading
        aside={
          <Link
            to="/announcements"
            className="text-xs font-medium text-profile-ink/50 transition-colors hover:text-profile-main"
          >
            View all
          </Link>
        }
      >
        Latest Circulars
      </SectionHeading>

      {loading ? (
        <div className="space-y-3 border-t border-profile-rule pt-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-2 w-16 rounded bg-profile-ink/8" />
              <div className="h-3 w-full rounded bg-profile-ink/8" />
            </div>
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-center shadow-xs mt-3">
          <div className="mx-auto w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
            <Megaphone className="h-5 w-5" />
          </div>
          <p className="mt-2 text-xs font-bold text-slate-700">No active circulars</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Department circulars and schedules will appear here.</p>
        </div>
      ) : (
        <motion.ul
          className="divide-y divide-profile-rule border-t border-profile-rule"
          variants={staggerParent(0.06, 0.1)}
          initial="hidden"
          animate="visible"
        >
          {announcements.map((item) => {
            const id = item._id || item.id;
            // The Announcement model exposes publishDate and createdAt, not date.
            const raw = item.publishDate || item.createdAt;
            const date = raw
              ? new Date(raw).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
              : "";

            return (
              <motion.li key={id} variants={fadeUp} className="group relative py-4 first:pt-4">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-profile-ink">
                    {item.category || "Notice"}
                  </span>
                  {date && (
                    <time className="text-[10px] tabular-nums text-profile-ink/35">{date}</time>
                  )}
                </div>
                <Link
                  to={`/announcements/${id}`}
                  className="mt-1.5 block text-xs font-medium leading-relaxed text-profile-ink transition-colors before:absolute before:inset-0 group-hover:text-profile-main"
                >
                  {item.title}
                </Link>
              </motion.li>
            );
          })}
        </motion.ul>
      )}
    </section>
  );
}
